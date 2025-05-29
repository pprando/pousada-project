/*
  # Initial Schema Setup for Hotel Management System

  1. New Tables
    - users
      - id (uuid, primary key)
      - name (text)
      - email (text, unique)
      - password_hash (text)
      - birth_date (date)
      - phone (text)
      - address (text)
      - notes (text)
      - is_active (boolean)
      - profile (text)
      - created_at (timestamptz)
      - updated_at (timestamptz) 

    - rooms
      - id (uuid, primary key)
      - number (text, unique)
      - room_type (text)
      - daily_rate (numeric)
      - features (text[])
      - notes (text)
      - image_url (text)
      - is_active (boolean)
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - bookings
      - id (uuid, primary key)
      - room_id (uuid, foreign key)
      - check_in_date (date)
      - check_out_date (date)
      - guest_name (text)
      - guest_email (text)
      - guest_phone (text)
      - status (text)
      - total_amount (numeric)
      - notes (text)
      - created_by (uuid, foreign key)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  birth_date date NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  notes text,
  is_active boolean DEFAULT true,
  profile text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rooms table
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  room_type text NOT NULL,
  daily_rate numeric NOT NULL,
  features text[] DEFAULT '{}',
  notes text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id),
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text NOT NULL,
  status text NOT NULL,
  total_amount numeric NOT NULL,
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view active rooms"
  ON rooms
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can view bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();