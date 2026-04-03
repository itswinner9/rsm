"use client";

import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { cn } from "@/lib/utils";

function clampPct(n: number) {
  return Math.min(100, Math.max(0, Math.round(Number.isFinite(n) ? n : 0)));
}

export function MatchImprovementCard({
  originalScore,
  optimizedScore,
  className,
}: {
  originalScore: number;
  optimizedScore: number;
  className?: string;
}) {
  const orig = clampPct(originalScore);
  const opt = clampPct(optimizedScore);
  const delta = opt - orig;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border shadow-sm shadow-black/[0.03] bg-gradient-to-br from-primary/[0.04] via-card to-emerald-500/[0.04] p-4 sm:p-5",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
            <Target className="size-5 text-primary" strokeWidth={1.25} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground tracking-tight">Job description match</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Keyword overlap with this posting—before vs after optimization.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:justify-end">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Before</span>
            <span className="text-lg font-semibold tabular-nums text-foreground">{orig}%</span>
          </div>
          <span className="text-muted-foreground/40 text-sm font-medium hidden sm:inline" aria-hidden>
            →
          </span>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">After</span>
            <span className="text-lg font-semibold tabular-nums text-emerald-900">{opt}%</span>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums border",
              delta > 0 && "border-emerald-200 bg-emerald-50 text-emerald-800",
              delta === 0 && "border-border bg-muted/50 text-muted-foreground",
              delta < 0 && "border-amber-200 bg-amber-50 text-amber-900"
            )}
          >
            {delta > 0 ? (
              <>
                <TrendingUp className="size-3.5 shrink-0" strokeWidth={2} />+{delta}%
              </>
            ) : delta < 0 ? (
              <>
                <TrendingDown className="size-3.5 shrink-0" strokeWidth={2} />
                {delta}%
              </>
            ) : (
              <>
                <Minus className="size-3.5 shrink-0" strokeWidth={2} />
                Same
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
