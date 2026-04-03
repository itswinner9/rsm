/**
 * Absolute callback URL for Supabase email confirmation and OAuth.
 * Prefers NEXT_PUBLIC_APP_URL when set (matches production deploy), otherwise the current browser origin.
 */
export function getAuthCallbackUrl(): string {
  const envBase = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const origin =
      envBase && envBase.startsWith("http") ? envBase : window.location.origin;
    return new URL("/auth/callback", origin).href;
  }
  if (envBase && envBase.startsWith("http")) {
    return new URL("/auth/callback", envBase).href;
  }
  return new URL("/auth/callback", "http://localhost:3000").href;
}
