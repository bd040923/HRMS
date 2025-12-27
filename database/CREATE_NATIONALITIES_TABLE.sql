-- ============================================================================
-- CREATE Nationalities Table
-- This script creates the nationalities table needed for Nationalities management
-- Run this as 'postgres' user in database 'arithwise_hrms'
-- ============================================================================

SET search_path TO hrms_data, public;

-- ============================================================================
-- NATIONALITIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.nationalities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CREATE TRIGGER FUNCTION FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_nationalities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE TRIGGER
-- ============================================================================
DROP TRIGGER IF EXISTS nationalities_updated_at ON hrms_data.nationalities;
CREATE TRIGGER nationalities_updated_at
    BEFORE UPDATE ON hrms_data.nationalities
    FOR EACH ROW
    EXECUTE FUNCTION update_nationalities_updated_at();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT ALL PRIVILEGES ON TABLE hrms_data.nationalities TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.nationalities_id_seq TO bhushan;

-- ============================================================================
-- VERIFY TABLE CREATED
-- ============================================================================
SELECT 
    '✅ Table created successfully!' AS status,
    COUNT(*) AS total_nationalities
FROM hrms_data.nationalities;

-- View the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'hrms_data' 
AND table_name = 'nationalities'
ORDER BY ordinal_position;



