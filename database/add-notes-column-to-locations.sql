-- ============================================================================
-- ADD notes COLUMN TO locations TABLE
-- Run this if the table already exists but is missing the notes column
-- ============================================================================

SET search_path TO hrms_data, public;

-- Add notes column if it doesn't exist
ALTER TABLE hrms_data.locations 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Verify the column was added
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'hrms_data'
AND table_name = 'locations'
AND column_name = 'notes';

