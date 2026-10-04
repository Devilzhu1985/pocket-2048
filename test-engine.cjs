const assert=require('node:assert/strict');const {slide,move,canMove}=require('./engine.js');
assert.deepEqual(slide([2,2,2,2]),{line:[4,4,0,0],score:8});
assert.deepEqual(slide([2,2,4,0]),{line:[4,4,0,0],score:4});
assert.deepEqual(slide([4,0,4,4]),{line:[8,4,0,0],score:8});
const b=[2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0];
assert.deepEqual(move(b,'left').board.slice(0,4),[4,0,0,0]);
assert.deepEqual(move(b,'right').board.slice(0,4),[0,0,0,4]);
assert.equal(move(b,'down').board[12],2);assert.equal(move(b,'up').changed,false);
assert.equal(canMove([2,4,2,4,4,2,4,2,2,4,2,4,4,2,4,2]),false);
assert.equal(canMove([2,2,4,8,4,8,16,32,8,16,32,64,16,32,64,128]),true);
assert.equal(slide([1024,1024,0,0]).score,2048);
for(let t=0;t<200;t++){let board=Array.from({length:16},()=>Math.random()<.3?0:2**(1+Math.floor(Math.random()*5)));for(const dir of ['left','right','up','down']){const r=move(board,dir);assert.equal(r.board.reduce((a,b)=>a+b,0),board.reduce((a,b)=>a+b,0));assert.equal(r.board.length,16);}}
console.log('All engine checks passed, including 800 randomized directional moves.');
