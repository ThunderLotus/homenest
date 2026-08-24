$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$PidFile = Join-Path $Root '.dev-server.pid'

if (-not (Test-Path $PidFile)) {
    Write-Host 'No dev server PID file found. Nothing to stop.'
    exit 0
}

$targetPid = [int](Get-Content $PidFile)
if ($targetPid -le 0) {
    Write-Host "Invalid PID in $PidFile. Nothing to stop."
    Remove-Item $PidFile -Force
    exit 1
}

$proc = Get-Process -Id $targetPid -ErrorAction SilentlyContinue
if (-not $proc) {
    Write-Host "Process $targetPid is not running. Cleaning up PID file."
    Remove-Item $PidFile -Force
    exit 0
}

# Safety check: verify the target process is actually the nuxi dev server (a node process)
if ($proc.ProcessName -notin @('node', 'node.exe')) {
    Write-Host "WARNING: PID $targetPid ($($proc.ProcessName)) is not a node process. Refusing to kill."
    exit 1
}

Write-Host "Stopping Mafl dev server (PID $targetPid)..."
taskkill /PID $targetPid /T /F | Out-Null

Remove-Item $PidFile -Force
Write-Host 'Dev server stopped.'
