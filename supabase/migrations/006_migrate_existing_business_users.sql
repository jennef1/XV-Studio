-- Migrate existing single-user business relationships to the junction table
-- This ensures backward compatibility by creating business_users entries for all existing businesses

-- Insert junction table entries for all existing non-detached businesses
-- The first user (creator) becomes the 'owner'
INSERT INTO public.business_users (business_id, user_id, role, joined_at)
SELECT
  id as business_id,
  user_id,
  'owner' as role, -- First user becomes owner
  created_at as joined_at
FROM public.businesses
WHERE detached_at IS NULL -- Only migrate active (non-detached) businesses
ON CONFLICT (business_id, user_id) DO NOTHING; -- Skip if entry already exists

-- Mark the user_id column as deprecated but keep it for backward compatibility
-- DO NOT drop it yet - we'll remove it in a future migration after confirming stability
COMMENT ON COLUMN public.businesses.user_id IS
  'DEPRECATED: Use business_users junction table instead. Kept for backward compatibility during transition. Will be removed in future migration.';

-- Log the migration results
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count FROM public.business_users;
  RAISE NOTICE 'Migration complete: % business-user relationships created', migrated_count;
END $$;
