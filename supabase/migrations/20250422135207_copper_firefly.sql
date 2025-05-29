/*
  # Fix Settings and User Management

  1. Changes
    - Add missing RLS policies for user management
    - Add default values for user settings
    - Add constraints to ensure data integrity

  2. Security
    - Maintain existing RLS policies
    - Add specific policies for user settings
*/

-- Add default values for notification settings
ALTER TABLE public.users 
ALTER COLUMN notifications_email SET DEFAULT true,
ALTER COLUMN notifications_push SET DEFAULT false,
ALTER COLUMN notifications_sms SET DEFAULT true,
ALTER COLUMN language SET DEFAULT 'pt-BR',
ALTER COLUMN theme SET DEFAULT 'light';

-- Add NOT NULL constraints to ensure data integrity
ALTER TABLE public.users
ALTER COLUMN notifications_email SET NOT NULL,
ALTER COLUMN notifications_push SET NOT NULL,
ALTER COLUMN notifications_sms SET NOT NULL,
ALTER COLUMN language SET NOT NULL,
ALTER COLUMN theme SET NOT NULL;

-- Update existing RLS policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can create their profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);