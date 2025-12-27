# Script to create all database tables
# This will run the complete schema SQL file

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating Database Tables" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$dbName = "arithwise_hrms"
$dbUser = "postgres"
$schemaFile = Join-Path $PSScriptRoot "..\..\database\complete_schema_postgresql.sql"

if (-not (Test-Path $schemaFile)) {
    Write-Host "❌ Schema file not found: $schemaFile" -ForegroundColor Red
    Write-Host "   Looking for: complete_schema_postgresql.sql" -ForegroundColor Yellow
    exit 1
}

Write-Host "Schema file found: $schemaFile" -ForegroundColor Green
Write-Host ""
Write-Host "This will create all tables in hrms_data schema:" -ForegroundColor Yellow
Write-Host "  - users, employees, departments" -ForegroundColor Gray
Write-Host "  - job_titles, vacancies, candidates" -ForegroundColor Gray
Write-Host "  - And all other required tables" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Continue? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Running schema script..." -ForegroundColor Cyan
Write-Host "You will be prompted for the postgres password." -ForegroundColor Yellow
Write-Host ""

# Find psql in common locations
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe"
)

$psql = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psql = $path
        break
    }
}

if (-not $psql) {
    Write-Host "❌ psql not found in standard locations" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run this manually:" -ForegroundColor Yellow
    Write-Host "  1. Open your database client (pgAdmin, DBeaver, etc.)" -ForegroundColor Gray
    Write-Host "  2. Connect as 'postgres' user to database 'arithwise_hrms'" -ForegroundColor Gray
    Write-Host "  3. Open and run: $schemaFile" -ForegroundColor Gray
    exit 1
}

Write-Host "Using psql at: $psql" -ForegroundColor Gray
Write-Host ""

& $psql -U $dbUser -d $dbName -f $schemaFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Tables created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Grant permissions: .\run-grant-permissions.ps1" -ForegroundColor Gray
    Write-Host "  2. Add missing columns: Run ADD_MISSING_COLUMNS.sql" -ForegroundColor Gray
    Write-Host "  3. Restart server and test endpoints" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Error creating tables. Check the error above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Run the SQL file manually in your database client" -ForegroundColor Yellow
    Write-Host "  File: $schemaFile" -ForegroundColor Gray
}



