# Installing Royal Skye Android

## Install the APK

1. Download the APK from the private repository's Releases page: https://github.com/rijan-adhikari/Royal-Skye-Desktop-/releases
2. Open it from Downloads / Files on Android 10 or newer.
3. If Android prompts you, allow the browser or Files app to install unknown apps, then return to the installer and tap Install.
4. Open Royal Skye. The app starts at the real staff login screen; it does not open a sample/demo workspace.

## Trust the restaurant's private LAN certificate

The Android app blocks cleartext HTTP. Before connecting to the restaurant PC, the owner must provision the local HTTPS certificate on that PC using `app/backend/scripts/generate-lan-tls.py`.

Copy only `royal-skye-local-ca.crt` to the phone. Install it from Android Settings → Security / Privacy → Encryption & credentials → Install a certificate → CA certificate (menu wording varies). Do not copy or distribute either private `.key` file.

## Connect to the restaurant host

1. Keep the phone and restaurant PC on the same trusted private Wi-Fi/LAN.
2. On the login screen, enter `https://HOST-LAN-IP:8443` using the reserved LAN IP printed by the host setup.
3. Tap **Test connection**. It must report that both the API and database are connected.
4. Sign in with an existing staff account from the migrated restaurant database.

## Signing and production status

The current GitHub Actions build is debug-signed for installation and acceptance testing. A permanent owner-controlled Android signing key must be created and configured as GitHub Actions secrets before stable production updates; otherwise a future APK signed with another key cannot update this installation in place.

Do not process live restaurant transactions until the local database has been imported and reconciled, staff login and permissions have been tested, and the owner has accepted the backup/restore and printer workflows. Keep the original website and source database unchanged until the owner approves cutover.
