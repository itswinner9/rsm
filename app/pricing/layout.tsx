import type { Metadata } from "next";
import { SITE_DOMAIN } from "@/lib/site-nav";
import { siteDescription, openGraphDefaults } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Plans & pricing",
  description: `Resumify (${SITE_DOMAIN}) pricing: 3-day Stripe trial (card required), then $9.99/mo or $99.99/yr CAD for unlimited ATS resume optimizations, match scores, and PDF/DOCX export.`,
  openGraph: {
    ...openGraphDefaults,
    title: "Plans",
    description: siteDescription,
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
