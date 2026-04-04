"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserSubscriptionState } from "@/hooks/use-user-subscription";
import {
  builderPlanLoadingHint,
  builderPlanNoAccessCompact,
  builderPlanNoAccessCta,
  builderPlanNoAccessLine,
  builderPlanTrialLine,
  builderPlanWelcomeCapCompact,
  builderPlanWelcomeDailyWaitCompact,
  builderPlanWelcomeDailyWaitLine,
  builderPlanWelcomeEndedCompact,
  builderPlanWelcomeLine,
  manageBillingHref,
} from "@/lib/pricing/planDisplay";

type Props = {
  subscription: UserSubscriptionState;
  className?: string;
  /** Tighter layout and shorter copy for the builder header. */
  compact?: boolean;
};

/**
 * Single plan summary for the builder — avoids duplicating sidebar + inline subscription banners.
 */
export function BuilderPlanStatus({ subscription, className, compact }: Props) {
  const router = useRouter();

  const box = (children: ReactNode, tone: "muted" | "primary" | "pro" = "muted") =>
    compact ? (
      <div
        className={cn(
          "mb-4 rounded-lg border px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs leading-snug",
          tone === "muted" && "border-border/80 bg-muted/25",
          tone === "primary" && "border-primary/20 bg-primary/[0.04]",
          tone === "pro" && "border-primary/15 bg-primary/[0.03]",
          className
        )}
      >
        {children}
      </div>
    ) : (
      <div
        className={cn(
          "mb-6 rounded-2xl border px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
          tone === "muted" && "border-border bg-muted/30",
          tone === "primary" && "border-primary/20 bg-primary/[0.04]",
          tone === "pro" && "border-primary/15 bg-primary/[0.04]",
          className
        )}
      >
        {children}
      </div>
    );

  if (!subscription.authReady || (subscription.isLoggedIn && !subscription.profileReady)) {
    return (
      <div
        className={cn(
          compact ? "mb-4 h-8 rounded-lg bg-muted/40 animate-pulse" : "mb-6 rounded-2xl border border-border bg-muted/20 px-4 py-3.5",
          className
        )}
      >
        {!compact && (
          <>
            <div className="h-4 w-48 max-w-full rounded bg-muted/80 animate-pulse" aria-hidden />
            <p className="sr-only">{builderPlanLoadingHint}</p>
          </>
        )}
        {compact && <p className="sr-only">{builderPlanLoadingHint}</p>}
      </div>
    );
  }

  const blocked = subscription.freePlanBlockedCode;

  if (!subscription.hasOptimizationAccess && blocked === "free_daily_limit") {
    return box(
      <>
        <p className={cn("text-muted-foreground flex-1", compact ? "text-xs" : "text-sm leading-relaxed")}>
          {compact ? (
            <span className="text-foreground/90">{builderPlanWelcomeDailyWaitCompact}</span>
          ) : (
            <span className="text-foreground/90">{builderPlanWelcomeDailyWaitLine}</span>
          )}
        </p>
        <Link
          href="/pricing"
          className={cn("font-medium text-primary hover:underline shrink-0", compact && "text-xs")}
        >
          Upgrade
        </Link>
      </>,
      "primary"
    );
  }

  if (!subscription.hasOptimizationAccess && blocked === "free_cap_exceeded") {
    return box(
      <>
        <p className={cn("text-muted-foreground flex-1", compact ? "text-xs" : "text-sm leading-relaxed")}>
          <span className="text-foreground/90">{builderPlanWelcomeCapCompact}</span>
        </p>
        <Button
          size="sm"
          className={cn("shrink-0 rounded-full", compact ? "h-8 px-4 text-xs" : "min-h-10 px-5 w-full sm:w-auto")}
          onClick={() => router.push("/pricing")}
        >
          View plans
        </Button>
      </>,
      "muted"
    );
  }

  if (!subscription.hasOptimizationAccess && blocked === "free_trial_ended") {
    return box(
      <>
        <p className={cn("text-muted-foreground flex-1", compact ? "text-xs" : "text-sm leading-relaxed")}>
          <span className="text-foreground/90">{builderPlanWelcomeEndedCompact}</span>
        </p>
        <Button
          size="sm"
          className={cn("shrink-0 rounded-full", compact ? "h-8 px-4 text-xs" : "min-h-10 px-5 w-full sm:w-auto")}
          onClick={() => router.push("/pricing")}
        >
          View plans
        </Button>
      </>,
      "muted"
    );
  }

  if (!subscription.hasOptimizationAccess) {
    return box(
      <>
        <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm leading-relaxed")}>
          {compact ? (
            <span className="text-foreground/90">{builderPlanNoAccessCompact}</span>
          ) : (
            <>
              <span className="text-foreground font-medium">{builderPlanNoAccessLine}</span> {builderPlanNoAccessCta}
            </>
          )}
        </p>
        <Button
          size="sm"
          className={cn("shrink-0 rounded-full", compact ? "h-8 px-4 text-xs" : "min-h-10 px-5 w-full sm:w-auto")}
          onClick={() => router.push("/pricing")}
        >
          View plans
        </Button>
      </>,
      "muted"
    );
  }

  if (subscription.isWelcome && !subscription.hasPaidAccess) {
    return box(
      <>
        <p className={cn("text-muted-foreground flex-1", compact ? "text-xs" : "text-sm leading-relaxed")}>
          {compact ? (
            <>
              <span className="font-medium text-foreground">Free</span>
              {subscription.welcomeDaysLeft > 0
                ? ` · ~${subscription.welcomeDaysLeft}d left · `
                : " · "}
              1/day, max 3 runs. Upgrade for unlimited.
            </>
          ) : (
            <>
              <span className="text-foreground font-medium">Welcome period</span>
              {subscription.welcomeDaysLeft > 0
                ? ` · about ${subscription.welcomeDaysLeft} day${subscription.welcomeDaysLeft === 1 ? "" : "s"} left in your free window. `
                : " "}
              {builderPlanWelcomeLine}
            </>
          )}
        </p>
        <Link
          href="/pricing"
          className={cn("font-medium text-primary hover:underline shrink-0", compact && "text-xs")}
        >
          Upgrade
        </Link>
      </>,
      "primary"
    );
  }

  if (subscription.isTrialing) {
    return box(
      <>
        <p className={cn("text-muted-foreground flex-1", compact ? "text-xs" : "text-sm leading-relaxed")}>
          <span className="font-medium text-foreground">Trial</span>
          {subscription.trialEndLabel ? ` · ends ${subscription.trialEndLabel}. ` : ". "}
          {compact ? "1 optimization per UTC day." : builderPlanTrialLine}
        </p>
        <Link
          href={manageBillingHref}
          className={cn("font-medium text-primary hover:underline shrink-0", compact && "text-xs")}
        >
          Billing
        </Link>
      </>,
      "primary"
    );
  }

  return box(
    <>
      <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>
        <span className="font-medium text-foreground">Pro</span>
        {compact ? " · unlimited" : " · unlimited optimizations while your subscription is active."}
      </p>
      <Link href={manageBillingHref} className={cn("font-medium text-primary hover:underline shrink-0", compact && "text-xs")}>
        Billing
      </Link>
    </>,
    "pro"
  );
}
