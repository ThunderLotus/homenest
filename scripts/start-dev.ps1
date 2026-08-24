#Requires -Version 5.1
<#
  Start Mafl dev server detached from the calling process tree.
  Uses WMI Win32_Process.Create so the opencode/bash tool returns immediately
  (no inherited stdout/stderr pipes to keep open).
#>
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$port = 13008
$pidFile = Join-Path $root '.dev-server.pid'
$outLog  = Join-Path $root '.dev-server.out.log'
$errLog  = Join-Path $root '.dev-server.err.log'
$health  = "http://localhost:$port/api/health"

# Stop any existing instance first
if (Test-Path $pidFile) {
    $old = (Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1).Trim()
    if ($old -and (Get-Process -Id $old -ErrorAction SilentlyContinue)) {
        Write-Host "Stopping existing dev server (PID $old)..."
        & (Join-Path $PSScriptRoot 'stop-dev.ps1')
    }
}

# Launch via WMI (detached) -> cmd.exe /c node nuxi ... > log 2>&1
$cmd = 'node'
$args = 'node_modules/nuxi/bin/nuxi.mjs dev --port ' + $port
$redir = "> `"$outLog`" 2> `"$errLog`""
$commandLine = "`"$cmd`" $args $redir"

$startInfo = Get-CimInstance Win32_Process | Out-Null
$proc = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CurrentDirectory = $root; CommandLine = "cmd.exe /c cd /d `"$root`" && $commandLine" }

if ($proc.ReturnValue -ne 0) {
    throw "Win32_Process.Create failed with code $($proc.ReturnValue)"
}

$newPid = $proc.ProcessId
Set-Content -Path $pidFile -Value $newPid -Encoding ascii
Write-Host "Started dev server (cmd PID $newPid) on port $port"

# Poll health until ready
$deadline = (Get-Date).AddSeconds(60)
$ready = $false
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 500
    try {
        $r = Invoke-WebRequest -Uri $health -TimeoutSec 2 -UseBasicParsing
        if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
}
if ($ready) {
    Write-Host "READY -> http://localhost:$port"
} else {
    Write-Host "TIMEOUT waiting for health check. See $errLog"
    exit 1
}