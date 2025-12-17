-- ============================================================================
-- QUICK DATA CHECK - Run this first to see what data you have
-- ============================================================================

SET search_path TO hrms_data, public;

-- Quick overview
SELECT 
    'job_titles' as table_name, COUNT(*) as records FROM hrms_data.job_titles
UNION ALL SELECT 'employees', COUNT(*) FROM hrms_data.employees
UNION ALL SELECT 'vacancies', COUNT(*) FROM hrms_data.vacancies
UNION ALL SELECT 'candidates', COUNT(*) FROM hrms_data.candidates
UNION ALL SELECT 'candidate_vacancies', COUNT(*) FROM hrms_data.candidate_vacancies;

-- Sample data from each table
SELECT '=== JOB TITLES ===' as info;
SELECT id, title, status FROM hrms_data.job_titles LIMIT 5;

SELECT '=== EMPLOYEES ===' as info;
SELECT id, employee_id, first_name, last_name, email FROM hrms_data.employees LIMIT 5;

SELECT '=== VACANCIES ===' as info;
SELECT id, name, status FROM hrms_data.vacancies LIMIT 5;

SELECT '=== CANDIDATES ===' as info;
SELECT id, first_name, last_name, email, status FROM hrms_data.candidates LIMIT 5;

