import type { Metadata } from "next";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site-nav";

export const siteDescription =
  "Resumify at resumify.cc — AI resume optimizer for ATS systems. Tailor one truthful resume to every job, see keyword match scores, export PDF & DOCX in three layouts. Built for Canada and beyond.";

export const siteKeywords: string[] = [
  "Resumify",
  "resumify.cc",
  "ATS resume",
  "resume optimizer",
  "AI resume",
  "Canadian resume",
  "job application",
  "keyword match resume",
  "resume PDF",
  "Indeed LinkedIn resume",
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
