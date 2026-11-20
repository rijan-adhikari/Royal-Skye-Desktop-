$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Test-Path '.venv\Scripts\python.exe')) { throw 'Run run-server-windows.ps1 once to install Python dependencies first.' }
if (-not (Test-Path '.env')) { throw 'Configure app/backend/.env before installing the host task.' }
$python = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
$action = New-ScheduledTaskAction -Execute $python -Argument '-m uvicorn app.main:app --host 0.0.0.0 --port 8000' -WorkingDirectory $PSScriptRoot
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -RestartCount 5 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero)
Register-ScheduledTask -TaskName 'RoyalSkyeLocalAPI' -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description 'Starts the Royal Skye restaurant API on the private LAN' -Force | Out-Null
Start-ScheduledTask -TaskName 'RoyalSkyeLocalAPI'
Write-Host 'Royal Skye local API scheduled task installed and started.' -ForegroundColor Green
