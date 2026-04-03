import { createClient } from "@/lib/supabase/server";
import { getPolar } from "@/lib/polar/server";

/**
 * Pull Polar customer state by Supabase user id (externalCustomerId) and set Pro when an active/trialing subscription exists.
 */
export async function syncPolarSubscriptionForUser(supabaseUserId: string): Promise<boolean> {
  if (!process.env.POLAR_ACCESS_TOKEN?.trim()) return false;
  try {
    const polar = getPolar();
    const state = await polar.customers.getStateExternal({ externalId: supabaseUserId });
    const active = state.activeSubscriptions?.find(
      (s) => s.status === "active" || s.status === "trialing"
    );
    if (!active) return false;

    const supabase = createClient();
    const { error } = await supabase
      .from("user_profiles")
      .update({
        subscription_status: "active",
        polar_customer_id: state.id,
        polar_subscription_id: active.id,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", supabaseUserId);

    if (error) {
      console.error("[polar/sync] profile update failed", error.code, error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[polar/sync] getStateExternal failed", e);
    return false;
  }
}
