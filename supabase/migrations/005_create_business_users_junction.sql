-- Create junction table for many-to-many relationship between users and businesses
-- This enables multiple users to access the same business (Firmenprofil)

CREATE TABLE IF NOT EXISTS public.business_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member' for future role-based permissions
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_business_user UNIQUE(business_id, user_id) -- Prevent duplicate user-business pairs
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_business_users_business_id ON public.business_users(business_id);
CREATE INDEX IF NOT EXISTS idx_business_users_user_id ON public.business_users(user_id);
CREATE INDEX IF NOT EXISTS idx_business_users_business_user ON public.business_users(business_id, user_id);

-- Enable Row Level Security
ALTER TABLE public.business_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view business_users entries for businesses they belong to
CREATE POLICY "Users can view business members for their businesses"
  ON public.business_users
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    business_id IN (
      SELECT business_id FROM public.business_users WHERE user_id = auth.uid()
    )
  );

-- Policy: Service role can manage all business_users entries
CREATE POLICY "Service role can manage all business users"
  ON public.business_users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add comment for documentation
COMMENT ON TABLE public.business_users IS 'Junction table enabling multiple users to access the same business. Replaces the single-user model where businesses.user_id was the only link.';
COMMENT ON COLUMN public.business_users.role IS 'User role within the business: owner (creator), admin (can manage), or member (can view/edit). Currently all users have equal access.';
