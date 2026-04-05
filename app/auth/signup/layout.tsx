import type { Metadata } from "next";
import { openGraphDefaults, siteDescription } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Sign up",
  description:
    "Create your Resumify account — try a free optimization, then upgrade for unlimited job-tailored resumes and exports.",
  robots: { index: true, follow: true },
  openGraph: {
    ...openGraphDefaults,
    title: "Sign up · Resumify",
    description: siteDescription,
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
