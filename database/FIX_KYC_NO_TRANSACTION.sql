-- Fix KYC Table - NO TRANSACTION BLOCK
-- Run this entire script - each command runs independently
-- If one fails, others will still run

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
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error adding document_type: %', SQLERRM;
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
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error adding file_url: %', SQLERRM;
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
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error adding file_name: %', SQLERRM;
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
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error adding upload_status: %', SQLERRM;
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
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error adding verification_status: %', SQLERRM;
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
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error adding rejection_reason: %', SQLERRM;
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
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error adding verified_at: %', SQLERRM;
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
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error adding verified_by: %', SQLERRM;
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
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error adding masked_number: %', SQLERRM;
END $$;

-- Step 10: Fix unique constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_employee_document' 
        AND conrelid = 'hrms_data.kyc_documents'::regclass
    ) THEN
        ALTER TABLE hrms_data.kyc_documents DROP CONSTRAINT unique_employee_document;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_employee_document' 
        AND conrelid = 'hrms_data.kyc_documents'::regclass
    ) THEN
        ALTER TABLE hrms_data.kyc_documents 
        ADD CONSTRAINT unique_employee_document 
        UNIQUE (employee_id, document_type);
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing unique constraint: %', SQLERRM;
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
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error adding check constraint: %', SQLERRM;
END $$;

-- Step 12: Create indexes (these will skip if they exist)
CREATE INDEX IF NOT EXISTS idx_kyc_employee_id ON hrms_data.kyc_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verification_status ON hrms_data.kyc_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_kyc_document_type ON hrms_data.kyc_documents(document_type);

-- Step 13: Grant permissions
GRANT ALL PRIVILEGES ON TABLE hrms_data.kyc_documents TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.kyc_documents_id_seq TO bhushan;

-- Step 14: Verify table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'hrms_data' 
AND table_name = 'kyc_documents'
ORDER BY ordinal_position;



