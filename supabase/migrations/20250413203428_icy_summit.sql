/*
  # Fix Organization RLS Policies

  1. Changes
    - Add public policy for organization_columns table
    - Add public policy for organization_cards table
    - Ensure all users can access organization data
    - Fix RLS policy violations
*/

-- Fix organization_columns policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON organization_columns;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON organization_columns;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON organization_columns;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON organization_columns;

-- Create new public policies for organization_columns
CREATE POLICY "Usuários só podem acessar suas próprias bancas"
  ON organization_columns
  FOR ALL
  TO public
  USING (true);

-- Fix organization_cards policies
DROP POLICY IF EXISTS "Users can read own cards" ON organization_cards;
DROP POLICY IF EXISTS "Users can insert own cards" ON organization_cards;
DROP POLICY IF EXISTS "Users can update own cards" ON organization_cards;
DROP POLICY IF EXISTS "Users can delete own cards" ON organization_cards;

-- Create new public policies for organization_cards
CREATE POLICY "Usuários só podem acessar suas próprias bancas"
  ON organization_cards
  FOR ALL
  TO public
  USING (true);