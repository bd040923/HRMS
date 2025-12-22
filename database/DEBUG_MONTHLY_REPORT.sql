-- ============================================================================
-- DEBUG: Monthly Report Query - Exact Query Used in API
-- ============================================================================
-- This shows the exact query structure used in the backend API

-- Step 1: Find your employee_id by user_id
-- Replace <USER_ID> with your actual user_id (e.g., 9)
SELECT id, first_name, last_name, user_id 
FROM hrms_data.employees 
WHERE user_id = <USER_ID>;

-- Step 2: Get leave type IDs
SELECT id, name FROM hrms_data.leave_types WHERE status != 'deleted';

-- Step 3: Test the monthly query for December 2025
-- Replace <EMPLOYEE_ID> and <LEAVE_TYPE_ID> with values from steps 1 and 2
SELECT 
    COALESCE(SUM(number_of_days), 0) as used_days,
    COUNT(*) as leave_count,
    array_agg(id) as leave_request_ids
FROM hrms_data.leave_requests
WHERE employee_id = <EMPLOYEE_ID>
  AND leave_type_id = <LEAVE_TYPE_ID>
  AND EXTRACT(YEAR FROM from_date) = 2025
  AND EXTRACT(MONTH FROM from_date) = 12
  AND status IN ('approved', 'taken', 'scheduled');

-- Step 4: See all December leaves for an employee (all leave types)
-- Replace <EMPLOYEE_ID> with your employee_id
SELECT 
    lt.name as leave_type_name,
    lr.from_date,
    lr.to_date,
    lr.number_of_days,
    lr.status,
    EXTRACT(YEAR FROM lr.from_date) as year,
    EXTRACT(MONTH FROM lr.from_date) as month
FROM hrms_data.leave_requests lr
JOIN hrms_data.leave_types lt ON lr.leave_type_id = lt.id
WHERE lr.employee_id = <EMPLOYEE_ID>
  AND EXTRACT(YEAR FROM lr.from_date) = 2025
  AND EXTRACT(MONTH FROM lr.from_date) = 12
  AND lr.status IN ('approved', 'taken', 'scheduled', 'pending')
ORDER BY lr.from_date;

-- Step 5: Check if the report function returns data
-- Replace <EMPLOYEE_ID> with your employee_id
SELECT 
    leave_type_name,
    total_entitlement,
    used_days,
    balance_days,
    monthly_breakdown->0 as first_month,
    jsonb_array_length(monthly_breakdown) as months_with_data
FROM hrms_data.get_employee_leave_report(<EMPLOYEE_ID>, 2025);

