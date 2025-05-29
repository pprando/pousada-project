/*
  # Add DELETE policy for rooms table

  1. Changes
    - Add policy to allow authenticated users to delete rooms
    - Add cascade delete for related bookings and booking requests
    
  2. Security
    - Only authenticated users can delete rooms
    - Deleting a room will also delete related bookings and requests
*/

-- Add foreign key constraints with cascade delete
ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_room_id_fkey,
ADD CONSTRAINT bookings_room_id_fkey 
FOREIGN KEY (room_id) 
REFERENCES rooms(id) 
ON DELETE CASCADE;

ALTER TABLE booking_requests
DROP CONSTRAINT IF EXISTS booking_requests_room_id_fkey,
ADD CONSTRAINT booking_requests_room_id_fkey 
FOREIGN KEY (room_id) 
REFERENCES rooms(id) 
ON DELETE CASCADE;

-- Add DELETE policy for rooms
CREATE POLICY "Users can delete rooms"
ON rooms
FOR DELETE
TO authenticated
USING (true);