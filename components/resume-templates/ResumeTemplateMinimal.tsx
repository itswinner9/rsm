import type { OptimizedResumeData } from "@/lib/resume/types";
import { cn } from "@/lib/utils";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10pt] font-semibold text-neutral-500 uppercase tracking-[0.2em] mt-6 mb-2 first:mt-0">
      {children}
    </h2>
  );
}

export function ResumeTemplateMinimal({
  data,
  bodyClass,
}: {
  data: OptimizedResumeData;
  bodyClass: string;
}) {
  const contact = [data.email, data.phone, data.location, data.linkedin].filter(Boolean).join(" · ");

  return (
    <div className={cn(bodyClass)}>
      <header className="text-center mb-6">
        <h1 className="text-[26px] font-light tracking-wide text-foreground">{data.full_name}</h1>
        {data.headline ? (
          <p className="text-[11pt] font-normal text-neutral-600 mt-2">{data.headline}</p>
        ) : null}
        {contact ? <p className="text-[10pt] text-neutral-500 mt-3 leading-relaxed">{contact}</p> : null}
      </header>

      {data.skills.length > 0 ? (
        <>
          <SectionTitle>Skills</SectionTitle>
          <p className="text-[10.5pt] leading-relaxed text-neutral-800 text-center">{data.skills.join(" · ")}</p>
        </>
      ) : null}

      {data.summary ? (
        <>
          <SectionTitle>Summary</SectionTitle>
          <p className="whitespace-pre-wrap text-[10.5pt] leading-[1.75] text-neutral-800 font-light text-justify">
            {data.summary}
          </p>
        </>
      ) : null}

      {data.experience.length > 0 ? (
        <>
          <SectionTitle>Experience</SectionTitle>
          <div className="space-y-5">
            {data.experience.map((ex, i) => (
              <div key={i}>
                <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 items-baseline">
                  <span className="text-[11pt] font-medium text-foreground">{ex.title}</span>
                  <span className="text-[10pt] text-neutral-400 shrink-0">{ex.dates}</span>
                </div>
                <p className="text-[10pt] text-neutral-600 mt-0.5">
                  {ex.company}
                  {ex.location ? ` — ${ex.location}` : ""}
                </p>
                <ul className="mt-2 space-y-2 text-[10.5pt] leading-[1.65] text-neutral-800 font-light">
                  {ex.bullets.map((b, j) => (
                    <li key={j} className="pl-3 border-l border-neutral-200">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {data.projects && data.projects.length > 0 ? (
        <>
          <SectionTitle>Projects</SectionTitle>
          <div className="space-y-4">
            {data.projects.map((p, i) => (
              <div key={i}>
                <p className="font-medium text-[10.5pt]">{p.name}</p>
                {p.description ? <p className="text-[10pt] text-neutral-600 mt-1">{p.description}</p> : null}
                <ul className="mt-1.5 space-y-1 text-[10pt] text-neutral-800 font-light">
                  {p.bullets.map((b, j) => (
                    <li key={j} className="pl-3 border-l border-neutral-200">
                      {b}
                    </li>
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
          <div className="space-y-3">
            {data.education.map((ed, i) => (
              <div key={i}>
                <div className="flex flex-wrap justify-between gap-x-2 gap-y-0.5 items-baseline">
                  <p className="font-medium text-[10.5pt] text-foreground">{ed.institution}</p>
                  {ed.dates ? <span className="text-[10pt] text-neutral-400 shrink-0">{ed.dates}</span> : null}
                </div>
                <p className="text-[10pt] text-neutral-700 mt-0.5">{ed.credential}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {data.certifications && data.certifications.length > 0 ? (
        <>
          <SectionTitle>Certifications</SectionTitle>
          <ul className="space-y-1.5 text-[10.5pt] text-neutral-800 font-light">
            {data.certifications.map((c, i) => (
              <li key={i} className="pl-3 border-l border-neutral-200">
                {c}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
