-- ============================================================================
-- TEST QUERY: Check if leaves exist in December 2025
-- ============================================================================
-- Run this query in PostgreSQL to verify leaves in December

-- 1. First, find your employee_id
SELECT id, first_name, last_name, user_id 
FROM hrms_data.employees 
WHERE user_id IS NOT NULL
LIMIT 10;

-- 2. Check all leave requests for December 2025
SELECT 
    lr.id,
    lr.employee_id,
    e.first_name || ' ' || e.last_name as employee_name,
    lt.name as leave_type_name,
    lr.from_date,
    lr.to_date,
    lr.number_of_days,
    lr.status,
    EXTRACT(YEAR FROM lr.from_date) as year,
    EXTRACT(MONTH FROM lr.from_date) as month
FROM hrms_data.leave_requests lr
JOIN hrms_data.employees e ON lr.employee_id = e.id
JOIN hrms_data.leave_types lt ON lr.leave_type_id = lt.id
WHERE EXTRACT(YEAR FROM lr.from_date) = 2025
  AND EXTRACT(MONTH FROM lr.from_date) = 12
  AND lr.status IN ('approved', 'taken', 'scheduled', 'pending')
ORDER BY lr.from_date;

-- 3. Check leaves for a specific employee in December 2025
-- Replace <EMPLOYEE_ID> with your actual employee_id from step 1
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
WHERE lr.employee_id = <EMPLOYEE_ID>  -- Replace with your employee_id
  AND EXTRACT(YEAR FROM lr.from_date) = 2025
  AND EXTRACT(MONTH FROM lr.from_date) = 12
  AND lr.status IN ('approved', 'taken', 'scheduled', 'pending')
ORDER BY lr.from_date;

-- 4. Test the exact query used in the API
-- Replace <EMPLOYEE_ID> and <LEAVE_TYPE_ID> with actual values
SELECT 
    COALESCE(SUM(number_of_days), 0) as used_days,
    COUNT(*) as leave_count
FROM hrms_data.leave_requests
WHERE employee_id = <EMPLOYEE_ID>  -- Replace with your employee_id
  AND leave_type_id = <LEAVE_TYPE_ID>  -- Replace with leave_type_id (e.g., 1, 2, 3)
  AND EXTRACT(YEAR FROM from_date) = 2025
  AND EXTRACT(MONTH FROM from_date) = 12
  AND status IN ('approved', 'taken', 'scheduled');

-- 5. Check what the get_employee_leave_report function returns
-- Replace <EMPLOYEE_ID> with your actual employee_id
SELECT * FROM hrms_data.get_employee_leave_report(<EMPLOYEE_ID>, 2025);

-- 6. Check monthly breakdown structure
-- Replace <EMPLOYEE_ID> with your actual employee_id
SELECT 
    leave_type_name,
    total_entitlement,
    used_days,
    balance_days,
    monthly_breakdown,
    violations
FROM hrms_data.get_employee_leave_report(<EMPLOYEE_ID>, 2025)
WHERE monthly_breakdown::text LIKE '%12%' OR monthly_breakdown::text LIKE '%"month": 12%';

