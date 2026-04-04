import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { syncStripeSubscriptionForUser } from "@/lib/stripe/syncSubscription";
import { hasPaidPlanAccess } from "@/lib/subscription/access";
import { siteDescription, openGraphDefaults } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Resume builder",
  description:
    "Upload your resume, paste a job description, and get job-tailored layouts with PDF and DOCX export.",
  openGraph: {
    ...openGraphDefaults,
    title: "Resume builder",
    description: siteDescription,
  },
};

export default async function BuilderLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: row } = await supabase
      .from("user_profiles")
      .select("subscription_status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!row || !hasPaidPlanAccess(row.subscription_status)) {
      await syncStripeSubscriptionForUser(user.id);
    }
  }
  return <>{children}</>;
}
