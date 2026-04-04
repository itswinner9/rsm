import type { FreePlanRow } from "@/lib/subscription/freePlan";
import { hasFreePlanAccessPreview } from "@/lib/subscription/freePlan";

/** Stripe-backed access: active subscribers or users in the card-required trial. */
export function hasPaidPlanAccess(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

export function isUnlimitedPlan(status: string | null | undefined): boolean {
  return status === "active";
}

/** Dashboard/builder CTA: paid/trial or free plan (profile columns). */
export function canStartOptimization(
  status: string | null | undefined,
  freePlan: FreePlanRow | null | undefined
): boolean {
  if (hasPaidPlanAccess(status)) return true;
  return hasFreePlanAccessPreview(status, freePlan ?? {});
}
