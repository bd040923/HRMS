-- Onboarding/Recruitment Module Tables
-- Run this in PostgreSQL to create the necessary tables in hrms_data schema

-- Ensure we're using the correct schema
SET search_path TO hrms_data, public;

-- Vacancies Table
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

-- Candidates Table
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

-- Candidate Vacancies (Many-to-Many relationship)
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vacancies_job_title ON hrms_data.vacancies(job_title_id);
CREATE INDEX IF NOT EXISTS idx_vacancies_hiring_manager ON hrms_data.vacancies(hiring_manager_id);
CREATE INDEX IF NOT EXISTS idx_vacancies_status ON hrms_data.vacancies(status);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON hrms_data.candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_date ON hrms_data.candidates(date_of_application);
CREATE INDEX IF NOT EXISTS idx_candidate_vacancies_candidate ON hrms_data.candidate_vacancies(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_vacancies_vacancy ON hrms_data.candidate_vacancies(vacancy_id);

-- Grant permissions (adjust username as needed)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hrms_data TO bhushan;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA hrms_data TO bhushan;



