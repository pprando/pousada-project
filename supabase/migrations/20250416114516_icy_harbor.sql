/*
  # Add INSERT policy for rooms table

  1. Changes
    - Add INSERT policy to allow authenticated users to create rooms
    
  2. Security
    - Only authenticated users can create rooms
    - Users must provide all required fields
*/

CREATE POLICY "Users can create rooms" 
ON public.rooms
FOR INSERT 
TO authenticated
WITH CHECK (true);