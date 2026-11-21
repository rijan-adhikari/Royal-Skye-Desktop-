$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Test-Path '.venv\Scripts\python.exe')) { throw 'Run run-server-windows.ps1 once to install Python dependencies first.' }
if (-not (Test-Path '.env')) { throw 'Configure app/backend/.env before installing the host task.' }
if (-not (Test-Path 'certs\server.crt') -or -not (Test-Path 'certs\server.key')) { throw 'Generate the LAN TLS certificate first with scripts\generate-lan-tls.py.' }
$python = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
$action = New-ScheduledTaskAction -Execute $python -Argument '-m uvicorn app.main:app --host 0.0.0.0 --port 8443 --ssl-certfile certs\server.crt --ssl-keyfile certs\server.key' -WorkingDirectory $PSScriptRoot
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -RestartCount 5 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero)
Register-ScheduledTask -TaskName 'RoyalSkyeLocalAPI' -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description 'Starts the Royal Skye HTTPS restaurant API on the private LAN' -Force | Out-Null
if (-not (Get-NetFirewallRule -DisplayName 'Royal Skye Local API HTTPS' -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule -DisplayName 'Royal Skye Local API HTTPS' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8443 -RemoteAddress LocalSubnet | Out-Null
}
Start-ScheduledTask -TaskName 'RoyalSkyeLocalAPI'
Write-Host 'Royal Skye HTTPS local API scheduled task installed and started.' -ForegroundColor Green
