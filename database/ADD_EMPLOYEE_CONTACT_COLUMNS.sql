-- ============================================================================
-- ADD MISSING EMPLOYEE CONTACT COLUMNS
-- ============================================================================
-- This script adds missing columns to the employees table for the Employee Records page
-- Columns: alternate_phone, personal_email, residential_address
-- ============================================================================

SET search_path TO hrms_data, public;

-- Add alternate_phone column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'employees' 
        AND column_name = 'alternate_phone'
    ) THEN
        ALTER TABLE hrms_data.employees 
        ADD COLUMN alternate_phone VARCHAR(20);
        
        RAISE NOTICE 'Added alternate_phone column';
    ELSE
        RAISE NOTICE 'alternate_phone column already exists';
    END IF;
END $$;

-- Add personal_email column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'employees' 
        AND column_name = 'personal_email'
    ) THEN
        ALTER TABLE hrms_data.employees 
        ADD COLUMN personal_email VARCHAR(255);
        
        RAISE NOTICE 'Added personal_email column';
    ELSE
        RAISE NOTICE 'personal_email column already exists';
    END IF;
END $$;

-- Add residential_address column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'employees' 
        AND column_name = 'residential_address'
    ) THEN
        ALTER TABLE hrms_data.employees 
        ADD COLUMN residential_address TEXT;
        
        RAISE NOTICE 'Added residential_address column';
    ELSE
        RAISE NOTICE 'residential_address column already exists';
    END IF;
END $$;

-- Verify columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'hrms_data' 
  AND table_name = 'employees'
  AND column_name IN ('alternate_phone', 'personal_email', 'residential_address')
ORDER BY column_name;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. All columns are nullable (optional fields)
-- 2. alternate_phone: VARCHAR(20) - for storing alternate phone number
-- 3. personal_email: VARCHAR(255) - for storing personal email address
-- 4. residential_address: TEXT - for storing full residential address
-- 5. The script is idempotent - safe to run multiple times
-- ============================================================================

