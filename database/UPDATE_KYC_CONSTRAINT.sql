-- Update KYC table constraint to allow NULL for verification_status
-- This allows documents to be "uploaded" but not yet "submitted for review"

-- Drop the existing constraint
ALTER TABLE hrms_data.kyc_documents 
DROP CONSTRAINT IF EXISTS check_verification_status;

-- Add new constraint that allows NULL
ALTER TABLE hrms_data.kyc_documents
ADD CONSTRAINT check_verification_status
CHECK (verification_status IS NULL OR verification_status IN ('PENDING', 'APPROVED', 'REJECTED'));

-- Verify the constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'hrms_data.kyc_documents'::regclass
AND conname = 'check_verification_status';



