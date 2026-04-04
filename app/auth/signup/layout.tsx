import type { Metadata } from "next";
import { openGraphDefaults, siteDescription } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Sign up",
  description:
    "Create your Resumify account at resumify.cc — one free full optimization, then upgrade for unlimited job-tailored resumes.",
  robots: { index: true, follow: true },
  openGraph: {
    ...openGraphDefaults,
    title: "Sign up",
    description: siteDescription,
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
