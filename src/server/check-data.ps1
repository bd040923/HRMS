# Quick script to check data using psql
Write-Host "🔍 Checking Database Data..." -ForegroundColor Cyan
Write-Host ""

$dbName = "arithwise_hrms"
$dbUser = "bhushan"
$sqlFile = Join-Path $PSScriptRoot "QUICK_CHECK_DATA.sql"

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
    Write-Host "❌ psql not found. Please run QUICK_CHECK_DATA.sql manually in pgAdmin or DBeaver." -ForegroundColor Red
    Write-Host ""
    Write-Host "Or use the Node.js script:" -ForegroundColor Yellow
    Write-Host "   node check-data.js" -ForegroundColor Gray
    exit 1
}

Write-Host "Running quick data check..." -ForegroundColor Cyan
& $psql -U $dbUser -d $dbName -f $sqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Data check complete!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Error checking data." -ForegroundColor Red
}

