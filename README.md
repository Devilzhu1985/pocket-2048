# Pocket 2048

[Play on your phone](https://devilzhu1985.github.io/pocket-2048/)

A colorful mobile-first 2048 game with swipe and keyboard controls, sliding tiles, bouncy merges, milestone confetti, gentle synthesized sounds, one-step undo, saved progress, and offline play after the first visit.

This is an installable web app, not an Android APK. In Safari use Share > Add to Home Screen; in Chrome use the menu > Add to Home screen or Install app.

## Sound and updates

- Tap **Sound on/off** to mute or enable the chimes. The setting stays saved. Browsers allow sound after a tap or key press; there is no background music.
- Tap **Update** while online to check for a release. A complete update downloads before the app reopens. The saved board, high score, and sound setting are retained.
- If you still see the original dark version, open the live link online and refresh once to get the Update button.
- Reduced-motion preferences disable the sliding, bounce, and confetti effects.

## Local development

No dependencies or build step. Run `python -m http.server 8080` in this directory and open http://localhost:8080.

Run engine checks with `node test-engine.cjs`.

Progress is stored only in your current browser. Clearing browser data clears your game and best score. All audio is generated locally using Web Audio.

## Publishing a release

Keep the version in `version.json`, `updates.js`, and `sw.js` identical, and bump all three for every release that changes a cached file. Update the precache list in `sw.js` when adding or removing assets. Push the complete release to `main`; GitHub Pages publishes the repository root. The service worker waits for the Update button before replacing an installed release.

An original implementation inspired by Gabriele Cirulli's 2048.
