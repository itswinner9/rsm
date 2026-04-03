import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from "docx";
import type { OptimizedResumeData, ResumeTemplateId } from "@/lib/resume/types";

function bulletsParagraphs(lines: string[]): Paragraph[] {
  return lines.map(
    (line) =>
      new Paragraph({
        indent: { left: 360, hanging: 180 },
        children: [new TextRun({ text: line, size: 21 })],
        spacing: { after: 60 },
      })
  );
}

function sectionBar(title: string, style: "classic" | "exec" | "compact"): Paragraph {
  if (style === "compact") {
    return new Paragraph({
      shading: { type: "clear", fill: "F0F0F0" },
      spacing: { before: 160, after: 80 },
      children: [new TextRun({ text: title, bold: true, size: 22 })],
    });
  }
  if (style === "exec") {
    return new Paragraph({
      spacing: { before: 200, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "222222" } },
      children: [new TextRun({ text: title, bold: true, size: 24 })],
    });
  }
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" } },
    children: [new TextRun({ text: title, bold: true, size: 22 })],
  });
}

export async function buildResumeDocxBuffer(
  data: OptimizedResumeData,
  templateId: ResumeTemplateId
): Promise<Buffer> {
  const style =
    templateId === "executive" ? "exec" : templateId === "compact" ? "compact" : "classic";
  const executive = templateId === "executive";
  const compact = templateId === "compact";
  const centerHeader = !executive;

  const children: Paragraph[] = [];

  const contact = [data.email, data.phone, data.location, data.linkedin].filter(Boolean).join(
    executive ? "   •   " : compact ? " · " : " | "
  );

  children.push(
    new Paragraph({
      alignment: centerHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text: data.full_name, bold: true, size: 48 })],
      spacing: { after: 80 },
    })
  );
  if (data.headline) {
    children.push(
      new Paragraph({
        alignment: centerHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [new TextRun({ text: data.headline, bold: true, size: 24 })],
        spacing: { after: 80 },
      })
    );
  }
  if (contact) {
    children.push(
      new Paragraph({
        alignment: centerHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [new TextRun({ text: contact, size: 21, color: "444444" })],
        spacing: { after: executive ? 200 : 160 },
      })
    );
  }

  const pushSection = (title: string, paras: Paragraph[]) => {
    children.push(sectionBar(title, style));
    children.push(...paras);
  };

  if (compact && data.skills.length) {
    pushSection("CORE SKILLS", [
      new Paragraph({
        children: [new TextRun({ text: data.skills.join(" · "), size: 22, bold: true })],
        spacing: { after: 100 },
      }),
    ]);
  }

  if (data.summary) {
    pushSection(compact ? "PROFESSIONAL SUMMARY" : executive ? "SUMMARY" : "PROFESSIONAL SUMMARY", [
      new Paragraph({
        children: [new TextRun({ text: data.summary, size: 21 })],
        spacing: { after: 100 },
      }),
    ]);
  }

  if (!compact && data.skills.length) {
    pushSection(executive ? "SKILLS" : "CORE SKILLS", [
      new Paragraph({
        children: [
          new TextRun({
            text: data.skills.join(executive ? "  •  " : " · "),
            size: 21,
          }),
        ],
        spacing: { after: 100 },
      }),
    ]);
  }

  if (data.experience.length) {
    const expParas: Paragraph[] = [];
    for (const ex of data.experience) {
      expParas.push(
        new Paragraph({
          children: [
            new TextRun({ text: ex.title, bold: true, size: 22 }),
            new TextRun({ text: `\t${ex.dates}`, size: 20, color: "555555" }),
          ],
          tabStops: [{ type: "right", position: 9000 }],
          spacing: { before: 120, after: 40 },
        })
      );
      expParas.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${ex.company}${ex.location ? ` — ${ex.location}` : ""}`,
              italics: executive,
              size: 21,
            }),
          ],
          spacing: { after: 60 },
        })
      );
      expParas.push(...bulletsParagraphs(ex.bullets));
    }
    pushSection(executive ? "EXPERIENCE" : "WORK EXPERIENCE", expParas);
  }

  if (data.projects?.length) {
    const proj: Paragraph[] = [];
    for (const p of data.projects) {
      proj.push(
        new Paragraph({
          children: [new TextRun({ text: p.name, bold: true, size: 22 })],
          spacing: { after: 40 },
        })
      );
      if (p.description) {
        proj.push(
          new Paragraph({
            children: [new TextRun({ text: p.description, size: 21 })],
            spacing: { after: 40 },
          })
        );
      }
      proj.push(...bulletsParagraphs(p.bullets));
    }
    pushSection(compact ? "PROJECTS & VOLUNTEER" : "PROJECTS", proj);
  }

  if (data.education.length) {
    const edu: Paragraph[] = [];
    for (const ed of data.education) {
      edu.push(
        new Paragraph({
          children: [
            new TextRun({ text: ed.institution, bold: true, size: 22 }),
            ...(ed.dates
              ? [new TextRun({ text: `\t${ed.dates}`, size: 20, color: "555555" })]
              : []),
          ],
          tabStops: ed.dates ? [{ type: "right", position: 9000 }] : undefined,
          spacing: { after: 40 },
        })
      );
      edu.push(
        new Paragraph({
          children: [new TextRun({ text: ed.credential, size: 21 })],
          spacing: { after: 80 },
        })
      );
    }
    pushSection("EDUCATION", edu);
  }

  if (data.certifications?.length) {
    pushSection("CERTIFICATIONS", bulletsParagraphs(data.certifications));
  }

  const doc = new DocxDocument({
    sections: [{ properties: {}, children }],
  });

  const buf = await Packer.toBuffer(doc);
  return Buffer.from(buf);
}
