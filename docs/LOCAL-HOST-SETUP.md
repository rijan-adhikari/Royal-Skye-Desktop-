# Royal Skye local restaurant host

The restaurant PC is the single local source of truth. Android and desktop clients connect to its authenticated HTTPS API over the trusted restaurant LAN. PostgreSQL is bound to the host and is never exposed directly to client devices.

## Windows host prerequisites

Target host: Windows 10 x64, Intel Core i5 3rd Gen, 8 GB RAM, SSD.

Install:
- Python 3.11 or newer (64-bit).
- PostgreSQL 16 (64-bit), with command-line tools available on PATH.
- The Royal Skye Desktop repository.

Do not make Docker Desktop a mandatory dependency on the restaurant PC.

## 1. Create the local database

Open SQL Shell (psql) or an administrator terminal:

```sql
CREATE ROLE royalskye LOGIN PASSWORD 'USE_A_LONG_UNIQUE_PASSWORD';
CREATE DATABASE royalskye_pos OWNER royalskye;
```

Keep PostgreSQL listening on localhost only. Do not expose port 5432 to the restaurant Wi-Fi.

## 2. Configure the local API

From `app/backend`:

```powershell
Copy-Item .env.example .env
```

Edit `.env` locally:
- `DATABASE_URL=postgresql+psycopg2://royalskye:YOUR_PASSWORD@127.0.0.1:5432/royalskye_pos`
- `JWT_SECRET`: a unique random value of at least 32 characters.
- `INITIAL_ADMIN_USERNAME` and a strong one-time `INITIAL_ADMIN_PASSWORD`.

Never commit `.env`, passwords, database dumps or private keys.

## 3. Provision HTTPS for the restaurant LAN

Find the restaurant PC's LAN IPv4 address with `ipconfig`. Reserve that address in the router's DHCP settings so it does not change.

From `app/backend`:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
py scripts\generate-lan-tls.py --ip 192.168.1.10
```

Replace the example address with the actual host IP. This creates:
- `certs/server.crt` and `certs/server.key` for the HTTPS API.
- `certs/royal-skye-local-ca.crt` for Android trust installation.
- `certs/royal-skye-local-ca.key`, the private CA key. Keep it on the host and never share it.

Copy **only** `royal-skye-local-ca.crt` to the Android phone. On Android, install it as a CA certificate under Settings → Security / Privacy → Encryption & credentials → Install a certificate → CA certificate (wording varies by Android version). Android may require a screen-lock PIN. Never copy the .key files to the phone.

The Android build disables cleartext networking and trusts system certificates plus user-installed CA certificates. The phone must trust this CA before the app can connect to the local HTTPS API.

## 4. Start the local host

First run:

```powershell
powershell -ExecutionPolicy Bypass -File run-server-windows.ps1
```

Confirm the health response from the host PC:

```powershell
Invoke-RestMethod https://127.0.0.1:8443/api/health
```

Expected fields: `status=ok` and `database=connected`.

After successful first-run validation, install the startup task from an elevated PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File install-host-windows.ps1
```

The installer permits inbound TCP 8443 from the local subnet only. Do not forward this port from the router or expose it publicly.

## 5. Connect the Android phone

1. Install the Royal Skye APK.
2. Connect the phone and restaurant PC to the same trusted Wi-Fi/LAN.
3. Open Royal Skye → Login.
4. Enter `https://192.168.1.10:8443` using the actual reserved host IP.
5. Tap **Test connection**. It must report both API and database online.
6. Sign in with an existing migrated staff account.

Android requires HTTPS. Plain HTTP LAN URLs are rejected by the Android client.

## 6. Copy the existing website database into the local host

The source and local repositories share the same five Alembic migrations and the same core SQLAlchemy model/schema files. This makes a PostgreSQL physical/logical snapshot the safest initial copy path.

Before running the migration:
1. Create the empty local `royalskye_pos` database above; do not start the local API yet.
2. In Render → the Royal Skye PostgreSQL database → Networking, add the restaurant PC's current public IP as a single `/32` allowlist entry. Do not use `0.0.0.0/0`. Remove the temporary entry after the migration.
3. Copy the **External Database URL** from Render. Keep it private.
4. Ensure PostgreSQL 16 command-line tools (`pg_dump`, `pg_restore`, `psql`) are on the PC's PATH.
5. Run from this folder:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\migrate-production-to-local.ps1
```

The script asks for the source and destination URLs using hidden input. It:
- creates a consistent custom-format PostgreSQL dump;
- validates the dump archive;
- refuses to restore into a non-empty destination;
- restores in one transaction without `--clean` or `DROP` operations;
- writes a SHA-256 and per-table row-count report under `app/backend/backups`.

The source website database is not modified. The dump and report remain on the local PC; protect them as sensitive business records.

### Important cutover rule

A database snapshot copies records only up to the snapshot time. It does **not** provide automatic two-way synchronization. Do not run the website and local app as two independent write masters and expect sales/expenses to appear in both. Choose one system as the writer after reconciliation, or implement and test a synchronization service before dual-writing. Keep the website and its original database untouched as the fallback until the owner approves cutover.

The current Render database is on a free plan with an expiry date of **20 December 2026**. Export and preserve a verified backup before that date; do not assume the free database is permanent.

## Known production gates

- A permanent owner-controlled Android release keystore must be configured before stable APK updates. Debug-signed builds are for installation and acceptance testing only.
- Device pairing/approval, authenticated WebSocket subscriptions, durable offline transaction queues, printer-specific acceptance and full backup/restore drills remain separate production gates.
- LAN TLS is now required for Android API and WebSocket traffic. Do not disable certificate validation or re-enable cleartext traffic to bypass a certificate problem.
