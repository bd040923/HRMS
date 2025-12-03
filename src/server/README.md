# Arithwise HRM Backend API Server

This is the Node.js/Express backend API server for the Arithwise HRM application.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd orangehrm/src/server
npm install
```

### 2. Configure Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE arithwise_hrm;
```

2. Run the main schema (if not already done):
```bash
psql -U postgres -d arithwise_hrm -f ../../database/schema.sql
```

3. Run the recruitment schema:
```bash
psql -U postgres -d arithwise_hrm -f ../../database/recruitment_schema.sql
```

### 3. Configure Environment Variables

Create a `.env` file in `orangehrm/src/server/`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arithwise_hrm
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
BACKEND_PORT=3001

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080
```

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in `.env`).

## API Endpoints

### Health Check
- `GET /api/health` - Check server and database connectivity

### Job Titles
- `GET /api/job-titles` - Get all job titles

### Vacancies
- `GET /api/vacancies` - Get all vacancies (with optional filters: jobTitle, vacancy, hiringManager, status)
- `GET /api/vacancies/:id` - Get a single vacancy
- `POST /api/vacancies` - Create a new vacancy
- `PUT /api/vacancies/:id` - Update a vacancy
- `DELETE /api/vacancies/:id` - Delete a vacancy

### Candidates
- `GET /api/candidates` - Get all candidates (with optional filters: jobTitle, vacancy, hiringManager, status, candidateName, keywords, dateFrom, dateTo, methodOfApplication)
- `GET /api/candidates/:id` - Get a single candidate
- `POST /api/candidates` - Create a new candidate
- `PUT /api/candidates/:id` - Update a candidate
- `DELETE /api/candidates/:id` - Delete a candidate

### Employees
- `GET /api/employees` - Get all employees (for hiring manager dropdown)

## Database Schema

The recruitment module uses the following tables:
- `job_titles` - Available job positions
- `vacancies` - Open job positions
- `candidates` - Job applicants
- `candidate_vacancies` - Many-to-many relationship between candidates and vacancies

See `orangehrm/database/recruitment_schema.sql` for the complete schema definition.

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure the database exists and schema is loaded

### Port Already in Use
- Change `BACKEND_PORT` in `.env` to a different port
- Or stop the process using port 3001

### CORS Issues
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- Check that CORS middleware is enabled in `server.js`

