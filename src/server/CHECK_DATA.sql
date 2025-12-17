-- ============================================================================
-- QUERIES TO CHECK DATA IN POSTGRESQL
-- Run these in pgAdmin, DBeaver, or psql
-- Database: arithwise_hrms
-- Schema: hrms_data
-- ============================================================================

-- Set search path
SET search_path TO hrms_data, public;

-- ============================================================================
-- 1. CHECK ALL TABLES IN SCHEMA
-- ============================================================================

SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'hrms_data' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'hrms_data'
ORDER BY table_name;

-- ============================================================================
-- 2. COUNT RECORDS IN EACH TABLE
-- ============================================================================

SELECT 'job_titles' as table_name, COUNT(*) as record_count FROM hrms_data.job_titles
UNION ALL
SELECT 'employees', COUNT(*) FROM hrms_data.employees
UNION ALL
SELECT 'vacancies', COUNT(*) FROM hrms_data.vacancies
UNION ALL
SELECT 'candidates', COUNT(*) FROM hrms_data.candidates
UNION ALL
SELECT 'candidate_vacancies', COUNT(*) FROM hrms_data.candidate_vacancies
ORDER BY table_name;

-- ============================================================================
-- 3. VIEW ALL JOB TITLES
-- ============================================================================

SELECT 
    id,
    title,
    description,
    status,
    created_at
FROM hrms_data.job_titles
ORDER BY title;

-- ============================================================================
-- 4. VIEW ALL EMPLOYEES
-- ============================================================================

SELECT 
    id,
    employee_id,
    first_name,
    COALESCE(middle_name, '') as middle_name,
    last_name,
    email,
    phone,
    position,
    employment_status,
    sub_unit,
    supervisor_name,
    status,
    hire_date
FROM hrms_data.employees
ORDER BY employee_id;

-- ============================================================================
-- 5. VIEW ALL VACANCIES WITH DETAILS
-- ============================================================================

SELECT 
    v.id,
    v.name as vacancy_name,
    jt.title as job_title,
    v.number_of_positions,
    v.status,
    v.published_date,
    v.closing_date,
    COALESCE(e.first_name || ' ' || e.last_name, 'Not Assigned') as hiring_manager,
    v.description
FROM hrms_data.vacancies v
LEFT JOIN hrms_data.job_titles jt ON v.job_title_id = jt.id
LEFT JOIN hrms_data.employees e ON v.hiring_manager_id = e.id
ORDER BY v.created_at DESC;

-- ============================================================================
-- 6. VIEW ALL CANDIDATES
-- ============================================================================

SELECT 
    id,
    first_name,
    COALESCE(middle_name, '') as middle_name,
    last_name,
    email,
    contact_number,
    keywords,
    date_of_application,
    status,
    method_of_application,
    created_at
FROM hrms_data.candidates
ORDER BY date_of_application DESC;

-- ============================================================================
-- 7. VIEW CANDIDATE-VACANCY LINKS
-- ============================================================================

SELECT 
    cv.candidate_id,
    c.first_name || ' ' || c.last_name as candidate_name,
    cv.vacancy_id,
    v.name as vacancy_name,
    cv.status as application_status,
    cv.created_at
FROM hrms_data.candidate_vacancies cv
LEFT JOIN hrms_data.candidates c ON cv.candidate_id = c.id
LEFT JOIN hrms_data.vacancies v ON cv.vacancy_id = v.id
ORDER BY cv.created_at DESC;

-- ============================================================================
-- 8. DETAILED CANDIDATE VIEW WITH APPLIED VACANCIES
-- ============================================================================

SELECT 
    c.id,
    c.first_name || ' ' || COALESCE(c.middle_name || ' ', '') || c.last_name as full_name,
    c.email,
    c.contact_number,
    c.status as candidate_status,
    c.date_of_application,
    STRING_AGG(v.name, ', ') as applied_vacancies,
    COUNT(cv.vacancy_id) as total_applications
FROM hrms_data.candidates c
LEFT JOIN hrms_data.candidate_vacancies cv ON c.id = cv.candidate_id
LEFT JOIN hrms_data.vacancies v ON cv.vacancy_id = v.id
GROUP BY c.id, c.first_name, c.middle_name, c.last_name, c.email, c.contact_number, c.status, c.date_of_application
ORDER BY c.date_of_application DESC;

-- ============================================================================
-- 9. VACANCIES WITH APPLICATION COUNTS
-- ============================================================================

SELECT 
    v.id,
    v.name as vacancy_name,
    jt.title as job_title,
    v.number_of_positions,
    COUNT(cv.candidate_id) as total_applications,
    COUNT(CASE WHEN cv.status = 'Shortlisted' THEN 1 END) as shortlisted_count,
    v.status as vacancy_status,
    v.closing_date
FROM hrms_data.vacancies v
LEFT JOIN hrms_data.job_titles jt ON v.job_title_id = jt.id
LEFT JOIN hrms_data.candidate_vacancies cv ON v.id = cv.vacancy_id
GROUP BY v.id, v.name, jt.title, v.number_of_positions, v.status, v.closing_date
ORDER BY v.created_at DESC;

-- ============================================================================
-- 10. EMPLOYEES BY DEPARTMENT/SUB_UNIT
-- ============================================================================

SELECT 
    COALESCE(sub_unit, 'Not Assigned') as department,
    COUNT(*) as employee_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM hrms_data.employees
GROUP BY sub_unit
ORDER BY employee_count DESC;

-- ============================================================================
-- 11. RECENT ACTIVITY (Last 10 records from each table)
-- ============================================================================

-- Recent job titles
SELECT 'job_titles' as source, id::text, title as name, created_at 
FROM hrms_data.job_titles 
ORDER BY created_at DESC LIMIT 10

UNION ALL

-- Recent employees
SELECT 'employees', id::text, first_name || ' ' || last_name, created_at 
FROM hrms_data.employees 
ORDER BY created_at DESC LIMIT 10

UNION ALL

-- Recent vacancies
SELECT 'vacancies', id::text, name, created_at 
FROM hrms_data.vacancies 
ORDER BY created_at DESC LIMIT 10

UNION ALL

-- Recent candidates
SELECT 'candidates', id::text, first_name || ' ' || last_name, created_at 
FROM hrms_data.candidates 
ORDER BY created_at DESC LIMIT 10

ORDER BY created_at DESC;

-- ============================================================================
-- 12. CHECK FOR DATA INTEGRITY
-- ============================================================================

-- Vacancies without valid job titles
SELECT v.id, v.name, v.job_title_id
FROM hrms_data.vacancies v
LEFT JOIN hrms_data.job_titles jt ON v.job_title_id = jt.id
WHERE jt.id IS NULL;

-- Vacancies with invalid hiring managers
SELECT v.id, v.name, v.hiring_manager_id
FROM hrms_data.vacancies v
LEFT JOIN hrms_data.employees e ON v.hiring_manager_id = e.id
WHERE v.hiring_manager_id IS NOT NULL AND e.id IS NULL;

-- Candidate-vacancy links with invalid references
SELECT cv.candidate_id, cv.vacancy_id
FROM hrms_data.candidate_vacancies cv
LEFT JOIN hrms_data.candidates c ON cv.candidate_id = c.id
LEFT JOIN hrms_data.vacancies v ON cv.vacancy_id = v.id
WHERE c.id IS NULL OR v.id IS NULL;

-- ============================================================================
-- 13. SUMMARY STATISTICS
-- ============================================================================

SELECT 
    'Total Job Titles' as metric,
    COUNT(*)::text as value
FROM hrms_data.job_titles
WHERE status = 'active'

UNION ALL

SELECT 
    'Total Employees',
    COUNT(*)::text
FROM hrms_data.employees
WHERE status = 'active'

UNION ALL

SELECT 
    'Active Vacancies',
    COUNT(*)::text
FROM hrms_data.vacancies
WHERE status = 'active'

UNION ALL

SELECT 
    'Total Candidates',
    COUNT(*)::text
FROM hrms_data.candidates

UNION ALL

SELECT 
    'Total Applications',
    COUNT(*)::text
FROM hrms_data.candidate_vacancies

UNION ALL

SELECT 
    'Vacancies Closing Soon',
    COUNT(*)::text
FROM hrms_data.vacancies
WHERE closing_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
AND status = 'active';

-- ============================================================================
-- 14. QUICK DATA CHECK (Run this first to see if data exists)
-- ============================================================================

SELECT 
    'job_titles' as table_name, 
    COUNT(*) as count,
    MAX(created_at) as last_record
FROM hrms_data.job_titles

UNION ALL

SELECT 
    'employees', 
    COUNT(*),
    MAX(created_at)
FROM hrms_data.employees

UNION ALL

SELECT 
    'vacancies', 
    COUNT(*),
    MAX(created_at)
FROM hrms_data.vacancies

UNION ALL

SELECT 
    'candidates', 
    COUNT(*),
    MAX(created_at)
FROM hrms_data.candidates

UNION ALL

SELECT 
    'candidate_vacancies', 
    COUNT(*),
    MAX(created_at)
FROM hrms_data.candidate_vacancies;

