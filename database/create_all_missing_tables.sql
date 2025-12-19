-- ============================================================================
-- CREATE ALL MISSING TABLES FOR FULL FUNCTIONALITY
-- Schema: hrms_data
-- Run this as 'postgres' user in database 'arithwise_hrms'
-- ============================================================================

SET search_path TO hrms_data, public;
CREATE SCHEMA IF NOT EXISTS hrms_data;

-- ============================================================================
-- LEAVE MANAGEMENT TABLES
-- ============================================================================

-- Leave Types
CREATE TABLE IF NOT EXISTS hrms_data.leave_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    entitlement_days DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave Entitlements
CREATE TABLE IF NOT EXISTS hrms_data.leave_entitlements (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    leave_type_id INTEGER NOT NULL,
    entitlement_days DECIMAL(10,2) NOT NULL,
    used_days DECIMAL(10,2) DEFAULT 0,
    remaining_days DECIMAL(10,2) GENERATED ALWAYS AS (entitlement_days - used_days) STORED,
    leave_period_start DATE NOT NULL,
    leave_period_end DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_entitlement_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_entitlement_leave_type FOREIGN KEY (leave_type_id) REFERENCES hrms_data.leave_types(id) ON DELETE CASCADE
);

-- Leave Requests
CREATE TABLE IF NOT EXISTS hrms_data.leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    leave_type_id INTEGER NOT NULL,
    date_applied DATE DEFAULT CURRENT_DATE,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    number_of_days DECIMAL(10,2) NOT NULL,
    comments TEXT,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled')),
    applied_by INTEGER,
    approved_by INTEGER,
    approved_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leave_request_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_leave_request_type FOREIGN KEY (leave_type_id) REFERENCES hrms_data.leave_types(id) ON DELETE RESTRICT,
    CONSTRAINT fk_leave_applied_by FOREIGN KEY (applied_by) REFERENCES hrms_data.employees(id) ON DELETE SET NULL,
    CONSTRAINT fk_leave_approved_by FOREIGN KEY (approved_by) REFERENCES hrms_data.employees(id) ON DELETE SET NULL
);

-- Holidays
CREATE TABLE IF NOT EXISTS hrms_data.holidays (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    full_day BOOLEAN DEFAULT TRUE,
    repeats_annually BOOLEAN DEFAULT FALSE,
    length DECIMAL(10,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave Period
CREATE TABLE IF NOT EXISTS hrms_data.leave_periods (
    id SERIAL PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work Week
CREATE TABLE IF NOT EXISTS hrms_data.work_week (
    id SERIAL PRIMARY KEY,
    monday BOOLEAN DEFAULT TRUE,
    tuesday BOOLEAN DEFAULT TRUE,
    wednesday BOOLEAN DEFAULT TRUE,
    thursday BOOLEAN DEFAULT TRUE,
    friday BOOLEAN DEFAULT TRUE,
    saturday BOOLEAN DEFAULT FALSE,
    sunday BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TIME & ATTENDANCE TABLES
-- ============================================================================

-- Attendance Records
CREATE TABLE IF NOT EXISTS hrms_data.attendance_records (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    punch_in_date DATE NOT NULL,
    punch_in_time TIME NOT NULL,
    punch_in_note TEXT,
    punch_out_date DATE,
    punch_out_time TIME,
    punch_out_note TEXT,
    duration_hours DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'punched_in' CHECK (status IN ('punched_in', 'punched_out')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE
);

-- Timesheets
CREATE TABLE IF NOT EXISTS hrms_data.timesheets (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    project_id INTEGER,
    activity_id INTEGER,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Rejected')),
    submitted_date TIMESTAMP,
    approved_by INTEGER,
    approved_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_timesheet_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_timesheet_project FOREIGN KEY (project_id) REFERENCES hrms_data.projects(id) ON DELETE SET NULL,
    CONSTRAINT fk_timesheet_approved_by FOREIGN KEY (approved_by) REFERENCES hrms_data.employees(id) ON DELETE SET NULL
);

-- Timesheet Items (daily entries)
CREATE TABLE IF NOT EXISTS hrms_data.timesheet_items (
    id SERIAL PRIMARY KEY,
    timesheet_id INTEGER NOT NULL,
    date DATE NOT NULL,
    hours DECIMAL(10,2) NOT NULL DEFAULT 0,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_timesheet_item_timesheet FOREIGN KEY (timesheet_id) REFERENCES hrms_data.timesheets(id) ON DELETE CASCADE
);

-- Projects
CREATE TABLE IF NOT EXISTS hrms_data.projects (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_admin_id INTEGER,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_customer FOREIGN KEY (customer_id) REFERENCES hrms_data.customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_admin FOREIGN KEY (project_admin_id) REFERENCES hrms_data.employees(id) ON DELETE SET NULL
);

-- Customers
CREATE TABLE IF NOT EXISTS hrms_data.customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Activities
CREATE TABLE IF NOT EXISTS hrms_data.project_activities (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_project FOREIGN KEY (project_id) REFERENCES hrms_data.projects(id) ON DELETE CASCADE
);

-- Attendance Configuration
CREATE TABLE IF NOT EXISTS hrms_data.attendance_configuration (
    id SERIAL PRIMARY KEY,
    punch_in_required BOOLEAN DEFAULT TRUE,
    punch_out_required BOOLEAN DEFAULT TRUE,
    allow_punch_in_grace_period INTEGER DEFAULT 0,
    allow_punch_out_grace_period INTEGER DEFAULT 0,
    work_days_per_week INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERFORMANCE MANAGEMENT TABLES
-- ============================================================================

-- KPIs (Key Performance Indicators)
CREATE TABLE IF NOT EXISTS hrms_data.kpis (
    id SERIAL PRIMARY KEY,
    indicator VARCHAR(500) NOT NULL,
    job_title_id INTEGER,
    min_rate DECIMAL(10,2) DEFAULT 0,
    max_rate DECIMAL(10,2) DEFAULT 100,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_kpi_job_title FOREIGN KEY (job_title_id) REFERENCES hrms_data.job_titles(id) ON DELETE SET NULL
);

-- Performance Trackers
CREATE TABLE IF NOT EXISTS hrms_data.performance_trackers (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    tracker_name VARCHAR(255) NOT NULL,
    added_date DATE DEFAULT CURRENT_DATE,
    modified_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tracker_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE
);

-- Performance Reviews
CREATE TABLE IF NOT EXISTS hrms_data.performance_reviews (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    job_title_id INTEGER,
    sub_unit VARCHAR(255),
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    due_date DATE NOT NULL,
    reviewer_id INTEGER,
    self_evaluation_status VARCHAR(50) DEFAULT 'Not Started' CHECK (self_evaluation_status IN ('Not Started', 'Activated', 'Completed')),
    review_status VARCHAR(50) DEFAULT 'Inactive' CHECK (review_status IN ('Inactive', 'Active', 'Completed', 'Cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_job_title FOREIGN KEY (job_title_id) REFERENCES hrms_data.job_titles(id) ON DELETE SET NULL,
    CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES hrms_data.employees(id) ON DELETE SET NULL
);

-- ============================================================================
-- EMPLOYEE PERSONAL INFO TABLES (My Info)
-- ============================================================================

-- Employee Personal Details
CREATE TABLE IF NOT EXISTS hrms_data.employee_personal_details (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL UNIQUE,
    other_id VARCHAR(100),
    driver_license_number VARCHAR(100),
    license_expiry_date DATE,
    nationality_id INTEGER,
    marital_status VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_type VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_personal_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE
);

-- Employee Contact Details
CREATE TABLE IF NOT EXISTS hrms_data.employee_contact_details (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL UNIQUE,
    street1 VARCHAR(255),
    street2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    zip_postal_code VARCHAR(20),
    country VARCHAR(100),
    home_telephone VARCHAR(20),
    mobile VARCHAR(20),
    work_telephone VARCHAR(20),
    work_email VARCHAR(255),
    other_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contact_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE
);

-- Emergency Contacts
CREATE TABLE IF NOT EXISTS hrms_data.emergency_contacts (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    home_telephone VARCHAR(20),
    mobile VARCHAR(20),
    work_telephone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_emergency_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE
);

-- Dependents
CREATE TABLE IF NOT EXISTS hrms_data.dependents (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dependent_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE
);

-- Immigration Records
CREATE TABLE IF NOT EXISTS hrms_data.immigration_records (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_number VARCHAR(255) NOT NULL,
    issued_by VARCHAR(255),
    issued_date DATE,
    expiry_date DATE,
    eligible_status VARCHAR(50),
    eligible_review_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_immigration_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE
);

-- Employee Job Details
CREATE TABLE IF NOT EXISTS hrms_data.employee_job_details (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL UNIQUE,
    joined_date DATE,
    job_title_id INTEGER,
    job_category_id INTEGER,
    employment_status_id INTEGER,
    sub_unit_id INTEGER,
    location_id INTEGER,
    include_employment_contract BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_details_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_job_details_title FOREIGN KEY (job_title_id) REFERENCES hrms_data.job_titles(id) ON DELETE SET NULL
);

-- Salary Components
CREATE TABLE IF NOT EXISTS hrms_data.salary_components (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    component_name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    pay_frequency VARCHAR(50),
    direct_deposit_amount DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_salary_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE
);

-- Report-to (Supervisors/Subordinates)
CREATE TABLE IF NOT EXISTS hrms_data.employee_reporting (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    supervisor_id INTEGER,
    subordinate_id INTEGER,
    reporting_method VARCHAR(50) DEFAULT 'Direct' CHECK (reporting_method IN ('Direct', 'Indirect')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reporting_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_reporting_supervisor FOREIGN KEY (supervisor_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_reporting_subordinate FOREIGN KEY (subordinate_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE,
    CHECK ((supervisor_id IS NOT NULL AND subordinate_id IS NULL) OR (supervisor_id IS NULL AND subordinate_id IS NOT NULL))
);

-- Qualifications
CREATE TABLE IF NOT EXISTS hrms_data.employee_qualifications (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    qualification_type VARCHAR(50) NOT NULL CHECK (qualification_type IN ('Work Experience', 'Education', 'Skills', 'Languages', 'License')),
    -- Work Experience fields
    company VARCHAR(255),
    job_title VARCHAR(255),
    from_date DATE,
    to_date DATE,
    comment TEXT,
    -- Education fields
    level VARCHAR(255),
    year INTEGER,
    gpa_score VARCHAR(50),
    -- Skills fields
    skill_name VARCHAR(255),
    years_of_experience INTEGER,
    -- Languages fields
    language VARCHAR(100),
    fluency VARCHAR(50),
    competency VARCHAR(50),
    -- License fields
    license_type VARCHAR(255),
    license_number VARCHAR(255),
    issued_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_qualification_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE
);

-- Memberships
CREATE TABLE IF NOT EXISTS hrms_data.employee_memberships (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    membership VARCHAR(255) NOT NULL,
    subscription_paid_by VARCHAR(100),
    subscription_amount DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'USD',
    subscription_commence_date DATE,
    subscription_renewal_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_membership_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE
);

-- Attachments (for all employee-related documents)
CREATE TABLE IF NOT EXISTS hrms_data.employee_attachments (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    attachment_type VARCHAR(50) NOT NULL CHECK (attachment_type IN ('Personal', 'Contact', 'Emergency', 'Dependent', 'Immigration', 'Job', 'Salary', 'ReportTo', 'Qualification', 'Membership')),
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    description TEXT,
    added_by INTEGER,
    added_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attachment_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_attachment_added_by FOREIGN KEY (added_by) REFERENCES hrms_data.employees(id) ON DELETE SET NULL
);

-- ============================================================================
-- ADMIN CONFIGURATION TABLES
-- ============================================================================

-- Locations
CREATE TABLE IF NOT EXISTS hrms_data.locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    country VARCHAR(100),
    province VARCHAR(100),
    city VARCHAR(100),
    address VARCHAR(500),
    zip_code VARCHAR(20),
    phone VARCHAR(20),
    fax VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pay Grades
CREATE TABLE IF NOT EXISTS hrms_data.pay_grades (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    currency VARCHAR(10) DEFAULT 'USD',
    min_salary DECIMAL(15,2),
    max_salary DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employment Status
CREATE TABLE IF NOT EXISTS hrms_data.employment_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Categories
CREATE TABLE IF NOT EXISTS hrms_data.job_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work Shifts
CREATE TABLE IF NOT EXISTS hrms_data.work_shifts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    hours_per_day DECIMAL(5,2),
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nationalities
CREATE TABLE IF NOT EXISTS hrms_data.nationalities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- REPORTS TABLES
-- ============================================================================

-- PIM Reports
CREATE TABLE IF NOT EXISTS hrms_data.pim_reports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    criteria TEXT,
    created_by INTEGER,
    created_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pim_report_created_by FOREIGN KEY (created_by) REFERENCES hrms_data.employees(id) ON DELETE SET NULL
);

-- Employee Reports
CREATE TABLE IF NOT EXISTS hrms_data.employee_reports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    criteria TEXT,
    created_by INTEGER,
    created_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_report_created_by FOREIGN KEY (created_by) REFERENCES hrms_data.employees(id) ON DELETE SET NULL
);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hrms_data TO bhushan;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA hrms_data TO bhushan;
GRANT USAGE ON SCHEMA hrms_data TO bhushan;

