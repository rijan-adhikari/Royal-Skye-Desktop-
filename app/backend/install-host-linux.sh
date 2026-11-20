#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
if [[ ! -x "$ROOT/.venv/bin/uvicorn" ]]; then
  echo 'Run run-server-linux.sh once to create the virtual environment and install dependencies.' >&2
  exit 1
fi
if [[ ! -f "$ROOT/.env" ]]; then echo 'Missing .env; configure it before installing the service.' >&2; exit 1; fi
RUN_USER="${SUDO_USER:-$USER}"
SERVICE="[Unit]\nDescription=Royal Skye Restaurant API\nAfter=network-online.target postgresql.service\nWants=network-online.target\n\n[Service]\nType=simple\nUser=$RUN_USER\nWorkingDirectory=$ROOT\nEnvironmentFile=$ROOT/.env\nExecStart=$ROOT/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000\nRestart=on-failure\nRestartSec=5\n\n[Install]\nWantedBy=multi-user.target\n"
printf '%b' "$SERVICE" | sudo tee /etc/systemd/system/royal-skye-api.service >/dev/null
sudo systemctl daemon-reload
sudo systemctl enable --now royal-skye-api.service
sudo systemctl status royal-skye-api.service --no-pager
