-- Insert sample data into hrms_data schema tables
-- Run this as 'postgres' user in database 'arithwise_hrms'
-- 
-- NOTE: This script will insert sample data. If you want to clear existing data first,
-- uncomment the TRUNCATE statements below.

SET search_path TO hrms_data, public;

-- ============================================================================
-- OPTIONAL: Clear existing data (uncomment if you want fresh data)
-- ============================================================================
-- TRUNCATE TABLE hrms_data.candidate_vacancies CASCADE;
-- TRUNCATE TABLE hrms_data.candidates CASCADE;
-- TRUNCATE TABLE hrms_data.vacancies CASCADE;
-- TRUNCATE TABLE hrms_data.employees CASCADE;
-- TRUNCATE TABLE hrms_data.job_titles CASCADE;

-- ============================================================================
-- STEP 1: INSERT SAMPLE JOB TITLES
-- ============================================================================

INSERT INTO hrms_data.job_titles (title, description, status) VALUES
('Software Engineer', 'Develop and maintain software applications', 'active'),
('Senior Software Engineer', 'Lead software development projects', 'active'),
('Product Manager', 'Manage product development and strategy', 'active'),
('HR Manager', 'Manage human resources and recruitment', 'active'),
('Sales Representative', 'Handle sales and customer relations', 'active'),
('Marketing Specialist', 'Develop and execute marketing campaigns', 'active'),
('Data Analyst', 'Analyze data and generate insights', 'active'),
('Project Manager', 'Manage projects and teams', 'active')
ON CONFLICT (title) DO NOTHING;

-- ============================================================================
-- STEP 2: INSERT SAMPLE EMPLOYEES
-- ============================================================================

INSERT INTO hrms_data.employees (
    employee_id, first_name, middle_name, last_name, email, phone, 
    position, employment_status, sub_unit, supervisor_name, status, hire_date
) VALUES
('EMP001', 'John', 'Michael', 'Doe', 'john.doe@company.com', '+1234567890', 
 'Software Engineer', 'Full-Time Permanent', 'IT', 'Jane Manager', 'active', '2023-01-15'),
('EMP002', 'Jane', NULL, 'Smith', 'jane.smith@company.com', '+1234567891', 
 'HR Manager', 'Full-Time Permanent', 'HR', NULL, 'active', '2022-06-01'),
('EMP003', 'Robert', 'James', 'Johnson', 'robert.j@company.com', '+1234567892', 
 'Product Manager', 'Full-Time Permanent', 'Product', 'Jane Manager', 'active', '2023-03-20'),
('EMP004', 'Emily', NULL, 'Williams', 'emily.w@company.com', '+1234567893', 
 'Sales Representative', 'Full-Time Permanent', 'Sales', 'Robert Johnson', 'active', '2023-05-10'),
('EMP005', 'Michael', 'David', 'Brown', 'michael.b@company.com', '+1234567894', 
 'Senior Software Engineer', 'Full-Time Permanent', 'IT', 'Jane Manager', 'active', '2021-11-05')
ON CONFLICT (employee_id) DO NOTHING;

-- ============================================================================
-- STEP 3: INSERT SAMPLE VACANCIES
-- ============================================================================

-- Vacancy 1: Senior Developer Position
INSERT INTO hrms_data.vacancies (
    name, job_title_id, hiring_manager_id, description, 
    number_of_positions, status, published_date, closing_date
) 
SELECT 
    'Senior Developer Position',
    jt.id,
    e.id,
    'We are looking for an experienced senior developer to join our team.',
    2,
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days'
FROM hrms_data.job_titles jt
CROSS JOIN hrms_data.employees e
WHERE jt.title = 'Senior Software Engineer'
AND e.employee_id = 'EMP001'
LIMIT 1
ON CONFLICT (name) DO NOTHING;

-- Vacancy 2: Product Manager Role
INSERT INTO hrms_data.vacancies (
    name, job_title_id, hiring_manager_id, description, 
    number_of_positions, status, published_date, closing_date
) 
SELECT 
    'Product Manager Role',
    jt.id,
    e.id,
    'Join our product team as a Product Manager.',
    1,
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '45 days'
FROM hrms_data.job_titles jt
CROSS JOIN hrms_data.employees e
WHERE jt.title = 'Product Manager'
AND e.employee_id = 'EMP003'
LIMIT 1
ON CONFLICT (name) DO NOTHING;

-- Vacancy 3: Marketing Specialist Opening
INSERT INTO hrms_data.vacancies (
    name, job_title_id, hiring_manager_id, description, 
    number_of_positions, status, published_date, closing_date
) 
SELECT 
    'Marketing Specialist Opening',
    jt.id,
    NULL,
    'We need a creative marketing specialist.',
    1,
    'active',
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '20 days'
FROM hrms_data.job_titles jt
WHERE jt.title = 'Marketing Specialist'
LIMIT 1
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 4: INSERT SAMPLE CANDIDATES
-- ============================================================================

-- Insert candidates
INSERT INTO hrms_data.candidates (
    first_name, middle_name, last_name, email, contact_number, 
    keywords, date_of_application, status, method_of_application
) VALUES
('Alice', NULL, 'Anderson', 'alice.anderson@email.com', '+1987654321', 
 'Java, Spring, PostgreSQL', CURRENT_DATE - INTERVAL '5 days', 'Application Initiated', 'Online'),
('Bob', 'Charles', 'Taylor', 'bob.taylor@email.com', '+1987654322', 
 'JavaScript, React, Node.js', CURRENT_DATE - INTERVAL '3 days', 'Shortlisted', 'Manual'),
('Carol', NULL, 'Martinez', 'carol.m@email.com', '+1987654323', 
 'Python, Django, SQL', CURRENT_DATE - INTERVAL '1 day', 'Application Initiated', 'Online'),
('David', 'Edward', 'Lee', 'david.lee@email.com', '+1987654324', 
 'Product Management, Agile', CURRENT_DATE, 'Interview Scheduled', 'Manual');

-- ============================================================================
-- STEP 5: LINK CANDIDATES TO VACANCIES
-- ============================================================================

-- Link Alice to Senior Developer Position
INSERT INTO hrms_data.candidate_vacancies (candidate_id, vacancy_id, status)
SELECT c.id, v.id, 'Application Initiated'
FROM hrms_data.candidates c
CROSS JOIN hrms_data.vacancies v
WHERE c.first_name = 'Alice' AND c.last_name = 'Anderson'
AND v.name = 'Senior Developer Position'
ON CONFLICT (candidate_id, vacancy_id) DO NOTHING;

-- Link Bob to Senior Developer Position
INSERT INTO hrms_data.candidate_vacancies (candidate_id, vacancy_id, status)
SELECT c.id, v.id, 'Shortlisted'
FROM hrms_data.candidates c
CROSS JOIN hrms_data.vacancies v
WHERE c.first_name = 'Bob' AND c.last_name = 'Taylor'
AND v.name = 'Senior Developer Position'
ON CONFLICT (candidate_id, vacancy_id) DO NOTHING;

-- Link David to Product Manager Role
INSERT INTO hrms_data.candidate_vacancies (candidate_id, vacancy_id, status)
SELECT c.id, v.id, 'Application Initiated'
FROM hrms_data.candidates c
CROSS JOIN hrms_data.vacancies v
WHERE c.first_name = 'David' AND c.last_name = 'Lee'
AND v.name = 'Product Manager Role'
ON CONFLICT (candidate_id, vacancy_id) DO NOTHING;

-- ============================================================================
-- VERIFY DATA INSERTED
-- ============================================================================

SELECT 'Job Titles:' as info, COUNT(*) as count FROM hrms_data.job_titles
UNION ALL
SELECT 'Employees:', COUNT(*) FROM hrms_data.employees
UNION ALL
SELECT 'Vacancies:', COUNT(*) FROM hrms_data.vacancies
UNION ALL
SELECT 'Candidates:', COUNT(*) FROM hrms_data.candidates
UNION ALL
SELECT 'Candidate-Vacancy Links:', COUNT(*) FROM hrms_data.candidate_vacancies;

