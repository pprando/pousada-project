/*
  # Update booking request status options

  1. Changes
    - Remove 'scheduled' status option
    - Update existing 'scheduled' statuses to 'pending'
    - Add constraint to enforce valid status values
    
  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity with constraints
*/

-- Create a DO block to handle the migration safely
DO $$
BEGIN
  -- First remove any existing constraint
  ALTER TABLE booking_requests
  DROP CONSTRAINT IF EXISTS booking_requests_status_check;

  -- Update existing statuses
  UPDATE booking_requests 
  SET status = 'pending' 
  WHERE status NOT IN ('pending', 'approved', 'rejected');

  -- Add new constraint
  ALTER TABLE booking_requests
  ADD CONSTRAINT booking_requests_status_check
  CHECK (status IN ('pending', 'approved', 'rejected'));

  -- Set default value
  ALTER TABLE booking_requests
  ALTER COLUMN status SET DEFAULT 'pending';
END $$;