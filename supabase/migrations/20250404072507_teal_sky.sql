/*
  # Create Lender Tasks Schema

  1. New Tables
    - `lender_tasks`
      - `id` (uuid, primary key)
      - `lender_id` (uuid, references lender_profiles)
      - `title` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for task access
*/

-- Create lender_tasks table
CREATE TABLE lender_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id uuid REFERENCES lender_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE lender_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Lenders can read own tasks"
  ON lender_tasks
  FOR SELECT
  TO authenticated
  USING (
    lender_id IN (
      SELECT id FROM lender_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all tasks"
  ON lender_tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_lender_tasks_updated_at
  BEFORE UPDATE ON lender_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();