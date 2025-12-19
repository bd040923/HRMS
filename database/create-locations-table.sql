-- ============================================================================
-- CREATE locations TABLE
-- This table stores organization locations
-- Run this as 'postgres' user in database 'arithwise_hrms'
-- ============================================================================

SET search_path TO hrms_data, public;

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS hrms_data.locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    phone VARCHAR(30),
    fax VARCHAR(30),
    address VARCHAR(255),
    zip_code VARCHAR(30),
    province VARCHAR(100),
    number_of_employees INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS locations_updated_at ON hrms_data.locations;
CREATE TRIGGER locations_updated_at
    BEFORE UPDATE ON hrms_data.locations
    FOR EACH ROW
    EXECUTE FUNCTION update_locations_updated_at();

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE hrms_data.locations TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.locations_id_seq TO bhushan;

-- Insert sample data for Indian locations
INSERT INTO hrms_data.locations (name, city, country, phone, number_of_employees, status)
VALUES 
    ('Nagpur Office', 'Nagpur', 'India', '+91-712-1234567', 0, 'active'),
    ('Mumbai Office', 'Mumbai', 'India', '+91-22-1234567', 0, 'active')
ON CONFLICT DO NOTHING;

-- Verify the table
SELECT * FROM hrms_data.locations ORDER BY id;

