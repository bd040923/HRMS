-- ============================================================================
-- ORGANIZATION GENERAL INFORMATION - POSTGRESQL QUERIES
-- Run these queries in pgAdmin Query Tool or psql
-- Database: arithwise_hrms
-- Schema: hrms_data
-- ============================================================================

-- Set the search path
SET search_path TO hrms_data, public;

-- ============================================================================
-- STEP 1: CREATE THE TABLE (Run this first if table doesn't exist)
-- ============================================================================

CREATE TABLE IF NOT EXISTS hrms_data.organization_gen_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tax_id VARCHAR(30),
    registration_number VARCHAR(30),
    phone VARCHAR(30),
    fax VARCHAR(30),
    email VARCHAR(100),
    country VARCHAR(100),
    province VARCHAR(100),
    city VARCHAR(100),
    zip_code VARCHAR(30),
    street1 VARCHAR(100),
    street2 VARCHAR(100),
    note TEXT,
    number_of_employees INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_organization_gen_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS organization_gen_info_updated_at ON hrms_data.organization_gen_info;
CREATE TRIGGER organization_gen_info_updated_at
    BEFORE UPDATE ON hrms_data.organization_gen_info
    FOR EACH ROW
    EXECUTE FUNCTION update_organization_gen_info_updated_at();

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE hrms_data.organization_gen_info TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.organization_gen_info_id_seq TO bhushan;

-- ============================================================================
-- STEP 2: CHECK IF TABLE EXISTS
-- ============================================================================

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'hrms_data' 
    AND table_name = 'organization_gen_info'
) AS table_exists;

-- ============================================================================
-- STEP 3: VIEW ALL DATA IN THE TABLE
-- ============================================================================

SELECT 
    id,
    name AS "Organization Name",
    registration_number AS "Registration Number",
    tax_id AS "Tax ID",
    phone AS "Phone",
    fax AS "Fax",
    email AS "Email",
    street1 AS "Address Line 1",
    street2 AS "Address Line 2",
    city AS "City",
    province AS "State/Province",
    zip_code AS "ZIP Code",
    country AS "Country",
    note AS "Notes",
    number_of_employees AS "Number of Employees",
    created_at AS "Created At",
    updated_at AS "Last Updated"
FROM organization_gen_info
ORDER BY id;

-- ============================================================================
-- STEP 4: VIEW SPECIFIC RECORD (ID = 1)
-- ============================================================================

SELECT 
    id,
    name AS "Organization Name",
    registration_number AS "Registration Number",
    tax_id AS "Tax ID",
    phone AS "Phone",
    fax AS "Fax",
    email AS "Email",
    street1 AS "Address Line 1",
    street2 AS "Address Line 2",
    city AS "City",
    province AS "State/Province",
    zip_code AS "ZIP Code",
    country AS "Country",
    note AS "Notes",
    number_of_employees AS "Number of Employees",
    created_at AS "Created At",
    updated_at AS "Last Updated"
FROM organization_gen_info
WHERE id = 1;

-- ============================================================================
-- STEP 5: COUNT RECORDS
-- ============================================================================

SELECT COUNT(*) AS total_records FROM organization_gen_info;

-- ============================================================================
-- STEP 6: VIEW TABLE STRUCTURE
-- ============================================================================

SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'hrms_data'
AND table_name = 'organization_gen_info'
ORDER BY ordinal_position;

-- ============================================================================
-- STEP 7: INSERT SAMPLE DATA (Optional - for testing)
-- ============================================================================

INSERT INTO hrms_data.organization_gen_info (
    id, name, registration_number, tax_id, phone, fax, email,
    street1, street2, city, province, zip_code, country, note, number_of_employees
) VALUES (
    1,
    'arithwise_hrms',
    'REG123456',
    'TAX789012',
    '123-456-7890',
    '123-456-7891',
    'info@arithwise.com',
    '123 Main Street',
    'Suite 100',
    'New York',
    'NY',
    '10001',
    'United States',
    'HR Management System',
    122
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    registration_number = EXCLUDED.registration_number,
    tax_id = EXCLUDED.tax_id,
    phone = EXCLUDED.phone,
    fax = EXCLUDED.fax,
    email = EXCLUDED.email,
    street1 = EXCLUDED.street1,
    street2 = EXCLUDED.street2,
    city = EXCLUDED.city,
    province = EXCLUDED.province,
    zip_code = EXCLUDED.zip_code,
    country = EXCLUDED.country,
    note = EXCLUDED.note,
    number_of_employees = EXCLUDED.number_of_employees,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- STEP 8: UPDATE DATA MANUALLY (if needed)
-- ============================================================================

-- Example: Update organization name
-- UPDATE hrms_data.organization_gen_info
-- SET 
--     name = 'New Organization Name',
--     updated_at = CURRENT_TIMESTAMP
-- WHERE id = 1;

-- ============================================================================
-- STEP 9: DELETE ALL DATA (Use with caution!)
-- ============================================================================

-- DELETE FROM hrms_data.organization_gen_info;
-- This will delete all records. Use only if you want to start fresh.

-- ============================================================================
-- STEP 10: CHECK PERMISSIONS
-- ============================================================================

SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'hrms_data'
AND table_name = 'organization_gen_info';

