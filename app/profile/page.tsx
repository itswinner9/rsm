import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Crown,
  Calendar,
  ChevronRight,
  Sparkles,
  Check,
  FileText,
  Target,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { ManageBillingButton } from "@/components/profile/ManageBillingButton";
import { syncStripeSubscriptionForUser } from "@/lib/stripe/syncSubscription";
import { hasPaidPlanAccess } from "@/lib/subscription/access";
import { planSummaryFromStatus } from "@/lib/subscription/appShellPlan";
import {
  evaluateFreeOptimizationGate,
  freeWindowDaysLeft,
  hasFreePlanAccessPreview,
  type FreePlanRow,
} from "@/lib/subscription/freePlan";
import { cn } from "@/lib/utils";
import { siteDescription, openGraphDefaults } from "@/lib/site-metadata";
import { parseResumeTemplateId, TEMPLATE_SHORT_LABEL } from "@/lib/resume/types";
import { presentationMatchScore } from "@/lib/resume/jdKeywordMatchScore";
import {
  builderPlanNoAccessCompact,
  builderPlanWelcomeCapCompact,
  builderPlanWelcomeDailyWaitCompact,
  builderPlanWelcomeEndedCompact,
} from "@/lib/pricing/planDisplay";

function optimizedScoreForGen(gen: {
  ats_score_optimized?: number | null;
  generated_resumes?: unknown;
}): number | null {
  if (gen.ats_score_optimized != null) return gen.ats_score_optimized;
  const v = gen.generated_resumes;
  if (Array.isArray(v) && v.length) {
    const m = Math.max(...v.map((x: { ats_score?: number }) => x.ats_score || 0));
    return m || null;
  }
  return null;
}

export const metadata: Metadata = {
  title: "Account",
  description: "Subscription, billing, and profile settings.",
  robots: { index: false, follow: false },
  openGraph: {
    ...openGraphDefaults,
    title: "Account",
    description: siteDescription,
  },
};

async function getData() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: profile }, { count: generationsCount }, { data: recentGenerations }] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("user_id", user.id).single(),
    supabase.from("resume_generations").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("resume_generations")
      .select("id, job_title, company_name, created_at, ats_score_optimized, selected_template, generated_resumes")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  let p = profile;
  if (!p || !hasPaidPlanAccess(p.subscription_status)) {
    await syncStripeSubscriptionForUser(user.id);
    const { data: fresh } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single();
    p = fresh ?? p;
  }

  return {
    user,
    profile: p,
    generationsCount: generationsCount || 0,
    recentGenerations: recentGenerations ?? [],
  };
}

export default async function ProfilePage() {
  const { user, profile, generationsCount, recentGenerations } = await getData();

  const status = profile?.subscription_status;
  const hasAccess = hasPaidPlanAccess(status);
  const freePlanRow: FreePlanRow = {
    free_trial_started_at: profile?.free_trial_started_at ?? null,
    free_trial_ends_at: profile?.free_trial_ends_at ?? null,
    last_free_use_date: profile?.last_free_use_date ?? null,
    total_free_uses: profile?.total_free_uses ?? null,
  };
  const isWelcome = hasFreePlanAccessPreview(status, freePlanRow);
  const welcomeDays = freeWindowDaysLeft(freePlanRow);
  const isTrialing = status === "trialing";
  const isActive = status === "active";
  const trialEnds = profile?.subscription_trial_end
    ? new Date(profile.subscription_trial_end).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const freeGate = !hasAccess ? evaluateFreeOptimizationGate(freePlanRow) : ({ ok: true } as const);
  const blocked = !hasAccess && !freeGate.ok ? freeGate : null;

  const memberSince = new Date(user.created_at || Date.now()).toLocaleDateString("en-CA", {
    month: "short",
    year: "numeric",
  });

  const lastGen = recentGenerations[0];
  const lastScoreRaw = lastGen ? optimizedScoreForGen(lastGen) : null;
  const lastScore = lastScoreRaw != null ? presentationMatchScore(lastScoreRaw) : null;
  const lastTemplate = lastGen ? parseResumeTemplateId(lastGen.selected_template) : null;

  const planTitle = hasAccess
    ? isTrialing
      ? "Pro · Trial"
      : "Pro · Active"
    : blocked?.code === "free_daily_limit"
      ? "Free — today’s credit used"
      : blocked?.code === "free_cap_exceeded"
        ? "Free runs used"
        : blocked?.code === "free_trial_ended"
          ? "Free window ended"
          : isWelcome
            ? "Free tier"
            : "No plan";

  const planDescription = () => {
    if (hasAccess) {
      if (isActive) return "Unlimited while your subscription is active.";
      return `Trial · 1/day (UTC) until ${trialEnds ?? "end"}. Then unlimited on a paid plan.`;
    }
    if (blocked?.code === "free_daily_limit") return builderPlanWelcomeDailyWaitCompact;
    if (blocked?.code === "free_cap_exceeded") return builderPlanWelcomeCapCompact;
    if (blocked?.code === "free_trial_ended") return builderPlanWelcomeEndedCompact;
    if (isWelcome) {
      return welcomeDays > 0
        ? `~${welcomeDays}d left in window · 1/day, max 3 runs — upgrade for unlimited.`
        : "1/day, max 3 runs in your welcome window. Upgrade for unlimited.";
    }
    return builderPlanNoAccessCompact;
  };

  return (
    <AppShell userEmail={user.email} planSummary={planSummaryFromStatus(status, freePlanRow)}>
      <div className="max-w-lg mx-auto space-y-4 pb-8">
        <header>
          <h1 className="text-lg font-semibold text-foreground tracking-tight sm:text-xl">Account</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Plan & sign-in</p>
        </header>

        {/* Identity + meta + security (one card) */}
        <section className="rounded-xl border border-border/80 bg-card/50 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="size-11 rounded-xl bg-muted/50 border border-border/80 flex items-center justify-center shrink-0 text-base font-semibold text-foreground">
              {user.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-foreground text-sm truncate">{user.email?.split("@")[0]}</p>
                {(hasAccess || isWelcome) && (
                  <span
                    className={cn(
                      "text-[10px] font-medium rounded-full px-2 py-0.5 border",
                      isWelcome && !hasAccess
                        ? "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                        : "border-border bg-muted/40 text-muted-foreground"
                    )}
                  >
                    {isTrialing ? "Trial" : hasAccess ? "Subscribed" : "Free"}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
              <p className="text-[11px] text-muted-foreground mt-2 leading-snug">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3 opacity-70" strokeWidth={2} />
                  Since {memberSince}
                </span>
                <span className="mx-1.5 text-border">·</span>
                {generationsCount} saved run{generationsCount !== 1 ? "s" : ""}
                {generationsCount > 0 && (
                  <>
                    <span className="mx-1.5 text-border">·</span>
                    <Link href="/dashboard" className="text-primary font-medium hover:underline">
                      Recent
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground border-t border-border/60 pt-3 flex items-center gap-1.5">
            <Check className="size-3 text-emerald-500/90 shrink-0" strokeWidth={2} />
            Verified email · Secure sign-in
          </p>
        </section>

        {/* Plan */}
        <section className="rounded-xl border border-border/80 bg-card/50 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="size-8 rounded-lg bg-muted/40 border border-border/80 flex items-center justify-center shrink-0 mt-0.5">
                <Crown className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{planTitle}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{planDescription()}</p>
              </div>
            </div>
            {hasAccess && (
              <span
                className={cn(
                  "shrink-0 text-[10px] font-medium rounded-full px-2 py-0.5 border",
                  isTrialing ? "border-amber-500/30 text-amber-700 dark:text-amber-300" : "border-emerald-500/25 text-emerald-700 dark:text-emerald-300"
                )}
              >
                {isTrialing ? "Trialing" : "Active"}
              </span>
            )}
          </div>

          {!hasAccess && !isWelcome && (
            <p className="text-[11px] text-muted-foreground leading-snug">
              $9.99/mo or $99.99/yr CAD · 1/day on trial · unlimited when subscribed.
            </p>
          )}

          {hasAccess ? (
            <ManageBillingButton className="w-full rounded-full min-h-9 text-sm" />
          ) : (
            <Button asChild className="w-full rounded-full min-h-9 text-sm">
              <Link href="/pricing">
                <Crown className="size-3.5 mr-2 opacity-90" strokeWidth={1.5} />
                {isWelcome ? "Upgrade" : "Plans & trial"}
              </Link>
            </Button>
          )}

          {isWelcome && !hasAccess && (
            <p className="text-[10px] text-center text-muted-foreground leading-snug">
              No card for welcome runs. Subscribe when you need unlimited.
            </p>
          )}
        </section>

        {/* Recent runs */}
        {generationsCount > 0 && (
          <section className="rounded-xl border border-border/80 bg-card/50 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="size-4 text-primary shrink-0" strokeWidth={1.5} />
                <h2 className="text-sm font-semibold text-foreground">Recent runs</h2>
              </div>
              <Link
                href="/dashboard"
                className="text-xs font-medium text-primary hover:underline shrink-0"
              >
                View all
              </Link>
            </div>

            {lastGen && (
              <Link
                href={`/dashboard/generation/${lastGen.id}`}
                className="block rounded-lg border border-border/70 bg-muted/15 hover:bg-muted/30 transition-colors p-3"
              >
                <p className="text-sm font-medium text-foreground truncate">
                  {lastGen.job_title?.trim() || "Optimization"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {[lastGen.company_name, new Date(lastGen.created_at).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {lastScore != null && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-background/90 border border-border/80 px-2 py-0.5 text-[11px] font-medium tabular-nums">
                      <Target className="size-3 text-primary" strokeWidth={2} />
                      {lastScore}%
                    </span>
                  )}
                  {lastTemplate && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <LayoutTemplate className="size-3" strokeWidth={1.5} />
                      {TEMPLATE_SHORT_LABEL[lastTemplate]}
                    </span>
                  )}
                </div>
              </Link>
            )}

            {recentGenerations.length > 1 && (
              <ul className="space-y-0.5">
                {recentGenerations.slice(1, 5).map((g) => {
                  const scRaw = optimizedScoreForGen(g);
                  const sc = scRaw != null ? presentationMatchScore(scRaw) : null;
                  const title = g.job_title?.trim() || "Optimization";
                  return (
                    <li key={g.id}>
                      <Link
                        href={`/dashboard/generation/${g.id}`}
                        className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-foreground truncate font-medium">{title}</span>
                        <span className="text-muted-foreground tabular-nums shrink-0">{sc != null ? `${sc}%` : "—"}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            {generationsCount > 5 && (
              <p className="text-[10px] text-muted-foreground text-center">
                +{generationsCount - 5} more on{" "}
                <Link href="/dashboard" className="text-primary font-medium hover:underline">
                  Recent
                </Link>
              </p>
            )}
          </section>
        )}

        {/* Shortcuts */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full flex-1 border-border/80">
            <Link href="/dashboard">
              <Sparkles className="size-3.5 mr-1.5 opacity-80" strokeWidth={1.5} />
              Recent
            </Link>
          </Button>
          <Button asChild size="sm" className="rounded-full flex-1">
            <Link href="/builder">
              Resume builder
              <ChevronRight className="size-3.5 ml-1 opacity-80" strokeWidth={1.5} />
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
