# Script to fix the DB_PASS in .env file
$envPath = Join-Path $PSScriptRoot ".env"

Write-Host "Fixing DB_PASS in .env file..." -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

# Read current content
$content = Get-Content $envPath

# Find and replace DB_PASS line
$newContent = @()
$found = $false

foreach ($line in $content) {
    if ($line -match "^DB_PASS\s*=") {
        Write-Host "Found DB_PASS line: $line" -ForegroundColor Yellow
        Write-Host "Replacing with: DB_PASS=qa%401234" -ForegroundColor Green
        $newContent += "DB_PASS=qa%401234"
        $found = $true
    } else {
        $newContent += $line
    }
}

if (-not $found) {
    Write-Host "DB_PASS line not found, adding it..." -ForegroundColor Yellow
    $newContent += "DB_PASS=qa%401234"
}

# Write back to file
$newContent | Out-File -FilePath $envPath -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✅ .env file updated!" -ForegroundColor Green
Write-Host "   DB_PASS=qa%401234 (will be decoded to qa@1234)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Restart your server now." -ForegroundColor Yellow

