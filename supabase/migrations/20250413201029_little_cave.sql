/*
  # Fix RLS policies for organization_columns table

  1. Security Changes
    - Enable RLS on organization_columns table
    - Add policies for authenticated users to:
      - Read all columns
      - Insert new columns
      - Update existing columns
      - Delete columns
*/

-- First ensure RLS is enabled
ALTER TABLE organization_columns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON organization_columns;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON organization_columns;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON organization_columns;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON organization_columns;

-- Create new policies
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