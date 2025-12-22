-- ============================================================================
-- ADD UNPAID LEAVE TYPE
-- ============================================================================
-- Add Unpaid Leave type to the system
-- ============================================================================

SET search_path TO hrms_data, public;

-- Add Unpaid Leave if it doesn't exist
INSERT INTO hrms_data.leave_types (name, description, entitlement_days, is_paid, status)
SELECT 
    'Unpaid Leave', 
    'Unpaid Leave / Leave Without Pay (LWP) - Deducts from payable days and salary.', 
    0, 
    false, 
    'active'
WHERE NOT EXISTS (SELECT 1 FROM hrms_data.leave_types WHERE name = 'Unpaid Leave');

-- Update if exists
UPDATE hrms_data.leave_types 
SET 
    description = 'Unpaid Leave / Leave Without Pay (LWP) - Deducts from payable days and salary.',
    entitlement_days = 0,
    is_paid = false,
    status = 'active',
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'Unpaid Leave';

-- Verify
SELECT id, name, description, entitlement_days, is_paid, status
FROM hrms_data.leave_types
WHERE status = 'active'
ORDER BY 
  CASE 
    WHEN LOWER(name) LIKE '%casual%' THEN 1
    WHEN LOWER(name) LIKE '%earned%' OR LOWER(name) LIKE '%privilege%' THEN 2
    WHEN LOWER(name) LIKE '%unpaid%' OR LOWER(name) LIKE '%lwp%' THEN 3
    ELSE 4
  END,
  name;

