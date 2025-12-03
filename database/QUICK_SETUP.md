# Quick Setup Guide for arithwsie_hrms Database

## Database Information
- **Database Name**: `arithwsie_hrms`
- **Schema Name**: `hrms_data`
- **Database User**: `bhushan`

## Step-by-Step Setup

### Step 1: Connect to PostgreSQL
```bash
psql -U postgres -d arithwsie_hrms
```

### Step 2: Run the Complete Schema Script
```bash
psql -U postgres -d arithwsie_hrms -f database/complete_schema_postgresql.sql
```

This will:
- Create the `hrms_data` schema
- Create all tables (users, employees, departments, job_titles, vacancies, candidates, etc.)
- Create all indexes
- Create triggers and functions
- Insert default data
- Grant all permissions to user `bhushan`

### Step 3: Verify Permissions (if needed)
If you need to grant permissions separately, run:
```bash
psql -U postgres -d arithwsie_hrms -f database/permissions_only.sql
```

### Step 4: Update Backend Configuration
Update your `.env` file in `orangehrm/src/server/`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arithwsie_hrms
DB_USER=bhushan
DB_PASSWORD=your_password_here
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:8080
```

**Important**: Also update the backend server.js to use the schema. Add this to your connection pool:

```javascript
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'arithwsie_hrms',
  user: process.env.DB_USER || 'bhushan',
  password: process.env.DB_PASSWORD || '',
  // Add schema to search_path
  options: '-c search_path=hrms_data,public'
});
```

## Verification Queries

### Check if schema exists
```sql
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'hrms_data';
```

### List all tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'hrms_data' 
ORDER BY table_name;
```

### Check user permissions
```sql
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type
FROM information_schema.table_privileges 
WHERE grantee = 'bhushan' 
AND table_schema = 'hrms_data'
ORDER BY table_name;
```

### Test connection as bhushan user
```bash
psql -U bhushan -d arithwsie_hrms
```

Then run:
```sql
SET search_path TO hrms_data, public;
SELECT * FROM users LIMIT 1;
```

## Tables Created

### Core Tables
1. `users` - System users
2. `password_reset_tokens` - Password reset tokens
3. `user_sessions` - User session management
4. `permissions` - System permissions
5. `role_permissions` - Role-permission mapping
6. `departments` - Department information
7. `employees` - Employee records

### Recruitment Module Tables
8. `job_titles` - Available job positions
9. `vacancies` - Open job positions
10. `candidates` - Job applicants
11. `candidate_vacancies` - Candidate-vacancy relationships

## Troubleshooting

### Permission Denied Error
If you get permission errors, make sure:
1. User `bhushan` exists: `SELECT usename FROM pg_user WHERE usename = 'bhushan';`
2. Run the permissions script as postgres superuser
3. Check that schema exists: `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'hrms_data';`

### Schema Not Found Error
Make sure to set the search_path:
```sql
SET search_path TO hrms_data, public;
```

Or update your connection string to include the schema in the search_path.

### Foreign Key Constraint Errors
Make sure tables are created in the correct order:
1. users
2. departments
3. employees
4. job_titles
5. vacancies
6. candidates
7. candidate_vacancies

The complete schema script handles this automatically.

