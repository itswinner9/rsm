import {
  emptyScratchEducation,
  emptyScratchExperience,
  type ScratchEducation,
  type ScratchExperience,
  type ScratchFormState,
} from "@/lib/resume/serializeScratchResume";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function takeStr(x: unknown, fallback: string): string {
  return typeof x === "string" ? x : fallback;
}

function mergeExperience(parsed: unknown, fallback: ScratchExperience[]): ScratchExperience[] {
  if (!Array.isArray(parsed) || parsed.length === 0) return fallback.length ? fallback : [emptyScratchExperience()];
  return parsed.map((row, i) => {
    const fb = fallback[i] ?? emptyScratchExperience();
    if (!isRecord(row)) return fb;
    return {
      title: takeStr(row.title, fb.title),
      company: takeStr(row.company, fb.company),
      location: takeStr(row.location, fb.location),
      dates: takeStr(row.dates, fb.dates),
      bullets: takeStr(row.bullets, fb.bullets),
    };
  });
}

function mergeEducation(parsed: unknown, fallback: ScratchEducation[]): ScratchEducation[] {
  if (!Array.isArray(parsed) || parsed.length === 0) return fallback.length ? fallback : [emptyScratchEducation()];
  return parsed.map((row, i) => {
    const fb = fallback[i] ?? emptyScratchEducation();
    if (!isRecord(row)) return fb;
    return {
      institution: takeStr(row.institution, fb.institution),
      credential: takeStr(row.credential, fb.credential),
      dates: takeStr(row.dates, fb.dates),
    };
  });
}

/** Merge AI JSON onto existing form; keeps structure if AI omits fields. */
export function mergePolishedScratchForm(parsed: unknown, existing: ScratchFormState): ScratchFormState {
  if (!isRecord(parsed)) return existing;
  return {
    fullName: takeStr(parsed.fullName, existing.fullName),
    headline: takeStr(parsed.headline, existing.headline),
    email: takeStr(parsed.email, existing.email),
    phone: takeStr(parsed.phone, existing.phone),
    location: takeStr(parsed.location, existing.location),
    linkedin: takeStr(parsed.linkedin, existing.linkedin),
    summary: takeStr(parsed.summary, existing.summary),
    skills: takeStr(parsed.skills, existing.skills),
    experience: mergeExperience(parsed.experience, existing.experience),
    education: mergeEducation(parsed.education, existing.education),
  };
}
