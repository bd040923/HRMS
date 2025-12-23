-- ============================================================================
-- CREATE ATTENDANCE RECORDS TABLE
-- ============================================================================
-- This script creates the attendance_records table if it doesn't exist
-- Run this in PostgreSQL
-- ============================================================================

SET search_path TO hrms_data, public;

CREATE TABLE IF NOT EXISTS hrms_data.attendance_records (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    punch_in_date DATE NOT NULL,
    punch_in_time TIME NOT NULL,
    punch_in_note TEXT,
    punch_out_date DATE,
    punch_out_time TIME,
    punch_out_note TEXT,
    duration_hours DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'punched_in' CHECK (status IN ('punched_in', 'punched_out')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON hrms_data.attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON hrms_data.attendance_records(punch_in_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON hrms_data.attendance_records(status);

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE hrms_data.attendance_records TO PUBLIC;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.attendance_records_id_seq TO PUBLIC;

-- Verify table was created
SELECT 'Table created successfully' as status;

