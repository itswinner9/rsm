import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getStripe, mapStripeSubscriptionStatus } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

async function applySubscriptionToProfile(
  supabaseUserId: string,
  sub: Stripe.Subscription,
  stripeCustomerId: string
) {
  const admin = createServiceRoleClient();
  if (!admin) {
    console.error("[stripe/webhook] service role not configured");
    return;
  }

  const status = mapStripeSubscriptionStatus(sub.status);
  const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;

  await admin
    .from("user_profiles")
    .update({
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: sub.id,
      subscription_status: status,
      plan_type: status === "trialing" || status === "active" ? "pro" : "free",
      subscription_trial_end: trialEnd,
      subscription_current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", supabaseUserId);
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const raw = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("[stripe/webhook] verify failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const stripe = getStripe();
  const admin = createServiceRoleClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.supabase_user_id;
        const customerRaw = session.customer;
        const customerId =
          typeof customerRaw === "string" ? customerRaw : customerRaw && "id" in customerRaw ? customerRaw.id : null;
        const subRef = session.subscription;
        const subId = typeof subRef === "string" ? subRef : subRef && "id" in subRef ? subRef.id : null;

        if (userId && customerId && admin) {
          await admin
            .from("user_profiles")
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subId,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        }

        if (userId && subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          if (customerId) await applySubscriptionToProfile(userId, sub, customerId);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const metaUid = sub.metadata?.supabase_user_id;

        if (!admin) break;

        let userId = typeof metaUid === "string" && metaUid.length > 0 ? metaUid : null;
        if (!userId) {
          const { data: row } = await admin
            .from("user_profiles")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();
          userId = row?.user_id ?? null;
        }

        if (userId) {
          await applySubscriptionToProfile(userId, sub, customerId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        if (!admin) break;
        await admin
          .from("user_profiles")
          .update({
            subscription_status: "canceled",
            plan_type: "free",
            stripe_subscription_id: null,
            subscription_trial_end: null,
            subscription_current_period_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error("[stripe/webhook] handler error:", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
