-- Simple Fix for KYC Table - Run each section separately if needed
-- No transaction block - run commands one by one

-- First, rollback any failed transaction
ROLLBACK;

-- Step 1: Add document_type column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'document_type'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN document_type VARCHAR(50);
        
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
        
        ALTER TABLE hrms_data.kyc_documents ALTER COLUMN document_type SET NOT NULL;
    END IF;
END $$;

-- Step 2: Add file_url column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'file_url'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN file_url TEXT;
        
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
    END IF;
END $$;

-- Step 3: Add file_name
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'file_name'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN file_name TEXT;
    END IF;
END $$;

-- Step 4: Add upload_status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'upload_status'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN upload_status VARCHAR(20) DEFAULT 'UPLOADED';
    END IF;
END $$;

-- Step 5: Add verification_status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'verification_status'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN verification_status VARCHAR(20) DEFAULT 'PENDING';
        
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
END $$;

-- Step 6: Add rejection_reason
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'rejection_reason'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN rejection_reason TEXT;
    END IF;
END $$;

-- Step 7: Add verified_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'verified_at'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN verified_at TIMESTAMP;
    END IF;
END $$;

-- Step 8: Add verified_by
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'verified_by'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN verified_by INTEGER;
    END IF;
END $$;

-- Step 9: Add masked_number
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents' 
        AND column_name = 'masked_number'
    ) THEN
        ALTER TABLE hrms_data.kyc_documents ADD COLUMN masked_number TEXT;
    END IF;
END $$;

-- Step 10: Fix unique constraint
DO $$
BEGIN
    -- Drop old constraint if exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_employee_document' 
        AND conrelid = 'hrms_data.kyc_documents'::regclass
    ) THEN
        ALTER TABLE hrms_data.kyc_documents DROP CONSTRAINT unique_employee_document;
    END IF;
    
    -- Add new constraint
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_employee_document' 
        AND conrelid = 'hrms_data.kyc_documents'::regclass
    ) THEN
        ALTER TABLE hrms_data.kyc_documents 
        ADD CONSTRAINT unique_employee_document 
        UNIQUE (employee_id, document_type);
    END IF;
END $$;

-- Step 11: Add check constraint
DO $$
BEGIN
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

-- Step 12: Create indexes
CREATE INDEX IF NOT EXISTS idx_kyc_employee_id ON hrms_data.kyc_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verification_status ON hrms_data.kyc_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_kyc_document_type ON hrms_data.kyc_documents(document_type);

-- Step 13: Grant permissions
GRANT ALL PRIVILEGES ON TABLE hrms_data.kyc_documents TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.kyc_documents_id_seq TO bhushan;

-- Step 14: Verify
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'hrms_data' 
AND table_name = 'kyc_documents'
ORDER BY ordinal_position;



