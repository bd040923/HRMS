# PowerShell script to create .env file for Arithwise HRM Backend
# Run this script from the orangehrm/src/server directory

Write-Host "Creating .env file for Arithwise HRM Backend..." -ForegroundColor Green
Write-Host ""

$envPath = Join-Path $PSScriptRoot ".env"

if (Test-Path $envPath) {
    Write-Host "⚠️  .env file already exists at: $envPath" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne 'y' -and $overwrite -ne 'Y') {
        Write-Host "Skipping .env file creation." -ForegroundColor Yellow
        exit
    }
}

Write-Host "Please provide your PostgreSQL configuration:" -ForegroundColor Cyan
Write-Host ""

$dbHost = Read-Host "Database Host [localhost]"
if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }

$dbPort = Read-Host "Database Port [5432]"
if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }

$dbName = Read-Host "Database Name [arithwise_hrm]"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "arithwise_hrm" }

$dbUser = Read-Host "Database User [postgres]"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }

$dbPass = Read-Host "Database Password" -AsSecureString
$dbPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPass)
)

$backendPort = Read-Host "Backend Port [3001]"
if ([string]::IsNullOrWhiteSpace($backendPort)) { $backendPort = "3001" }

$frontendUrl = Read-Host "Frontend URL [http://localhost:8080]"
if ([string]::IsNullOrWhiteSpace($frontendUrl)) { $frontendUrl = "http://localhost:8080" }

$envContent = @"
# Arithwise HRM Backend Environment Configuration
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Database Configuration (PostgreSQL)
DB_HOST=$dbHost
DB_PORT=$dbPort
DB_NAME=$dbName
DB_USER=$dbUser
DB_PASS=$dbPassPlain

# Server Configuration
BACKEND_PORT=$backendPort

# Frontend URL (for CORS)
FRONTEND_URL=$frontendUrl
"@

$envContent | Out-File -FilePath $envPath -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✅ .env file created successfully at: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Database: $dbName@$dbHost:$dbPort"
Write-Host "  User: $dbUser"
Write-Host "  Backend Port: $backendPort"
Write-Host ""
Write-Host "You can now start the server with: npm run dev" -ForegroundColor Green

