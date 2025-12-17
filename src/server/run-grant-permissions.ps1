# Simple script to run the GRANT permissions SQL
Write-Host "Granting database permissions..." -ForegroundColor Cyan
Write-Host ""

$dbName = "arithwise_hrms"
$dbUser = "postgres"
$sqlFile = Join-Path $PSScriptRoot "GRANT_PERMISSIONS_NOW.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Running SQL script as user: $dbUser" -ForegroundColor Yellow
Write-Host "Database: $dbName" -ForegroundColor Yellow
Write-Host ""
Write-Host "You will be prompted for the postgres password." -ForegroundColor Cyan
Write-Host ""

psql -U $dbUser -d $dbName -f $sqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Permissions granted successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Restart your server (or wait for nodemon)" -ForegroundColor Gray
    Write-Host "  2. Test: http://localhost:3001/api/job-titles" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Error running script. Check the error above." -ForegroundColor Red
}

