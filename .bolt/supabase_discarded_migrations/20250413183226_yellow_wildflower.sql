/*
  # Update organization RLS policies

  1. Changes
    - Add new RLS policy to allow authenticated users to create default columns
    - Update existing policies to be more permissive for authenticated users
    - Ensure all authenticated users can read and manage organization columns

  2. Security
    - Enable RLS on organization_columns table (already enabled)
    - Update policies to allow authenticated users to manage columns
    - Maintain security by restricting access to authenticated users only
*/

-- Drop existing policies to recreate them with updated rules
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON organization_columns;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON organization_columns;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON organization_columns;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON organization_columns;

-- Create new policies with updated permissions
CREATE POLICY "Enable read access for authenticated users"
ON organization_columns
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON organization_columns
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON organization_columns
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
ON organization_columns
FOR DELETE
TO authenticated
USING (true);