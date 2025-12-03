-- ============================================================================
-- CREATE ALL TABLES FOR arithwsie_hrms DATABASE
-- Schema: hrms_data
-- Run these queries in PostgreSQL in the order shown below
-- ============================================================================

-- Step 1: Create Schema
CREATE SCHEMA IF NOT EXISTS hrms_data;
SET search_path TO hrms_data, public;

-- ============================================================================
-- Step 2: Create Core Tables (in dependency order)
-- ============================================================================

-- Table 1: users (no dependencies)
CREATE TABLE hrms_data.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Table 2: password_reset_tokens (depends on users)
CREATE TABLE hrms_data.password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES hrms_data.users(id) ON DELETE CASCADE
);

-- Table 3: user_sessions (depends on users)
CREATE TABLE hrms_data.user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES hrms_data.users(id) ON DELETE CASCADE
);

-- Table 4: permissions (no dependencies)
CREATE TABLE hrms_data.permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    module VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 5: role_permissions (depends on permissions)
CREATE TABLE hrms_data.role_permissions (
    id SERIAL PRIMARY KEY,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user', 'manager')),
    permission_id INTEGER NOT NULL,
    CONSTRAINT fk_role_permission FOREIGN KEY (permission_id) REFERENCES hrms_data.permissions(id) ON DELETE CASCADE,
    CONSTRAINT unique_role_permission UNIQUE (role, permission_id)
);

-- Table 6: departments (created before employees, but manager_id FK added later)
CREATE TABLE hrms_data.departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    manager_id INTEGER,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 7: employees (depends on users and departments)
CREATE TABLE hrms_data.employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    department_id INTEGER,
    position VARCHAR(100),
    employment_status VARCHAR(50),
    sub_unit VARCHAR(100),
    supervisor_name VARCHAR(255),
    hire_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES hrms_data.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_employee_department FOREIGN KEY (department_id) REFERENCES hrms_data.departments(id) ON DELETE SET NULL
);

-- Add foreign key for departments.manager_id (after employees table exists)
ALTER TABLE hrms_data.departments 
ADD CONSTRAINT fk_department_manager 
FOREIGN KEY (manager_id) REFERENCES hrms_data.employees(id) ON DELETE SET NULL;

-- ============================================================================
-- Step 3: Create Recruitment Module Tables
-- ============================================================================

-- Table 8: job_titles (no dependencies)
CREATE TABLE hrms_data.job_titles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 9: vacancies (depends on job_titles and employees)
CREATE TABLE hrms_data.vacancies (
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

-- Table 10: candidates (no dependencies)
CREATE TABLE hrms_data.candidates (
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

-- Table 11: candidate_vacancies (depends on candidates and vacancies)
CREATE TABLE hrms_data.candidate_vacancies (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL,
    vacancy_id INTEGER NOT NULL,
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
    CONSTRAINT unique_candidate_vacancy UNIQUE (candidate_id, vacancy_id),
    CONSTRAINT fk_candidate_vacancy_candidate FOREIGN KEY (candidate_id) REFERENCES hrms_data.candidates(id) ON DELETE CASCADE,
    CONSTRAINT fk_candidate_vacancy_vacancy FOREIGN KEY (vacancy_id) REFERENCES hrms_data.vacancies(id) ON DELETE CASCADE
);

-- ============================================================================
-- Step 4: Create Indexes
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON hrms_data.users(email);
CREATE INDEX idx_users_username ON hrms_data.users(username);
CREATE INDEX idx_users_role ON hrms_data.users(role);

-- Password reset tokens indexes
CREATE INDEX idx_password_reset_token ON hrms_data.password_reset_tokens(token);
CREATE INDEX idx_password_reset_user_id ON hrms_data.password_reset_tokens(user_id);

-- User sessions indexes
CREATE INDEX idx_session_token ON hrms_data.user_sessions(session_token);
CREATE INDEX idx_session_user_id ON hrms_data.user_sessions(user_id);
CREATE INDEX idx_session_expires_at ON hrms_data.user_sessions(expires_at);

-- Permissions indexes
CREATE INDEX idx_permissions_module ON hrms_data.permissions(module);

-- Role permissions indexes
CREATE INDEX idx_role_permissions_role ON hrms_data.role_permissions(role);

-- Employees indexes
CREATE INDEX idx_employees_employee_id ON hrms_data.employees(employee_id);
CREATE INDEX idx_employees_department_id ON hrms_data.employees(department_id);
CREATE INDEX idx_employees_status ON hrms_data.employees(status);

-- Departments indexes
CREATE INDEX idx_departments_code ON hrms_data.departments(code);
CREATE INDEX idx_departments_status ON hrms_data.departments(status);

-- Recruitment module indexes
CREATE INDEX idx_vacancies_job_title ON hrms_data.vacancies(job_title_id);
CREATE INDEX idx_vacancies_hiring_manager ON hrms_data.vacancies(hiring_manager_id);
CREATE INDEX idx_vacancies_status ON hrms_data.vacancies(status);
CREATE INDEX idx_candidates_email ON hrms_data.candidates(email);
CREATE INDEX idx_candidates_status ON hrms_data.candidates(status);
CREATE INDEX idx_candidates_date_of_application ON hrms_data.candidates(date_of_application);
CREATE INDEX idx_candidate_vacancies_candidate ON hrms_data.candidate_vacancies(candidate_id);
CREATE INDEX idx_candidate_vacancies_vacancy ON hrms_data.candidate_vacancies(vacancy_id);
CREATE INDEX idx_candidate_vacancies_status ON hrms_data.candidate_vacancies(status);

-- ============================================================================
-- Step 5: Create Functions and Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION hrms_data.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON hrms_data.users
    FOR EACH ROW EXECUTE FUNCTION hrms_data.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at 
    BEFORE UPDATE ON hrms_data.departments
    FOR EACH ROW EXECUTE FUNCTION hrms_data.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON hrms_data.employees
    FOR EACH ROW EXECUTE FUNCTION hrms_data.update_updated_at_column();

CREATE TRIGGER update_job_titles_updated_at 
    BEFORE UPDATE ON hrms_data.job_titles
    FOR EACH ROW EXECUTE FUNCTION hrms_data.update_updated_at_column();

CREATE TRIGGER update_vacancies_updated_at 
    BEFORE UPDATE ON hrms_data.vacancies
    FOR EACH ROW EXECUTE FUNCTION hrms_data.update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at 
    BEFORE UPDATE ON hrms_data.candidates
    FOR EACH ROW EXECUTE FUNCTION hrms_data.update_updated_at_column();

CREATE TRIGGER update_candidate_vacancies_updated_at 
    BEFORE UPDATE ON hrms_data.candidate_vacancies
    FOR EACH ROW EXECUTE FUNCTION hrms_data.update_updated_at_column();

-- ============================================================================
-- VERIFICATION: Check all tables were created
-- ============================================================================

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'hrms_data' 
ORDER BY table_name;

