import { z } from "zod";

export const resumeTemplateIdSchema = z.enum([
  "classic",
  "executive",
  "compact",
  "modern",
  "minimal",
]);
export type ResumeTemplateId = z.infer<typeof resumeTemplateIdSchema>;

/** All layouts shown in builder / exports (single source of truth). */
export const ALL_TEMPLATE_IDS = [
  "classic",
  "executive",
  "compact",
  "modern",
  "minimal",
] as const satisfies readonly ResumeTemplateId[];

const strArr = z
  .array(z.string())
  .nullish()
  .transform((v) => v ?? []);

export const experienceEntrySchema = z.object({
  title: z.string().default(""),
  company: z.string().default(""),
  location: z.string().nullish().transform((v) => v ?? ""),
  dates: z.string().default(""),
  bullets: strArr,
});

export const educationEntrySchema = z.object({
  institution: z.string().default(""),
  credential: z.string().default(""),
  dates: z.string().nullish().transform((v) => v ?? ""),
  details: strArr,
});

export const projectEntrySchema = z.object({
  name: z.string().default(""),
  description: z.string().nullish().transform((v) => v ?? ""),
  bullets: strArr,
});

export const optimizedResumeDataSchema = z.object({
  full_name: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (typeof v === "string" ? v.trim() : v != null ? String(v).trim() : "") || "Candidate"),
  headline: z.string().nullish().transform((v) => v ?? ""),
  email: z.string().nullish().transform((v) => v ?? ""),
  phone: z.string().nullish().transform((v) => v ?? ""),
  location: z.string().nullish().transform((v) => v ?? ""),
  linkedin: z.string().nullish().transform((v) => v ?? ""),
  summary: z.string().nullish().transform((v) => v ?? ""),
  skills: strArr,
  experience: z.array(experienceEntrySchema).nullish().transform((v) => v ?? []),
  education: z.array(educationEntrySchema).nullish().transform((v) => v ?? []),
  certifications: strArr,
  projects: z.array(projectEntrySchema).nullish().transform((v) => v ?? []),
});

export type OptimizedResumeData = z.infer<typeof optimizedResumeDataSchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;

/** Raw LLM payload before normalization */
export const aiOptimizeResponseSchema = z.object({
  job_title: z.string().nullish().transform((v) => v ?? ""),
  company_name: z.string().nullish().transform((v) => v ?? ""),
  /** Legacy; ATS scores are computed server-side from JD keyword overlap. */
  ai_score: z.coerce.number().min(0).max(40).optional(),
  ats_score: z.coerce.number().min(0).max(100).optional(),
  matched_keywords: strArr,
  missing_keywords: strArr,
  strengths: strArr,
  weaknesses: strArr,
  suggestions: strArr,
  what_to_add: strArr,
  improvements: strArr,
  suggested_template: resumeTemplateIdSchema.catch("classic"),
  optimized_resume_data: optimizedResumeDataSchema,
});

export type AIOptimizeResponse = z.infer<typeof aiOptimizeResponseSchema>;

export const TEMPLATE_META: Record<
  ResumeTemplateId,
  { label: string; description: string }
> = {
  classic: {
    label: "Classic ATS Professional",
    description: "Safe, familiar sections—best default for most ATS parsers and long work history.",
  },
  executive: {
    label: "Modern Executive Clean",
    description: "Spacious one-column polish; strong for senior roles and crisp PDFs.",
  },
  compact: {
    label: "Compact Skills Focused",
    description: "Skills and summary up front—great for career changes and keyword-dense roles.",
  },
  modern: {
    label: "Contemporary Sidebar Accent",
    description: "Bold header with accent rail—stands out while staying ATS-friendly.",
  },
  minimal: {
    label: "Minimal Open White",
    description: "Generous spacing and light typography—readable and calm for any level.",
  },
};

/** Short name for compact UI (e.g. dashboard rows). */
export const TEMPLATE_SHORT_LABEL: Record<ResumeTemplateId, string> = {
  classic: "Classic",
  executive: "Executive",
  compact: "Compact",
  modern: "Modern",
  minimal: "Minimal",
};

const TEMPLATE_ID_SET = new Set<string>(ALL_TEMPLATE_IDS);

export function parseResumeTemplateId(id: unknown): ResumeTemplateId | null {
  if (typeof id === "string" && TEMPLATE_ID_SET.has(id)) return id as ResumeTemplateId;
  return null;
}

export function normalizeOptimizedResume(
  raw: unknown
): { data: OptimizedResumeData; rest: Omit<AIOptimizeResponse, "optimized_resume_data"> } {
  const parsed = aiOptimizeResponseSchema.parse(raw);
  const { optimized_resume_data, ...rest } = parsed;
  const data = optimizedResumeDataSchema.parse(optimized_resume_data);
  return { data, rest };
}
