# Frontend Files Location

## 📁 Where are the frontend files?

The frontend files are located at:
```
orangehrm/web/dist/
```

### Files Structure:
```
orangehrm/web/dist/
├── index.html                    # Main HTML file
└── js/
    ├── vendors.80c64a63d3506f1156a7.js    # Vendor libraries
    ├── main.5a91e2e053e4bf4381e6.js       # Main application code
    └── *.map files                         # Source maps (for debugging)
```

## 🔧 How the Backend Serves Frontend

The backend server (`orangehrm/src/server/server.js`) is configured to:
1. Serve static files from: `orangehrm/web/dist/`
2. Serve `index.html` for all non-API routes
3. Run on port **3001**

## 🌐 Accessing the Frontend

Once the backend is running, open:
- **Frontend**: http://localhost:3001
- **API**: http://localhost:3001/api

## 🚀 To See the Frontend

### Step 1: Make sure backend is running
```powershell
cd orangehrm\src\server
npm start
```

You should see:
```
📁 Serving frontend from: [path to orangehrm/web/dist]
🚀 Arithwise HRM server running on port 3001
🌐 Frontend: http://localhost:3001
```

### Step 2: Open browser
Go to: **http://localhost:3001**

### Step 3: If you see a blank page
1. Open browser Developer Tools (F12)
2. Check **Console** tab for JavaScript errors
3. Check **Network** tab to see if files are loading
4. Look for errors like:
   - "Failed to load resource"
   - "404 Not Found"
   - CORS errors

## 🔍 Verify Frontend Files

Run this to check if files exist:
```powershell
Test-Path "orangehrm\web\dist\index.html"
```

Should return: `True`

## 📝 Rebuild Frontend (if needed)

If you need to rebuild the frontend:
```powershell
cd orangehrm\src\client
npm run build
```

This will create/update files in `orangehrm/web/dist/`

## ⚠️ Common Issues

### Issue: "Cannot GET /"
**Solution**: Backend is not running. Start it with `npm start` in `orangehrm/src/server`

### Issue: Blank page with "Loading..."
**Solution**: 
- Check browser console for errors
- Verify JavaScript files are loading (Network tab)
- Make sure backend is serving static files correctly

### Issue: 404 for JS files
**Solution**: 
- Rebuild frontend: `cd orangehrm/src/client && npm run build`
- Check that files exist in `orangehrm/web/dist/js/`
- Restart backend server

### Issue: Frontend shows but API calls fail
**Solution**: 
- Check API endpoint: http://localhost:3001/api/health
- Verify backend is running
- Check CORS settings in backend



