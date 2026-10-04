# Android app

This project packages the current game for Android 8.0 and newer. Game assets are bundled in the APK, so the first play session works offline. The Update button checks the latest Android release in this repository and opens the new APK download in the phone browser. Android asks the user to install it; updates are never installed silently.

## Build

The GitHub Actions **Build Android APK** workflow compiles the app. With **sign** disabled it produces an unsigned APK for build validation, which cannot be installed. Enable signing only after the release-key secrets are configured.

Local builds require JDK 17, Gradle 8.11.1, Android SDK 35, and Build Tools 35.0.0. Run `gradle -p android assembleRelease` from the repository root.

## Signed releases

Use the same private PKCS12 key for every release, with alias `pocket2048`. Keep the key out of source control. GitHub Actions uses `ANDROID_KEYSTORE_BASE64` and `ANDROID_KEYSTORE_PASSWORD` repository secrets. Local builds read `ANDROID_KEYSTORE_PATH` and `ANDROID_KEYSTORE_PASSWORD` environment variables.

The installed app ID is `io.github.devilzhu1985.pocket2048`. For an update, preserve this ID and signing key and increase `versionCode` in `app/build.gradle`. The version code is `major * 10000 + minor * 100 + patch`, with minor and patch below 100. Set `versionName` and the label in `app/src/main/assets/updates.js` to the same version.

Publish signed builds as a GitHub release tagged `android-vMAJOR.MINOR.PATCH`, attaching the file as `Pocket-2048.apk`. The in-app updater uses the latest release and checks that the version code is newer before offering the download. Do not mark web-only releases as the latest GitHub release.

Game progress belongs to the app's private WebView storage and survives same-key APK updates. Browser/home-screen saves are separate and are not transferred automatically. Uninstalling the Android app clears its local progress.
