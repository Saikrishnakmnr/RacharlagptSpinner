(()=>{'use strict';
const $=id=>document.getElementById(id);if(!$('darshan-image'))return;
const slides=[
['shiva','ॐ నమః శివాయ • Lord Shiva','మనసులో శాంతిని కనుగొనండి • Find peace within.'],
['vishnu','శ్రీమన్నారాయణ • Lord Vishnu','ధర్మం మనకు మార్గదర్శి • Let goodness guide your path.'],
['lakshmi','శ్రీ మహాలక్ష్మి • Goddess Lakshmi','కృతజ్ఞతలో ఆనందం • Gratitude brings joy.'],
['ganesha','శ్రీ గణేశాయ నమః • Lord Ganesha','శుభారంభం • Every beginning holds possibility.'],
['hanuman','జై హనుమాన్ • Lord Hanuman','ధైర్యం మరియు భక్తి • Courage and devotion.'],
['surya','ఓం సూర్యాయ నమః • Lord Surya','ప్రతి ఉదయం కొత్త ఆశ • Every sunrise brings hope.'],
['saraswati','శ్రీ సరస్వతి దేవి • Goddess Saraswati','జ్ఞానమే వెలుగు • Knowledge lights the way.'],
['durga','జై దుర్గా మాతా • Goddess Durga','శక్తి మనలోనే ఉంది • Strength lives within.']
];let index=0,paused=false,custom=null,personalPhotos=[],audio=null,objectUrl=null,ctx=null,osc=[],gain=null,musicOn=false,melodyTimer=null,melodyStep=0;
const dots=$('darshan-dots');function refreshDots(){dots.replaceChildren();for(let j=0;j<slides.length+(custom?1:0)+personalPhotos.length;j++){const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Show slide '+(j+1));b.addEventListener('click',()=>show(j));dots.appendChild(b)}}slides.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Show '+s[1]);b.addEventListener('click',()=>show(i));dots.appendChild(b)});
function imageSrc(key){return 'assets/divine-ai/'+key+'.jpg'}
function fallback(key){return 'assets/divine-art/'+key+'.svg'}
function show(i){const total=slides.length+(custom?1:0)+personalPhotos.length;index=(i+total)%total;const personal=index>=slides.length+(custom?1:0);const photo=personal?personalPhotos[index-slides.length-(custom?1:0)]:null;const data=personal?['','🖼 '+photo.name,'Your personal devotional image • Only on your device']:custom&&index===slides.length?custom:slides[index],img=$('darshan-image');img.onerror=()=>{img.onerror=null;img.src=fallback(data[0]||'shiva')};img.src=personal?photo.url:custom&&index===slides.length?fallback('shiva'):imageSrc(data[0]);img.alt=personal?'Visitor-selected devotional image':custom&&index===slides.length?'Business promotion preview':'Devotional artwork: '+data[1];img.classList.remove('darshan-fade');void img.offsetWidth;img.classList.add('darshan-fade');$('darshan-name').textContent=data[1];$('darshan-quote').textContent=data[2];Array.from(dots.children).forEach((b,j)=>b.setAttribute('aria-current',String(j===index)));if(custom&&index===slides.length){$('business-status').textContent='Private preview only — not published. '+custom[3]}}
$('darshan-next').addEventListener('click',()=>show(index+1));$('darshan-prev').addEventListener('click',()=>show(index-1));$('darshan-pause').addEventListener('click',()=>{paused=!paused;$('darshan-pause').textContent=paused?'▶ Resume slides':'⏸ Pause slides';$('darshan-pause').setAttribute('aria-pressed',String(paused))});
setInterval(()=>{if(!paused&&!document.hidden)show(index+1)},6500);document.addEventListener('visibilitychange',()=>{if(document.hidden&&musicOn)stopMusic()});
const vol=()=>(Number($('darshan-volume').value)||0)/100;$('darshan-volume').addEventListener('input',()=>{$('darshan-volume-value').textContent=$('darshan-volume').value+'%';if(audio)audio.volume=vol();if(gain)gain.gain.value=vol()*.9});
const templeNotes=[261.63,293.66,329.63,392,440,392,329.63,293.66,261.63,246.94,220,246.94];
function playTempleTone(freq,duration=0.55,level=.24,delay=0){
 if(!ctx||!gain)return;
 const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();
 o.type='sine';o.frequency.setValueAtTime(freq,t);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(level,t+.04);
 g.gain.exponentialRampToValueAtTime(.0001,t+duration);
 o.connect(g);g.connect(gain);o.start(t);o.stop(t+duration+.03);
}
function nextTempleNote(){if(!musicOn||!ctx||document.hidden)return;
 playTempleTone(templeNotes[melodyStep%templeNotes.length]);
 if(melodyStep%4===0)playTempleTone(130.81,2,.10);
 melodyStep++;
}
function stopSynth(){if(melodyTimer!==null){clearInterval(melodyTimer);melodyTimer=null};osc.forEach(o=>{try{o.stop()}catch(e){}});osc=[];if(ctx){ctx.close().catch(()=>{});ctx=null;gain=null}}
function stopMusic(){musicOn=false;if(audio)audio.pause();stopSynth();$('darshan-music').textContent='♫ Music OFF';$('darshan-music').setAttribute('aria-pressed','false')}
async function startMusic(){
 if(audio){audio.volume=vol();await audio.play()}
 else{
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)throw Error('Audio not supported');
  ctx=new AC();await ctx.resume();gain=ctx.createGain();gain.gain.value=vol()*.9;gain.connect(ctx.destination);
 }
 musicOn=true;
 if(!audio){nextTempleNote();melodyTimer=setInterval(nextTempleNote,730)}
 $('darshan-music').textContent='♫ Music ON';$('darshan-music').setAttribute('aria-pressed','true');
}
$('darshan-music').addEventListener('click',async()=>{if(musicOn){stopMusic();return}try{await startMusic();$('darshan-audio-status').textContent=audio?'Playing your selected song (only on this device).':'Playing gentle devotional instrumental melody. Use volume control or choose your own song.'}catch(e){stopMusic();$('darshan-audio-status').textContent='Could not play audio. Please select a supported audio file.'}});
$('darshan-song').addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('audio/')){$('darshan-audio-status').textContent='Please select an audio file.';return}stopMusic();if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(file);audio=new Audio(objectUrl);audio.loop=true;audio.volume=vol();$('darshan-audio-status').textContent='Selected: '+file.name+' — press Music ON to play. File stays on this device.'});
$('darshan-reset-song').addEventListener('click',()=>{stopMusic();if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;audio=null;$('darshan-song').value='';$('darshan-audio-status').textContent='Default devotional instrumental melody selected. Press Music ON to play.'});
$('business-preview').addEventListener('click',()=>{const name=$('business-name').value.trim(),raw=$('business-url').value.trim();let url;try{url=new URL(raw);if(!['https:','http:'].includes(url.protocol))throw Error()}catch(e){$('business-status').textContent='Enter a valid http(s) business website.';return}if(!name){$('business-status').textContent='Enter a business name.';return}custom=['temple','🏪 '+name,'Private business preview • '+url.hostname,url.href];refreshDots();show(slides.length);$('business-status').textContent='Private preview created. It is not public or submitted.'});
$('business-remove').addEventListener('click',()=>{custom=null;refreshDots();show(0);$('business-status').textContent='Preview removed.'});
$('darshan-photos').addEventListener('change',e=>{const files=Array.from(e.target.files||[]).filter(f=>f.type.startsWith('image/')&&f.size<=12*1024*1024).slice(0,12);if(!files.length){$('darshan-audio-status').textContent='Select JPG/PNG/WebP images under 12 MB each.';return}personalPhotos.forEach(p=>URL.revokeObjectURL(p.url));personalPhotos=files.map(f=>({name:f.name,url:URL.createObjectURL(f)}));refreshDots();show(slides.length+(custom?1:0));$('darshan-audio-status').textContent=personalPhotos.length+' personal images added to this browser session. Nothing was uploaded.'});
$('darshan-clear-photos').addEventListener('click',()=>{personalPhotos.forEach(p=>URL.revokeObjectURL(p.url));personalPhotos=[];$('darshan-photos').value='';refreshDots();show(0)});
refreshDots();show(0);
})();