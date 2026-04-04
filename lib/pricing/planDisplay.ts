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
    "ATS systems screen you before a human ever does. Resumify aligns your real experience to each job, shows your match score, and exports clean PDFs and DOCX. Start with a 3-day trial (card required at checkout), then stay on monthly or yearly billing in CAD.",
};

/** Shown while session or profile is loading so we don’t flash guest-only copy to signed-in users. */
export const pricingHeroProfileLoading = "Checking your account…";

export const homePricingHero = {
  eyebrow: "Plans · resumify.cc",
  title: "A few dollars a month vs. months of silence",
  subtitle:
    "Subscribe with a card to start your 3-day trial (card required at checkout): one optimization per UTC day while trialing, then unlimited while your subscription is active. Choose monthly or yearly billing—all in Canadian dollars via Stripe.",
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
      "AI bullet, summary & headline tools",
      "ATS keyword tuning & match scoring",
      "Full template library · PDF & DOCX",
      "Manage or cancel in the billing portal",
    ],
    featuresHome: [
      "3-day trial with card, then monthly billing",
      "Unlimited runs after trial while active",
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
    tagline: "Best value if you’re hiring-season ready",
    priceAmount: "$99.99",
    priceSuffix: "/ year CAD",
    featuresDetailed: [
      "Same product as Monthly — better annual price",
      "3-day trial, then yearly billing in CAD",
      "Unlimited optimizations while subscribed",
      "AI rewrites, ATS tools, templates, exports",
      "Receipts & payment method in Stripe portal",
    ],
    featuresHome: [
      "Lower effective monthly vs paying month-by-month",
      "3-day trial then annual billing",
      "Unlimited optimizations after trial",
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

export const pricingTierOrder: PricingTierDefinition["id"][] = ["starter", "monthly", "yearly"];

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
export const starterCtaLoggedInLabel = "Open builder";
export const starterCtaSubscriberLabel = "Manage plan";

export const faqSectionTitle = "Common questions";

export const pricingFaqs: { q: string; a: string }[] = [
  {
    q: "What is an ATS—and why should I care?",
    a: "Most employers use Applicant Tracking Systems to scan and rank applications before a person reads them. If your file isn’t easy for those systems to parse—or doesn’t reflect important keywords from the posting—it can be filtered out even when you’re a strong match. Resumify helps you tune one truthful resume so both software and hiring managers can see your fit.",
  },
  {
    q: "Do I get three different resumes?",
    a: "No. You get one ATS-focused master resume tailored to the job description you provide. We show it in three layouts (same facts and wording, different visual structure) so you can pick the look you like and export PDF or DOCX from any layout.",
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
