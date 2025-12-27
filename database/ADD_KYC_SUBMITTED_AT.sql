-- ============================================================================
-- ADD SUBMITTED_AT FIELD TO KYC_DOCUMENTS TABLE
-- ============================================================================
-- This script adds submitted_at field to track when each document section
-- was individually submitted by the employee
-- ============================================================================

SET search_path TO hrms_data, public;

-- Add submitted_at column (TIMESTAMP, nullable)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'submitted_at'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents 
        ADD COLUMN submitted_at TIMESTAMP;
        
        -- Set submitted_at for documents that are already in PENDING status
        -- (these were submitted via the old bulk submit endpoint)
        UPDATE hrms_data.kyc_documents
        SET submitted_at = uploaded_at
        WHERE verification_status = 'PENDING'
          AND submitted_at IS NULL
          AND uploaded_at IS NOT NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error adding submitted_at: %', SQLERRM;
END $$;

-- Create index on submitted_at for better query performance
CREATE INDEX IF NOT EXISTS idx_kyc_documents_submitted_at 
ON hrms_data.kyc_documents(submitted_at);

-- Verification query
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'hrms_data' 
  AND table_name = 'kyc_documents'
  AND column_name = 'submitted_at';

