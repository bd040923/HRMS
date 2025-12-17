# Script to insert sample data into database
Write-Host "Inserting sample data..." -ForegroundColor Cyan
Write-Host ""

$dbName = "arithwise_hrms"
$dbUser = "postgres"
$sqlFile = Join-Path $PSScriptRoot "INSERT_SAMPLE_DATA.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "This will insert sample data:" -ForegroundColor Yellow
Write-Host "  - 8 Job Titles" -ForegroundColor Gray
Write-Host "  - 5 Employees" -ForegroundColor Gray
Write-Host "  - 3 Vacancies" -ForegroundColor Gray
Write-Host "  - 4 Candidates" -ForegroundColor Gray
Write-Host "  - Candidate-Vacancy links" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Continue? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

# Find psql
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe"
)

$psql = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psql = $path
        break
    }
}

if (-not $psql) {
    Write-Host "❌ psql not found. Please run INSERT_SAMPLE_DATA.sql manually in your database client." -ForegroundColor Red
    exit 1
}

Write-Host "Running SQL script..." -ForegroundColor Cyan
& $psql -U $dbUser -d $dbName -f $sqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Sample data inserted!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test your endpoints now:" -ForegroundColor Yellow
    Write-Host "  http://localhost:3001/api/job-titles" -ForegroundColor Gray
    Write-Host "  http://localhost:3001/api/vacancies" -ForegroundColor Gray
    Write-Host "  http://localhost:3001/api/candidates" -ForegroundColor Gray
    Write-Host "  http://localhost:3001/api/employees" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Error inserting data. Check the error above." -ForegroundColor Red
}

