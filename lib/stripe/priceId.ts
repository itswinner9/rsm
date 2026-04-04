/**
 * Checkout `line_items[].price` must be a Stripe Price ID (`price_...`).
 * Common mistakes: Subscription/Product/Customer IDs, dollar amounts, or quoted env values.
 */

const AMOUNT_LIKE_ERROR =
  "STRIPE_PRICE_* must be a Stripe Price ID (starts with price_…), not a dollar amount or cents. In Dashboard → Product catalog → your product → Pricing, copy the Price ID—not 9.99, 999, or $9.99.";

/** Strip accidental wrapping quotes from copy-pasted env values. */
function stripWrappingQuotes(s: string): string {
  let t = s.trim();
  if (t.length >= 2) {
    const open = t[0];
    const close = t[t.length - 1];
    if ((open === '"' || open === "'") && close === open) {
      t = t.slice(1, -1).trim();
    }
  }
  return t.replace(/^\uFEFF/, "").trim();
}

/** Normalized env string for comparisons (trim, strip wrapping quotes, BOM). */
export function normalizeStripePriceEnvRaw(raw: string | undefined): string {
  return stripWrappingQuotes(raw?.trim() ?? "");
}

/** True when the env value is missing or only whitespace (after stripping quotes). */
export function isStripePriceEnvBlank(raw: string | undefined): boolean {
  return normalizeStripePriceEnvRaw(raw) === "";
}

/** True if the value looks like a literal amount, not an API id. */
function looksLikeLiteralAmount(value: string): boolean {
  const t = value.trim();
  if (/^\d+$/.test(t)) return true;
  if (/^\d+\.\d{1,6}$/.test(t)) return true;
  if (/^\$\s*[\d.]/.test(t)) return true;
  if (/^[\d.]+\s*(cad|usd)\s*$/i.test(t)) return true;
  return false;
}

/**
 * When STRIPE_PRICE_*_CAD is not a real `price_…` id (e.g. pasted `9.99`, `99.99`, or `sub_…`),
 * use inline `price_data` instead of failing checkout.
 */
export function shouldUseInlinePricingInsteadOfPriceId(raw: string | undefined): boolean {
  const n = normalizeStripePriceEnvRaw(raw);
  if (!n) return false;
  if (n.startsWith("sub_")) return true;
  return looksLikeLiteralAmount(n);
}

export function validateStripePriceIdForEnv(raw: string | undefined): { ok: true; priceId: string } | { ok: false; error: string } {
  const priceId = normalizeStripePriceEnvRaw(raw);
  if (!priceId) {
    return { ok: false, error: "Price ID is empty." };
  }
  if (looksLikeLiteralAmount(priceId)) {
    return { ok: false, error: AMOUNT_LIKE_ERROR };
  }
  if (priceId.startsWith("price_")) {
    return { ok: true, priceId };
  }
  if (priceId.startsWith("sub_")) {
    return {
      ok: false,
      error:
        "STRIPE_PRICE_* is set to a Subscription ID (sub_…). Use a Price ID instead: Stripe Dashboard → Product catalog → your product → Pricing → copy the ID that starts with price_.",
    };
  }
  if (priceId.startsWith("prod_")) {
    return {
      ok: false,
      error:
        "STRIPE_PRICE_* is set to a Product ID (prod_…). Use a Price ID: open the product → Pricing → copy price_…",
    };
  }
  if (priceId.startsWith("cus_")) {
    return {
      ok: false,
      error: "STRIPE_PRICE_* looks like a Customer ID (cus_…). Use a Price ID (price_…) from your product’s pricing.",
    };
  }
  return {
    ok: false,
    error:
      "STRIPE_PRICE_* must be a Stripe Price ID starting with price_ (Dashboard → Product catalog → Pricing).",
  };
}

/**
 * Turn raw Stripe API error messages into short, actionable copy for the client.
 */
export function mapStripeCheckoutApiError(stripeMessage: string): string {
  const msg = stripeMessage;
  if (/STRIPE_SECRET_KEY is not set/i.test(msg)) {
    return "Billing is not configured: add STRIPE_SECRET_KEY in Vercel (or .env.local) and redeploy.";
  }
  if (/Invalid API Key|No API key provided|api_key/i.test(msg)) {
    return "Invalid or missing Stripe secret key. Check STRIPE_SECRET_KEY in your server environment (test key sk_test_… vs live sk_live_… must match your Stripe mode).";
  }
  if (/No such price/i.test(msg)) {
    return "Invalid Stripe price ID. Use Price IDs (price_…) from Product catalog → Pricing—or clear STRIPE_PRICE_*_CAD to use default amounts.";
  }
  if (/literal numerical price|price object/i.test(msg)) {
    return "Price env vars must be Price IDs (price_…) or left empty for defaults—not dollar amounts. Fix Vercel env or remove invalid STRIPE_PRICE_* values.";
  }
  if (/No such customer/i.test(msg)) {
    return "Your saved Stripe customer id is invalid (e.g. test vs live mismatch). We retried checkout; if this persists, contact support.";
  }
  return msg.length > 280 ? `${msg.slice(0, 277)}…` : msg;
}
