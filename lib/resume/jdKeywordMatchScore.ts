import type { OptimizedResumeData } from "@/lib/resume/types";

const STOP = new Set(
  `the a an and or but in on at to for of is are was were be been being it this that these those as by with from than then so if into about over after before between both each few more most other some such no nor not only same than too very can will just don should now`.split(
    /\s+/
  )
);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function jdTermList(jd: string, maxUnigrams = 45, maxBigrams = 18): string[] {
  const tokens = tokenize(jd);
  if (tokens.length === 0) return [];

  const uniFreq = new Map<string, number>();
  for (const t of tokens) {
    uniFreq.set(t, (uniFreq.get(t) || 0) + 1);
  }
  const unigrams = Array.from(uniFreq.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, maxUnigrams)
    .map(([w]) => w);

  const biFreq = new Map<string, number>();
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    const phrase = `${a} ${b}`;
    biFreq.set(phrase, (biFreq.get(phrase) || 0) + 1);
  }
  const bigrams = Array.from(biFreq.entries())
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, maxBigrams)
    .map(([w]) => w);

  const out: string[] = [];
  const seen = new Set<string>();
  for (const b of bigrams) {
    if (!seen.has(b)) {
      seen.add(b);
      out.push(b);
    }
  }
  for (const u of unigrams) {
    if (!seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  }
  return out.slice(0, maxUnigrams + maxBigrams);
}

/** Flatten structured resume to plain text for keyword overlap. */
export function flattenOptimizedResumeText(data: OptimizedResumeData): string {
  const parts: string[] = [];
  parts.push(data.headline, data.summary, data.email, data.phone, data.location, data.linkedin);
  parts.push(...data.skills);
  for (const ex of data.experience) {
    parts.push(ex.title, ex.company, ex.location, ex.dates, ...ex.bullets);
  }
  for (const ed of data.education) {
    parts.push(ed.institution, ed.credential, ed.dates, ...ed.details);
  }
  parts.push(...data.certifications);
  for (const p of data.projects) {
    parts.push(p.name, p.description ?? "", ...p.bullets);
  }
  return parts.filter(Boolean).join(" \n ");
}

/**
 * Percentage of JD-derived terms (unigrams + frequent bigrams) found in resume text.
 */
export function jdKeywordMatchScore(resumePlain: string, jobDescription: string): number {
  const terms = jdTermList(jobDescription);
  if (terms.length === 0) return 0;
  const hay = resumePlain.toLowerCase();
  let hits = 0;
  for (const term of terms) {
    if (hay.includes(term)) hits++;
  }
  const raw = (hits / terms.length) * 100;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

/**
 * User-facing match %: keeps critically poor overlap honest (below 15%), otherwise maps into a clearer
 * “strong fit” band (~70–93) so typical runs read like 70s–90s without hiding disastrous mismatch.
 */
export function presentationMatchScore(raw: number): number {
  const r = Math.min(100, Math.max(0, raw));
  if (r < 15) return Math.round(r);
  return Math.min(95, Math.round(70 + ((r - 15) / (100 - 15)) * 23));
}
