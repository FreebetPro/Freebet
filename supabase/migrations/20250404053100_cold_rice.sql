/*
  # Create Lender Profiles Schema

  1. New Tables
    - `lender_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `cpf` (text)
      - `name` (text)
      - `whatsapp` (text)
      - `email` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for lender access
*/

-- Create lender_profiles table
CREATE TABLE lender_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cpf text NOT NULL,
  name text NOT NULL,
  whatsapp text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE lender_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create updated_at trigger
CREATE TRIGGER update_lender_profiles_updated_at
  BEFORE UPDATE ON lender_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();