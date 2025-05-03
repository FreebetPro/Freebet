/*
  # Add bank_id to betting_operations

  1. Changes
    - Add bank_id column to betting_operations table
    - Add foreign key constraint to banks table
    - Create index for better performance
*/

-- Add bank_id column to betting_operations if it doesn't exist
ALTER TABLE betting_operations
  ADD COLUMN IF NOT EXISTS bank_id uuid REFERENCES banks(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS betting_operations_bank_id_idx ON betting_operations(bank_id);