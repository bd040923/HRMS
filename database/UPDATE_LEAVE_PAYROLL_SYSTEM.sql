-- ============================================================================
-- UPDATE LEAVE & PAYROLL CALCULATION SYSTEM
-- ============================================================================
-- This script updates the system for 31-day month calculation with 25 working days base
-- ============================================================================

-- ============================================================================
-- 1. UPDATE LEAVE TYPES - Add Unpaid Leave / LWP
-- ============================================================================
-- Insert Unpaid Leave if it doesn't exist
INSERT INTO hrms_data.leave_types (name, description, entitlement_days, status)
VALUES 
    ('Unpaid Leave', 'Leave Without Pay - Deducts from salary', 0, 'active'),
    ('LWP', 'Leave Without Pay - Deducts from salary', 0, 'active')
ON CONFLICT (name) DO NOTHING;

-- Mark existing leave types as paid (if needed)
-- Casual Leave, Earned Leave, Sick Leave are typically paid

-- ============================================================================
-- 2. ADD EMPLOYEE FIELDS (DOJ, Profile, KYC)
-- ============================================================================
-- Add Date of Joining (DOJ)
ALTER TABLE hrms_data.employees 
ADD COLUMN IF NOT EXISTS date_of_joining DATE;

-- Add Profile (JSONB for flexible profile data)
ALTER TABLE hrms_data.employees 
ADD COLUMN IF NOT EXISTS profile JSONB DEFAULT '{}'::jsonb;

-- Add KYC (JSONB for KYC documents and data)
ALTER TABLE hrms_data.employees 
ADD COLUMN IF NOT EXISTS kyc JSONB DEFAULT '{}'::jsonb;

-- ============================================================================
-- 3. UPDATE LEAVE ENTITLEMENTS TABLE
-- ============================================================================
-- Ensure leave_entitlements table exists and has required fields
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

-- Add is_paid flag to leave_types (for payroll calculation)
ALTER TABLE hrms_data.leave_types 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT true;

-- Update existing leave types
UPDATE hrms_data.leave_types 
SET is_paid = true 
WHERE name IN ('Casual Leave', 'Earned Leave', 'Sick Leave', 'US - Vacation', 'US - Sick Leave', 'US - Personal');

UPDATE hrms_data.leave_types 
SET is_paid = false 
WHERE name IN ('Unpaid Leave', 'LWP');

-- ============================================================================
-- 4. CREATE WORK WEEK CONFIGURATION TABLE
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

-- Insert default work week (Monday-Friday, exclude Sunday)
INSERT INTO hrms_data.work_week (monday, tuesday, wednesday, thursday, friday, saturday, sunday)
VALUES (true, true, true, true, true, false, false)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. CREATE PAYROLL CALCULATION HELPER FUNCTION (DYNAMIC)
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
) AS $$
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
    v_is_working_day BOOLEAN;
BEGIN
    -- Calculate month start and end dynamically
    v_month_start := DATE_TRUNC('month', p_month)::DATE;
    v_month_end := (DATE_TRUNC('month', p_month) + INTERVAL '1 month - 1 day')::DATE;
    
    -- Get total days in month dynamically (handles 28, 29, 30, 31 days)
    v_total_days := EXTRACT(DAY FROM v_month_end);
    
    -- Get Work Week configuration (most recent)
    SELECT * INTO v_work_week
    FROM hrms_data.work_week
    ORDER BY id DESC
    LIMIT 1;
    
    -- If no work week config exists, use default (Monday-Friday working, Sunday off)
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
    FOR v_day_of_week IN 0..6 LOOP
        v_is_working_day := false;
        CASE v_day_of_week
            WHEN 0 THEN v_is_working_day := COALESCE(v_work_week.sunday, false);
            WHEN 1 THEN v_is_working_day := COALESCE(v_work_week.monday, true);
            WHEN 2 THEN v_is_working_day := COALESCE(v_work_week.tuesday, true);
            WHEN 3 THEN v_is_working_day := COALESCE(v_work_week.wednesday, true);
            WHEN 4 THEN v_is_working_day := COALESCE(v_work_week.thursday, true);
            WHEN 5 THEN v_is_working_day := COALESCE(v_work_week.friday, true);
            WHEN 6 THEN v_is_working_day := COALESCE(v_work_week.saturday, false);
        END CASE;
        
        IF NOT v_is_working_day THEN
            -- Count occurrences of this day of week in the month
            SELECT COUNT(*) INTO v_off_days
            FROM generate_series(v_month_start, v_month_end, '1 day'::interval) AS day
            WHERE EXTRACT(DOW FROM day) = v_day_of_week;
            
            -- Add to total off days
            v_off_days := v_off_days + (SELECT COUNT(*) 
                FROM generate_series(v_month_start, v_month_end, '1 day'::interval) AS day
                WHERE EXTRACT(DOW FROM day) = v_day_of_week);
        END IF;
    END LOOP;
    
    -- Recalculate off_days properly (count all non-working days)
    SELECT COUNT(*) INTO v_off_days
    FROM generate_series(v_month_start, v_month_end, '1 day'::interval) AS day
    WHERE (
        (EXTRACT(DOW FROM day) = 0 AND COALESCE(v_work_week.sunday, false) = false) OR
        (EXTRACT(DOW FROM day) = 1 AND COALESCE(v_work_week.monday, true) = false) OR
        (EXTRACT(DOW FROM day) = 2 AND COALESCE(v_work_week.tuesday, true) = false) OR
        (EXTRACT(DOW FROM day) = 3 AND COALESCE(v_work_week.wednesday, true) = false) OR
        (EXTRACT(DOW FROM day) = 4 AND COALESCE(v_work_week.thursday, true) = false) OR
        (EXTRACT(DOW FROM day) = 5 AND COALESCE(v_work_week.friday, true) = false) OR
        (EXTRACT(DOW FROM day) = 6 AND COALESCE(v_work_week.saturday, false) = false)
    );
    
    -- Count public holidays in the month (full day holidays only)
    SELECT COUNT(*) INTO v_holidays
    FROM hrms_data.holidays
    WHERE date >= v_month_start
    AND date <= v_month_end
    AND full_day = true;
    
    -- Base working days = Total days - Off days - Holidays
    -- Note: If a holiday falls on an off day, it's already counted in off_days
    -- So we need to avoid double counting
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
            WHEN DATE_TRUNC('month', lr.from_date) = DATE_TRUNC('month', p_month) 
                 AND DATE_TRUNC('month', lr.to_date) = DATE_TRUNC('month', p_month)
            THEN lr.number_of_days
            -- Leave starts before month but ends within
            WHEN DATE_TRUNC('month', lr.from_date) < DATE_TRUNC('month', p_month)
                 AND DATE_TRUNC('month', lr.to_date) = DATE_TRUNC('month', p_month)
            THEN lr.number_of_days
            -- Leave starts within month but ends after
            WHEN DATE_TRUNC('month', lr.from_date) = DATE_TRUNC('month', p_month)
                 AND DATE_TRUNC('month', lr.to_date) > DATE_TRUNC('month', p_month)
            THEN lr.number_of_days
            -- Leave spans the entire month (starts before, ends after)
            WHEN DATE_TRUNC('month', lr.from_date) < DATE_TRUNC('month', p_month)
                 AND DATE_TRUNC('month', lr.to_date) > DATE_TRUNC('month', p_month)
            THEN GREATEST(1, EXTRACT(DAY FROM v_month_end)) -- Approximate, could be refined
            ELSE 0
        END
    ), 0) INTO v_unpaid_leave
    FROM hrms_data.leave_requests lr
    JOIN hrms_data.leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.employee_id = p_employee_id
    AND lr.status IN ('approved', 'taken', 'scheduled')
    AND lt.is_paid = false
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
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. CREATE VIEW FOR LEAVE SUMMARY WITH PAYABLE DAYS
-- ============================================================================
CREATE OR REPLACE VIEW hrms_data.leave_summary_with_payroll AS
SELECT 
    lr.id,
    lr.employee_id,
    e.first_name || ' ' || e.last_name AS employee_name,
    lr.leave_type_id,
    lt.name AS leave_type_name,
    lt.is_paid,
    lr.from_date,
    lr.to_date,
    lr.number_of_days,
    lr.status,
    lr.comments,
    lr.date_applied,
    DATE_TRUNC('month', lr.from_date)::DATE AS leave_month,
    -- Calculate payable days for the month
    (SELECT payable_days 
     FROM hrms_data.calculate_payable_days(lr.from_date, lr.employee_id)) AS payable_days
FROM hrms_data.leave_requests lr
JOIN hrms_data.employees e ON lr.employee_id = e.id
JOIN hrms_data.leave_types lt ON lr.leave_type_id = lt.id;

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================
GRANT ALL PRIVILEGES ON TABLE hrms_data.work_week TO bhushan;
GRANT ALL PRIVILEGES ON TABLE hrms_data.leave_entitlements TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.work_week_id_seq TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.leave_entitlements_id_seq TO bhushan;
GRANT EXECUTE ON FUNCTION hrms_data.calculate_payable_days TO bhushan;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Check leave types with is_paid flag
SELECT name, is_paid, entitlement_days 
FROM hrms_data.leave_types 
ORDER BY name;

-- Test payable days calculation (replace employee_id and date)
-- SELECT * FROM hrms_data.calculate_payable_days('2025-01-01'::DATE, 1);

