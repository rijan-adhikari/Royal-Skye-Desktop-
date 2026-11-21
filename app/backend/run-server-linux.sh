#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -d .venv ]]; then python3 -m venv .venv; fi
. .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if [[ ! -f .env ]]; then
  echo "Missing app/backend/.env. Copy .env.example to .env and set DATABASE_URL and JWT_SECRET first."
  exit 1
fi
if [[ ! -f certs/server.crt || ! -f certs/server.key ]]; then
  echo "Missing LAN TLS certificate. Run: python scripts/generate-lan-tls.py --ip YOUR-HOST-LAN-IP"
  exit 1
fi
exec uvicorn app.main:app --host 0.0.0.0 --port 8443 --ssl-certfile certs/server.crt --ssl-keyfile certs/server.key
