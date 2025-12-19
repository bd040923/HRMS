-- ============================================================================
-- CHECK AND CREATE: Organization General Information Table
-- Run this to ensure the table exists and has correct structure
-- ============================================================================

SET search_path TO hrms_data, public;

-- Check if table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'organization_gen_info'
    ) THEN
        -- Create the table
        CREATE TABLE hrms_data.organization_gen_info (
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

        -- Create trigger function
        CREATE OR REPLACE FUNCTION update_organization_gen_info_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create trigger
        CREATE TRIGGER organization_gen_info_updated_at
            BEFORE UPDATE ON hrms_data.organization_gen_info
            FOR EACH ROW
            EXECUTE FUNCTION update_organization_gen_info_updated_at();

        -- Grant permissions
        GRANT ALL PRIVILEGES ON TABLE hrms_data.organization_gen_info TO bhushan;
        GRANT USAGE, SELECT ON SEQUENCE hrms_data.organization_gen_info_id_seq TO bhushan;

        RAISE NOTICE 'Table organization_gen_info created successfully!';
    ELSE
        RAISE NOTICE 'Table organization_gen_info already exists.';
    END IF;
END $$;

-- Verify table exists
SELECT 'Table exists: ' || EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'hrms_data' 
    AND table_name = 'organization_gen_info'
) AS status;

