export function mergeLine(line) {
 const values=line.filter(Boolean), out=[]; let score=0;
 for(let i=0;i<values.length;i++){if(values[i]===values[i+1]){out.push(values[i]*2);score+=values[i]*2;i++;}else out.push(values[i]);}
 while(out.length<4)out.push(0);return {line:out,score};
}
export function moveBoard(board,dir){
 const next=board.slice();let score=0;
 for(let i=0;i<4;i++){let ids=Array.from({length:4},(_,j)=>dir==='left'||dir==='right'?i*4+j:j*4+i);if(dir==='right'||dir==='down')ids.reverse();const m=mergeLine(ids.map(j=>board[j]));score+=m.score;ids.forEach((j,k)=>next[j]=m.line[k]);}
 return {board:next,score,changed:next.some((v,i)=>v!==board[i])};
}
export function canMove(board){return board.includes(0)||['left','up'].some(d=>moveBoard(board,d).changed);}
export function winner(b){for(const [a,c,d] of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]])if(b[a]&&b[a]===b[c]&&b[a]===b[d])return b[a];return b.every(Boolean)?'draw':null;}
export function bestMove(b){
 function search(p,turn){const w=winner(p);if(w)return w==='O'?10:w==='X'?-10:0;const vals=[];p.forEach((v,i)=>{if(!v){p[i]=turn;vals.push(search(p,turn==='O'?'X':'O'));p[i]='';}});return turn==='O'?Math.max(...vals):Math.min(...vals);}
 let best=-Infinity,move=-1;for(const i of [4,0,2,6,8,1,3,5,7])if(!b[i]){b[i]='O';const value=search(b,'X');b[i]='';if(value>best){best=value;move=i;}}return move;
}
export function seeded(seed){let n=2166136261;for(const ch of seed)n=Math.imul(n^ch.charCodeAt(0),16777619);return()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
export function shuffle(a,r=Math.random){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function toggleLights(b,i){const a=b.slice(),r=Math.floor(i/4),c=i%4;[i,...(r>0?[i-4]:[]),...(r<3?[i+4]:[]),...(c>0?[i-1]:[]),...(c<3?[i+1]:[])].forEach(j=>a[j]=!a[j]);return a;}
