# PowerShell script to verify and create organization_structure table
# Run this script from the HR directory

$ErrorActionPreference = "Stop"

Write-Host "`n🔍 Verifying Organization Structure Table..." -ForegroundColor Cyan

# Database connection details
$dbName = "arithwise_hrms"
$dbUser = "postgres"  # Run as postgres user to ensure permissions

# Path to SQL file
$sqlFile = "orangehrm\database\VERIFY_AND_CREATE_STRUCTURE_TABLE.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "📄 SQL file found: $sqlFile" -ForegroundColor Green

# Get PostgreSQL installation path (common locations)
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe",
    "C:\Program Files\PostgreSQL\12\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        break
    }
}

if (-not $psqlPath) {
    Write-Host "`n❌ PostgreSQL psql.exe not found in common locations." -ForegroundColor Red
    Write-Host "   Please run the SQL file manually in pgAdmin:" -ForegroundColor Yellow
    Write-Host "   1. Open pgAdmin" -ForegroundColor Yellow
    Write-Host "   2. Connect to your PostgreSQL server" -ForegroundColor Yellow
    Write-Host "   3. Right-click on 'arithwise_hrms' database → Query Tool" -ForegroundColor Yellow
    Write-Host "   4. Open file: $sqlFile" -ForegroundColor Yellow
    Write-Host "   5. Execute (F5)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found psql at: $psqlPath" -ForegroundColor Green
Write-Host "`n📝 Running SQL script..." -ForegroundColor Cyan

# Read SQL content
$sqlContent = Get-Content -Path $sqlFile -Raw

# Execute SQL
try {
    $env:PGPASSWORD = Read-Host "Enter PostgreSQL password for user '$dbUser'" -AsSecureString | ConvertFrom-SecureString -AsPlainText
    
    $result = & $psqlPath -U $dbUser -d $dbName -c $sqlContent 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ SQL script executed successfully!" -ForegroundColor Green
        Write-Host $result
    } else {
        Write-Host "`n❌ Error executing SQL script:" -ForegroundColor Red
        Write-Host $result
        exit 1
    }
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = $null
}

Write-Host "`n✅ Done! The organization_structure table should now exist." -ForegroundColor Green
Write-Host "   Please restart your Node.js server for changes to take effect." -ForegroundColor Yellow

