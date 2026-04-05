import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site-nav";
import { openGraphDefaults, siteDescription, siteKeywords, siteUrl } from "@/lib/site-metadata";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { RegisterDeviceOnLogin } from "@/components/auth/register-device-on-login";
import { SubscriptionWelcomeToast } from "@/components/subscription/subscription-welcome-toast";

const inter = Inter({ subsets: ["latin"] });

const canonical = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(canonical),
  title: {
    default: `${SITE_NAME} — Job-tailored resumes, keyword match & export | ${SITE_DOMAIN}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    ...openGraphDefaults,
    title: `${SITE_NAME} — Job-tailored resumes & keyword-aligned exports`,
    description: siteDescription,
    url: canonical,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Job-tailored resumes & keyword-aligned exports`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-CA" suppressHydrationWarning>
      <body className={inter.className}>
        <SiteJsonLd />
        <RegisterDeviceOnLogin />
        <SubscriptionWelcomeToast />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
