import type Stripe from "stripe";

/** Stripe Checkout subscription line items must use either a catalog `price` id or `price_data`, never both. */
const PRICE_ID_PATTERN = /^price_[A-Za-z0-9]+$/;

/**
 * Validates `line_items` before `checkout.sessions.create` so we never send a non–Price-ID
 * in `price` (which triggers Stripe’s “literal numerical price” / invalid price errors).
 * Returns `null` if valid, otherwise a short error message for the client.
 */
export function validateCheckoutLineItemsForStripe(
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[]
): string | null {
  if (!lineItems.length) {
    return "Checkout has no line items.";
  }
  for (let i = 0; i < lineItems.length; i++) {
    const item = lineItems[i];
    const price = item.price;
    const priceData = item.price_data;
    const hasPrice = typeof price === "string" && price.length > 0;
    const hasPriceData = priceData != null && typeof priceData === "object";

    if (hasPrice && hasPriceData) {
      return "Checkout line items cannot mix catalog price and price_data.";
    }
    if (hasPrice) {
      if (!PRICE_ID_PATTERN.test(price)) {
        return "Invalid Stripe price: use a Price ID (price_…) from Product catalog → Pricing, not a dollar amount or other id.";
      }
      continue;
    }
    if (hasPriceData) {
      continue;
    }
    return "Checkout line item is missing price or price_data.";
  }
  return null;
}

/** Safe one-line summary for server logs (no secrets). */
export function summarizeCheckoutLineItems(
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[]
): string {
  return lineItems
    .map((li) => {
      if (typeof li.price === "string" && li.price.length > 0) {
        return `catalog:${li.price.length > 16 ? `${li.price.slice(0, 16)}…` : li.price}`;
      }
      if (li.price_data) {
        return "inline:price_data";
      }
      return "invalid";
    })
    .join(",");
}
