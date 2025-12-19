-- ============================================================================
-- CREATE Corporate Branding Table
-- This script creates the corporate_branding table for storing branding settings
-- Run this as 'postgres' user in database 'arithwise_hrms'
-- ============================================================================

SET search_path TO hrms_data, public;

-- ============================================================================
-- CORPORATE BRANDING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hrms_data.corporate_branding (
    id SERIAL PRIMARY KEY,
    primary_color VARCHAR(7) DEFAULT '#78176b',
    secondary_color VARCHAR(7) DEFAULT '#590a4f',
    primary_font_color VARCHAR(7) DEFAULT '#ffffff',
    secondary_font_color VARCHAR(7) DEFAULT '#222222',
    gradient_color1 VARCHAR(7) DEFAULT '#faf3ff',
    gradient_color2 VARCHAR(7) DEFAULT '#fffafe',
    social_media_enabled BOOLEAN DEFAULT true,
    client_logo_path VARCHAR(255),
    client_banner_path VARCHAR(255),
    login_banner_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CREATE TRIGGER FUNCTION FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_corporate_branding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE TRIGGER
-- ============================================================================
DROP TRIGGER IF EXISTS corporate_branding_updated_at ON hrms_data.corporate_branding;
CREATE TRIGGER corporate_branding_updated_at
    BEFORE UPDATE ON hrms_data.corporate_branding
    FOR EACH ROW
    EXECUTE FUNCTION update_corporate_branding_updated_at();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT ALL PRIVILEGES ON TABLE hrms_data.corporate_branding TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.corporate_branding_id_seq TO bhushan;

-- ============================================================================
-- INSERT DEFAULT RECORD (if not exists)
-- ============================================================================
INSERT INTO hrms_data.corporate_branding (
    id,
    primary_color,
    secondary_color,
    primary_font_color,
    secondary_font_color,
    gradient_color1,
    gradient_color2,
    social_media_enabled
)
VALUES (
    1,
    '#78176b',
    '#590a4f',
    '#ffffff',
    '#222222',
    '#faf3ff',
    '#fffafe',
    true
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFY TABLE CREATED
-- ============================================================================
SELECT 
    '✅ Table created successfully!' AS status,
    COUNT(*) AS total_records
FROM hrms_data.corporate_branding;

-- View the data
SELECT * FROM hrms_data.corporate_branding;

