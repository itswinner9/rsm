"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ListPlus,
  ListChecks,
  ThumbsUp,
  AlertCircle,
  Lightbulb,
  Sparkles,
  LayoutTemplate,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BadgeDelta } from "@/components/ui/badge-delta";
import { stripHtmlFromText } from "@/lib/resume/sanitizeResumeText";
import { Button } from "@/components/ui/button";
import { presentationMatchScore } from "@/lib/resume/jdKeywordMatchScore";

interface ATSScoreProps {
  originalScore: number;
  optimizedScore: number;
  keywordsFound: string[];
  keywordsMissing: string[];
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  /** AI rewrite bullets (e.g. formatting, privacy, verbs) */
  improvements?: string[];
  /** Active paid subscription (unlimited runs); trialing users see trial-aware copy */
  isPaidActive?: boolean;
  /** e.g. template label — shown as layout exploration hint */
  suggestedTemplateLabel?: string;
}

function clampScore(n: unknown): number {
  const x = typeof n === "number" && Number.isFinite(n) ? n : Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.min(100, Math.max(0, Math.round(x)));
}

function ringAccent(score: number) {
  if (score >= 80) return "stroke-emerald-600";
  if (score >= 60) return "stroke-amber-500";
  return "stroke-red-500";
}

function ScoreRing({
  score,
  size = 76,
  strokeWidth = 5,
  accentClass,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  accentClass: string;
}) {
  const s = clampScore(score);
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (s / 100) * circumference;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-border"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={accentClass}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-semibold text-foreground tabular-nums">{s}%</span>
      </div>
    </div>
  );
}

const chip =
  "rounded-lg border px-2 py-1 text-[11px] leading-snug border-border bg-muted/50 text-muted-foreground";

export function ATSScore({
  originalScore,
  optimizedScore,
  keywordsFound,
  keywordsMissing,
  strengths = [],
  weaknesses = [],
  suggestions = [],
  improvements = [],
  isPaidActive = false,
  suggestedTemplateLabel,
}: ATSScoreProps) {
  const orig = presentationMatchScore(clampScore(originalScore));
  const opt = presentationMatchScore(clampScore(optimizedScore));
  const improvement = opt - orig;

  return (
    <div className="space-y-4">
      {/* AI positioning */}
      <div className="rounded-xl border border-primary/12 bg-gradient-to-br from-primary/[0.06] to-transparent p-4 shadow-sm shadow-black/[0.02]">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
            <Wand2 className="size-5 text-primary" strokeWidth={1.25} />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground leading-snug">Your resume was rewritten with AI</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We aligned phrasing and structure to this job while keeping your real experience honest. Use the insights
              below to iterate—then pick any layout; the content stays the same.
            </p>
            {suggestedTemplateLabel ? (
              <p className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
                <LayoutTemplate className="size-3.5 shrink-0 mt-0.5 text-primary/80" strokeWidth={1.25} />
                <span>
                  <span className="text-foreground/90 font-medium">Suggested layout:</span> {suggestedTemplateLabel} — you
                  can still switch and export from any template.
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Original</p>
          <ScoreRing score={orig} accentClass={ringAccent(orig)} />
          <p className="mt-2 text-[10px] text-muted-foreground">JD keyword overlap</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Optimized</p>
          <ScoreRing score={opt} accentClass={ringAccent(opt)} />
          <div className="mt-2 flex flex-col items-center gap-1.5">
            <BadgeDelta
              variant="complex"
              deltaType={
                improvement > 0 ? "increase" : improvement < 0 ? "decrease" : "neutral"
              }
              value={`${improvement > 0 ? "+" : ""}${improvement}%`}
              aria-label={`Keyword overlap change versus original: ${improvement >= 0 ? "+" : ""}${improvement} percent`}
            />
            <span className="text-[10px] text-muted-foreground">vs original</span>
          </div>
        </div>
      </div>

      {opt < orig && orig > 0 ? (
        <p className="text-[11px] text-muted-foreground leading-relaxed rounded-lg border border-border bg-muted/20 px-3 py-2">
          Scores reflect keyword overlap with the posting—not resume quality alone. A drop can mean we avoided stuffing
          keywords you didn&apos;t earn. Review suggestions and exports; you can re-run from the builder with a tweaked JD
          anytime{isPaidActive ? "" : " (active subscription for unlimited same-day runs)."}.
        </p>
      ) : null}

      {/* Strengths & honest gaps — gaps first so they’re seen immediately */}
      {(weaknesses.length > 0 || strengths.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-1">
          {weaknesses.length > 0 && (
            <div className="rounded-xl border border-red-200/80 bg-red-50/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <AlertCircle className="size-4 text-red-600 shrink-0" strokeWidth={1.25} />
                <span className="text-xs font-semibold text-foreground">Honest gaps for this role</span>
              </div>
              <ul className="space-y-2">
                {weaknesses.slice(0, 5).map((raw, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-[13px] text-muted-foreground leading-relaxed rounded-lg bg-background border border-red-100 px-3 py-2"
                  >
                    <span className="text-red-500 shrink-0 font-medium">•</span>
                    <span>{stripHtmlFromText(raw)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {strengths.length > 0 && (
            <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-4">
              <div className="mb-3 flex items-center gap-2">
                <ThumbsUp className="size-4 text-emerald-600 shrink-0" strokeWidth={1.25} />
                <span className="text-xs font-semibold text-foreground">Strengths we kept visible</span>
              </div>
              <ul className="space-y-2">
                {strengths.slice(0, 5).map((raw, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-[13px] text-muted-foreground leading-relaxed rounded-lg bg-background/80 border border-emerald-100 px-3 py-2"
                  >
                    <span className="text-emerald-600 shrink-0 font-medium">✓</span>
                    <span>{stripHtmlFromText(raw)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="rounded-xl border border-amber-200/90 bg-amber-50/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 border border-amber-200/80">
              <Lightbulb className="size-4 text-amber-700" strokeWidth={1.25} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">What to do next</p>
              <p className="text-[11px] text-muted-foreground">Tailored ideas for this role</p>
            </div>
          </div>
          <ol className="space-y-2">
            {suggestions.slice(0, 6).map((raw, i) => (
              <li
                key={i}
                className="flex gap-3 text-[13px] text-muted-foreground leading-relaxed rounded-lg bg-background border border-amber-100/90 px-3 py-2.5"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-900 tabular-nums border border-amber-200/80">
                  {i + 1}
                </span>
                <span className="pt-0.5">{stripHtmlFromText(raw)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Keywords */}
      <div className="space-y-2">
        {keywordsFound.length > 0 && (
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4">
            <div className="mb-2 flex items-center gap-2">
              <ListChecks className="size-4 text-emerald-600 shrink-0" strokeWidth={1.25} />
              <span className="text-xs font-semibold text-foreground">
                Matched in your resume ({keywordsFound.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {keywordsFound.slice(0, 14).map((kw) => (
                <span key={kw} className={cn(chip, "border-emerald-200 bg-emerald-50 text-emerald-900")}>
                  {stripHtmlFromText(kw)}
                </span>
              ))}
              {keywordsFound.length > 14 && (
                <span className="text-[11px] text-muted-foreground self-center">+{keywordsFound.length - 14} more</span>
              )}
            </div>
          </div>
        )}

        {keywordsMissing.length > 0 && (
          <div className="rounded-xl border border-border bg-muted/25 p-4">
            <div className="mb-2 flex items-center gap-2">
              <ListPlus className="size-4 text-muted-foreground shrink-0" strokeWidth={1.25} />
              <span className="text-xs font-medium text-foreground">
                Gaps vs job description ({keywordsMissing.length})
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
              Terms from the posting you could reflect in skills or bullets—only where truthful.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {keywordsMissing.slice(0, 14).map((kw) => (
                <span key={kw} className={chip}>
                  {stripHtmlFromText(kw)}
                </span>
              ))}
              {keywordsMissing.length > 14 && (
                <span className="text-[11px] text-muted-foreground self-center">
                  +{keywordsMissing.length - 14} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* How AI edited the document */}
      {improvements.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/25 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-primary shrink-0" strokeWidth={1.25} />
            <span className="text-xs font-semibold text-foreground">How AI improved the resume</span>
          </div>
          <ul className="space-y-2">
            {improvements.slice(0, 8).map((imp, i) => (
              <li key={i} className="flex gap-2.5 text-[12px] text-muted-foreground leading-relaxed">
                <span className="text-emerald-600 shrink-0 font-medium">✓</span>
                {stripHtmlFromText(imp)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isPaidActive && (
        <div className="rounded-xl border border-border bg-card/30 px-3 py-3">
          <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
            On trial: one optimization per UTC day. After billing starts, runs are unlimited while your subscription is
            active—or manage your plan anytime.
          </p>
          <Button asChild size="sm" variant="outline" className="w-full rounded-full text-xs h-9 border-border">
            <Link href="/profile">Billing &amp; plan</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
