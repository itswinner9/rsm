/** Stripe-backed access: active subscribers or users in the card-required trial. */
export function hasPaidPlanAccess(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

export function isUnlimitedPlan(status: string | null | undefined): boolean {
  return status === "active";
}
