-- ============================================================================
-- CLEANUP RECRUITMENT/ONBOARDING DUMMY DATA
-- ============================================================================
-- This script removes ALL dummy/sample data from recruitment tables
-- Run this to start fresh and create entries from the admin UI
-- ============================================================================

SET search_path TO hrms_data, public;

-- ============================================================================
-- WARNING: This will delete ALL data from these tables!
-- ============================================================================
-- Make sure you want to delete everything before running this script.
-- This cannot be undone!
-- ============================================================================

-- Step 1: Delete all candidate-vacancy relationships first
-- (This must be done before deleting candidates or vacancies due to foreign keys)
DELETE FROM hrms_data.candidate_vacancies;

-- Step 2: Delete all candidates
DELETE FROM hrms_data.candidates;

-- Step 3: Delete all vacancies
DELETE FROM hrms_data.vacancies;

-- ============================================================================
-- OPTIONAL: Delete sample job titles (if you want to start completely fresh)
-- ============================================================================
-- Uncomment the following lines if you also want to remove sample job titles
-- Note: Only do this if you're sure you want to remove ALL job titles
-- You can always add job titles back through Admin → Job → Job Titles

-- DELETE FROM hrms_data.job_titles;

-- ============================================================================
-- Reset auto-increment sequences (optional)
-- ============================================================================
-- This resets the ID counters so new records start from 1
-- Uncomment if you want to reset the sequence numbers

-- ALTER SEQUENCE hrms_data.candidates_id_seq RESTART WITH 1;
-- ALTER SEQUENCE hrms_data.vacancies_id_seq RESTART WITH 1;
-- ALTER SEQUENCE hrms_data.candidate_vacancies_id_seq RESTART WITH 1;
-- ALTER SEQUENCE hrms_data.job_titles_id_seq RESTART WITH 1;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify all data has been deleted:

SELECT 
    'candidates' as table_name, 
    COUNT(*) as remaining_records 
FROM hrms_data.candidates
UNION ALL
SELECT 
    'vacancies' as table_name, 
    COUNT(*) as remaining_records 
FROM hrms_data.vacancies
UNION ALL
SELECT 
    'candidate_vacancies' as table_name, 
    COUNT(*) as remaining_records 
FROM hrms_data.candidate_vacancies;

-- Expected result: All counts should be 0

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. This script deletes ALL candidates, vacancies, and their relationships
-- 2. Job titles are NOT deleted (they're managed in Admin → Job → Job Titles)
-- 3. After running this, you can start creating fresh entries from the UI
-- 4. The tables structure remains intact - only data is removed
-- ============================================================================

