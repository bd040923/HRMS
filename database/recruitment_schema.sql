-- Arithwise HRM Recruitment Module - PostgreSQL Schema
-- Copyright (C) 2024 Arithwise Inc.

-- Job Titles Table
CREATE TABLE IF NOT EXISTS job_titles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vacancies Table
CREATE TABLE IF NOT EXISTS vacancies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    job_title_id INTEGER NOT NULL REFERENCES job_titles(id) ON DELETE RESTRICT,
    hiring_manager_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    description TEXT,
    number_of_positions INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    published_date DATE,
    closing_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_vacancy_name UNIQUE (name)
);

-- Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
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

-- Candidate Vacancy Applications (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS candidate_vacancies (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    vacancy_id INTEGER NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
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
    applied_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_candidate_vacancy UNIQUE (candidate_id, vacancy_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vacancies_job_title ON vacancies(job_title_id);
CREATE INDEX IF NOT EXISTS idx_vacancies_hiring_manager ON vacancies(hiring_manager_id);
CREATE INDEX IF NOT EXISTS idx_vacancies_status ON vacancies(status);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_date_of_application ON candidates(date_of_application);
CREATE INDEX IF NOT EXISTS idx_candidate_vacancies_candidate ON candidate_vacancies(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_vacancies_vacancy ON candidate_vacancies(vacancy_id);
CREATE INDEX IF NOT EXISTS idx_candidate_vacancies_status ON candidate_vacancies(status);

-- Insert sample job titles
INSERT INTO job_titles (title, description, status) VALUES
('Account Assistant', 'Entry-level accounting position', 'active'),
('Chief Executive Officer', 'Top executive position', 'active'),
('Chief Financial Officer', 'Financial leadership role', 'active'),
('Chief Technical Officer', 'Technology leadership role', 'active'),
('Content Specialist', 'Content creation and management', 'active'),
('Payroll Administrator', 'Payroll processing and administration', 'active'),
('Sales Representative', 'Sales and customer relations', 'active'),
('QA Lead', 'Quality assurance leadership', 'active'),
('Support Specialist', 'Customer support role', 'active'),
('Software Engineer', 'Software development role', 'active')
ON CONFLICT (title) DO NOTHING;

-- Insert sample vacancies (assuming employees table exists with at least one record)
-- Note: You may need to adjust hiring_manager_id based on your employees table
INSERT INTO vacancies (name, job_title_id, status, published_date, closing_date)
SELECT 
    'Junior Account Assistant',
    (SELECT id FROM job_titles WHERE title = 'Account Assistant' LIMIT 1),
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM vacancies WHERE name = 'Junior Account Assistant')
UNION ALL
SELECT 
    'Payroll Administrator',
    (SELECT id FROM job_titles WHERE title = 'Payroll Administrator' LIMIT 1),
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM vacancies WHERE name = 'Payroll Administrator')
UNION ALL
SELECT 
    'Sales Representative',
    (SELECT id FROM job_titles WHERE title = 'Sales Representative' LIMIT 1),
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM vacancies WHERE name = 'Sales Representative')
UNION ALL
SELECT 
    'Senior QA Lead',
    (SELECT id FROM job_titles WHERE title = 'QA Lead' LIMIT 1),
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM vacancies WHERE name = 'Senior QA Lead')
UNION ALL
SELECT 
    'Senior Support Specialist',
    (SELECT id FROM job_titles WHERE title = 'Support Specialist' LIMIT 1),
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM vacancies WHERE name = 'Senior Support Specialist')
UNION ALL
SELECT 
    'Software Engineer',
    (SELECT id FROM job_titles WHERE title = 'Software Engineer' LIMIT 1),
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM vacancies WHERE name = 'Software Engineer');

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_job_titles_updated_at BEFORE UPDATE ON job_titles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vacancies_updated_at BEFORE UPDATE ON vacancies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_vacancies_updated_at BEFORE UPDATE ON candidate_vacancies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

