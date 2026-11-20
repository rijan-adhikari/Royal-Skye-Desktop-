# Local restaurant host setup

The restaurant PC is intended to run the FastAPI service and PostgreSQL database on the private LAN. Desktop and Android clients connect to this host; clients must never connect directly to PostgreSQL.

## Debian host / development laptop

1. Install Python 3, venv support and PostgreSQL: `sudo apt update && sudo apt install -y python3 python3-venv python3-pip postgresql`.
2. Create a database role and database (choose a strong password):

   ```bash
   sudo -u postgres psql
   CREATE ROLE royalskye LOGIN PASSWORD 'REPLACE_WITH_A_STRONG_PASSWORD';
   CREATE DATABASE royalskye_pos OWNER royalskye;
   \\q
   ```
3. Copy `app/backend/.env.example` to `app/backend/.env`. Set `DATABASE_URL` to the chosen local PostgreSQL password and set `JWT_SECRET` to a unique random secret. Set `INITIAL_ADMIN_PASSWORD` once for the first administrator bootstrap.
4. Run `bash app/backend/run-server-linux.sh`.
5. Check `http://127.0.0.1:8000/api/health` on the host.

## Windows restaurant PC

1. Install 64-bit Python 3.11+ and PostgreSQL 16 (the database service must be running).
2. Create the `royalskye` login role and `royalskye_pos` database in PostgreSQL, with a strong password.
3. Copy `app/backend/.env.example` to `app/backend/.env`; set the PostgreSQL URL, a unique random JWT secret, and a one-time initial admin password.
4. Run `powershell -ExecutionPolicy Bypass -File app/backend/run-server-windows.ps1`.
5. Check `http://127.0.0.1:8000/api/health`.

## Connect Android / another desktop

Find the host PC's private LAN IPv4 address (Windows: `ipconfig`; Debian: `hostname -I`). In the native app login screen, save `http://HOST-LAN-IP:8000`. Keep the devices on the same trusted private network. Configure the firewall to allow TCP 8000 only from the restaurant LAN; do not expose this port to the public internet.

## Current limitations

These scripts are developer/early pilot launchers, not a finished installer or Windows service. PostgreSQL installation, automatic service registration, device pairing/approval, TLS for LAN traffic, backup/restore, offline queue/retry, printer integration and safe copy-only production migration still require implementation and verification. Do not use this early host for live billing or real customer data yet.
