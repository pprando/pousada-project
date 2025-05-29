/*
  # Fix booking request status constraint

  1. Changes
    - Drop existing status constraint
    - Add new constraint with correct status values
    - Update any existing statuses to valid values
    
  2. Security
    - Maintain existing RLS policies
*/

-- First remove any existing constraint
ALTER TABLE booking_requests
DROP CONSTRAINT IF EXISTS booking_requests_status_check;

-- Update any existing invalid statuses to 'pending'
UPDATE booking_requests 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'approved', 'rejected');

-- Add new constraint with correct values
ALTER TABLE booking_requests
ADD CONSTRAINT booking_requests_status_check
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Set default value
ALTER TABLE booking_requests
ALTER COLUMN status SET DEFAULT 'pending';