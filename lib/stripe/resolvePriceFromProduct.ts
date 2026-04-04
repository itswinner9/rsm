import type Stripe from "stripe";
import {
  isStripePriceEnvBlank,
  normalizeStripePriceEnvRaw,
  shouldUseInlinePricingInsteadOfPriceId,
} from "@/lib/stripe/priceId";

/**
 * List recurring prices on a product and pick one for the requested billing interval.
 * Prefers CAD; otherwise first matching interval (Stripe account default currency).
 */
export async function fetchPriceIdForProductPlan(
  stripe: Stripe,
  productId: string,
  plan: "month" | "year"
): Promise<string | null> {
  const interval = plan === "year" ? "year" : "month";
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });

  const recurring = prices.data.filter(
    (p) => p.type === "recurring" && p.recurring?.interval === interval
  );

  const cad = recurring.find((p) => p.currency === "cad");
  if (cad) return cad.id;

  const any = recurring[0];
  return any?.id ?? null;
}

export type SubscriptionLineItemsResult =
  | { ok: true; line_items: Stripe.Checkout.SessionCreateParams.LineItem[]; usedInlineFallback: boolean }
  | { ok: false; error: string };

/**
 * When `STRIPE_SUBSCRIPTION_PRODUCT_ID` is set (`prod_…`), resolve a catalog `price_…` for this
 * plan instead of requiring `STRIPE_PRICE_*_CAD`. Skips if the plan already has a valid `price_…` in env.
 */
export async function tryResolveLineItemsFromProduct(
  plan: "month" | "year",
  env: NodeJS.ProcessEnv,
  stripe: Stripe
): Promise<SubscriptionLineItemsResult | null> {
  const raw = plan === "year" ? env.STRIPE_PRICE_YEARLY_CAD : env.STRIPE_PRICE_MONTHLY_CAD;
  const productId = env.STRIPE_SUBSCRIPTION_PRODUCT_ID?.trim();

  if (!productId?.startsWith("prod_")) {
    return null;
  }

  const normalized = normalizeStripePriceEnvRaw(raw);
  if (normalized.startsWith("price_")) {
    return null;
  }

  const shouldTry =
    isStripePriceEnvBlank(raw) || shouldUseInlinePricingInsteadOfPriceId(raw);
  if (!shouldTry) {
    return null;
  }

  const priceId = await fetchPriceIdForProductPlan(stripe, productId, plan);
  if (!priceId) {
    console.warn(
      `[stripe/checkout] STRIPE_SUBSCRIPTION_PRODUCT_ID=${productId}: no active recurring ${plan === "year" ? "yearly" : "monthly"} price found (prefer CAD). Falling back to STRIPE_PRICE_* or inline.`
    );
    return null;
  }

  return {
    ok: true,
    line_items: [{ price: priceId, quantity: 1 }],
    usedInlineFallback: false,
  };
}
