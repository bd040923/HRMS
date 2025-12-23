-- ============================================================================
-- FIX TIMESHEET TABLES - Migration Script
-- ============================================================================
-- This script drops old timesheet tables (if they exist) and creates new ones
-- Run this in PostgreSQL if you're getting "column project_id does not exist" error
-- ============================================================================

SET search_path TO hrms_data, public;

-- Drop old tables if they exist (in case they have wrong schema)
DROP TABLE IF EXISTS hrms_data.timesheet_entries CASCADE;
DROP TABLE IF EXISTS hrms_data.timesheets CASCADE;
DROP TABLE IF EXISTS hrms_data.activities CASCADE;
DROP TABLE IF EXISTS hrms_data.projects CASCADE;

-- Also drop from public schema if they exist there
DROP TABLE IF EXISTS public.timesheet_entries CASCADE;
DROP TABLE IF EXISTS public.timesheets CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;

-- ============================================================================
-- 1. PROJECTS TABLE
-- ============================================================================
CREATE TABLE hrms_data.projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    customer_id INTEGER,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    project_admin_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_admin_id) REFERENCES hrms_data.employees(id) ON DELETE SET NULL
);

-- ============================================================================
-- 2. ACTIVITIES TABLE
-- ============================================================================
CREATE TABLE hrms_data.activities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    project_id INTEGER,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES hrms_data.projects(id) ON DELETE CASCADE
);

-- ============================================================================
-- 3. TIMESHEETS TABLE (NO project_id column - project_id is in entries)
-- ============================================================================
CREATE TABLE hrms_data.timesheets (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    submitted_at TIMESTAMP,
    submitted_to INTEGER, -- reporting manager employee_id
    approved_by INTEGER,
    approved_at TIMESTAMP,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_to) REFERENCES hrms_data.employees(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES hrms_data.employees(id) ON DELETE SET NULL,
    UNIQUE(employee_id, start_date, end_date)
);

-- ============================================================================
-- 4. TIMESHEET ENTRIES TABLE (project_id is HERE, not in timesheets)
-- ============================================================================
CREATE TABLE hrms_data.timesheet_entries (
    id SERIAL PRIMARY KEY,
    timesheet_id INTEGER NOT NULL,
    project_id INTEGER,
    activity_id INTEGER,
    entry_date DATE NOT NULL,
    hours DECIMAL(4,2) DEFAULT 0.00 CHECK (hours >= 0 AND hours <= 24),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (timesheet_id) REFERENCES hrms_data.timesheets(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES hrms_data.projects(id) ON DELETE SET NULL,
    FOREIGN KEY (activity_id) REFERENCES hrms_data.activities(id) ON DELETE SET NULL,
    UNIQUE(timesheet_id, project_id, activity_id, entry_date)
);

-- Create indexes for better performance
CREATE INDEX idx_timesheets_employee_id ON hrms_data.timesheets(employee_id);
CREATE INDEX idx_timesheets_status ON hrms_data.timesheets(status);
CREATE INDEX idx_timesheets_dates ON hrms_data.timesheets(start_date, end_date);
CREATE INDEX idx_timesheet_entries_timesheet_id ON hrms_data.timesheet_entries(timesheet_id);
CREATE INDEX idx_timesheet_entries_date ON hrms_data.timesheet_entries(entry_date);
CREATE INDEX idx_projects_status ON hrms_data.projects(status);
CREATE INDEX idx_activities_project_id ON hrms_data.activities(project_id);

-- Create triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION hrms_data.update_timesheets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER timesheets_updated_at
    BEFORE UPDATE ON hrms_data.timesheets
    FOR EACH ROW
    EXECUTE FUNCTION hrms_data.update_timesheets_updated_at();

CREATE OR REPLACE FUNCTION hrms_data.update_timesheet_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER timesheet_entries_updated_at
    BEFORE UPDATE ON hrms_data.timesheet_entries
    FOR EACH ROW
    EXECUTE FUNCTION hrms_data.update_timesheet_entries_updated_at();

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE hrms_data.projects TO PUBLIC;
GRANT ALL PRIVILEGES ON TABLE hrms_data.activities TO PUBLIC;
GRANT ALL PRIVILEGES ON TABLE hrms_data.timesheets TO PUBLIC;
GRANT ALL PRIVILEGES ON TABLE hrms_data.timesheet_entries TO PUBLIC;

GRANT USAGE, SELECT ON SEQUENCE hrms_data.projects_id_seq TO PUBLIC;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.activities_id_seq TO PUBLIC;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.timesheets_id_seq TO PUBLIC;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.timesheet_entries_id_seq TO PUBLIC;

-- Verify tables were created
SELECT 
    'Tables created successfully' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'hrms_data' AND table_name IN ('projects', 'activities', 'timesheets', 'timesheet_entries')) as table_count;

