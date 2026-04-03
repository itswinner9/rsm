import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getStripe, mapStripeSubscriptionStatus } from "@/lib/stripe/server";

/**
 * Pull Stripe subscription for this user and update user_profiles (e.g. after checkout before webhook lands).
 */
export async function syncStripeSubscriptionForUser(supabaseUserId: string): Promise<boolean> {
  const supabase = createClient();
  const admin = createServiceRoleClient();
  const db = admin ?? supabase;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("user_id", supabaseUserId)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return false;
  }

  try {
    const stripe = getStripe();
    const list = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
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
