import type { OptimizedResumeData } from "@/lib/resume/types";
import { cn } from "@/lib/utils";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11pt] font-bold uppercase text-foreground bg-neutral-100 px-2 py-1 mt-3 mb-1.5 first:mt-0">
      {children}
    </h2>
  );
}

export function ResumeTemplateCompact({
  data,
  bodyClass,
}: {
  data: OptimizedResumeData;
  bodyClass: string;
}) {
  const contact = [data.email, data.phone, data.location, data.linkedin].filter(Boolean).join(" · ");

  return (
    <div className={cn(bodyClass)}>
      <header className="mb-2">
        <h1 className="text-[22px] font-bold text-foreground">{data.full_name}</h1>
        {data.headline ? <p className="text-[11pt] font-semibold text-neutral-800 mt-0.5">{data.headline}</p> : null}
        {contact ? <p className="text-[10pt] text-neutral-600 mt-1.5">{contact}</p> : null}
      </header>

      {data.skills.length > 0 ? (
        <>
          <SectionTitle>Core skills</SectionTitle>
          <p className="font-medium text-neutral-900">{data.skills.join(" · ")}</p>
        </>
      ) : null}

      {data.summary ? (
        <>
          <SectionTitle>Professional summary</SectionTitle>
          <p className="whitespace-pre-wrap text-[10.5pt] leading-[1.5] text-neutral-800">{data.summary}</p>
        </>
      ) : null}

      {data.experience.length > 0 ? (
        <>
          <SectionTitle>Experience</SectionTitle>
          <div className="space-y-2.5">
            {data.experience.map((ex, i) => (
              <div key={i}>
                <div className="flex flex-wrap justify-between gap-1 text-[11pt] font-bold">
                  <span>{ex.title}</span>
                  <span className="font-normal text-[10pt] text-neutral-600">{ex.dates}</span>
                </div>
                <p className="text-[10pt] text-neutral-700">
                  {ex.company}
                  {ex.location ? ` — ${ex.location}` : ""}
                </p>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-[10.5pt] leading-[1.45] text-neutral-800">
                  {ex.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {data.projects && data.projects.length > 0 ? (
        <>
          <SectionTitle>Projects & volunteer</SectionTitle>
          <div className="space-y-2">
            {data.projects.map((p, i) => (
              <div key={i}>
                <p className="font-bold text-[10.5pt]">{p.name}</p>
                {p.description ? <p className="text-[10pt] text-neutral-700">{p.description}</p> : null}
                <ul className="list-disc pl-4 text-[10pt] space-y-0.5">
                  {p.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {data.education.length > 0 ? (
        <>
          <SectionTitle>Education</SectionTitle>
          <div className="space-y-2">
            {data.education.map((ed, i) => (
              <div key={i}>
                <div className="flex flex-wrap justify-between gap-x-2 gap-y-0.5 items-baseline">
                  <p className="font-semibold text-[10.5pt] text-foreground">{ed.institution}</p>
                  {ed.dates ? (
                    <span className="text-[10pt] text-neutral-600 tabular-nums shrink-0">{ed.dates}</span>
                  ) : null}
                </div>
                <p className="text-[10pt] text-neutral-800 mt-0.5">{ed.credential}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {data.certifications && data.certifications.length > 0 ? (
        <>
          <SectionTitle>Certifications</SectionTitle>
          <ul className="list-disc pl-4 space-y-0.5 text-[10pt]">
            {data.certifications.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
