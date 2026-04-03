/**
 * Coerce common LLM shape mistakes (camelCase, string vs array, cert objects)
 * before Zod validation in optimize-resume.
 */

const TOP_ALIASES: Record<string, string> = {
  jobTitle: "job_title",
  companyName: "company_name",
  aiScore: "ai_score",
  atsScore: "ats_score",
  matchedKeywords: "matched_keywords",
  missingKeywords: "missing_keywords",
  suggestedTemplate: "suggested_template",
  optimizedResumeData: "optimized_resume_data",
};

const RESUME_ALIASES: Record<string, string> = {
  fullName: "full_name",
  linkedIn: "linkedin",
};

function applyAliases<T extends Record<string, unknown>>(obj: T, map: Record<string, string>): T {
  const out = { ...obj } as Record<string, unknown>;
  for (const [alias, canonical] of Object.entries(map)) {
    if (out[canonical] === undefined && out[alias] !== undefined) {
      out[canonical] = out[alias];
    }
  }
  return out as T;
}

function normalizeStrArray(v: unknown): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) {
    return v
      .map((x) => (typeof x === "string" ? x : x == null ? "" : String(x)))
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof v === "string") {
    return v
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/** Bullets: array, single string with newlines, or one long paragraph. */
function normalizeBullets(v: unknown): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) {
    return v
      .map((x) => (typeof x === "string" ? x : String(x)))
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof v === "string") {
    const lines = v
      .split(/\n+/)
      .map((s) => s.replace(/^[•\-\*·]\s*/, "").trim())
      .filter(Boolean);
    if (lines.length > 1) return lines;
    if (v.length > 120) return [v.trim()];
    return v.trim() ? [v.trim()] : [];
  }
  return [];
}

function normalizeCertifications(v: unknown): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) {
    return v.flatMap((item) => {
      if (typeof item === "string") return item.trim() ? [item.trim()] : [];
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const s = String(o.name ?? o.title ?? o.credential ?? o.certification ?? "").trim();
        return s ? [s] : [];
      }
      return [];
    });
  }
  if (typeof v === "string") return v.trim() ? [v.trim()] : [];
  return [];
}

function normalizeExperience(v: unknown): unknown[] {
  if (!Array.isArray(v)) return [];
  return v.map((ex) => {
    if (!ex || typeof ex !== "object") {
      return { title: "", company: "", location: "", dates: "", bullets: [] };
    }
    const e = ex as Record<string, unknown>;
    return {
      title: String(e.title ?? ""),
      company: String(e.company ?? e.employer ?? ""),
      location: e.location == null ? "" : String(e.location),
      dates: String(e.dates ?? e.dateRange ?? ""),
      bullets: normalizeBullets(e.bullets ?? e.highlights ?? e.responsibilities),
    };
  });
}

function normalizeEducation(v: unknown): unknown[] {
  if (!Array.isArray(v)) return [];
  return v.map((ed) => {
    if (!ed || typeof ed !== "object") {
      return { institution: "", credential: "", dates: "", details: [] };
    }
    const e = ed as Record<string, unknown>;
    const detailsRaw = e.details ?? e.coursework ?? e.honors;
    return {
      institution: String(e.institution ?? e.school ?? ""),
      credential: String(e.credential ?? e.degree ?? e.program ?? ""),
      dates: e.dates == null ? "" : String(e.dates),
      details: normalizeStrArray(detailsRaw),
    };
  });
}

function normalizeProjects(v: unknown): unknown[] {
  if (!Array.isArray(v)) return [];
  return v.map((p) => {
    if (!p || typeof p !== "object") {
      return { name: "", description: "", bullets: [] };
    }
    const x = p as Record<string, unknown>;
    return {
      name: String(x.name ?? x.title ?? ""),
      description: x.description == null ? "" : String(x.description),
      bullets: normalizeBullets(x.bullets ?? x.highlights),
    };
  });
}

function normalizeOptimizedResumeData(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") {
    return {
      full_name: "Candidate",
      headline: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      summary: "",
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      projects: [],
    };
  }
  let r = { ...(raw as Record<string, unknown>) };
  r = applyAliases(r, RESUME_ALIASES);

  const str = (k: string, fallback = "") => {
    const v = r[k];
    if (v == null) return fallback;
    return typeof v === "string" ? v : String(v);
  };

  const fullName = str("full_name").trim() || "Candidate";

  return {
    full_name: fullName,
    headline: str("headline"),
    email: str("email"),
    phone: str("phone"),
    location: str("location"),
    linkedin: str("linkedin"),
    summary: str("summary"),
    skills: normalizeStrArray(r.skills),
    experience: normalizeExperience(r.experience),
    education: normalizeEducation(r.education),
    certifications: normalizeCertifications(r.certifications),
    projects: normalizeProjects(r.projects),
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function toFiniteNumber(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeAiOptimizePayload(input: unknown): unknown {
  if (!input || typeof input !== "object") return input;
  let o = applyAliases({ ...(input as Record<string, unknown>) }, TOP_ALIASES);

  if (o.ai_score !== undefined && o.ai_score !== null) {
    o.ai_score = clamp(toFiniteNumber(o.ai_score, 20), 0, 40);
  }
  if (o.ats_score !== undefined && o.ats_score !== null) {
    o.ats_score = clamp(toFiniteNumber(o.ats_score, 0), 0, 100);
  }

  for (const key of [
    "matched_keywords",
    "missing_keywords",
    "strengths",
    "weaknesses",
    "suggestions",
    "what_to_add",
    "improvements",
  ] as const) {
    if (key in o) o[key] = normalizeStrArray(o[key]);
  }

  let template = o.suggested_template;
  if (Array.isArray(template) && template.length) template = template[0];
  if (typeof template === "number") {
    const map = ["classic", "executive", "compact"] as const;
    template = map[template] ?? "classic";
  }
  if (typeof template === "string") {
    const t = template.toLowerCase().trim();
    if (t === "classic" || t === "executive" || t === "compact") {
      o.suggested_template = t;
    } else {
      o.suggested_template = "classic";
    }
  } else {
    o.suggested_template = "classic";
  }

  o.job_title = o.job_title == null ? "" : String(o.job_title);
  o.company_name = o.company_name == null ? "" : String(o.company_name);

  o.optimized_resume_data = normalizeOptimizedResumeData(o.optimized_resume_data);

  return o;
}
