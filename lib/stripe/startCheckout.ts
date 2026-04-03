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
      body: JSON.stringify({ plan }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (res.status === 401) {
      window.location.href = "/auth/signup";
      return { ok: true };
    }
    if (!res.ok) {
      return { ok: false, error: typeof data.error === "string" ? data.error : "Checkout failed" };
    }
    if (data.url) {
      window.location.href = data.url;
      return { ok: true };
    }
    return { ok: false, error: "No checkout URL" };
  } catch {
    return { ok: false, error: "Network error" };
  }
}
