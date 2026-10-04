(function(root){
'use strict';
function slide(line){const a=line.filter(Boolean),out=[];let score=0;for(let i=0;i<a.length;i++){if(a[i]===a[i+1]){const n=a[i]*2;out.push(n);score+=n;i++;}else out.push(a[i]);}while(out.length<4)out.push(0);return {line:out,score};}
function move(board,direction){if(!['left','right','up','down'].includes(direction))throw new Error('Invalid direction');const result=board.slice();let score=0;for(let i=0;i<4;i++){const ids=Array.from({length:4},(_,j)=>direction==='left'?i*4+j:direction==='right'?i*4+3-j:direction==='up'?j*4+i:(3-j)*4+i);const s=slide(ids.map(k=>board[k]));score+=s.score;ids.forEach((k,j)=>result[k]=s.line[j]);}return {board:result,score,changed:result.some((v,i)=>v!==board[i])};}
function canMove(b){return b.some(v=>v===0)||b.some((v,i)=>(i%4<3&&v===b[i+1])||(i<12&&v===b[i+4]));}
const api={slide,move,canMove};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Game2048=api;
})(typeof globalThis!=='undefined'?globalThis:this);
