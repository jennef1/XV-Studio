-- FORCE DROP all old RLS policies on businesses table
-- The previous migration didn't catch all the old policies

-- Drop ALL existing policies by their exact names from the screenshot
DROP POLICY IF EXISTS "Users can view own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can insert own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can update own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can delete own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can view their own active businesses" ON public.businesses;

-- Also drop the new ones so we can recreate them cleanly
DROP POLICY IF EXISTS "Users can view businesses via junction table" ON public.businesses;
DROP POLICY IF EXISTS "Users can update businesses via junction table" ON public.businesses;
DROP POLICY IF EXISTS "Service role can manage all businesses" ON public.businesses;

-- Now create ONLY the new junction-table-based policies
CREATE POLICY "Users can view businesses via junction table"
  ON public.businesses
  FOR SELECT
  USING (
    id IN (
      SELECT business_id
      FROM public.business_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update businesses via junction table"
  ON public.businesses
  FOR UPDATE
  USING (
    id IN (
      SELECT business_id
      FROM public.business_users
      WHERE user_id = auth.uid()
    )
  );

-- Service role can do everything (for server-side API routes)
CREATE POLICY "Service role can manage all businesses"
  ON public.businesses
  FOR ALL
  USING (auth.role() = 'service_role');

-- Verify policies after creation
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'businesses';

  RAISE NOTICE 'Total policies on businesses table: %', policy_count;

  IF policy_count > 3 THEN
    RAISE WARNING 'Expected only 3 policies, but found %. Some old policies may still exist.', policy_count;
  END IF;
END $$;
