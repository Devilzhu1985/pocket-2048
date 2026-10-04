# Pocket 2048

A mobile-first 2048 game with swipe and keyboard controls, one-step undo, saved progress, high scores, and offline support after the first visit.

Open the published GitHub Pages link on your phone. In Safari use Share > Add to Home Screen; in Chrome use the menu > Add to Home screen or Install app.

## Local development

No dependencies or build step. Run `python -m http.server 8080` in this directory and open http://localhost:8080.

Run engine checks with `node test-engine.cjs`.

Progress is stored only in your current browser. Clearing browser data clears your game and best score.

An original implementation inspired by Gabriele Cirulli's 2048.
