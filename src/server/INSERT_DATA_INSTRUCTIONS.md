# How to Insert Sample Data

Your tables are empty, which is why all APIs return `[]`. Here are two ways to add sample data:

## ✅ Option 1: Node.js Script (Easiest)

Run this command in PowerShell:

```powershell
cd orangehrm/src/server
node insert-sample-data.js
```

This will:
- Insert 8 job titles
- Insert 5 employees
- Insert 3 vacancies
- Insert 4 candidates
- Link candidates to vacancies

## ✅ Option 2: SQL Script (Using pgAdmin/DBeaver)

1. Open your database client (pgAdmin, DBeaver, etc.)
2. Connect to database `arithwise_hrms` as `postgres` user
3. Open the file: `orangehrm/src/server/INSERT_SAMPLE_DATA.sql`
4. Run the entire script
5. Verify the data was inserted

## 🔍 Verify Data Was Inserted

After running either method, test your endpoints:

- http://localhost:3001/api/job-titles
- http://localhost:3001/api/vacancies
- http://localhost:3001/api/candidates
- http://localhost:3001/api/employees

You should now see data instead of empty arrays `[]`.

## 🐛 Troubleshooting

If the Node.js script fails:
1. Make sure your server is not running (or it's fine if it is)
2. Check that `.env` file has correct database credentials
3. Make sure tables exist (run `QUICK_CREATE_TABLES.sql` if needed)

If you get permission errors:
- Run `fix-permissions.sql` as `postgres` user



