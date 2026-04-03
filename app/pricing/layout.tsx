import type { Metadata } from "next";
import { SITE_DOMAIN } from "@/lib/site-nav";
import { siteDescription, openGraphDefaults } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Plans & pricing",
  description: `Resumify (${SITE_DOMAIN}) pricing: try once free, then Flex monthly or Search Pass for unlimited ATS resume optimizations, match scores, and PDF/DOCX export.`,
  openGraph: {
    ...openGraphDefaults,
    title: "Plans",
    description: siteDescription,
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
