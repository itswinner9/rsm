import type { Metadata } from "next";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site-nav";
import { openGraphDefaults, siteUrl } from "@/lib/site-metadata";

const canonical = `${siteUrl()}/about`;

export const metadata: Metadata = {
  title: "About",
  description: `${SITE_NAME} (${SITE_DOMAIN}) — honest AI resume optimization for ATS and recruiters. One tailored resume per job, keyword match scores, PDF and DOCX export.`,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    ...openGraphDefaults,
    title: `About · ${SITE_NAME}`,
    description: `What ${SITE_NAME} does and how we keep your resume truthful while improving clarity and ATS fit.`,
    url: canonical,
  },
  twitter: {
    card: "summary_large_image",
    title: `About · ${SITE_NAME}`,
    description: `Honest resume optimization for each job posting — ${SITE_DOMAIN}`,
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
