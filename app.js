'use strict';
const $=id=>document.getElementById(id), key='pocket2048.v1';
let state={board:Array(16).fill(0),score:0,best:0,continued:false},previous=null,spawn=-1;
function valid(s){return s&&Array.isArray(s.board)&&s.board.length===16&&s.board.every(v=>Number.isSafeInteger(v)&&v>=0&&(v===0||Number.isInteger(Math.log2(v))))&&Number.isSafeInteger(s.score)&&s.score>=0&&Number.isSafeInteger(s.best)&&s.best>=0&&typeof s.continued==='boolean';}
try{const saved=JSON.parse(localStorage.getItem(key));if(valid(saved))state=saved;}catch{}
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{}}
function add(){const free=state.board.map((v,i)=>v===0?i:-1).filter(i=>i>=0);spawn=free[Math.floor(Math.random()*free.length)];if(spawn!==undefined)state.board[spawn]=Math.random()<.9?2:4;}
function isWin(){return !state.continued&&state.board.some(v=>v>=2048);}
function render(){const board=$('board');board.replaceChildren(...state.board.map((value,i)=>{const e=document.createElement('div');e.className='tile'+(i===spawn?' spawn':'')+(value>2048?' large':'');e.dataset.value=value;e.textContent=value||'';e.setAttribute('aria-label',`Row ${Math.floor(i/4)+1}, column ${i%4+1}: ${value||'empty'}`);return e;}));$('score').textContent=state.score;$('best').textContent=state.best;$('undo').disabled=!previous;const win=isWin(),over=!Game2048.canMove(state.board);$('overlay').hidden=!(win||over);$('continue').hidden=!win;$('message').textContent=win?'You made 2048!':'No moves left';$('message-detail').textContent=win?'Keep going. How high can you climb?':`A good run. You scored ${state.score.toLocaleString()}.`;$('announcement').textContent=win?'You reached 2048!':over?`Game over. Score ${state.score}.`:`Score ${state.score}.`;save();}
function fresh(){previous=null;state={board:Array(16).fill(0),score:0,best:state.best,continued:false};add();add();render();}
function play(direction){if(isWin()||!Game2048.canMove(state.board))return;const next=Game2048.move(state.board,direction);if(!next.changed)return;previous={...state,board:state.board.slice()};state.board=next.board;state.score+=next.score;state.best=Math.max(state.best,state.score);add();render();}
$('new').onclick=()=>{if(state.score===0||confirm('Start a new game? Your current board will be replaced.'))fresh();};$('retry').onclick=fresh;
$('continue').onclick=()=>{state.continued=true;spawn=-1;render();$('board').focus();};
$('undo').onclick=()=>{if(previous){state={...previous,best:state.best};previous=null;spawn=-1;render();}};
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const d={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'}[e.key];if(d){e.preventDefault();play(d);}});
let pointer=null;
$('board').addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;pointer={x:e.clientX,y:e.clientY,id:e.pointerId};$('board').setPointerCapture(e.pointerId);});
$('board').addEventListener('pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;play(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));});
$('board').addEventListener('pointercancel',()=>pointer=null);
if(state.board.every(v=>v===0))fresh();else render();
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
