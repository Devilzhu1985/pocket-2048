(function (root) {
  'use strict';
  function slide(line) {
    const values = line.filter(Boolean), out = [];
    let score = 0;
    for (let i = 0; i < values.length; i++) {
      if (values[i] === values[i + 1]) {
        const value = values[i] * 2;
        out.push(value); score += value; i++;
      } else out.push(values[i]);
    }
    while (out.length < 4) out.push(0);
    return { line: out, score };
  }
  function move(board, direction) {
    if (!['left', 'right', 'up', 'down'].includes(direction)) throw new Error('Invalid direction');
    const result = Array(16).fill(0), movements = [], merged = [];
    let score = 0;
    for (let i = 0; i < 4; i++) {
      const ids = Array.from({ length: 4 }, (_, j) => direction === 'left' ? i * 4 + j : direction === 'right' ? i * 4 + 3 - j : direction === 'up' ? j * 4 + i : (3 - j) * 4 + i);
      const sources = ids.filter(k => board[k]);
      let destination = 0;
      for (let j = 0; j < sources.length; j++) {
        const from = sources[j], to = ids[destination++], value = board[from];
        movements.push({ from, to, value });
        if (value === board[sources[j + 1]]) {
          movements.push({ from: sources[++j], to, value });
          result[to] = value * 2; score += result[to]; merged.push(to);
        } else result[to] = value;
      }
    }
    return { board: result, score, changed: result.some((v, i) => v !== board[i]), movements, merged };
  }
  function canMove(board) {
    return board.some(v => v === 0) || board.some((v, i) => (i % 4 < 3 && v === board[i + 1]) || (i < 12 && v === board[i + 4]));
  }
  const api = { slide, move, canMove };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Game2048 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
