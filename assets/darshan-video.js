/* Browser-only devotional slideshow recorder: nothing is uploaded. */
(()=>{'use strict';
const $=id=>document.getElementById(id), button=$('darshan-record'), status=$('darshan-record-status');
if(!button||!status)return;
const deities=[
 ['shiva','ॐ నమః శివాయ','Lord Shiva'],['vishnu','శ్రీమన్నారాయణ','Lord Vishnu'],
 ['lakshmi','శ్రీ మహాలక్ష్మి','Goddess Lakshmi'],['ganesha','శ్రీ గణేశాయ నమః','Lord Ganesha'],
 ['hanuman','జై హనుమాన్','Lord Hanuman'],['surya','ఓం సూర్యాయ నమః','Lord Surya'],
 ['saraswati','శ్రీ సరస్వతి దేవి','Goddess Saraswati'],['durga','జై దుర్గా మాతా','Goddess Durga']
];
const loadImage=src=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src;});
const mimeChoices=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
button.onclick=async()=>{
 if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){status.textContent='Video recording is not supported in this browser. Try Chrome or Edge on desktop.';return;}
 const chosen=mimeChoices.find(x=>MediaRecorder.isTypeSupported(x));
 if(!chosen){status.textContent='Your browser cannot record a compatible video format.';return;}
 button.disabled=true;let recorder,ctx,audio,sourceNode,canvas,stream;const objectUrls=[];
 try{
  const personal=Array.from($('darshan-photos')?.files||[]).filter(f=>f.type.startsWith('image/')).slice(0,12);
  const photos=await Promise.all(personal.map(async file=>{const url=URL.createObjectURL(file);objectUrls.push(url);return {image:await loadImage(url),label:'My Divine Darshan',telugu:'శుభం భూయాత్'};}));
  const classic=await Promise.all(deities.map(async ([id,telugu,label])=>({image:await loadImage('assets/divine-ai/'+id+'.jpg'),telugu,label})));
  const slides=[...classic,...photos].filter(s=>s.image);
  if(!slides.length)throw Error('No available images. Check God images or choose your own photos.');
  // The private business preview is deliberately excluded from a downloadable devotional video.
  canvas=document.createElement('canvas');canvas.width=540;canvas.height=960;const g=canvas.getContext('2d',{alpha:false});
  stream=canvas.captureStream(24);
  const song=$('darshan-song')?.files?.[0];const audioUrl=song?URL.createObjectURL(song):'assets/audio/om-chant.mp3';if(song)objectUrls.push(audioUrl);
  audio=new Audio(audioUrl);audio.loop=true;audio.preload='auto';audio.volume=1;
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(AudioContext){ctx=new AudioContext();await ctx.resume();const destination=ctx.createMediaStreamDestination();sourceNode=ctx.createMediaElementSource(audio);const volume=ctx.createGain();volume.gain.value=Number($('darshan-volume')?.value||35)/100;sourceNode.connect(volume).connect(destination);destination.stream.getAudioTracks().forEach(track=>stream.addTrack(track));}
  const currentMusic=$('darshan-music');if(currentMusic?.getAttribute('aria-pressed')==='true')currentMusic.click();
  const options={mimeType:chosen,videoBitsPerSecond:2100000};recorder=new MediaRecorder(stream,options);const chunks=[];
  recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
  recorder.onerror=e=>{status.textContent='Recording failed: '+(e.error?.message||'unknown error')};
  const finish=new Promise((resolve,reject)=>{recorder.onstop=resolve;recorder.onerror=e=>reject(e.error||new Error('Recorder error'))});
  // Draw 15 seconds of 9:16 video and matching audio. Keeping rendering local preserves user privacy.
  const started=performance.now(),duration=15000;
  function render(now){
   const elapsed=Math.min(duration,now-started),index=Math.floor(elapsed/3000)%slides.length,slide=slides[index];
   const w=canvas.width,h=canvas.height;const bg=g.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#251146');bg.addColorStop(.48,'#6c325b');bg.addColorStop(1,'#140d38');g.fillStyle=bg;g.fillRect(0,0,w,h);
   g.shadowColor='#ffc96e';g.shadowBlur=28;g.strokeStyle='#ffe2a5';g.lineWidth=5;g.strokeRect(22,80,w-44,776);g.shadowBlur=0;
   if(slide.image){const iw=slide.image.naturalWidth,ih=slide.image.naturalHeight;const scale=Math.min((w-58)/iw,670/ih);const sw=iw*scale,sh=ih*scale;g.drawImage(slide.image,(w-sw)/2,102+(690-sh)/2,sw,sh);}
   const shade=g.createLinearGradient(0,600,0,900);shade.addColorStop(0,'#190a2c00');shade.addColorStop(1,'#100919ef');g.fillStyle=shade;g.fillRect(28,570,w-56,288);
   g.textAlign='center';g.shadowColor='#000';g.shadowBlur=12;g.fillStyle='#ffdfa0';g.font='bold 25px sans-serif';g.fillText('🪔 DIVINE DARSHAN 🪔',w/2,53);
   g.fillStyle='#fff1d3';g.font='bold 27px sans-serif';g.fillText(slide.telugu||'ఓం నమః శివాయ',w/2,760,w-65);
   g.fillStyle='#ffffff';g.font='bold 24px sans-serif';g.fillText(slide.label,w/2,799,w-65);
   g.fillStyle='#ffce87';g.font='20px sans-serif';g.fillText('ॐ  Peace • Devotion • Blessings  ॐ',w/2,912,w-44);
   g.shadowBlur=0;g.fillStyle='#ffc96e';g.fillRect(30,876,(w-60)*elapsed/duration,4);
   if(elapsed<duration)requestAnimationFrame(render);
  }
  render(started);recorder.start(300);try{await audio.play()}catch(e){status.textContent='Audio playback was blocked or unsupported. Recording visuals; try another MP3 for sound.'}
  status.textContent='🔴 Recording 15-second devotional status on this device. Keep this page open.';
  await new Promise(resolve=>setTimeout(resolve,duration));if(recorder.state!=='inactive')recorder.stop();await finish;
  if(!chunks.length)throw Error('The browser did not produce a video file.');
  const type=recorder.mimeType||chosen,ext=type.includes('mp4')?'mp4':'webm',blob=new Blob(chunks,{type});const output=URL.createObjectURL(blob);const a=document.createElement('a');a.href=output;a.download='Divine-Darshan-Status.'+ext;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(output),60000);
  status.textContent=ext==='mp4'?'✅ MP4 downloaded with selected audio. Share it to WhatsApp Status.':'✅ WebM downloaded. WhatsApp Status may require MP4 conversion depending on your phone. No files were uploaded.';
 }catch(e){status.textContent='Video export: '+(e.message||'Failed. Please try Chrome with an MP3.');if(recorder?.state==='recording')recorder.stop();}
 finally{button.disabled=false;if(audio){audio.pause();audio.src=''}if(ctx)ctx.close().catch(()=>{});if(stream)stream.getTracks().forEach(t=>t.stop());objectUrls.forEach(u=>URL.revokeObjectURL(u));}
};
})();
