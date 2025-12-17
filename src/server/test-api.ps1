# PowerShell script to test all API endpoints
# Run this after starting the server

$baseUrl = "http://localhost:3001"
$endpoints = @(
    "/",
    "/api/test",
    "/api/health",
    "/api/diagnostic",
    "/api/job-titles",
    "/api/vacancies",
    "/api/candidates",
    "/api/employees"
)

Write-Host "Testing Arithwise HRM Backend API..." -ForegroundColor Green
Write-Host "Base URL: $baseUrl" -ForegroundColor Cyan
Write-Host ""

foreach ($endpoint in $endpoints) {
    $url = "$baseUrl$endpoint"
    Write-Host "Testing: $endpoint" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing -ErrorAction Stop
        $status = $response.StatusCode
        
        if ($status -eq 200) {
            Write-Host "  ✅ Status: $status" -ForegroundColor Green
            $content = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($content) {
                if ($content.PSObject.Properties.Name -contains "message") {
                    Write-Host "  Message: $($content.message)" -ForegroundColor Gray
                }
                if ($content.PSObject.Properties.Name -contains "status") {
                    Write-Host "  Status: $($content.status)" -ForegroundColor Gray
                }
                if ($content.PSObject.Properties.Name -contains "tables_found") {
                    Write-Host "  Tables Found: $($content.tables_found)" -ForegroundColor Gray
                }
                if ($content -is [Array]) {
                    Write-Host "  Records: $($content.Count)" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "  ⚠️  Status: $status" -ForegroundColor Yellow
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  ❌ Error: $statusCode - $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "API Testing Complete!" -ForegroundColor Green

