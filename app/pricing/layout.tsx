import type { Metadata } from "next";
import { SITE_DOMAIN } from "@/lib/site-nav";
import { siteDescription, openGraphDefaults, siteUrl } from "@/lib/site-metadata";
import { PricingFaqJsonLd } from "@/components/seo/pricing-faq-json-ld";

const canonical = `${siteUrl()}/pricing`;

export const metadata: Metadata = {
  title: "Plans & pricing",
  description: `Resumify (${SITE_DOMAIN}) pricing: $9.99/mo or $99.99/yr CAD (card at checkout) for unlimited job-tailored resume optimizations, match scores, and PDF/DOCX export.`,
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    ...openGraphDefaults,
    title: "Plans",
    description: siteDescription,
    url: canonical,
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PricingFaqJsonLd />
      {children}
    </>
  );
}
