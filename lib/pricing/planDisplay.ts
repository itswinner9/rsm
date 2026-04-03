/**
 * User-visible pricing copy. Checkout still uses Polar plan keys `pro` | `recruiting`.
 */

export type CheckoutPlanId = "pro" | "recruiting";

export type TierIcon = "zap" | "crown" | "sparkles";

export type TierBadgeVariant = "primary" | "amber";

export interface TierBadge {
  label: string;
  variant: TierBadgeVariant;
}

export interface PricingTierDefinition {
  /** UI id */
  id: "starter" | "flex" | "searchPass";
  displayName: string;
  tagline: string;
  /** e.g. "$0" / "$15" / "$60" */
  priceAmount: string;
  /** e.g. "one-time" / "/ month" / "/ 6 months" */
  priceSuffix: string;
  featuresDetailed: string[];
  featuresHome: string[];
  ctaLabel: string;
  /** Starter uses signup link */
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
    "ATS systems screen you before a human ever does. Resumify aligns your real experience to each job, shows your match score, and exports clean PDFs and DOCX. Start free once, then go unlimited when you’re serious about your search.",
};

export const homePricingHero = {
  eyebrow: "Plans · resumify.cc",
  title: "A few dollars a month vs. months of silence",
  subtitle:
    "Try the full flow free with Starter. Flex ($15/mo) unlocks unlimited optimizations—every new posting, new keywords, new score. Search Pass ($60/6 mo) is the lowest per-month rate if you’re in it for the season.",
};

export const tierDefinitions: Record<PricingTierDefinition["id"], PricingTierDefinition> = {
  starter: {
    id: "starter",
    displayName: "Starter",
    tagline: "See your match score before you pay anything",
    priceAmount: "$0",
    priceSuffix: "one-time",
    featuresDetailed: [
      "1 resume optimization",
      "1 ATS-optimized master resume",
      "3 visual templates (same content)",
      "PDF & DOCX download",
      "Keyword match analysis",
      "ATS score insights",
    ],
    featuresHome: [
      "1 full optimization",
      "1 master resume + 3 templates",
      "PDF & DOCX export",
      "Keyword analysis & ATS insights",
    ],
    ctaLabel: "Start with Starter",
    signupHref: "/auth/signup",
    icon: "zap",
  },
  flex: {
    id: "flex",
    displayName: "Flex",
    tagline: "Unlimited rewrites for every job you apply to",
    priceAmount: "$15",
    priceSuffix: "/ month",
    featuresDetailed: [
      "Everything in Starter, plus:",
      "Unlimited optimizations & exports",
      "AI bullet point generator",
      "AI summary & headline writer",
      "ATS keyword optimization & scoring",
      "Full template library (all layouts)",
      "Priority email support",
    ],
    featuresHome: [
      "Everything in Starter, plus:",
      "Unlimited optimizations",
      "AI bullets, summary & headline",
      "ATS keyword tuning",
      "Priority email support",
    ],
    ctaLabel: "Get Flex",
    checkoutPlan: "pro",
    badges: [{ label: "Most flexible", variant: "amber" }],
    icon: "crown",
    footerNote: "Secure checkout via Polar.",
  },
  searchPass: {
    id: "searchPass",
    displayName: "Search Pass",
    tagline: "Best value if your search lasts a few months",
    priceAmount: "$60",
    priceSuffix: "/ 6 months",
    featuresDetailed: [
      "Everything in Flex—included for six months",
      "~$10/mo effective vs $15/mo Flex (save 33%)",
      "One payment covers a full hiring season",
      "Same unlimited optimizations & exports",
      "Same AI rewrites, ATS tools, and templates",
      "Billed every six months; manage or cancel in your billing portal",
    ],
    featuresHome: [
      "Every Flex feature, prepaid for 6 months",
      "Lowest per-month rate (~$10/mo)",
      "Ideal for a longer job search",
      "Unlimited optimizations & exports",
    ],
    ctaLabel: "Get Search Pass",
    checkoutPlan: "recruiting",
    badges: [
      { label: "SAVE 33%", variant: "primary" },
      { label: "Best value", variant: "amber" },
    ],
    highlight: true,
    icon: "sparkles",
    footerNote: "Billed every six months. Cancel anytime from your billing portal.",
  },
};

export const pricingTierOrder: PricingTierDefinition["id"][] = ["starter", "flex", "searchPass"];

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
    a: "For Flex (monthly) and Search Pass (six months prepaid), manage or cancel anytime in your billing customer portal (checkout is via Polar). You keep full access through the end of the period you’ve already paid for.",
  },
  {
    q: "What’s the difference between Flex and Search Pass?",
    a: "Same product features—unlimited optimizations and exports while your subscription is active. Flex bills monthly, which is ideal if you want a short commitment. Search Pass is six months prepaid at a lower effective monthly rate, which suits a longer search. Pick the billing style that fits your timeline and budget.",
  },
];
