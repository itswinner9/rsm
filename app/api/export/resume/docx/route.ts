import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildResumeDocxBuffer } from "@/lib/resume/docx/buildResumeDocx";
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

    const buf = await buildResumeDocxBuffer(resolved.data, templateId);
    const filename = `resume-${templateId}.docx`;

    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error("DOCX export error:", e);
    return NextResponse.json({ error: "DOCX export failed" }, { status: 500 });
  }
}
