# Test all API endpoints and show detailed errors
$baseUrl = "http://localhost:3001"

Write-Host "Testing API Endpoints..." -ForegroundColor Cyan
Write-Host ""

$endpoints = @(
    @{Name="Health"; Url="/api/health"},
    @{Name="Job Titles"; Url="/api/job-titles"},
    @{Name="Vacancies"; Url="/api/vacancies"},
    @{Name="Candidates"; Url="/api/candidates"},
    @{Name="Employees"; Url="/api/employees"}
)

foreach ($endpoint in $endpoints) {
    Write-Host "Testing: $($endpoint.Name)" -ForegroundColor Yellow
    Write-Host "  URL: $baseUrl$($endpoint.Url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$($endpoint.Url)" -Method Get -UseBasicParsing -ErrorAction Stop
        $status = $response.StatusCode
        
        if ($status -eq 200) {
            $content = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($content.error) {
                Write-Host "  ❌ Error: $($content.error)" -ForegroundColor Red
                if ($content.message) {
                    Write-Host "     Message: $($content.message)" -ForegroundColor Red
                }
                if ($content.hint) {
                    Write-Host "     Hint: $($content.hint)" -ForegroundColor Yellow
                }
            } else {
                $count = if ($content -is [Array]) { $content.Count } else { 1 }
                Write-Host "  ✅ Success: $count record(s)" -ForegroundColor Green
            }
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorContent = $_.ErrorDetails.Message
        Write-Host "  ❌ HTTP $statusCode" -ForegroundColor Red
        
        if ($errorContent) {
            try {
                $errorObj = $errorContent | ConvertFrom-Json
                Write-Host "     Error: $($errorObj.error)" -ForegroundColor Red
                if ($errorObj.message) {
                    Write-Host "     Message: $($errorObj.message)" -ForegroundColor Red
                }
                if ($errorObj.hint) {
                    Write-Host "     Hint: $($errorObj.hint)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "     $errorContent" -ForegroundColor Red
            }
        }
    }
    Write-Host ""
}

Write-Host "Check your server console for detailed error messages!" -ForegroundColor Cyan

