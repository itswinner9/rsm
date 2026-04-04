"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PricingTierDefinition } from "@/lib/pricing/planDisplay";
import {
  builderHref,
  dashboardHref,
  manageBillingHref,
  manageBillingLabel,
  starterCtaLoggedInLabel,
  starterCtaSubscriberLabel,
} from "@/lib/pricing/planDisplay";

type Props = {
  tier: PricingTierDefinition;
  loadingPlan: "month" | "year" | null;
  onCheckout: (plan: "month" | "year") => void;
  subscriptionLoading: boolean;
  isLoggedIn: boolean;
  hasPaidAccess: boolean;
};

export function PricingTierActions({
  tier,
  loadingPlan,
  onCheckout,
  subscriptionLoading,
  isLoggedIn,
  hasPaidAccess,
}: Props) {
  const isStarter = tier.id === "starter";
  const checkoutKey = tier.checkoutPlan;

  if (subscriptionLoading) {
    return <div className="w-full h-10 rounded-xl bg-muted/80 animate-pulse" aria-hidden />;
  }

  if (isStarter && tier.signupHref) {
    if (!isLoggedIn) {
      return (
        <Button asChild variant="outline" className="w-full rounded-xl">
          <Link href={tier.signupHref}>
            {tier.ctaLabel} <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      );
    }
    if (hasPaidAccess) {
      return (
        <Button asChild variant="outline" className="w-full rounded-xl">
          <Link href={manageBillingHref}>
            {starterCtaSubscriberLabel} <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      );
    }
    return (
      <Button asChild variant="outline" className="w-full rounded-xl">
        <Link href={builderHref}>
          {starterCtaLoggedInLabel} <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    );
  }

  if (checkoutKey) {
    if (hasPaidAccess) {
      return (
        <div className="flex flex-col gap-2 w-full">
          <Button asChild className="w-full rounded-xl">
            <Link href={manageBillingHref}>{manageBillingLabel}</Link>
          </Button>
          <Button asChild variant="outline" className="w-full rounded-xl">
            <Link href={dashboardHref}>Dashboard</Link>
          </Button>
        </div>
      );
    }
    return (
      <Button
        type="button"
        onClick={() => onCheckout(checkoutKey)}
        disabled={loadingPlan !== null}
        className="w-full rounded-xl"
      >
        {loadingPlan === checkoutKey ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            {tier.ctaLabel} <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    );
  }

  return null;
}
