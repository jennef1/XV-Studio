-- Add campaign_job_id and workflow_type columns to saved_projects table
-- This migration adds tracking fields to link saved projects with their generation jobs and workflows

-- Add campaign_job_id to link saved projects to async generation jobs
ALTER TABLE public.saved_projects
ADD COLUMN IF NOT EXISTS campaign_job_id UUID REFERENCES public.campaign_generation_jobs(id) ON DELETE SET NULL;

-- Add workflow_type to capture granular workflow information
ALTER TABLE public.saved_projects
ADD COLUMN IF NOT EXISTS workflow_type TEXT;

-- Add check constraint for workflow_type values
ALTER TABLE public.saved_projects
ADD CONSTRAINT check_workflow_type CHECK (
  workflow_type IS NULL OR workflow_type IN (
    'product_rotation',
    'ai_explains',
    'user_speaks',
    'campaign_images',
    'bilder_product',
    'bilder_combine',
    'bilder_freebird',
    'logo_transformation',
    'image_to_video'
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_projects_campaign_job
  ON public.saved_projects(campaign_job_id);

CREATE INDEX IF NOT EXISTS idx_saved_projects_workflow_type
  ON public.saved_projects(workflow_type);

-- Add column comments
COMMENT ON COLUMN public.saved_projects.campaign_job_id IS
  'Foreign key to campaign_generation_jobs table for linking async job results';

COMMENT ON COLUMN public.saved_projects.workflow_type IS
  'Granular workflow type that generated this project (e.g., product_rotation, bilder_product)';
