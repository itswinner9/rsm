import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppOrigin, getStripe } from "@/lib/stripe/server";

export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account yet. Start a plan from the pricing page." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const origin = getAppOrigin();
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/profile`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe portal error:", e);
    const msg = e instanceof Error ? e.message : "Portal failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
