# Script to automatically start Docker Desktop (if not running) and start all project servers
$ErrorActionPreference = "Continue"

Write-Host "Checking if Docker Desktop is running..." -ForegroundColor Cyan

# Check if docker is running by running 'docker ps'
try {
    $dockerCheck = docker ps 2>&1
    if ($dockerCheck -match "error during connect" -or $dockerCheck -match "failed to connect") {
        throw "Docker not running"
    }
    Write-Host "Docker is already running." -ForegroundColor Green
} catch {
    Write-Host "Docker is NOT running. Starting Docker Desktop..." -ForegroundColor Yellow
    
    # Try to start Docker Desktop
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process $dockerPath
        Write-Host "Waiting for Docker to start up (this may take a minute)..." -ForegroundColor Yellow
        
        # Wait until docker is responsive
        $maxRetries = 30
        $retryCount = 0
        $dockerReady = $false
        
        while (-not $dockerReady -and $retryCount -lt $maxRetries) {
            Start-Sleep -Seconds 5
            $retryCount++
            try {
                $check = docker ps 2>&1
                if ($check -notmatch "error during connect" -and $check -notmatch "failed to connect") {
                    $dockerReady = $true
                }
            } catch {}
        }
        
        if ($dockerReady) {
            Write-Host "Docker is now running!" -ForegroundColor Green
        } else {
            Write-Host "Timed out waiting for Docker. Please ensure Docker Desktop is started manually." -ForegroundColor Red
        }
    } else {
        Write-Host "Could not find Docker Desktop at $dockerPath. Please start it manually." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Starting all project servers in separate windows..." -ForegroundColor Cyan

$projectDir = $PSScriptRoot

# NOTE: auth service is REQUIRED — it handles Google OAuth and JWT tokens
# NOTE: sandbox/router is REQUIRED — it routes agent API calls to Kubernetes pods
# NOTE: notification service is REQUIRED — it processes emails and login alerts
$servers = @(
    @{ Name = "auth";            Path = "auth";            Command = "npm run dev" },
    @{ Name = "notification";    Path = "notification";    Command = "npm run dev" },
    @{ Name = "sandbox/router";  Path = "sandbox\router";  Command = "npm run dev" },
    @{ Name = "sandbox/server";  Path = "sandbox\server";  Command = "npm run dev" },
    @{ Name = "sandbox/agent";   Path = "sandbox\agent";   Command = "npm run dev" },
    @{ Name = "ai-orchestration"; Path = "ai-orchestration"; Command = "npm run dev" },
    @{ Name = "frontend";        Path = "frontend";         Command = "npm run dev" }
)

$started = @()
$skipped = @()

foreach ($server in $servers) {
    $fullPath = Join-Path $projectDir $server.Path
    if (Test-Path $fullPath) {
        Write-Host "  Starting $($server.Name)..." -ForegroundColor Green
        Start-Process "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$fullPath'; $($server.Command)"
        $started += $server.Name
    } else {
        Write-Host "  Warning: Path not found — $fullPath" -ForegroundColor Yellow
        $skipped += $server.Name
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Services started: $($started -join ', ')" -ForegroundColor Green
if ($skipped.Count -gt 0) {
    Write-Host " Skipped (path not found): $($skipped -join ', ')" -ForegroundColor Yellow
}
Write-Host ""
Write-Host " Ports:" -ForegroundColor Cyan
Write-Host "   auth            -> http://localhost:3000" -ForegroundColor White
Write-Host "   notification    -> http://localhost:4000" -ForegroundColor White
Write-Host "   sandbox/router  -> http://localhost:3001" -ForegroundColor White
Write-Host "   sandbox/server  -> http://localhost:5000" -ForegroundColor White
Write-Host "   sandbox/agent   -> http://localhost:8080 (per sandbox pod)" -ForegroundColor White
Write-Host "   ai-orchestration-> http://localhost:6000" -ForegroundColor White
Write-Host "   frontend        -> http://localhost:5173" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " Open: http://localhost:5173" -ForegroundColor Green
