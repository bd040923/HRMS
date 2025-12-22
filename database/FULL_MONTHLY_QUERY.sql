-- ============================================================================
-- FULL QUERY: Monthly Leave Report for December 2025
-- ============================================================================
-- This is the EXACT query structure used in the API endpoint
-- Replace <EMPLOYEE_ID>, <LEAVE_TYPE_ID>, <YEAR>, <MONTH> with actual values

-- ============================================================================
-- QUERY 1: Get monthly used days for a specific leave type in December 2025
-- ============================================================================
-- This is the exact query used in the API (lines 2677-2686 in server.js)

SELECT 
    COALESCE(SUM(number_of_days), 0) as used_days
FROM hrms_data.leave_requests
WHERE employee_id = <EMPLOYEE_ID>        -- Replace with your employee_id
  AND leave_type_id = <LEAVE_TYPE_ID>    -- Replace with leave_type_id (e.g., 1, 2, 3)
  AND EXTRACT(YEAR FROM from_date) = 2025
  AND EXTRACT(MONTH FROM from_date) = 12
  AND status IN ('approved', 'taken', 'scheduled');

-- ============================================================================
-- QUERY 2: Complete monthly report query (what the API does for all leave types)
-- ============================================================================

-- Step 1: Get all leave types
SELECT id, name, entitlement_days 
FROM hrms_data.leave_types 
WHERE status != 'deleted'
ORDER BY name;

-- Step 2: For each leave type, get monthly used days
-- Replace <EMPLOYEE_ID> with your employee_id
WITH leave_types AS (
    SELECT id, name, entitlement_days 
    FROM hrms_data.leave_types 
    WHERE status != 'deleted'
)
SELECT 
    lt.id as leave_type_id,
    lt.name as leave_type_name,
    lt.entitlement_days as total_entitlement,
    COALESCE(SUM(lr.number_of_days), 0) as monthly_used_days,
    lt.entitlement_days - COALESCE(SUM(lr.number_of_days), 0) as monthly_balance_days
FROM leave_types lt
LEFT JOIN hrms_data.leave_requests lr ON (
    lr.leave_type_id = lt.id
    AND lr.employee_id = <EMPLOYEE_ID>
    AND EXTRACT(YEAR FROM lr.from_date) = 2025
    AND EXTRACT(MONTH FROM lr.from_date) = 12
    AND lr.status IN ('approved', 'taken', 'scheduled')
)
GROUP BY lt.id, lt.name, lt.entitlement_days
ORDER BY lt.name;

-- ============================================================================
-- QUERY 3: Debug - See all December 2025 leaves for an employee
-- ============================================================================
-- Replace <EMPLOYEE_ID> with your employee_id

SELECT 
    lr.id,
    lt.name as leave_type_name,
    lr.from_date,
    lr.to_date,
    lr.number_of_days,
    lr.status,
    EXTRACT(YEAR FROM lr.from_date) as year,
    EXTRACT(MONTH FROM lr.from_date) as month,
    CASE 
        WHEN EXTRACT(MONTH FROM lr.from_date) = 12 THEN 'December'
        ELSE 'Other Month'
    END as month_name
FROM hrms_data.leave_requests lr
JOIN hrms_data.leave_types lt ON lr.leave_type_id = lt.id
WHERE lr.employee_id = <EMPLOYEE_ID>
  AND EXTRACT(YEAR FROM lr.from_date) = 2025
  AND EXTRACT(MONTH FROM lr.from_date) = 12
ORDER BY lr.from_date;

-- ============================================================================
-- QUERY 4: Test the get_employee_leave_report function
-- ============================================================================
-- Replace <EMPLOYEE_ID> with your employee_id

SELECT 
    leave_type_name,
    total_entitlement,
    used_days as annual_used_days,
    balance_days as annual_balance_days,
    monthly_breakdown,
    jsonb_array_elements(monthly_breakdown) as monthly_data
FROM hrms_data.get_employee_leave_report(<EMPLOYEE_ID>, 2025)
WHERE monthly_breakdown IS NOT NULL 
  AND jsonb_array_length(monthly_breakdown) > 0;

-- ============================================================================
-- QUERY 5: Find December data in monthly_breakdown
-- ============================================================================
-- Replace <EMPLOYEE_ID> with your employee_id

SELECT 
    leave_type_name,
    total_entitlement,
    used_days,
    balance_days,
    monthly_breakdown,
    (SELECT jsonb_array_elements(monthly_breakdown) 
     WHERE jsonb_array_elements->>'month' = '12') as december_data
FROM hrms_data.get_employee_leave_report(<EMPLOYEE_ID>, 2025)
WHERE monthly_breakdown::text LIKE '%"month": 12%'
   OR monthly_breakdown::text LIKE '%12%';

-- ============================================================================
-- QUERY 6: Complete test - Get employee_id and test everything
-- ============================================================================

-- A. Find your employee_id
SELECT id, first_name, last_name, user_id, email
FROM hrms_data.employees 
WHERE user_id IS NOT NULL
ORDER BY id;

-- B. Once you have employee_id, run this complete query
-- Replace 9 with your user_id, and the employee_id in the query below
DO $$
DECLARE
    v_employee_id INTEGER;
    v_user_id INTEGER := 9;  -- Replace with your user_id
BEGIN
    -- Get employee_id from user_id
    SELECT id INTO v_employee_id
    FROM hrms_data.employees 
    WHERE user_id = v_user_id
    LIMIT 1;
    
    IF v_employee_id IS NULL THEN
        RAISE NOTICE 'Employee not found for user_id: %', v_user_id;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Employee ID: %', v_employee_id;
    
    -- Show December leaves
    RAISE NOTICE 'December 2025 Leaves:';
    FOR rec IN 
        SELECT 
            lt.name as leave_type_name,
            lr.from_date,
            lr.to_date,
            lr.number_of_days,
            lr.status
        FROM hrms_data.leave_requests lr
        JOIN hrms_data.leave_types lt ON lr.leave_type_id = lt.id
        WHERE lr.employee_id = v_employee_id
          AND EXTRACT(YEAR FROM lr.from_date) = 2025
          AND EXTRACT(MONTH FROM lr.from_date) = 12
        ORDER BY lr.from_date
    LOOP
        RAISE NOTICE '  %: % to % (% days) - Status: %', 
            rec.leave_type_name, rec.from_date, rec.to_date, rec.number_of_days, rec.status;
    END LOOP;
END $$;

