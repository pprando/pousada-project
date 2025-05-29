/*
  # Add room number to orders

  1. Changes
    - Add room_number column to orders table
    - Add guest_name column to orders table
    - Add validation to ensure room_number exists

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to orders table
ALTER TABLE orders
ADD COLUMN room_number text REFERENCES rooms(number),
ADD COLUMN guest_name text;

-- Create index for faster lookups
CREATE INDEX orders_room_number_idx ON orders(room_number);