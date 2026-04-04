/**
 * User-visible pricing copy. Checkout uses Stripe plans `month` | `year` (3-day card trial).
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
  /** e.g. "3-day trial" / "/ month" */
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
    "Resumify aligns your real experience to each job description you paste—match scoring against that text, cleaner wording, and exports to PDF or DOCX. Subscribers get resume storage—past runs and downloads on your dashboard. Yearly billing saves about $20 vs paying monthly for the same features. Start with a 3-day trial (card at checkout), then monthly or yearly in CAD.",
};

/** Shown while session or profile is loading so we don’t flash guest-only copy to signed-in users. */
export const pricingHeroProfileLoading = "Checking your account…";

export const homePricingHero = {
  eyebrow: "Plans · resumify.cc",
  title: "A few dollars a month vs. months of silence",
  subtitle:
    "Subscribe with a card to start your 3-day trial (card required at checkout): one optimization per UTC day while trialing, then unlimited while your subscription is active. Yearly saves about $20 vs paying monthly for the same features—including resume storage of your runs on the dashboard. All prices in CAD via Stripe.",
};

export const homePricingHeroProfileLoading = pricingHeroProfileLoading;

export const tierDefinitions: Record<PricingTierDefinition["id"], PricingTierDefinition> = {
  starter: {
    id: "starter",
    displayName: "How it works",
    tagline: "Card required — trial, then your chosen plan",
    /** Non-breaking space avoids "3-daytrial" if styles collapse normal spaces. */
    priceAmount: "3-day\u00a0trial",
    priceSuffix: "",
    featuresDetailed: [
      "Add a payment method to start (no charge until the trial ends)",
      "During trial: 1 optimization per calendar day (UTC)",
      "After trial: unlimited optimizations on an active subscription",
      "Cancel or change plan in the Stripe billing portal",
    ],
    featuresHome: [
      "Stripe Checkout — secure, PCI-compliant",
      "Trial then $9.99/mo or $99.99/yr CAD",
      "1 run per UTC day on trial, then unlimited",
    ],
    ctaLabel: "Create account",
    signupHref: "/auth/signup",
    icon: "zap",
    footerNote: "Then pick Monthly or Yearly on the plans page.",
  },
  monthly: {
    id: "monthly",
    displayName: "Monthly",
    tagline: "Flexible — stay as long as your search lasts",
    priceAmount: "$9.99",
    priceSuffix: "/ month CAD",
    featuresDetailed: [
      "Everything after trial, including:",
      "Unlimited optimizations & exports while subscribed",
      "Resume storage: past runs & downloads on your dashboard",
      "AI bullet, summary & headline tools",
      "Job-description keyword alignment & match scoring",
      "Full template library · PDF & DOCX",
      "Manage or cancel in the billing portal",
    ],
    featuresHome: [
      "3-day trial with card, then monthly billing",
      "Unlimited runs after trial · resume history on your dashboard",
      "Cancel anytime from billing portal",
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
    tagline: "Best value — save ~$20/yr vs monthly (same features)",
    priceAmount: "$99.99",
    priceSuffix: "/ year CAD",
    featuresDetailed: [
      "Same product as Monthly — about $8.33/mo effective vs $9.99/mo",
      "3-day trial, then yearly billing in CAD",
      "Unlimited optimizations while subscribed",
      "Resume storage: past runs & exports on your dashboard",
      "AI rewrites, templates, match insights, exports",
      "Receipts & payment method in Stripe portal",
    ],
    featuresHome: [
      "~$20 less per year than 12× monthly — same unlimited access",
      "3-day trial then annual billing",
      "Resume history & downloads on your dashboard",
    ],
    ctaLabel: "Start yearly",
    checkoutPlan: "year",
    badges: [
      { label: "SAVE", variant: "primary" },
      { label: "Best value", variant: "amber" },
    ],
    highlight: true,
    icon: "sparkles",
    footerNote: "Billed once per year. Manage in Stripe Customer Portal.",
  },
};

/** Paid tiers only (two-column pricing; trial story is in the hero, not a third “starter” card). */
export const pricingTierOrder: PricingTierDefinition["id"][] = ["monthly", "yearly"];

/** Builder plan strip — loading (screen reader). */
export const builderPlanLoadingHint = "Loading your plan";

/** Builder — no paid access yet (non-compact). */
export const builderPlanNoAccessLine = "No plan yet.";

export const builderPlanNoAccessCta =
  "Start a 3-day trial on Plans (card on file), then $9.99/mo or $99.99/yr CAD.";

/** Builder compact strip — one short line + CTA. */
export const builderPlanNoAccessCompact = "No plan yet — start a 3-day trial on Plans.";

/** Free welcome window: already ran today (UTC). */
export const builderPlanWelcomeDailyWaitCompact =
  "Welcome: you used today’s free credit (UTC). Come back tomorrow or upgrade for unlimited runs.";

export const builderPlanWelcomeDailyWaitLine =
  "You’ve used your free optimization for today (UTC). Come back tomorrow, or upgrade for unlimited runs.";

/** Free welcome: 3 runs used. */
export const builderPlanWelcomeCapCompact =
  "You’ve used all 3 free runs. Upgrade for unlimited optimizations and resume storage.";

/** Free welcome window ended (72h). */
export const builderPlanWelcomeEndedCompact =
  "Your free window has ended. Subscribe on Plans for unlimited runs and stored resumes.";

/** Builder — trialing. */
export const builderPlanTrialLine = "One optimization per UTC calendar day while trialing.";

/** Builder — free plan (3-day window from first free run, no card). */
export const builderPlanWelcomeLine =
  "Welcome: one free optimization per UTC day, up to 3 uses within 3 days from your first free run. Upgrade anytime for unlimited runs.";

/** Hero line when logged in but not yet subscribed (pricing + home #pricing). */
export const pricingHeroLoggedInNoSub =
  "You're signed in — choose monthly or yearly to start your 3-day trial (card on file). No charge until the trial ends.";

/** Hero line when user already has trialing or active access. */
export function pricingHeroSubscriberLine(isTrialing: boolean, trialEndLabel: string | null): string {
  if (isTrialing && trialEndLabel) {
    return `Your trial is on this account (ends ${trialEndLabel}). Billing and plan changes are in your profile — no need to subscribe again.`;
  }
  return "Your plan is active on this account. Manage billing or change plans from your profile — no second subscription needed.";
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
    a: "No—and anyone who promises that across hundreds of different employer tools isn’t being straight with you. Resumify compares your resume to the job description you paste (keyword overlap) and helps you write more clearly for that role. What happens after you upload depends on that employer’s process, which we don’t control or reverse-engineer.",
  },
  {
    q: "Why match my resume to the job posting?",
    a: "Hiring teams often start from the text of the role. If your resume doesn’t reflect important language from the posting—or is hard to read—your fit can be missed. We help you tune one truthful resume to the description you provide. We show it in five layouts (same facts and wording, different visual structure) so you can pick the look you like and export PDF or DOCX from any layout.",
  },
  {
    q: "Will you invent jobs, skills, or credentials on my resume?",
    a: "No. We improve how your real experience is written and align phrasing with the role you’re targeting. Employers, job titles, dates, education, and certifications stay grounded in what you uploaded. Always review the result before you apply.",
  },
  {
    q: "How do I cancel or change my plan?",
    a: "Use the Stripe Customer Portal from your account (Manage billing). You keep access through the period you’ve already paid for. Trial billing is explained at checkout.",
  },
  {
    q: "What’s the difference between Monthly and Yearly?",
    a: "Same features—unlimited optimizations while your subscription is active after the trial. Monthly bills each month in CAD; Yearly bills once per year at a lower effective monthly rate. Pick the cadence that fits your job search.",
  },
  {
    q: "How does the 3-day trial work?",
    a: "You add a card at checkout to start a 3-day trial. While in trial status, you can run one optimization per UTC calendar day. When the trial ends, your paid plan continues unless you cancel in the billing portal before then.",
  },
];
