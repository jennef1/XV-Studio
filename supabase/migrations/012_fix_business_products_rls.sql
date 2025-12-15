-- Fix business_products RLS to support multi-user access via junction table
-- Users should see products if they're linked to the business in business_users table

-- Drop old policies
DROP POLICY IF EXISTS "Users can read their own business products" ON business_products;
DROP POLICY IF EXISTS "Users can insert their own business products" ON business_products;
DROP POLICY IF EXISTS "Users can update their own business products" ON business_products;
DROP POLICY IF EXISTS "Users can delete their own business products" ON business_products;

-- Create new policies that check business_users junction table
CREATE POLICY "Users can read products for their businesses"
  ON business_products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_users
      WHERE business_users.business_id = business_products.business_id
      AND business_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert products for their businesses"
  ON business_products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_users
      WHERE business_users.business_id = business_products.business_id
      AND business_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update products for their businesses"
  ON business_products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM business_users
      WHERE business_users.business_id = business_products.business_id
      AND business_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete products for their businesses"
  ON business_products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM business_users
      WHERE business_users.business_id = business_products.business_id
      AND business_users.user_id = auth.uid()
    )
  );

-- Service role bypass (for server-side operations)
CREATE POLICY "Service role can manage all business products"
  ON business_products
  FOR ALL
  USING (auth.role() = 'service_role');
