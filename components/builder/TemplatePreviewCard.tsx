"use client";

import { motion } from "framer-motion";
import { Download, FileText, Loader2, Check, Sparkles, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeTemplateView } from "@/components/resume-templates/ResumeTemplateView";
import type { OptimizedResumeData, ResumeTemplateId } from "@/lib/resume/types";
import { cn } from "@/lib/utils";

interface TemplatePreviewCardProps {
  templateId: ResumeTemplateId;
  title: string;
  description: string;
  data: OptimizedResumeData;
  /** When false, PDF/DOCX stay disabled (e.g. no data yet). */
  exportEnabled: boolean;
  isSelected: boolean;
  /** AI-recommended layout for this run */
  isSuggested?: boolean;
  onSelectTemplate: () => void;
  /** Opens full-screen preview (e.g. modal with all layouts). */
  onOpenFullPreview?: () => void;
  downloading: "pdf" | "docx" | null;
  onDownloadPdf: () => void;
  onDownloadDocx: () => void;
  index: number;
}

export function TemplatePreviewCard({
  templateId,
  title,
  description,
  data,
  exportEnabled,
  isSelected,
  isSuggested = false,
  onSelectTemplate,
  onOpenFullPreview,
  downloading,
  onDownloadPdf,
  onDownloadDocx,
  index,
}: TemplatePreviewCardProps) {
  const disabledExport = !exportEnabled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={cn(
        "flex flex-col rounded-2xl border bg-card overflow-hidden transition-all duration-200 shadow-sm shadow-black/[0.04]",
        isSelected
          ? "border-primary/35 ring-2 ring-primary/20 shadow-md shadow-primary/5"
          : "border-border hover:border-primary/20 hover:shadow-md"
      )}
    >
      <div className="p-4 border-b border-border/80 flex items-start gap-3 bg-muted/20">
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-xl border shrink-0",
            isSelected ? "bg-primary/10 border-primary/20 text-primary" : "bg-background border-border text-muted-foreground"
          )}
        >
          <FileText className="size-4" strokeWidth={1.25} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 rounded-md bg-muted/80 border border-border/80">
              ATS
            </span>
            {isSuggested ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                <Sparkles className="size-2.5" strokeWidth={2} />
                Suggested
              </span>
            ) : null}
          </div>
          <h3 className="text-sm font-semibold text-foreground leading-tight tracking-tight">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
        {isSelected && (
          <div className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
            <Check className="size-3.5" strokeWidth={2.5} />
          </div>
        )}
      </div>

      <div className="relative bg-gradient-to-b from-muted/40 via-muted/15 to-muted/30 p-4 flex justify-center overflow-hidden min-h-[320px] h-[320px] sm:h-[340px]">
        {onOpenFullPreview ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute top-3 right-3 z-10 h-8 gap-1.5 rounded-full px-3 text-[11px] font-medium shadow-md border border-border/80 bg-background/90 backdrop-blur-sm hover:bg-background"
            onClick={onOpenFullPreview}
          >
            <Maximize2 className="size-3.5" strokeWidth={2} />
            Full preview
          </Button>
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/40 to-transparent" />
        <div className="origin-top scale-[0.34] sm:scale-[0.38] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] rounded-md border border-neutral-200/90 bg-white w-[210mm] ring-1 ring-black/[0.04]">
          <ResumeTemplateView templateId={templateId} data={data} className="shadow-none min-h-0 w-full" />
        </div>
      </div>

      <div className="p-4 space-y-2 mt-auto border-t border-border">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs rounded-xl border-border bg-transparent hover:bg-muted/60"
            disabled={disabledExport || downloading !== null}
            onClick={onDownloadPdf}
          >
            {downloading === "pdf" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <>
                <Download className="size-3.5 mr-1" strokeWidth={1.25} />
                PDF
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs rounded-xl border-border bg-transparent hover:bg-muted/60"
            disabled={disabledExport || downloading !== null}
            onClick={onDownloadDocx}
          >
            {downloading === "docx" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <>
                <Download className="size-3.5 mr-1" strokeWidth={1.25} />
                DOCX
              </>
            )}
          </Button>
        </div>
        <Button
          type="button"
          size="sm"
          className={cn(
            "w-full text-xs rounded-full min-h-10 font-medium",
            isSelected && "border border-border bg-muted text-foreground hover:bg-muted/90"
          )}
          variant={isSelected ? "outline" : "default"}
          onClick={onSelectTemplate}
        >
          {isSelected ? "Using this template" : "Use this template"}
        </Button>
      </div>
    </motion.div>
  );
}
