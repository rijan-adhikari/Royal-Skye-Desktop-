# Versioning and releases

The canonical version is stored in `app/VERSION`. Use semantic versions: patch fixes (1.0.1), feature releases (1.1.0 / 1.2.0), and breaking releases (2.0.0).

From the repository root:

```bash
node scripts/set-version.mjs 1.2.0
git add app/VERSION app/frontend/package.json app/frontend/src-tauri/tauri.conf.json app/frontend/src-tauri/Cargo.toml
git commit -m "Release Royal Skye v1.2.0"
git push
```

The version manifest drives the Android `versionName` and monotonically increasing `versionCode`, the Windows/Linux Tauri version, and the desktop Rust package version. A commit message containing `Release Royal Skye v` triggers the Android build and private GitHub Release upload.

Android early-access APKs are debug-signed. Production releases must switch to a permanent owner-controlled signing key stored only as encrypted GitHub Actions secrets and backed up securely. Never commit the keystore or its password.
