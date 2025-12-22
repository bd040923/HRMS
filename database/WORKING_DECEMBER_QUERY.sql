-- ============================================================================
-- WORKING QUERIES: Test December 2025 Leaves - NO PLACEHOLDERS
-- ============================================================================
-- Run these queries in order in PostgreSQL

-- Step 1: Find your employee_id (replace 9 with your actual user_id)
SELECT id, first_name, last_name, user_id, email
FROM hrms_data.employees 
WHERE user_id = 9
LIMIT 1;

-- Step 2: Get all leave types
SELECT id, name, entitlement_days 
FROM hrms_data.leave_types 
WHERE status != 'deleted'
ORDER BY name;

-- Step 3: Check December 2025 leaves for your employee
-- Replace 9 with your employee_id from Step 1
SELECT 
    lr.id,
    lt.name as leave_type_name,
    lr.from_date,
    lr.to_date,
    lr.number_of_days,
    lr.status,
    EXTRACT(YEAR FROM lr.from_date) as year,
    EXTRACT(MONTH FROM lr.from_date) as month
FROM hrms_data.leave_requests lr
JOIN hrms_data.leave_types lt ON lr.leave_type_id = lt.id
WHERE lr.employee_id = 9
  AND EXTRACT(YEAR FROM lr.from_date) = 2025
  AND EXTRACT(MONTH FROM lr.from_date) = 12
ORDER BY lr.from_date;

-- Step 4: Monthly report query for December 2025 (EXACT QUERY USED IN API)
-- Replace 9 with your employee_id
SELECT 
    lt.id as leave_type_id,
    lt.name as leave_type_name,
    COALESCE(SUM(CASE WHEN lr.status IN ('approved', 'taken', 'scheduled') THEN lr.number_of_days ELSE 0 END), 0) as used_days,
    COALESCE(SUM(CASE WHEN lr.status = 'pending' THEN lr.number_of_days ELSE 0 END), 0) as pending_days,
    COALESCE(SUM(CASE WHEN lr.status = 'scheduled' THEN lr.number_of_days ELSE 0 END), 0) as scheduled_days,
    COALESCE(SUM(CASE WHEN lr.status = 'taken' THEN lr.number_of_days ELSE 0 END), 0) as taken_days
FROM hrms_data.leave_types lt
LEFT JOIN hrms_data.leave_requests lr ON (
    lr.leave_type_id = lt.id
    AND lr.employee_id = 9
    AND EXTRACT(YEAR FROM lr.from_date) = 2025
    AND EXTRACT(MONTH FROM lr.from_date) = 12
    AND lr.status IN ('approved', 'taken', 'scheduled', 'pending')
)
WHERE lt.status != 'deleted'
GROUP BY lt.id, lt.name
ORDER BY lt.name;

-- Step 5: Test the report function
SELECT * FROM hrms_data.get_employee_leave_report(9, 2025);
