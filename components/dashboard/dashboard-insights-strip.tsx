import Link from "next/link";
import { ClipboardList, Lightbulb, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  aggregateMissingKeywordThemes,
  averageMatchLiftPercent,
  latestPrepInsights,
} from "@/lib/dashboard/aggregateInsights";
import { DashboardTalkingPointsCopy } from "@/components/dashboard/dashboard-talking-points-copy";

type GenRow = {
  ats_score_original?: number | null;
  ats_score_optimized?: number | null;
  generated_resumes?: unknown;
};

/** Surfaces patterns only Resumify can show from saved JD + analysis (no extra DB columns). */
export function DashboardInsightsStrip({ generations }: { generations: GenRow[] }) {
  if (!generations.length) return null;

  const lift = averageMatchLiftPercent(generations);
  const themes = aggregateMissingKeywordThemes(generations);
  const prep = latestPrepInsights(generations);

  if (lift == null && themes.length === 0 && !prep) return null;

  return (
    <section aria-labelledby="dash-insights-heading" className="space-y-4">
      <h2 id="dash-insights-heading" className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        Insights from your job descriptions
      </h2>
      <p className="text-xs text-muted-foreground -mt-2 max-w-2xl">
        Unlike static templates, Resumify stores each run&apos;s keyword match and gap analysis—so you can see trends
        across applications, not just one file at a time.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {lift != null ? (
          <div className="rounded-2xl border border-border bg-gradient-to-br from-emerald-500/[0.06] to-transparent p-5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400/90 mb-2">
              <TrendingUp className="size-4 shrink-0" strokeWidth={1.5} />
              <span className="text-[11px] font-semibold uppercase tracking-wide">Avg match lift</span>
            </div>
            <p className="text-3xl font-semibold tabular-nums text-foreground">+{lift}%</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Average improvement from before → after optimization, across runs with both scores.
            </p>
          </div>
        ) : null}

        {themes.length > 0 ? (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:col-span-1">
            <div className="flex items-center gap-2 text-foreground mb-3">
              <Lightbulb className="size-4 shrink-0 text-amber-600 dark:text-amber-400/90" strokeWidth={1.5} />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Recurring gaps
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              JD terms that still showed up as light in recent runs—consider where they could be true for you.
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {themes.map(({ term, count }) => (
                <li
                  key={term}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] text-foreground"
                >
                  <span className="truncate max-w-[200px]">{term}</span>
                  {count > 1 ? (
                    <span className="tabular-nums text-muted-foreground">×{count}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {prep ? (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:col-span-1">
            <div className="flex items-center gap-2 text-foreground mb-3">
              <ClipboardList className="size-4 shrink-0 text-primary" strokeWidth={1.5} />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Latest prep notes
              </span>
            </div>
            {prep.strengths.length > 0 ? (
              <div className="mb-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                  Lean on
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  {prep.strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {prep.whatToAdd.length > 0 ? (
              <div className="mb-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                  Worth adding (if true)
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  {prep.whatToAdd.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <DashboardTalkingPointsCopy prep={prep} />
          </div>
        ) : null}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Open any run for full keyword lists and exports.{" "}
        <Link href="/builder" className="text-primary underline-offset-4 hover:underline">
          New optimization
        </Link>
      </p>
    </section>
  );
}
