/*
  # Add insert policy for lender tasks

  1. Changes
    - Add RLS policy to allow authenticated users to create tasks for their own lender profile
    - Policy ensures users can only create tasks where lender_id matches their profile

  2. Security
    - Users can only create tasks for their own lender profile
    - Maintains existing policies for reading and admin access
*/

CREATE POLICY "Lenders can create own tasks"
ON public.lender_tasks
FOR INSERT
TO authenticated
WITH CHECK (
  lender_id IN (
    SELECT id 
    FROM public.lender_profiles 
    WHERE user_id = auth.uid()
  )
);