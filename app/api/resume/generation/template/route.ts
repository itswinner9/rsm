import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resumeTemplateIdSchema } from "@/lib/resume/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const generationId = body.generationId as string | undefined;
    const templateParse = resumeTemplateIdSchema.safeParse(body.templateId);

    if (!generationId || !templateParse.success) {
      return NextResponse.json({ error: "generationId and valid templateId required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("resume_generations")
      .update({ selected_template: templateParse.data })
      .eq("id", generationId)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, selected_template: templateParse.data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
