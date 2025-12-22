-- ============================================================================
-- CREATE LEAVE MANAGEMENT TABLES
-- ============================================================================
-- This script creates all tables needed for the Leave Management system
-- Run this as the postgres superuser or a user with CREATE TABLE privileges
-- ============================================================================

-- Set the schema
SET search_path TO hrms_data, public;

-- ============================================================================
-- 1. LEAVE TYPES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.leave_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    entitlement_days INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION hrms_data.update_leave_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leave_types_updated_at ON hrms_data.leave_types;
CREATE TRIGGER leave_types_updated_at
    BEFORE UPDATE ON hrms_data.leave_types
    FOR EACH ROW
    EXECUTE FUNCTION hrms_data.update_leave_types_updated_at();

-- ============================================================================
-- 2. HOLIDAYS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.holidays (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    full_day BOOLEAN DEFAULT true,
    repeats_annually BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION hrms_data.update_holidays_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS holidays_updated_at ON hrms_data.holidays;
CREATE TRIGGER holidays_updated_at
    BEFORE UPDATE ON hrms_data.holidays
    FOR EACH ROW
    EXECUTE FUNCTION hrms_data.update_holidays_updated_at();

-- ============================================================================
-- 3. LEAVE REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    leave_type_id INTEGER NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    number_of_days INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'taken', 'scheduled')),
    comments TEXT,
    applied_by INTEGER,
    approved_by INTEGER,
    approved_date TIMESTAMP,
    date_applied TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES hrms_data.leave_types(id) ON DELETE RESTRICT
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION hrms_data.update_leave_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leave_requests_updated_at ON hrms_data.leave_requests;
CREATE TRIGGER leave_requests_updated_at
    BEFORE UPDATE ON hrms_data.leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION hrms_data.update_leave_requests_updated_at();

-- ============================================================================
-- 4. LEAVE ENTITLEMENTS TABLE (Optional - for tracking leave balances)
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.leave_entitlements (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    leave_type_id INTEGER NOT NULL,
    entitlement_days DECIMAL(10, 2) DEFAULT 0,
    used_days DECIMAL(10, 2) DEFAULT 0,
    balance_days DECIMAL(10, 2) GENERATED ALWAYS AS (entitlement_days - used_days) STORED,
    leave_period_start DATE,
    leave_period_end DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES hrms_data.leave_types(id) ON DELETE RESTRICT,
    UNIQUE(employee_id, leave_type_id, leave_period_start)
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION hrms_data.update_leave_entitlements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leave_entitlements_updated_at ON hrms_data.leave_entitlements;
CREATE TRIGGER leave_entitlements_updated_at
    BEFORE UPDATE ON hrms_data.leave_entitlements
    FOR EACH ROW
    EXECUTE FUNCTION hrms_data.update_leave_entitlements_updated_at();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
-- Grant all privileges to the database user (replace 'bhushan' with your username)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hrms_data TO bhushan;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA hrms_data TO bhushan;
GRANT USAGE ON SCHEMA hrms_data TO bhushan;

-- Specific grants for the new tables
GRANT ALL PRIVILEGES ON TABLE hrms_data.leave_types TO bhushan;
GRANT ALL PRIVILEGES ON TABLE hrms_data.holidays TO bhushan;
GRANT ALL PRIVILEGES ON TABLE hrms_data.leave_requests TO bhushan;
GRANT ALL PRIVILEGES ON TABLE hrms_data.leave_entitlements TO bhushan;

GRANT USAGE, SELECT ON SEQUENCE hrms_data.leave_types_id_seq TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.holidays_id_seq TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.leave_requests_id_seq TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.leave_entitlements_id_seq TO bhushan;

-- ============================================================================
-- INSERT SAMPLE DATA (Optional)
-- ============================================================================
-- Insert some sample leave types
INSERT INTO hrms_data.leave_types (name, description, entitlement_days, status)
VALUES 
    ('US - Vacation', 'Annual vacation leave', 15, 'active'),
    ('US - Sick Leave', 'Sick leave for medical purposes', 10, 'active'),
    ('US - Personal', 'Personal leave', 5, 'active'),
    ('US - Bereavement', 'Bereavement leave', 3, 'active'),
    ('US - FMLA', 'Family and Medical Leave Act', 12, 'active')
ON CONFLICT (name) DO NOTHING;

-- Insert some sample holidays
INSERT INTO hrms_data.holidays (name, date, full_day, repeats_annually)
VALUES 
    ('New Year''s Day', '2025-01-01', true, true),
    ('Independence Day', '2025-07-04', true, true),
    ('Christmas Day', '2025-12-25', true, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the tables were created successfully:

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'hrms_data' 
AND table_name IN ('leave_types', 'holidays', 'leave_requests', 'leave_entitlements')
ORDER BY table_name;

-- Count records in each table
SELECT 
    'leave_types' as table_name, 
    COUNT(*) as record_count 
FROM hrms_data.leave_types
UNION ALL
SELECT 
    'holidays' as table_name, 
    COUNT(*) as record_count 
FROM hrms_data.holidays
UNION ALL
SELECT 
    'leave_requests' as table_name, 
    COUNT(*) as record_count 
FROM hrms_data.leave_requests
UNION ALL
SELECT 
    'leave_entitlements' as table_name, 
    COUNT(*) as record_count 
FROM hrms_data.leave_entitlements;

