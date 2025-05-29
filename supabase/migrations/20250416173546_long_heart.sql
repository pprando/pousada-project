/*
  # Delete all users

  1. Changes
    - Delete all existing users from the auth.users table
    - Delete all existing user profiles from the users table
    - Reset sequences for user-related tables

  2. Security
    - No changes to RLS policies
    - Existing table permissions remain unchanged

  Note: This is a destructive operation that will permanently delete all user data
*/

-- Delete all user profiles first (due to foreign key constraints)
DELETE FROM public.users;

-- Delete all auth users
DELETE FROM auth.users;