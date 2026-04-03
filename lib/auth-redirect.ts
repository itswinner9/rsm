/**
 * Absolute callback URL for Supabase email confirmation and OAuth.
 * On the client, always use the current browser origin so production (e.g. resumify.cc) never
 * receives localhost links when NEXT_PUBLIC_APP_URL was mis-set on Vercel. Server-side uses env.
 */
export function getAuthCallbackUrl(): string {
  if (typeof window !== "undefined") {
    return new URL("/auth/callback", window.location.origin).href;
  }
  const envBase = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (envBase?.startsWith("http")) {
    return new URL("/auth/callback", envBase).href;
  }
  return new URL("/auth/callback", "http://localhost:3000").href;
}
