import type { Metadata } from "next";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site-nav";
import { siteDescription, openGraphDefaults, siteUrl } from "@/lib/site-metadata";
import { PricingFaqJsonLd } from "@/components/seo/pricing-faq-json-ld";

const canonical = `${siteUrl()}/pricing`;

export const metadata: Metadata = {
  title: "Plans & pricing",
  description: `${SITE_NAME} (${SITE_DOMAIN}): $9.99/mo or $99.99/yr CAD — unlimited job-tailored resume runs, match insights, PDF/DOCX export. Card at checkout.`,
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    ...openGraphDefaults,
    title: `Plans & pricing · ${SITE_NAME}`,
    description: siteDescription,
    url: canonical,
  },
  twitter: {
    card: "summary_large_image",
    title: `Plans & pricing · ${SITE_NAME}`,
    description: siteDescription,
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
