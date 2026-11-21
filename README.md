# Royal Skye Desktop

A LAN-first restaurant POS system for Royal Skye Restaurant, with Windows/Linux desktop clients and an Android client.

## Project goals

- Windows 10/11 x64 restaurant host (initial target: Intel Core i5 3rd Gen, 8 GB RAM, 256 GB SSD, integrated graphics).
- Android 10+ client.
- Local PostgreSQL database and FastAPI host on the restaurant PC.
- Android and desktop clients connect over trusted LAN HTTPS; clients never connect directly to PostgreSQL.
- The existing website remains live and unchanged while its records are copied and reconciled into the local database.
- Existing restaurant workflows, settings, staff roles, themes and business records are preserved.
- Printer configuration is included; hardware-specific acceptance follows once printer models are selected.

## Repository boundaries

| Repository | Responsibility |
|---|---|
| [Royal-Skye-Restaurant](https://github.com/rijan-adhikari/Royal-Skye-Restaurant) | Existing production website and current database. Keep running and preserve as fallback. |
| [Royal-Skye-Local](https://github.com/rijan-adhikari/Royal-Skye-Local) | Earlier LAN prototype; reference material only. |
| Royal-Skye-Desktop | Delivery repository for the local host, Android/desktop clients, migration tooling, installers and tests. |

Do not push desktop/mobile implementation changes to either of the other repositories.

## Target architecture

- Local Windows host: FastAPI application and PostgreSQL database.
- Android client: Capacitor application containing the real Royal Skye React interface.
- Desktop clients: Tauri 2 for Windows and Debian/Linux.
- API: REST for commands/queries and WebSockets for live updates.
- Security: staff roles, HTTPS on the private LAN, device trust, restricted firewall rules and secrets outside source control.
- Reliability: PostgreSQL backups, tested restore, migration reconciliation and reconnect handling.

## Production feature parity

The mobile/desktop project includes the production frontend pages and API modules for:
- Staff authentication and role-based access.
- Dashboard, sales history and reporting.
- Floors, tables, POS, orders and KOT.
- Bills, payments, refunds, credit and outstanding balances.
- Customers, menu, inventory, purchasing and suppliers.
- Expenses, cash shifts, daily savings and audit history.
- Restaurant settings, payment QR, tax/service charge, loyalty and administration.
- Theme and language preferences.

The frontend uses route-level lazy loading. The Android app opens the real staff login screen; the sample-data demo route has been removed.

## Data migration safety

The production website and source database must remain unchanged during migration.

1. Export a consistent PostgreSQL snapshot from the production database.
2. Import into a separate, empty local database.
3. Reconcile every public table's row count and key financial totals.
4. Keep a local dump and migration report.
5. Repeat the snapshot at the approved cutover point if production records changed.
6. Never run the website and local database as separate write masters without a tested synchronization service.

A copy-only Windows migration script is provided at app/backend/scripts/migrate-production-to-local.ps1. It refuses a non-empty destination and never runs destructive SQL against the source.

## Current delivery status

Implemented in the integration branch:
- Production login is the app entry point; demo route removed.
- Real production React pages and backend modules are present.
- Local API health check verifies PostgreSQL readiness.
- Android LAN server address can be configured and tested.
- Android cleartext traffic is disabled; trusted local HTTPS is required.
- Local TLS certificate provisioning and Windows/Linux HTTPS host launchers are included.
- Copy-only PostgreSQL export/import and reconciliation tooling is included.
- CI builds Android, Windows and Linux clients and runs backend checks.

Still required before live restaurant cutover:
- Run the host installer on the restaurant PC and verify PostgreSQL/HTTPS.
- Export and import the actual production database, then review reconciliation.
- Install the local CA certificate on the Android phone and verify the LAN connection.
- Configure the owner's permanent Android signing key for stable updates.
- Complete staff/role, printer, backup/restore and end-to-end transaction acceptance tests.

See [Local host setup](docs/LOCAL-HOST-SETUP.md), [Android installation](docs/ANDROID-INSTALL.md) and [Production parity audit](docs/PRODUCTION-PARITY.md).

## Developer

**Rijan Adhikari** · [Portfolio](https://adhikari-rijan.onrender.com/) · [GitHub](https://github.com/rijan-adhikari)
