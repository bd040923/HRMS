# Comprehensive setup verification script
# This script checks all aspects of the backend setup

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Arithwise HRM Backend Setup Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# 1. Check .env file
Write-Host "1. Checking .env file..." -ForegroundColor Yellow
$envPath = Join-Path $PSScriptRoot ".env"
if (Test-Path $envPath) {
    Write-Host "   ✅ .env file exists" -ForegroundColor Green
    $envContent = Get-Content $envPath
    
    $requiredVars = @("DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASS")
    foreach ($var in $requiredVars) {
        $found = $envContent | Select-String -Pattern "^$var="
        if ($found) {
            $value = ($found.Line -split "=")[1].Trim()
            if ($var -eq "DB_PASS" -or $var -eq "DB_PASSWORD") {
                if ([string]::IsNullOrWhiteSpace($value) -or $value -eq "your_password_here") {
                    $warnings += "$var is not set or using placeholder"
                    Write-Host "   ⚠️  $var needs to be set" -ForegroundColor Yellow
                } else {
                    Write-Host "   ✅ $var is set" -ForegroundColor Green
                }
            } else {
                Write-Host "   ✅ $var = $value" -ForegroundColor Green
            }
        } else {
            $errors += "Missing $var in .env file"
            Write-Host "   ❌ $var is missing" -ForegroundColor Red
        }
    }
} else {
    $errors += ".env file not found"
    Write-Host "   ❌ .env file not found at: $envPath" -ForegroundColor Red
    Write-Host "   💡 Create it using the .env.template file" -ForegroundColor Cyan
}
Write-Host ""

# 2. Check Node.js and npm
Write-Host "2. Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    $errors += "Node.js is not installed or not in PATH"
    Write-Host "   ❌ Node.js not found" -ForegroundColor Red
}

try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    $errors += "npm is not installed or not in PATH"
    Write-Host "   ❌ npm not found" -ForegroundColor Red
}
Write-Host ""

# 3. Check dependencies
Write-Host "3. Checking dependencies..." -ForegroundColor Yellow
$nodeModulesPath = Join-Path $PSScriptRoot "node_modules"
if (Test-Path $nodeModulesPath) {
    Write-Host "   ✅ node_modules exists" -ForegroundColor Green
    
    $requiredPackages = @("express", "pg", "cors", "dotenv")
    foreach ($pkg in $requiredPackages) {
        $pkgPath = Join-Path $nodeModulesPath $pkg
        if (Test-Path $pkgPath) {
            Write-Host "   ✅ $pkg installed" -ForegroundColor Green
        } else {
            $errors += "$pkg package is missing"
            Write-Host "   ❌ $pkg not found" -ForegroundColor Red
        }
    }
} else {
    $errors += "node_modules directory not found. Run 'npm install'"
    Write-Host "   ❌ node_modules not found. Run: npm install" -ForegroundColor Red
}
Write-Host ""

# 4. Check server file
Write-Host "4. Checking server.js..." -ForegroundColor Yellow
$serverPath = Join-Path $PSScriptRoot "server.js"
if (Test-Path $serverPath) {
    Write-Host "   ✅ server.js exists" -ForegroundColor Green
} else {
    $errors += "server.js not found"
    Write-Host "   ❌ server.js not found" -ForegroundColor Red
}
Write-Host ""

# 5. Check if server is running
Write-Host "5. Checking if server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method Get -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Server is running on port 3001" -ForegroundColor Green
        $health = $response.Content | ConvertFrom-Json
        Write-Host "   Database: $($health.database)" -ForegroundColor Gray
        if ($health.database -eq "connected") {
            Write-Host "   ✅ Database connection: OK" -ForegroundColor Green
        } else {
            $warnings += "Database connection issue"
            Write-Host "   ⚠️  Database connection: Issue detected" -ForegroundColor Yellow
        }
    }
} catch {
    $warnings += "Server is not running or not accessible"
    Write-Host "   ⚠️  Server not running or not accessible" -ForegroundColor Yellow
    Write-Host "   💡 Start server with: npm run dev" -ForegroundColor Cyan
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ All checks passed! Setup is complete." -ForegroundColor Green
} else {
    if ($errors.Count -gt 0) {
        Write-Host "❌ Errors found: $($errors.Count)" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "   - $error" -ForegroundColor Red
        }
    }
    if ($warnings.Count -gt 0) {
        Write-Host "⚠️  Warnings: $($warnings.Count)" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "   - $warning" -ForegroundColor Yellow
        }
    }
}
Write-Host ""

