# PowerShell script to create locations table
# Run this to create the locations table in PostgreSQL

$env:PGPASSWORD = "qa@1234"  # Replace with your postgres password if different
$sqlFile = "create-locations-table.sql"
$database = "arithwise_hrms"
$host = "localhost"
$port = "5432"
$user = "postgres"

Write-Host "Creating locations table..." -ForegroundColor Green
Write-Host "Running SQL file: $sqlFile" -ForegroundColor Yellow

# Get the full path to psql
$psqlPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe"  # Adjust version number if needed

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
        Write-Host "ERROR: psql.exe not found. Please install PostgreSQL or update the path in this script." -ForegroundColor Red
        Write-Host "Alternatively, you can run the SQL file manually in pgAdmin." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "Using psql at: $psqlPath" -ForegroundColor Cyan

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFilePath = Join-Path $scriptDir $sqlFile

if (-not (Test-Path $sqlFilePath)) {
    Write-Host "ERROR: SQL file not found at: $sqlFilePath" -ForegroundColor Red
    exit 1
}

# Run the SQL file
& $psqlPath -h $host -p $port -U $user -d $database -f $sqlFilePath

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully created locations table!" -ForegroundColor Green
    Write-Host "The table now contains Nagpur and Mumbai locations." -ForegroundColor Green
} else {
    Write-Host "`n❌ Error running SQL file. Check the error messages above." -ForegroundColor Red
    Write-Host "You may need to run this as the postgres superuser." -ForegroundColor Yellow
}

