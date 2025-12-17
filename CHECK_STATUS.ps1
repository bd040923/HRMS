# Quick status check script
Write-Host "🔍 Checking Arithwise HRM Status..." -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "1. Checking backend server..." -ForegroundColor Yellow
$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Backend is running on port 3001" -ForegroundColor Green
        $backendRunning = $true
        $healthData = $response.Content | ConvertFrom-Json
        Write-Host "   Database: $($healthData.database)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Backend is NOT running on port 3001" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# Check if frontend is built
Write-Host "2. Checking frontend build..." -ForegroundColor Yellow
$frontendPath = "orangehrm\web\dist\index.html"
if (Test-Path $frontendPath) {
    Write-Host "   ✅ Frontend is built" -ForegroundColor Green
    Write-Host "   Location: $frontendPath" -ForegroundColor Gray
} else {
    Write-Host "   ❌ Frontend is NOT built" -ForegroundColor Red
    Write-Host "   Run: cd orangehrm\src\client && npm run build" -ForegroundColor Gray
}

Write-Host ""

# Check port usage
Write-Host "3. Checking port 3001..." -ForegroundColor Yellow
$portCheck = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($portCheck) {
    $process = Get-Process -Id $portCheck.OwningProcess -ErrorAction SilentlyContinue
    Write-Host "   Port 3001 is in use by: $($process.ProcessName) (PID: $($portCheck.OwningProcess))" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  Port 3001 is not in use" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
if ($backendRunning) {
    Write-Host "   ✅ Backend: Running" -ForegroundColor Green
    Write-Host "   🌐 Open: http://localhost:3001" -ForegroundColor Cyan
} else {
    Write-Host "   ❌ Backend: Not running" -ForegroundColor Red
    Write-Host "   💡 Start with: cd orangehrm\src\server && npm start" -ForegroundColor Yellow
}

if (Test-Path $frontendPath) {
    Write-Host "   ✅ Frontend: Built" -ForegroundColor Green
} else {
    Write-Host "   ❌ Frontend: Not built" -ForegroundColor Red
    Write-Host "   💡 Build with: cd orangehrm\src\client && npm run build" -ForegroundColor Yellow
}

