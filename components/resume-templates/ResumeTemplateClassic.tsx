import type { OptimizedResumeData } from "@/lib/resume/types";
import { cn } from "@/lib/utils";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11pt] font-bold uppercase tracking-wide text-foreground border-b border-neutral-300 pb-1 mt-4 mb-2 first:mt-0">
      {children}
    </h2>
  );
}

export function ResumeTemplateClassic({
  data,
  bodyClass,
}: {
  data: OptimizedResumeData;
  bodyClass: string;
}) {
  const contact = [data.email, data.phone, data.location, data.linkedin].filter(Boolean).join(" | ");

  return (
    <div className={cn(bodyClass)}>
      <header className="text-center mb-3">
        <h1 className="text-[22px] font-bold leading-tight text-foreground">{data.full_name}</h1>
        {data.headline ? (
          <p className="text-[11pt] font-semibold text-neutral-700 mt-1">{data.headline}</p>
        ) : null}
        {contact ? <p className="text-[10.5pt] text-neutral-600 mt-2">{contact}</p> : null}
      </header>

      {data.summary ? (
        <>
          <SectionTitle>Professional summary</SectionTitle>
          <p className="text-justify whitespace-pre-wrap text-[10.5pt] leading-[1.5] text-neutral-800">
            {data.summary}
          </p>
        </>
      ) : null}

      {data.skills.length > 0 ? (
        <>
          <SectionTitle>Core skills</SectionTitle>
          <p className="text-[10.5pt] leading-relaxed text-neutral-800">{data.skills.join(" · ")}</p>
        </>
      ) : null}

      {data.experience.length > 0 ? (
        <>
          <SectionTitle>Work experience</SectionTitle>
          <div className="space-y-3">
            {data.experience.map((ex, i) => (
              <div key={i}>
                <div className="flex flex-wrap justify-between gap-x-2 gap-y-0.5 font-semibold text-[11pt]">
                  <span>{ex.title}</span>
                  <span className="font-normal text-neutral-600 text-[10.5pt]">{ex.dates}</span>
                </div>
                <p className="text-[10.5pt] font-medium text-neutral-800">
                  {ex.company}
                  {ex.location ? ` — ${ex.location}` : ""}
                </p>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-[10.5pt] leading-[1.45] text-neutral-800">
                  {ex.bullets.map((b, j) => (
                    <li key={j} className="pl-0.5">
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
          <div className="space-y-2">
            {data.projects.map((p, i) => (
              <div key={i}>
                <p className="font-semibold text-[11pt]">{p.name}</p>
                {p.description ? <p className="text-neutral-700">{p.description}</p> : null}
                <ul className="list-disc pl-5 mt-0.5 space-y-0.5">
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
          <div className="space-y-2.5">
            {data.education.map((ed, i) => (
              <div key={i}>
                <div className="flex flex-wrap justify-between gap-x-2 gap-y-0.5 items-baseline">
                  <span className="font-semibold text-[11pt] text-foreground">{ed.institution}</span>
                  {ed.dates ? (
                    <span className="font-normal text-neutral-600 text-[10.5pt] tabular-nums shrink-0">{ed.dates}</span>
                  ) : null}
                </div>
                <p className="text-[10.5pt] text-neutral-800 mt-0.5">{ed.credential}</p>
                {ed.details?.length ? (
                  <ul className="list-disc pl-5 mt-0.5 space-y-0.5">
                    {ed.details.map((d, j) => (
                      <li key={j}>{d}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </>
      ) : null}

      {data.certifications && data.certifications.length > 0 ? (
        <>
          <SectionTitle>Certifications</SectionTitle>
          <ul className="list-disc pl-5 space-y-1 text-[10.5pt] leading-[1.45] text-neutral-800">
            {data.certifications.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
