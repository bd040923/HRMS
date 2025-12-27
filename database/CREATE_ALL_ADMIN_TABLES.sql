-- ============================================================================
-- CREATE ALL ADMIN TABLES
-- This script creates all tables needed for Admin section functionality
-- Run this as 'postgres' user in database 'arithwise_hrms'
-- ============================================================================

SET search_path TO hrms_data, public;

-- ============================================================================
-- PAY GRADES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.pay_grades (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    currency VARCHAR(50) DEFAULT 'United States Dollar',
    min_salary DECIMAL(10,2),
    max_salary DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EMPLOYMENT STATUS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.employment_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- JOB CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.job_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- WORK SHIFTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.work_shifts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    hours_per_day DECIMAL(5,2) DEFAULT 8.00,
    start_time TIME,
    end_time TIME,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SKILLS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EDUCATION LEVELS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.education_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- LICENSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.licenses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- LANGUAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MEMBERSHIPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.memberships (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CREATE TRIGGER FUNCTIONS FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS pay_grades_updated_at ON hrms_data.pay_grades;
CREATE TRIGGER pay_grades_updated_at BEFORE UPDATE ON hrms_data.pay_grades FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS employment_status_updated_at ON hrms_data.employment_status;
CREATE TRIGGER employment_status_updated_at BEFORE UPDATE ON hrms_data.employment_status FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS job_categories_updated_at ON hrms_data.job_categories;
CREATE TRIGGER job_categories_updated_at BEFORE UPDATE ON hrms_data.job_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS work_shifts_updated_at ON hrms_data.work_shifts;
CREATE TRIGGER work_shifts_updated_at BEFORE UPDATE ON hrms_data.work_shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS skills_updated_at ON hrms_data.skills;
CREATE TRIGGER skills_updated_at BEFORE UPDATE ON hrms_data.skills FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS education_levels_updated_at ON hrms_data.education_levels;
CREATE TRIGGER education_levels_updated_at BEFORE UPDATE ON hrms_data.education_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS licenses_updated_at ON hrms_data.licenses;
CREATE TRIGGER licenses_updated_at BEFORE UPDATE ON hrms_data.licenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS languages_updated_at ON hrms_data.languages;
CREATE TRIGGER languages_updated_at BEFORE UPDATE ON hrms_data.languages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS memberships_updated_at ON hrms_data.memberships;
CREATE TRIGGER memberships_updated_at BEFORE UPDATE ON hrms_data.memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT ALL PRIVILEGES ON TABLE hrms_data.pay_grades TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.pay_grades_id_seq TO bhushan;

GRANT ALL PRIVILEGES ON TABLE hrms_data.employment_status TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.employment_status_id_seq TO bhushan;

GRANT ALL PRIVILEGES ON TABLE hrms_data.job_categories TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.job_categories_id_seq TO bhushan;

GRANT ALL PRIVILEGES ON TABLE hrms_data.work_shifts TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.work_shifts_id_seq TO bhushan;

GRANT ALL PRIVILEGES ON TABLE hrms_data.skills TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.skills_id_seq TO bhushan;

GRANT ALL PRIVILEGES ON TABLE hrms_data.education_levels TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.education_levels_id_seq TO bhushan;

GRANT ALL PRIVILEGES ON TABLE hrms_data.licenses TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.licenses_id_seq TO bhushan;

GRANT ALL PRIVILEGES ON TABLE hrms_data.languages TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.languages_id_seq TO bhushan;

GRANT ALL PRIVILEGES ON TABLE hrms_data.memberships TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.memberships_id_seq TO bhushan;

-- ============================================================================
-- VERIFY TABLES CREATED
-- ============================================================================
SELECT 
    'pay_grades' AS table_name,
    COUNT(*) AS record_count
FROM hrms_data.pay_grades
UNION ALL
SELECT 'employment_status', COUNT(*) FROM hrms_data.employment_status
UNION ALL
SELECT 'job_categories', COUNT(*) FROM hrms_data.job_categories
UNION ALL
SELECT 'work_shifts', COUNT(*) FROM hrms_data.work_shifts
UNION ALL
SELECT 'skills', COUNT(*) FROM hrms_data.skills
UNION ALL
SELECT 'education_levels', COUNT(*) FROM hrms_data.education_levels
UNION ALL
SELECT 'licenses', COUNT(*) FROM hrms_data.licenses
UNION ALL
SELECT 'languages', COUNT(*) FROM hrms_data.languages
UNION ALL
SELECT 'memberships', COUNT(*) FROM hrms_data.memberships;



