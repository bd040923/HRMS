-- ============================================================================
-- UPDATE LEAVE VALIDATION RULES - FIXED VERSION
-- ============================================================================
-- Business Rules:
-- 1. Casual Leave: 8 days annually, max 2 leave requests per month
-- 2. If annual limit exceeded, auto-convert to Unpaid Leave
-- 3. No continuous leaves (must have gap between leave periods)
-- ============================================================================

SET search_path TO hrms_data, public;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS hrms_data.validate_leave_request(INTEGER, INTEGER, DATE, DATE, INTEGER);

-- Create the validation function
CREATE OR REPLACE FUNCTION hrms_data.validate_leave_request(
    p_employee_id INTEGER,
    p_leave_type_id INTEGER,
    p_from_date DATE,
    p_to_date DATE,
    p_number_of_days INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
AS $BODY$
DECLARE
    v_leave_type RECORD;
    v_year INTEGER;
    v_entitlement DECIMAL;
    v_used_days DECIMAL;
    v_balance DECIMAL;
    v_casual_requests_in_month INTEGER;
    v_month_start DATE;
    v_month_end DATE;
    v_continuous_check BOOLEAN;
    v_validation_result JSONB;
    v_unpaid_leave_type_id INTEGER;
BEGIN
    v_validation_result := '{"valid": true, "errors": [], "auto_convert_to_unpaid": false}'::jsonb;
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
    
    -- Get unpaid leave type ID for auto-conversion
    SELECT id INTO v_unpaid_leave_type_id
    FROM hrms_data.leave_types
    WHERE (LOWER(name) LIKE '%unpaid%' OR LOWER(name) LIKE '%lwp%')
    AND status = 'active'
    LIMIT 1;
    
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
    
    -- Calculate used days for the year (for balance check)
    SELECT COALESCE(SUM(number_of_days), 0)
    INTO v_used_days
    FROM hrms_data.leave_requests lr
    WHERE lr.employee_id = p_employee_id
    AND lr.leave_type_id = p_leave_type_id
    AND EXTRACT(YEAR FROM lr.from_date) = v_year
    AND lr.status IN ('approved', 'taken', 'scheduled');
    
    v_balance := v_entitlement - v_used_days;
    
    -- Rule 1: For Casual Leave - Check annual limit (8 days)
    IF LOWER(v_leave_type.name) LIKE '%casual%' THEN
        -- Count ALL casual leaves (by name, not just by leave_type_id) for annual limit
        SELECT COALESCE(SUM(lr.number_of_days), 0)
        INTO v_used_days
        FROM hrms_data.leave_requests lr
        JOIN hrms_data.leave_types lt ON lr.leave_type_id = lt.id
        WHERE lr.employee_id = p_employee_id
        AND LOWER(lt.name) LIKE '%casual%'
        AND EXTRACT(YEAR FROM lr.from_date) = v_year
        AND lr.status IN ('approved', 'taken', 'scheduled');
        
        -- Check if annual limit will be exceeded
        IF (v_used_days + p_number_of_days) > 8 THEN
            -- Auto-convert to unpaid leave if unpaid leave type exists
            IF v_unpaid_leave_type_id IS NOT NULL THEN
                v_validation_result := jsonb_set(
                    v_validation_result,
                    '{auto_convert_to_unpaid}',
                    'true'::jsonb
                );
                v_validation_result := jsonb_set(
                    v_validation_result,
                    '{suggested_leave_type_id}',
                    to_jsonb(v_unpaid_leave_type_id)
                );
                v_validation_result := jsonb_set(
                    v_validation_result,
                    '{warnings}',
                    jsonb_build_array(
                        format('Annual casual leave limit (8 days) exceeded. This will be converted to Unpaid Leave. Used: %s days, Requested: %s days', 
                               v_used_days, p_number_of_days)
                    )
                );
                -- Allow the request but mark for conversion
                RETURN v_validation_result;
            ELSE
                -- No unpaid leave type exists, reject the request
                v_validation_result := jsonb_set(
                    v_validation_result,
                    '{valid}',
                    'false'::jsonb
                );
                v_validation_result := jsonb_set(
                    v_validation_result,
                    '{errors}',
                    jsonb_build_array(
                        format('Annual casual leave limit (8 days) exceeded. Used: %s days, Requested: %s days. Please use Unpaid Leave instead.', 
                               v_used_days, p_number_of_days)
                    )
                );
                RETURN v_validation_result;
            END IF;
        END IF;
        
        -- Rule 2: Max 2 casual leave requests per month (not days, but requests)
        v_month_start := DATE_TRUNC('month', p_from_date)::DATE;
        v_month_end := (DATE_TRUNC('month', p_from_date) + INTERVAL '1 month - 1 day')::DATE;
        
        -- Count ALL casual leave requests (by name, not just by leave_type_id) in the month
        SELECT COUNT(*)
        INTO v_casual_requests_in_month
        FROM hrms_data.leave_requests lr
        JOIN hrms_data.leave_types lt ON lr.leave_type_id = lt.id
        WHERE lr.employee_id = p_employee_id
        AND LOWER(lt.name) LIKE '%casual%'
        AND (
            (lr.from_date >= v_month_start AND lr.from_date <= v_month_end)
            OR (lr.to_date >= v_month_start AND lr.to_date <= v_month_end)
            OR (lr.from_date <= v_month_start AND lr.to_date >= v_month_end)
        )
        AND lr.status IN ('approved', 'taken', 'scheduled', 'pending');
        
        IF v_casual_requests_in_month >= 2 THEN
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
                    'message', format('Maximum 2 casual leave requests per month exceeded. Already have %s request(s) in this month.', v_casual_requests_in_month)
                )
            );
        END IF;
    END IF;
    
    -- Rule 3: Check for continuous leaves (must have gap between leave periods)
    -- This applies to all leave types
    SELECT EXISTS(
        SELECT 1
        FROM hrms_data.leave_requests lr
        WHERE lr.employee_id = p_employee_id
        AND lr.leave_type_id = p_leave_type_id
        AND EXTRACT(YEAR FROM lr.from_date) = v_year
        AND lr.status IN ('approved', 'taken', 'scheduled', 'pending')
        AND (
            -- Check if new leave starts immediately after an existing leave ends
            (lr.to_date + INTERVAL '1 day' = p_from_date)
            -- Check if new leave ends immediately before an existing leave starts
            OR (p_to_date + INTERVAL '1 day' = lr.from_date)
            -- Check if leaves overlap
            OR (p_from_date <= lr.to_date AND p_to_date >= lr.from_date)
        )
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
                'message', 'Leaves cannot be taken continuously. There must be at least one working day gap between leave periods.'
            )
        );
    END IF;
    
    -- Rule 4: Check balance for non-casual leaves
    IF LOWER(v_leave_type.name) NOT LIKE '%casual%' AND LOWER(v_leave_type.name) NOT LIKE '%unpaid%' THEN
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
                    'message', format('Insufficient leave balance. Available: %s days, Requested: %s days', 
                                     v_balance, p_number_of_days)
                )
            );
        END IF;
    END IF;
    
    RETURN v_validation_result;
END;
$BODY$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION hrms_data.validate_leave_request(INTEGER, INTEGER, DATE, DATE, INTEGER) TO PUBLIC;

-- Verify the function was created
SELECT 
    routine_name,
    routine_type,
    'Function created successfully' as status
FROM information_schema.routines
WHERE routine_schema = 'hrms_data'
AND routine_name = 'validate_leave_request';



