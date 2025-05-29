/*
  # Add pousada_name column to users table

  1. Changes
    - Add pousada_name column to users table
    - Set default value
    - Make it nullable
*/

ALTER TABLE users
ADD COLUMN pousada_name text;