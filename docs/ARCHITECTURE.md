# Architecture and operating constraints

## Deployment topology

The restaurant Windows PC is the local host. It runs the API and database as managed local services. Staff Android devices and any additional workstation connect to the host over the private restaurant LAN.

```text
                 Internet (optional)
                         |
              optional sync / updates
                         |
Android app ---- private LAN ---- Windows host
                                      |
                              Authenticated API
                                      |
                             Application services
                                      |
                                PostgreSQL
                                      |
                          backup / restore manager
```

Clients must not receive database credentials or connect to PostgreSQL directly. Do not expose the API or database to the public internet and do not configure router port forwarding.

## Resource budget

Initial host target is an older i5 (3rd generation), 8 GB RAM, integrated graphics and a 256 GB SSD. Keep the host lightweight:
- no GPU dependency;
- avoid requiring Docker Desktop for normal restaurant operation;
- bound background workers and database connection pools;
- rotate logs and backups, with configurable retention and disk-space warnings;
- benchmark under realistic concurrent billing/KOT activity before release.

Windows 10 is the stated target. Because standard Windows 10 support ended in October 2025, deployment documentation must call out its security-support status and recommend a supported Windows version or applicable Extended Security Updates. Do not silently imply an unsupported OS is secure.

## Application boundaries

- Host service owns business rules, persistence, authentication and synchronization.
- Windows and Android clients use the same versioned API.
- REST handles ordinary reads/writes; WebSockets deliver live KOT/order/table updates.
- Branch identity is enforced server-side for every branch-scoped query and mutation.
- Roles and permissions are checked on the server, not merely hidden in the UI.
- Device approval and revocation are enforced server-side.

## Offline and synchronization model

The local database is authoritative for on-premise operation. Internet loss must not block local billing, KOT, table management or other locally hosted workflows. Each accepted mutation receives a durable identifier and transaction boundary. Any optional cloud synchronization uses an outbox, idempotency keys, retry/backoff and explicit conflict handling. Reconnection must not duplicate orders, payments, stock movements or sales.

A disconnected mobile device must clearly show whether an action is saved locally, queued, or confirmed by the host. Do not claim a transaction is committed until it is durably stored by the relevant authority.

## Data import and cutover

- Export from the current website using a read-only, consistent snapshot or documented export endpoint.
- Import into a separate local database; never point the new application at the production database for migration tests.
- Preserve source IDs where practical and maintain an import mapping when IDs differ.
- Record source snapshot time, counts, financial totals and import version.
- Make imports repeatable and idempotent.
- Reconcile totals and samples before accepting the import.
- Keep the website online until the owner explicitly approves cutover.

## Printing

Implement a printer profile abstraction before a physical printer is selected. Configuration should cover connection type, address/port or device selection, paper width, character encoding, copies, cash-drawer pulse where supported, and separate receipt/KOT routing. ESC/POS can be a compatibility target, but actual compatibility must be tested against the exact printer model, driver and connection type. Do not promise Bluetooth/USB/network support for every model.

## Backups and recovery

- Automated encrypted database backups with retention and free-disk-space checks.
- Backup files stored outside the application installation directory.
- Restore workflow with integrity checks and an explicit confirmation step.
- Document recovery point and recovery time expectations after measuring them.
- Never commit production data, credentials, signing keys or backups to Git.

## Release security

- Keep Android signing keystore and passwords out of GitHub source and chat.
- Back up the signing key securely; future APK updates must use the same signing identity.
- Use GitHub Actions or another controlled build runner for reproducible release artifacts.
- Publish checksums and version metadata with EXE/APK releases.
