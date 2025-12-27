-- KYC Documents Table Migration Script
-- This script migrates the existing kyc_documents table to the new schema
-- Run this if you're getting errors about missing columns
-- Copyright (C) 2024 Arithwise Inc.

BEGIN;

-- Step 1: Check if table exists, if not create it fresh
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents'
    ) THEN
        -- Table doesn't exist, create it fresh
        CREATE TABLE hrms_data.kyc_documents (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER NOT NULL,
            document_type VARCHAR(50) NOT NULL,
            file_url TEXT NOT NULL,
            file_name TEXT,
            upload_status VARCHAR(20) DEFAULT 'UPLOADED',
            verification_status VARCHAR(20) DEFAULT 'PENDING',
            rejection_reason TEXT,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            verified_at TIMESTAMP,
            verified_by INTEGER,
            masked_number TEXT,
            CONSTRAINT fk_employee
                FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE,
            CONSTRAINT unique_employee_document
                UNIQUE (employee_id, document_type),
            CONSTRAINT check_verification_status
                CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED'))
        );
        
        RAISE NOTICE 'Created new kyc_documents table';
    ELSE
        RAISE NOTICE 'Table exists, migrating schema...';
        
        -- Step 2: Migrate old columns to new schema if they exist
        
        -- If doc_type exists, migrate to document_type
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'hrms_data' 
            AND table_name = 'kyc_documents' 
            AND column_name = 'doc_type'
        ) THEN
            -- Add document_type column if it doesn't exist
            IF NOT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'hrms_data' 
                AND table_name = 'kyc_documents' 
                AND column_name = 'document_type'
            ) THEN
                ALTER TABLE hrms_data.kyc_documents 
                ADD COLUMN document_type VARCHAR(50);
                
                -- Migrate data: map old doc_type values to new document_type
                UPDATE hrms_data.kyc_documents 
                SET document_type = CASE 
                    WHEN doc_type = 'aadhaar' THEN 'Aadhaar'
                    WHEN doc_type = 'pan' THEN 'PAN'
                    WHEN doc_type = 'bank' THEN 'Bank Passbook'
                    ELSE INITCAP(doc_type)
                END
                WHERE document_type IS NULL;
                
                -- Make it NOT NULL after migration
                ALTER TABLE hrms_data.kyc_documents 
                ALTER COLUMN document_type SET NOT NULL;
                
                RAISE NOTICE 'Migrated doc_type to document_type';
            END IF;
        END IF;
        
        -- If file_path exists, migrate to file_url
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'hrms_data' 
            AND table_name = 'kyc_documents' 
            AND column_name = 'file_path'
        ) THEN
            IF NOT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'hrms_data' 
                AND table_name = 'kyc_documents' 
                AND column_name = 'file_url'
            ) THEN
                ALTER TABLE hrms_data.kyc_documents 
                ADD COLUMN file_url TEXT;
                
                -- Copy data from file_path to file_url
                UPDATE hrms_data.kyc_documents 
                SET file_url = file_path 
                WHERE file_url IS NULL AND file_path IS NOT NULL;
                
                -- Make it NOT NULL if we have data
                ALTER TABLE hrms_data.kyc_documents 
                ALTER COLUMN file_url SET NOT NULL;
                
                RAISE NOTICE 'Migrated file_path to file_url';
            END IF;
        END IF;
        
        -- Add file_url if it doesn't exist at all
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'hrms_data' 
            AND table_name = 'kyc_documents' 
            AND column_name = 'file_url'
        ) THEN
            ALTER TABLE hrms_data.kyc_documents 
            ADD COLUMN file_url TEXT NOT NULL DEFAULT '';
            RAISE NOTICE 'Added file_url column';
        END IF;
        
        -- Add file_name if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'hrms_data' 
            AND table_name = 'kyc_documents' 
            AND column_name = 'file_name'
        ) THEN
            ALTER TABLE hrms_data.kyc_documents 
            ADD COLUMN file_name TEXT;
            RAISE NOTICE 'Added file_name column';
        END IF;
        
        -- Add upload_status if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'hrms_data' 
            AND table_name = 'kyc_documents' 
            AND column_name = 'upload_status'
        ) THEN
            ALTER TABLE hrms_data.kyc_documents 
            ADD COLUMN upload_status VARCHAR(20) DEFAULT 'UPLOADED';
            RAISE NOTICE 'Added upload_status column';
        END IF;
        
        -- Add verification_status if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'hrms_data' 
            AND table_name = 'kyc_documents' 
            AND column_name = 'verification_status'
        ) THEN
            ALTER TABLE hrms_data.kyc_documents 
            ADD COLUMN verification_status VARCHAR(20) DEFAULT 'PENDING';
            
            -- Migrate old status values if status column exists
            IF EXISTS (
                SELECT FROM information_schema.columns 
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
            
            RAISE NOTICE 'Added verification_status column';
        END IF;
        
        -- Add rejection_reason if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'hrms_data' 
            AND table_name = 'kyc_documents' 
            AND column_name = 'rejection_reason'
        ) THEN
            ALTER TABLE hrms_data.kyc_documents 
            ADD COLUMN rejection_reason TEXT;
            RAISE NOTICE 'Added rejection_reason column';
        END IF;
        
        -- Add verified_at if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'hrms_data' 
            AND table_name = 'kyc_documents' 
            AND column_name = 'verified_at'
        ) THEN
            ALTER TABLE hrms_data.kyc_documents 
            ADD COLUMN verified_at TIMESTAMP;
            RAISE NOTICE 'Added verified_at column';
        END IF;
        
        -- Add verified_by if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'hrms_data' 
            AND table_name = 'kyc_documents' 
            AND column_name = 'verified_by'
        ) THEN
            ALTER TABLE hrms_data.kyc_documents 
            ADD COLUMN verified_by INTEGER;
            RAISE NOTICE 'Added verified_by column';
        END IF;
        
        -- Add masked_number if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'hrms_data' 
            AND table_name = 'kyc_documents' 
            AND column_name = 'masked_number'
        ) THEN
            ALTER TABLE hrms_data.kyc_documents 
            ADD COLUMN masked_number TEXT;
            RAISE NOTICE 'Added masked_number column';
        END IF;
        
        -- Step 3: Update constraints
        
        -- Drop old unique constraint if it exists on (employee_id, doc_type)
        IF EXISTS (
            SELECT FROM pg_constraint 
            WHERE conname = 'unique_employee_document' 
            AND conrelid = 'hrms_data.kyc_documents'::regclass
        ) THEN
            ALTER TABLE hrms_data.kyc_documents 
            DROP CONSTRAINT IF EXISTS unique_employee_document;
        END IF;
        
        -- Add new unique constraint on (employee_id, document_type)
        IF NOT EXISTS (
            SELECT FROM pg_constraint 
            WHERE conname = 'unique_employee_document' 
            AND conrelid = 'hrms_data.kyc_documents'::regclass
        ) THEN
            ALTER TABLE hrms_data.kyc_documents 
            ADD CONSTRAINT unique_employee_document 
            UNIQUE (employee_id, document_type);
            RAISE NOTICE 'Added unique constraint on (employee_id, document_type)';
        END IF;
        
        -- Add check constraint for verification_status
        IF NOT EXISTS (
            SELECT FROM pg_constraint 
            WHERE conname = 'check_verification_status' 
            AND conrelid = 'hrms_data.kyc_documents'::regclass
        ) THEN
            ALTER TABLE hrms_data.kyc_documents 
            ADD CONSTRAINT check_verification_status 
            CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED'));
            RAISE NOTICE 'Added check constraint for verification_status';
        END IF;
        
        -- Step 4: Create indexes
        CREATE INDEX IF NOT EXISTS idx_kyc_employee_id ON hrms_data.kyc_documents(employee_id);
        CREATE INDEX IF NOT EXISTS idx_kyc_verification_status ON hrms_data.kyc_documents(verification_status);
        CREATE INDEX IF NOT EXISTS idx_kyc_document_type ON hrms_data.kyc_documents(document_type);
        
        RAISE NOTICE 'Migration completed successfully';
    END IF;
END $$;

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE hrms_data.kyc_documents TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.kyc_documents_id_seq TO bhushan;

COMMIT;

-- Verify the schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'hrms_data' 
AND table_name = 'kyc_documents'
ORDER BY ordinal_position;



