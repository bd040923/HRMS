-- This script creates all tables in hrms_data schema
-- Run this as postgres user: Connect to database 'arithwise_hrms' and run this entire script

-- Set search path
SET search_path TO hrms_data, public;

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS hrms_data;

-- Now run the complete schema file
-- The file is at: orangehrm/database/complete_schema_postgresql.sql
-- You can either:
-- 1. Copy the entire content of that file here, OR
-- 2. Run it directly using: \i path/to/complete_schema_postgresql.sql

