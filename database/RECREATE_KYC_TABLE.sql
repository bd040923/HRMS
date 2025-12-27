-- KYC Documents Table - Drop and Recreate (Fresh Start)
-- WARNING: This will DELETE all existing KYC data!
-- Use this only if you want to start fresh or if migration fails
-- Copyright (C) 2024 Arithwise Inc.

BEGIN;

-- Drop existing table and all dependencies
DROP TABLE IF EXISTS hrms_data.kyc_documents CASCADE;

-- Create new table with correct schema
CREATE TABLE hrms_data.kyc_documents (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- 'Aadhaar', 'PAN', 'Bank Passbook'
    file_url TEXT NOT NULL,
    file_name TEXT,
    upload_status VARCHAR(20) DEFAULT 'UPLOADED',
    verification_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    rejection_reason TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    verified_by INTEGER, -- Admin user_id who verified
    masked_number TEXT, -- For Aadhaar masking
    CONSTRAINT fk_employee
        FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE,
    CONSTRAINT unique_employee_document
        UNIQUE (employee_id, document_type),
    CONSTRAINT check_verification_status
        CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- Create indexes for better query performance
CREATE INDEX idx_kyc_employee_id ON hrms_data.kyc_documents(employee_id);
CREATE INDEX idx_kyc_verification_status ON hrms_data.kyc_documents(verification_status);
CREATE INDEX idx_kyc_document_type ON hrms_data.kyc_documents(document_type);

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE hrms_data.kyc_documents TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.kyc_documents_id_seq TO bhushan;

-- Add comments for documentation
COMMENT ON TABLE hrms_data.kyc_documents IS 'Stores KYC documents uploaded by employees, scoped per employee';
COMMENT ON COLUMN hrms_data.kyc_documents.employee_id IS 'Foreign key to employees table - ensures employee-specific data';
COMMENT ON COLUMN hrms_data.kyc_documents.document_type IS 'Type of document: Aadhaar, PAN, or Bank Passbook';
COMMENT ON COLUMN hrms_data.kyc_documents.verification_status IS 'PENDING: Awaiting admin review, APPROVED: Verified, REJECTED: Needs re-upload';
COMMENT ON COLUMN hrms_data.kyc_documents.verified_by IS 'User ID of admin who verified the document';

COMMIT;

-- Verify the table was created correctly
SELECT 
    'Table created successfully!' AS status,
    COUNT(*) AS column_count
FROM information_schema.columns 
WHERE table_schema = 'hrms_data' 
AND table_name = 'kyc_documents';



