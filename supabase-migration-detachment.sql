-- Migration: Add business detachment support
-- Description: Adds detached_at column for soft-delete functionality and URL-based business discovery
-- Date: 2025-12-12

-- 1. Add detachment tracking column to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS detached_at TIMESTAMP WITH TIME ZONE NULL;

-- 2. Add index for query performance on detached_at
CREATE INDEX IF NOT EXISTS idx_businesses_detached_at ON businesses(detached_at);

-- 3. Add index for URL matching (critical for business discovery)
CREATE INDEX IF NOT EXISTS idx_businesses_company_url ON businesses(company_url);

-- 4. Update RLS policy to exclude detached businesses from user queries
DROP POLICY IF EXISTS "Users can view their own businesses" ON businesses;

CREATE POLICY "Users can view their own active businesses"
  ON businesses FOR SELECT
  USING (auth.uid() = user_id AND detached_at IS NULL);

-- Note: Products policy remains unchanged - products inherit visibility from business relationship
-- When business is detached, products are automatically hidden because the parent business is inaccessible

-- Verification queries (optional - run these to verify the migration)
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'detached_at';
-- SELECT indexname FROM pg_indexes WHERE tablename = 'businesses' AND indexname IN ('idx_businesses_detached_at', 'idx_businesses_company_url');
-- SELECT policyname FROM pg_policies WHERE tablename = 'businesses';
