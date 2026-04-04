import type { FreePlanRow } from "@/lib/subscription/freePlan";
import { hasFreePlanAccessPreview } from "@/lib/subscription/freePlan";

/** Matches AppShell sidebar footer states (no "loading" on server pages). */
export type AppShellPlanKind = "none" | "welcome" | "trial" | "active";

export function planSummaryFromStatus(
  status: string | null | undefined,
  freePlan?: FreePlanRow | null
): AppShellPlanKind {
  if (status === "trialing") return "trial";
  if (status === "active") return "active";
  if (hasFreePlanAccessPreview(status, freePlan ?? {})) return "welcome";
  return "none";
}
