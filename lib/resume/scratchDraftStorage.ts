import {
  defaultScratchForm,
  type ScratchFormState,
  type ScratchExperience,
  type ScratchEducation,
} from "@/lib/resume/serializeScratchResume";

export const SCRATCH_DRAFT_STORAGE_KEY = "resumify_scratch_resume_v1";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function coerceExperience(x: unknown): ScratchExperience | null {
  if (!isRecord(x)) return null;
  return {
    title: typeof x.title === "string" ? x.title : "",
    company: typeof x.company === "string" ? x.company : "",
    location: typeof x.location === "string" ? x.location : "",
    dates: typeof x.dates === "string" ? x.dates : "",
    bullets: typeof x.bullets === "string" ? x.bullets : "",
  };
}

function coerceEducation(x: unknown): ScratchEducation | null {
  if (!isRecord(x)) return null;
  return {
    institution: typeof x.institution === "string" ? x.institution : "",
    credential: typeof x.credential === "string" ? x.credential : "",
    dates: typeof x.dates === "string" ? x.dates : "",
  };
}

/** Safe parse from localStorage; falls back to defaults. */
export function parseScratchDraft(raw: string | null): ScratchFormState | null {
  if (!raw?.trim()) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!isRecord(data)) return null;
    const base = defaultScratchForm();
    const exp = Array.isArray(data.experience)
      ? data.experience.map(coerceExperience).filter(Boolean) as ScratchExperience[]
      : [];
    const edu = Array.isArray(data.education)
      ? data.education.map(coerceEducation).filter(Boolean) as ScratchEducation[]
      : [];
    return {
      fullName: typeof data.fullName === "string" ? data.fullName : base.fullName,
      headline: typeof data.headline === "string" ? data.headline : base.headline,
      email: typeof data.email === "string" ? data.email : base.email,
      phone: typeof data.phone === "string" ? data.phone : base.phone,
      location: typeof data.location === "string" ? data.location : base.location,
      linkedin: typeof data.linkedin === "string" ? data.linkedin : base.linkedin,
      summary: typeof data.summary === "string" ? data.summary : base.summary,
      skills: typeof data.skills === "string" ? data.skills : base.skills,
      experience: exp.length ? exp : [base.experience[0]],
      education: edu.length ? edu : [base.education[0]],
    };
  } catch {
    return null;
  }
}
