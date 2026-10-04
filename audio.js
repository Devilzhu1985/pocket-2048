'use strict';
// Gentle synthesized chimes: no downloads, tracking, or background music.
window.GameAudio = (() => {
  let context, enabled = true;
  try { enabled = localStorage.getItem('pocket2048.sound') !== 'off'; } catch {}
  function unlock() {
    if (!enabled) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      if (!context) context = new Audio();
      if (context.state === 'suspended') context.resume().catch(() => {});
    } catch {}
  }
  function notes(sequence, volume = .035) {
    unlock();
    if (!enabled || !context || context.state !== 'running') return;
    sequence.forEach(([frequency, delay, length]) => {
      const oscillator = context.createOscillator(), gain = context.createGain();
      const start = context.currentTime + delay;
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, start + length);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(start); oscillator.stop(start + length + .02);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  }
  return {
    unlock,
    get enabled() { return enabled; },
    toggle() { enabled = !enabled; try { localStorage.setItem('pocket2048.sound', enabled ? 'on' : 'off'); } catch {} if (enabled) unlock(); return enabled; },
    move() { notes([[240, 0, .06]], .012); },
    merge(value) { const scale = [523.25, 587.33, 659.25, 783.99, 880]; const f = scale[Math.max(0, Math.log2(value) - 2) % scale.length]; notes([[f, 0, .16], [f * 1.5, .075, .22]]); },
    win() { notes([[523.25, 0, .25], [659.25, .12, .25], [783.99, .24, .25], [1046.5, .38, .5]]); },
    start() { notes([[659.25, 0, .14], [880, .1, .22]]); }
  };
})();
