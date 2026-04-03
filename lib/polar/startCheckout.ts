/**
 * Start Polar checkout for Pro or Recruiting. Redirects browser on success.
 */
export async function startPolarCheckout(
  plan: "pro" | "recruiting"
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/polar/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
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
