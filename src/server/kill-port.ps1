# PowerShell script to kill process using port 3001
# Usage: .\kill-port.ps1 [port_number]

param(
    [int]$Port = 3001
)

Write-Host "Checking for processes using port $Port..." -ForegroundColor Yellow

$connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

if ($connection) {
    $processId = $connection.OwningProcess
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    
    if ($process) {
        Write-Host "Found process: $($process.ProcessName) (PID: $processId)" -ForegroundColor Red
        Write-Host "Killing process..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force
        Write-Host "✅ Process killed successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Process ID $processId not found (may have already terminated)" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ No process found using port $Port" -ForegroundColor Green
    Write-Host "You can start the server now." -ForegroundColor Cyan
}

