# Royal Skye Desktop

A LAN-first, offline-capable desktop and Android POS system for Royal Skye Restaurant.

> This repository is the separate desktop/mobile product. The existing production website and the earlier `Royal-Skye-Local` prototype are not modified by this project.

## Project goals

- Windows 10/11 x64 host installation for the restaurant PC (initial target: Intel Core i5 3rd Gen, 8 GB RAM, 256 GB SSD, integrated graphics).
- Android client support from Android 10 onward.
- Core POS workflows continue working when the internet connection is unavailable.
- Staff devices connect over the restaurant's private LAN through an authenticated API; clients never connect directly to PostgreSQL.
- Existing website data is copied and reconciled into the local system. The website remains live and unchanged during parallel development and migration.
- Printer configuration is included before hardware purchase; device-specific acceptance tests happen once printer models are selected.
- Architecture supports multiple branches, while the first deployment is one restaurant.

## Repository boundaries

| Repository | Responsibility |
|---|---|
| [Royal-Skye-Restaurant](https://github.com/rijan-adhikari/Royal-Skye-Restaurant) | Existing website / current production system. Keep running during development. |
| [Royal-Skye-Local](https://github.com/rijan-adhikari/Royal-Skye-Local) | Earlier LAN prototype. Reference material only; not the delivery repository. |
| Royal-Skye-Desktop | New desktop host, Android client, migration tools, installers, tests and release workflows. |

Do not push desktop/mobile implementation changes to either of the other repositories.

## Target architecture

- Local Windows host service: FastAPI application and PostgreSQL database.
- Desktop operator application: lightweight Windows client and setup/diagnostic tools.
- Android application: authenticated LAN client for Android 10+.
- API boundary: REST for commands/queries and WebSockets for live updates.
- Reliability: durable local transactions, idempotent sync/outbox, reconnect handling, backups and tested restore.
- Security: staff roles, device pairing/approval/revocation, LAN-only firewall guidance, secrets outside source control.
- Printing: configurable printer profiles and a driver/transport abstraction for USB, Ethernet/Wi-Fi and Bluetooth where supported by the selected model.

Implementation choices must be validated against the production app's actual framework and workflows before porting.

## Data migration safety

The website must remain operational throughout the 10-day parallel build. Migration is copy-only:
1. Export a consistent source snapshot.
2. Import into a separate local database.
3. Reconcile row counts, key totals and representative records.
4. Repeat the import safely without duplicates.
5. Keep the website and its data untouched until the owner approves a tested cutover.

Never delete, truncate, overwrite or disable the production website database as part of migration.

## Development status

This repository has been initialized with the project boundaries, architecture and delivery plan. Application implementation, installers and APK are not yet complete. See [the 10-day delivery plan](docs/10-DAY-DELIVERY.md).

## Developer

**Rijan Adhikari** · [Portfolio](https://adhikari-rijan.onrender.com/) · [GitHub](https://github.com/rijan-adhikari)
