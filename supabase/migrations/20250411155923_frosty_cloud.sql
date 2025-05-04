/*
  # Fix Storage Bucket and Policies for Card Attachments

  1. Changes
    - Create storage bucket for card attachments if it doesn't exist
    - Safely handle existing policies by checking if they exist before creating them
    - Ensure proper access control for card attachments
*/

-- Create bucket for card attachments if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('card-attachments', 'card-attachments', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Safely create policies only if they don't exist
DO $$
BEGIN
  -- Check if policy exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Give public access to card attachments'
  ) THEN
    CREATE POLICY "Give public access to card attachments"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'card-attachments');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow authenticated users to upload card attachments'
  ) THEN
    CREATE POLICY "Allow authenticated users to upload card attachments"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'card-attachments');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow authenticated users to update card attachments'
  ) THEN
    CREATE POLICY "Allow authenticated users to update card attachments"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'card-attachments');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow authenticated users to delete card attachments'
  ) THEN
    CREATE POLICY "Allow authenticated users to delete card attachments"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'card-attachments');
  END IF;
END $$;