/** Matches AppShell sidebar footer states (no "loading" on server pages). */
export type AppShellPlanKind = "none" | "trial" | "active";

export function planSummaryFromStatus(status: string | null | undefined): AppShellPlanKind {
  if (status === "trialing") return "trial";
  if (status === "active") return "active";
  return "none";
}
