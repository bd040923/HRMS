# Script to start both frontend (watch mode) and backend on same port
# Frontend will auto-rebuild on changes, backend serves the built files

Write-Host "🚀 Starting Arithwise HRM (Frontend + Backend on Port 3001)" -ForegroundColor Cyan
Write-Host ""

# Check if frontend is built
$frontendDist = "orangehrm\web\dist"
if (-not (Test-Path $frontendDist)) {
    Write-Host "⚠️  Frontend not built yet. Building now..." -ForegroundColor Yellow
    Write-Host ""
    Set-Location "orangehrm\src\client"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend build failed!" -ForegroundColor Red
        exit 1
    }
    Set-Location "..\..\.."
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
    Write-Host ""
}

# Start frontend in watch mode (rebuilds on changes)
Write-Host "📦 Starting frontend watch mode (auto-rebuild)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd orangehrm\src\client; Write-Host 'Frontend Watch Mode - Auto-rebuilding on changes...' -ForegroundColor Green; npm run dev"

# Wait a bit for frontend to start building
Start-Sleep -Seconds 3

# Start backend (serves frontend)
Write-Host "🔧 Starting backend server..." -ForegroundColor Cyan
Set-Location "orangehrm\src\server"
npm start



