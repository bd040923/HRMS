# Test Job Titles API Endpoints
# Run this after starting the server to verify endpoints are working

Write-Host "Testing Job Titles API..." -ForegroundColor Green
Write-Host ""

# Test GET endpoint
Write-Host "1. Testing GET /api/job-titles..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/job-titles" -Method GET -UseBasicParsing
    Write-Host "   ✅ GET endpoint works! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ GET endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test POST endpoint
Write-Host "2. Testing POST /api/job-titles..." -ForegroundColor Yellow
$body = @{
    title = "Test Job Title"
    description = "Test Description"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/job-titles" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "   ✅ POST endpoint works! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ POST endpoint failed!" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Error: $responseBody" -ForegroundColor Red
    } else {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "If POST shows 404, the server needs to be restarted!" -ForegroundColor Yellow
Write-Host "If POST shows 500, check database connection and table exists." -ForegroundColor Yellow

