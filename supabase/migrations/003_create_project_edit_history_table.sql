-- Create project_edit_history table to capture full edit timeline
-- Logs each generation and edit with timestamps, prompts, and result URLs

CREATE TABLE IF NOT EXISTS public.project_edit_history (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  project_tracking_id UUID NOT NULL REFERENCES public.project_tracking(id) ON DELETE CASCADE,
  saved_project_id UUID NOT NULL REFERENCES public.saved_projects(id) ON DELETE CASCADE,

  -- Edit details
  edit_type TEXT NOT NULL,
  edit_number INTEGER NOT NULL,

  -- Content
  prompt TEXT NOT NULL,
  result_url TEXT NOT NULL,

  -- Additional metadata (aspectRatio, resolution, selectedImage, etc.)
  metadata JSONB,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT check_edit_type CHECK (edit_type IN ('generation', 'edit')),
  CONSTRAINT check_edit_number CHECK (edit_number >= 1)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_edit_history_project_tracking
  ON public.project_edit_history(project_tracking_id);

CREATE INDEX IF NOT EXISTS idx_edit_history_saved_project
  ON public.project_edit_history(saved_project_id);

CREATE INDEX IF NOT EXISTS idx_edit_history_created
  ON public.project_edit_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_edit_history_type
  ON public.project_edit_history(edit_type);

-- Enable Row Level Security
ALTER TABLE public.project_edit_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own edit history"
  ON public.project_edit_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.project_tracking pt
      WHERE pt.id = project_tracking_id
        AND pt.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own edit history"
  ON public.project_edit_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.project_tracking pt
      WHERE pt.id = project_tracking_id
        AND pt.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all edit history"
  ON public.project_edit_history
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add table and column comments
COMMENT ON TABLE public.project_edit_history IS
  'Complete edit history for projects with timestamps, prompts, and result URLs';

COMMENT ON COLUMN public.project_edit_history.edit_type IS
  'Type of entry: "generation" for initial creation, "edit" for subsequent modifications';

COMMENT ON COLUMN public.project_edit_history.edit_number IS
  'Sequential number starting from 1 for each project (1, 2, 3, ...)';

COMMENT ON COLUMN public.project_edit_history.prompt IS
  'The prompt or edit instruction used to generate this version';

COMMENT ON COLUMN public.project_edit_history.result_url IS
  'The resulting image or video URL for this version';

COMMENT ON COLUMN public.project_edit_history.metadata IS
  'Additional parameters like aspectRatio, resolution, outputFormat, selectedImage, productName, etc.';
