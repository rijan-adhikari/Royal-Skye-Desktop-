# Royal Skye Desktop, Linux and Android

This is the separate cross-platform client project for Royal Skye Restaurant.

## Targets

- Windows 10/11 x64 desktop installer using Tauri 2.
- Debian/Linux desktop packages using Tauri 2.
- Android 10+ APK using Capacitor.

The React source under this folder is imported from the production website to preserve its screens, branding, theme system, loading experience and workflows.

## Build locally

From app/frontend:

```bash
npm install
npm run build
npm run desktop:build
```

Android project generation:

```bash
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

The GitHub Actions workflow builds Windows, Linux and Android artifacts and publishes them as workflow artifacts.

## Important release notes

The first Android workflow artifact is a debug-signed APK intended for installation/testing, not the final long-term production signing identity. A permanent release keystore must be generated and backed up by the owner; its password and key must be stored only in GitHub Actions secrets, never committed or pasted into chat.

The native packaging shell is not the local restaurant server. Backend installation, database lifecycle, Android LAN pairing, offline sync, printer support, migration and release acceptance remain separate required implementation stages. Do not use this build for live billing until those stages pass.
