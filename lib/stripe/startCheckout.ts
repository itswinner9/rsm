/**
 * Start Stripe Checkout for monthly or yearly plan (3-day trial, card required).
 */
export async function startStripeCheckout(
  plan: "month" | "year"
): Promise<{ ok: boolean; error?: string }> {
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
