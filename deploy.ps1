#!/usr/bin/env powershell
<#
.SYNOPSIS
    HomeNest Docker deployment script (PowerShell)
.DESCRIPTION
    Builds the Docker image from local .output and starts the container.
    Runs npm build first if .output is missing.
.PARAMETER Port
    Host port to expose (default: 13008)
.PARAMETER NoBuild
    Skip image build, use existing image
.EXAMPLE
    .\deploy.ps1
    .\deploy.ps1 -Port 8080
    .\deploy.ps1 -NoBuild
#>
param(
    [int]$Port = 13008,
    [switch]$NoBuild
)

$ErrorActionPreference = 'Stop'
$Image = 'thunderlotus/homenest:1.0.1'
$Container = 'homenest'

function Write-Step([string]$msg) { Write-Host "`n[1] $msg" -ForegroundColor Cyan }
function Write-Ok([string]$msg)   { Write-Host "  ✓ $msg" -ForegroundColor Green }
function Write-Err([string]$msg)  { Write-Host "  ✗ $msg" -ForegroundColor Red }

# 1. Check Docker
Write-Step 'Checking Docker...'
try {
    $null = docker version 2>&1
    Write-Ok 'Docker is running'
} catch {
    Write-Err 'Docker is not running. Please start Docker Desktop first.'
    exit 1
}

# 2. Build .output if missing
if (-not (Test-Path '.output/server/index.mjs')) {
    Write-Step '.output not found, building project...'
    npm run build
    if ($LASTEXITCODE -ne 0) { Write-Err 'Build failed'; exit 1 }
    Write-Ok 'Build complete'
} else {
    Write-Ok '.output already exists'
}

# 3. Build Docker image
if (-not $NoBuild) {
    Write-Step "Building Docker image ($Image)..."
    docker build -t $Image -f Dockerfile.prebuilt .
    if ($LASTEXITCODE -ne 0) { Write-Err 'Docker build failed'; exit 1 }
    Write-Ok 'Image built'
} else {
    Write-Ok 'Skipped build (-NoBuild)'
}

# 4. Stop existing container
Write-Step 'Stopping existing container...'
try { docker stop $Container 2>$null | Out-Null } catch {}
try { docker rm $Container 2>$null | Out-Null } catch {}
Write-Ok 'Done'

# 5. Start container
Write-Step "Starting container on port $Port..."
docker run -d --name $Container `
    -p "${Port}:3000" `
    -v "${PWD}/data:/app/data" `
    --restart unless-stopped `
    $Image
if ($LASTEXITCODE -ne 0) { Write-Err 'Failed to start container'; exit 1 }
Write-Ok 'Container started'

# 6. Health check
Write-Step 'Waiting for health check...'
$ok = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    try {
        $resp = Invoke-WebRequest "http://localhost:$Port" -UseBasicParsing -TimeoutSec 3
        if ($resp.StatusCode -eq 200) { $ok = $true; break }
    } catch {}
}
if ($ok) {
    Write-Ok 'Health check passed'
} else {
    Write-Err 'Health check failed (container may still be starting)'
}

# 7. Summary
Write-Host ''
Write-Host '===================================' -ForegroundColor Yellow
Write-Host " HomeNest is running!" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow
Write-Host " URL:          http://localhost:$Port"
Write-Host " Container:    $Container"
Write-Host " Image:        $Image"
Write-Host " Data volume:  ${PWD}/data"
Write-Host " Login:        Admin / Admin"
Write-Host ''
Write-Host " Commands:" -ForegroundColor DarkGray
Write-Host "   docker logs $Container -f       # View logs" -ForegroundColor DarkGray
Write-Host "   docker stop $Container          # Stop" -ForegroundColor DarkGray
Write-Host "   docker restart $Container       # Restart" -ForegroundColor DarkGray
Write-Host ''