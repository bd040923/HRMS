-- Grant Permissions to User 'bhushan' for Schema 'hrms_data'
-- Database: arithwsie_hrms
-- Schema: hrms_data
-- User: bhushan
-- Copyright (C) 2024 Arithwise Inc.

-- ============================================================================
-- PERMISSIONS QUERIES FOR USER 'bhushan'
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA hrms_data TO bhushan;

-- Grant all privileges on all existing tables in schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hrms_data TO bhushan;

-- Grant all privileges on all existing sequences (for SERIAL columns)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA hrms_data TO bhushan;

-- Grant execute on all existing functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA hrms_data TO bhushan;

-- Set default privileges for future tables (so new tables automatically get permissions)
ALTER DEFAULT PRIVILEGES IN SCHEMA hrms_data 
    GRANT ALL PRIVILEGES ON TABLES TO bhushan;

ALTER DEFAULT PRIVILEGES IN SCHEMA hrms_data 
    GRANT ALL PRIVILEGES ON SEQUENCES TO bhushan;

ALTER DEFAULT PRIVILEGES IN SCHEMA hrms_data 
    GRANT EXECUTE ON FUNCTIONS TO bhushan;

-- Optional: If you want to grant CREATE permission (allows user to create new tables)
-- GRANT CREATE ON SCHEMA hrms_data TO bhushan;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if user exists
SELECT usename FROM pg_user WHERE usename = 'bhushan';

-- List all tables user has access to
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type
FROM information_schema.table_privileges 
WHERE grantee = 'bhushan' 
AND table_schema = 'hrms_data'
ORDER BY table_name, privilege_type;

-- List all sequences user has access to
SELECT 
    grantee,
    sequence_schema,
    sequence_name,
    privilege_type
FROM information_schema.usage_privileges
WHERE grantee = 'bhushan'
AND object_schema = 'hrms_data'
ORDER BY sequence_name;

