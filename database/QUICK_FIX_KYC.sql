-- Quick Fix for KYC Table - Run this in PostgreSQL
-- This will add missing columns to existing table

BEGIN;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add document_type if missing (migrate from doc_type if exists)
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'document_type'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN document_type VARCHAR(50);
        
        -- Migrate from doc_type if it exists
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'hrms_data' 
            AND table_name = 'kyc_documents' 
            AND column_name = 'doc_type'
        ) THEN
            UPDATE hrms_data.kyc_documents 
            SET document_type = CASE 
                WHEN doc_type = 'aadhaar' THEN 'Aadhaar'
                WHEN doc_type = 'pan' THEN 'PAN'
                WHEN doc_type = 'bank' THEN 'Bank Passbook'
                ELSE INITCAP(doc_type)
            END
            WHERE document_type IS NULL;
        END IF;
        
        ALTER TABLE hrms_data.kyc_documents ALTER COLUMN document_type SET NOT NULL;
    END IF;
    
    -- Add file_url if missing (migrate from file_path if exists)
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'file_url'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN file_url TEXT;
        
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'hrms_data' 
            AND table_name = 'kyc_documents' 
            AND column_name = 'file_path'
        ) THEN
            UPDATE hrms_data.kyc_documents 
            SET file_url = file_path 
            WHERE file_url IS NULL AND file_path IS NOT NULL;
        END IF;
        
        ALTER TABLE hrms_data.kyc_documents ALTER COLUMN file_url SET NOT NULL;
    END IF;
    
    -- Add other missing columns
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'hrms_data' AND table_name = 'kyc_documents' AND column_name = 'file_name') THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN file_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'hrms_data' AND table_name = 'kyc_documents' AND column_name = 'upload_status') THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN upload_status VARCHAR(20) DEFAULT 'UPLOADED';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'hrms_data' AND table_name = 'kyc_documents' AND column_name = 'verification_status') THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN verification_status VARCHAR(20) DEFAULT 'PENDING';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'hrms_data' AND table_name = 'kyc_documents' AND column_name = 'rejection_reason') THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN rejection_reason TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'hrms_data' AND table_name = 'kyc_documents' AND column_name = 'verified_at') THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN verified_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'hrms_data' AND table_name = 'kyc_documents' AND column_name = 'verified_by') THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN verified_by INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'hrms_data' AND table_name = 'kyc_documents' AND column_name = 'masked_number') THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN masked_number TEXT;
    END IF;
    
    RAISE NOTICE 'All columns added successfully';
END $$;

-- Update unique constraint if needed
DO $$
BEGIN
    -- Drop old constraint if exists
    IF EXISTS (SELECT FROM pg_constraint WHERE conname = 'unique_employee_document' AND conrelid = 'hrms_data.kyc_documents'::regclass) THEN
        ALTER TABLE hrms_data.kyc_documents DROP CONSTRAINT unique_employee_document;
    END IF;
    
    -- Add new constraint on (employee_id, document_type)
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'unique_employee_document' AND conrelid = 'hrms_data.kyc_documents'::regclass) THEN
        ALTER TABLE hrms_data.kyc_documents ADD CONSTRAINT unique_employee_document UNIQUE (employee_id, document_type);
    END IF;
END $$;

COMMIT;

-- Verify
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'hrms_data' 
AND table_name = 'kyc_documents'
ORDER BY ordinal_position;



