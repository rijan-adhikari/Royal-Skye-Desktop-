$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Test-Path '.venv')) { py -3 -m venv .venv }
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt
if (-not (Test-Path '.env')) {
  Write-Host 'Create app/backend/.env from .env.example and set DATABASE_URL and JWT_SECRET before starting.' -ForegroundColor Yellow
  exit 1
}
if (-not (Test-Path 'certs\server.crt') -or -not (Test-Path 'certs\server.key')) {
  Write-Host 'LAN TLS certificate missing. Run: py scripts\generate-lan-tls.py --ip YOUR-HOST-LAN-IP' -ForegroundColor Yellow
  exit 1
}
& .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8443 --ssl-certfile certs\server.crt --ssl-keyfile certs\server.key
