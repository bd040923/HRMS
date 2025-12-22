-- ============================================================================
-- FIX: Dynamic Payroll Calculation Function
-- ============================================================================
-- This fixes the calculate_payable_days function to be fully dynamic
-- No hardcoded values - uses actual month length and Work Week config
-- ============================================================================

-- Drop and recreate the function with dynamic logic
DROP FUNCTION IF EXISTS hrms_data.calculate_payable_days(DATE, INTEGER);

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
    -- Handle cases where leave spans multiple months by calculating actual days in the month
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION hrms_data.calculate_payable_days TO bhushan;

-- Test query (replace with actual values)
-- SELECT * FROM hrms_data.calculate_payable_days('2025-02-01'::DATE, 1); -- February (28/29 days)
-- SELECT * FROM hrms_data.calculate_payable_days('2025-04-01'::DATE, 1); -- April (30 days)
-- SELECT * FROM hrms_data.calculate_payable_days('2025-01-01'::DATE, 1); -- January (31 days)

