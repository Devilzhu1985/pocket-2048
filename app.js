'use strict';
const $ = id => document.getElementById(id), key = 'pocket2048.v1';
let state = { board: Array(16).fill(0), score: 0, best: 0, continued: false };
let previous = null, spawn = -1, busy = false, queued = null, animationSerial = 0;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function valid(s) {
  return s && Array.isArray(s.board) && s.board.length === 16 && s.board.every(v => Number.isSafeInteger(v) && (v === 0 || (v >= 2 && Number.isInteger(Math.log2(v))))) && Number.isSafeInteger(s.score) && s.score >= 0 && Number.isSafeInteger(s.best) && s.best >= 0 && typeof s.continued === 'boolean';
}
try { const saved = JSON.parse(localStorage.getItem(key)); if (valid(saved)) state = saved; } catch {}
function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }
function add() {
  const free = state.board.map((v, i) => v === 0 ? i : -1).filter(i => i >= 0);
  spawn = free[Math.floor(Math.random() * free.length)];
  if (spawn !== undefined) state.board[spawn] = Math.random() < .9 ? 2 : 4;
}
function isWin() { return !state.continued && state.board.some(v => v >= 2048); }
function makeTile(value, index) {
  const element = document.createElement('div');
  element.className = 'tile' + (value > 2048 ? ' large' : '');
  element.dataset.value = value; element.textContent = value || '';
  if (index !== undefined) element.setAttribute('aria-label', `Row ${Math.floor(index / 4) + 1}, column ${index % 4 + 1}: ${value || 'empty'}`);
  return element;
}
function render(merged = [], inMotion = false) {
  const board = $('board');
  board.classList.toggle('animating', inMotion);
  board.replaceChildren(...state.board.map((value, index) => {
    const tile = makeTile(value, index);
    if (index === spawn) tile.classList.add('spawn');
    if (merged.includes(index)) tile.classList.add('merge');
    return tile;
  }));
  $('score').textContent = state.score; $('best').textContent = state.best; $('undo').disabled = !previous;
  const win = isWin(), over = !Game2048.canMove(state.board);
  $('overlay').hidden = inMotion || !(win || over); $('continue').hidden = !win;
  $('message').textContent = win ? 'You made 2048!' : 'What a lovely run!';
  $('message-detail').textContent = win ? 'Amazing! Keep going and chase your next number.' : `No moves left. You scored ${state.score.toLocaleString()}. Ready for another try?`;
  $('announcement').textContent = win ? 'You reached 2048!' : over ? `Game over. Score ${state.score}.` : `Score ${state.score}.`;
  save();
}
function cancelMotion() { animationSerial++; busy = false; queued = null; $('celebration').replaceChildren(); }
function fresh() {
  cancelMotion(); previous = null;
  state = { board: Array(16).fill(0), score: 0, best: state.best, continued: false };
  add(); add(); render(); $('encouragement').textContent = 'Swipe to make a match';
}
function celebrate() {
  if (reducedMotion.matches) return;
  const area = $('celebration'); area.replaceChildren();
  const colors = ['#ff79a7', '#ffcf44', '#4fcfa6', '#a180ef', '#63b9f2'];
  for (let i = 0; i < 24; i++) {
    const particle = document.createElement('span'), angle = Math.PI * 2 * i / 24, distance = 90 + Math.random() * 130;
    particle.className = 'confetti'; particle.style.background = colors[i % colors.length];
    particle.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
    particle.style.setProperty('--spin', `${Math.random() * 600 - 300}deg`);
    particle.addEventListener('animationend', () => particle.remove(), { once: true });
    area.append(particle);
  }
}
function feedback(next, oldMax) {
  if (!next.score) { GameAudio.move(); return; }
  const highest = Math.max(...next.merged.map(i => next.board[i]));
  if (isWin()) GameAudio.win(); else GameAudio.merge(highest);
  $('encouragement').textContent = highest > oldMax && highest >= 32 ? `You made ${highest}! Amazing!` : ['Lovely match!', 'Keep it growing!', 'A little number magic!'][Math.floor(Math.random() * 3)];
  if ((highest > oldMax && highest >= 32) || isWin()) celebrate();
  const burst = $('score-burst'); burst.classList.remove('pop'); burst.textContent = `+${next.score}`;
  void burst.offsetWidth; burst.classList.add('pop');
}
function play(direction) {
  if (busy) { queued = direction; return; }
  if (isWin() || !Game2048.canMove(state.board)) return;
  const next = Game2048.move(state.board, direction);
  if (!next.changed) return;
  const oldMax = Math.max(...state.board), board = $('board');
  const positions = Array.from(board.children).map(tile => ({ x: tile.offsetLeft, y: tile.offsetTop, width: tile.offsetWidth, height: tile.offsetHeight }));
  previous = { ...state, board: state.board.slice() };
  state.board = next.board.slice(); state.score += next.score; state.best = Math.max(state.best, state.score); add();
  if (reducedMotion.matches || !Element.prototype.animate) { render(next.merged); feedback(next, oldMax); return; }
  busy = true; const serial = ++animationSerial;
  render([], true);
  const layer = document.createElement('div'); layer.className = 'motion-layer'; layer.setAttribute('aria-hidden', 'true'); board.append(layer);
  for (const motion of next.movements) {
    const tile = makeTile(motion.value), from = positions[motion.from], to = positions[motion.to];
    tile.classList.add('flying');
    Object.assign(tile.style, { left: `${from.x}px`, top: `${from.y}px`, width: `${from.width}px`, height: `${from.height}px` });
    layer.append(tile);
    tile.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${to.x - from.x}px,${to.y - from.y}px)` }], { duration: 145, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
  }
  setTimeout(() => {
    if (serial !== animationSerial) return;
    busy = false; render(next.merged); feedback(next, oldMax);
    const direction = queued; queued = null;
    if (direction) play(direction);
  }, 155);
}
function updateSoundButton() {
  const enabled = GameAudio.enabled;
  $('sound').textContent = enabled ? '♪ Sound on' : '♪ Sound off';
  $('sound').setAttribute('aria-pressed', String(enabled));
  $('sound').setAttribute('aria-label', enabled ? 'Sound on. Mute sounds' : 'Sound off. Enable sounds');
}
$('sound').onclick = () => { GameAudio.toggle(); updateSoundButton(); if (GameAudio.enabled) setTimeout(() => GameAudio.start(), 50); };
$('new').onclick = () => { if (state.score === 0 || confirm('Start a new game? Your current board will be replaced.')) { fresh(); GameAudio.start(); } };
$('retry').onclick = () => { fresh(); GameAudio.start(); };
$('continue').onclick = () => { cancelMotion(); state.continued = true; spawn = -1; render(); $('board').focus(); };
$('undo').onclick = () => { if (previous) { cancelMotion(); state = { ...previous, best: state.best }; previous = null; spawn = -1; render(); $('encouragement').textContent = 'Try a different direction!'; } };
document.addEventListener('pointerdown', () => GameAudio.unlock(), { passive: true });
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
  const direction = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' }[event.key];
  if (direction) { event.preventDefault(); GameAudio.unlock(); play(direction); }
});
let pointer = null;
$('board').addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  pointer = { x: event.clientX, y: event.clientY, id: event.pointerId };
  if ($('board').hasPointerCapture(event.pointerId) || event.isTrusted) $('board').setPointerCapture(event.pointerId);
});
$('board').addEventListener('pointerup', event => {
  if (!pointer || pointer.id !== event.pointerId) return;
  const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y; pointer = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
  play(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
});
$('board').addEventListener('pointercancel', () => pointer = null);
window.addEventListener('pagehide', save);
window.addEventListener('pocket-before-update', save);
updateSoundButton();
if (state.board.every(value => value === 0)) fresh(); else render();
