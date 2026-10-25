import {mergeLine,moveBoard,canMove,winner,bestMove,shuffle,toggleLights} from './core.js';
export function launch(id,c){
 const {root,button,status,done,later,on,random,beep}=c;
 const integer=n=>Math.floor(random()*n);
 const el=(tag,cls,text,parent=root)=>{const x=document.createElement(tag);x.className=cls||'';if(text!==undefined)x.textContent=text;parent.append(x);return x;};
 const grid=(n=4,cls='')=>{const b=el('div','grid-board '+cls);b.style.gridTemplateColumns=`repeat(${n},1fr)`;return b;};
 const choices=(labels,fn,parent)=>{const row=el('div','choices',undefined,parent||root);labels.forEach((s,i)=>button(s,()=>fn(i),row));return row;};
 const directions=fn=>{const row=el('div','direction-pad');[['↑','up'],['←','left'],['↓','down'],['→','right']].forEach(([label,d])=>{const b=button(label,()=>fn(d),row);b.setAttribute('aria-label','Move '+d);});};
 if(id==='2048'){
  let board=Array(16).fill(0),score=0,over=false;const b=grid();
  function add(){const empty=board.map((v,i)=>!v?i:-1).filter(i=>i>=0);if(empty.length)board[empty[integer(empty.length)]]=random()<.9?2:4;}
  function draw(){b.replaceChildren();board.forEach(v=>{const t=el('div','cell'+(v?' filled':''),v||'',b);t.style.setProperty('--hue',String(55-Math.log2(v||1)*8));});status('Score: '+score+' · Best tile: '+Math.max(...board));}
  function move(dir){if(over)return;const m=moveBoard(board,dir);if(!m.changed){if(!canMove(board)){over=true;done(score);}return;}board=m.board;score+=m.score;add();draw();beep();if(!canMove(board)){over=true;done(score,'No more moves. A fresh board is a fresh chance.');}}
  add();add();draw();directions(move);button('Finish & save score',()=>{if(!over){over=true;done(score,'Run saved. Keep exploring!');}});
  on(document,'keydown',e=>{const d={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[e.key];if(d){e.preventDefault();move(d);}});
  let start;on(b,'pointerdown',e=>{start=[e.clientX,e.clientY];b.setPointerCapture(e.pointerId);});on(b,'pointerup',e=>{if(!start)return;const dx=e.clientX-start[0],dy=e.clientY-start[1];start=null;if(Math.max(Math.abs(dx),Math.abs(dy))>20)move(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');});b.style.touchAction='none';
 }else if(id==='memory'){
  const deck=shuffle(['🌸','🍋','🌿','🦋','🍄','☀','🌸','🍋','🌿','🦋','🍄','☀'],random),b=grid();let open=[],matched=new Set(),locked=false,moves=0;
  const cards=deck.map((v,i)=>{const x=button('✿',()=>flip(i),b);x.className='memory-card';x.setAttribute('aria-label','Hidden card '+(i+1));return x;});
  function flip(i){if(locked||matched.has(i)||open.includes(i))return;cards[i].textContent=deck[i];cards[i].setAttribute('aria-label',deck[i]);open.push(i);beep();if(open.length<2)return;moves++;status(moves+' moves · '+matched.size/2+' of 6 pairs');const [a,d]=open;if(deck[a]===deck[d]){matched.add(a);matched.add(d);[a,d].forEach(j=>{cards[j].classList.add('matched');cards[j].disabled=true;});open=[];status(moves+' moves · '+matched.size/2+' of 6 pairs');if(matched.size===12)done(moves,'A whole garden of matches. Nicely done!');}else{locked=true;later(()=>{[a,d].forEach(j=>{cards[j].textContent='✿';cards[j].setAttribute('aria-label','Hidden card '+(j+1));});open=[];locked=false;},750);}}
  status('Find six matching pairs. No timer, no rush.');
 }else if(id==='ttt'){
  const b=Array(9).fill(''),board=grid(3);let busy=false,ended=false;
  const cells=b.map((_,i)=>{const x=button('',()=>play(i),board);x.style.height='90px';x.setAttribute('aria-label','Empty square '+(i+1));return x;});
  function draw(){cells.forEach((x,i)=>{x.textContent=b[i];x.disabled=!!b[i]||busy||ended;x.setAttribute('aria-label',`Square ${i+1}: ${b[i]||'empty'}`);});}
  function check(){const w=winner(b);if(!w)return false;ended=true;draw();done(w==='X'?100:w==='draw'?50:0,w==='draw'?'A draw! You held your own against the AI.':w==='X'?'Three in a row. You win!':'The computer wins this round. Try another opening.');return true;}
  function play(i){if(busy||ended||b[i])return;b[i]='X';if(check())return;busy=true;draw();status('AI is considering its move…');later(()=>{const m=bestMove(b);if(m>=0)b[m]='O';busy=false;draw();if(!check())status('Your turn · You are X');},350);}
  status('You are X. The AI plans ahead using minimax.');
 }else if(id==='reaction'){
  let phase='idle',started=0;const p=button('Start round',tap);p.className='pad';
  function tap(){if(phase==='ended')return;if(phase==='idle'){phase='wait';p.textContent='Wait for GO…';status('Wait for the green pad.');later(()=>{if(phase!=='wait')return;phase='go';started=performance.now();p.classList.add('go');p.textContent='GO! TAP NOW';},1400+integer(2400));}else if(phase==='wait'){phase='ended';p.textContent='Too soon — restart to try again';status('Early tap. No score recorded.');}else if(phase==='go'){phase='ended';const ms=Math.round(performance.now()-started);p.textContent=ms+' ms';done(ms,'A quick moment of focus.');}}
  on(document,'visibilitychange',()=>{if(document.hidden&&(phase==='wait'||phase==='go')){phase='ended';p.textContent='Round interrupted — restart';status('No score recorded while the tab was hidden.');}});
 }else if(id==='snake'){
  const canvas=el('canvas');canvas.width=360;canvas.height=360;canvas.setAttribute('aria-label','Snake board. Use arrow keys or the direction buttons.');const ctx=canvas.getContext('2d');
  let snake=[[7,7],[6,7],[5,7]],dir=[1,0],next=[1,0],food,score=0,running=false,ended=false,turned=false;const pause=button('Start snake',()=>{if(ended)return;running=!running;pause.textContent=running?'Pause':'Resume';if(running)tick();});
  function spawn(){const empty=[];for(let y=0;y<15;y++)for(let x=0;x<15;x++)if(!snake.some(p=>p[0]===x&&p[1]===y))empty.push([x,y]);food=empty[integer(empty.length)];}
  function draw(){ctx.fillStyle='#111722';ctx.fillRect(0,0,360,360);ctx.strokeStyle='#ffffff08';for(let i=0;i<15;i++){ctx.beginPath();ctx.moveTo(i*24,0);ctx.lineTo(i*24,360);ctx.moveTo(0,i*24);ctx.lineTo(360,i*24);ctx.stroke();}if(food){ctx.fillStyle='#ffadc7';ctx.beginPath();ctx.arc(food[0]*24+12,food[1]*24+12,8,0,Math.PI*2);ctx.fill();}snake.forEach((p,i)=>{ctx.fillStyle=i?'#86b943':'#c4ff65';ctx.fillRect(p[0]*24+2,p[1]*24+2,20,20);});status('Score: '+score+(running?' · Keep growing':' · Paused'));}
  let tickVersion=0;
  function tick(){const version=++tickVersion;later(()=>{if(!running||ended||version!==tickVersion)return;dir=next;turned=false;const head=[snake[0][0]+dir[0],snake[0][1]+dir[1]],eat=head[0]===food[0]&&head[1]===food[1];const body=eat?snake:snake.slice(0,-1);if(head.some(v=>v<0||v>14)||body.some(p=>p[0]===head[0]&&p[1]===head[1])){ended=true;running=false;pause.disabled=true;done(score,'A good run. Ready for another bite?');return;}snake.unshift(head);if(eat){score+=10;beep();spawn();if(!food){ended=true;running=false;done(score,'You filled the board!');return;}}else snake.pop();draw();tick();},Math.max(90,180-score/5));}
  function turn(d){const v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[d];if(!turned&&!(v[0]===-dir[0]&&v[1]===-dir[1])){next=v;turned=true;}}
  directions(turn);on(document,'keydown',e=>{const d={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'}[e.key];if(d){e.preventDefault();turn(d);}});on(document,'visibilitychange',()=>{if(document.hidden){running=false;tickVersion++;pause.textContent='Resume';draw();}});spawn();draw();
 }else if(id==='sequence'){
  const b=grid(2,'sequence');let seq=[],index=0,locked=true,ended=false;const pads=['1 · Moon','2 · Star','3 · Sun','4 · Leaf'].map((s,i)=>button(s,()=>tap(i),b));
  function flash(i){pads[i].classList.add('lit');beep(250+i*130);later(()=>pads[i].classList.remove('lit'),350);}
  function level(){locked=true;index=0;seq.push(integer(4));status('Watch level '+seq.length);seq.forEach((v,i)=>later(()=>flash(v),600+i*650));later(()=>{locked=false;status('Your turn: repeat '+seq.length+' steps');},600+seq.length*650);}
  function tap(i){if(locked||ended)return;flash(i);if(i!==seq[index]){ended=true;done(seq.length-1,'That was a different note. Every round trains your memory.');return;}index++;if(index===seq.length){locked=true;status('Sequence complete!');later(level,700);}}
  const start=button('Start sequence',()=>{start.disabled=true;level();});
 }else if(id==='lights'){
  let board=Array(16).fill(false);for(let i=0;i<10;i++)board=toggleLights(board,integer(16));if(board.every(v=>!v))board=toggleLights(board,5);let moves=0,ended=false;const b=grid(),cells=board.map((_,i)=>button('',()=>{if(ended)return;board=toggleLights(board,i);moves++;draw();if(board.every(v=>!v)){ended=true;done(moves,'Lights out. A little moment of clarity.');}},b));
  function draw(){cells.forEach((x,i)=>{x.className=board[i]?'lit':'';x.textContent=board[i]?'☀':'·';x.setAttribute('aria-label',`Light ${i+1}: ${board[i]?'on':'off'}`);x.setAttribute('aria-pressed',String(board[i]));});status(moves+' moves · Turn off every light');}draw();
 }else if(id==='word'){
  const words=shuffle([['GARDEN','Flowers grow here'],['PLANET','Earth is one'],['OCEAN','A vast body of salt water'],['MUSIC','A melody for your ears'],['SMILE','A happy expression'],['BREAD','Bake it in an oven'],['CLOUD','A white shape in the sky'],['TIGER','A striped big cat'],['RIVER','Water flowing toward the sea'],['LIGHT','The opposite of darkness'],['DREAM','An adventure while asleep'],['APPLE','A crunchy fruit']],random).slice(0,5);let round=0,score=0,hinted=false,locked=false;
  const letters=el('div','big-symbol');letters.style.fontSize='36px';const clue=el('p');const form=el('form');const input=el('input','',undefined,form);input.placeholder='Your answer';input.setAttribute('aria-label','Unscrambled word');input.autocomplete='off';input.maxLength=20;const submit=button('Check answer',()=>{},form);submit.type='submit';const hint=button('Give me a hint',()=>{hinted=true;status('Starts with '+words[round][0][0]+' · This word is now worth 10 points');hint.disabled=true;});
  function show(){hinted=false;hint.disabled=false;locked=false;const w=words[round][0];let scrambled=shuffle([...w],random).join('');if(scrambled===w)scrambled=w.slice(1)+w[0];letters.textContent=scrambled;clue.textContent=words[round][1];input.value='';status('Word '+(round+1)+' of 5 · Score '+score);}
  on(form,'submit',e=>{e.preventDefault();if(locked)return;if(input.value.trim().toUpperCase()!==words[round][0]){status('Try another arrangement. You can use a hint.');return;}locked=true;score+=hinted?10:20;round++;if(round===5){submit.disabled=true;hint.disabled=true;input.disabled=true;done(score,'Five words found. Beautifully untangled.');}else show();});show();
 }else if(id==='math'||id==='trivia'||id==='tap'){
  let round=0,score=0,locked=false;const total=id==='math'?10:id==='tap'?10:5;const prompt=el('h3');prompt.style.margin='35px 0';const area=el('div');
  const bank=shuffle([
   ['Which planet is known as the Red Planet?',['Mars','Venus','Jupiter','Mercury'],0,'Iron minerals give Mars its reddish surface.'],
   ['How many sides does a hexagon have?',['5','6','7','8'],1,'Hexa means six.'],
   ['Which ocean is largest?',['Atlantic','Indian','Pacific','Arctic'],2,'The Pacific is the largest ocean on Earth.'],
   ['Which gas do plants use in photosynthesis?',['Helium','Nitrogen','Carbon dioxide','Neon'],2,'Plants use carbon dioxide and water to make sugars.'],
   ['Which instrument normally has 88 keys?',['Guitar','Piano','Violin','Flute'],1,'A standard modern piano has 88 keys.'],
   ['What is the capital of Japan?',['Seoul','Tokyo','Kyoto','Beijing'],1,'Tokyo is the capital of Japan.'],
   ['Which is the largest mammal?',['Elephant','Blue whale','Giraffe','Orca'],1,'The blue whale is the largest living animal.'],
   ['How many minutes are in two hours?',['90','100','120','200'],2,'Two times 60 equals 120.'],
   ['What is water called when it freezes?',['Steam','Ice','Fog','Cloud'],1,'Ice is the solid form of water.'],
   ['Which animal is an insect?',['Spider','Butterfly','Snail','Frog'],1,'Butterflies have the six legs of an insect.'],
   ['Which shape has no corners?',['Square','Triangle','Circle','Pentagon'],2,'A circle has a continuous curved edge.'],
   ['Which direction does the Sun rise from?',['North','South','East','West'],2,'Earth rotates so the Sun appears to rise in the east.']
  ],random);
  function next(){locked=false;area.replaceChildren();status('Round '+(round+1)+' of '+total+' · Score '+score);let options,correct,explanation='';if(id==='trivia'){[prompt.textContent,options,correct,explanation]=bank[round];}else if(id==='math'){let a=integer(12)+1,b=integer(12)+1,op=integer(3);if(op===1&&b>a)[a,b]=[b,a];const answer=op===0?a+b:op===1?a-b:a*b;prompt.textContent=`${a} ${['+','−','×'][op]} ${b} = ?`;options=shuffle([answer,answer+1,answer+3,answer+5],random);correct=options.indexOf(answer);explanation=prompt.textContent.replace('?',answer);}else{options=shuffle(['Blue','Pink','Green','Gold'],random);correct=integer(4);prompt.textContent='Catch '+options[correct];}
   const row=choices(options,i=>{if(locked)return;locked=true;row.querySelectorAll('button').forEach(x=>x.disabled=true);const good=i===correct;if(good){score+=id==='trivia'?20:10;beep();}status((good?'Correct! ':'The answer is '+options[correct]+'. ')+explanation);round++;if(round===total){done(score,'Round complete. Something small, something learned.');}else button('Next →',next,area);},area);
   if(id==='tap')row.querySelectorAll('button').forEach((x,i)=>{x.style.background={Blue:'#254f88',Pink:'#82445e',Green:'#29654b',Gold:'#6f5b1c'}[options[i]];});
  }next();
 }else if(id==='rps'){
  let round=0,score=0;const signs=['✊ Rock','✋ Paper','✌ Scissors'];const display=el('div','big-symbol','✊ ✋ ✌');display.style.fontSize='45px';const row=choices(signs,i=>{const bot=integer(3),win=(i-bot+3)%3===1;round++;if(win)score+=10;display.textContent=signs[i].split(' ')[0]+' vs '+signs[bot].split(' ')[0];status('Round '+round+'/5 · '+(i===bot?'Draw':win?'You win':'Computer wins')+' · Score '+score);if(round===5){row.querySelectorAll('button').forEach(b=>b.disabled=true);done(score,'Five quick rounds. Thanks for playing!');}});
 }else if(id==='ludo'){
  let you=0,bot=0,over=false;const board=el('div','track');const cells=Array.from({length:20},(_,i)=>el('span','',String(i+1),board));const roll=button('Roll the die',()=>{if(over)return;const a=integer(6)+1;you=Math.min(20,you+a);let b=0;if(you<20){b=integer(6)+1;bot=Math.min(20,bot+b);}cells.forEach((x,i)=>x.textContent=(i+1===you?'🔵':i+1===bot?'🩷':String(i+1))+(i+1===you&&i+1===bot?'🩷':''));status(`You rolled ${a} · Computer rolled ${b} · You ${you}/20, computer ${bot}/20`);if(you===20||bot===20){over=true;roll.disabled=true;done(you===20?100:0,you===20?'You crossed the finish line first!':'The computer reached the finish first.');}});status('Blue is you. Pink is the computer. Race to space 20.');
 }else if(id==='dice'){
  const face=el('div','big-symbol','⚄');const roll=button('Roll the die',()=>{const n=integer(6)+1;face.textContent=['⚀','⚁','⚂','⚃','⚄','⚅'][n-1];roll.disabled=true;done(n,'You rolled '+n+'. A tiny moment of chance.');});
 }else if(id==='toss'){
  const coin=el('div','big-symbol','🪙');const row=choices(['Heads','Tails'],i=>{const result=integer(2);coin.textContent=result?'T':'H';row.querySelectorAll('button').forEach(x=>x.disabled=true);done(i===result?10:0,(result?'Tails':'Heads')+'! '+(i===result?'Your guess matched.':'Another little surprise.'));});
 }else if(id==='spin'){
  const prompts=['Send someone a kind message.','Take three slow breaths.','Notice one good thing around you.','Stretch your hands and shoulders.','Thank someone who helped you.','Give your eyes a screen break.'];const wheel=el('div','wheel');el('span','','✿',wheel);const spin=button('Spin a little kindness',()=>{spin.disabled=true;const i=integer(6);wheel.style.transform=`rotate(${1080+i*60}deg)`;later(()=>done(1,prompts[i]),1600);});status('A friendly prompt, not a prediction or prize.');
 }
}
