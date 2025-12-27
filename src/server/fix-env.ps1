# Script to check and fix .env file
$envPath = Join-Path $PSScriptRoot ".env"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Checking .env File Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env file NOT FOUND at: $envPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Creating .env file template..." -ForegroundColor Yellow
    
    $template = @"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arithwise_hrms
DB_USER=bhushan
DB_PASS=
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:8080
"@
    
    $template | Out-File -FilePath $envPath -Encoding utf8 -NoNewline
    Write-Host "✅ Created .env file template" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit the file and set DB_PASS!" -ForegroundColor Red
    Write-Host "   File location: $envPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opening .env file in notepad..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
    notepad $envPath
    exit
}

Write-Host "✅ .env file found" -ForegroundColor Green
Write-Host ""

$content = Get-Content $envPath
$issues = @()

# Check for DB_PASS
$dbPassLine = $content | Select-String -Pattern "^DB_PASS="
if (-not $dbPassLine) {
    $issues += "DB_PASS is missing"
    Write-Host "❌ DB_PASS is missing" -ForegroundColor Red
} else {
    $dbPassValue = ($dbPassLine.Line -split "=", 2)[1].Trim()
    if ([string]::IsNullOrWhiteSpace($dbPassValue)) {
        $issues += "DB_PASS is empty"
        Write-Host "❌ DB_PASS is set but EMPTY" -ForegroundColor Red
    } elseif ($dbPassValue -eq "your_password_here" -or $dbPassValue -eq "YOUR_PASSWORD_HERE") {
        $issues += "DB_PASS is using placeholder value"
        Write-Host "❌ DB_PASS is using placeholder value" -ForegroundColor Red
    } else {
        Write-Host "✅ DB_PASS is set (${dbPassValue.Length} characters)" -ForegroundColor Green
    }
}

# Check for other required variables
$requiredVars = @("DB_HOST", "DB_PORT", "DB_NAME", "DB_USER")
foreach ($var in $requiredVars) {
    $line = $content | Select-String -Pattern "^$var="
    if ($line) {
        $value = ($line.Line -split "=", 2)[1].Trim()
        Write-Host "✅ $var = $value" -ForegroundColor Green
    } else {
        $issues += "$var is missing"
        Write-Host "❌ $var is missing" -ForegroundColor Red
    }
}

Write-Host ""

if ($issues.Count -gt 0) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Issues Found: $($issues.Count)" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  - $issue" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Opening .env file for editing..." -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    notepad $envPath
} else {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ All checks passed!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your .env file is configured correctly." -ForegroundColor Cyan
    Write-Host "Restart your server to apply changes." -ForegroundColor Cyan
}



