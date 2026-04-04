/** Logged-in user context so Payment Links can pass `client_reference_id` (Supabase user id) to Stripe. */
export type StripeCheckoutContext = {
  userId?: string | null;
  email?: string | null;
};

/**
 * Start Stripe Checkout for monthly or yearly plan (3-day trial, card required).
 * For Payment Links, pass `userId` / `email` so webhooks can tie checkout to Supabase without email-only matching.
 */
export async function startStripeCheckout(
  plan: "month" | "year",
  ctx?: StripeCheckoutContext
): Promise<{ ok: boolean; error?: string }> {
  // Optional: Stripe Payment Link for monthly (Dashboard → Payment Links → buy.stripe.com/...).
  // When set, skip API Checkout for `month` so the hosted Payment Link handles billing.
  if (plan === "month") {
    const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY?.trim();
    if (paymentLink && /^https?:\/\//i.test(paymentLink)) {
      try {
        const url = new URL(paymentLink);
        if (ctx?.userId) url.searchParams.set("client_reference_id", ctx.userId);
        if (ctx?.email) url.searchParams.set("prefilled_email", ctx.email);
        window.location.href = url.toString();
      } catch {
        window.location.href = paymentLink;
      }
      return { ok: true };
    }
  }

  try {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ plan }),
    });

    let data: { url?: string; error?: string };
    try {
      data = (await res.json()) as { url?: string; error?: string };
    } catch {
      return {
        ok: false,
        error:
          res.status === 503
            ? "Billing isn’t configured on the server (missing STRIPE_SECRET_KEY). Add it in Vercel and redeploy."
            : `Checkout failed (${res.status}). Check the network tab or server logs.`,
      };
    }

    if (res.status === 401) {
      window.location.href = "/auth/signup";
      return { ok: true };
    }
    if (!res.ok) {
      return {
        ok: false,
        error: typeof data.error === "string" && data.error.length > 0 ? data.error : "Checkout failed",
      };
    }
    if (data.url) {
      window.location.href = data.url;
      return { ok: true };
    }
    return { ok: false, error: "No checkout URL returned" };
  } catch {
    return { ok: false, error: "Network error — check your connection and try again." };
  }
}
