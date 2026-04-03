import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client (bypasses RLS). Use only in Route Handlers / server code after the user is verified.
 * Returns null if SUPABASE_SERVICE_ROLE_KEY is not set (e.g. some local setups).
 */
export function createServiceRoleClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
