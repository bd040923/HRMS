-- Fix KYC Table - Run this entire script in PostgreSQL
-- This will add all missing columns and migrate data

BEGIN;

-- Step 1: Add document_type column (migrate from doc_type if exists)
DO $$
BEGIN
    -- Check if document_type doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'document_type'
    ) THEN
        -- Add the column
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN document_type VARCHAR(50);
        
        -- Migrate from doc_type if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
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
        
        -- Make it NOT NULL after migration
        ALTER TABLE hrms_data.kyc_documents ALTER COLUMN document_type SET NOT NULL;
    END IF;
END $$;

-- Step 2: Add file_url column (migrate from file_path if exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'file_url'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN file_url TEXT;
        
        -- Migrate from file_path if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'hrms_data' 
            AND table_name = 'kyc_documents' 
            AND column_name = 'file_path'
        ) THEN
            UPDATE hrms_data.kyc_documents 
            SET file_url = file_path 
            WHERE file_url IS NULL AND file_path IS NOT NULL;
        END IF;
        
        -- Make it NOT NULL if we have data, otherwise allow NULL temporarily
        ALTER TABLE hrms_data.kyc_documents ALTER COLUMN file_url SET DEFAULT '';
    END IF;
END $$;

-- Step 3: Add other missing columns
DO $$
BEGIN
    -- Add file_name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'file_name'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN file_name TEXT;
    END IF;
    
    -- Add upload_status
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'upload_status'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN upload_status VARCHAR(20) DEFAULT 'UPLOADED';
    END IF;
    
    -- Add verification_status
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'verification_status'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN verification_status VARCHAR(20) DEFAULT 'PENDING';
        
        -- Migrate from old status column if exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'hrms_data' 
            AND table_name = 'kyc_documents' 
            AND column_name = 'status'
        ) THEN
            UPDATE hrms_data.kyc_documents 
            SET verification_status = CASE 
                WHEN UPPER(status) = 'APPROVED' THEN 'APPROVED'
                WHEN UPPER(status) = 'REJECTED' OR UPPER(status) = 'RE-UPLOAD REQUIRED' THEN 'REJECTED'
                ELSE 'PENDING'
            END
            WHERE verification_status = 'PENDING';
        END IF;
    END IF;
    
    -- Add rejection_reason
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'rejection_reason'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN rejection_reason TEXT;
    END IF;
    
    -- Add verified_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'verified_at'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN verified_at TIMESTAMP;
    END IF;
    
    -- Add verified_by
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'verified_by'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN verified_by INTEGER;
    END IF;
    
    -- Add masked_number
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'masked_number'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN masked_number TEXT;
    END IF;
END $$;

-- Step 4: Update constraints
DO $$
BEGIN
    -- Drop old unique constraint if it exists on (employee_id, doc_type)
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_employee_document' 
        AND conrelid = 'hrms_data.kyc_documents'::regclass
    ) THEN
        ALTER TABLE hrms_data.kyc_documents DROP CONSTRAINT unique_employee_document;
    END IF;
    
    -- Add new unique constraint on (employee_id, document_type)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_employee_document' 
        AND conrelid = 'hrms_data.kyc_documents'::regclass
    ) THEN
        ALTER TABLE hrms_data.kyc_documents 
        ADD CONSTRAINT unique_employee_document 
        UNIQUE (employee_id, document_type);
    END IF;
    
    -- Add check constraint for verification_status
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_verification_status' 
        AND conrelid = 'hrms_data.kyc_documents'::regclass
    ) THEN
        ALTER TABLE hrms_data.kyc_documents 
        ADD CONSTRAINT check_verification_status 
        CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED'));
    END IF;
END $$;

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_kyc_employee_id ON hrms_data.kyc_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verification_status ON hrms_data.kyc_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_kyc_document_type ON hrms_data.kyc_documents(document_type);

-- Step 6: Grant permissions
GRANT ALL PRIVILEGES ON TABLE hrms_data.kyc_documents TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.kyc_documents_id_seq TO bhushan;

COMMIT;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'hrms_data' 
AND table_name = 'kyc_documents'
ORDER BY ordinal_position;



