# 10-day parallel delivery plan

The schedule is a target, not a guarantee. The live website remains operational throughout. If a critical acceptance test fails, keep the website as the production system rather than rushing a cutover.

| Day | Focus | Exit evidence |
|---|---|---|
| 1 | Inspect production frontend/backend, schemas, roles, migrations and prototype. Freeze scope and define parity matrix. | Source inventory, workflow map, dependency and risk report. |
| 2 | Establish new host/client structure, local database, configuration, health checks and Windows service lifecycle. | Clean host install/start/stop and persistent database smoke test. |
| 3 | Port authentication, staff roles, branch boundaries and device pairing/revocation. | Server-side authorization and device lifecycle tests. |
| 4 | Port menu, tables, orders, billing and payments. | End-to-end order-to-bill tests with transaction integrity. |
| 5 | Port KOT/KDS, live updates, waiter/cashier flows and printer profile settings. | KOT routing tests and printer configuration UI/API. |
| 6 | Port remaining operational modules in priority order: inventory, purchasing, expenses, reservations, shifts and reports as present in source. | Feature parity matrix updated; no module marked complete without tests. |
| 7 | Android 10+ client, pairing, LAN discovery/configuration and clear connection state. | APK debug build installs and completes core workflows on Android 10+. |
| 8 | Copy-only data export/import, reconciliation, backup/restore and offline/reconnect behavior. | Repeatable import; reconciliation report; no duplicate sync mutations. |
| 9 | Windows installer/EXE packaging, release automation, printer and multi-device LAN tests. | Fresh-install test on target-class Windows PC; APK/EXE artifacts produced. |
| 10 | Regression, security review, performance test, user acceptance and release notes. | Signed/packaged candidate, test evidence, known-issues list and explicit cutover decision. |

## Mandatory acceptance checklist

- [ ] Fresh Windows install on the target-class PC; app starts after reboot and recovers cleanly.
- [ ] Host database survives application restart and Windows restart.
- [ ] Android 10+ installation, pairing, approval and revocation.
- [ ] Staff login and server-enforced roles/permissions.
- [ ] Menu, table, order, billing, payment and KOT workflows.
- [ ] Inventory and other modules present in production parity matrix.
- [ ] Internet disconnected while LAN remains up: local POS workflows continue.
- [ ] Reconnect does not duplicate transactions or lose queued operations.
- [ ] Multiple devices can work concurrently without conflicting updates.
- [ ] Printer profile and test print; physical model validation when hardware is acquired.
- [ ] Export/import preserves records and financial totals; source website remains unchanged.
- [ ] Backup and restore tested on a separate database.
- [ ] EXE/APK versioning, signing, checksums and update/rollback instructions.
- [ ] No secrets, production data or signing keystore committed to Git.

## Explicit non-goals for the first cut

- No public exposure of the local host or database.
- No forced shutdown or migration of the live website.
- No deletion/cut operation on source data.
- No assertion that a printer works until tested with its exact model.
- No production cutover without owner approval and completed acceptance evidence.
