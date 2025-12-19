-- ============================================================================
-- DELETE DUMMY JOB TITLES
-- This script removes all existing job titles from the database
-- Run this as 'postgres' user or with appropriate permissions
-- ============================================================================

SET search_path TO hrms_data, public;

-- View current job titles before deletion
SELECT 
    id,
    title,
    description,
    status
FROM job_titles
ORDER BY id;

-- Delete all job titles (use with caution!)
-- Uncomment the line below to execute:
-- DELETE FROM job_titles;

-- After deletion, verify the table is empty
SELECT COUNT(*) as remaining_count FROM job_titles;

-- Expected result: remaining_count = 0

