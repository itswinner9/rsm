import type { OptimizedResumeData } from "@/lib/resume/types";
import { cn } from "@/lib/utils";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[12pt] font-bold text-foreground tracking-tight mt-5 mb-2 first:mt-0 pb-1 border-b-2 border-neutral-800/80">
      {children}
    </h2>
  );
}

export function ResumeTemplateExecutive({
  data,
  bodyClass,
}: {
  data: OptimizedResumeData;
  bodyClass: string;
}) {
  const lines = [data.email, data.phone, data.location, data.linkedin].filter(Boolean);

  return (
    <div className={cn(bodyClass)}>
      <header className="border-b border-neutral-200 pb-4 mb-1">
        <h1 className="text-[24px] font-bold tracking-tight text-foreground">{data.full_name}</h1>
        {data.headline ? (
          <p className="text-[12pt] font-semibold text-neutral-800 mt-1.5">{data.headline}</p>
        ) : null}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[10.5pt] text-neutral-600">
          {lines.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      </header>

      {data.summary ? (
        <>
          <SectionTitle>Summary</SectionTitle>
          <p className="leading-relaxed whitespace-pre-wrap text-neutral-800">{data.summary}</p>
        </>
      ) : null}

      {data.skills.length > 0 ? (
        <>
          <SectionTitle>Skills</SectionTitle>
          <p className="leading-relaxed text-neutral-800">{data.skills.join("  •  ")}</p>
        </>
      ) : null}

      {data.experience.length > 0 ? (
        <>
          <SectionTitle>Experience</SectionTitle>
          <div className="space-y-4">
            {data.experience.map((ex, i) => (
              <div key={i}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-[11.5pt] font-bold text-foreground">{ex.title}</span>
                  <span className="text-[10pt] text-neutral-500 shrink-0">{ex.dates}</span>
                </div>
                <p className="text-[10.5pt] text-neutral-700 font-medium italic">
                  {ex.company}
                  {ex.location ? ` · ${ex.location}` : ""}
                </p>
                <ul className="list-none mt-2 space-y-1.5 pl-0">
                  {ex.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2 text-neutral-800">
                      <span className="text-neutral-400 shrink-0">▸</span>
                      <span>{b}</span>
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
          <div className="space-y-3">
            {data.projects.map((p, i) => (
              <div key={i}>
                <p className="font-bold text-[11pt]">{p.name}</p>
                {p.description ? <p className="text-neutral-700 mt-0.5">{p.description}</p> : null}
                <ul className="list-none mt-1 space-y-1 pl-0">
                  {p.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="text-neutral-400 shrink-0">▸</span>
                      <span>{b}</span>
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
                  <p className="font-bold text-[11pt] text-foreground">{ed.institution}</p>
                  {ed.dates ? (
                    <span className="text-[10pt] text-neutral-500 shrink-0 tabular-nums">{ed.dates}</span>
                  ) : null}
                </div>
                <p className="text-[10.5pt] text-neutral-800 mt-0.5">{ed.credential}</p>
                {ed.details?.length ? (
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-[10.5pt] leading-[1.45] text-neutral-800">
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
          <ul className="list-none space-y-1">
            {data.certifications.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-neutral-400 shrink-0">▸</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
