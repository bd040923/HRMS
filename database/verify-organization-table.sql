-- ============================================================================
-- VERIFY ORGANIZATION TABLE EXISTS AND HAS DATA
-- Run this to check if the table exists and see what's in it
-- ============================================================================

SET search_path TO hrms_data, public;

-- Step 1: Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'hrms_data' 
            AND table_name = 'organization_gen_info'
        ) THEN '✅ Table EXISTS'
        ELSE '❌ Table DOES NOT EXIST'
    END AS table_status;

-- Step 2: Check table location (which schema)
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name = 'organization_gen_info';

-- Step 3: View all data in the table
SELECT 
    id,
    name,
    registration_number,
    tax_id,
    phone,
    email,
    city,
    country,
    number_of_employees,
    created_at,
    updated_at
FROM hrms_data.organization_gen_info;

-- Step 4: Count records
SELECT COUNT(*) AS total_records FROM hrms_data.organization_gen_info;

-- Step 5: Check permissions
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'hrms_data'
AND table_name = 'organization_gen_info'
AND grantee = 'bhushan';

-- Step 6: Check if record with id=1 exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM hrms_data.organization_gen_info WHERE id = 1) 
        THEN '✅ Record with id=1 EXISTS'
        ELSE '❌ Record with id=1 DOES NOT EXIST'
    END AS record_status;

