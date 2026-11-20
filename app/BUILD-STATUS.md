# Build status

This repository now contains production React UI source imported from the live Royal Skye website: login, dashboard, tables, POS, billing, credit, operations and administration screens, theme/language/auth contexts, styles, loading screen and official logo.

Native packaging foundations are being added for Windows desktop via Tauri 2, Debian/Linux desktop via Tauri 2 (.deb and AppImage targets), and Android 10+ via Capacitor.

Not yet release-ready: native host/client connection configuration, local backend/database installation and lifecycle, offline sync, printer drivers/profiles, migration verification, Android pairing UI, production signing and full regression tests still need implementation. No installer or APK should be considered built until CI produces and verifies it.

The live website and its database are not modified by this project.
