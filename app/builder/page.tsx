"use client";

import { useState, useEffect, Fragment, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Sparkles, ChevronLeft, Check, Eye, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadSection } from "@/components/builder/UploadSection";
import { JobDescriptionInput } from "@/components/builder/JobDescriptionInput";
import { ATSScore } from "@/components/builder/ATSScore";
import { TemplatePreviewCard } from "@/components/builder/TemplatePreviewCard";
import { OptimizeLoadingPanel, OPTIMIZE_LOADING_STEPS } from "@/components/builder/OptimizeLoadingPanel";
import { MatchImprovementCard } from "@/components/builder/MatchImprovementCard";
import { ResumePreviewDialog } from "@/components/builder/ResumePreviewDialog";
import { AppShell, type AppShellPlanSummary } from "@/components/layout/app-shell";
import { BuilderPlanStatus } from "@/components/builder/BuilderPlanStatus";
import { useUserSubscription } from "@/hooks/use-user-subscription";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { OptimizedResumeData, ResumeTemplateId } from "@/lib/resume/types";
import { TEMPLATE_META } from "@/lib/resume/types";

interface TemplatePreviewMeta {
  id: ResumeTemplateId;
  name: string;
  description: string;
}

interface OptimizeResult {
  generationId?: string;
  optimized_resume_data: OptimizedResumeData;
  ats_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  suggested_template: ResumeTemplateId;
  template_previews: TemplatePreviewMeta[];
  original_ats_score: number;
  job_title: string;
  company_name: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improvements: string[];
}

const TEMPLATE_ORDER: ResumeTemplateId[] = ["classic", "executive", "compact"];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BuilderPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [resumeText, setResumeText] = useState("");
  const [uploadId, setUploadId] = useState("");
  const [fileName, setFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizingStep, setOptimizingStep] = useState(0);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const { refetch: refetchSubscription, ...subscription } = useUserSubscription({
    stripeSyncBeforeProfile: true,
  });
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateId>("classic");
  const [downloading, setDownloading] = useState<{ templateId: ResumeTemplateId; kind: "pdf" | "docx" } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInitialTemplate, setPreviewInitialTemplate] = useState<ResumeTemplateId>("classic");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meRes = await fetch("/api/user/me").catch(() => null);
        if (meRes?.ok) {
          const me = await meRes.json();
          if (!cancelled) setUserEmail(me.email);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleResumeParsed = (text: string, id: string, name: string) => {
    setResumeText(text);
    setUploadId(id);
    setFileName(name);
  };

  const handleOptimize = async () => {
    if (!resumeText || !jobDescription) {
      toast({
        title: "Missing info",
        description: "Please upload a resume and add a job description.",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    setOptimizingStep(0);

    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, OPTIMIZE_LOADING_STEPS.length - 1);
      setOptimizingStep(stepIdx);
    }, 5500);

    try {
      const response = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          jobTitle: jobTitle.trim() || undefined,
          uploadId,
        }),
      });

      const data = await response.json();

      if (response.status === 403) {
        const err = typeof data.error === "string" ? data.error : "";
        if (err === "subscription_required") {
          toast({
            title: "Subscription required",
            description:
              typeof data.message === "string"
                ? data.message
                : "Start your trial or subscribe on the plans page (card required).",
            variant: "destructive",
          });
          router.push("/pricing");
          return;
        }
        if (err === "trial_daily_limit") {
          toast({
            title: "Trial daily limit",
            description:
              typeof data.message === "string"
                ? data.message
                : "Trial includes one optimization per UTC day. Try again tomorrow or upgrade.",
            variant: "destructive",
          });
          return;
        }
        if (err === "trial_ended") {
          toast({
            title: "Trial ended",
            description:
              typeof data.message === "string" ? data.message : "Update your subscription in billing to continue.",
            variant: "destructive",
          });
          router.push("/pricing");
          return;
        }
      }
      if (response.status === 503) {
        toast({
          title: "AI is rate-limited",
          description: data.error || "Please wait 30 seconds and try again.",
          variant: "destructive",
        });
        return;
      }
      if (!response.ok) throw new Error(data.error || "Failed to optimize");

      setResult({
        generationId: data.generationId,
        optimized_resume_data: data.optimized_resume_data,
        ats_score: data.ats_score,
        matched_keywords: data.matched_keywords ?? [],
        missing_keywords: data.missing_keywords ?? [],
        suggested_template: data.suggested_template ?? "classic",
        template_previews: data.template_previews ?? [],
        original_ats_score: data.original_ats_score,
        job_title: data.job_title,
        company_name: data.company_name,
        strengths: data.strengths ?? [],
        weaknesses: data.weaknesses ?? [],
        suggestions: data.suggestions ?? [],
        improvements: data.improvements ?? [],
      });
      setSelectedTemplate((data.suggested_template as ResumeTemplateId) || "classic");
      setStep(3);

      await refetchSubscription();
    } catch (error) {
      toast({
        title: "Optimization failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      clearInterval(stepInterval);
      setIsOptimizing(false);
      setOptimizingStep(0);
    }
  };

  const persistTemplate = async (templateId: ResumeTemplateId) => {
    if (!result?.generationId) return;
    try {
      await fetch("/api/resume/generation/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId: result.generationId, templateId }),
      });
    } catch {
      /* non-fatal */
    }
  };

  const handleSelectTemplate = (templateId: ResumeTemplateId) => {
    setSelectedTemplate(templateId);
    void persistTemplate(templateId);
    toast({ title: "Template selected", description: TEMPLATE_META[templateId].label });
  };

  const openResumePreview = (templateId: ResumeTemplateId) => {
    setPreviewInitialTemplate(templateId);
    setPreviewOpen(true);
  };

  const handleExport = async (templateId: ResumeTemplateId, kind: "pdf" | "docx") => {
    if (!result?.optimized_resume_data) {
      toast({ title: "Nothing to export", description: "Optimize your resume first.", variant: "destructive" });
      return;
    }
    setDownloading({ templateId, kind });
    try {
      const path = kind === "pdf" ? "/api/export/resume/pdf" : "/api/export/resume/docx";
      const payload: Record<string, unknown> = { templateId };
      if (result.generationId) payload.generationId = result.generationId;
      else payload.optimized_resume_data = result.optimized_resume_data;
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Export failed");
      }
      const blob = await res.blob();
      const base = fileName.replace(/\.[^.]+$/, "") || "resume";
      downloadBlob(blob, `${base}-${templateId}.${kind === "pdf" ? "pdf" : "docx"}`);
      if (result.generationId) {
        setSelectedTemplate(templateId);
        void persistTemplate(templateId);
      }
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

  const canGenerate = subscription.hasPaidAccess;
  const isPaidActive = subscription.isActive;

  const shellPlan: AppShellPlanSummary = useMemo(() => {
    if (subscription.loading) return "loading";
    if (!subscription.hasPaidAccess) return "none";
    if (subscription.isTrialing) return "trial";
    return "active";
  }, [subscription.loading, subscription.hasPaidAccess, subscription.isTrialing]);

  const previewMeta = (id: ResumeTemplateId) => {
    const fromApi = result?.template_previews?.find((p) => p.id === id);
    if (fromApi) return { title: fromApi.name, description: fromApi.description };
    return { title: TEMPLATE_META[id].label, description: TEMPLATE_META[id].description };
  };

  const stepLabels = [
    { id: 1, short: "Upload", long: "Upload resume" },
    { id: 2, short: "Job", long: "Job description" },
    { id: 3, short: "Results", long: "Results" },
  ] as const;

  return (
    <AppShell userEmail={userEmail} planSummary={shellPlan}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 sm:mb-10 flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1">
                Resume builder
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                Optimize for a role
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md leading-relaxed">
                Upload once, paste a job, get one tailored resume in three ATS-ready layouts.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full h-10 px-4 text-xs font-medium border-border bg-card shadow-sm shadow-black/[0.03] hover:bg-muted/60 shrink-0 self-start sm:self-auto"
            >
              <Link href="/dashboard#recent">
                <LayoutDashboard className="size-3.5 mr-2 text-muted-foreground" strokeWidth={1.25} />
                Recent runs
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.03] px-4 py-5 sm:px-8 sm:py-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-4 sm:mb-5 text-center">
              Progress
            </p>
            <div className="max-w-lg mx-auto">
              <div className="flex items-center w-full">
                {stepLabels.map((s, i) => (
                  <Fragment key={s.id}>
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={cn(
                          "flex size-9 sm:size-10 items-center justify-center rounded-full text-[11px] sm:text-xs font-semibold border-2 transition-all duration-200",
                          step > s.id &&
                            "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20",
                          step === s.id &&
                            "bg-primary border-primary text-primary-foreground ring-4 ring-primary/15 shadow-sm",
                          step < s.id && "border-border bg-background text-muted-foreground"
                        )}
                      >
                        {step > s.id ? (
                          <Check className="size-4 sm:size-[15px]" strokeWidth={2.5} />
                        ) : (
                          <span className="tabular-nums">{s.id}</span>
                        )}
                      </div>
                    </div>
                    {i < stepLabels.length - 1 && (
                      <div className="flex-1 flex items-center px-1.5 sm:px-3 min-h-[2.25rem] sm:min-h-10">
                        <div
                          className={cn(
                            "h-0.5 w-full rounded-full transition-colors duration-300",
                            step > s.id ? "bg-primary" : "bg-border"
                          )}
                          aria-hidden
                        />
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
              <div className="flex justify-between w-full mt-3 sm:mt-3.5 gap-1">
                {stepLabels.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "flex-1 text-center min-w-0 px-0.5",
                      step === s.id && "text-foreground",
                      step > s.id && "text-muted-foreground",
                      step < s.id && "text-muted-foreground/55"
                    )}
                  >
                    <span className="text-[10px] sm:text-[11px] font-medium leading-tight block">
                      <span className="hidden sm:inline">{s.long}</span>
                      <span className="sm:hidden">{s.short}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {step < 3 && <BuilderPlanStatus subscription={subscription} />}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto"
            >
              <div className="mb-10 text-center">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70 mb-3">Step 1 of 3</p>
                <h1 className="mb-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl md:font-medium">
                  Add your resume
                </h1>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  We parse it once, then match it to any job you paste next.
                </p>
              </div>

              <UploadSection onParsed={handleResumeParsed} />

              {resumeText && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                  <div className="mb-4 rounded-2xl border border-border bg-card/50 p-4">
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Preview</p>
                    <p className="text-muted-foreground text-sm font-mono leading-relaxed line-clamp-4">
                      {resumeText.slice(0, 300)}...
                    </p>
                  </div>
                  <Button
                    onClick={() => setStep(2)}
                    className="w-full min-h-11 h-auto py-3.5 rounded-full text-sm font-medium"
                    size="lg"
                    disabled={!canGenerate}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.25} />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-10 transition-colors -ml-1"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.25} />
                Back
              </button>

              <div className="mb-10 text-center">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70 mb-3">Step 2 of 3</p>
                <h1 className="mb-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl md:font-medium">
                  Paste the job description
                </h1>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  More detail helps ATS keyword alignment and your match score.
                </p>
              </div>

              <JobDescriptionInput
                jobTitle={jobTitle}
                onJobTitleChange={setJobTitle}
                value={jobDescription}
                onChange={setJobDescription}
                disabled={isOptimizing}
              />

              <div className="mt-8 space-y-3">
                <Button
                  onClick={handleOptimize}
                  disabled={!jobDescription.trim() || isOptimizing}
                  className="w-full min-h-11 h-auto py-3.5 rounded-full text-sm font-medium disabled:opacity-50"
                  size="lg"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Optimizing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" strokeWidth={1.25} />
                      Generate optimized resume
                    </>
                  )}
                </Button>

                {isOptimizing && <OptimizeLoadingPanel activeIndex={optimizingStep} />}
              </div>
            </motion.div>
          )}

          {step === 3 && result && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-8 sm:mb-10 rounded-3xl border border-border bg-gradient-to-br from-primary/[0.05] via-card to-muted/30 p-6 sm:p-8 shadow-sm shadow-black/[0.04]">
                <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:justify-between sm:text-left gap-6">
                  <div className="max-w-2xl sm:max-w-none space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/90 mb-1 flex items-center justify-center sm:justify-start gap-2">
                      <Sparkles className="size-3.5" strokeWidth={1.25} />
                      One resume · three ATS layouts
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {result.job_title ? `Tailored for ${result.job_title}` : "Your optimized resume"}
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-xl mx-auto sm:mx-0 leading-relaxed">
                      Preview the same optimized content in three professional layouts. Export PDF or DOCX from whichever
                      you prefer.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full sm:w-auto">
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-full min-h-10 px-5 gap-2 font-medium shadow-sm shadow-primary/15"
                      onClick={() => openResumePreview(selectedTemplate)}
                    >
                      <Eye className="size-4" strokeWidth={1.25} />
                      Preview &amp; download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full min-h-10 px-5 font-medium border-border bg-background/80 hover:bg-muted/80"
                      onClick={() => {
                        setStep(1);
                        setResult(null);
                        setResumeText("");
                        setJobDescription("");
                        setJobTitle("");
                        setPreviewOpen(false);
                      }}
                    >
                      New resume
                    </Button>
                  </div>
                </div>
              </div>

              <MatchImprovementCard
                className="mb-6"
                originalScore={result.original_ats_score}
                optimizedScore={result.ats_score}
              />

              <ResumePreviewDialog
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                data={result.optimized_resume_data}
                initialTemplateId={previewInitialTemplate}
                suggestedTemplate={result.suggested_template}
                exportEnabled={!!result.optimized_resume_data}
                onDownloadPdf={(tid) => void handleExport(tid, "pdf")}
                onDownloadDocx={(tid) => void handleExport(tid, "docx")}
                downloading={downloading}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-10">
                <div className="order-1 lg:order-2 lg:col-span-8 space-y-5">
                  <div className="rounded-2xl border border-primary/12 bg-primary/[0.03] px-4 py-3.5 sm:px-5 sm:py-4 shadow-sm shadow-black/[0.02]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary mb-1.5">
                      Choose your look
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="text-foreground font-medium">Full preview</span> on a card opens a large view.{" "}
                      <span className="text-foreground font-medium">Preview &amp; download</span> above switches layouts
                      and exports. All three use the same optimized content.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {TEMPLATE_ORDER.map((tid, index) => {
                      const meta = previewMeta(tid);
                      return (
                        <TemplatePreviewCard
                          key={tid}
                          templateId={tid}
                          title={meta.title}
                          description={meta.description}
                          data={result.optimized_resume_data}
                          exportEnabled={!!result.optimized_resume_data}
                          isSelected={selectedTemplate === tid}
                          isSuggested={result.suggested_template === tid}
                          onSelectTemplate={() => handleSelectTemplate(tid)}
                          onOpenFullPreview={() => openResumePreview(tid)}
                          downloading={
                            downloading?.templateId === tid ? downloading.kind : null
                          }
                          onDownloadPdf={() => handleExport(tid, "pdf")}
                          onDownloadDocx={() => handleExport(tid, "docx")}
                          index={index}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="order-2 lg:order-1 lg:col-span-4">
                  <div className="rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.04] overflow-hidden lg:sticky lg:top-6 lg:max-h-[calc(100vh-5rem)] lg:flex lg:flex-col">
                    <div className="shrink-0 border-b border-border bg-muted/30 px-5 py-4">
                      <h3 className="flex items-center gap-2 font-semibold text-foreground text-sm tracking-tight">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/15">
                          <Sparkles className="size-4" strokeWidth={1.25} />
                        </span>
                        AI match insights
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed pl-10">
                        Keyword fit, coaching, and edits—while you compare layouts.
                      </p>
                    </div>
                    <div className="p-5 pt-4 min-h-0 flex-1 overflow-y-auto pr-1 -mr-1 space-y-4 [scrollbar-gutter:stable]">
                      <ATSScore
                        originalScore={result.original_ats_score}
                        optimizedScore={result.ats_score}
                        keywordsFound={result.matched_keywords}
                        keywordsMissing={result.missing_keywords}
                        strengths={result.strengths}
                        weaknesses={result.weaknesses}
                        suggestions={result.suggestions}
                        improvements={result.improvements}
                        isPaidActive={isPaidActive}
                        suggestedTemplateLabel={TEMPLATE_META[result.suggested_template]?.label}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
