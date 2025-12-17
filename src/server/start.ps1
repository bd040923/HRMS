# Quick start script for Arithwise HRM Backend
# This script checks setup and starts the server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Arithwise HRM Backend - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
$envPath = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creating .env file from template..." -ForegroundColor Cyan
    
    $envTemplate = @"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arithwise_hrms
DB_USER=bhushan
DB_PASS=your_password_here
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:8080
"@
    
    $envTemplate | Out-File -FilePath $envPath -Encoding utf8 -NoNewline
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env file and set your DB_PASS!" -ForegroundColor Red
    Write-Host "   File location: $envPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key to open .env file in notepad, or Ctrl+C to cancel..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    notepad $envPath
    Write-Host ""
    Write-Host "After saving .env file, run this script again." -ForegroundColor Yellow
    exit
}

# Check if node_modules exists
$nodeModulesPath = Join-Path $PSScriptRoot "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
    Write-Host ""
}

# Check if port is in use
Write-Host "Checking port 3001..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  Port 3001 is already in use" -ForegroundColor Yellow
    Write-Host "   Run .\kill-port.ps1 to free the port" -ForegroundColor Cyan
    Write-Host ""
    $kill = Read-Host "Kill process using port 3001? (y/N)"
    if ($kill -eq 'y' -or $kill -eq 'Y') {
        .\kill-port.ps1
        Start-Sleep -Seconds 2
    } else {
        Write-Host "Exiting. Please free port 3001 first." -ForegroundColor Yellow
        exit
    }
}

Write-Host "✅ All checks passed!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting server..." -ForegroundColor Cyan
Write-Host ""

# Start the server
npm run dev

