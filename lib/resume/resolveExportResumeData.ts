import { createClient } from "@/lib/supabase/server";
import { optimizedResumeDataSchema, type OptimizedResumeData } from "@/lib/resume/types";
import { sanitizeOptimizedResumeData } from "@/lib/resume/sanitizeResumeText";

export type ExportResumeRequestBody = {
  generationId?: string;
  optimized_resume_data?: unknown;
};

export async function resolveExportResumeData(
  userId: string,
  body: ExportResumeRequestBody
): Promise<{ data: OptimizedResumeData } | { error: string; status: number }> {
  const supabase = createClient();

  if (body.generationId) {
    const { data: gen, error } = await supabase
      .from("resume_generations")
      .select("optimized_resume_data, user_id")
      .eq("id", body.generationId)
      .eq("user_id", userId)
      .single();

    if (error || !gen?.optimized_resume_data) {
      return { error: "Generation not found", status: 404 };
    }

    const dataParse = optimizedResumeDataSchema.safeParse(gen.optimized_resume_data);
    if (!dataParse.success) {
      return { error: "Invalid resume data", status: 500 };
    }
    return { data: sanitizeOptimizedResumeData(dataParse.data) };
  }

  if (body.optimized_resume_data != null) {
    const dataParse = optimizedResumeDataSchema.safeParse(body.optimized_resume_data);
    if (!dataParse.success) {
      return { error: "Invalid resume data", status: 400 };
    }
    return { data: sanitizeOptimizedResumeData(dataParse.data) };
  }

  return { error: "generationId or optimized_resume_data required", status: 400 };
}
