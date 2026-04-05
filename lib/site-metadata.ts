import type { Metadata } from "next";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site-nav";

export const siteDescription =
  "Resumify — AI resume builder that tailors your real experience to each job posting. Keyword match with the role, ATS-friendly clarity (honest wording—no magic guarantees), multiple layouts, PDF and DOCX export. Made for Canada; works anywhere you apply.";

export const siteKeywords: string[] = [
  "Resumify",
  "resumify.cc",
  "AI resume builder",
  "tailored resume",
  "job-tailored resume",
  "resume optimizer",
  "ATS friendly resume",
  "keyword match resume",
  "Canadian resume",
  "PDF resume",
  "DOCX resume",
  "Indeed LinkedIn job application",
];

/** Canonical origin for SEO when env is unset (production). */
export const SITE_CANONICAL_ORIGIN = `https://${SITE_DOMAIN}`;

/** Base URL for Open Graph and sitemap when NEXT_PUBLIC_APP_URL is set. */
export function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (env && env.startsWith("http")) return env;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NODE_ENV === "production") return SITE_CANONICAL_ORIGIN;
  return "http://localhost:3000";
}

export const openGraphDefaults: NonNullable<Metadata["openGraph"]> = {
  siteName: SITE_NAME,
  type: "website",
  locale: "en_CA",
};
