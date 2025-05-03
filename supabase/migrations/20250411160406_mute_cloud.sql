/*
  # Add columnId to organization_cards table

  1. Changes
    - Add `column_id` column to `organization_cards` table
    - Update column name in existing code to match database schema
    - Add foreign key constraint to link with organization_columns table

  2. Security
    - No changes to RLS policies needed
*/

-- Add column_id to organization_cards if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organization_cards' 
    AND column_name = 'column_id'
  ) THEN
    ALTER TABLE organization_cards 
    ADD COLUMN column_id uuid REFERENCES organization_columns(id) ON DELETE CASCADE;
  END IF;
END $$;