# Quick API Testing Script
$baseUrl = "http://localhost:3001"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Quick API Endpoint Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Health Check:" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod "$baseUrl/api/health"
    Write-Host "   ✅ Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Database: $($health.database)" -ForegroundColor Gray
    if ($health.tables_found) {
        Write-Host "   Tables Found: $($health.tables_found)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Root Endpoint
Write-Host "2. Root Endpoint:" -ForegroundColor Yellow
try {
    $root = Invoke-RestMethod "$baseUrl/"
    Write-Host "   ✅ Connected" -ForegroundColor Green
    Write-Host "   Message: $($root.message)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Failed" -ForegroundColor Red
}
Write-Host ""

# Test 3: Job Titles
Write-Host "3. Job Titles:" -ForegroundColor Yellow
try {
    $jobs = Invoke-RestMethod "$baseUrl/api/job-titles"
    Write-Host "   ✅ Found $($jobs.Count) job titles" -ForegroundColor Green
    if ($jobs.Count -gt 0) {
        Write-Host "   First: $($jobs[0].title)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Vacancies
Write-Host "4. Vacancies:" -ForegroundColor Yellow
try {
    $vacancies = Invoke-RestMethod "$baseUrl/api/vacancies"
    Write-Host "   ✅ Found $($vacancies.Count) vacancies" -ForegroundColor Green
    if ($vacancies.Count -gt 0) {
        Write-Host "   First: $($vacancies[0].vacancy)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Candidates
Write-Host "5. Candidates:" -ForegroundColor Yellow
try {
    $candidates = Invoke-RestMethod "$baseUrl/api/candidates"
    Write-Host "   ✅ Found $($candidates.Count) candidates" -ForegroundColor Green
    if ($candidates.Count -gt 0) {
        $first = $candidates[0]
        $name = "$($first.first_name) $($first.last_name)"
        Write-Host "   First: $name" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Employees
Write-Host "6. Employees:" -ForegroundColor Yellow
try {
    $employees = Invoke-RestMethod "$baseUrl/api/employees"
    Write-Host "   ✅ Found $($employees.Count) employees" -ForegroundColor Green
    if ($employees.Count -gt 0) {
        Write-Host "   First: $($employees[0].full_name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: Diagnostic
Write-Host "7. Diagnostic:" -ForegroundColor Yellow
try {
    $diag = Invoke-RestMethod "$baseUrl/api/diagnostic"
    Write-Host "   ✅ Connection: $($diag.connection)" -ForegroundColor Green
    Write-Host "   Schema Exists: $($diag.schema_exists)" -ForegroundColor Gray
    Write-Host "   Tables: $($diag.tables.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Testing Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed testing, see:" -ForegroundColor Cyan
Write-Host "  - API_ENDPOINTS_TEST.md (full documentation)" -ForegroundColor Gray
Write-Host "  - test-api.ps1 (comprehensive testing)" -ForegroundColor Gray

