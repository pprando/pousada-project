/*
  # Add INSERT policy for bookings table

  1. Changes
    - Add INSERT policy to allow authenticated users to create bookings
    - Add UPDATE policy to allow authenticated users to update bookings
    
  2. Security
    - Only authenticated users can create and update bookings
    - Users must provide all required fields
*/

-- Allow authenticated users to insert bookings
CREATE POLICY "Users can create bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update bookings
CREATE POLICY "Users can update bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);