"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Loader2,
  FileSearch,
  ScanSearch,
  Boxes,
  PenLine,
  LayoutTemplate,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type OptimizeLoadingStepDef = {
  title: string;
  hint: string;
  Icon: LucideIcon;
};

export const OPTIMIZE_LOADING_STEPS: OptimizeLoadingStepDef[] = [
  { title: "Reading your resume", hint: "Pulling roles, skills, and dates", Icon: FileSearch },
  { title: "Studying the job", hint: "Role requirements and keywords", Icon: ScanSearch },
  { title: "Structuring your profile", hint: "Clear sections recruiters can scan", Icon: Boxes },
  { title: "Tailoring the copy", hint: "One optimized version for all layouts", Icon: PenLine },
  { title: "Preparing previews", hint: "Five layouts (classic to minimal)", Icon: LayoutTemplate },
];

export function OptimizeLoadingPanel({ activeIndex }: { activeIndex: number }) {
  const total = OPTIMIZE_LOADING_STEPS.length;
  const safeIndex = Math.min(Math.max(activeIndex, 0), total - 1);
  const progressPct = ((safeIndex + 1) / total) * 100;
  const current = OPTIMIZE_LOADING_STEPS[safeIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-muted/30 shadow-lg shadow-black/[0.04]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)] pointer-events-none" />

      <div className="relative px-5 pt-6 pb-5 sm:px-6 sm:pt-7 sm:pb-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <motion.div
                className="absolute inset-0 rounded-2xl bg-primary/5"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <current.Icon className="size-5 relative z-10" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-1">
                Optimizing
              </p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={safeIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-base font-semibold text-foreground tracking-tight leading-snug">
                    {current.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{current.hint}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 rounded-full bg-muted/80 px-2.5 py-1 text-[11px] font-medium tabular-nums text-muted-foreground border border-border/80">
            <Loader2 className="size-3.5 animate-spin text-primary" strokeWidth={2} />
            <span>
              {safeIndex + 1}/{total}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
            />
          </div>
        </div>

        <ul className="space-y-0">
          {OPTIMIZE_LOADING_STEPS.map((step, i) => {
            const done = i < safeIndex;
            const active = i === safeIndex;
            const pending = i > safeIndex;
            const StepIcon = step.Icon;

            return (
              <li key={step.title}>
                <div
                  className={cn(
                    "flex items-center gap-3 py-2.5 border-t border-border/60 first:border-t-0 first:pt-0",
                    active && "bg-muted/25 -mx-2 px-2 rounded-xl border-t-0 mt-0.5 first:mt-0"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                      done && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
                      active && "border-primary/35 bg-primary/10 text-primary",
                      pending && "border-border bg-background/80 text-muted-foreground/40"
                    )}
                  >
                    {done ? (
                      <Check className="size-4" strokeWidth={2.5} />
                    ) : active ? (
                      <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                    ) : (
                      <StepIcon className="size-3.5 opacity-50" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium leading-tight transition-colors",
                        done && "text-muted-foreground line-through decoration-muted-foreground/40",
                        active && "text-foreground",
                        pending && "text-muted-foreground/45"
                      )}
                    >
                      {step.title}
                    </p>
                    <p
                      className={cn(
                        "text-[11px] mt-0.5 leading-snug transition-colors",
                        active ? "text-muted-foreground" : "text-muted-foreground/50"
                      )}
                    >
                      {step.hint}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.div>
  );
}
