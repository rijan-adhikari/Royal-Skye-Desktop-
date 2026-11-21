# Royal Skye Windows, Debian and Android clients

This is the separate cross-platform client project for Royal Skye Restaurant.

## Targets

- Windows 10/11 x64 desktop installer using Tauri 2.
- Debian/Linux desktop packages using Tauri 2.
- Android 10+ APK using Capacitor.

The React source under this folder contains the real restaurant website workflows, themes, language settings, branding, loading experience and role-based screens. The Android entry point is the staff login screen; sample/demo routes are not part of the application.

## Build locally

From app/frontend:

    npm install
    npm run build
    npm run desktop:build

Android project generation:

    npx cap add android
    npx cap sync android
    cd android
    ./gradlew assembleDebug

The GitHub Actions workflow builds Windows, Linux and Android artifacts.

## Local backend

The restaurant PC runs the FastAPI host and PostgreSQL database. Android/desktop clients connect to the host over HTTPS on the private LAN. See docs/LOCAL-HOST-SETUP.md.

## Release notes

CI debug-signed APKs are for installation and acceptance testing. A permanent owner-controlled signing keystore must be generated and stored in GitHub Actions secrets before stable production updates. Never commit the keystore or its passwords.

The APK is a real client, but an APK build alone does not migrate the live website database or install the restaurant-PC host. Complete the local database import/reconciliation and operational acceptance checklist before live billing.
