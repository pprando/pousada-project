/*
  # Add user settings columns

  1. Changes
    - Add notification preferences columns to users table
    - Add language and theme preferences
    - Set default values for new columns

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns for user settings
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS notifications_email boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notifications_push boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notifications_sms boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS language text DEFAULT 'pt-BR',
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light';