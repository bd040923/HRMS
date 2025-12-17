# Quick Fix Guide - Permission Issues

## Problem
Getting "permission denied for table" errors when accessing API endpoints.

## Solution

### Step 1: Grant Permissions

Run this SQL script as the **postgres** superuser:

```powershell
cd orangehrm/src/server
psql -U postgres -d arithwise_hrms -f grant-permissions-simple.sql
```

Or manually in psql:
```sql
-- Connect as postgres
psql -U postgres -d arithwise_hrms

-- Then run:
GRANT USAGE ON SCHEMA hrms_data TO bhushan;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hrms_data TO bhushan;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA hrms_data TO bhushan;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA hrms_data TO bhushan;
```

### Step 2: Add Missing Columns (if employees endpoint fails)

```powershell
psql -U postgres -d arithwise_hrms -f add-missing-columns.sql
```

### Step 3: Verify Permissions

Run your query again:
```sql
SELECT table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'bhushan'
AND table_schema = 'hrms_data';
```

You should see rows for:
- job_titles
- vacancies
- candidates
- employees
- candidate_vacancies
- And other tables in hrms_data

### Step 4: Restart Server

After granting permissions, restart your server (or wait for nodemon auto-restart).

### Step 5: Test Endpoints

```powershell
.\test-endpoints.ps1
```

All endpoints should now work! ✅

