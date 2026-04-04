import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Plus,
  Crown,
  Sparkles,
  Target,
  TrendingUp,
  ArrowRight,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardClearSuccessQuery } from "@/components/dashboard/dashboard-clear-success-query";
import { syncStripeSubscriptionForUser } from "@/lib/stripe/syncSubscription";
import { hasPaidPlanAccess, canStartOptimization } from "@/lib/subscription/access";
import { planSummaryFromStatus } from "@/lib/subscription/appShellPlan";
import type { FreePlanRow } from "@/lib/subscription/freePlan";
import { parseResumeTemplateId, TEMPLATE_SHORT_LABEL } from "@/lib/resume/types";
import { AtsTrendMini, type AtsTrendPoint } from "@/components/dashboard/AtsTrendMini";
import type { Metadata } from "next";
import { siteDescription, openGraphDefaults } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Recent",
  description: "Your saved resume optimizations, match scores, and ATS trend.",
  robots: { index: false, follow: false },
  openGraph: {
    ...openGraphDefaults,
    title: "Recent",
    description: siteDescription,
  },
};

export const dynamic = "force-dynamic";

export type DashboardSearchParams = { success?: string | string[] };

function paymentJustCompleted(sp: DashboardSearchParams | undefined): boolean {
  const s = sp?.success;
  if (s === "true") return true;
  if (Array.isArray(s) && s.includes("true")) return true;
  return false;
}

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

async function getData(searchParams?: DashboardSearchParams) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  let profileRes = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single();

  const profileRow = profileRes.data;
  const afterCheckout = paymentJustCompleted(searchParams);
  if (
    afterCheckout ||
    !profileRow ||
    !hasPaidPlanAccess(profileRow.subscription_status)
  ) {
    await syncStripeSubscriptionForUser(user.id);
    profileRes = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single();
  }

  const genRes = await supabase
    .from("resume_generations")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(500);

  const profile = profileRes.data ?? null;
  const generations = genRes.data || [];
  const generationsTotalCount =
    typeof genRes.count === "number" ? genRes.count : generations.length;

  return { user, profile, generations, generationsTotalCount };
}

export default async function DashboardPage({ searchParams }: { searchParams: DashboardSearchParams }) {
  const { user, profile, generations, generationsTotalCount } = await getData(searchParams);
  const showPaymentSuccess = paymentJustCompleted(searchParams);

  const isSubscribed = hasPaidPlanAccess(profile?.subscription_status);
  const freePlanRow: FreePlanRow = {
    free_trial_started_at: profile?.free_trial_started_at ?? null,
    free_trial_ends_at: profile?.free_trial_ends_at ?? null,
    last_free_use_date: profile?.last_free_use_date ?? null,
    total_free_uses: profile?.total_free_uses ?? null,
  };
  const canGenerate = canStartOptimization(profile?.subscription_status, freePlanRow);

  const scores = generations.map((g) => optimizedScoreForGen(g)).filter((n): n is number => n != null);
  const bestScore = scores.length ? Math.max(...scores) : null;
  const latestScore = generations.length ? optimizedScoreForGen(generations[0]) : null;
  const avgScore =
    scores.length >= 2 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const trendPointsChrono: AtsTrendPoint[] = [...generations]
    .reverse()
    .map((gen) => ({
      date: gen.created_at as string,
      optimized: optimizedScoreForGen(gen),
    }));

  const initial = (title: string) => {
    const t = (title || "?").trim();
    return t.slice(0, 1).toUpperCase();
  };

  return (
    <>
      <Suspense fallback={null}>
        <DashboardClearSuccessQuery />
      </Suspense>
      <AppShell
        userEmail={user.email}
        planSummary={planSummaryFromStatus(profile?.subscription_status, freePlanRow)}
      >
        <div className="max-w-4xl mx-auto space-y-10 pb-16">
          {showPaymentSuccess && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex gap-3">
              <Crown className="size-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.25} />
              <div className="text-sm">
                <p className="font-medium text-foreground">You&apos;re all set</p>
                <p className="text-muted-foreground text-xs mt-0.5">Unlimited optimizations are on.</p>
              </div>
            </div>
          )}

          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Recent</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {generations.length > 0
                  ? `${generations.length} optimization run${generations.length !== 1 ? "s" : ""} saved · ${
                      profile?.subscription_status === "trialing"
                        ? "Trial"
                        : isSubscribed
                          ? "Full access"
                          : canGenerate
                            ? "Welcome · 1/day"
                            : "Subscribe to run more"
                    }`
                  : canGenerate
                    ? isSubscribed
                      ? profile?.subscription_status === "trialing"
                        ? "Trial · 1 run per UTC day"
                        : "Full access"
                      : "Welcome · 1 run per UTC day (3 days)"
                    : "Subscribe to optimize"}
              </p>
            </div>
            {canGenerate && (
              <Button asChild size="sm" className="rounded-full h-10 px-5 text-sm font-medium w-fit">
                <Link href="/builder">
                  <Plus className="size-4 mr-2" strokeWidth={2} />
                  New optimization
                </Link>
              </Button>
            )}
          </header>

          {generations.length > 0 && (
            <>
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border bg-card p-4 flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Target className="size-5" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Best match</p>
                    <p className="text-xl font-semibold tabular-nums text-foreground mt-0.5">
                      {bestScore != null ? `${bestScore}%` : "—"}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
                    <TrendingUp className="size-5" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Latest</p>
                    <p className="text-xl font-semibold tabular-nums text-foreground mt-0.5">
                      {latestScore != null ? `${latestScore}%` : "—"}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                    <FileText className="size-5" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Saved runs</p>
                    <p className="text-xl font-semibold tabular-nums text-foreground mt-0.5">{generations.length}</p>
                    {generationsTotalCount > generations.length ? (
                      <p className="text-[10px] text-muted-foreground">of {generationsTotalCount}</p>
                    ) : null}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 flex gap-3 col-span-2 lg:col-span-1">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                    <Sparkles className="size-5" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Average</p>
                    <p className="text-xl font-semibold tabular-nums text-foreground mt-0.5">
                      {avgScore != null ? `${avgScore}%` : "—"}
                    </p>
                    {avgScore == null && generations.length > 0 ? (
                      <p className="text-[10px] text-muted-foreground">Need 2+ runs</p>
                    ) : null}
                  </div>
                </div>
              </section>

              <AtsTrendMini points={trendPointsChrono} />
            </>
          )}

          {generations.length > 0 && (
            <section id="recent" className="scroll-mt-8">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-3">
                Your runs
              </h2>
              <ul className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden shadow-sm">
                {generations.map((gen: any) => {
                  const best = optimizedScoreForGen(gen);
                  const chosen = parseResumeTemplateId(gen.selected_template);
                  const title = gen.job_title || "Optimization";

                  return (
                    <li key={gen.id}>
                      <Link
                        href={`/dashboard/generation/${gen.id}`}
                        className="flex items-center gap-3 sm:gap-4 px-4 py-3.5 sm:px-5 sm:py-4 hover:bg-muted/60 transition-colors group"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted border border-border text-sm font-semibold text-muted-foreground group-hover:bg-background group-hover:text-foreground transition-colors">
                          {initial(title)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-medium text-foreground truncate">{title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {[
                              gen.company_name,
                              new Date(gen.created_at).toLocaleDateString("en-CA", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }),
                              new Date(gen.created_at).toLocaleTimeString("en-CA", {
                                hour: "numeric",
                                minute: "2-digit",
                              }),
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                            {best != null ? ` · ${best}% match` : ""}
                            {chosen ? ` · ${TEMPLATE_SHORT_LABEL[chosen]}` : ""}
                          </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-1 text-muted-foreground/40 group-hover:text-muted-foreground">
                          {chosen ? (
                            <LayoutTemplate className="size-4" strokeWidth={1.25} />
                          ) : (
                            <FileText className="size-4" strokeWidth={1.25} />
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {generations.length >= 500 && generationsTotalCount > 500 ? (
            <p className="text-xs text-muted-foreground">Showing 500 newest optimizations.</p>
          ) : null}

          {!isSubscribed && (
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-sm text-muted-foreground flex-1">
                Start a 3-day trial with card on the plans page, then unlimited while subscribed.
              </p>
              <Button asChild size="sm" variant="outline" className="rounded-full shrink-0 h-9 text-xs border-border">
                <Link href="/pricing">
                  Plans <ArrowRight className="size-3 ml-1" />
                </Link>
              </Button>
            </div>
          )}

          {generations.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-16 px-6 text-center">
              <p className="text-sm text-muted-foreground mb-5">
                {isSubscribed ? "No runs yet." : "Subscribe to run your first optimization."}
              </p>
              <Button asChild className="rounded-full h-10 px-6 text-sm">
                <Link href={isSubscribed ? "/builder" : "/pricing"}>
                  <Sparkles className="size-3.5 mr-2" strokeWidth={1.25} />
                  {isSubscribed ? "Open resume builder" : "View plans"}
                </Link>
              </Button>
            </div>
          )}

          <footer className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground border-t border-border pt-8">
            <Link href="/builder" className="hover:text-foreground transition-colors">
              Resume builder
            </Link>
            <Link href="/profile" className="hover:text-foreground transition-colors">
              Account
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              Marketing site
            </Link>
          </footer>
        </div>
      </AppShell>
    </>
  );
}
