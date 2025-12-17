-- Simple script to grant all permissions to bhushan
-- Run this as postgres: psql -U postgres -d arithwise_hrms -f grant-permissions-simple.sql

\c arithwise_hrms

-- Grant schema usage
GRANT USAGE ON SCHEMA hrms_data TO bhushan;

-- Grant all privileges on all existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hrms_data TO bhushan;

-- Grant all privileges on all sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA hrms_data TO bhushan;

-- Grant execute on all functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA hrms_data TO bhushan;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA hrms_data 
    GRANT ALL PRIVILEGES ON TABLES TO bhushan;
    
ALTER DEFAULT PRIVILEGES IN SCHEMA hrms_data 
    GRANT ALL PRIVILEGES ON SEQUENCES TO bhushan;
    
ALTER DEFAULT PRIVILEGES IN SCHEMA hrms_data 
    GRANT EXECUTE ON FUNCTIONS TO bhushan;

-- Verify permissions were granted
SELECT 
    table_schema, 
    table_name, 
    privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'bhushan'
AND table_schema = 'hrms_data'
ORDER BY table_name, privilege_type;
