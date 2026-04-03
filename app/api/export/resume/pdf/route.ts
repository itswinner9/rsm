import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { createClient } from "@/lib/supabase/server";
import { ResumePdfDocument } from "@/lib/resume/pdf/ResumePdfDocument";
import { resumeTemplateIdSchema } from "@/lib/resume/types";
import { resolveExportResumeData } from "@/lib/resume/resolveExportResumeData";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const templateIdRaw = body.templateId as string | undefined;

    const templateParse = resumeTemplateIdSchema.safeParse(templateIdRaw);
    if (!templateParse.success) {
      return NextResponse.json({ error: "Invalid templateId" }, { status: 400 });
    }
    const templateId = templateParse.data;

    const resolved = await resolveExportResumeData(user.id, {
      generationId: body.generationId as string | undefined,
      optimized_resume_data: body.optimized_resume_data,
    });
    if ("error" in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status });
    }
    const data = resolved.data;
    const buf = await renderToBuffer(
      React.createElement(ResumePdfDocument, {
        data,
        templateId,
      }) as Parameters<typeof renderToBuffer>[0]
    );

    const filename = `resume-${templateId}.pdf`;
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error("PDF export error:", e);
    return NextResponse.json({ error: "PDF export failed" }, { status: 500 });
  }
}
