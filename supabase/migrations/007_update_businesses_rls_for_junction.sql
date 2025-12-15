-- Update RLS policies on businesses table to work with junction table
-- This allows users to access businesses they're linked to via business_users

-- First, drop any existing policies that might conflict
DROP POLICY IF EXISTS "Users can view their own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can insert their own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can update their own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can delete their own businesses" ON public.businesses;

-- Enable RLS if not already enabled
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- NEW POLICY: Users can view businesses they have access to via junction table
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

-- NEW POLICY: Users can update businesses they have access to via junction table
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

-- Service role can do everything (for API routes)
CREATE POLICY "Service role can manage all businesses"
  ON public.businesses
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE public.businesses IS 'Business profiles. Access controlled via business_users junction table.';
