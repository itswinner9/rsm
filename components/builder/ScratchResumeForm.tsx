"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PenLine,
  Plus,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  serializeScratchResumeToText,
  defaultScratchForm,
  emptyScratchExperience,
  emptyScratchEducation,
  type ScratchFormState,
} from "@/lib/resume/serializeScratchResume";
import { SCRATCH_DRAFT_STORAGE_KEY, parseScratchDraft } from "@/lib/resume/scratchDraftStorage";
import { cn } from "@/lib/utils";

type Props = {
  onComplete: (text: string, uploadId: string, fileName: string) => void;
  disabled?: boolean;
};

const STEPS = [
  { id: 1, title: "Profile", desc: "Name & contact" },
  { id: 2, title: "Summary & skills", desc: "Your pitch & keywords" },
  { id: 3, title: "Experience", desc: "Roles & impact bullets" },
  { id: 4, title: "Education", desc: "Schools & credentials" },
  { id: 5, title: "Review", desc: "Polish & save" },
] as const;

const inputClass =
  "w-full rounded-xl border border-border/80 bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-shadow focus:border-primary/35 focus:ring-2 focus:ring-primary/15 placeholder:text-muted-foreground/45";
const labelClass = "text-xs font-medium text-muted-foreground";

export function ScratchResumeForm({ onComplete, disabled }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState<ScratchFormState>(() => defaultScratchForm());
  const [step, setStep] = useState(1);
  const [draftReady, setDraftReady] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = parseScratchDraft(
      typeof window !== "undefined" ? localStorage.getItem(SCRATCH_DRAFT_STORAGE_KEY) : null
    );
    if (saved) setForm(saved);
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady || typeof window === "undefined") return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(SCRATCH_DRAFT_STORAGE_KEY, JSON.stringify(form));
        setLastSaved(new Date());
      } catch {
        /* quota */
      }
    }, 450);
    return () => clearTimeout(t);
  }, [form, draftReady]);

  const update = <K extends keyof ScratchFormState>(key: K, value: ScratchFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const canPolish =
    form.fullName.trim().length >= 2 &&
    (form.summary.trim().length > 20 ||
      form.skills.trim().length > 3 ||
      form.experience.some((e) => e.title.trim() || e.bullets.trim().length > 10));

  const handlePolish = async () => {
    if (!canPolish || polishing || disabled) return;
    setPolishing(true);
    setError(null);
    try {
      const res = await fetch("/api/resume/polish-scratch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI polish failed");
      setForm(data.form as ScratchFormState);
      toast({
        title: "Polished with AI",
        description: "Review every line — we never invent employers or dates.",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not polish";
      setError(msg);
      toast({ title: "Polish failed", description: msg, variant: "destructive" });
    } finally {
      setPolishing(false);
    }
  };

  const handleSubmit = async () => {
    const text = serializeScratchResumeToText(form);
    if (text.length < 50) {
      setError("Add a bit more detail (name, summary, or one role) — at least a few lines.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const response = await fetch("/api/parse-resume/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        credentials: "same-origin",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save resume");
      try {
        localStorage.removeItem(SCRATCH_DRAFT_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      onComplete(text, data.uploadId as string, "scratch-resume.txt");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const goNext = () => setStep((s) => Math.min(5, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const savedTime =
    lastSaved && draftReady
      ? lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : null;

  const progressPct = (step / STEPS.length) * 100;
  const current = STEPS[step - 1];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5 space-y-4 shadow-sm shadow-black/[0.02]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">From scratch</p>
            <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-[1.05rem]">
              Step-by-step resume
            </h2>
            <p className="text-xs text-muted-foreground leading-snug max-w-[28rem]">
              Autosaves in this browser. AI can polish wording and bullets — you keep every fact.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end shrink-0">
            {savedTime && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground tabular-nums">
                <Check className="size-3 text-emerald-600/90 dark:text-emerald-400/90" strokeWidth={2.5} aria-hidden />
                Saved {savedTime}
              </span>
            )}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-full h-8 px-3 text-xs gap-1.5 border border-border/70 bg-background/80 hover:bg-muted/60"
              onClick={handlePolish}
              disabled={disabled || saving || polishing || !canPolish}
              title={!canPolish ? "Add your name plus summary, skills, or a role first" : undefined}
            >
              {polishing ? (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
              ) : (
                <Sparkles className="size-3.5 text-amber-600/90 dark:text-amber-400/90" strokeWidth={2} />
              )}
              <span className="hidden sm:inline">Improve with AI</span>
              <span className="sm:hidden">AI polish</span>
            </Button>
          </div>
        </div>

        {/* Progress + current step */}
        <div className="space-y-3 pt-1">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted/80"
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-label={`Step ${step} of ${STEPS.length}`}
          >
            <div
              className="h-full rounded-full bg-primary/75 transition-[width] duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">{current?.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{current?.desc}</p>
            </div>
            <span className="text-[11px] font-medium tabular-nums text-muted-foreground shrink-0 pt-0.5">
              {step}/{STEPS.length}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 pt-0.5" role="tablist" aria-label="Resume steps">
            {STEPS.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={step === s.id}
                aria-label={`${s.title}: ${s.desc}`}
                onClick={() => setStep(s.id)}
                className={cn(
                  "rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  step === s.id
                    ? "size-2.5 bg-primary ring-2 ring-primary/25 ring-offset-2 ring-offset-background"
                    : step > s.id
                      ? "size-2 bg-primary/45 hover:bg-primary/60"
                      : "size-2 bg-border hover:bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="rounded-2xl border border-border/70 bg-card/50 p-4 sm:p-6 shadow-sm shadow-black/[0.02]"
        >
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Profile</h3>
                <p className="text-xs text-muted-foreground mt-0.5">How recruiters see you at the top of the page.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 sm:col-span-2">
                  <span className={labelClass}>Full name</span>
                  <input
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    className={inputClass}
                    placeholder="Jane Doe"
                    disabled={disabled || saving}
                  />
                </label>
                <label className="space-y-1.5 sm:col-span-2">
                  <span className={labelClass}>Headline (optional)</span>
                  <input
                    value={form.headline}
                    onChange={(e) => update("headline", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Safety Coordinator · Operations"
                    disabled={disabled || saving}
                  />
                </label>
                <label className="space-y-1.5">
                  <span className={labelClass}>Email</span>
                  <input
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={inputClass}
                    type="email"
                    autoComplete="email"
                    disabled={disabled || saving}
                  />
                </label>
                <label className="space-y-1.5">
                  <span className={labelClass}>Phone</span>
                  <input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={inputClass}
                    disabled={disabled || saving}
                  />
                </label>
                <label className="space-y-1.5">
                  <span className={labelClass}>Location</span>
                  <input
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    className={inputClass}
                    placeholder="City, Province"
                    disabled={disabled || saving}
                  />
                </label>
                <label className="space-y-1.5">
                  <span className={labelClass}>LinkedIn (optional)</span>
                  <input
                    value={form.linkedin}
                    onChange={(e) => update("linkedin", e.target.value)}
                    className={inputClass}
                    placeholder="linkedin.com/in/…"
                    disabled={disabled || saving}
                  />
                </label>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                Canadian style: no photo or full street address on the resume — city & province is enough.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Summary & skills</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A tight summary and keyword-rich skills help ATS and skimming recruiters.
                </p>
              </div>
              <label className="block space-y-1.5">
                <span className={labelClass}>Professional summary</span>
                <textarea
                  value={form.summary}
                  onChange={(e) => update("summary", e.target.value)}
                  className={cn(inputClass, "min-h-[120px] resize-y")}
                  placeholder="2–4 sentences on your focus, strengths, and what role you want next."
                  disabled={disabled || saving}
                />
              </label>
              <label className="block space-y-1.5">
                <span className={labelClass}>Skills (comma or line separated)</span>
                <textarea
                  value={form.skills}
                  onChange={(e) => update("skills", e.target.value)}
                  className={cn(inputClass, "min-h-[88px] resize-y")}
                  placeholder="e.g. Safety protocols, WHMIS, Incident reporting, Stakeholder communication"
                  disabled={disabled || saving}
                />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Experience</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  One bullet per line — action verb + context + result. AI can tighten wording on the Review step.
                </p>
              </div>
              {form.experience.map((ex, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/60 bg-muted/10 p-3 sm:p-4 space-y-2.5"
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={ex.title}
                      onChange={(e) => {
                        const next = [...form.experience];
                        next[i] = { ...ex, title: e.target.value };
                        update("experience", next);
                      }}
                      className={inputClass}
                      placeholder="Job title"
                      disabled={disabled || saving}
                    />
                    <input
                      value={ex.company}
                      onChange={(e) => {
                        const next = [...form.experience];
                        next[i] = { ...ex, company: e.target.value };
                        update("experience", next);
                      }}
                      className={inputClass}
                      placeholder="Company"
                      disabled={disabled || saving}
                    />
                    <input
                      value={ex.location}
                      onChange={(e) => {
                        const next = [...form.experience];
                        next[i] = { ...ex, location: e.target.value };
                        update("experience", next);
                      }}
                      className={inputClass}
                      placeholder="Location"
                      disabled={disabled || saving}
                    />
                    <input
                      value={ex.dates}
                      onChange={(e) => {
                        const next = [...form.experience];
                        next[i] = { ...ex, dates: e.target.value };
                        update("experience", next);
                      }}
                      className={inputClass}
                      placeholder="Dates"
                      disabled={disabled || saving}
                    />
                  </div>
                  <textarea
                    value={ex.bullets}
                    onChange={(e) => {
                      const next = [...form.experience];
                      next[i] = { ...ex, bullets: e.target.value };
                      update("experience", next);
                    }}
                    className={cn(inputClass, "min-h-[100px] resize-y font-mono text-[13px] leading-relaxed")}
                    placeholder="One bullet per line (optional)"
                    disabled={disabled || saving}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => update("experience", [...form.experience, emptyScratchExperience()])}
                disabled={disabled || saving}
              >
                <Plus className="size-3.5 mr-1.5" strokeWidth={2} />
                Add role
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Education</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Programs and credentials that support your story.</p>
              </div>
              {form.education.map((ed, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-3 rounded-xl border border-border/60 bg-muted/10 p-3 sm:p-4">
                  <input
                    value={ed.institution}
                    onChange={(e) => {
                      const next = [...form.education];
                      next[i] = { ...ed, institution: e.target.value };
                      update("education", next);
                    }}
                    className={inputClass}
                    placeholder="School"
                    disabled={disabled || saving}
                  />
                  <input
                    value={ed.credential}
                    onChange={(e) => {
                      const next = [...form.education];
                      next[i] = { ...ed, credential: e.target.value };
                      update("education", next);
                    }}
                    className={inputClass}
                    placeholder="Degree / program"
                    disabled={disabled || saving}
                  />
                  <input
                    value={ed.dates}
                    onChange={(e) => {
                      const next = [...form.education];
                      next[i] = { ...ed, dates: e.target.value };
                      update("education", next);
                    }}
                    className={inputClass}
                    placeholder="Dates"
                    disabled={disabled || saving}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => update("education", [...form.education, emptyScratchEducation()])}
                disabled={disabled || saving}
              >
                <Plus className="size-3.5 mr-1.5" strokeWidth={2} />
                Add education
              </Button>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Review</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Run <span className="font-medium text-foreground">Improve with AI</span> above to sharpen bullets and
                  summary, then continue to job targeting.
                </p>
              </div>
              <div className="rounded-xl border border-dashed border-border bg-muted/20 px-3 py-3 text-xs text-muted-foreground space-y-2 font-mono leading-relaxed max-h-[200px] overflow-y-auto">
                <p className="text-foreground font-semibold font-sans">{form.fullName.trim() || "Your name"}</p>
                {form.headline.trim() && <p className="font-sans text-foreground/90">{form.headline}</p>}
                <p className="opacity-90">
                  {[form.email, form.phone, form.location].filter(Boolean).join(" · ") || "Contact fields"}
                </p>
                {form.summary.trim() && (
                  <p className="pt-1 border-t border-border/50 whitespace-pre-wrap">{form.summary.trim().slice(0, 400)}</p>
                )}
                <p className="text-[10px] uppercase tracking-wide pt-2">
                  {form.experience.filter((e) => e.title.trim() || e.company.trim()).length} role(s) ·{" "}
                  {form.education.filter((e) => e.institution.trim()).length} education line(s)
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Next: you&apos;ll paste a job description so we can align keywords and pick layouts — that step gets you
                interview-ready faster.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && <p className="text-destructive text-sm px-1">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full text-muted-foreground"
          onClick={goBack}
          disabled={step === 1 || disabled || saving}
        >
          <ChevronLeft className="size-4 mr-1" strokeWidth={2} />
          Back
        </Button>
        <div className="flex justify-end gap-2">
          {step < 5 ? (
            <Button
              type="button"
              onClick={goNext}
              disabled={disabled || saving}
              className="rounded-full min-h-10 px-6 gap-1"
            >
              Next
              <ChevronRight className="size-4" strokeWidth={2} />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={disabled || saving}
              className="rounded-full min-h-10 px-6 gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                  Saving…
                </>
              ) : (
                <>
                  <PenLine className="size-4" strokeWidth={2} />
                  Use this resume
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
