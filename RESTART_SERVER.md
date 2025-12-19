# Restart Server to Fix "Not Found" Error

## The Issue
After adding new API endpoints, the server needs to be restarted to load them.

## Solution

### Option 1: Restart the Server (Recommended)

1. **Stop the current server:**
   - If running in terminal, press `Ctrl + C`
   - Or close the terminal window

2. **Start the server again:**
   ```powershell
   cd orangehrm/src/server
   npm start
   ```
   Or if using nodemon:
   ```powershell
   cd orangehrm/src/server
   npm run dev
   ```

### Option 2: Check if Server is Running

If you're not sure if the server is running:

```powershell
# Check if port 3001 is in use
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

# If it shows a connection, the server is running
# If not, start the server
```

### Option 3: Kill and Restart

If the server won't stop:

```powershell
# Kill process on port 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force

# Then restart
cd orangehrm/src/server
npm start
```

## After Restarting

1. The server should show: `🚀 Arithwise HRM server running on port 3001`
2. Try adding a job title again
3. The error should be resolved

## Verify Routes are Loaded

You can check if the routes are loaded by visiting:
- `http://localhost:3001/api/health` - Should return success
- `http://localhost:3001/api/job-titles` - Should return job titles (empty array if no data)

