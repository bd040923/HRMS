# Complete fix script - grants permissions and adds missing columns
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Complete Database Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$dbName = "arithwise_hrms"
$dbUser = "postgres"

Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "  1. Grant permissions to user 'bhushan'" -ForegroundColor Gray
Write-Host "  2. Add missing columns to employees table" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Continue? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Step 1: Granting permissions..." -ForegroundColor Cyan
$permissionsSql = @"
GRANT USAGE ON SCHEMA hrms_data TO bhushan;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hrms_data TO bhushan;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA hrms_data TO bhushan;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA hrms_data TO bhushan;
ALTER DEFAULT PRIVILEGES IN SCHEMA hrms_data GRANT ALL PRIVILEGES ON TABLES TO bhushan;
ALTER DEFAULT PRIVILEGES IN SCHEMA hrms_data GRANT ALL PRIVILEGES ON SEQUENCES TO bhushan;
ALTER DEFAULT PRIVILEGES IN SCHEMA hrms_data GRANT EXECUTE ON FUNCTIONS TO bhushan;
"@

$permissionsFile = Join-Path $PSScriptRoot "temp_permissions.sql"
$permissionsSql | Out-File -FilePath $permissionsFile -Encoding utf8

Write-Host "  Running permissions script..." -ForegroundColor Gray
psql -U $dbUser -d $dbName -f $permissionsFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Permissions granted" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Permissions step had issues (check above)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Adding missing columns..." -ForegroundColor Cyan
$columnsFile = Join-Path $PSScriptRoot "add-missing-columns.sql"
if (Test-Path $columnsFile) {
    Write-Host "  Running column migration..." -ForegroundColor Gray
    psql -U $dbUser -d $dbName -f $columnsFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Columns added/verified" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Column step had issues (check above)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  add-missing-columns.sql not found" -ForegroundColor Yellow
}

# Cleanup
Remove-Item $permissionsFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Fix complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Restart your server (or wait for nodemon)" -ForegroundColor Gray
Write-Host "  2. Test endpoints: .\test-endpoints.ps1" -ForegroundColor Gray
Write-Host ""

