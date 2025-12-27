-- COPY AND PASTE THIS INTO YOUR DATABASE CLIENT
-- Make sure you're connected as 'postgres' user to database 'arithwise_hrms'

-- Add missing columns to employees table
ALTER TABLE hrms_data.employees 
    ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50),
    ADD COLUMN IF NOT EXISTS sub_unit VARCHAR(100),
    ADD COLUMN IF NOT EXISTS supervisor_name VARCHAR(255);

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'hrms_data' 
AND table_name = 'employees'
ORDER BY ordinal_position;



