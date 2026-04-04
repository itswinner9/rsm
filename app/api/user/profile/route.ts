import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select(
      "subscription_status, subscription_trial_end, created_at, plan_type, free_trial_started_at, free_trial_ends_at, last_free_use_date, total_free_uses"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const created_at =
    profile?.created_at != null ? new Date(profile.created_at as string).toISOString() : null;

  return NextResponse.json({
    subscription_status: profile?.subscription_status ?? null,
    subscription_trial_end: profile?.subscription_trial_end ?? null,
    created_at,
    plan_type: profile?.plan_type ?? null,
    free_trial_started_at: profile?.free_trial_started_at ?? null,
    free_trial_ends_at: profile?.free_trial_ends_at ?? null,
    last_free_use_date: profile?.last_free_use_date ?? null,
    total_free_uses: profile?.total_free_uses ?? null,
  });
}
