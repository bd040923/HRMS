-- Dashboard Functional Queries
-- These queries are used by the backend to populate dashboard data
-- No new tables needed - uses existing tables

-- 1. Get employees on leave today
-- Used by: Employees on Leave Today widget
SELECT 
    e.id,
    e.first_name || ' ' || e.last_name as employee_name,
    lr.from_date,
    lr.to_date,
    lt.name as leave_type
FROM hrms_data.leave_requests lr
JOIN hrms_data.employees e ON lr.employee_id = e.id
JOIN hrms_data.leave_types lt ON lr.leave_type_id = lt.id
WHERE lr.status = 'approved'
  AND CURRENT_DATE BETWEEN lr.from_date AND lr.to_date
ORDER BY e.first_name;

-- 2. Get employee distribution by department
-- Used by: Employee Distribution by Sub Unit widget
SELECT 
    COALESCE(d.name, 'Unassigned') as department_name,
    COUNT(e.id) as employee_count,
    ROUND(COUNT(e.id) * 100.0 / (SELECT COUNT(*) FROM hrms_data.employees), 2) as percentage
FROM hrms_data.employees e
LEFT JOIN hrms_data.departments d ON e.department_id = d.id
GROUP BY d.name
ORDER BY employee_count DESC;

-- 3. Get pending timesheets count (for managers/admins)
-- Used by: My Actions widget
SELECT COUNT(*) as pending_count
FROM hrms_data.timesheets
WHERE status = 'pending';

-- 4. Get today's attendance hours for current user
-- Used by: Time at Work widget
SELECT 
    punch_in_time,
    punch_out_time,
    CASE 
        WHEN punch_out_time IS NOT NULL THEN
            EXTRACT(EPOCH FROM (punch_out_time::time - punch_in_time::time)) / 3600
        ELSE
            EXTRACT(EPOCH FROM (CURRENT_TIME - punch_in_time::time)) / 3600
    END as hours_worked
FROM hrms_data.attendance_records
WHERE employee_id = :employee_id
  AND DATE(punch_in_date) = CURRENT_DATE
ORDER BY punch_in_time DESC
LIMIT 1;

-- Note: These queries are executed by the backend API endpoints
-- No need to run these manually - they're for reference



