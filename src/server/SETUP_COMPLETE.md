# Complete Setup Guide - Arithwise HRM Backend

## ✅ Quick Start (3 Steps)

### Step 1: Create .env File
Create `.env` file in `orangehrm/src/server/` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arithwise_hrms
DB_USER=bhushan
DB_PASS=your_password_here
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:8080
```

**Important**: Replace `your_password_here` with your actual PostgreSQL password for user `bhushan`.

### Step 2: Install Dependencies (if not done)
```powershell
cd orangehrm/src/server
npm install
```

### Step 3: Start the Server
```powershell
npm run dev
```

You should see:
```
✅ .env file found
✅ Connected to PostgreSQL database (search_path: hrms_data)
🚀 Arithwise HRM Backend API server running on port 3001
```

## 🔍 Verification

### Run Setup Verification
```powershell
.\verify-setup.ps1
```

This will check:
- ✅ .env file exists and is configured
- ✅ Node.js and npm are installed
- ✅ All dependencies are installed
- ✅ Server is running
- ✅ Database connection is working

### Test All API Endpoints
```powershell
.\test-api.ps1
```

Or test manually in browser:
- `http://localhost:3001/` - Root endpoint (shows all APIs)
- `http://localhost:3001/api/health` - Health check
- `http://localhost:3001/api/diagnostic` - Database diagnostic
- `http://localhost:3001/api/test` - Connectivity test
- `http://localhost:3001/api/job-titles` - Get job titles
- `http://localhost:3001/api/vacancies` - Get vacancies
- `http://localhost:3001/api/candidates` - Get candidates
- `http://localhost:3001/api/employees` - Get employees

## 📋 API Endpoints Reference

### Health & Diagnostic
- `GET /` - Root endpoint (shows available APIs)
- `GET /api/health` - Health check with database status
- `GET /api/diagnostic` - Detailed database diagnostic
- `GET /api/test` - Simple connectivity test

### Job Titles
- `GET /api/job-titles` - Get all job titles

### Vacancies
- `GET /api/vacancies` - Get all vacancies (with filters: jobTitle, vacancy, hiringManager, status)
- `GET /api/vacancies/:id` - Get single vacancy
- `POST /api/vacancies` - Create vacancy
- `PUT /api/vacancies/:id` - Update vacancy
- `DELETE /api/vacancies/:id` - Delete vacancy

### Candidates
- `GET /api/candidates` - Get all candidates (with filters)
- `GET /api/candidates/:id` - Get single candidate
- `POST /api/candidates` - Create candidate
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees?view=compact` - Get employees (compact for dropdowns)
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

## 🗄️ Database Configuration

### Current Setup
- **Database**: `arithwise_hrms`
- **Schema**: `hrms_data`
- **User**: `bhushan`
- **Port**: `5432`

### Schema Setup
The server automatically sets `search_path` to `hrms_data, public` for all queries, so all tables in the `hrms_data` schema are accessible.

### Verify Database
```sql
-- Connect to database
psql -U bhushan -d arithwise_hrms

-- Check schema
SET search_path TO hrms_data, public;

-- List tables
\dt hrms_data.*

-- Check table counts
SELECT table_name, 
       (SELECT COUNT(*) FROM hrms_data.job_titles) as job_titles_count,
       (SELECT COUNT(*) FROM hrms_data.vacancies) as vacancies_count,
       (SELECT COUNT(*) FROM hrms_data.candidates) as candidates_count,
       (SELECT COUNT(*) FROM hrms_data.employees) as employees_count;
```

## 🛠️ Troubleshooting

### Port Already in Use
```powershell
.\kill-port.ps1
```

### Database Connection Failed
1. Check PostgreSQL is running: `pg_isready`
2. Verify credentials in `.env` file
3. Test connection: `psql -U bhushan -d arithwise_hrms`
4. Check if schema exists: `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'hrms_data';`

### "Cannot GET" Errors
1. Make sure server is running: `npm run dev`
2. Check server console for errors
3. Verify `.env` file exists and is configured
4. Test health endpoint: `http://localhost:3001/api/health`

### No Data Showing
1. Check diagnostic endpoint: `http://localhost:3001/api/diagnostic`
2. Verify tables exist in `hrms_data` schema
3. Check if data exists in tables
4. Verify `search_path` is set correctly (server does this automatically)

## 📁 File Structure

```
orangehrm/src/server/
├── .env                    # Environment variables (create this)
├── .env.template          # Template for .env file
├── server.js              # Main server file
├── package.json           # Dependencies
├── verify-setup.ps1       # Setup verification script
├── test-api.ps1           # API testing script
├── kill-port.ps1          # Port cleanup script
├── create-env.ps1         # Interactive .env creation
├── SETUP_COMPLETE.md      # This file
├── QUICK_START.md         # Quick start guide
└── README.md              # General documentation
```

## ✅ Success Indicators

When everything is working correctly, you should see:

1. **Server Console**:
   ```
   ✅ .env file found at: [path]
   ✅ Environment variables loaded: { DB_HOST: '✓ Set', ... }
   ✅ Connected to PostgreSQL database (search_path: hrms_data)
   🚀 Arithwise HRM Backend API server running on port 3001
   ```

2. **Health Check** (`/api/health`):
   ```json
   {
     "status": "ok",
     "database": "connected",
     "schema": "hrms_data",
     "tables_found": 11,
     "table_access": true
   }
   ```

3. **Diagnostic** (`/api/diagnostic`):
   ```json
   {
     "connection": true,
     "schema_exists": true,
     "tables": ["job_titles", "vacancies", "candidates", "employees", ...],
     "table_counts": { "job_titles": 5, "vacancies": 10, ... }
   }
   ```

## 🚀 Next Steps

1. ✅ Backend is running and connected to database
2. ✅ All API endpoints are accessible
3. 🔄 Start frontend and connect to backend
4. 🔄 Test full application workflow

## 📞 Support

If you encounter issues:
1. Run `.\verify-setup.ps1` to check setup
2. Check server console for error messages
3. Test individual endpoints
4. Verify database connection manually

---

**Setup Complete!** Your backend is ready to use. 🎉

