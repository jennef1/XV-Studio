-- Create campaign_generation_jobs table to track async campaign generation
CREATE TABLE IF NOT EXISTS public.campaign_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID NOT NULL,
  product_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing', -- processing, completed, failed
  request_data JSONB NOT NULL, -- Store the original request for reference
  result_images TEXT[], -- Array of image URLs when completed
  error_message TEXT, -- Error message if failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_campaign_jobs_user_id ON public.campaign_generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_jobs_status ON public.campaign_generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_campaign_jobs_created_at ON public.campaign_generation_jobs(created_at DESC);

-- Enable RLS
ALTER TABLE public.campaign_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own jobs
CREATE POLICY "Users can read their own campaign jobs"
  ON public.campaign_generation_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can do anything (for API routes)
CREATE POLICY "Service role can manage all campaign jobs"
  ON public.campaign_generation_jobs
  FOR ALL
  USING (auth.role() = 'service_role');
