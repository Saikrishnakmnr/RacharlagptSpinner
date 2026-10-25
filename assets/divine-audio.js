(()=>{'use strict';
const music=document.getElementById('music'),sound=document.getElementById('sound');
if(!music||!sound)return;
const AudioContextType=window.AudioContext||window.webkitAudioContext;
const KEY='divine-audio-prefs';
let ctx=null,master=null,timer=null,step=0;
let prefs={music:false,sound:false};
try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');prefs.sound=!!saved.sound}catch{}
function audioReady(){
 if(!AudioContextType)throw Error('Browser audio not available');
 if(!ctx){ctx=new AudioContextType();master=ctx.createGain();master.gain.value=.70;master.connect(ctx.destination)}
 if(ctx.state!=='running')ctx.resume().catch(()=>{});
}
function tone(hz,seconds=.5,volume=.22,type='sine',delay=0){
 if(!ctx||!master)return;
 const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();
 o.type=type;o.frequency.setValueAtTime(hz,t);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.025);
 g.gain.exponentialRampToValueAtTime(.0001,t+seconds);
 o.connect(g);g.connect(master);o.start(t);o.stop(t+seconds+.03);
}
const melody=[261.63,293.66,329.63,392,329.63,293.66,261.63,220,246.94,293.66,329.63,293.66,261.63,220,196,220];
function playBeat(){if(!prefs.music||!ctx)return;
 tone(melody[step%melody.length],.65,.19,'sine');
 if(step%4===0){tone(130.81,2.2,.075,'sine');tone(196,1.5,.035,'triangle')}
 step++;
}
function stopBeat(){if(timer!==null){clearInterval(timer);timer=null}}
function sync(){music.textContent='ॐ Music '+(prefs.music?'ON':'OFF');sound.textContent='🔔 Sound '+(prefs.sound?'ON':'OFF');music.setAttribute('aria-pressed',String(prefs.music));sound.setAttribute('aria-pressed',String(prefs.sound));try{localStorage.setItem(KEY,JSON.stringify({sound:prefs.sound}))}catch{}}
music.addEventListener('click',()=>{
 try{audioReady();prefs.music=!prefs.music;stopBeat();if(prefs.music){playBeat();timer=setInterval(playBeat,740)}sync()}
 catch(e){prefs.music=false;sync();music.title='Audio unavailable: '+e.message}
});
function chime(){if(!prefs.sound)return;try{audioReady();tone(523.25,.45,.30,'sine');tone(783.99,.85,.21,'sine',.10);tone(1046.50,1.15,.12,'sine',.20)}catch{}}
sound.addEventListener('click',()=>{prefs.sound=!prefs.sound;sync();if(prefs.sound)chime()});
window.divineChime=chime;
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopBeat();if(ctx)ctx.suspend().catch(()=>{})}else if(prefs.music){try{audioReady();stopBeat();playBeat();timer=setInterval(playBeat,740)}catch{}}});
sync();
})();