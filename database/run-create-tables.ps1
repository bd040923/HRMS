# PowerShell script to run create_all_missing_tables.sql
# Run this as postgres user or with appropriate permissions

$env:PGPASSWORD = "your_password_here"  # Replace with your postgres password
$sqlFile = "create_all_missing_tables.sql"
$database = "arithwise_hrms"
$host = "localhost"
$port = "5432"
$user = "postgres"

Write-Host "Creating all missing tables in database: $database" -ForegroundColor Green
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
        Write-Host "Alternatively, you can run the SQL file manually in pgAdmin or any PostgreSQL client." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "Using psql at: $psqlPath" -ForegroundColor Cyan

# Run the SQL file
& $psqlPath -h $host -p $port -U $user -d $database -f $sqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully created all tables!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Error running SQL file. Check the error messages above." -ForegroundColor Red
    Write-Host "You may need to run this as the postgres superuser." -ForegroundColor Yellow
}

