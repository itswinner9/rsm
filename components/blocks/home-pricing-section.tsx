"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Crown, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { startStripeCheckout } from "@/lib/stripe/startCheckout";
import {
  homePricingHero,
  homePricingHeroProfileLoading,
  pricingHeroLoggedInNoSub,
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

export function HomePricingSection() {
  const [loading, setLoading] = useState<null | "month" | "year">(null);
  const { toast } = useToast();
  const subscription = useUserSubscription();

  const handleUpgrade = async (plan: "month" | "year") => {
    setLoading(plan);
    try {
      const { ok, error } = await startStripeCheckout(plan);
      if (!ok) {
        toast({
          title: "Checkout couldn’t start",
          description: error || "Please try again.",
          variant: "destructive",
          duration: error && error.length > 120 ? 14_000 : 6_000,
        });
      }
    } finally {
      setLoading(null);
    }
  };

  const heroSubtitle =
    !subscription.authReady || (subscription.isLoggedIn && !subscription.profileReady)
      ? homePricingHeroProfileLoading
      : subscription.isLoggedIn && subscription.hasPaidAccess
        ? pricingHeroSubscriberLine(subscription.isTrialing, subscription.trialEndLabel)
        : subscription.isLoggedIn && !subscription.hasPaidAccess
          ? pricingHeroLoggedInNoSub
          : homePricingHero.subtitle;

  return (
    <section id="pricing" className="bg-background py-24 px-4 sm:px-6 lg:px-8 border-t border-border/50">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-xs uppercase tracking-widest font-medium mb-4"
          >
            {homePricingHero.eyebrow}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight mb-4"
          >
            {homePricingHero.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            {heroSubtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {pricingTierOrder.map((tierId, idx) => {
            const tier = tierDefinitions[tierId];
            const isStarter = tier.id === "starter";
            const checkoutKey = tier.checkoutPlan;
            const delay = 0.1 + idx * 0.06;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
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
                          "px-2 py-0.5 text-[10px] font-bold rounded-full",
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
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      tier.id === "starter" && "bg-muted border border-border",
                      tier.id === "monthly" && "bg-amber-500/10 border border-amber-500/20",
                      tier.id === "yearly" && "bg-primary/10 border border-primary/20"
                    )}
                  >
                    <TierIcon icon={tier.icon} />
                  </div>
                  <div className="min-w-0 text-left">
                    <h3 className="text-foreground font-bold">{tier.displayName}</h3>
                    <p className="text-muted-foreground text-xs leading-snug">{tier.tagline}</p>
                  </div>
                </div>
                <div className="mb-6">
                  {tier.priceSuffix ? (
                    <>
                      <span className="text-foreground text-4xl font-bold">{tier.priceAmount}</span>
                      <span className="text-muted-foreground ml-2 text-sm">{tier.priceSuffix}</span>
                    </>
                  ) : (
                    <span className="text-foreground text-4xl font-bold">{tier.priceAmount}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.featuresHome.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle
                        className={cn(
                          "w-4 h-4 shrink-0 mt-0.5",
                          isStarter ? "text-green-400" : "text-primary"
                        )}
                      />
                      <span className="text-muted-foreground text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <PricingTierActions
                  tier={tier}
                  loadingPlan={loading}
                  onCheckout={handleUpgrade}
                  subscriptionLoading={subscription.loading}
                  isLoggedIn={subscription.isLoggedIn}
                  hasPaidAccess={subscription.hasPaidAccess}
                />
                {tier.id === "monthly" && subscription.profileReady && !subscription.hasPaidAccess ? (
                  <p className="text-center text-muted-foreground/50 text-xs mt-3">Stripe · cancel anytime</p>
                ) : tier.id === "yearly" && subscription.profileReady && !subscription.hasPaidAccess ? (
                  <p className="text-center text-muted-foreground/50 text-xs mt-3">Billed yearly in CAD</p>
                ) : tier.id === "monthly" && subscription.profileReady && subscription.hasPaidAccess ? (
                  <p className="text-center text-muted-foreground/50 text-xs mt-3">Change or cancel in the billing portal.</p>
                ) : tier.id === "yearly" && subscription.profileReady && subscription.hasPaidAccess ? (
                  <p className="text-center text-muted-foreground/50 text-xs mt-3">Change or cancel in the billing portal.</p>
                ) : null}
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/pricing"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-150 underline underline-offset-4"
          >
            See full plans & FAQs →
          </Link>
        </div>
      </div>
    </section>
  );
}
