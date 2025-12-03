-- Migration: add employee attribute columns for Employees module
-- Date: 2025-02-12
-- Usage: psql -U postgres -d arithwsie_hrms -f database/migrations/2025-02-12-employee-attributes.sql

SET search_path TO hrms_data, public;

ALTER TABLE hrms_data.employees
    ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50),
    ADD COLUMN IF NOT EXISTS sub_unit VARCHAR(100),
    ADD COLUMN IF NOT EXISTS supervisor_name VARCHAR(255);

-- Optional defaults for legacy rows
UPDATE hrms_data.employees
SET employment_status = COALESCE(employment_status, 'Full-Time Permanent'),
    sub_unit = COALESCE(sub_unit, 'Arithwise HRM')
WHERE employment_status IS NULL OR sub_unit IS NULL;

