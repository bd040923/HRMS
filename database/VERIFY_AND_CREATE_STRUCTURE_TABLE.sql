-- ============================================================================
-- VERIFY AND CREATE Organization Structure Table
-- Run this in pgAdmin Query Tool
-- ============================================================================

SET search_path TO hrms_data, public;

-- Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'hrms_data' 
            AND table_name = 'organization_structure'
        ) THEN '✅ Table EXISTS'
        ELSE '❌ Table DOES NOT EXIST'
    END AS table_status;

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS hrms_data.organization_structure (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit_id VARCHAR(50),
    description TEXT,
    parent_id INTEGER,
    level INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES hrms_data.organization_structure(id) ON DELETE CASCADE
);

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_organization_structure_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS organization_structure_updated_at ON hrms_data.organization_structure;
CREATE TRIGGER organization_structure_updated_at
    BEFORE UPDATE ON hrms_data.organization_structure
    FOR EACH ROW
    EXECUTE FUNCTION update_organization_structure_updated_at();

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE hrms_data.organization_structure TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.organization_structure_id_seq TO bhushan;

-- Insert root organization (if not exists)
INSERT INTO hrms_data.organization_structure (id, name, unit_id, level, parent_id)
VALUES (1, 'arithwise_hrms', 'company', 0, NULL)
ON CONFLICT (id) DO NOTHING;

-- Verify the table was created and show data
SELECT 
    '✅ Table created/verified successfully!' AS status,
    COUNT(*) AS total_units
FROM hrms_data.organization_structure;

-- View all data
SELECT * FROM hrms_data.organization_structure ORDER BY level, name;

