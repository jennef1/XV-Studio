-- Create function to atomically increment edit_count in project_tracking
-- This ensures thread-safe updates when multiple edits happen in quick succession

CREATE OR REPLACE FUNCTION public.increment_edit_count(tracking_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atomically increment edit_count and update timestamp
  UPDATE public.project_tracking
  SET
    edit_count = edit_count + 1,
    updated_at = NOW()
  WHERE id = tracking_id;

  -- Raise exception if tracking record doesn't exist
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project tracking record with id % not found', tracking_id;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_edit_count TO authenticated;

-- Add function comment
COMMENT ON FUNCTION public.increment_edit_count IS
  'Atomically increments the edit_count for a project_tracking record and updates the timestamp';
