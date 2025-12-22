-- ============================================================================
-- MONTHLY LEAVE SUMMARY FUNCTION
-- ============================================================================
-- Returns comprehensive monthly leave summary as per requirements:
-- - Total days
-- - Sundays (off_days)
-- - Holidays
-- - Net working days
-- - CL used
-- - EL used
-- - LWP used
-- - Final payable days
-- ============================================================================

CREATE OR REPLACE FUNCTION hrms_data.get_monthly_leave_summary(
    p_employee_id INTEGER,
    p_month DATE
)
RETURNS TABLE(
    total_days INTEGER,
    sundays INTEGER,
    holidays INTEGER,
    net_working_days INTEGER,
    cl_used DECIMAL,
    el_used DECIMAL,
    lwp_used DECIMAL,
    final_payable_days DECIMAL
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
    v_cl_used DECIMAL := 0;
    v_el_used DECIMAL := 0;
    v_lwp_used DECIMAL := 0;
    v_sundays INTEGER := 0;
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
    
    -- Count Sundays specifically (for reporting)
    SELECT COUNT(*) INTO v_sundays
    FROM generate_series(v_month_start, v_month_end, '1 day'::interval) AS day
    WHERE EXTRACT(DOW FROM day) = 0; -- 0 = Sunday
    
    -- Count all off days (non-working days) in the month based on Work Week config
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
    -- Exclude holidays that fall on off days (no double counting)
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
    
    -- Net working days = Total days - Off days - Holidays
    v_working_days := v_total_days - v_off_days - v_holidays;
    
    -- Ensure working days is not negative
    IF v_working_days < 0 THEN
        v_working_days := 0;
    END IF;
    
    -- Calculate CL (Casual Leave) used in the month
    -- CL includes Sick Leave (no separate SL)
    -- Paid leave, deducted from working days but not from payable days
    SELECT COALESCE(SUM(
        CASE 
            WHEN lr.from_date >= v_month_start AND lr.to_date <= v_month_end
            THEN lr.number_of_days
            WHEN lr.from_date < v_month_start AND lr.to_date >= v_month_start AND lr.to_date <= v_month_end
            THEN GREATEST(1, EXTRACT(DAY FROM (lr.to_date - v_month_start + 1)))
            WHEN lr.from_date >= v_month_start AND lr.from_date <= v_month_end AND lr.to_date > v_month_end
            THEN GREATEST(1, EXTRACT(DAY FROM (v_month_end - lr.from_date + 1)))
            WHEN lr.from_date < v_month_start AND lr.to_date > v_month_end
            THEN v_total_days
            ELSE 0
        END
    ), 0) INTO v_cl_used
    FROM hrms_data.leave_requests lr
    JOIN hrms_data.leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.employee_id = p_employee_id
    AND lr.status IN ('approved', 'taken', 'scheduled')
    AND LOWER(lt.name) LIKE '%casual%'
    AND (lr.from_date <= v_month_end AND lr.to_date >= v_month_start);
    
    -- Calculate EL (Earned Leave / Privilege Leave) used in the month
    -- Paid leave, deducted from working days but not from payable days
    SELECT COALESCE(SUM(
        CASE 
            WHEN lr.from_date >= v_month_start AND lr.to_date <= v_month_end
            THEN lr.number_of_days
            WHEN lr.from_date < v_month_start AND lr.to_date >= v_month_start AND lr.to_date <= v_month_end
            THEN GREATEST(1, EXTRACT(DAY FROM (lr.to_date - v_month_start + 1)))
            WHEN lr.from_date >= v_month_start AND lr.from_date <= v_month_end AND lr.to_date > v_month_end
            THEN GREATEST(1, EXTRACT(DAY FROM (v_month_end - lr.from_date + 1)))
            WHEN lr.from_date < v_month_start AND lr.to_date > v_month_end
            THEN v_total_days
            ELSE 0
        END
    ), 0) INTO v_el_used
    FROM hrms_data.leave_requests lr
    JOIN hrms_data.leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.employee_id = p_employee_id
    AND lr.status IN ('approved', 'taken', 'scheduled')
    AND (LOWER(lt.name) LIKE '%earned%' OR LOWER(lt.name) LIKE '%privilege%')
    AND (lr.from_date <= v_month_end AND lr.to_date >= v_month_start);
    
    -- Calculate LWP (Leave Without Pay) used in the month
    -- Unpaid leave, deducted from payable days
    SELECT COALESCE(SUM(
        CASE 
            WHEN lr.from_date >= v_month_start AND lr.to_date <= v_month_end
            THEN lr.number_of_days
            WHEN lr.from_date < v_month_start AND lr.to_date >= v_month_start AND lr.to_date <= v_month_end
            THEN GREATEST(1, EXTRACT(DAY FROM (lr.to_date - v_month_start + 1)))
            WHEN lr.from_date >= v_month_start AND lr.from_date <= v_month_end AND lr.to_date > v_month_end
            THEN GREATEST(1, EXTRACT(DAY FROM (v_month_end - lr.from_date + 1)))
            WHEN lr.from_date < v_month_start AND lr.to_date > v_month_end
            THEN v_total_days
            ELSE 0
        END
    ), 0) INTO v_lwp_used
    FROM hrms_data.leave_requests lr
    JOIN hrms_data.leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.employee_id = p_employee_id
    AND lr.status IN ('approved', 'taken', 'scheduled')
    AND (lt.is_paid = false OR LOWER(lt.name) LIKE '%unpaid%' OR LOWER(lt.name) LIKE '%lwp%' OR LOWER(lt.name) LIKE '%loss of pay%')
    AND (lr.from_date <= v_month_end AND lr.to_date >= v_month_start);
    
    -- Final payable days = Net working days - LWP
    -- CL and EL are paid, so they don't reduce payable days
    v_payable_days := v_working_days - v_lwp_used;
    
    -- Ensure payable days is not negative
    IF v_payable_days < 0 THEN
        v_payable_days := 0;
    END IF;
    
    RETURN QUERY SELECT 
        v_total_days::INTEGER,
        v_sundays::INTEGER,
        v_holidays::INTEGER,
        v_working_days::INTEGER,
        v_cl_used,
        v_el_used,
        v_lwp_used,
        v_payable_days;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION hrms_data.get_monthly_leave_summary(INTEGER, DATE) TO bhushan;

-- ============================================================================
-- Example Usage:
-- ============================================================================
-- SELECT * FROM hrms_data.get_monthly_leave_summary(1, '2025-01-01'::DATE);
-- Returns:
-- total_days | sundays | holidays | net_working_days | cl_used | el_used | lwp_used | final_payable_days
-- ------------+---------+----------+------------------+---------+---------+-----------+-------------------
--          31 |       5 |        1 |               25 |     1.0 |     1.0 |       1.0 |              24.0
-- ============================================================================

