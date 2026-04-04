"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserSubscriptionState } from "@/hooks/use-user-subscription";
import {
  builderPlanLoadingHint,
  builderPlanNoAccessCta,
  builderPlanNoAccessLine,
  builderPlanTrialLine,
  manageBillingHref,
} from "@/lib/pricing/planDisplay";

type Props = {
  subscription: UserSubscriptionState;
  className?: string;
};

/**
 * Single plan summary for the builder — avoids duplicating sidebar + inline subscription banners.
 */
export function BuilderPlanStatus({ subscription, className }: Props) {
  const router = useRouter();

  if (!subscription.authReady || (subscription.isLoggedIn && !subscription.profileReady)) {
    return (
      <div
        className={cn(
          "mb-6 rounded-2xl border border-border bg-muted/20 px-4 py-3.5",
          className
        )}
      >
        <div className="h-4 w-48 max-w-full rounded bg-muted/80 animate-pulse" aria-hidden />
        <p className="sr-only">{builderPlanLoadingHint}</p>
      </div>
    );
  }

  if (!subscription.hasPaidAccess) {
    return (
      <div
        className={cn(
          "mb-6 rounded-2xl border border-border bg-muted/30 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
          className
        )}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">{builderPlanNoAccessLine}</span> {builderPlanNoAccessCta}
        </p>
        <Button
          size="sm"
          className="shrink-0 rounded-full min-h-10 px-5 w-full sm:w-auto"
          onClick={() => router.push("/pricing")}
        >
          View plans
        </Button>
      </div>
    );
  }

  if (subscription.isTrialing) {
    return (
      <div
        className={cn(
          "mb-6 rounded-2xl border border-primary/20 bg-primary/[0.04] px-4 py-3.5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2",
          className
        )}
      >
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
          <span className="text-foreground font-medium">Trial active</span>
          {subscription.trialEndLabel ? ` · ends ${subscription.trialEndLabel}.` : "."}{" "}
          {builderPlanTrialLine}
        </p>
        <Link
          href={manageBillingHref}
          className="text-sm font-medium text-primary hover:underline shrink-0"
        >
          Manage billing
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mb-6 rounded-2xl border border-primary/15 bg-primary/[0.04] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        <span className="text-foreground font-medium">Pro · unlimited optimizations</span> while your subscription
        is active.
      </p>
      <Link href={manageBillingHref} className="text-sm font-medium text-primary hover:underline shrink-0">
        Manage billing
      </Link>
    </div>
  );
}
