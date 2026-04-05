import type { Metadata } from "next";
import { openGraphDefaults, siteDescription } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Log in",
  description:
    "Sign in to Resumify — tailor resumes to each job, see match insights, export PDF/DOCX, manage billing.",
  robots: { index: false, follow: false },
  openGraph: {
    ...openGraphDefaults,
    title: "Log in · Resumify",
    description: siteDescription,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
