-- ============================================================================
-- FIX: "violates check constraint users_role_check" ERROR
-- 
-- Problem: Database only allows ('admin', 'user', 'manager') but frontend sends 'employee'
-- Solution: Update the constraint to also allow 'employee'
-- 
-- Run this in pgAdmin or psql as 'postgres' user
-- Database: arithwise_hrms
-- Schema: hrms_data
-- ============================================================================

SET search_path TO hrms_data, public;

-- Step 1: Check current constraint (optional - just to see what it is)
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'hrms_data.users'::regclass
AND conname LIKE '%role%';

-- Step 2: Drop the old constraint
ALTER TABLE hrms_data.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 3: Add new constraint that includes 'employee'
ALTER TABLE hrms_data.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'user', 'manager', 'employee'));

-- Step 4: Verify it worked
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'hrms_data.users'::regclass
AND conname = 'users_role_check';

-- Expected result:
-- constraint_name: users_role_check
-- constraint_definition: CHECK ((role = ANY (ARRAY['admin'::character varying, 'user'::character varying, 'manager'::character varying, 'employee'::character varying])))

-- ============================================================================
-- ALTERNATIVE: If you prefer to keep 'user' in database and map in frontend
-- (No database changes needed, just make sure browser cache is cleared)
-- ============================================================================

