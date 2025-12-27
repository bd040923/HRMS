-- Quick fix: Add submitted_at column to kyc_documents table
-- Run this in your PostgreSQL database

SET search_path TO hrms_data, public;

-- Add the column if it doesn't exist
ALTER TABLE hrms_data.kyc_documents 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP;

-- Set submitted_at for existing PENDING documents
UPDATE hrms_data.kyc_documents
SET submitted_at = uploaded_at
WHERE verification_status = 'PENDING'
  AND submitted_at IS NULL
  AND uploaded_at IS NOT NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_kyc_documents_submitted_at 
ON hrms_data.kyc_documents(submitted_at);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'hrms_data' 
  AND table_name = 'kyc_documents'
  AND column_name = 'submitted_at';

