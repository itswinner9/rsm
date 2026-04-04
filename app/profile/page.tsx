import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Crown,
  Mail,
  Calendar,
  Shield,
  ChevronRight,
  Sparkles,
  Check,
  AlertCircle,
  FileText,
  Target,
  LayoutTemplate,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { ManageBillingButton } from "@/components/profile/ManageBillingButton";
import { syncStripeSubscriptionForUser } from "@/lib/stripe/syncSubscription";
import { hasPaidPlanAccess } from "@/lib/subscription/access";
import { planSummaryFromStatus } from "@/lib/subscription/appShellPlan";
import { cn } from "@/lib/utils";
import { siteDescription, openGraphDefaults } from "@/lib/site-metadata";
import { parseResumeTemplateId, TEMPLATE_SHORT_LABEL } from "@/lib/resume/types";

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: profile }, { count: generationsCount }, { data: recentGenerations }] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("user_id", user.id).single(),
    supabase.from("resume_generations").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("resume_generations")
      .select("id, job_title, company_name, created_at, ats_score_optimized, selected_template, generated_resumes")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
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
  const isTrialing = status === "trialing";
  const isActive = status === "active";
  const trialEnds = profile?.subscription_trial_end
    ? new Date(profile.subscription_trial_end).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const memberSince = new Date(user.created_at || Date.now()).toLocaleDateString("en-CA", {
    year: "numeric", month: "long", day: "numeric",
  });

  const lastGen = recentGenerations[0];
  const lastScore = lastGen ? optimizedScoreForGen(lastGen) : null;
  const lastTemplate = lastGen ? parseResumeTemplateId(lastGen.selected_template) : null;

  return (
    <AppShell userEmail={user.email} planSummary={planSummaryFromStatus(status)}>
      <div className="max-w-xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight sm:text-[1.65rem]">Profile</h1>
          <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
            {hasAccess ? "Account details and billing." : "Account and subscription."}
          </p>
        </div>

        {/* Profile card */}
        <div className="rounded-2xl border border-border bg-card/45 p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-muted/60 border border-border flex items-center justify-center shrink-0">
              <span className="text-xl font-semibold text-foreground">
                {user.email?.[0]?.toUpperCase() ?? "U"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate text-[15px]">{user.email?.split("@")[0]}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
            {hasAccess && (
              <div className="shrink-0 flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1">
                <Crown className="size-3.5 text-muted-foreground" strokeWidth={1.25} />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {isTrialing ? "Trial" : "Full access"}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-muted/50 border border-border flex items-center justify-center shrink-0">
                <Mail className="size-3.5 text-muted-foreground" strokeWidth={1.25} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground truncate max-w-[140px]">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-muted/50 border border-border flex items-center justify-center shrink-0">
                <Calendar className="size-3.5 text-muted-foreground" strokeWidth={1.25} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Member since</p>
                <p className="text-sm font-medium text-foreground">{memberSince}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-muted/50 border border-border flex items-center justify-center shrink-0">
                <Sparkles className="size-3.5 text-muted-foreground" strokeWidth={1.25} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saved resumes</p>
                <p className="text-sm font-medium text-foreground">
                  {generationsCount} optimization{generationsCount !== 1 ? "s" : ""}
                </p>
                {generationsCount > 0 && (
                  <Link href="/dashboard" className="text-[11px] text-primary font-medium hover:underline mt-0.5 inline-block">
                    View on Recent →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription card */}
        <div className="rounded-2xl border border-border bg-card/45 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center border shrink-0",
                  hasAccess ? "bg-muted/50 border-border" : "bg-muted/40 border-border"
                )}
              >
                <Crown className="size-4 text-muted-foreground" strokeWidth={1.25} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  {isActive ? "Full access" : isTrialing ? "Trial" : "Subscribe to optimize"}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  {isActive
                    ? "Unlimited optimizations and exports while your subscription is active."
                    : isTrialing
                      ? `Trial: one optimization per UTC day until ${trialEnds ?? "trial end"}. Then unlimited on a paid plan.`
                      : "Start with a 3-day trial (card required at checkout), then $9.99/mo or $99.99/yr CAD via Stripe."}
                </p>
              </div>
            </div>
            {hasAccess && (
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium shrink-0">
                <div
                  className={cn(
                    "size-1.5 rounded-full",
                    isTrialing ? "bg-amber-400/90" : "bg-emerald-400/80"
                  )}
                />
                {isTrialing ? "Trialing" : "Active"}
              </div>
            )}
          </div>

          {hasAccess ? (
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-3">
                Payment method and invoices in Stripe&apos;s secure billing portal.
              </p>
              <ManageBillingButton />
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              <div className="rounded-xl p-3 flex items-start gap-3 border bg-muted/30 border-border">
                <AlertCircle className="size-4 shrink-0 mt-0.5 text-muted-foreground" strokeWidth={1.25} />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Optimizations require an active subscription or trial. Choose monthly or yearly on the plans page —
                  your card secures the 3-day trial; billing continues after unless you cancel in the portal.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  "$9.99 CAD / month",
                  "$99.99 CAD / year",
                  "1 optimization per UTC day on trial",
                  "Unlimited after trial while subscribed",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-muted-foreground text-xs">
                    <ChevronRight className="size-3 shrink-0 text-muted-foreground/60" strokeWidth={1.25} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasAccess && (
            <div className="space-y-2">
              <Button asChild className="w-full rounded-full min-h-11">
                <Link href="/pricing">
                  <Crown className="size-4 mr-2" strokeWidth={1.25} />
                  View plans & start trial
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Checkout is powered by Stripe; you can manage billing anytime from this page once subscribed.
              </p>
            </div>
          )}
        </div>

        {/* Recent optimizations & last run */}
        {generationsCount > 0 && (
          <div className="rounded-2xl border border-border bg-card/45 p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                  <FileText className="size-4 text-primary" strokeWidth={1.25} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">Your resumes</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {generationsCount} saved run{generationsCount !== 1 ? "s" : ""} · full list on{" "}
                    <Link href="/dashboard" className="text-primary font-medium hover:underline">
                      Recent
                    </Link>
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full h-9 text-xs border-border">
                <Link href="/dashboard">
                  Open Recent
                  <ExternalLink className="size-3 ml-1.5" strokeWidth={1.25} />
                </Link>
              </Button>
            </div>

            {lastGen && (
              <div className="rounded-xl border border-border bg-muted/25 p-4 sm:p-5 space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Last optimization</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-base font-semibold text-foreground truncate">
                      {lastGen.job_title?.trim() || "Resume optimization"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {[lastGen.company_name, new Date(lastGen.created_at).toLocaleString("en-CA", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {lastScore != null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-background/80 border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
                          <Target className="size-3 text-primary" strokeWidth={1.25} />
                          {lastScore}% match
                        </span>
                      )}
                      {lastTemplate && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-background/80 border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                          <LayoutTemplate className="size-3" strokeWidth={1.25} />
                          {TEMPLATE_SHORT_LABEL[lastTemplate]}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button asChild className="rounded-full shrink-0 w-full sm:w-auto">
                    <Link href={`/dashboard/generation/${lastGen.id}`}>
                      Open resume
                      <ChevronRight className="size-4 ml-1" strokeWidth={1.25} />
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {recentGenerations.length > 1 && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-2">
                  More recent
                </p>
                <ul className="space-y-1.5">
                  {recentGenerations.slice(1, 6).map((g) => {
                    const sc = optimizedScoreForGen(g);
                    const title = g.job_title?.trim() || "Optimization";
                    return (
                      <li key={g.id}>
                        <Link
                          href={`/dashboard/generation/${g.id}`}
                          className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted/60 transition-colors border border-transparent hover:border-border"
                        >
                          <span className="font-medium text-foreground truncate">{title}</span>
                          <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                            {sc != null ? `${sc}%` : "—"}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {generationsCount > 6 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    +{generationsCount - 6} more on{" "}
                    <Link href="/dashboard" className="text-primary font-medium hover:underline">
                      Recent
                    </Link>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Security */}
        <div className="rounded-2xl border border-border bg-card/45 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-8 rounded-lg bg-muted/50 border border-border flex items-center justify-center">
              <Shield className="size-3.5 text-muted-foreground" strokeWidth={1.25} />
            </div>
            <p className="font-medium text-foreground text-sm">Security</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">Email address</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400/85">
                <Check className="size-3" strokeWidth={1.25} />
                Verified
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Authentication</p>
                <p className="text-xs text-muted-foreground">Email + password</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400/85">
                <Check className="size-3" strokeWidth={1.25} />
                Secure
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/dashboard"
            className="group rounded-2xl border border-border bg-card/40 hover:bg-muted/40 p-4 transition-colors duration-150"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="size-4 text-muted-foreground" strokeWidth={1.25} />
              <p className="text-sm font-medium text-foreground">My resumes</p>
              <ChevronRight className="size-3.5 text-muted-foreground/35 group-hover:text-muted-foreground ml-auto transition-colors" strokeWidth={1.25} />
            </div>
            <p className="text-xs text-muted-foreground">Optimization history</p>
          </Link>
          <Link
            href="/builder"
            className="group rounded-2xl border border-border bg-card/40 hover:bg-muted/40 p-4 transition-colors duration-150"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="size-4 text-muted-foreground" strokeWidth={1.25} />
              <p className="text-sm font-medium text-foreground">New resume</p>
              <ChevronRight className="size-3.5 text-muted-foreground/35 group-hover:text-muted-foreground ml-auto transition-colors" strokeWidth={1.25} />
            </div>
            <p className="text-xs text-muted-foreground">Optimize another role</p>
          </Link>
        </div>

      </div>
    </AppShell>
  );
}
