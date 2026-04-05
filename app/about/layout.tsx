import type { Metadata } from "next";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site-nav";
import { openGraphDefaults, siteUrl } from "@/lib/site-metadata";

const canonical = `${siteUrl()}/about`;

export const metadata: Metadata = {
  title: "About",
  description: `${SITE_NAME} (${SITE_DOMAIN}) — AI resume help for every application. One tailored resume per posting, keyword match, PDF and DOCX export—grounded in your real experience.`,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    ...openGraphDefaults,
    title: `About · ${SITE_NAME}`,
    description: `What ${SITE_NAME} is: job-tailored resumes, honest wording, exports you can send today.`,
    url: canonical,
  },
  twitter: {
    card: "summary_large_image",
    title: `About · ${SITE_NAME}`,
    description: `Job-tailored resumes and keyword-aligned exports — ${SITE_DOMAIN}`,
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
