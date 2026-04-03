import type { Metadata } from "next";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site-nav";
import { openGraphDefaults, siteDescription } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "About",
  description: `Learn what ${SITE_NAME} does, how it helps job seekers tailor resumes to each role, and why ${SITE_DOMAIN} exists.`,
  openGraph: {
    ...openGraphDefaults,
    title: `About ${SITE_NAME}`,
    description: siteDescription,
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
