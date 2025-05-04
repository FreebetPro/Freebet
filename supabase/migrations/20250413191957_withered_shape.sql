/*
  # Fix Lender Tasks Schema

  1. Changes
    - Check if policies exist before creating them
    - Ensure no duplicate policies are created
    - Maintain all necessary functionality
*/

-- Create lender_tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS lender_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id uuid REFERENCES lender_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE lender_tasks ENABLE ROW LEVEL SECURITY;

-- Safely create policies only if they don't exist
DO $$
BEGIN
  -- Check if "Lenders can read own tasks" policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'lender_tasks' 
    AND policyname = 'Lenders can read own tasks'
  ) THEN
    CREATE POLICY "Lenders can read own tasks"
      ON lender_tasks
      FOR SELECT
      TO authenticated
      USING (
        lender_id IN (
          SELECT id FROM lender_profiles WHERE user_id = auth.uid()
        )
      );
  END IF;

  -- Check if "Admins can manage all tasks" policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'lender_tasks' 
    AND policyname = 'Admins can manage all tasks'
  ) THEN
    CREATE POLICY "Admins can manage all tasks"
      ON lender_tasks
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users 
          WHERE id = auth.uid() 
          AND (raw_user_meta_data->>'role' = 'admin' OR is_super_admin = true)
        )
      );
  END IF;
END $$;

-- Create updated_at trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_lender_tasks_updated_at'
  ) THEN
    CREATE TRIGGER update_lender_tasks_updated_at
      BEFORE UPDATE ON lender_tasks
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;