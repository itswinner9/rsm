/**
 * User-visible pricing copy. Checkout uses Stripe plans `month` | `year` (card required; no Stripe trial period).
 */

export type CheckoutPlanId = "month" | "year";

export type TierIcon = "zap" | "crown" | "sparkles";

export type TierBadgeVariant = "primary" | "amber";

export interface TierBadge {
  label: string;
  variant: TierBadgeVariant;
}

export interface PricingTierDefinition {
  /** UI id */
  id: "starter" | "monthly" | "yearly";
  displayName: string;
  tagline: string;
  /** e.g. "$0" / "$9.99" */
  priceAmount: string;
  /** e.g. "From" / "/ month" */
  priceSuffix: string;
  featuresDetailed: string[];
  featuresHome: string[];
  ctaLabel: string;
  /** Paid tiers only */
  checkoutPlan?: CheckoutPlanId;
  signupHref?: string;
  badges?: TierBadge[];
  /** Highlighted card (ring) */
  highlight?: boolean;
  icon: TierIcon;
  footerNote?: string;
}

export const pricingHero = {
  eyebrow: "Plans · resumify.cc",
  title: "Invest in interviews—not ignored applications",
  subtitle:
    "Tailor your real experience to every job description: match scoring on the text you paste, clearer wording, PDF or DOCX export, and your run history on the dashboard. Monthly or yearly in CAD—yearly saves about $20 vs twelve monthly payments for the same features.",
};

/** Shown while session or profile is loading so we don’t flash guest-only copy to signed-in users. */
export const pricingHeroProfileLoading = "Checking your account…";

export const homePricingHero = {
  eyebrow: "Plans · resumify.cc",
  title: "A small monthly fee vs. months of silence",
  subtitle:
    "Pay by card at checkout (CAD). While you’re subscribed: unlimited optimizations and your resume history on the dashboard. Yearly saves ~$20 vs paying monthly—same features. Prices in CAD via Stripe.",
};

export const homePricingHeroProfileLoading = pricingHeroProfileLoading;

export const tierDefinitions: Record<PricingTierDefinition["id"], PricingTierDefinition> = {
  starter: {
    id: "starter",
    displayName: "How it works",
    tagline: "Card at checkout — billed in CAD",
    priceAmount: "From",
    priceSuffix: "$9.99/mo",
    featuresDetailed: [
      "Create an account, then choose Monthly or Yearly",
      "Pay securely with Stripe Checkout",
      "Unlimited optimizations while your subscription is active",
      "Cancel or switch plans in the billing portal",
    ],
    featuresHome: [
      "Stripe Checkout — secure, PCI-compliant",
      "$9.99/mo or $99.99/yr CAD",
      "Unlimited runs while subscribed",
    ],
    ctaLabel: "Create account",
    signupHref: "/auth/signup",
    icon: "zap",
    footerNote: "Then choose Monthly or Yearly on the plans page.",
  },
  monthly: {
    id: "monthly",
    displayName: "Monthly",
    tagline: "Flexible — stay month-to-month while you search",
    priceAmount: "$9.99",
    priceSuffix: "/ month CAD",
    featuresDetailed: [
      "Billed every month in CAD — cancel anytime from the billing portal",
      "Unlimited resume optimizations and PDF or DOCX exports while subscribed",
      "Dashboard history: past runs, downloads, and saved versions",
      "AI help for bullets, summaries, and headlines — grounded in what you uploaded",
      "Keyword alignment and match scoring for each job description you paste",
      "Full template library — same story, multiple professional layouts",
      "Update your card or plan in the Stripe billing portal",
    ],
    featuresHome: [
      "Billed monthly in CAD",
      "Unlimited optimizations · full history on your dashboard",
      "Cancel anytime from the billing portal",
    ],
    ctaLabel: "Start monthly",
    checkoutPlan: "month",
    badges: [{ label: "Flexible", variant: "amber" }],
    icon: "crown",
    footerNote: "Secure checkout via Stripe.",
  },
  yearly: {
    id: "yearly",
    displayName: "Yearly",
    tagline: "Best value — save ~$20/yr vs paying monthly (same features)",
    priceAmount: "$99.99",
    priceSuffix: "/ year CAD",
    featuresDetailed: [
      "Billed once per year in CAD — about $8.33/mo effective (save ~$20 vs 12× monthly)",
      "Unlimited resume optimizations and PDF or DOCX exports while subscribed",
      "Dashboard history: past runs, downloads, and saved versions",
      "AI help for bullets, summaries, and headlines — grounded in what you uploaded",
      "Keyword alignment and match scoring for each job description you paste",
      "Full template library — same story, multiple professional layouts",
      "Update your card or plan in the Stripe billing portal",
    ],
    featuresHome: [
      "Billed yearly in CAD (~$8.33/mo effective)",
      "Unlimited optimizations · full history on your dashboard",
      "Same everything as Monthly — lower annual price",
    ],
    ctaLabel: "Start yearly",
    checkoutPlan: "year",
    badges: [
      { label: "SAVE", variant: "primary" },
      { label: "Best value", variant: "amber" },
    ],
    highlight: true,
    icon: "sparkles",
    footerNote: "One annual charge. Receipts in the billing portal.",
  },
};

/** Paid tiers only (two-column pricing; trial story is in the hero, not a third “starter” card). */
export const pricingTierOrder: PricingTierDefinition["id"][] = ["monthly", "yearly"];

/** Builder plan strip — loading (screen reader). */
export const builderPlanLoadingHint = "Loading your plan";

/** Builder — no paid access yet (non-compact). */
export const builderPlanNoAccessLine = "No plan yet.";

export const builderPlanNoAccessCta =
  "Subscribe on Plans (card at checkout): $9.99/mo or $99.99/yr CAD.";

/** Builder compact strip — one short line + CTA. */
export const builderPlanNoAccessCompact = "No plan yet — open Plans to subscribe.";

/** Free welcome window: already ran today (UTC). */
export const builderPlanWelcomeDailyWaitCompact =
  "You’ve used today’s free run (UTC). Back tomorrow—or upgrade for unlimited runs.";

export const builderPlanWelcomeDailyWaitLine =
  "You’ve used your free optimization for today (UTC). Come back tomorrow, or upgrade for unlimited runs.";

/** Free welcome: 3 runs used. */
export const builderPlanWelcomeCapCompact =
  "All 3 free runs used. Upgrade for unlimited optimizations and saved resumes.";

/** Free welcome window ended (72h). */
export const builderPlanWelcomeEndedCompact =
  "Your welcome window ended. Subscribe on Plans for unlimited runs and storage.";

/** Builder — trialing. */
export const builderPlanTrialLine = "One optimization per UTC calendar day while trialing.";

/** Builder — free plan (3-day window from first free run, no card). */
export const builderPlanWelcomeLine =
  "Welcome: one free optimization per UTC day (up to 3 total in your first 3 days from your first free run). Upgrade anytime for unlimited runs.";

/** Hero line when logged in but not yet subscribed (pricing + home #pricing). */
export const pricingHeroLoggedInNoSub =
  "You’re signed in — pick monthly or yearly and check out with your card (CAD).";

/** Hero line when user already has trialing or active access. */
export function pricingHeroSubscriberLine(isTrialing: boolean, trialEndLabel: string | null): string {
  if (isTrialing && trialEndLabel) {
    return `Your trial is on this account (ends ${trialEndLabel}). Change billing or plan under Manage billing — no second checkout.`;
  }
  return "You’re subscribed — update payment, plan, or receipts via Manage billing. No need to check out again.";
}

export const manageBillingLabel = "Manage billing";
export const manageBillingHref = "/profile";
export const dashboardHref = "/dashboard";
export const builderHref = "/builder";
export const starterCtaLoggedInLabel = "Open resume builder";
export const starterCtaSubscriberLabel = "Manage plan";

export const faqSectionTitle = "Common questions";

export const pricingFaqs: { q: string; a: string }[] = [
  {
    q: "Do you “beat” applicant tracking systems?",
    a: "No—and anyone who promises that across every employer’s tools isn’t being straight with you. Resumify compares your resume to the job description you paste (keyword overlap) and helps you write more clearly for that role. After you upload, the employer’s process applies—we don’t control or reverse-engineer it.",
  },
  {
    q: "Why match my resume to the job posting?",
    a: "Hiring teams start from the role’s text. If your resume doesn’t reflect important language from the posting—or is hard to read—your fit can be missed. We help you tune one truthful resume to the description you provide, then preview it in several layouts (same facts, different structure) and export PDF or DOCX from whichever you prefer.",
  },
  {
    q: "Will you invent jobs, skills, or credentials on my resume?",
    a: "No. We improve how your real experience reads and align phrasing with the role you’re targeting. Employers, titles, dates, education, and certifications stay grounded in what you uploaded. Always review before you apply.",
  },
  {
    q: "How do I cancel or change my plan?",
    a: "Open Manage billing (Stripe Customer Portal) from your account. You keep access through the period you’ve already paid for.",
  },
  {
    q: "What’s the difference between Monthly and Yearly?",
    a: "Same features: unlimited optimizations while your subscription is active. Monthly charges each month in CAD; Yearly charges once per year at a lower effective rate (about $20 less than twelve monthly payments). Pick what fits your search.",
  },
  {
    q: "When am I charged?",
    a: "You pay in Stripe Checkout with your card. After that, billing follows the plan you chose (monthly or yearly in CAD)—exact totals are on the checkout screen before you confirm. Change or cancel anytime in the billing portal.",
  },
];
