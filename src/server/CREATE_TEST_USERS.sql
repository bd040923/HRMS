-- Create test users for authentication
-- Run this as 'postgres' user in database 'arithwise_hrms'

SET search_path TO hrms_data, public;

-- Create admin user
INSERT INTO hrms_data.users (username, email, password_hash, first_name, last_name, role, status)
VALUES (
    'admin',
    'admin@arithwise.com',
    'Admin@123',  -- In production, this should be a bcrypt hash
    'Admin',
    'User',
    'admin',
    'active'
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- Create regular user
INSERT INTO hrms_data.users (username, email, password_hash, first_name, last_name, role, status)
VALUES (
    'user',
    'user@arithwise.com',
    'User@123',  -- In production, this should be a bcrypt hash
    'Regular',
    'User',
    'user',
    'active'
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- Create manager user
INSERT INTO hrms_data.users (username, email, password_hash, first_name, last_name, role, status)
VALUES (
    'manager',
    'manager@arithwise.com',
    'Manager@123',  -- In production, this should be a bcrypt hash
    'Manager',
    'User',
    'manager',
    'active'
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- Verify users were created
SELECT id, username, email, first_name, last_name, role, status 
FROM hrms_data.users 
ORDER BY role, username;

