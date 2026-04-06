"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeTemplateView } from "@/components/resume-templates/ResumeTemplateView";
import { demoResumeForMarketing } from "@/lib/resume/demoResumeForMarketing";
import { ALL_TEMPLATE_IDS, TEMPLATE_META, TEMPLATE_SHORT_LABEL } from "@/lib/resume/types";
import { cn } from "@/lib/utils";

export function TemplatesShowcaseClient() {
  const defaultTab = ALL_TEMPLATE_IDS[0] ?? "classic";

  return (
    <div className="mt-10">
      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="flex justify-center overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]">
          <TabsList className="inline-flex h-auto min-h-10 w-max max-w-full flex-wrap justify-center gap-1 rounded-xl bg-muted/80 p-1.5 sm:flex-nowrap">
            {ALL_TEMPLATE_IDS.map((id) => (
              <TabsTrigger
                key={id}
                value={id}
                className="rounded-lg px-3 py-2 text-xs sm:text-sm data-[state=active]:shadow-sm"
              >
                {TEMPLATE_SHORT_LABEL[id]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {ALL_TEMPLATE_IDS.map((id) => (
          <TabsContent key={id} value={id} className="mt-6 outline-none">
            <p className="text-center text-muted-foreground text-sm max-w-2xl mx-auto mb-6">
              {TEMPLATE_META[id].description}
            </p>
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-xl border border-border bg-muted/30 shadow-inner">
              <div className="flex justify-center px-2 py-4 sm:px-4 sm:py-6">
                {/* transform:scale does not shrink layout box; clip with fixed height so the preview fits */}
                <div className="relative h-[min(320px,52vh)] w-full max-w-[820px] overflow-hidden sm:h-[380px] md:h-[440px] flex justify-center">
                  <div
                    className={cn(
                      "origin-top shrink-0",
                      "scale-[0.36] sm:scale-[0.42] md:scale-[0.48]",
                      "w-[210mm]"
                    )}
                  >
                    <ResumeTemplateView templateId={id} data={demoResumeForMarketing} />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-muted-foreground/80 text-xs mt-4 max-w-xl mx-auto">
              Same content, different layout — pick the look that fits your industry after you optimize.
            </p>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button asChild size="lg" className="rounded-xl">
          <Link href="/auth/signup">
            Build my resume — free
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="rounded-xl text-muted-foreground">
          <Link href="/builder">Open resume builder</Link>
        </Button>
      </div>
    </div>
  );
}
