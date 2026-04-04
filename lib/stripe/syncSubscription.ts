import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getStripe, mapStripeSubscriptionStatus } from "@/lib/stripe/server";

/** Exported for Stripe webhook when linking Payment Link checkouts by email. */
export async function getStripeCheckoutSessionBillingEmail(
  stripe: ReturnType<typeof getStripe>,
  session: Stripe.Checkout.Session
): Promise<string | null> {
  const fromSession =
    (typeof session.customer_email === "string" && session.customer_email.trim()) ||
    (typeof session.customer_details?.email === "string" && session.customer_details.email.trim()) ||
    null;
  if (fromSession) return fromSession;
  const customerRaw = session.customer;
  const customerId =
    typeof customerRaw === "string" ? customerRaw : customerRaw && "id" in customerRaw ? customerRaw.id : null;
  if (!customerId) return null;
  const cust = await stripe.customers.retrieve(customerId);
  if (cust.deleted || !("email" in cust) || !cust.email) return null;
  return cust.email;
}

/**
 * Apply subscription + customer ids from a completed Checkout Session (same data as webhook, but
 * runs on redirect when webhooks are delayed and profile has no stripe_customer_id yet).
 *
 * `userEmail` — when set, allows matching Payment Link / Checkout sessions that have no
 * `client_reference_id` or `metadata.supabase_user_id` but use the same email as the logged-in user.
 */
export async function syncStripeSubscriptionFromCheckoutSession(
  supabaseUserId: string,
  checkoutSessionId: string,
  userEmail?: string | null
): Promise<boolean> {
  if (!checkoutSessionId.startsWith("cs_")) {
    return false;
  }

  const supabase = createClient();
  const admin = createServiceRoleClient();
  const db = admin ?? supabase;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
      expand: ["subscription"],
    });

    const ref = session.client_reference_id;
    const metaUid =
      typeof session.metadata?.supabase_user_id === "string" ? session.metadata.supabase_user_id : null;
    const matchByRef = ref === supabaseUserId || metaUid === supabaseUserId;
    let matchByEmail = false;
    if (!matchByRef && userEmail?.trim()) {
      const billingEmail = await getStripeCheckoutSessionBillingEmail(stripe, session);
      if (
        billingEmail &&
        billingEmail.trim().toLowerCase() === userEmail.trim().toLowerCase()
      ) {
        matchByEmail = true;
      }
    }
    if (!matchByRef && !matchByEmail) {
      console.warn("[stripe/sync] checkout session does not match current user (ref/metadata/email)");
      return false;
    }

    const customerRaw = session.customer;
    const customerId =
      typeof customerRaw === "string" ? customerRaw : customerRaw && "id" in customerRaw ? customerRaw.id : null;

    const subRef = session.subscription;
    if (!customerId || !subRef) {
      return false;
    }

    let sub: Stripe.Subscription;
    if (typeof subRef === "string") {
      sub = await stripe.subscriptions.retrieve(subRef);
    } else {
      sub = subRef;
    }

    const status = mapStripeSubscriptionStatus(sub.status);
    const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
    const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;

    const { error } = await db
      .from("user_profiles")
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        subscription_status: status,
        plan_type: status === "trialing" || status === "active" ? "pro" : "free",
        subscription_trial_end: trialEnd,
        subscription_current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", supabaseUserId);

    if (error) {
      console.error("[stripe/sync] checkout session profile update failed", error.code, error.message);
      return false;
    }

    return status === "trialing" || status === "active";
  } catch (e) {
    console.error("[stripe/sync] checkout session retrieve failed", e);
    return false;
  }
}

/**
 * Pull Stripe subscription for this user and update user_profiles (e.g. after checkout before webhook lands).
 * When `stripe_customer_id` is missing but `userEmail` is set (Payment Link), looks up Stripe customers by email.
 */
export async function syncStripeSubscriptionForUser(
  supabaseUserId: string,
  userEmail?: string | null
): Promise<boolean> {
  const supabase = createClient();
  const admin = createServiceRoleClient();
  const db = admin ?? supabase;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("user_id", supabaseUserId)
    .maybeSingle();

  let stripeCustomerId = profile?.stripe_customer_id?.trim() || null;

  try {
    const stripe = getStripe();

    if (!stripeCustomerId && userEmail?.trim()) {
      const customers = await stripe.customers.list({
        email: userEmail.trim(),
        limit: 10,
      });
      let pickedCustomerId: string | null = null;
      for (const c of customers.data) {
        const subs = await stripe.subscriptions.list({
          customer: c.id,
          status: "all",
          limit: 10,
        });
        if (subs.data.length > 0) {
          pickedCustomerId = c.id;
          break;
        }
      }
      if (!pickedCustomerId && customers.data[0]?.id) {
        pickedCustomerId = customers.data[0].id;
      }
      if (pickedCustomerId) {
        stripeCustomerId = pickedCustomerId;
        await db
          .from("user_profiles")
          .update({
            stripe_customer_id: stripeCustomerId,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", supabaseUserId);
      }
    }

    if (!stripeCustomerId) {
      return false;
    }

    const list = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 10,
    });

    const sub =
      list.data.find((s) => s.status === "trialing" || s.status === "active" || s.status === "past_due") ??
      list.data[0];

    if (!sub) {
      await db
        .from("user_profiles")
        .update({
          subscription_status: "inactive",
          plan_type: "free",
          stripe_subscription_id: null,
          subscription_trial_end: null,
          subscription_current_period_end: null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", supabaseUserId);
      return false;
    }

    const status = mapStripeSubscriptionStatus(sub.status);
    const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
    const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;

    const { error } = await db
      .from("user_profiles")
      .update({
        stripe_subscription_id: sub.id,
        subscription_status: status,
        plan_type: status === "trialing" || status === "active" ? "pro" : "free",
        subscription_trial_end: trialEnd,
        subscription_current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", supabaseUserId);

    if (error) {
      console.error("[stripe/sync] profile update failed", error.code, error.message);
      return false;
    }
    return status === "trialing" || status === "active";
  } catch (e) {
    console.error("[stripe/sync] list subscriptions failed", e);
    return false;
  }
}
