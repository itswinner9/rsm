import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { GenerationDetail } from "@/components/dashboard/GenerationDetail";
import { syncPolarSubscriptionForUser } from "@/lib/polar/syncSubscription";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { title: "Optimization", robots: { index: false, follow: false } };
  const { data: gen } = await supabase
    .from("resume_generations")
    .select("job_title")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();
  const label = gen?.job_title?.trim() || "Optimization";
  return { title: label, robots: { index: false, follow: false } };
}

async function getData(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  let profileRes = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single();
  if (!profileRes.data || profileRes.data.subscription_status !== "active") {
    await syncPolarSubscriptionForUser(user.id);
    profileRes = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single();
  }

  const { data: gen } = await supabase
    .from("resume_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!gen) notFound();

  return {
    user,
    profile: profileRes.data,
    gen,
  };
}

export default async function GenerationPage({ params }: { params: { id: string } }) {
  const { user, profile, gen } = await getData(params.id);
  const isSubscribed = profile?.subscription_status === "active";

  return (
    <AppShell userEmail={user.email} isPro={isSubscribed}>
      <div className="max-w-6xl mx-auto space-y-8">
        <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <Link
            href="/dashboard#recent"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ChevronLeft className="size-4 shrink-0" strokeWidth={1.25} />
            Recent
          </Link>
          <span className="text-muted-foreground/40" aria-hidden>
            /
          </span>
          <span className="text-foreground font-medium truncate min-w-0">
            {gen.job_title || "Resume optimization"}
          </span>
        </nav>

        <GenerationDetail gen={gen} />
      </div>
    </AppShell>
  );
}
