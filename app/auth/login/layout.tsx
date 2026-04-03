import type { Metadata } from "next";
import { openGraphDefaults, siteDescription } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to Resumify (resumify.cc) to optimize resumes, track match scores, and manage billing.",
  robots: { index: false, follow: false },
  openGraph: {
    ...openGraphDefaults,
    title: "Login",
    description: siteDescription,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
