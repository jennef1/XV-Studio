-- Simplify business_users RLS to prevent 500 errors on JOIN queries
-- The issue is that complex policies with subqueries cause recursion when joining tables

-- Drop all existing policies on business_users
DROP POLICY IF EXISTS "Users can view their own business links" ON public.business_users;
DROP POLICY IF EXISTS "Users can view members of their businesses" ON public.business_users;
DROP POLICY IF EXISTS "Service role can manage all business users" ON public.business_users;

-- Create a SINGLE, simple policy for business_users
-- This allows users to see any business_users row where they are the user
-- OR where they share a business_id with the user
CREATE POLICY "Users can view business_users entries"
  ON public.business_users
  FOR SELECT
  USING (
    -- Users can always see their own entries
    user_id = auth.uid()
    OR
    -- Users can see other members' entries if they share at least one business
    -- We use EXISTS instead of IN to avoid materialization issues
    EXISTS (
      SELECT 1
      FROM public.business_users my_businesses
      WHERE my_businesses.user_id = auth.uid()
        AND my_businesses.business_id = business_users.business_id
    )
  );

-- Service role can manage everything
CREATE POLICY "Service role can manage business_users"
  ON public.business_users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Verify the policies
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'business_users';

  RAISE NOTICE 'Total policies on business_users table: %', policy_count;

  IF policy_count <> 2 THEN
    RAISE WARNING 'Expected 2 policies, but found %', policy_count;
  END IF;
END $$;
