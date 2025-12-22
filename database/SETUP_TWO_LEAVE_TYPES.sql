-- ============================================================================
-- SETUP TWO LEAVE TYPES ONLY: CL and EL
-- ============================================================================
-- This script ensures only Casual Leave (CL) and Earned Leave (EL) exist
-- CL includes Sick Leave (no separate SL)
-- ============================================================================

SET search_path TO hrms_data, public;

-- ============================================================================
-- 1. DEACTIVATE ALL EXISTING LEAVE TYPES
-- ============================================================================
UPDATE hrms_data.leave_types 
SET status = 'deleted'
WHERE status != 'deleted';

-- ============================================================================
-- 2. CREATE/UPDATE CASUAL LEAVE (CL) - Includes Sick Leave
-- ============================================================================
-- First, ensure any existing "Casual Leave" is reactivated and updated
UPDATE hrms_data.leave_types 
SET 
    description = 'Casual Leave (CL) - Can be used for personal reasons or illness. Includes Sick Leave.',
    entitlement_days = 8,
    is_paid = true,
    status = 'active',
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'Casual Leave';

-- Insert if doesn't exist
INSERT INTO hrms_data.leave_types (name, description, entitlement_days, is_paid, status)
SELECT 
    'Casual Leave', 
    'Casual Leave (CL) - Can be used for personal reasons or illness. Includes Sick Leave.', 
    8, 
    true, 
    'active'
WHERE NOT EXISTS (SELECT 1 FROM hrms_data.leave_types WHERE name = 'Casual Leave');

-- ============================================================================
-- 3. CREATE/UPDATE EARNED LEAVE (EL) - Also called Privilege Leave
-- ============================================================================
-- First, ensure any existing "Earned Leave" is reactivated and updated
UPDATE hrms_data.leave_types 
SET 
    description = 'Earned Leave / Privilege Leave (EL) - Accumulated leave based on service period.',
    entitlement_days = 12,
    is_paid = true,
    status = 'active',
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'Earned Leave';

-- Insert if doesn't exist
INSERT INTO hrms_data.leave_types (name, description, entitlement_days, is_paid, status)
SELECT 
    'Earned Leave', 
    'Earned Leave / Privilege Leave (EL) - Accumulated leave based on service period.', 
    12, 
    true, 
    'active'
WHERE NOT EXISTS (SELECT 1 FROM hrms_data.leave_types WHERE name = 'Earned Leave');

-- ============================================================================
-- 4. ENSURE IS_PAID FLAG IS CORRECT
-- ============================================================================
UPDATE hrms_data.leave_types 
SET is_paid = true
WHERE name IN ('Casual Leave', 'Earned Leave')
AND status = 'active';

-- ============================================================================
-- 5. VERIFY SETUP
-- ============================================================================
SELECT id, name, description, entitlement_days, is_paid, status
FROM hrms_data.leave_types
WHERE status = 'active'
ORDER BY name;

-- ============================================================================
-- NOTE: 
-- - Casual Leave (CL) can be used for personal reasons OR illness
-- - No separate Sick Leave type exists
-- - Both CL and EL are paid leaves (is_paid = true)
-- - Employees can only apply for CL or EL
-- ============================================================================

