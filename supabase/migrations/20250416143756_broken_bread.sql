/*
  # Booking Flow Schema Update

  1. New Tables
    - `booking_requests`
      - Stores initial booking requests before confirmation
      - Tracks status of requests
      - Links to final booking when confirmed
    
    - `payments`
      - Tracks booking payments
      - Stores payment status and amounts
      - Links to bookings

  2. Updates
    - Add new status options to bookings table
    - Add payment tracking fields

  3. Security
    - Enable RLS on new tables
    - Add policies for staff access
*/

-- Booking Requests Table
CREATE TABLE IF NOT EXISTS booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id),
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text NOT NULL,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id),
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL,
  payment_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_amount numeric;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_request_id uuid REFERENCES booking_requests(id);

-- Enable RLS
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for booking_requests
CREATE POLICY "Staff can view all booking requests"
  ON booking_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create booking requests"
  ON booking_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update booking requests"
  ON booking_requests
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for payments
CREATE POLICY "Staff can view all payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (true);

-- Update trigger for booking_requests
CREATE TRIGGER update_booking_requests_updated_at
  BEFORE UPDATE ON booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for payments
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();