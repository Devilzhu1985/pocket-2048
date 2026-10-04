'use strict';
(() => {
  const VERSION = '2.0.1';
  const button = document.getElementById('update'), status = document.getElementById('update-status');
  document.getElementById('version').textContent = `v${VERSION}`;
  document.getElementById('install-panel').hidden = false;
  const registration = 'serviceWorker' in navigator && location.protocol !== 'file:'
    ? navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => null)
    : Promise.resolve(null);

  function installed(worker) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => finish(new Error('Timed out')), 12000);
      function finish(error) { clearTimeout(timeout); worker.removeEventListener('statechange', change); error ? reject(error) : resolve(); }
      function change() {
        if (['installed', 'activated'].includes(worker.state)) finish();
        else if (worker.state === 'redundant') finish(new Error('Download failed'));
      }
      worker.addEventListener('statechange', change); change();
    });
  }
  function activate(worker) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => finish(new Error('Activation timed out')), 10000);
      function finish(error) { clearTimeout(timeout); navigator.serviceWorker.removeEventListener('controllerchange', change); error ? reject(error) : resolve(); }
      function change() { finish(); }
      navigator.serviceWorker.addEventListener('controllerchange', change);
      worker.postMessage({ type: 'SKIP_WAITING' });
    });
  }
  button.addEventListener('click', async () => {
    button.disabled = true; button.textContent = 'Checking…';
    status.textContent = 'Looking for a little fresh magic…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`./version.json?check=${Date.now()}`, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('Version unavailable');
      const latest = await response.json();
      if (typeof latest.version !== 'string') throw new Error('Invalid version');
      clearTimeout(timeout);
      const reg = await registration;
      if (reg) {
        await reg.update();
        if (reg.installing) { status.textContent = 'Downloading the update. Your game is safe.'; await installed(reg.installing); }
        if (reg.waiting) {
          status.textContent = 'Update ready! Reopening your saved game…';
          window.dispatchEvent(new Event('pocket-before-update'));
          await activate(reg.waiting);
          location.reload(); return;
        }
      }
      if (latest.version !== VERSION) {
        if (reg) {
          // Never reload an older cached shell when the new worker is not ready.
          status.textContent = 'The new update is still arriving. Try again in a moment.';
        } else {
          window.dispatchEvent(new Event('pocket-before-update'));
          const url = new URL(location.href); url.searchParams.set('v', latest.version); location.replace(url);
        }
      } else status.textContent = 'You’re up to date! Let’s play.';
    } catch {
      status.textContent = 'Couldn’t check for updates. Check your connection and try again. Your game is safe.';
    } finally {
      clearTimeout(timeout); button.disabled = false; button.textContent = '↻ Update';
    }
  });
})();

