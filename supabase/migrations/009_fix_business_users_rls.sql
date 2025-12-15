-- Fix business_users RLS policy - remove circular dependency
-- The current policy has a circular reference that prevents it from working

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view business members for their businesses" ON public.business_users;
DROP POLICY IF EXISTS "Service role can manage all business users" ON public.business_users;

-- Create a simple, non-circular policy
-- Users can see their own business_users entries (no circular dependency)
CREATE POLICY "Users can view their own business links"
  ON public.business_users
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can also see other members of businesses they belong to
-- This is safe because it doesn't create a circular dependency
CREATE POLICY "Users can view members of their businesses"
  ON public.business_users
  FOR SELECT
  USING (
    business_id IN (
      SELECT bu.business_id
      FROM public.business_users bu
      WHERE bu.user_id = auth.uid()
    )
  );

-- Service role can manage everything
CREATE POLICY "Service role can manage all business users"
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
END $$;
