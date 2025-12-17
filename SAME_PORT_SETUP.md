# Running Frontend and Backend on Same Port (3001)

Both frontend and backend now run on **port 3001**. The backend serves the frontend static files.

## 🚀 Quick Start

### Option 1: Production Mode (Recommended)

1. **Build the frontend:**
   ```powershell
   cd orangehrm/src/client
   npm run build
   ```

2. **Start the backend (serves frontend automatically):**
   ```powershell
   cd orangehrm/src/server
   npm start
   ```

3. **Open browser:**
   - Frontend: http://localhost:3001
   - API: http://localhost:3001/api

### Option 2: Development Mode (Auto-rebuild)

1. **Terminal 1 - Watch and rebuild frontend:**
   ```powershell
   cd orangehrm/src/client
   npm run dev
   ```
   This watches for changes and rebuilds automatically.

2. **Terminal 2 - Start backend:**
   ```powershell
   cd orangehrm/src/server
   npm start
   ```

3. **Refresh browser** after frontend rebuilds.

## 📁 File Structure

- Frontend build output: `orangehrm/web/dist/`
- Backend serves from: `orangehrm/web/dist/`
- API endpoints: `http://localhost:3001/api/*`

## 🔧 Configuration

### Frontend API Configuration

The frontend now uses **relative URLs** (`/api`) instead of absolute URLs, so it works on the same port:

```typescript
// orangehrm/src/client/src/services/api.ts
const API_BASE_URL = '/api';  // Relative URL
```

### Backend Static File Serving

The backend automatically serves frontend files if they exist:

```javascript
// orangehrm/src/server/server.js
// Serves static files from: orangehrm/web/dist/
// Falls back to API-only if frontend not built
```

## 🐛 Troubleshooting

### Frontend shows "Frontend Not Built"

**Solution:** Build the frontend:
```powershell
cd orangehrm/src/client
npm run build
```

### Port 3001 already in use

**Solution:** Kill the process using port 3001:
```powershell
cd orangehrm/src/server
.\kill-port.ps1
```

### Changes not reflecting

1. **Development:** Run `npm run dev` in frontend directory (watch mode)
2. **Production:** Rebuild after changes: `npm run build`

### API calls failing

- Check that backend is running: http://localhost:3001/api/health
- Check browser console for CORS errors
- Verify API base URL is `/api` (relative)

## 📝 Notes

- **Development:** Use `npm run dev` for auto-rebuild on file changes
- **Production:** Use `npm run build` for optimized production build
- **Same Port:** Both frontend and backend run on port 3001
- **API Routes:** All `/api/*` requests go to backend
- **Frontend Routes:** All other routes serve `index.html` (React Router)

