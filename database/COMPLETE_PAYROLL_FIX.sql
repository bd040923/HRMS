-- ============================================================================
-- COMPLETE PAYROLL CALCULATION FIX - Run this entire script
-- ============================================================================
-- This script fixes all payroll calculation issues and makes it fully dynamic
-- ============================================================================

-- ============================================================================
-- STEP 1: Add is_paid column to leave_types if it doesn't exist
-- ============================================================================
ALTER TABLE hrms_data.leave_types 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT true;

-- Update existing leave types to be paid by default
UPDATE hrms_data.leave_types 
SET is_paid = true 
WHERE is_paid IS NULL;

-- Mark unpaid leave types
UPDATE hrms_data.leave_types 
SET is_paid = false 
WHERE LOWER(name) IN ('unpaid leave', 'lwp', 'leave without pay');

-- Insert Unpaid Leave if it doesn't exist
INSERT INTO hrms_data.leave_types (name, description, entitlement_days, status, is_paid)
SELECT 'Unpaid Leave', 'Leave Without Pay - Deducts from salary', 0, 'active', false
WHERE NOT EXISTS (SELECT 1 FROM hrms_data.leave_types WHERE name = 'Unpaid Leave');

INSERT INTO hrms_data.leave_types (name, description, entitlement_days, status, is_paid)
SELECT 'LWP', 'Leave Without Pay - Deducts from salary', 0, 'active', false
WHERE NOT EXISTS (SELECT 1 FROM hrms_data.leave_types WHERE name = 'LWP');

-- ============================================================================
-- STEP 2: Add employee fields if they don't exist
-- ============================================================================
ALTER TABLE hrms_data.employees 
ADD COLUMN IF NOT EXISTS date_of_joining DATE;

ALTER TABLE hrms_data.employees 
ADD COLUMN IF NOT EXISTS profile JSONB DEFAULT '{}'::jsonb;

ALTER TABLE hrms_data.employees 
ADD COLUMN IF NOT EXISTS kyc JSONB DEFAULT '{}'::jsonb;

-- ============================================================================
-- STEP 3: Create work_week table if it doesn't exist
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.work_week (
    id SERIAL PRIMARY KEY,
    monday BOOLEAN DEFAULT true,
    tuesday BOOLEAN DEFAULT true,
    wednesday BOOLEAN DEFAULT true,
    thursday BOOLEAN DEFAULT true,
    friday BOOLEAN DEFAULT true,
    saturday BOOLEAN DEFAULT false,
    sunday BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default work week if none exists
INSERT INTO hrms_data.work_week (monday, tuesday, wednesday, thursday, friday, saturday, sunday)
SELECT true, true, true, true, true, false, false
WHERE NOT EXISTS (SELECT 1 FROM hrms_data.work_week);

-- ============================================================================
-- STEP 4: Create leave_entitlements table if it doesn't exist
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.leave_entitlements (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    leave_type_id INTEGER NOT NULL,
    entitlement_days DECIMAL(10, 2) DEFAULT 0,
    used_days DECIMAL(10, 2) DEFAULT 0,
    balance_days DECIMAL(10, 2) GENERATED ALWAYS AS (entitlement_days - used_days) STORED,
    leave_period_start DATE,
    leave_period_end DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES hrms_data.leave_types(id) ON DELETE RESTRICT,
    UNIQUE(employee_id, leave_type_id, leave_period_start)
);

-- ============================================================================
-- STEP 5: Drop old function if it exists (to avoid conflicts)
-- ============================================================================
DROP FUNCTION IF EXISTS hrms_data.calculate_payable_days(DATE, INTEGER);
DROP FUNCTION IF EXISTS hrms_data.calculate_payable_days(date, integer);

-- ============================================================================
-- STEP 6: Create the new dynamic calculate_payable_days function
-- ============================================================================
CREATE OR REPLACE FUNCTION hrms_data.calculate_payable_days(
    p_month DATE,
    p_employee_id INTEGER
)
RETURNS TABLE(
    total_days INTEGER,
    off_days INTEGER,
    holidays INTEGER,
    working_days INTEGER,
    unpaid_leave_days DECIMAL,
    payable_days DECIMAL
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_days INTEGER;
    v_off_days INTEGER;
    v_holidays INTEGER;
    v_working_days INTEGER;
    v_unpaid_leave DECIMAL;
    v_payable_days DECIMAL;
    v_month_start DATE;
    v_month_end DATE;
    v_work_week RECORD;
    v_day_of_week INTEGER;
    v_current_date DATE;
    v_is_off_day BOOLEAN;
BEGIN
    -- Calculate month start and end dynamically
    v_month_start := DATE_TRUNC('month', p_month)::DATE;
    v_month_end := (DATE_TRUNC('month', p_month) + INTERVAL '1 month - 1 day')::DATE;
    
    -- Get total days in month dynamically (handles 28, 29, 30, 31 days, leap years)
    v_total_days := EXTRACT(DAY FROM v_month_end);
    
    -- Get Work Week configuration (most recent)
    SELECT * INTO v_work_week
    FROM hrms_data.work_week
    ORDER BY id DESC
    LIMIT 1;
    
    -- If no work week config exists, use default (Monday-Friday working, Saturday-Sunday off)
    IF v_work_week IS NULL THEN
        v_work_week.monday := true;
        v_work_week.tuesday := true;
        v_work_week.wednesday := true;
        v_work_week.thursday := true;
        v_work_week.friday := true;
        v_work_week.saturday := false;
        v_work_week.sunday := false;
    END IF;
    
    -- Count off days (non-working days) in the month based on Work Week config
    -- DOW: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
    v_off_days := 0;
    v_current_date := v_month_start;
    
    WHILE v_current_date <= v_month_end LOOP
        v_day_of_week := EXTRACT(DOW FROM v_current_date);
        v_is_off_day := false;
        
        -- Check if this day is an off day based on work week config
        IF v_day_of_week = 0 AND COALESCE(v_work_week.sunday, false) = false THEN
            v_is_off_day := true;
        ELSIF v_day_of_week = 1 AND COALESCE(v_work_week.monday, true) = false THEN
            v_is_off_day := true;
        ELSIF v_day_of_week = 2 AND COALESCE(v_work_week.tuesday, true) = false THEN
            v_is_off_day := true;
        ELSIF v_day_of_week = 3 AND COALESCE(v_work_week.wednesday, true) = false THEN
            v_is_off_day := true;
        ELSIF v_day_of_week = 4 AND COALESCE(v_work_week.thursday, true) = false THEN
            v_is_off_day := true;
        ELSIF v_day_of_week = 5 AND COALESCE(v_work_week.friday, true) = false THEN
            v_is_off_day := true;
        ELSIF v_day_of_week = 6 AND COALESCE(v_work_week.saturday, false) = false THEN
            v_is_off_day := true;
        END IF;
        
        IF v_is_off_day THEN
            v_off_days := v_off_days + 1;
        END IF;
        
        v_current_date := v_current_date + INTERVAL '1 day';
    END LOOP;
    
    -- Count public holidays in the month (full day holidays only)
    -- Exclude holidays that fall on off days (already counted)
    SELECT COUNT(*) INTO v_holidays
    FROM hrms_data.holidays h
    WHERE h.date >= v_month_start
    AND h.date <= v_month_end
    AND h.full_day = true
    AND NOT (
        -- Exclude if holiday falls on an off day
        (EXTRACT(DOW FROM h.date) = 0 AND COALESCE(v_work_week.sunday, false) = false) OR
        (EXTRACT(DOW FROM h.date) = 1 AND COALESCE(v_work_week.monday, true) = false) OR
        (EXTRACT(DOW FROM h.date) = 2 AND COALESCE(v_work_week.tuesday, true) = false) OR
        (EXTRACT(DOW FROM h.date) = 3 AND COALESCE(v_work_week.wednesday, true) = false) OR
        (EXTRACT(DOW FROM h.date) = 4 AND COALESCE(v_work_week.thursday, true) = false) OR
        (EXTRACT(DOW FROM h.date) = 5 AND COALESCE(v_work_week.friday, true) = false) OR
        (EXTRACT(DOW FROM h.date) = 6 AND COALESCE(v_work_week.saturday, false) = false)
    );
    
    -- Base working days = Total days - Off days - Holidays
    v_working_days := v_total_days - v_off_days - v_holidays;
    
    -- Ensure working days is not negative
    IF v_working_days < 0 THEN
        v_working_days := 0;
    END IF;
    
    -- Calculate unpaid leave days for the month
    -- Handle cases where leave spans multiple months
    SELECT COALESCE(SUM(
        CASE 
            -- Leave entirely within the month
            WHEN lr.from_date >= v_month_start AND lr.to_date <= v_month_end
            THEN lr.number_of_days
            -- Leave starts before month but ends within
            WHEN lr.from_date < v_month_start AND lr.to_date >= v_month_start AND lr.to_date <= v_month_end
            THEN GREATEST(1, EXTRACT(DAY FROM (lr.to_date - v_month_start + 1)))
            -- Leave starts within month but ends after
            WHEN lr.from_date >= v_month_start AND lr.from_date <= v_month_end AND lr.to_date > v_month_end
            THEN GREATEST(1, EXTRACT(DAY FROM (v_month_end - lr.from_date + 1)))
            -- Leave spans the entire month (starts before, ends after)
            WHEN lr.from_date < v_month_start AND lr.to_date > v_month_end
            THEN v_total_days
            ELSE 0
        END
    ), 0) INTO v_unpaid_leave
    FROM hrms_data.leave_requests lr
    JOIN hrms_data.leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.employee_id = p_employee_id
    AND lr.status IN ('approved', 'taken', 'scheduled')
    AND COALESCE(lt.is_paid, true) = false
    AND (
        (lr.from_date <= v_month_end AND lr.to_date >= v_month_start)
    );
    
    -- Payable days = Working days - Unpaid leave
    v_payable_days := v_working_days - v_unpaid_leave;
    
    -- Ensure payable days is not negative
    IF v_payable_days < 0 THEN
        v_payable_days := 0;
    END IF;
    
    RETURN QUERY SELECT 
        v_total_days::INTEGER,
        v_off_days::INTEGER,
        v_holidays::INTEGER,
        v_working_days::INTEGER,
        v_unpaid_leave,
        v_payable_days;
END;
$$;

-- ============================================================================
-- STEP 7: Grant permissions
-- ============================================================================
GRANT ALL PRIVILEGES ON TABLE hrms_data.work_week TO bhushan;
GRANT ALL PRIVILEGES ON TABLE hrms_data.leave_entitlements TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.work_week_id_seq TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.leave_entitlements_id_seq TO bhushan;
GRANT EXECUTE ON FUNCTION hrms_data.calculate_payable_days(DATE, INTEGER) TO bhushan;

-- ============================================================================
-- VERIFICATION QUERIES (Optional - run these to test)
-- ============================================================================

-- Check if function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'calculate_payable_days' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'hrms_data');

-- Test the function (replace employee_id with actual ID)
-- SELECT * FROM hrms_data.calculate_payable_days('2025-01-01'::DATE, 1);
-- SELECT * FROM hrms_data.calculate_payable_days('2025-02-01'::DATE, 1); -- February (28 days)
-- SELECT * FROM hrms_data.calculate_payable_days('2025-04-01'::DATE, 1); -- April (30 days)

-- Check work week config
SELECT * FROM hrms_data.work_week ORDER BY id DESC LIMIT 1;

-- Check leave types with is_paid flag
SELECT name, is_paid, entitlement_days 
FROM hrms_data.leave_types 
ORDER BY name;

