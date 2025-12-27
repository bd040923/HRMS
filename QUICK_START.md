# Quick Start Guide - Frontend Not Showing

## ✅ Step-by-Step Fix

### Step 1: Check if Backend is Running

Open PowerShell and run:
```powershell
# Check if port 3001 is in use
netstat -ano | findstr :3001
```

If you see output, the backend is running. If not, continue to Step 2.

### Step 2: Start the Backend Server

```powershell
cd orangehrm\src\server
npm start
```

You should see:
```
✅ .env file loaded
✅ Connected to PostgreSQL database
🚀 Arithwise HRM server running on port 3001
📁 Serving frontend from: [path]
🌐 Frontend: http://localhost:3001
```

### Step 3: Verify Frontend is Built

The frontend should already be built (we did this earlier). If not:

```powershell
cd orangehrm\src\client
npm run build
```

### Step 4: Open in Browser

Once the backend is running, open:
- **Frontend**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

## 🐛 Troubleshooting

### Problem: "Port 3001 already in use"

**Solution:**
```powershell
cd orangehrm\src\server
.\kill-port.ps1
```
Then start the server again.

### Problem: "Frontend dist folder not found"

**Solution:**
```powershell
cd orangehrm\src\client
npm run build
```

### Problem: "Cannot GET /"

**Solution:** 
- Make sure backend is running
- Check that frontend is built in `orangehrm/web/dist/`
- Verify `.env` file exists in `orangehrm/src/server/`

### Problem: Backend starts but shows "Frontend Not Built"

**Solution:**
1. Build the frontend:
   ```powershell
   cd orangehrm\src\client
   npm run build
   ```

2. Restart the backend:
   ```powershell
   cd orangehrm\src\server
   npm start
   ```

## 📋 Quick Checklist

- [ ] Backend server is running (`npm start` in `orangehrm/src/server`)
- [ ] Frontend is built (`npm run build` in `orangehrm/src/client`)
- [ ] Database is connected (check backend console)
- [ ] Port 3001 is available
- [ ] Open http://localhost:3001 in browser

## 🚀 All-in-One Start Script

Run this to start everything:
```powershell
.\START_BOTH.ps1
```

This will:
1. Build frontend if needed
2. Start frontend watch mode (auto-rebuild)
3. Start backend server



