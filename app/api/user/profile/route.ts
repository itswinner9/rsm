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
    .select("subscription_status, subscription_trial_end")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    subscription_status: profile?.subscription_status ?? null,
    subscription_trial_end: profile?.subscription_trial_end ?? null,
  });
}
