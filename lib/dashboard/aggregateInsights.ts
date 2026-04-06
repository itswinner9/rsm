import { presentationMatchScore } from "@/lib/resume/jdKeywordMatchScore";

/** Shape stored in `generated_resumes` for new optimizations (not legacy template array). */
export type MasterAnalysisV1 = {
  format?: "master_v1";
  matched_keywords?: string[];
  missing_keywords?: string[];
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  what_to_add?: string[];
  improvements?: string[];
  suggested_template?: string;
};

export function parseMasterAnalysis(generatedResumes: unknown): MasterAnalysisV1 | null {
  if (!generatedResumes || typeof generatedResumes !== "object" || Array.isArray(generatedResumes)) {
    return null;
  }
  const o = generatedResumes as Record<string, unknown>;
  if (o.format === "master_v1") return generatedResumes as MasterAnalysisV1;
  if (
    Array.isArray(o.missing_keywords) ||
    Array.isArray(o.strengths) ||
    Array.isArray(o.suggestions) ||
    Array.isArray(o.what_to_add)
  ) {
    return generatedResumes as MasterAnalysisV1;
  }
  return null;
}

type GenRow = {
  ats_score_original?: number | null;
  ats_score_optimized?: number | null;
  generated_resumes?: unknown;
};

/** Average displayed match % lift (optimized − original) across runs that have both scores. */
export function averageMatchLiftPercent(generations: GenRow[]): number | null {
  const lifts: number[] = [];
  for (const g of generations) {
    if (g.ats_score_original == null || g.ats_score_optimized == null) continue;
    const o = presentationMatchScore(g.ats_score_original);
    const p = presentationMatchScore(g.ats_score_optimized);
    lifts.push(p - o);
  }
  if (!lifts.length) return null;
  return Math.round((lifts.reduce((a, b) => a + b, 0) / lifts.length) * 10) / 10;
}

function normalizeKeyword(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Recurring JD terms still light in your runs — aggregate `missing_keywords` from recent master analyses. */
export function aggregateMissingKeywordThemes(
  generations: GenRow[],
  opts: { maxRuns?: number; topN?: number } = {}
): { term: string; count: number }[] {
  const maxRuns = opts.maxRuns ?? 12;
  const topN = opts.topN ?? 8;
  const counts = new Map<string, { display: string; count: number }>();

  let seen = 0;
  for (const g of generations) {
    if (seen >= maxRuns) break;
    const a = parseMasterAnalysis(g.generated_resumes);
    if (!a?.missing_keywords?.length) continue;
    seen += 1;
    for (const raw of a.missing_keywords) {
      const term = typeof raw === "string" ? raw.trim() : "";
      if (!term) continue;
      const key = normalizeKeyword(term);
      const cur = counts.get(key);
      if (cur) cur.count += 1;
      else counts.set(key, { display: term.length > 48 ? `${term.slice(0, 45)}…` : term, count: 1 });
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count || a.display.localeCompare(b.display))
    .slice(0, topN)
    .map(({ display, count }) => ({ term: display, count }));
}

export function latestPrepInsights(generations: GenRow[]): {
  strengths: string[];
  whatToAdd: string[];
  suggestions: string[];
} | null {
  for (const g of generations) {
    const a = parseMasterAnalysis(g.generated_resumes);
    if (!a) continue;
    const strengths = (a.strengths ?? []).filter((x) => typeof x === "string" && x.trim()).slice(0, 4);
    const whatToAdd = (a.what_to_add ?? []).filter((x) => typeof x === "string" && x.trim()).slice(0, 4);
    const suggestions = (a.suggestions ?? []).filter((x) => typeof x === "string" && x.trim()).slice(0, 4);
    if (strengths.length || whatToAdd.length || suggestions.length) {
      return { strengths, whatToAdd, suggestions };
    }
  }
  return null;
}
