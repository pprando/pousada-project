/*
  # Add payment settings columns to users table

  1. Changes
    - Add payment preferences columns
    - Set default values
    - Add NOT NULL constraints
*/

-- Add payment settings columns
ALTER TABLE public.users
ADD COLUMN default_payment_method text DEFAULT 'credit',
ADD COLUMN payment_receipts_email boolean DEFAULT true,
ADD COLUMN payment_reminders boolean DEFAULT true,
ADD COLUMN auto_apply_discounts boolean DEFAULT true,
ADD COLUMN currency text DEFAULT 'BRL';

-- Add NOT NULL constraints
ALTER TABLE public.users
ALTER COLUMN default_payment_method SET NOT NULL,
ALTER COLUMN payment_receipts_email SET NOT NULL,
ALTER COLUMN payment_reminders SET NOT NULL,
ALTER COLUMN auto_apply_discounts SET NOT NULL,
ALTER COLUMN currency SET NOT NULL;