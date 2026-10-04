# Pocket 2048

[Play in your browser](https://devilzhu1985.github.io/pocket-2048/) | [Download Android APK](https://github.com/Devilzhu1985/pocket-2048/releases/download/android-v2.0.0/Pocket-2048.apk)

A colorful mobile-first 2048 game with swipe and keyboard controls, sliding tiles, bouncy merges, milestone confetti, gentle synthesized sounds, one-step undo, saved progress, and offline play after the first visit.

Choose the signed Android APK for a native install, or the browser version for an installable web app. For the web app, use Share > Add to Home Screen in Safari, or Add to Home screen / Install app in Chrome.

The Android APK works offline from the first launch. Its Update button checks for newer APK releases and opens the download. Open the downloaded APK and choose Update in Android. See [Android build and release instructions](android/README.md). Browser saves and Android app saves are separate.

## Sound and updates

- Tap **Sound on/off** to mute or enable the chimes. The setting stays saved. Browsers allow sound after a tap or key press; there is no background music.
- In the web app, tap **Update** while online to download the latest web release. In the Android app, tap **Update** to check for a newer APK. Both preserve the saved board, high score, and sound setting when updating the same installation.
- If you still see the original dark version, open the live link online and refresh once to get the Update button.
- Reduced-motion preferences disable the sliding, bounce, and confetti effects.

## Local development

No dependencies or build step. Run `python -m http.server 8080` in this directory and open http://localhost:8080.

Run engine checks with `node test-engine.cjs`.

Progress is stored only in your current browser. Clearing browser data clears your game and best score. All audio is generated locally using Web Audio.

## Publishing a release

Keep the version in `version.json`, `updates.js`, and `sw.js` identical, and bump all three for every release that changes a cached file. Update the precache list in `sw.js` when adding or removing assets. Push the complete release to `main`; GitHub Pages publishes the repository root. The service worker waits for the Update button before replacing an installed release.

An original implementation inspired by Gabriele Cirulli's 2048.
