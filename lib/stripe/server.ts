import Stripe from "stripe";

/** Required for Checkout [Managed Payments](https://docs.stripe.com/payments/checkout/managed-payments). */
export const STRIPE_API_VERSION = "2026-02-25.preview" as Stripe.LatestApiVersion;

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!_stripe) {
    _stripe = new Stripe(key, {
      typescript: true,
      apiVersion: STRIPE_API_VERSION,
    });
  }
  return _stripe;
}

/** Stripe Node SDK errors may nest the message on `raw`. */
export function extractStripeErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    const o = err as { message?: unknown; raw?: { message?: unknown } };
    if (typeof o.message === "string" && o.message.length > 0) return o.message;
    if (o.raw && typeof o.raw.message === "string") return o.raw.message;
  }
  return typeof err === "string" ? err : "Checkout failed";
}

export function getAppOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv?.startsWith("http")) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status
): "trialing" | "active" | "past_due" | "canceled" | "inactive" {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "canceled";
    default:
      return "inactive";
  }
}
