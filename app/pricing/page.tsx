"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Zap, Crown, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { cn } from "@/lib/utils";
import { startStripeCheckout } from "@/lib/stripe/startCheckout";
import {
  pricingHero,
  pricingFaqs,
  faqSectionTitle,
  pricingHeroLoggedInNoSub,
  pricingHeroProfileLoading,
  pricingHeroSubscriberLine,
  pricingTierOrder,
  tierDefinitions,
  type PricingTierDefinition,
} from "@/lib/pricing/planDisplay";
import { useUserSubscription } from "@/hooks/use-user-subscription";
import { PricingTierActions } from "@/components/pricing/PricingTierActions";

function TierIcon({ icon }: { icon: PricingTierDefinition["icon"] }) {
  const cls = "w-5 h-5";
  if (icon === "zap") return <Zap className={cn(cls, "text-muted-foreground")} />;
  if (icon === "crown") return <Crown className={cn(cls, "text-amber-400")} />;
  return <Sparkles className={cn(cls, "text-primary")} />;
}

function iconWrapClass(tier: PricingTierDefinition) {
  if (tier.id === "monthly") return "bg-amber-500/10 border border-amber-500/20";
  return "bg-primary/10 border border-primary/20";
}

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<null | "month" | "year">(null);
  const { toast } = useToast();
  const subscription = useUserSubscription();

  const checkoutCtx =
    subscription.isLoggedIn && subscription.userId
      ? { userId: subscription.userId, email: subscription.userEmail }
      : undefined;

  const handleUpgrade = async (plan: "month" | "year") => {
    setLoadingPlan(plan);
    try {
      const { ok, error } = await startStripeCheckout(plan, checkoutCtx);
      if (!ok) {
        toast({
          title: "Checkout couldn’t start",
          description: error || "Please try again.",
          variant: "destructive",
          duration: typeof error === "string" && error.length > 120 ? 14_000 : 6_000,
        });
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  const heroSubtitle =
    !subscription.authReady || (subscription.isLoggedIn && !subscription.profileReady)
      ? pricingHeroProfileLoading
      : subscription.isLoggedIn && subscription.hasPaidAccess
        ? pricingHeroSubscriberLine(subscription.isTrialing, subscription.trialEndLabel)
        : subscription.isLoggedIn && !subscription.hasPaidAccess
          ? pricingHeroLoggedInNoSub
          : pricingHero.subtitle;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-medium mb-6"
            >
              <Zap className="w-3.5 h-3.5" />
              {pricingHero.eyebrow}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4"
            >
              {pricingHero.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              {heroSubtitle}
            </motion.p>
            {subscription.authReady &&
              !subscription.isLoggedIn &&
              subscription.profileReady && (
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-muted-foreground text-sm max-w-2xl mx-auto mt-4"
                >
                  New here?{" "}
                  <Link href="/auth/signup" className="font-medium text-primary underline-offset-4 hover:underline">
                    Create an account
                  </Link>{" "}
                  — then pick monthly or yearly for a 3-day trial (card at checkout).
                </motion.p>
              )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-20 max-w-4xl mx-auto">
            {pricingTierOrder.map((tierId, idx) => {
              const tier = tierDefinitions[tierId];
              const delay = 0.2 + idx * 0.08;
              const checkoutKey = tier.checkoutPlan;

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay }}
                  className={cn(
                    "relative bg-card border rounded-2xl p-8 flex flex-col overflow-hidden",
                    tier.highlight ? "border-primary/50 ring-2 ring-primary/15" : "border-border"
                  )}
                >
                  {tier.badges && tier.badges.length > 0 && (
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                      {tier.badges.map((b) => (
                        <span
                          key={b.label}
                          className={cn(
                            "px-2.5 py-1 text-[10px] font-bold rounded-full",
                            b.variant === "primary"
                              ? "bg-primary text-primary-foreground"
                              : "bg-amber-500 text-white"
                          )}
                        >
                          {b.label}
                        </span>
                      ))}
                    </div>
                  )}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
                      iconWrapClass(tier)
                    )}
                  >
                    <TierIcon icon={tier.icon} />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{tier.displayName}</h2>
                  <p className="text-muted-foreground text-sm mt-1 mb-6">{tier.tagline}</p>
                  <div className="mb-6">
                    {tier.priceSuffix ? (
                      <>
                        <span className="text-4xl font-bold text-foreground">{tier.priceAmount}</span>
                        <span className="text-muted-foreground ml-2 text-sm">{tier.priceSuffix}</span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold text-foreground">{tier.priceAmount}</span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.featuresDetailed.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <CheckCircle
                          className={cn(
                            "w-4 h-4 shrink-0 mt-0.5",
                            tier.id === "monthly" ? "text-amber-500/90" : "text-primary"
                          )}
                        />
                        <span className="text-muted-foreground text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <PricingTierActions
                    tier={tier}
                    loadingPlan={loadingPlan}
                    onCheckout={handleUpgrade}
                    subscriptionLoading={subscription.loading}
                    isLoggedIn={subscription.isLoggedIn}
                    hasPaidAccess={subscription.hasPaidAccess}
                  />
                  {tier.footerNote && subscription.profileReady && !subscription.hasPaidAccess ? (
                    <p className="text-center text-muted-foreground/50 text-xs mt-3">{tier.footerNote}</p>
                  ) : null}
                  {tier.footerNote && subscription.profileReady && subscription.hasPaidAccess && checkoutKey ? (
                    <p className="text-center text-muted-foreground/50 text-xs mt-3">
                      Change or cancel in the billing portal.
                    </p>
                  ) : null}
                </motion.div>
              );
            })}
          </div>

          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">{faqSectionTitle}</h2>
            <div className="space-y-4">
              {pricingFaqs.map((item, i) => (
                <motion.div
                  key={item.q}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card border border-border rounded-xl p-5"
                >
                  <h3 className="text-foreground font-medium mb-2">{item.q}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
