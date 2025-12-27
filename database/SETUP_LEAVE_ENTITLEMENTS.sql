-- ============================================================================
-- SETUP LEAVE ENTITLEMENTS - Business Rules
-- ============================================================================
-- This script sets up default entitlements:
-- - 8 Casual Leaves per year
-- - 12 Earned Leaves per year
-- ============================================================================

-- First, ensure leave types exist
INSERT INTO hrms_data.leave_types (name, description, entitlement_days, status, is_paid)
VALUES 
    ('Casual Leave', 'Casual Leave - Maximum 8 days per year, max 2 per month', 8, 'active', true),
    ('Earned Leave', 'Earned Leave - Maximum 12 days per year', 12, 'active', true)
ON CONFLICT (name) DO UPDATE 
SET entitlement_days = EXCLUDED.entitlement_days,
    description = EXCLUDED.description;

-- Get leave type IDs
DO $$
DECLARE
    v_casual_leave_id INTEGER;
    v_earned_leave_id INTEGER;
    v_employee RECORD;
    v_current_year INTEGER;
BEGIN
    v_current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Get leave type IDs
    SELECT id INTO v_casual_leave_id FROM hrms_data.leave_types WHERE name = 'Casual Leave';
    SELECT id INTO v_earned_leave_id FROM hrms_data.leave_types WHERE name = 'Earned Leave';
    
    -- Set entitlements for all active employees
    FOR v_employee IN 
        SELECT id FROM hrms_data.employees WHERE status = 'active' OR status IS NULL
    LOOP
        -- Casual Leave: 8 days per year
        INSERT INTO hrms_data.leave_entitlements (
            employee_id, 
            leave_type_id, 
            entitlement_days, 
            leave_period_start, 
            leave_period_end
        )
        VALUES (
            v_employee.id,
            v_casual_leave_id,
            8,
            DATE_TRUNC('year', CURRENT_DATE)::DATE,
            (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year - 1 day')::DATE
        )
        ON CONFLICT (employee_id, leave_type_id, leave_period_start) 
        DO UPDATE SET 
            entitlement_days = 8,
            updated_at = CURRENT_TIMESTAMP;
        
        -- Earned Leave: 12 days per year
        INSERT INTO hrms_data.leave_entitlements (
            employee_id, 
            leave_type_id, 
            entitlement_days, 
            leave_period_start, 
            leave_period_end
        )
        VALUES (
            v_employee.id,
            v_earned_leave_id,
            12,
            DATE_TRUNC('year', CURRENT_DATE)::DATE,
            (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year - 1 day')::DATE
        )
        ON CONFLICT (employee_id, leave_type_id, leave_period_start) 
        DO UPDATE SET 
            entitlement_days = 12,
            updated_at = CURRENT_TIMESTAMP;
    END LOOP;
    
    RAISE NOTICE 'Leave entitlements set up for all active employees';
END $$;

-- Verify setup
SELECT 
    e.first_name || ' ' || e.last_name as employee_name,
    lt.name as leave_type,
    le.entitlement_days,
    le.leave_period_start,
    le.leave_period_end
FROM hrms_data.leave_entitlements le
JOIN hrms_data.employees e ON le.employee_id = e.id
JOIN hrms_data.leave_types lt ON le.leave_type_id = lt.id
WHERE lt.name IN ('Casual Leave', 'Earned Leave')
ORDER BY e.first_name, lt.name;



