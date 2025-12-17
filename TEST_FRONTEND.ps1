# Test if frontend is accessible
Write-Host "🧪 Testing Frontend Access..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend is running
Write-Host "1. Testing backend server..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 3
    Write-Host "   ✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host "   Start it with: cd orangehrm\src\server && npm start" -ForegroundColor Yellow
    exit 1
}

# Test 2: Check if frontend HTML is served
Write-Host ""
Write-Host "2. Testing frontend HTML..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3001/" -UseBasicParsing -TimeoutSec 3
    if ($frontend.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend HTML is being served" -ForegroundColor Green
        if ($frontend.Content -match "Arithwise HRM") {
            Write-Host "   ✅ HTML contains 'Arithwise HRM'" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  HTML doesn't contain expected content" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ Frontend returned status: $($frontend.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Cannot access frontend!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 3: Check if JS files are accessible
Write-Host ""
Write-Host "3. Testing JavaScript files..." -ForegroundColor Yellow
$jsFiles = @(
    "/js/vendors.80c64a63d3506f1156a7.js",
    "/js/main.5a91e2e053e4bf4381e6.js"
)

foreach ($jsFile in $jsFiles) {
    try {
        $js = Invoke-WebRequest -Uri "http://localhost:3001$jsFile" -UseBasicParsing -TimeoutSec 3
        if ($js.StatusCode -eq 200) {
            Write-Host "   ✅ $jsFile - OK" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ❌ $jsFile - NOT FOUND" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   Open your browser and go to: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "   If you see a blank page:" -ForegroundColor Yellow
Write-Host "   1. Open browser Developer Tools (F12)" -ForegroundColor Gray
Write-Host "   2. Check Console tab for errors" -ForegroundColor Gray
Write-Host "   3. Check Network tab to see if JS files are loading" -ForegroundColor Gray

