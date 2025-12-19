-- ============================================================================
-- VIEW ORGANIZATION STRUCTURE DATA
-- Run this to see the organization structure in the database
-- ============================================================================

SET search_path TO hrms_data, public;

-- View all organization units
SELECT 
    id,
    name,
    unit_id,
    description,
    parent_id,
    level,
    status,
    created_at,
    updated_at
FROM organization_structure
ORDER BY level, name;

-- View with parent names
SELECT 
    os.id,
    os.name,
    os.unit_id,
    os.level,
    os.parent_id,
    parent.name AS parent_name
FROM hrms_data.organization_structure os
LEFT JOIN hrms_data.organization_structure parent ON os.parent_id = parent.id
ORDER BY os.level, os.name;

-- View root organization
SELECT * FROM hrms_data.organization_structure 
WHERE parent_id IS NULL;

-- Count units by level
SELECT 
    level,
    COUNT(*) AS count
FROM hrms_data.organization_structure
GROUP BY level
ORDER BY level;

