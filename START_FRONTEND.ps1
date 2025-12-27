# Start Frontend - Simple Script
Write-Host "🚀 Starting Arithwise HRM Frontend..." -ForegroundColor Cyan
Write-Host ""

# Check if frontend is built
$frontendPath = "orangehrm\web\dist\index.html"
if (-not (Test-Path $frontendPath)) {
    Write-Host "⚠️  Frontend not built. Building now..." -ForegroundColor Yellow
    Set-Location "orangehrm\src\client"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    Set-Location "..\..\.."
    Write-Host "✅ Frontend built!" -ForegroundColor Green
    Write-Host ""
}

# Check if backend is running
Write-Host "Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Backend is already running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Open your browser and go to: http://localhost:3001" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key to open in browser, or Ctrl+C to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Start-Process "http://localhost:3001"
} catch {
    Write-Host "⚠️  Backend is not running. Starting it now..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check if .env exists
    if (-not (Test-Path "orangehrm\src\server\.env")) {
        Write-Host "❌ .env file not found in orangehrm\src\server\" -ForegroundColor Red
        Write-Host "   Please create it first!" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Starting backend server..." -ForegroundColor Cyan
    Write-Host "   (This will open in a new window)" -ForegroundColor Gray
    Write-Host ""
    
    # Start backend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\orangehrm\src\server'; Write-Host '🚀 Starting Backend Server...' -ForegroundColor Green; npm start"
    
    Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Wait for server to be ready
    $maxAttempts = 12
    $attempt = 0
    $serverReady = $false
    
    while ($attempt -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            $serverReady = $true
            break
        } catch {
            $attempt++
            Write-Host "   Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
            Start-Sleep -Seconds 2
        }
    }
    
    if ($serverReady) {
        Write-Host ""
        Write-Host "✅ Backend server is ready!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Opening frontend in browser..." -ForegroundColor Cyan
        Start-Sleep -Seconds 1
        Start-Process "http://localhost:3001"
        Write-Host ""
        Write-Host "✅ Frontend should now be open in your browser!" -ForegroundColor Green
        Write-Host "   URL: http://localhost:3001" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "❌ Server did not start in time." -ForegroundColor Red
        Write-Host "   Check the backend window for errors." -ForegroundColor Yellow
        Write-Host "   Or start manually: cd orangehrm\src\server && npm start" -ForegroundColor Yellow
    }
}



