import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { buildSubscriptionLineItems } from "@/lib/stripe/checkoutLineItems";
import { mapStripeCheckoutApiError } from "@/lib/stripe/priceId";
import { tryResolveLineItemsFromProduct } from "@/lib/stripe/resolvePriceFromProduct";
import { extractStripeErrorMessage, getAppOrigin, getStripe } from "@/lib/stripe/server";
import {
  summarizeCheckoutLineItems,
  validateCheckoutLineItemsForStripe,
} from "@/lib/stripe/validateCheckoutLineItems";
import { hasPaidPlanAccess } from "@/lib/subscription/access";

const TRIAL_DAYS = 3;

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      return NextResponse.json(
        {
          error:
            "Billing is not configured. Set STRIPE_SECRET_KEY in your deployment environment (e.g. Vercel → Environment Variables) and redeploy.",
        },
        { status: 503 }
      );
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profileRow } = await supabase
      .from("user_profiles")
      .select("subscription_status, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (hasPaidPlanAccess(profileRow?.subscription_status)) {
      return NextResponse.json(
        {
          error:
            "You already have a subscription or trial. Manage billing from your profile to change plans.",
        },
        { status: 400 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as { plan?: string };
    const plan = body.plan === "year" ? "year" : "month";

    const stripe = getStripe();
    const fromProduct = await tryResolveLineItemsFromProduct(plan, process.env, stripe);
    const lineItemsResult = fromProduct ?? buildSubscriptionLineItems(plan, process.env);
    if (!lineItemsResult.ok) {
      return NextResponse.json({ error: lineItemsResult.error }, { status: 500 });
    }
    const { line_items: lineItems, usedInlineFallback } = lineItemsResult;

    const lineItemsError = validateCheckoutLineItemsForStripe(lineItems);
    if (lineItemsError) {
      console.error("[stripe/checkout] line_items validation failed:", lineItemsError, summarizeCheckoutLineItems(lineItems));
      return NextResponse.json({ error: lineItemsError }, { status: 500 });
    }

    const pricingMode = usedInlineFallback ? "inline_price_data" : "catalog_price_id";
    console.info(`[stripe/checkout] plan=${plan} mode=${pricingMode} items=${summarizeCheckoutLineItems(lineItems)}`);

    const origin = getAppOrigin();

    const base: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      client_reference_id: user.id,
      line_items: lineItems,
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
    };

    const customerId = profileRow?.stripe_customer_id?.trim();
    let session: Stripe.Checkout.Session;

    try {
      session = await stripe.checkout.sessions.create(
        customerId
          ? { ...base, customer: customerId }
          : { ...base, customer_email: user.email }
      );
    } catch (first: unknown) {
      const msg = extractStripeErrorMessage(first);
      const isMissingCustomer = customerId && /no such customer/i.test(msg);
      if (!isMissingCustomer) {
        throw first;
      }
      const admin = createServiceRoleClient();
      if (admin) {
        await admin
          .from("user_profiles")
          .update({ stripe_customer_id: null, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
      }
      session = await stripe.checkout.sessions.create({
        ...base,
        customer_email: user.email,
      });
    }

    if (!session.url) {
      return NextResponse.json({ error: "No checkout URL from Stripe" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    const raw = extractStripeErrorMessage(e);
    const friendly = mapStripeCheckoutApiError(raw);
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
