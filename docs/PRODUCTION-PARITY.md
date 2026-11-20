# Production source audit and feature parity map

Audit source: `rijan-adhikari/Royal-Skye-Restaurant`, default branch `main`. This is a read-only inspection; no production files or data were changed.

## Existing stack

- Frontend: React 18, TypeScript, Vite, React Router, Axios, Tailwind CSS.
- Backend: FastAPI, SQLAlchemy 2, PostgreSQL, Alembic migrations.
- Existing app includes a browser SPA and Docker deployment configuration.
- Prototype reference: `rijan-adhikari/Royal-Skye-Local`; FastAPI, SQLAlchemy, PostgreSQL/SQLite fallback, basic device registration/approval/revocation and WebSocket broadcasts.

## Production backend router inventory

| Router | Existing domain to preserve |
|---|---|
| `auth.py`, `users.py` | Staff login, user administration and role access |
| `floors.py`, `menu.py` | Floors/tables and menu/category/item management |
| `orders.py` | Order lifecycle and KOT generation/status |
| `billing.py`, `credit.py` | Bills, payments, outstanding customer balances |
| `customers.py` | Customer records |
| `dashboard.py` | Dashboard metrics, sales detail and operational guide |
| `expenses.py` | Expense records |
| `operations.py` | Operational modules including inventory/purchasing/stock and related workflows |
| `settings.py`, `admin_control.py` | Restaurant configuration, sales controls and administrative workflows |

Frontend page inventory includes Login, Dashboard, Tables, POS, Billing, Credit, Operations, Admin, AdminControl and AdminControls, with shared auth/language/theme contexts, API client, loading screen and styles. Preserve existing feature behavior, roles, validation and calculations during the desktop/mobile port.

## Important implementation findings

1. Production backend startup applies Alembic migrations and conditionally bootstraps the first admin from environment settings. The new local host needs a first-run setup flow that does not rely on a public cloud secret manager.
2. The current frontend API client reads its token from browser `localStorage` and derives WebSocket origin from the current host. Desktop/mobile packaging must replace these assumptions with secure platform storage and explicit LAN host configuration.
3. Production data models and workflows are PostgreSQL-oriented. SQLite fallback must not be assumed to work for the complete production schema without compatibility testing.
4. The earlier local prototype's admin shared-key/device-key model is a proof of concept, not sufficient staff authentication or production authorization.
5. The current local prototype uses Docker Compose and requires Docker Desktop on Windows. That is not suitable as a mandatory dependency for this older 8 GB Windows host. Prefer a managed/native host installation with PostgreSQL service and packaged API runtime; validate resource use.
6. The production WebSocket route currently accepts connections without an application-level authenticated handshake. The local product must authenticate event subscriptions and enforce branch scope.
7. No physical printer model has been selected. Implement configuration and a printer abstraction, then verify actual transports/protocols after hardware is acquired.

## Parity rule

No existing production workflow is considered ported merely because a screen or endpoint exists. Each workflow needs:
- matching role/permission behavior;
- matching validation and financial calculations;
- persistence and audit behavior;
- API/UI tests;
- offline/LAN and multi-device acceptance where applicable.

## Next engineering sequence

1. Map the production schema and all routers to a complete workflow/permission matrix.
2. Establish the host service and migration baseline in this repository.
3. Port backend modules with versioned migrations and automated regression tests.
4. Package the desktop shell and Android client against the same API contract.
5. Implement repeatable copy-only export/import and reconciliation.
