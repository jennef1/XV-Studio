-- Add job_type column to support both campaign images and product videos
ALTER TABLE public.campaign_generation_jobs
ADD COLUMN IF NOT EXISTS job_type TEXT NOT NULL DEFAULT 'campaign_images';

-- Add result_video_url column for storing video generation results
ALTER TABLE public.campaign_generation_jobs
ADD COLUMN IF NOT EXISTS result_video_url TEXT;

-- Add index for job_type to optimize queries filtering by job type
CREATE INDEX IF NOT EXISTS idx_campaign_jobs_job_type ON public.campaign_generation_jobs(job_type);

-- Add check constraint to ensure valid job types
ALTER TABLE public.campaign_generation_jobs
ADD CONSTRAINT check_job_type CHECK (job_type IN ('campaign_images', 'product_video'));

-- Add comment for documentation
COMMENT ON COLUMN public.campaign_generation_jobs.job_type IS 'Type of generation job: campaign_images for social media campaigns, product_video for product/service videos';
COMMENT ON COLUMN public.campaign_generation_jobs.result_video_url IS 'URL of generated video (for product_video job type)';
