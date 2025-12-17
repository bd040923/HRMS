-- Add missing columns to employees table if they don't exist
-- Run this as postgres: psql -U postgres -d arithwise_hrms -f add-missing-columns.sql

SET search_path TO hrms_data, public;

-- Add middle_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'employees' 
        AND column_name = 'middle_name'
    ) THEN
        ALTER TABLE hrms_data.employees ADD COLUMN middle_name VARCHAR(100);
        RAISE NOTICE 'Added middle_name column';
    ELSE
        RAISE NOTICE 'middle_name column already exists';
    END IF;
END $$;

-- Add employment_status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'employees' 
        AND column_name = 'employment_status'
    ) THEN
        ALTER TABLE hrms_data.employees ADD COLUMN employment_status VARCHAR(50);
        RAISE NOTICE 'Added employment_status column';
    ELSE
        RAISE NOTICE 'employment_status column already exists';
    END IF;
END $$;

-- Add sub_unit column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'employees' 
        AND column_name = 'sub_unit'
    ) THEN
        ALTER TABLE hrms_data.employees ADD COLUMN sub_unit VARCHAR(100);
        RAISE NOTICE 'Added sub_unit column';
    ELSE
        RAISE NOTICE 'sub_unit column already exists';
    END IF;
END $$;

-- Add supervisor_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'employees' 
        AND column_name = 'supervisor_name'
    ) THEN
        ALTER TABLE hrms_data.employees ADD COLUMN supervisor_name VARCHAR(255);
        RAISE NOTICE 'Added supervisor_name column';
    ELSE
        RAISE NOTICE 'supervisor_name column already exists';
    END IF;
END $$;

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'hrms_data' 
AND table_name = 'employees'
ORDER BY ordinal_position;

