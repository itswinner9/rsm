import type Stripe from "stripe";
import {
  isStripePriceEnvBlank,
  normalizeStripePriceEnvRaw,
  shouldUseInlinePricingInsteadOfPriceId,
  validateStripePriceIdForEnv,
} from "@/lib/stripe/priceId";

const DEFAULT_MONTHLY_CENTS = 999; // $9.99 CAD
const DEFAULT_YEARLY_CENTS = 9999; // $99.99 CAD

function parseCents(val: string | undefined, fallback: number): number {
  const t = val?.trim();
  if (!t) return fallback;
  const n = parseInt(t, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

function inlineLineItem(
  plan: "month" | "year",
  env: NodeJS.ProcessEnv
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const monthlyCents = parseCents(env.STRIPE_PRICE_MONTHLY_CENTS, DEFAULT_MONTHLY_CENTS);
  const yearlyCents = parseCents(env.STRIPE_PRICE_YEARLY_CENTS, DEFAULT_YEARLY_CENTS);
  const unitAmount = plan === "year" ? yearlyCents : monthlyCents;
  const interval: "month" | "year" = plan === "year" ? "year" : "month";
  const name = plan === "year" ? "Resumify Yearly" : "Resumify Monthly";

  return [
    {
      quantity: 1,
      price_data: {
        currency: "cad",
        unit_amount: unitAmount,
        recurring: { interval },
        product_data: {
          name,
          description: "Job-tailored resume optimization — 3-day trial, then billed in CAD.",
        },
      },
    },
  ];
}

/**
 * Prefer catalog Price IDs (`price_…`). If the matching env var is blank, use inline `price_data`
 * so Checkout works with only `STRIPE_SECRET_KEY` (amounts from env cents or defaults $9.99 / $99.99 CAD).
 * If someone pastes a **subscription** ID (`sub_…`) or a **dollar amount** (`9.99`) into
 * STRIPE_PRICE_* by mistake, we fall back to inline `price_data` so checkout still works (and log a warning).
 */
export function buildSubscriptionLineItems(
  plan: "month" | "year",
  env: NodeJS.ProcessEnv
):
  | { ok: true; line_items: Stripe.Checkout.SessionCreateParams.LineItem[]; usedInlineFallback: boolean }
  | { ok: false; error: string } {
  const raw = plan === "year" ? env.STRIPE_PRICE_YEARLY_CAD : env.STRIPE_PRICE_MONTHLY_CAD;

  if (isStripePriceEnvBlank(raw)) {
    const prod = env.STRIPE_SUBSCRIPTION_PRODUCT_ID?.trim();
    if (prod?.startsWith("prod_")) {
      console.warn(
        `[stripe/checkout] STRIPE_SUBSCRIPTION_PRODUCT_ID=${prod} had no matching ${plan === "year" ? "yearly" : "monthly"} recurring price — using inline price_data. Add a ${plan === "year" ? "yearly" : "monthly"} price on that product in Stripe, or set STRIPE_PRICE_${plan === "year" ? "YEARLY" : "MONTHLY"}_CAD=price_…`
      );
    } else {
      console.warn(
        `[stripe/checkout] STRIPE_PRICE_${plan === "year" ? "YEARLY" : "MONTHLY"}_CAD is unset — using inline price_data (${plan === "year" ? "yearly" : "monthly"} cents from env or default). Create Prices in Stripe and set price_… IDs for stable catalog billing.`
      );
    }
    return {
      ok: true,
      line_items: inlineLineItem(plan, env),
      usedInlineFallback: true,
    };
  }

  if (shouldUseInlinePricingInsteadOfPriceId(raw)) {
    const label = plan === "year" ? "YEARLY" : "MONTHLY";
    const preview = normalizeStripePriceEnvRaw(raw).slice(0, 32);
    console.warn(
      `[stripe/checkout] STRIPE_PRICE_${label}_CAD is not a Price ID (price_…): "${preview}". Using inline price_data. Set price_… from Product catalog → Pricing, or leave unset for defaults.`
    );
    return {
      ok: true,
      line_items: inlineLineItem(plan, env),
      usedInlineFallback: true,
    };
  }

  const validated = validateStripePriceIdForEnv(raw);
  if (validated.ok) {
    return {
      ok: true,
      line_items: [{ price: validated.priceId, quantity: 1 }],
      usedInlineFallback: false,
    };
  }

  return { ok: false, error: validated.error };
}
