-- Check if tables exist in hrms_data schema
-- Run this in psql: psql -U bhushan -d arithwise_hrms -f check-database.sql

SET search_path TO hrms_data, public;

-- Check if schema exists
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'hrms_data';

-- List all tables in hrms_data schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'hrms_data'
ORDER BY table_name;

-- Check row counts for each table
SELECT 
    'job_titles' as table_name,
    (SELECT COUNT(*) FROM hrms_data.job_titles) as row_count
UNION ALL
SELECT 
    'vacancies',
    (SELECT COUNT(*) FROM hrms_data.vacancies)
UNION ALL
SELECT 
    'candidates',
    (SELECT COUNT(*) FROM hrms_data.candidates)
UNION ALL
SELECT 
    'employees',
    (SELECT COUNT(*) FROM hrms_data.employees)
UNION ALL
SELECT 
    'candidate_vacancies',
    (SELECT COUNT(*) FROM hrms_data.candidate_vacancies);

