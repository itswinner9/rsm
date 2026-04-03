-- Idempotent: safe if 20250402120000_resume_optimized_data.sql already ran remotely.
ALTER TABLE resume_generations
  ADD COLUMN IF NOT EXISTS optimized_resume_data JSONB;

ALTER TABLE resume_generations
  ADD COLUMN IF NOT EXISTS ats_score_optimized INTEGER;

COMMENT ON COLUMN resume_generations.optimized_resume_data IS 'One ATS-optimized resume; templates are visual skins only.';
COMMENT ON COLUMN resume_generations.ats_score_optimized IS 'Single optimized match score after AI pass.';
