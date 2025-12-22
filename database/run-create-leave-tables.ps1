# PowerShell script to run CREATE_LEAVE_TABLES.sql
# This script executes the SQL file to create all leave management tables

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating Leave Management Tables" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Database connection parameters
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "arithwise_hrms"
$dbUser = "postgres"  # Run as postgres superuser to grant permissions
$sqlFile = "orangehrm\database\CREATE_LEAVE_TABLES.sql"

# Check if SQL file exists
if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: SQL file not found: $sqlFile" -ForegroundColor Red
    Write-Host "Please make sure you're running this from the HR directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "SQL File: $sqlFile" -ForegroundColor Green
Write-Host "Database: $dbName" -ForegroundColor Green
Write-Host "User: $dbUser" -ForegroundColor Green
Write-Host ""

# Prompt for password
$securePassword = Read-Host "Enter PostgreSQL password for user '$dbUser'" -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

# Get psql path
$psqlPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
if (-not (Test-Path $psqlPath)) {
    # Try common PostgreSQL installation paths
    $possiblePaths = @(
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe",
        "C:\Program Files\PostgreSQL\13\bin\psql.exe",
        "C:\Program Files\PostgreSQL\12\bin\psql.exe"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $psqlPath = $path
            break
        }
    }
    
    if (-not (Test-Path $psqlPath)) {
        Write-Host "ERROR: psql.exe not found. Please install PostgreSQL or provide the path manually." -ForegroundColor Red
        Write-Host "You can also run the SQL file manually in pgAdmin or any PostgreSQL client." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "Using psql: $psqlPath" -ForegroundColor Green
Write-Host ""

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $password

try {
    Write-Host "Executing SQL script..." -ForegroundColor Yellow
    Write-Host ""
    
    # Run the SQL file
    & $psqlPath -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "SUCCESS: Leave tables created!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Tables created:" -ForegroundColor Cyan
        Write-Host "  - leave_types" -ForegroundColor White
        Write-Host "  - holidays" -ForegroundColor White
        Write-Host "  - leave_requests" -ForegroundColor White
        Write-Host "  - leave_entitlements" -ForegroundColor White
        Write-Host ""
        Write-Host "You can now use the Leave Management section!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "ERROR: SQL script execution failed (exit code: $LASTEXITCODE)" -ForegroundColor Red
        Write-Host "Please check the error messages above." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to execute SQL script" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    $env:PGPASSWORD = $null
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green

