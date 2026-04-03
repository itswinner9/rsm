-- Single master resume JSON + final ATS score + template selection
ALTER TABLE resume_generations
  ADD COLUMN IF NOT EXISTS optimized_resume_data JSONB;

ALTER TABLE resume_generations
  ADD COLUMN IF NOT EXISTS ats_score_optimized INTEGER;

COMMENT ON COLUMN resume_generations.optimized_resume_data IS 'One ATS-optimized resume; templates are visual skins only.';
COMMENT ON COLUMN resume_generations.ats_score_optimized IS 'Single optimized match score after AI pass.';
