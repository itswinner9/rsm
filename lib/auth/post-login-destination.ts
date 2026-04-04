/**
 * Where to send the user after sign-in. Preserves Stripe checkout return params
 * (`success`, `session_id`) when middleware sent them on `/auth/login`.
 */
export function getPostLoginDestination(searchParams: URLSearchParams): string {
  const raw = searchParams.get("redirect")?.trim();

  if (raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("://")) {
    if (raw.includes("session_id=") || raw.includes("success=")) {
      return raw;
    }
  }

  const base =
    raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("://")
      ? raw.split("?")[0] || "/dashboard"
      : "/dashboard";

  const out = new URLSearchParams();
  const success = searchParams.get("success");
  const sessionId = searchParams.get("session_id");
  if (success === "true") out.set("success", success);
  if (sessionId && sessionId.startsWith("cs_")) out.set("session_id", sessionId);

  const q = out.toString();
  return q ? `${base}?${q}` : base;
}
