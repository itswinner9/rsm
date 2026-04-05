import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { buildSubscriptionLineItems } from "@/lib/stripe/checkoutLineItems";
import { expandCatalogLineItemsToDropPriceTrial } from "@/lib/stripe/expandCatalogLineItemsToDropPriceTrial";
import { mapStripeCheckoutApiError } from "@/lib/stripe/priceId";
import { tryResolveLineItemsFromProduct } from "@/lib/stripe/resolvePriceFromProduct";
import { extractStripeErrorMessage, getAppOrigin, getStripe } from "@/lib/stripe/server";
import {
  summarizeCheckoutLineItems,
  validateCheckoutLineItemsForStripe,
} from "@/lib/stripe/validateCheckoutLineItems";
import { hasPaidPlanAccess } from "@/lib/subscription/access";

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
    let { line_items: lineItems, usedInlineFallback } = lineItemsResult;

    const trialExpand = await expandCatalogLineItemsToDropPriceTrial(stripe, lineItems);
    lineItems = trialExpand.lineItems;
    if (trialExpand.strippedTrialFromCatalogPrice) {
      usedInlineFallback = true;
    }

    const lineItemsError = validateCheckoutLineItemsForStripe(lineItems);
    if (lineItemsError) {
      console.error("[stripe/checkout] line_items validation failed:", lineItemsError, summarizeCheckoutLineItems(lineItems));
      return NextResponse.json({ error: lineItemsError }, { status: 500 });
    }

    const pricingMode = trialExpand.strippedTrialFromCatalogPrice
      ? "inline_price_data_stripped_catalog_trial"
      : usedInlineFallback
        ? "inline_price_data"
        : "catalog_price_id";
    console.info(`[stripe/checkout] plan=${plan} mode=${pricingMode} items=${summarizeCheckoutLineItems(lineItems)}`);

    const origin = getAppOrigin();

    // Shared fields for subscription Checkout. Managed Payments uses `managed_payments` (API 2026-02-25.preview)
    // and must not set `payment_method_collection`. If Stripe returns "unknown parameter: managed_payments"
    // (account not on preview / ToS not accepted / wrong API version), fall back to standard Checkout.
    const shared: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      client_reference_id: user.id,
      line_items: lineItems,
      success_url: `${origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?checkout=canceled`,
      allow_promotion_codes: true,
      // No Stripe free trial: first-time usage limits are enforced in-app (free plan / welcome window).
      // Do not add trial_period_days or trial_end here — customers pay the subscription amount at checkout.
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
      metadata: {
        supabase_user_id: user.id,
      },
    };

    const withCustomer = (
      extra: { customer: string } | { customer_email: string }
    ): Stripe.Checkout.SessionCreateParams => ({ ...shared, ...extra });

    const managedParams = (
      extra: { customer: string } | { customer_email: string }
    ): Stripe.Checkout.SessionCreateParams & { managed_payments: { enabled: boolean } } => ({
      ...withCustomer(extra),
      managed_payments: { enabled: true },
    });

    const standardParams = (
      extra: { customer: string } | { customer_email: string }
    ): Stripe.Checkout.SessionCreateParams => ({
      ...withCustomer(extra),
      payment_method_collection: "always",
    });

    const createSessionRespectingManagedPayments = async (
      extra: { customer: string } | { customer_email: string }
    ): Promise<Stripe.Checkout.Session> => {
      try {
        return await stripe.checkout.sessions.create(managedParams(extra));
      } catch (e: unknown) {
        const msg = extractStripeErrorMessage(e);
        if (/unknown\s+parameter/i.test(msg) && /managed_payments/i.test(msg)) {
          console.warn(
            "[stripe/checkout] managed_payments not accepted; using standard Checkout with payment_method_collection:",
            msg
          );
          return stripe.checkout.sessions.create(standardParams(extra));
        }
        throw e;
      }
    };

    const customerId = profileRow?.stripe_customer_id?.trim();
    let session: Stripe.Checkout.Session;

    try {
      session = await createSessionRespectingManagedPayments(
        customerId ? { customer: customerId } : { customer_email: user.email }
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
      session = await createSessionRespectingManagedPayments({ customer_email: user.email });
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
