"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  Building2,
  ChevronRight,
  Download,
  Sparkles,
  ClipboardList,
  TrendingUp,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TemplatePreviewCard } from "@/components/builder/TemplatePreviewCard";
import { ResumePreviewDialog } from "@/components/builder/ResumePreviewDialog";
import type { OptimizedResumeData, ResumeTemplateId } from "@/lib/resume/types";
import { optimizedResumeDataSchema, TEMPLATE_META } from "@/lib/resume/types";
import { stripHtmlFromText } from "@/lib/resume/sanitizeResumeText";

interface GenerationRow {
  id: string;
  job_title: string;
  company_name: string;
  ats_score_original: number | null;
  ats_score_optimized: number | null;
  generated_resumes: unknown;
  optimized_resume_data: unknown;
  selected_template: string | null;
  job_description: string;
  created_at: string;
}

const TEMPLATE_ORDER: ResumeTemplateId[] = ["classic", "executive", "compact"];

function ScoreRing({
  score,
  size = 88,
  strokeWidth = 5,
  accentClass = "stroke-foreground/75",
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  accentClass?: string;
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-border"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={accentClass}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-semibold text-foreground tabular-nums">{score}%</span>
      </div>
    </div>
  );
}

function ringAccent(score: number) {
  if (score >= 80) return "stroke-emerald-400/85";
  if (score >= 60) return "stroke-amber-400/80";
  return "stroke-red-400/75";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function GenerationDetail({ gen }: { gen: GenerationRow }) {
  const { toast } = useToast();
  const [showJD, setShowJD] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateId>(() => {
    const s = gen.selected_template;
    if (s === "executive" || s === "compact" || s === "classic") return s;
    return "classic";
  });
  const [downloading, setDownloading] = useState<{ templateId: ResumeTemplateId; kind: "pdf" | "docx" } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInitialTemplate, setPreviewInitialTemplate] = useState<ResumeTemplateId>("classic");

  const parsed = optimizedResumeDataSchema.safeParse(gen.optimized_resume_data);
  const resumeData: OptimizedResumeData | null = parsed.success ? parsed.data : null;

  const legacyVersions = Array.isArray(gen.generated_resumes)
    ? (gen.generated_resumes as { template?: string; ats_score?: number; content?: string }[])
    : [];
  const isLegacy = !resumeData && legacyVersions.length > 0;

  const optimizedScore =
    gen.ats_score_optimized ??
    (legacyVersions.length ? Math.max(...legacyVersions.map((v) => v.ats_score || 0)) : 0);
  const originalScore = gen.ats_score_original ?? 0;
  const improvement =
    gen.ats_score_original != null && optimizedScore != null ? optimizedScore - gen.ats_score_original : null;

  const suggestedFromAnalysis: ResumeTemplateId | undefined = (() => {
    const g = gen.generated_resumes;
    if (!g || typeof g !== "object" || Array.isArray(g)) return undefined;
    const st = (g as { suggested_template?: string }).suggested_template;
    if (st === "classic" || st === "executive" || st === "compact") return st;
    return undefined;
  })();

  const openResumePreview = (templateId: ResumeTemplateId) => {
    setPreviewInitialTemplate(templateId);
    setPreviewOpen(true);
  };

  const persistTemplate = async (templateId: ResumeTemplateId) => {
    try {
      await fetch("/api/resume/generation/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId: gen.id, templateId }),
      });
    } catch {
      /* ignore */
    }
  };

  const handleSelectTemplate = (templateId: ResumeTemplateId) => {
    setSelectedTemplate(templateId);
    void persistTemplate(templateId);
  };

  const handleExport = async (templateId: ResumeTemplateId, kind: "pdf" | "docx") => {
    setDownloading({ templateId, kind });
    try {
      const path = kind === "pdf" ? "/api/export/resume/pdf" : "/api/export/resume/docx";
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId: gen.id, templateId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Export failed");
      }
      const blob = await res.blob();
      downloadBlob(blob, `resume-${templateId}.${kind === "pdf" ? "pdf" : "docx"}`);
      setSelectedTemplate(templateId);
      void persistTemplate(templateId);
      toast({ title: "Downloaded", description: `${kind.toUpperCase()} saved.` });
    } catch (e) {
      toast({
        title: "Download failed",
        description: e instanceof Error ? e.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  const formattedDate = new Date(gen.created_at).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="rounded-2xl border border-border bg-card/40 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="min-w-0 space-y-4">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground text-balance">
                {gen.job_title || "Resume optimization"}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {gen.company_name ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                    <Building2 className="size-3.5 shrink-0" strokeWidth={1.25} />
                    {gen.company_name}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                  <Calendar className="size-3.5 shrink-0" strokeWidth={1.25} />
                  {formattedDate}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full lg:w-auto">
              {resumeData ? (
                <Button
                  type="button"
                  size="sm"
                  className="rounded-full min-h-10 px-5 gap-2 w-full sm:w-auto"
                  onClick={() => openResumePreview(selectedTemplate)}
                >
                  <Eye className="size-4" strokeWidth={1.25} />
                  Preview &amp; download
                </Button>
              ) : null}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full min-h-10 px-5 border-border bg-transparent hover:bg-muted/80 w-full sm:w-auto"
              >
                <Link href="/builder">
                  <Sparkles className="size-4 mr-2" strokeWidth={1.25} />
                  Builder
                  <ChevronRight className="size-4 ml-1" strokeWidth={1.25} />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Match scores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-border divide-y sm:divide-y-0 sm:divide-x divide-border">
          <div className="p-5 sm:p-6 text-center bg-muted/30">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-4">Original</p>
            {gen.ats_score_original != null ? (
              <ScoreRing score={gen.ats_score_original} accentClass={ringAccent(gen.ats_score_original)} />
            ) : (
              <p className="text-2xl font-semibold text-muted-foreground py-8">—</p>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">Before optimization</p>
          </div>
          <div className="p-5 sm:p-6 text-center bg-muted/30">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-4">Optimized</p>
            {optimizedScore > 0 || gen.ats_score_optimized != null ? (
              <ScoreRing score={optimizedScore} accentClass={ringAccent(optimizedScore)} />
            ) : (
              <p className="text-2xl font-semibold text-muted-foreground py-8">—</p>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">After optimization</p>
          </div>
          <div className="p-5 sm:p-6 flex flex-col items-center justify-center text-center bg-muted/40">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-3">Change</p>
            {improvement != null ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="size-5 text-muted-foreground" strokeWidth={1.25} />
                  <span
                    className={cn(
                      "text-3xl font-semibold tabular-nums",
                      improvement > 0 && "text-emerald-400/90",
                      improvement === 0 && "text-muted-foreground",
                      improvement < 0 && "text-amber-400/85"
                    )}
                  >
                    {improvement > 0 ? "+" : ""}
                    {improvement}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                  Match score delta vs your original upload for this job
                </p>
              </>
            ) : (
              <p className="text-2xl font-semibold text-muted-foreground">—</p>
            )}
          </div>
        </div>
      </div>

      {resumeData ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-foreground tracking-tight">Layouts & export</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
              Same content, three looks. Preview or download PDF / DOCX.
            </p>
          </div>
          <ResumePreviewDialog
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            data={resumeData}
            initialTemplateId={previewInitialTemplate}
            suggestedTemplate={suggestedFromAnalysis}
            exportEnabled
            onDownloadPdf={(tid) => void handleExport(tid, "pdf")}
            onDownloadDocx={(tid) => void handleExport(tid, "docx")}
            downloading={downloading}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {TEMPLATE_ORDER.map((tid, index) => (
              <TemplatePreviewCard
                key={tid}
                templateId={tid}
                title={TEMPLATE_META[tid].label}
                description={TEMPLATE_META[tid].description}
                data={resumeData}
                exportEnabled
                isSelected={selectedTemplate === tid}
                isSuggested={suggestedFromAnalysis === tid}
                onSelectTemplate={() => handleSelectTemplate(tid)}
                onOpenFullPreview={() => openResumePreview(tid)}
                downloading={downloading?.templateId === tid ? downloading.kind : null}
                onDownloadPdf={() => handleExport(tid, "pdf")}
                onDownloadDocx={() => handleExport(tid, "docx")}
                index={index}
              />
            ))}
          </div>
        </section>
      ) : isLegacy ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Legacy versions (text only)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {legacyVersions.map((v, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card/40 p-5 space-y-3 flex flex-col"
              >
                <p className="font-medium text-sm text-foreground">{v.template}</p>
                <p className="text-xs text-muted-foreground line-clamp-6 whitespace-pre-wrap leading-relaxed flex-1">
                  {stripHtmlFromText(typeof v.content === "string" ? v.content : "")}
                </p>
                <Button size="sm" variant="outline" className="w-full rounded-xl border-border" disabled>
                  <Download className="size-3.5 mr-1.5" strokeWidth={1.25} />
                  Re-run builder for PDF/DOCX
                </Button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/20 py-16 px-6 text-center">
          <div className="size-14 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto mb-4">
            <FileText className="size-6 text-muted-foreground" strokeWidth={1.25} />
          </div>
          <p className="text-foreground font-medium text-sm mb-1">No structured resume data</p>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            This run may predate the current format. Start a new optimization from the builder.
          </p>
          <Button asChild variant="outline" className="mt-6 rounded-full">
            <Link href="/builder">Open builder</Link>
          </Button>
        </div>
      )}

      {gen.job_description ? (
        <div className="rounded-2xl border border-border bg-card/35 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowJD(!showJD)}
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
          >
            <span className="flex items-center gap-3 min-w-0">
              <span className="flex size-9 items-center justify-center rounded-xl bg-muted/50 border border-border shrink-0">
                <ClipboardList className="size-4 text-muted-foreground" strokeWidth={1.25} />
              </span>
              <span>
                <span className="block text-sm font-medium text-foreground">Job description</span>
                <span className="block text-xs text-muted-foreground mt-0.5">
                  {showJD ? "Tap to collapse" : "Used for this optimization"}
                </span>
              </span>
            </span>
            <ChevronRight
              className={cn(
                "size-4 text-muted-foreground shrink-0 transition-transform duration-200",
                showJD && "rotate-90"
              )}
              strokeWidth={1.25}
            />
          </button>
          {showJD ? (
            <div className="px-5 pb-5 pt-0 border-t border-border">
              <div className="mt-4 max-h-[min(420px,50vh)] overflow-y-auto rounded-xl border border-border bg-background/40 p-4">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {stripHtmlFromText(gen.job_description)}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
