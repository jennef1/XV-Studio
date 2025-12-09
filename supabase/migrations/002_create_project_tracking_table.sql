-- Create project_tracking table to track project lifecycle
-- Captures workflow type, generation count, edit count, and links to jobs and products

CREATE TABLE IF NOT EXISTS public.project_tracking (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  saved_project_id UUID NOT NULL REFERENCES public.saved_projects(id) ON DELETE CASCADE,
  campaign_job_id UUID REFERENCES public.campaign_generation_jobs(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  business_id UUID,
  product_id UUID,

  -- Workflow and category tracking
  workflow_type TEXT NOT NULL,
  product_category TEXT,

  -- Generation and edit counts
  generation_count INTEGER NOT NULL DEFAULT 1,
  edit_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT check_workflow_type CHECK (workflow_type IN (
    'product_rotation',
    'ai_explains',
    'user_speaks',
    'campaign_images',
    'bilder_product',
    'bilder_combine',
    'bilder_freebird',
    'logo_transformation',
    'image_to_video'
  )),
  CONSTRAINT check_generation_count CHECK (generation_count >= 1),
  CONSTRAINT check_edit_count CHECK (edit_count >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_tracking_saved_project
  ON public.project_tracking(saved_project_id);

CREATE INDEX IF NOT EXISTS idx_project_tracking_campaign_job
  ON public.project_tracking(campaign_job_id);

CREATE INDEX IF NOT EXISTS idx_project_tracking_user
  ON public.project_tracking(user_id);

CREATE INDEX IF NOT EXISTS idx_project_tracking_workflow
  ON public.project_tracking(workflow_type);

CREATE INDEX IF NOT EXISTS idx_project_tracking_created
  ON public.project_tracking(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.project_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own project tracking"
  ON public.project_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project tracking"
  ON public.project_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project tracking"
  ON public.project_tracking
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all project tracking"
  ON public.project_tracking
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add table and column comments
COMMENT ON TABLE public.project_tracking IS
  'Tracks project lifecycle: workflow type, generation count, edit count, and links to jobs and products';

COMMENT ON COLUMN public.project_tracking.workflow_type IS
  'Granular workflow type (e.g., product_rotation, ai_explains, bilder_product)';

COMMENT ON COLUMN public.project_tracking.generation_count IS
  'Number of times user regenerated content before saving (minimum 1)';

COMMENT ON COLUMN public.project_tracking.edit_count IS
  'Number of times user edited content after initial save';

COMMENT ON COLUMN public.project_tracking.product_category IS
  'Product category captured from business_products.category at save time';
