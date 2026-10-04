'use strict';
// Packaged Android app: upgrades replace the APK, not a browser cache.
(() => {
  document.getElementById('version').textContent = 'Android v2.0.0';
  document.getElementById('update-status').textContent = 'Play anywhere. This game works offline.';
  document.getElementById('update').addEventListener('click', () => {
    window.dispatchEvent(new Event('pocket-before-update'));
    location.href = 'pocket2048://update';
  });
})();
