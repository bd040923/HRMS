-- ============================================================================
-- CREATE organization_gen_info TABLE
-- This table stores organization general information
-- Run this as 'postgres' user in database 'arithwise_hrms'
-- ============================================================================

SET search_path TO hrms_data, public;

-- Create the table if it doesn't exist
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

-- Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_organization_gen_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organization_gen_info_updated_at
    BEFORE UPDATE ON hrms_data.organization_gen_info
    FOR EACH ROW
    EXECUTE FUNCTION update_organization_gen_info_updated_at();

-- Insert a default record (if none exists)
INSERT INTO hrms_data.organization_gen_info (id, name)
VALUES (1, 'arithwise_hrms')
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE hrms_data.organization_gen_info TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.organization_gen_info_id_seq TO bhushan;

-- Verify the table
SELECT * FROM hrms_data.organization_gen_info;

