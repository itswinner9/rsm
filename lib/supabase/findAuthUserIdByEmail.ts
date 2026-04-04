import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_PAGES = 50;
const PER_PAGE = 200;

/**
 * Resolve `auth.users.id` by email (service-role client only).
 * Used when Stripe webhooks lack `client_reference_id` (e.g. Payment Links).
 * Paginates through admin listUsers — fine for typical project sizes; consider a DB RPC if you exceed ~10k users.
 */
export async function findAuthUserIdByEmail(
  admin: SupabaseClient,
  email: string
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (error || !data?.users?.length) break;
    const match = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (match?.id) return match.id;
    if (data.users.length < PER_PAGE) break;
  }
  return null;
}
