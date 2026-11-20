# Royal Skye local API host

This directory contains the FastAPI service, SQLAlchemy models, PostgreSQL migrations and API routers imported from the production restaurant application. The host is intended to run on the restaurant PC and serve authenticated clients on the private LAN.

See [Local host setup](../../docs/LOCAL-HOST-SETUP.md) before running it. Do not expose port 8000 to the public internet. Keep `.env` private and never commit database passwords, JWT secrets or administrator credentials.
