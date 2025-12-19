-- ============================================================================
-- CHECK AND FIX USERS ROLE CONSTRAINT
-- Run this as 'postgres' user in database 'arithwise_hrms'
-- ============================================================================

SET search_path TO hrms_data, public;

-- Step 1: Check current constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'hrms_data.users'::regclass
AND conname LIKE '%role%';

-- Step 2: Check what roles currently exist in the table
SELECT DISTINCT role, COUNT(*) as count
FROM hrms_data.users
GROUP BY role;

-- Step 3: Drop the old constraint (if it exists)
ALTER TABLE hrms_data.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 4: Add new constraint that allows 'employee' as well
ALTER TABLE hrms_data.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'user', 'manager', 'employee'));

-- Step 5: Verify the new constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'hrms_data.users'::regclass
AND conname = 'users_role_check';

-- Expected output should show:
-- constraint_name: users_role_check
-- constraint_definition: CHECK ((role = ANY (ARRAY['admin'::character varying, 'user'::character varying, 'manager'::character varying, 'employee'::character varying])))

