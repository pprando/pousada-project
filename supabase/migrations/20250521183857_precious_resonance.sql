/*
  # Add pousada isolation

  1. Changes
    - Add pousada_id to all tables
    - Set up foreign key relationships
    - Update RLS policies for data isolation
    - Add triggers for automatic pousada_id assignment

  2. Security
    - Ensure data isolation between pousadas
    - Maintain existing RLS policies
    - Add pousada-specific policies
*/

-- First, make pousada_id NOT NULL in users table
ALTER TABLE users
ADD COLUMN pousada_id uuid NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT users_pousada_id_key UNIQUE (pousada_id);

-- Add pousada_id to other tables with a default value
ALTER TABLE rooms
ADD COLUMN pousada_id uuid DEFAULT NULL;

ALTER TABLE bookings
ADD COLUMN pousada_id uuid DEFAULT NULL;

ALTER TABLE booking_requests
ADD COLUMN pousada_id uuid DEFAULT NULL;

ALTER TABLE orders
ADD COLUMN pousada_id uuid DEFAULT NULL;

ALTER TABLE payments
ADD COLUMN pousada_id uuid DEFAULT NULL;

-- Update existing records to use the pousada_id from their creator
UPDATE rooms r
SET pousada_id = (
  SELECT u.pousada_id 
  FROM users u 
  WHERE u.id = (SELECT created_by FROM bookings b WHERE b.room_id = r.id LIMIT 1)
)
WHERE r.pousada_id IS NULL;

UPDATE bookings b
SET pousada_id = (
  SELECT pousada_id 
  FROM users 
  WHERE id = b.created_by
)
WHERE b.pousada_id IS NULL;

UPDATE booking_requests br
SET pousada_id = (
  SELECT u.pousada_id 
  FROM users u 
  WHERE u.id = (SELECT created_by FROM bookings b WHERE b.booking_request_id = br.id LIMIT 1)
)
WHERE br.pousada_id IS NULL;

UPDATE orders o
SET pousada_id = (
  SELECT pousada_id 
  FROM users 
  WHERE id = o.created_by
)
WHERE o.pousada_id IS NULL;

UPDATE payments p
SET pousada_id = (
  SELECT b.pousada_id 
  FROM bookings b 
  WHERE b.id = p.booking_id
)
WHERE p.pousada_id IS NULL;

-- Set any remaining NULL pousada_ids to a default value
UPDATE rooms 
SET pousada_id = (SELECT pousada_id FROM users LIMIT 1)
WHERE pousada_id IS NULL;

UPDATE bookings 
SET pousada_id = (SELECT pousada_id FROM users LIMIT 1)
WHERE pousada_id IS NULL;

UPDATE booking_requests 
SET pousada_id = (SELECT pousada_id FROM users LIMIT 1)
WHERE pousada_id IS NULL;

UPDATE orders 
SET pousada_id = (SELECT pousada_id FROM users LIMIT 1)
WHERE pousada_id IS NULL;

UPDATE payments 
SET pousada_id = (SELECT pousada_id FROM users LIMIT 1)
WHERE pousada_id IS NULL;

-- Now we can safely add foreign keys and NOT NULL constraints
ALTER TABLE rooms
ALTER COLUMN pousada_id SET NOT NULL,
ADD CONSTRAINT rooms_pousada_id_fkey FOREIGN KEY (pousada_id) REFERENCES users(pousada_id);

ALTER TABLE bookings
ALTER COLUMN pousada_id SET NOT NULL,
ADD CONSTRAINT bookings_pousada_id_fkey FOREIGN KEY (pousada_id) REFERENCES users(pousada_id);

ALTER TABLE booking_requests
ALTER COLUMN pousada_id SET NOT NULL,
ADD CONSTRAINT booking_requests_pousada_id_fkey FOREIGN KEY (pousada_id) REFERENCES users(pousada_id);

ALTER TABLE orders
ALTER COLUMN pousada_id SET NOT NULL,
ADD CONSTRAINT orders_pousada_id_fkey FOREIGN KEY (pousada_id) REFERENCES users(pousada_id);

ALTER TABLE payments
ALTER COLUMN pousada_id SET NOT NULL,
ADD CONSTRAINT payments_pousada_id_fkey FOREIGN KEY (pousada_id) REFERENCES users(pousada_id);

-- Update RLS policies for rooms
DROP POLICY IF EXISTS "Users can view active rooms" ON rooms;
CREATE POLICY "Users can view active rooms"
ON rooms
FOR SELECT
TO authenticated
USING (
  pousada_id = (SELECT pousada_id FROM users WHERE id = auth.uid())
  AND is_active = true
);

-- Update RLS policies for bookings
DROP POLICY IF EXISTS "Users can view bookings" ON bookings;
CREATE POLICY "Users can view bookings"
ON bookings
FOR SELECT
TO authenticated
USING (
  pousada_id = (SELECT pousada_id FROM users WHERE id = auth.uid())
);

-- Update RLS policies for booking_requests
DROP POLICY IF EXISTS "Staff can view all booking requests" ON booking_requests;
CREATE POLICY "Staff can view all booking requests"
ON booking_requests
FOR SELECT
TO authenticated
USING (
  pousada_id = (SELECT pousada_id FROM users WHERE id = auth.uid())
);

-- Update RLS policies for orders
DROP POLICY IF EXISTS "Staff can view all orders" ON orders;
CREATE POLICY "Staff can view all orders"
ON orders
FOR SELECT
TO authenticated
USING (
  pousada_id = (SELECT pousada_id FROM users WHERE id = auth.uid())
);

-- Update RLS policies for payments
DROP POLICY IF EXISTS "Staff can view all payments" ON payments;
CREATE POLICY "Staff can view all payments"
ON payments
FOR SELECT
TO authenticated
USING (
  pousada_id = (SELECT pousada_id FROM users WHERE id = auth.uid())
);

-- Function to get current user's pousada_id
CREATE OR REPLACE FUNCTION get_current_pousada_id()
RETURNS uuid
LANGUAGE sql
SECURITY definer
AS $$
  SELECT pousada_id FROM users WHERE id = auth.uid();
$$;

-- Trigger function to automatically set pousada_id
CREATE OR REPLACE FUNCTION set_pousada_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  NEW.pousada_id := (SELECT pousada_id FROM users WHERE id = auth.uid());
  RETURN NEW;
END;
$$;

-- Add triggers to automatically set pousada_id
CREATE TRIGGER set_rooms_pousada_id
  BEFORE INSERT ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION set_pousada_id();

CREATE TRIGGER set_bookings_pousada_id
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_pousada_id();

CREATE TRIGGER set_booking_requests_pousada_id
  BEFORE INSERT ON booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_pousada_id();

CREATE TRIGGER set_orders_pousada_id
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_pousada_id();

CREATE TRIGGER set_payments_pousada_id
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_pousada_id();