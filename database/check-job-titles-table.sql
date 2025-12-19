-- ============================================================================
-- CHECK IF job_titles TABLE EXISTS
-- Run this to verify the table exists and has the correct structure
-- ============================================================================

SET search_path TO hrms_data, public;

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'hrms_data' 
  AND table_name = 'job_titles'
) AS table_exists;

-- View table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'hrms_data'
AND table_name = 'job_titles'
ORDER BY ordinal_position;

-- View current data (if any)
SELECT * FROM job_titles;

-- Count records
SELECT COUNT(*) as total_records FROM job_titles;

