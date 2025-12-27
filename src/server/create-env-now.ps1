# IMMEDIATE .env file creation with your actual values
# This will create/update the .env file RIGHT NOW

$envPath = Join-Path $PSScriptRoot ".env"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating .env File - IMMEDIATE FIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get your actual password
Write-Host "Enter your PostgreSQL password for user 'bhushan':" -ForegroundColor Yellow
$securePass = Read-Host -AsSecureString
$plainPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
)

if ([string]::IsNullOrWhiteSpace($plainPass)) {
    Write-Host "❌ Password cannot be empty!" -ForegroundColor Red
    exit 1
}

# Create .env file with actual values
$envContent = @"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arithwise_hrms
DB_USER=bhushan
DB_PASS=$plainPass
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:8080
"@

$envContent | Out-File -FilePath $envPath -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✅ .env file created/updated at: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Database: arithwise_hrms" -ForegroundColor Gray
Write-Host "  User: bhushan" -ForegroundColor Gray
Write-Host "  Password: *** Set ($($plainPass.Length) characters)" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ You can now start the server!" -ForegroundColor Green
Write-Host "   Run: npm run dev" -ForegroundColor Cyan



