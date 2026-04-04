"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2, Sparkles } from "lucide-react";
import { ResumeTemplateView } from "@/components/resume-templates/ResumeTemplateView";
import type { OptimizedResumeData, ResumeTemplateId } from "@/lib/resume/types";
import { ALL_TEMPLATE_IDS, TEMPLATE_META } from "@/lib/resume/types";
import { cn } from "@/lib/utils";

interface ResumePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: OptimizedResumeData;
  /** Which layout to show first when the dialog opens */
  initialTemplateId: ResumeTemplateId;
  suggestedTemplate?: ResumeTemplateId;
  exportEnabled: boolean;
  onDownloadPdf: (templateId: ResumeTemplateId) => void;
  onDownloadDocx: (templateId: ResumeTemplateId) => void;
  downloading: { templateId: ResumeTemplateId; kind: "pdf" | "docx" } | null;
}

export function ResumePreviewDialog({
  open,
  onOpenChange,
  data,
  initialTemplateId,
  suggestedTemplate,
  exportEnabled,
  onDownloadPdf,
  onDownloadDocx,
  downloading,
}: ResumePreviewDialogProps) {
  const [tab, setTab] = useState<ResumeTemplateId>(initialTemplateId);

  useEffect(() => {
    if (open) setTab(initialTemplateId);
  }, [open, initialTemplateId]);

  const busy = downloading !== null;
  const dlPdf = downloading?.kind === "pdf" && downloading.templateId === tab;
  const dlDocx = downloading?.kind === "docx" && downloading.templateId === tab;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[min(960px,calc(100vw-1.5rem))] max-h-[min(92vh,880px)] w-full translate-y-[-50%] gap-0 p-0 overflow-hidden",
          "flex flex-col border-border bg-card shadow-2xl sm:rounded-2xl"
        )}
      >
        <DialogHeader className="px-5 pt-5 pb-3 text-left space-y-1 border-b border-border shrink-0">
          <DialogTitle className="text-base sm:text-lg font-semibold tracking-tight pr-8">
            Resume preview
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm leading-relaxed">
            Same content in five layouts. Switch tabs to compare, then download the one you want.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as ResumeTemplateId)} className="flex flex-col flex-1 min-h-0">
          <div className="px-5 pt-3 shrink-0">
            <TabsList className="w-full h-auto flex-wrap justify-start gap-1 rounded-xl bg-muted/50 p-1.5">
              {ALL_TEMPLATE_IDS.map((id) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="rounded-lg text-xs sm:text-sm px-3 py-2 data-[state=active]:shadow-sm gap-1.5"
                >
                  {suggestedTemplate === id ? (
                    <Sparkles className="size-3.5 text-primary shrink-0" strokeWidth={2} />
                  ) : (
                    <FileText className="size-3.5 opacity-60 shrink-0" strokeWidth={1.25} />
                  )}
                  <span className="truncate max-w-[7rem] sm:max-w-none">{TEMPLATE_META[id].label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {ALL_TEMPLATE_IDS.map((id) => (
            <TabsContent
              key={id}
              value={id}
              className="flex-1 min-h-0 mt-0 px-5 pb-3 data-[state=inactive]:hidden flex flex-col"
            >
              <p className="text-[11px] text-muted-foreground mb-2 shrink-0">{TEMPLATE_META[id].description}</p>
              <div className="flex-1 min-h-[280px] max-h-[min(52vh,520px)] overflow-y-auto rounded-xl border border-border bg-gradient-to-b from-muted/20 to-muted/5">
                <div className="flex justify-center p-4 pb-6 min-h-[360px]">
                  <div className="origin-top scale-[0.52] sm:scale-[0.58] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)] rounded-sm border border-neutral-200/90 bg-white ring-1 ring-black/[0.06]">
                    <ResumeTemplateView templateId={id} data={data} className="shadow-none" />
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="border-t border-border bg-background/95 backdrop-blur-sm px-5 py-4 shrink-0 space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-border w-full sm:w-auto sm:min-w-[120px]"
              disabled={!exportEnabled || busy}
              onClick={() => onDownloadPdf(tab)}
            >
              {dlPdf ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4 mr-2" strokeWidth={1.25} />}
              PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-border w-full sm:w-auto sm:min-w-[120px]"
              disabled={!exportEnabled || busy}
              onClick={() => onDownloadDocx(tab)}
            >
              {dlDocx ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4 mr-2" strokeWidth={1.25} />}
              DOCX
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground text-center sm:text-right">
            Downloads use the layout shown in the active tab ({TEMPLATE_META[tab].label}).
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
