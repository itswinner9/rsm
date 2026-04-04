import type { OptimizedResumeData } from "@/lib/resume/types";

/** Decode common HTML entities. `&amp;` is last so `&amp;lt;` → `&lt;` → `<` on a second pass. */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/gi, "&");
}

/** Remove HTML/markup so resume fields render as plain text in React (no visible tags). */
export function stripHtmlFromText(input: string): string {
  if (!input || typeof input !== "string") return input;
  // Decode entities *before* stripping tags; otherwise &lt;p&gt; stays as text until
  // decode runs and reintroduces raw <p> that never gets stripped.
  let s = decodeHtmlEntities(input);
  s = decodeHtmlEntities(s);

  s = s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  return s.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+\n/g, "\n").trim();
}

export function sanitizeOptimizedResumeData(data: OptimizedResumeData): OptimizedResumeData {
  return {
    ...data,
    full_name: stripHtmlFromText(data.full_name),
    headline: stripHtmlFromText(data.headline),
    email: stripHtmlFromText(data.email),
    phone: stripHtmlFromText(data.phone),
    location: stripHtmlFromText(data.location),
    linkedin: stripHtmlFromText(data.linkedin),
    summary: stripHtmlFromText(data.summary),
    skills: data.skills.map(stripHtmlFromText),
    experience: data.experience.map((ex) => ({
      ...ex,
      title: stripHtmlFromText(ex.title),
      company: stripHtmlFromText(ex.company),
      location: stripHtmlFromText(ex.location),
      dates: stripHtmlFromText(ex.dates),
      bullets: ex.bullets.map(stripHtmlFromText),
    })),
    education: data.education.map((ed) => ({
      ...ed,
      institution: stripHtmlFromText(ed.institution),
      credential: stripHtmlFromText(ed.credential),
      dates: stripHtmlFromText(ed.dates),
      details: ed.details.map(stripHtmlFromText),
    })),
    certifications: data.certifications.map(stripHtmlFromText),
    projects: data.projects.map((p) => ({
      ...p,
      name: stripHtmlFromText(p.name),
      description: stripHtmlFromText(p.description),
      bullets: p.bullets.map(stripHtmlFromText),
    })),
  };
}
