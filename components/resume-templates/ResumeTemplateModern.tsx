import type { OptimizedResumeData } from "@/lib/resume/types";
import { cn } from "@/lib/utils";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11pt] font-bold uppercase tracking-[0.08em] text-primary border-l-4 border-primary pl-2.5 mt-4 mb-2 first:mt-0">
      {children}
    </h2>
  );
}

export function ResumeTemplateModern({
  data,
  bodyClass,
}: {
  data: OptimizedResumeData;
  bodyClass: string;
}) {
  const lines = [data.email, data.phone, data.location, data.linkedin].filter(Boolean);

  return (
    <div className={cn(bodyClass, "flex gap-0")}>
      <div className="w-1 shrink-0 bg-primary/85 rounded-sm min-h-[40mm]" aria-hidden />
      <div className="flex-1 min-w-0 pl-4">
        <header className="pb-3 mb-1 border-b border-neutral-200">
          <h1 className="text-[24px] font-bold tracking-tight text-foreground">{data.full_name}</h1>
          {data.headline ? (
            <p className="text-[12pt] font-semibold text-primary mt-1">{data.headline}</p>
          ) : null}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 text-[10.5pt] text-neutral-600">
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
            <p className="leading-relaxed text-neutral-800">{data.skills.join(" · ")}</p>
          </>
        ) : null}

        {data.experience.length > 0 ? (
          <>
            <SectionTitle>Experience</SectionTitle>
            <div className="space-y-3.5">
              {data.experience.map((ex, i) => (
                <div key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[11.5pt] font-bold text-foreground">{ex.title}</span>
                    <span className="text-[10pt] text-primary/80 shrink-0 font-medium">{ex.dates}</span>
                  </div>
                  <p className="text-[10.5pt] text-neutral-700 font-medium">
                    {ex.company}
                    {ex.location ? ` · ${ex.location}` : ""}
                  </p>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1 text-[10.5pt] leading-[1.45] text-neutral-800">
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
            <SectionTitle>Projects</SectionTitle>
            <div className="space-y-2.5">
              {data.projects.map((p, i) => (
                <div key={i}>
                  <p className="font-bold text-[11pt]">{p.name}</p>
                  {p.description ? <p className="text-neutral-700 mt-0.5 text-[10.5pt]">{p.description}</p> : null}
                  <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[10.5pt]">
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
                    <p className="font-bold text-[11pt] text-foreground">{ed.institution}</p>
                    {ed.dates ? (
                      <span className="text-[10pt] text-neutral-500 shrink-0 tabular-nums">{ed.dates}</span>
                    ) : null}
                  </div>
                  <p className="text-[10.5pt] text-neutral-800 mt-0.5">{ed.credential}</p>
                  {ed.details?.length ? (
                    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[10.5pt] text-neutral-800">
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
            <ul className="list-disc pl-5 space-y-1 text-[10.5pt]">
              {data.certifications.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  );
}
