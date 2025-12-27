-- ============================================================================
-- RECRUITMENT/ONBOARDING MODULE - COMPLETE TABLE SETUP
-- ============================================================================
-- This script creates all necessary tables for the Recruitment/Onboarding module
-- Run this in PostgreSQL to ensure all tables exist with proper structure
-- ============================================================================

SET search_path TO hrms_data, public;

-- ============================================================================
-- 1. JOB TITLES TABLE (Required for Vacancies)
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.job_titles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on job_titles
CREATE INDEX IF NOT EXISTS idx_job_titles_status ON hrms_data.job_titles(status);
CREATE INDEX IF NOT EXISTS idx_job_titles_title ON hrms_data.job_titles(title);

-- ============================================================================
-- 2. VACANCIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.vacancies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    job_title_id INTEGER NOT NULL,
    hiring_manager_id INTEGER,
    description TEXT,
    number_of_positions INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    published_date DATE,
    closing_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_vacancy_name UNIQUE (name),
    CONSTRAINT fk_vacancy_job_title FOREIGN KEY (job_title_id) REFERENCES hrms_data.job_titles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_vacancy_hiring_manager FOREIGN KEY (hiring_manager_id) REFERENCES hrms_data.employees(id) ON DELETE SET NULL
);

-- Create indexes for vacancies
CREATE INDEX IF NOT EXISTS idx_vacancies_job_title ON hrms_data.vacancies(job_title_id);
CREATE INDEX IF NOT EXISTS idx_vacancies_hiring_manager ON hrms_data.vacancies(hiring_manager_id);
CREATE INDEX IF NOT EXISTS idx_vacancies_status ON hrms_data.vacancies(status);
CREATE INDEX IF NOT EXISTS idx_vacancies_name ON hrms_data.vacancies(name);

-- ============================================================================
-- 3. CANDIDATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.candidates (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    contact_number VARCHAR(20),
    keywords TEXT,
    comment TEXT,
    date_of_application DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Application Initiated' CHECK (status IN (
        'Application Initiated',
        'Shortlisted',
        'Interview Scheduled',
        'Interview Passed',
        'Interview Failed',
        'Job Offered',
        'Offer Declined',
        'Rejected',
        'Hired',
        'Withdrawn'
    )),
    method_of_application VARCHAR(20) DEFAULT 'Manual' CHECK (method_of_application IN ('Manual', 'Online')),
    resume_file_path VARCHAR(500),
    consent_to_keep_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for candidates
CREATE INDEX IF NOT EXISTS idx_candidates_status ON hrms_data.candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_date ON hrms_data.candidates(date_of_application);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON hrms_data.candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_name ON hrms_data.candidates(first_name, last_name);

-- ============================================================================
-- 4. CANDIDATE_VACANCIES TABLE (Many-to-Many relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.candidate_vacancies (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL,
    vacancy_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'Application Initiated',
    applied_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_candidate_vacancy UNIQUE (candidate_id, vacancy_id),
    CONSTRAINT fk_cv_candidate FOREIGN KEY (candidate_id) REFERENCES hrms_data.candidates(id) ON DELETE CASCADE,
    CONSTRAINT fk_cv_vacancy FOREIGN KEY (vacancy_id) REFERENCES hrms_data.vacancies(id) ON DELETE CASCADE
);

-- Create indexes for candidate_vacancies
CREATE INDEX IF NOT EXISTS idx_candidate_vacancies_candidate ON hrms_data.candidate_vacancies(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_vacancies_vacancy ON hrms_data.candidate_vacancies(vacancy_id);
CREATE INDEX IF NOT EXISTS idx_candidate_vacancies_status ON hrms_data.candidate_vacancies(status);

-- ============================================================================
-- 5. ENSURE EMPLOYEES TABLE EXISTS (Required for hiring_manager_id)
-- ============================================================================
-- Note: This assumes employees table already exists. If not, create it separately.
-- The employees table should have at least: id, first_name, last_name

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hrms_data TO bhushan;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA hrms_data TO bhushan;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify tables were created successfully:

-- Check if tables exist
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'hrms_data' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'hrms_data' 
  AND table_name IN ('job_titles', 'vacancies', 'candidates', 'candidate_vacancies')
ORDER BY table_name;

-- Check record counts (should be 0 if tables are empty)
SELECT 
    'job_titles' as table_name, COUNT(*) as record_count FROM hrms_data.job_titles
UNION ALL
SELECT 
    'vacancies' as table_name, COUNT(*) as record_count FROM hrms_data.vacancies
UNION ALL
SELECT 
    'candidates' as table_name, COUNT(*) as record_count FROM hrms_data.candidates
UNION ALL
SELECT 
    'candidate_vacancies' as table_name, COUNT(*) as record_count FROM hrms_data.candidate_vacancies;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. All tables are created in the hrms_data schema
-- 2. Foreign key constraints ensure data integrity
-- 3. Indexes are created for better query performance
-- 4. The script is idempotent - safe to run multiple times
-- 5. If you need sample data, insert records manually through the UI or API
-- ============================================================================

