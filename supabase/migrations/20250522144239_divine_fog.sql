/*
  # Add pousada name to users table

  1. Changes
    - Add pousada_name column to users table
    - Allow NULL values for backward compatibility
    
  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE users
ADD COLUMN IF NOT EXISTS pousada_name text;