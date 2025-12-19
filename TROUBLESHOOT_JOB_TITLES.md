# Troubleshooting Job Titles "Not Found" Error

## Quick Fix Steps

### 1. **RESTART THE SERVER** (Most Important!)

The server MUST be restarted after adding new routes:

```powershell
# Stop the server (Ctrl+C in the terminal)
# Then restart:
cd orangehrm/src/server
npm start
```

**Look for this in the console output:**
```
📝 Job Titles API:
   GET    /api/job-titles
   POST   /api/job-titles
   PUT    /api/job-titles/:id
   DELETE /api/job-titles/:id
```

If you DON'T see these lines, the routes aren't loaded!

### 2. Check Server Console

When you try to add a job title, you should see:
```
📨 POST /api/job-titles
📥 POST /api/job-titles received: { title: '...', description: '...' }
```

If you see `📨 POST /api/job-titles` but NOT the second line, the route isn't registered.

### 3. Test the Endpoint Directly

Open a new terminal and test:

```powershell
# Test GET (should work)
curl http://localhost:3001/api/job-titles

# Test POST (should work after restart)
curl -X POST http://localhost:3001/api/job-titles -H "Content-Type: application/json" -d "{\"title\":\"Test\",\"description\":\"Test desc\"}"
```

### 4. Verify Database Table Exists

Run this SQL in pgAdmin:

```sql
SET search_path TO hrms_data, public;
SELECT * FROM job_titles;
```

If you get an error that the table doesn't exist, run:
```sql
CREATE TABLE IF NOT EXISTS hrms_data.job_titles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Check Browser Console

Open browser DevTools (F12) → Console tab
Look for any errors when clicking "Save"

### 6. Check Network Tab

Open browser DevTools (F12) → Network tab
1. Click "Save" on the job title form
2. Look for the request to `/api/job-titles`
3. Check:
   - **Status Code**: Should be 201 (Created) or 400/500 (error), NOT 404
   - **Request Method**: Should be POST
   - **Request URL**: Should be `http://localhost:3001/api/job-titles`
   - **Request Payload**: Should show `{title: "...", description: "..."}`

If you see 404, the server hasn't loaded the route.

## Common Issues

### Issue: "Not Found" (404)
**Cause**: Server not restarted after adding routes
**Fix**: Restart the server (see step 1)

### Issue: "Cannot read property 'rows' of undefined"
**Cause**: Database connection issue or table doesn't exist
**Fix**: Check database connection and table exists (see step 4)

### Issue: "Job title is required" (400)
**Cause**: Frontend not sending title field
**Fix**: Check form data is being sent correctly

### Issue: No error but nothing happens
**Cause**: Frontend not handling response
**Fix**: Check browser console for JavaScript errors

## Still Not Working?

1. **Kill all Node processes:**
   ```powershell
   Get-Process node | Stop-Process -Force
   ```

2. **Restart server:**
   ```powershell
   cd orangehrm/src/server
   npm start
   ```

3. **Hard refresh browser:**
   - Press `Ctrl + Shift + R` (or `Ctrl + F5`)
   - This clears browser cache

4. **Check server logs:**
   - Look for any error messages in the server console
   - Look for the route registration messages

