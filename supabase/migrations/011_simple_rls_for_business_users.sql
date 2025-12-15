-- Ultra-simple RLS for business_users to debug 500 errors
-- This removes all complex subqueries that might cause recursion

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own business links" ON public.business_users;
DROP POLICY IF EXISTS "Users can view members of their businesses" ON public.business_users;
DROP POLICY IF EXISTS "Users can view business_users entries" ON public.business_users;
DROP POLICY IF EXISTS "Service role can manage all business users" ON public.business_users;
DROP POLICY IF EXISTS "Service role can manage business_users" ON public.business_users;

-- SIMPLEST POSSIBLE POLICY: Users can only see rows where they are the user_id
-- This is guaranteed not to cause recursion
CREATE POLICY "Users see own business_users rows"
  ON public.business_users
  FOR SELECT
  USING (user_id = auth.uid());

-- Service role bypass
CREATE POLICY "Service role full access to business_users"
  ON public.business_users
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Also check businesses table policies - make sure they allow access via business_id
-- Users should be able to SELECT businesses if they have a matching business_users entry

-- Let's verify current state
DO $$
DECLARE
  bu_policy_count INTEGER;
  b_policy_count INTEGER;
  policy_rec RECORD;
BEGIN
  SELECT COUNT(*) INTO bu_policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'business_users';

  SELECT COUNT(*) INTO b_policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'businesses';

  RAISE NOTICE 'business_users policies: %', bu_policy_count;
  RAISE NOTICE 'businesses policies: %', b_policy_count;

  -- List the actual policies
  RAISE NOTICE 'business_users policies:';
  FOR policy_rec IN
    SELECT policyname, cmd FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'business_users'
  LOOP
    RAISE NOTICE '  - % (%)', policy_rec.policyname, policy_rec.cmd;
  END LOOP;

  RAISE NOTICE 'businesses policies:';
  FOR policy_rec IN
    SELECT policyname, cmd FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'businesses'
  LOOP
    RAISE NOTICE '  - % (%)', policy_rec.policyname, policy_rec.cmd;
  END LOOP;
END $$;
