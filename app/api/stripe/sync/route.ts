import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncStripeSubscriptionForUser } from "@/lib/stripe/syncSubscription";

/** Refresh subscription from Stripe (e.g. right after checkout, before webhooks land). */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const active = await syncStripeSubscriptionForUser(user.id);
  return NextResponse.json({ active });
}
