/**
 * Free plan (no card): up to 3 optimizations, at most 1 per UTC day,
 * within 72h from first free use. Enforced server-side in optimize-resume.
 */

export type FreePlanRow = {
  plan_type?: string | null;
  free_trial_started_at?: string | null;
  free_trial_ends_at?: string | null;
  last_free_use_date?: string | null;
  total_free_uses?: number | null;
};

export type FreePlanGate =
  | { ok: true }
  | { ok: false; code: "free_trial_ended" | "free_daily_limit" | "free_cap_exceeded"; message: string };

export function utcTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** When subscription is not Stripe active/trialing. */
export function evaluateFreeOptimizationGate(row: FreePlanRow): FreePlanGate {
  const today = utcTodayString();
  const now = Date.now();

  if (!row.free_trial_started_at) {
    return { ok: true };
  }

  const endsMs = row.free_trial_ends_at ? new Date(row.free_trial_ends_at).getTime() : NaN;
  if (Number.isFinite(endsMs) && now > endsMs) {
    return {
      ok: false,
      code: "free_trial_ended",
      message: "Your free trial has ended. Please upgrade to continue.",
    };
  }

  if (row.last_free_use_date === today) {
    return {
      ok: false,
      code: "free_daily_limit",
      message: "You already used your free try today. Come back tomorrow or upgrade.",
    };
  }

  if ((row.total_free_uses ?? 0) >= 3) {
    return {
      ok: false,
      code: "free_cap_exceeded",
      message: "Your free plan is finished. Please upgrade.",
    };
  }

  return { ok: true };
}

/** UI: inactive user may still run a free optimization (or has not started yet). */
export function hasFreePlanAccessPreview(
  subscriptionStatus: string | null | undefined,
  row: FreePlanRow
): boolean {
  if (subscriptionStatus === "active" || subscriptionStatus === "trialing") return false;
  return evaluateFreeOptimizationGate(row).ok;
}

export function freeWindowDaysLeft(row: FreePlanRow): number {
  if (!row.free_trial_ends_at) return 0;
  const ends = new Date(row.free_trial_ends_at).getTime();
  if (!Number.isFinite(ends) || Date.now() > ends) return 0;
  const msLeft = ends - Date.now();
  return Math.max(1, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
}
