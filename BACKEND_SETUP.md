# Backend Setup Guide for Arithwise HRM

This guide will help you set up the PostgreSQL database and Node.js backend API server for the Recruitment module.

## Step 1: Install PostgreSQL

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. PostgreSQL will run as a Windows service automatically

### macOS
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Create Database

Open a terminal/command prompt and run:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE arithwise_hrm;

# Exit psql
\q
```

## Step 3: Load Database Schema

### Load Main Schema (if not already done)
```bash
psql -U postgres -d arithwise_hrm -f database/schema.sql
```

### Load Recruitment Schema
```bash
psql -U postgres -d arithwise_hrm -f database/recruitment_schema.sql
```

## Step 4: Install Backend Dependencies

```bash
cd orangehrm/src/server
npm install
```

## Step 5: Configure Environment Variables

Create a `.env` file in `orangehrm/src/server/`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arithwise_hrm
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:8080
```

Replace `your_postgres_password_here` with your actual PostgreSQL password.

## Step 6: Start the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Arithwise HRM Backend API server running on port 3001
📡 API endpoints available at http://localhost:3001/api
```

## Step 7: Configure Frontend

Create or update `.env` file in `orangehrm/src/client/`:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Step 8: Test the Setup

1. Open your browser and go to `http://localhost:3001/api/health`
   - You should see: `{"status":"ok","database":"connected"}`

2. Start the frontend:
   ```bash
   cd orangehrm/src/client
   npm run serve
   ```

3. Navigate to the Recruitment section in the application
   - You should be able to view, add, edit, and delete candidates and vacancies

## Troubleshooting

### "Connection refused" error
- Make sure PostgreSQL is running
- Check that the port (5432) is correct
- Verify database credentials in `.env`

### "Database does not exist" error
- Run Step 2 to create the database
- Make sure you're using the correct database name

### "Relation does not exist" error
- Run Step 3 to load the database schemas
- Make sure both `schema.sql` and `recruitment_schema.sql` are loaded

### CORS errors in browser
- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that the backend server is running

### Port 3001 already in use
- Change `BACKEND_PORT` in `.env` to a different port (e.g., 3002)
- Update `REACT_APP_API_URL` in frontend `.env` to match

## Next Steps

Once the backend is running:
1. The Recruitment module will automatically connect to the API
2. You can start adding job titles, vacancies, and candidates
3. All data will be stored in PostgreSQL
4. Changes persist across server restarts

