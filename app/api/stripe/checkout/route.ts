import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppOrigin, getStripe } from "@/lib/stripe/server";

const TRIAL_DAYS = 3;

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { plan?: string };
    const plan = body.plan === "year" ? "year" : "month";

    const priceId =
      plan === "year"
        ? process.env.STRIPE_PRICE_YEARLY_CAD?.trim()
        : process.env.STRIPE_PRICE_MONTHLY_CAD?.trim();

    if (!priceId) {
      return NextResponse.json(
        {
          error:
            plan === "year"
              ? "Set STRIPE_PRICE_YEARLY_CAD in environment (Stripe Dashboard → Products → Price id)."
              : "Set STRIPE_PRICE_MONTHLY_CAD in environment (Stripe Dashboard → Products → Price id).",
        },
        { status: 500 }
      );
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const origin = getAppOrigin();
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: user.id,
      ...(profile?.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : { customer_email: user.email }),
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/profile?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=canceled`,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { supabase_user_id: user.id },
      },
      metadata: {
        supabase_user_id: user.id,
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "No session URL from Stripe" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    const msg = e instanceof Error ? e.message : "Checkout failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
