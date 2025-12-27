# PowerShell script to grant database permissions
# This will connect to PostgreSQL and grant permissions to user bhushan

Write-Host "Granting database permissions to user 'bhushan'..." -ForegroundColor Cyan
Write-Host ""

$dbName = "arithwise_hrms"
$dbUser = "postgres"
$targetUser = "bhushan"

Write-Host "You will be prompted for the postgres password." -ForegroundColor Yellow
Write-Host ""

$sqlCommands = @"
GRANT USAGE ON SCHEMA hrms_data TO $targetUser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hrms_data TO $targetUser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA hrms_data TO $targetUser;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA hrms_data TO $targetUser;

ALTER DEFAULT PRIVILEGES IN SCHEMA hrms_data 
    GRANT ALL PRIVILEGES ON TABLES TO $targetUser;
    
ALTER DEFAULT PRIVILEGES IN SCHEMA hrms_data 
    GRANT ALL PRIVILEGES ON SEQUENCES TO $targetUser;
    
ALTER DEFAULT PRIVILEGES IN SCHEMA hrms_data 
    GRANT EXECUTE ON FUNCTIONS TO $targetUser;
"@

# Save SQL to temp file
$tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
$sqlCommands | Out-File -FilePath $tempFile -Encoding utf8

Write-Host "Running SQL commands..." -ForegroundColor Yellow
Write-Host ""

# Execute using psql
$env:PGPASSWORD = Read-Host "Enter postgres password" -AsSecureString
$plainPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($env:PGPASSWORD)
)
$env:PGPASSWORD = $plainPass

psql -U $dbUser -d $dbName -f $tempFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Permissions granted successfully!" -ForegroundColor Green
    Write-Host "   User '$targetUser' now has access to all tables in hrms_data schema" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Error granting permissions" -ForegroundColor Red
    Write-Host "   Check the error message above" -ForegroundColor Yellow
}

# Clean up
Remove-Item $tempFile -ErrorAction SilentlyContinue
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "Restart your server and test the endpoints again." -ForegroundColor Cyan



