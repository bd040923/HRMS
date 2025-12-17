# Quick Start Guide - Fixing "Cannot GET" Errors

## Problem
If you're seeing "Cannot GET /api/..." errors, it usually means:
1. The server isn't running
2. You're accessing the wrong URL
3. The .env file is missing or misconfigured

## Solution Steps

### Step 1: Create .env File
Create a `.env` file in `orangehrm/src/server/` with the following content:

```env
# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arithwise_hrm
DB_USER=postgres
DB_PASS=your_postgres_password_here

# Server Configuration
BACKEND_PORT=3001

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080
```

**Important**: Replace `your_postgres_password_here` with your actual PostgreSQL password.

### Step 2: Kill Any Process Using Port 3001
If port 3001 is already in use, run:
```powershell
.\kill-port.ps1
```

Or manually:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

### Step 3: Start the Server
```powershell
cd orangehrm/src/server
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database (search_path: hrms_data)
🚀 Arithwise HRM Backend API server running on port 3001
📡 API endpoints available at http://localhost:3001/api
```

### Step 4: Test the API

#### Test Root Endpoint
Open in browser: `http://localhost:3001/`
- Should show available API endpoints

#### Test Health Check
Open in browser: `http://localhost:3001/api/health`
- Should show: `{"status":"ok","database":"connected",...}`

#### Test Diagnostic Endpoint
Open in browser: `http://localhost:3001/api/diagnostic`
- Shows database schema, tables, and row counts

#### Test API Endpoints
- `http://localhost:3001/api/test` - Simple connectivity test
- `http://localhost:3001/api/job-titles` - Get job titles
- `http://localhost:3001/api/vacancies` - Get vacancies
- `http://localhost:3001/api/candidates` - Get candidates
- `http://localhost:3001/api/employees` - Get employees

## Common Issues

### "Cannot GET /"
- **Cause**: Server isn't running or wrong URL
- **Fix**: Make sure server is running on port 3001

### "Cannot GET /api/..."
- **Cause**: Route doesn't exist or server error
- **Fix**: Check server console for errors

### Database Connection Errors
- **Cause**: Missing or incorrect .env file
- **Fix**: Create .env file with correct database credentials

### Port Already in Use
- **Cause**: Another process is using port 3001
- **Fix**: Run `.\kill-port.ps1` or change BACKEND_PORT in .env

## API Endpoints Reference

All endpoints are prefixed with `/api/`:

- `GET /` - Root endpoint (shows available APIs)
- `GET /api/health` - Health check
- `GET /api/diagnostic` - Database diagnostic
- `GET /api/test` - Connectivity test
- `GET /api/job-titles` - Get all job titles
- `GET /api/vacancies` - Get all vacancies
- `GET /api/candidates` - Get all candidates
- `GET /api/employees` - Get all employees

For full API documentation, see `README.md`.

