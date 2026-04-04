/** Plain-text resume for optimize API / parse-resume paste (Canadian-style section headers). */

export type ScratchExperience = {
  title: string;
  company: string;
  location: string;
  dates: string;
  bullets: string;
};

export type ScratchEducation = {
  institution: string;
  credential: string;
  dates: string;
};

export type ScratchFormState = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  skills: string;
  experience: ScratchExperience[];
  education: ScratchEducation[];
};

export function serializeScratchResumeToText(data: ScratchFormState): string {
  const lines: string[] = [];
  const name = data.fullName.trim() || "Candidate";
  lines.push(name);
  if (data.headline.trim()) lines.push(data.headline.trim());
  const contact = [data.email, data.phone, data.location, data.linkedin].filter((s) => s.trim());
  if (contact.length) lines.push(contact.join(" | "));
  lines.push("");

  if (data.summary.trim()) {
    lines.push("PROFESSIONAL SUMMARY");
    lines.push(data.summary.trim());
    lines.push("");
  }

  if (data.skills.trim()) {
    lines.push("SKILLS");
    lines.push(data.skills.trim());
    lines.push("");
  }

  const expBlocks = data.experience.filter(
    (e) => e.title.trim() || e.company.trim() || e.bullets.trim()
  );
  if (expBlocks.length) {
    lines.push("WORK EXPERIENCE");
    for (const ex of expBlocks) {
      const head = [ex.title.trim(), ex.company.trim()].filter(Boolean).join(" — ");
      if (head) lines.push(head);
      const meta = [ex.location.trim(), ex.dates.trim()].filter(Boolean).join(" · ");
      if (meta) lines.push(meta);
      const bullets = ex.bullets
        .split(/\n+/)
        .map((b) => b.replace(/^[•\-\*·]\s*/, "").trim())
        .filter(Boolean);
      for (const b of bullets) lines.push(`• ${b}`);
      lines.push("");
    }
  }

  const eduBlocks = data.education.filter((e) => e.institution.trim() || e.credential.trim());
  if (eduBlocks.length) {
    lines.push("EDUCATION");
    for (const ed of eduBlocks) {
      const line = [ed.institution.trim(), ed.credential.trim()].filter(Boolean).join(" — ");
      if (line) lines.push(line);
      if (ed.dates.trim()) lines.push(ed.dates.trim());
      lines.push("");
    }
  }

  return lines.join("\n").trim();
}

export const emptyScratchExperience = (): ScratchExperience => ({
  title: "",
  company: "",
  location: "",
  dates: "",
  bullets: "",
});

export const emptyScratchEducation = (): ScratchEducation => ({
  institution: "",
  credential: "",
  dates: "",
});

export const defaultScratchForm = (): ScratchFormState => ({
  fullName: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  summary: "",
  skills: "",
  experience: [emptyScratchExperience()],
  education: [emptyScratchEducation()],
});
