-- ============================================================================
-- ESSENTIAL QUERIES TO RUN - Copy and paste these into PostgreSQL
-- ============================================================================

-- 1. Create Leave Report Function
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
BEGIN
    FOR v_leave_type IN 
        SELECT id, name, entitlement_days, is_paid
        FROM hrms_data.leave_types
        WHERE status != 'deleted'
        ORDER BY name
    LOOP
        SELECT COALESCE(entitlement_days, v_leave_type.entitlement_days, 0)
        INTO v_entitlement
        FROM hrms_data.leave_entitlements
        WHERE employee_id = p_employee_id
        AND leave_type_id = v_leave_type.id
        AND (leave_period_start IS NULL OR EXTRACT(YEAR FROM leave_period_start) = p_year)
        ORDER BY leave_period_start DESC
        LIMIT 1;
        
        IF v_entitlement IS NULL THEN
            v_entitlement := COALESCE(v_leave_type.entitlement_days, 0);
        END IF;
        
        SELECT COALESCE(SUM(number_of_days), 0)
        INTO v_used_days
        FROM hrms_data.leave_requests lr
        WHERE lr.employee_id = p_employee_id
        AND lr.leave_type_id = v_leave_type.id
        AND EXTRACT(YEAR FROM lr.from_date) = p_year
        AND lr.status IN ('approved', 'taken', 'scheduled');
        
        v_balance := v_entitlement - v_used_days;
        v_monthly_data := '[]'::jsonb;
        v_violations := '[]'::jsonb;
        
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

-- 2. Create Validation Function
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
    
    SELECT id, name, entitlement_days, is_paid
    INTO v_leave_type
    FROM hrms_data.leave_types
    WHERE id = p_leave_type_id;
    
    IF v_leave_type IS NULL THEN
        v_validation_result := jsonb_set(v_validation_result, '{valid}', 'false'::jsonb);
        v_validation_result := jsonb_set(v_validation_result, '{errors}', jsonb_build_array('Invalid leave type'));
        RETURN v_validation_result;
    END IF;
    
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
    AND lr.status IN ('approved', 'taken', 'scheduled');
    
    v_balance := v_entitlement - v_used_days;
    
    IF v_balance < p_number_of_days THEN
        v_validation_result := jsonb_set(v_validation_result, '{valid}', 'false'::jsonb);
        v_validation_result := jsonb_set(v_validation_result, '{errors}', 
            (v_validation_result->'errors') || jsonb_build_object(
                'type', 'insufficient_balance',
                'message', format('Insufficient balance. Available: %s days, Requested: %s days', v_balance, p_number_of_days)
            )
        );
    END IF;
    
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
        AND lr.status IN ('approved', 'taken', 'scheduled');
        
        IF v_casual_in_month >= 2 THEN
            v_validation_result := jsonb_set(v_validation_result, '{valid}', 'false'::jsonb);
            v_validation_result := jsonb_set(v_validation_result, '{errors}', 
                (v_validation_result->'errors') || jsonb_build_object(
                    'type', 'max_casual_per_month',
                    'message', format('Maximum 2 casual leaves per month exceeded. Already taken: %s', v_casual_in_month)
                )
            );
        END IF;
    END IF;
    
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
    ) INTO v_continuous_check;
    
    IF v_continuous_check THEN
        v_validation_result := jsonb_set(v_validation_result, '{valid}', 'false'::jsonb);
        v_validation_result := jsonb_set(v_validation_result, '{errors}', 
            (v_validation_result->'errors') || jsonb_build_object(
                'type', 'continuous_leaves',
                'message', 'Leaves cannot be taken continuously. There must be a gap between leave periods.'
            )
        );
    END IF;
    
    RETURN v_validation_result;
END;
$$;

-- 3. Grant Permissions
GRANT EXECUTE ON FUNCTION hrms_data.get_employee_leave_report(INTEGER, INTEGER) TO bhushan;
GRANT EXECUTE ON FUNCTION hrms_data.validate_leave_request(INTEGER, INTEGER, DATE, DATE, INTEGER) TO bhushan;

-- 4. Setup Default Entitlements (8 Casual, 12 Earned)
DO $$
DECLARE
    v_casual_leave_id INTEGER;
    v_earned_leave_id INTEGER;
    v_employee RECORD;
    v_current_year INTEGER;
BEGIN
    v_current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    SELECT id INTO v_casual_leave_id FROM hrms_data.leave_types WHERE name = 'Casual Leave';
    SELECT id INTO v_earned_leave_id FROM hrms_data.leave_types WHERE name = 'Earned Leave';
    
    IF v_casual_leave_id IS NULL THEN
        INSERT INTO hrms_data.leave_types (name, description, entitlement_days, status, is_paid)
        VALUES ('Casual Leave', 'Casual Leave - Maximum 8 days per year, max 2 per month', 8, 'active', true)
        RETURNING id INTO v_casual_leave_id;
    END IF;
    
    IF v_earned_leave_id IS NULL THEN
        INSERT INTO hrms_data.leave_types (name, description, entitlement_days, status, is_paid)
        VALUES ('Earned Leave', 'Earned Leave - Maximum 12 days per year', 12, 'active', true)
        RETURNING id INTO v_earned_leave_id;
    END IF;
    
    FOR v_employee IN 
        SELECT id FROM hrms_data.employees WHERE status = 'active' OR status IS NULL
    LOOP
        INSERT INTO hrms_data.leave_entitlements (employee_id, leave_type_id, entitlement_days, leave_period_start, leave_period_end)
        VALUES (v_employee.id, v_casual_leave_id, 8, DATE_TRUNC('year', CURRENT_DATE)::DATE, (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year - 1 day')::DATE)
        ON CONFLICT (employee_id, leave_type_id, leave_period_start) DO UPDATE SET entitlement_days = 8;
        
        INSERT INTO hrms_data.leave_entitlements (employee_id, leave_type_id, entitlement_days, leave_period_start, leave_period_end)
        VALUES (v_employee.id, v_earned_leave_id, 12, DATE_TRUNC('year', CURRENT_DATE)::DATE, (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year - 1 day')::DATE)
        ON CONFLICT (employee_id, leave_type_id, leave_period_start) DO UPDATE SET entitlement_days = 12;
    END LOOP;
END $$;



