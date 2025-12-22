-- ============================================================================
-- LEAVE REPORT FUNCTION - Professional Employee Leave Report
-- ============================================================================
-- This function generates comprehensive leave reports with business rules
-- ============================================================================

-- Function to get leave report for an employee
CREATE OR REPLACE FUNCTION hrms_data.get_employee_leave_report(
    p_employee_id INTEGER,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE(
    leave_type_name VARCHAR,
    total_entitlement DECIMAL,
    used_days DECIMAL,
    balance_days DECIMAL,
    monthly_breakdown JSONB,
    violations JSONB
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_leave_type RECORD;
    v_month INTEGER;
    v_month_start DATE;
    v_month_end DATE;
    v_monthly_data JSONB;
    v_violations JSONB;
    v_used_days DECIMAL;
    v_entitlement DECIMAL;
    v_balance DECIMAL;
    v_casual_in_month INTEGER;
    v_continuous_leaves INTEGER;
    v_prev_leave_end DATE;
BEGIN
    -- Loop through each leave type
    FOR v_leave_type IN 
        SELECT id, name, entitlement_days, is_paid
        FROM hrms_data.leave_types
        WHERE status != 'deleted'
        ORDER BY name
    LOOP
        -- Get entitlement for this leave type (from leave_entitlements or default)
        SELECT COALESCE(entitlement_days, v_leave_type.entitlement_days, 0)
        INTO v_entitlement
        FROM hrms_data.leave_entitlements
        WHERE employee_id = p_employee_id
        AND leave_type_id = v_leave_type.id
        AND (leave_period_start IS NULL OR EXTRACT(YEAR FROM leave_period_start) = p_year)
        ORDER BY leave_period_start DESC
        LIMIT 1;
        
        -- If no entitlement record, use default from leave_type
        IF v_entitlement IS NULL THEN
            v_entitlement := COALESCE(v_leave_type.entitlement_days, 0);
        END IF;
        
        -- Calculate used days for the year
        SELECT COALESCE(SUM(number_of_days), 0)
        INTO v_used_days
        FROM hrms_data.leave_requests lr
        WHERE lr.employee_id = p_employee_id
        AND lr.leave_type_id = v_leave_type.id
        AND EXTRACT(YEAR FROM lr.from_date) = p_year
        AND lr.status IN ('approved', 'taken', 'scheduled');
        
        v_balance := v_entitlement - v_used_days;
        
        -- Build monthly breakdown
        v_monthly_data := '[]'::jsonb;
        v_violations := '[]'::jsonb;
        
        -- Check for violations
        -- Rule 1: Max 2 casual leaves per month
        IF LOWER(v_leave_type.name) LIKE '%casual%' THEN
            FOR v_month IN 1..12 LOOP
                v_month_start := DATE_TRUNC('month', MAKE_DATE(p_year, v_month, 1))::DATE;
                v_month_end := (DATE_TRUNC('month', MAKE_DATE(p_year, v_month, 1)) + INTERVAL '1 month - 1 day')::DATE;
                
                SELECT COUNT(*)
                INTO v_casual_in_month
                FROM hrms_data.leave_requests lr
                WHERE lr.employee_id = p_employee_id
                AND lr.leave_type_id = v_leave_type.id
                AND lr.from_date >= v_month_start
                AND lr.to_date <= v_month_end
                AND lr.status IN ('approved', 'taken', 'scheduled');
                
                IF v_casual_in_month > 2 THEN
                    v_violations := v_violations || jsonb_build_object(
                        'type', 'max_casual_per_month',
                        'month', v_month,
                        'count', v_casual_in_month,
                        'limit', 2,
                        'message', format('Exceeded maximum 2 casual leaves in month %s', to_char(v_month_start, 'Month YYYY'))
                    );
                END IF;
            END LOOP;
        END IF;
        
        -- Rule 2: Check for continuous leaves (no gap between leaves)
        SELECT COUNT(*)
        INTO v_continuous_leaves
        FROM (
            SELECT lr1.id, lr1.to_date,
                   LEAD(lr1.from_date) OVER (ORDER BY lr1.from_date) as next_from
            FROM hrms_data.leave_requests lr1
            WHERE lr1.employee_id = p_employee_id
            AND lr1.leave_type_id = v_leave_type.id
            AND EXTRACT(YEAR FROM lr1.from_date) = p_year
            AND lr1.status IN ('approved', 'taken', 'scheduled')
        ) sub
        WHERE next_from IS NOT NULL
        AND next_from <= to_date + INTERVAL '1 day';
        
        IF v_continuous_leaves > 0 THEN
            v_violations := v_violations || jsonb_build_object(
                'type', 'continuous_leaves',
                'count', v_continuous_leaves,
                'message', 'Leaves are taken continuously without gaps (violates policy)'
            );
        END IF;
        
        -- Build monthly breakdown
        FOR v_month IN 1..12 LOOP
            v_month_start := DATE_TRUNC('month', MAKE_DATE(p_year, v_month, 1))::DATE;
            v_month_end := (DATE_TRUNC('month', MAKE_DATE(p_year, v_month, 1)) + INTERVAL '1 month - 1 day')::DATE;
            
            SELECT COALESCE(SUM(number_of_days), 0)
            INTO v_used_days
            FROM hrms_data.leave_requests lr
            WHERE lr.employee_id = p_employee_id
            AND lr.leave_type_id = v_leave_type.id
            AND lr.from_date >= v_month_start
            AND lr.to_date <= v_month_end
            AND lr.status IN ('approved', 'taken', 'scheduled');
            
            IF v_used_days > 0 THEN
                v_monthly_data := v_monthly_data || jsonb_build_object(
                    'month', v_month,
                    'month_name', to_char(v_month_start, 'Month'),
                    'days', v_used_days
                );
            END IF;
        END LOOP;
        
        RETURN QUERY SELECT
            v_leave_type.name::VARCHAR,
            v_entitlement,
            v_used_days,
            v_balance,
            v_monthly_data,
            v_violations;
    END LOOP;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION hrms_data.get_employee_leave_report(INTEGER, INTEGER) TO bhushan;

-- ============================================================================
-- Function to validate leave request against business rules
-- ============================================================================
CREATE OR REPLACE FUNCTION hrms_data.validate_leave_request(
    p_employee_id INTEGER,
    p_leave_type_id INTEGER,
    p_from_date DATE,
    p_to_date DATE,
    p_number_of_days INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_leave_type RECORD;
    v_year INTEGER;
    v_entitlement DECIMAL;
    v_used_days DECIMAL;
    v_balance DECIMAL;
    v_casual_in_month INTEGER;
    v_month_start DATE;
    v_month_end DATE;
    v_continuous_check BOOLEAN;
    v_validation_result JSONB;
BEGIN
    v_validation_result := '{"valid": true, "errors": []}'::jsonb;
    v_year := EXTRACT(YEAR FROM p_from_date);
    
    -- Get leave type details
    SELECT id, name, entitlement_days, is_paid
    INTO v_leave_type
    FROM hrms_data.leave_types
    WHERE id = p_leave_type_id;
    
    IF v_leave_type IS NULL THEN
        v_validation_result := jsonb_set(
            v_validation_result,
            '{valid}',
            'false'::jsonb
        );
        v_validation_result := jsonb_set(
            v_validation_result,
            '{errors}',
            jsonb_build_array('Invalid leave type')
        );
        RETURN v_validation_result;
    END IF;
    
    -- Check entitlement balance
    SELECT COALESCE(entitlement_days, v_leave_type.entitlement_days, 0)
    INTO v_entitlement
    FROM hrms_data.leave_entitlements
    WHERE employee_id = p_employee_id
    AND leave_type_id = p_leave_type_id
    AND (leave_period_start IS NULL OR EXTRACT(YEAR FROM leave_period_start) = v_year)
    ORDER BY leave_period_start DESC
    LIMIT 1;
    
    IF v_entitlement IS NULL THEN
        v_entitlement := COALESCE(v_leave_type.entitlement_days, 0);
    END IF;
    
    SELECT COALESCE(SUM(number_of_days), 0)
    INTO v_used_days
    FROM hrms_data.leave_requests lr
    WHERE lr.employee_id = p_employee_id
    AND lr.leave_type_id = p_leave_type_id
    AND EXTRACT(YEAR FROM lr.from_date) = v_year
    AND lr.status IN ('approved', 'taken', 'scheduled')
    AND lr.id != COALESCE((SELECT id FROM hrms_data.leave_requests WHERE id = p_employee_id LIMIT 1), 0); -- Exclude current request if updating
    
    v_balance := v_entitlement - v_used_days;
    
    IF v_balance < p_number_of_days THEN
        v_validation_result := jsonb_set(
            v_validation_result,
            '{valid}',
            'false'::jsonb
        );
        v_validation_result := jsonb_set(
            v_validation_result,
            '{errors}',
            (v_validation_result->'errors') || jsonb_build_object(
                'type', 'insufficient_balance',
                'message', format('Insufficient balance. Available: %s days, Requested: %s days', v_balance, p_number_of_days)
            )
        );
    END IF;
    
    -- Rule: Max 2 casual leaves per month
    IF LOWER(v_leave_type.name) LIKE '%casual%' THEN
        v_month_start := DATE_TRUNC('month', p_from_date)::DATE;
        v_month_end := (DATE_TRUNC('month', p_from_date) + INTERVAL '1 month - 1 day')::DATE;
        
        SELECT COUNT(*)
        INTO v_casual_in_month
        FROM hrms_data.leave_requests lr
        WHERE lr.employee_id = p_employee_id
        AND lr.leave_type_id = p_leave_type_id
        AND lr.from_date >= v_month_start
        AND lr.to_date <= v_month_end
        AND lr.status IN ('approved', 'taken', 'scheduled')
        AND lr.id != COALESCE((SELECT id FROM hrms_data.leave_requests WHERE id = p_employee_id LIMIT 1), 0);
        
        IF v_casual_in_month >= 2 THEN
            v_validation_result := jsonb_set(
                v_validation_result,
                '{valid}',
                'false'::jsonb
            );
            v_validation_result := jsonb_set(
                v_validation_result,
                '{errors}',
                (v_validation_result->'errors') || jsonb_build_object(
                    'type', 'max_casual_per_month',
                    'message', format('Maximum 2 casual leaves per month exceeded. Already taken: %s', v_casual_in_month)
                )
            );
        END IF;
    END IF;
    
    -- Rule: Check for continuous leaves (must have gap)
    SELECT EXISTS(
        SELECT 1
        FROM hrms_data.leave_requests lr
        WHERE lr.employee_id = p_employee_id
        AND lr.leave_type_id = p_leave_type_id
        AND EXTRACT(YEAR FROM lr.from_date) = v_year
        AND lr.status IN ('approved', 'taken', 'scheduled')
        AND (
            (lr.to_date + INTERVAL '1 day' >= p_from_date AND lr.to_date < p_to_date)
            OR (p_to_date + INTERVAL '1 day' >= lr.from_date AND p_to_date < lr.to_date)
        )
        AND lr.id != COALESCE((SELECT id FROM hrms_data.leave_requests WHERE id = p_employee_id LIMIT 1), 0)
    ) INTO v_continuous_check;
    
    IF v_continuous_check THEN
        v_validation_result := jsonb_set(
            v_validation_result,
            '{valid}',
            'false'::jsonb
        );
        v_validation_result := jsonb_set(
            v_validation_result,
            '{errors}',
            (v_validation_result->'errors') || jsonb_build_object(
                'type', 'continuous_leaves',
                'message', 'Leaves cannot be taken continuously. There must be a gap between leave periods.'
            )
        );
    END IF;
    
    RETURN v_validation_result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION hrms_data.validate_leave_request(INTEGER, INTEGER, DATE, DATE, INTEGER) TO bhushan;

