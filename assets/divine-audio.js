(()=>{'use strict';
const music=document.getElementById('music'),sound=document.getElementById('sound');
if(!music||!sound)return;
const AudioContextType=window.AudioContext||window.webkitAudioContext;
const KEY='divine-audio-prefs';
let ctx=null,master=null;const chant=new Audio('../assets/audio/om-chant.mp3');chant.loop=true;chant.preload='none';chant.volume=.85;
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
function sync(){music.textContent='ॐ Music '+(prefs.music?'ON':'OFF');sound.textContent='🔔 Sound '+(prefs.sound?'ON':'OFF');music.setAttribute('aria-pressed',String(prefs.music));sound.setAttribute('aria-pressed',String(prefs.sound));try{localStorage.setItem(KEY,JSON.stringify({sound:prefs.sound}))}catch{}}
music.addEventListener('click',async()=>{
 if(prefs.music){chant.pause();prefs.music=false;sync();return}
 try{await chant.play();prefs.music=true;music.title='Om chanting playing';sync()}
 catch(e){prefs.music=false;sync();music.title='Om chanting could not play: '+e.message;alert('ॐ Chanting audio could not start. Check the music file and device volume.');}
});
function chime(){if(!prefs.sound)return;try{audioReady();tone(523.25,.45,.30,'sine');tone(783.99,.85,.21,'sine',.10);tone(1046.50,1.15,.12,'sine',.20)}catch{}}
sound.addEventListener('click',()=>{prefs.sound=!prefs.sound;sync();if(prefs.sound)chime()});
window.divineChime=chime;
document.addEventListener('visibilitychange',()=>{if(document.hidden){chant.pause();if(ctx)ctx.suspend().catch(()=>{});prefs.music=false;sync()}});
sync();
})();