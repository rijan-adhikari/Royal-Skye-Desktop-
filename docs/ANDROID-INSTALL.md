# Installing Royal Skye on Android

1. Open the private repository's Releases page while signed in to a GitHub account with access: https://github.com/rijan-adhikari/Royal-Skye-Desktop-/releases
2. Open the version you want and download the asset named `Royal-Skye-vX.Y.Z-android-debug.apk`.
3. On Android 10 or newer, open the downloaded APK from Downloads / Files.
4. If Android prompts you, allow the browser or Files app to install unknown apps, then return to the installer and tap Install.
5. Open Royal Skye. On the login screen, enter the restaurant host PC's private LAN address, for example `http://192.168.1.10:8000`, and save it. The phone and host must be on the same trusted Wi-Fi/LAN.

The first v1.0.0 build is a debug-signed early-access APK. Android may show a warning because it is installed outside Play Store. Do not install APKs from unofficial mirrors.

For the first release, an owner-controlled permanent Android signing key has not yet been configured in GitHub Actions. Treat this as a test installation; a future APK signed with a different key cannot update this installation in place. Back up restaurant data before replacing test builds.
