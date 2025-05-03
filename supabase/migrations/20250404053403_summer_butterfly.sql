/*
  # Update lender profiles schema

  1. Changes
    - Drop existing policies if they exist
    - Add missing policies if needed
    - Ensure proper RLS configuration
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Lenders can read own profile" ON lender_profiles;
DROP POLICY IF EXISTS "Lenders can update own profile" ON lender_profiles;

-- Create or update policies
CREATE POLICY "Lenders can read own profile"
  ON lender_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Lenders can update own profile"
  ON lender_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE lender_profiles ENABLE ROW LEVEL SECURITY;