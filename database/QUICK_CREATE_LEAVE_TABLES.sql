-- ============================================================================
-- QUICK CREATE LEAVE MANAGEMENT TABLES
-- ============================================================================
-- Simplified version - just creates the essential tables
-- Run this in pgAdmin or psql
-- ============================================================================

-- Leave Types
CREATE TABLE IF NOT EXISTS hrms_data.leave_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    entitlement_days INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Holidays
CREATE TABLE IF NOT EXISTS hrms_data.holidays (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    full_day BOOLEAN DEFAULT true,
    repeats_annually BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave Requests
CREATE TABLE IF NOT EXISTS hrms_data.leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    leave_type_id INTEGER NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    number_of_days INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    comments TEXT,
    applied_by INTEGER,
    approved_by INTEGER,
    approved_date TIMESTAMP,
    date_applied TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE hrms_data.leave_types TO bhushan;
GRANT ALL PRIVILEGES ON TABLE hrms_data.holidays TO bhushan;
GRANT ALL PRIVILEGES ON TABLE hrms_data.leave_requests TO bhushan;

GRANT USAGE, SELECT ON SEQUENCE hrms_data.leave_types_id_seq TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.holidays_id_seq TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.leave_requests_id_seq TO bhushan;

