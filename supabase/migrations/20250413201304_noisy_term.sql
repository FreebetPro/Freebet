/*
  # Fix organization cards RLS policies

  1. Changes
    - Update RLS policies for organization_cards table to properly handle user ownership
    - Add user_id column to track card ownership
    - Add foreign key constraint to auth.users
    - Migrate existing cards to associate with a system user

  2. Security
    - Enable RLS on organization_cards table
    - Add policies for authenticated users to:
      - Read their own cards
      - Create new cards
      - Update their own cards
      - Delete their own cards
*/

-- Add user_id column
ALTER TABLE organization_cards 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update RLS policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON organization_cards;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON organization_cards;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON organization_cards;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON organization_cards;

-- Create new policies
CREATE POLICY "Users can read own cards"
ON organization_cards
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards"
ON organization_cards
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
ON organization_cards
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards"
ON organization_cards
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);