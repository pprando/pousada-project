/*
  # Allow user registration

  1. Changes
    - Add policy to allow new user registration in users table
    - Add policy to allow users to update their own data
  
  2. Security
    - Enable RLS on users table
    - Add policies for user management
*/

-- Allow users to insert their own data during registration
CREATE POLICY "Allow user registration"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);