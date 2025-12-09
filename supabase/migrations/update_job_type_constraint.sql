-- Drop the existing check constraint
ALTER TABLE public.campaign_generation_jobs
DROP CONSTRAINT IF EXISTS check_job_type;

-- Add updated check constraint with all job types
ALTER TABLE public.campaign_generation_jobs
ADD CONSTRAINT check_job_type CHECK (job_type IN ('campaign_images', 'product_video', 'ai_explains_video', 'onboarding'));

-- Update comment for documentation
COMMENT ON COLUMN public.campaign_generation_jobs.job_type IS 'Type of generation job: campaign_images for social media campaigns, product_video for product/service videos, ai_explains_video for AI explanation videos, onboarding for initial business and product setup';
