-- ============================================================================
-- FIX USERS ROLE CONSTRAINT
-- This script updates the users table to allow 'employee' role
-- Run this as 'postgres' user in database 'arithwise_hrms'
-- ============================================================================

SET search_path TO hrms_data, public;

-- Option 1: Update the constraint to include 'employee'
-- First, drop the old constraint
ALTER TABLE hrms_data.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint that allows 'employee' as well
ALTER TABLE hrms_data.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'user', 'manager', 'employee'));

-- Verify the constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'hrms_data.users'::regclass
AND conname = 'users_role_check';

-- ============================================================================
-- ALTERNATIVE: If you want to keep 'user' in database but allow 'employee' in frontend
-- (This is what the frontend code is doing - mapping employee -> user)
-- You don't need to change the database, just make sure frontend is updated
-- ============================================================================



