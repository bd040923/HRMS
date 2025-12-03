# Database Setup Summary for arithwsie_hrms

## Database Configuration
- **Database Name**: `arithwsie_hrms`
- **Schema Name**: `hrms_data`
- **Database User**: `bhushan`

## Files Created

### 1. `complete_schema_postgresql.sql`
Complete SQL script that:
- Creates the `hrms_data` schema
- Creates all 11 tables
- Creates all indexes
- Creates triggers and functions
- Inserts default data
- Grants all permissions to user `bhushan`

**Usage:**
```bash
psql -U postgres -d arithwsie_hrms -f database/complete_schema_postgresql.sql
```

### 2. `permissions_only.sql`
Standalone permissions script if you need to grant permissions separately.

**Usage:**
```bash
psql -U postgres -d arithwsie_hrms -f database/permissions_only.sql
```

## Tables Created

### Core HRMS Tables
1. **users** - System users and authentication
2. **password_reset_tokens** - Password reset functionality
3. **user_sessions** - Session management
4. **permissions** - System permissions
5. **role_permissions** - Role-permission mappings
6. **departments** - Department information
7. **employees** - Employee records

### Recruitment Module Tables
8. **job_titles** - Available job positions
9. **vacancies** - Open job positions
10. **candidates** - Job applicants
11. **candidate_vacancies** - Many-to-many relationship between candidates and vacancies

## Quick Setup Commands

### 1. Create Database (if not exists)
```sql
CREATE DATABASE arithwsie_hrms;
```

### 2. Run Complete Schema
```bash
psql -U postgres -d arithwsie_hrms -f database/complete_schema_postgresql.sql
```

### 2.1 Apply Latest Migrations (if upgrading)
```bash
psql -U postgres -d arithwsie_hrms -f database/migrations/2025-02-12-add-employee-attributes.sql
```

### 3. Verify Setup
```sql
-- Connect to database
psql -U bhushan -d arithwsie_hrms

-- Set schema
SET search_path TO hrms_data, public;

-- Check tables
\dt hrms_data.*

-- Check permissions
SELECT table_name, privilege_type 
FROM information_schema.table_privileges 
WHERE grantee = 'bhushan' AND table_schema = 'hrms_data';
```

## Backend Configuration

Update `orangehrm/src/server/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arithwsie_hrms
DB_USER=bhushan
DB_PASSWORD=your_password_here
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:8080
```

The backend server.js has been updated to:
- Use `arithwsie_hrms` as default database
- Use `bhushan` as default user
- Set `search_path=hrms_data,public` in connection options

## Permission Queries Summary

All permissions are granted in `complete_schema_postgresql.sql`, but here's what's granted:

```sql
-- Schema usage
GRANT USAGE ON SCHEMA hrms_data TO bhushan;

-- All tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hrms_data TO bhushan;

-- All sequences (for SERIAL columns)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA hrms_data TO bhushan;

-- All functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA hrms_data TO bhushan;

-- Future tables (default privileges)
ALTER DEFAULT PRIVILEGES IN SCHEMA hrms_data 
    GRANT ALL PRIVILEGES ON TABLES TO bhushan;
ALTER DEFAULT PRIVILEGES IN SCHEMA hrms_data 
    GRANT ALL PRIVILEGES ON SEQUENCES TO bhushan;
ALTER DEFAULT PRIVILEGES IN SCHEMA hrms_data 
    GRANT EXECUTE ON FUNCTIONS TO bhushan;
```

## Verification Checklist

- [ ] Database `arithwsie_hrms` exists
- [ ] Schema `hrms_data` exists
- [ ] User `bhushan` exists
- [ ] All 11 tables created
- [ ] All indexes created
- [ ] Triggers and functions created
- [ ] Permissions granted to `bhushan`
- [ ] Can connect as `bhushan` user
- [ ] Can query tables (e.g., `SELECT * FROM hrms_data.users;`)
- [ ] Backend `.env` configured correctly
- [ ] Backend server connects successfully

## Troubleshooting

### Error: "schema hrms_data does not exist"
Run: `CREATE SCHEMA IF NOT EXISTS hrms_data;`

### Error: "permission denied for schema hrms_data"
Run the permissions script as postgres superuser:
```bash
psql -U postgres -d arithwsie_hrms -f database/permissions_only.sql
```

### Error: "relation does not exist"
Make sure search_path is set:
```sql
SET search_path TO hrms_data, public;
```

Or check if tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'hrms_data';
```

### Backend Connection Issues
1. Verify database credentials in `.env`
2. Check PostgreSQL is running: `pg_isready`
3. Test connection: `psql -U bhushan -d arithwsie_hrms`
4. Verify schema exists: `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'hrms_data';`

## Next Steps

1. Run the complete schema script
2. Verify all tables are created
3. Update backend `.env` file
4. Start backend server: `cd orangehrm/src/server && npm run dev`
5. Test API endpoints: `http://localhost:3001/api/health`
6. Start frontend and test Recruitment module

