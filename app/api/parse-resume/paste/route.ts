import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { text } = await request.json();
    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: "Resume text too short" }, { status: 400 });
    }

    const { data: upload } = await supabase
      .from("resume_uploads")
      .insert({ user_id: user.id, file_name: "pasted-resume.txt", parsed_text: text.slice(0, 10000) })
      .select()
      .single();

    return NextResponse.json({ success: true, uploadId: upload?.id });
  } catch (error) {
    console.error("Paste resume error:", error);
    return NextResponse.json({ error: "Failed to save resume" }, { status: 500 });
  }
}
