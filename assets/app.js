import {games} from './catalog.js';
import {seeded} from './core.js';
import {launch} from './games.js';
const $=s=>document.querySelector(s),config=window.ARCADE_CONFIG||{};
let memoryStore={};const storage={get(k){try{return localStorage.getItem(k);}catch{return memoryStore[k]??null;}},set(k,v){try{localStorage.setItem(k,v);}catch{memoryStore[k]=v;}},remove(k){try{localStorage.removeItem(k);}catch{delete memoryStore[k];}}};
const read=(key,fallback)=>{try{return JSON.parse(storage.get(key))??fallback;}catch{return fallback;}};
const validNumber=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<1e12;
let data=read('rg_play_v2',{});if(!data||typeof data!=='object'||Array.isArray(data))data={};
data.best=data.best&&typeof data.best==='object'&&!Array.isArray(data.best)?data.best:{};for(const id of Object.keys(data.best))if(!games.some(g=>g.id===id)||!validNumber(data.best[id]))delete data.best[id];
data.favorites=Array.isArray(data.favorites)?data.favorites.filter(id=>games.some(g=>g.id===id)):[];data.completed=validNumber(data.completed)?data.completed:0;data.played=Array.isArray(data.played)?data.played.filter(id=>games.some(g=>g.id===id)):[];data.daily=data.daily&&typeof data.daily==='object'&&!Array.isArray(data.daily)?data.daily:{};
if(!data.migrated){for(const [id,key] of [['memory','rg_memory_best'],['2048','rg_2048_best'],['trivia','rg_trivia_best']]){const raw=storage.get(key),v=Number(raw);if(raw!==null&&validNumber(v))data.best[id]=v;}data.migrated=true;}
const save=()=>storage.set('rg_play_v2',JSON.stringify(data));save();
const today=()=>new Date().toISOString().slice(0,10);let filter='All',sound=false,current=null,cleanup=()=>{},daily=false,finished=false,audioCtx=null,consent=read('rg_privacy_v2','private');
function notify(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('#toast').hidden=true,3000);}
function track(name,params={}){if(consent==='adult-analytics'&&typeof window.gtag==='function')window.gtag('event',name,params);}
function startAnalytics(){if(consent!=='adult-analytics'||!config.analyticsEnabled||!/^G-[A-Z0-9]+$/.test(config.ga4||''))return;if(window.gtag)return;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});window.gtag('js',new Date());window.gtag('config',config.ga4,{allow_google_signals:false,allow_ad_personalization_signals:false});const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(config.ga4);document.head.append(s);}
startAnalytics();$('#consent').hidden=storage.get('rg_privacy_v2')!==null;
$('#accept').onclick=()=>{consent='adult-analytics';storage.set('rg_privacy_v2',JSON.stringify(consent));$('#consent').hidden=true;startAnalytics();};
$('#reject').onclick=()=>{const was=consent==='adult-analytics';consent='private';storage.set('rg_privacy_v2',JSON.stringify(consent));$('#consent').hidden=true;if(window.gtag)window.gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});if(was){document.cookie.split(';').forEach(c=>{const k=c.trim().split('=')[0];if(k.startsWith('_ga')){for(const d of ['',location.hostname,'.'+location.hostname,'.racharlagpt.in'])document.cookie=k+'=;Max-Age=0;path=/'+(d?';domain='+d:'');}});location.reload();}};
$('#privacy-settings').onclick=()=>$('#consent').hidden=false;
// Call only from the site's configured consent/age integration after reviewing the provider terms.
// Deliberately not called by the analytics consent buttons.
let adsLoaded=false;
window.arcadeSetAdConsent=({adult=false,advertising=false}={})=>{if(!config.monetagEnabled||!adult||!advertising||adsLoaded||$('#game-dialog').open)return false;const s=document.createElement('script');s.dataset.zone=config.monetagZone;s.src='https://n6wxm.com/vignette.min.js';document.body.append(s);adsLoaded=true;return true;};
if(config.sponsor&&/^https:\/\//.test(config.sponsor.url||'')){const slot=$('#sponsor-slot');slot.hidden=false;const small=document.createElement('small');small.textContent='ADVERTISEMENT · PAID SPONSORSHIP';const a=document.createElement('a');a.className='sponsor-link';a.href=config.sponsor.url;a.rel='sponsored noopener noreferrer';a.target='_blank';a.textContent=config.sponsor.name+' — '+config.sponsor.text;slot.append(small,a);}
function beep(freq=480){if(!sound)return;try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=freq;g.gain.setValueAtTime(.035,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.12);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.12);}catch{}}
$('#sound').onclick=()=>{sound=!sound;$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').textContent=sound?'♪ Sound on':'♪ Sound off';$('#sound').classList.toggle('sound-on',sound);beep();};
function render(){
 const query=$('#search').value.trim().toLowerCase();const shown=games.filter(g=>(filter==='All'||filter===g.category||(filter==='Favorites'&&data.favorites.includes(g.id)))&&(g.name+' '+g.category+' '+g.tagline).toLowerCase().includes(query));
 $('#category-title').textContent=filter==='All'?'Find your next favorite':filter==='Favorites'?'Your little collection':filter+' games';const root=$('#game-grid');root.replaceChildren();
 shown.forEach(g=>{const card=document.createElement('article');card.className='game-tile '+g.color;const a=document.createElement('a');a.href='?game='+g.id;a.className='game-link';a.innerHTML=`<div class="cover"><span class="glyph" aria-hidden="true">${g.icon}</span></div><div class="tile-info"><h3>${g.name}</h3><p>${g.tagline}</p><small>${g.category} &nbsp; · &nbsp; Free to play</small></div>`;a.addEventListener('click',e=>{e.preventDefault();openGame(g.id);});const fav=document.createElement('button');fav.className='fav';fav.textContent=data.favorites.includes(g.id)?'♥':'♡';fav.setAttribute('aria-label','Favorite '+g.name);fav.setAttribute('aria-pressed',String(data.favorites.includes(g.id)));fav.onclick=()=>{if(data.favorites.includes(g.id))data.favorites=data.favorites.filter(x=>x!==g.id);else data.favorites.push(g.id);save();render();};card.append(a,fav);root.append(card);});
 if(!shown.length){const p=document.createElement('p');p.className='empty';p.textContent=filter==='Favorites'?'Tap the heart on a game to keep it here.':'No games found. Try a shorter search or another category.';root.append(p);}
}
$('.sidebar').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));render();});$('#search').addEventListener('input',render);
let runSerial=0;
function openGame(id,isDaily=false){const game=games.find(g=>g.id===id);if(!game)return;cleanup();current=game;daily=isDaily;finished=false;const run=++runSerial,day=today();$('#arena').replaceChildren();$('#result').hidden=true;$('#result').replaceChildren();$('#game-title').textContent=(daily?'Daily · ':'')+game.name;$('#game-icon').textContent=game.icon;$('#game-category').textContent=game.category;$('#rules').textContent=game.rules;$('#guide').href='games/'+id+'.html';$('#game-status').textContent='Ready when you are.';
 const url=new URL(location.href);url.searchParams.set('game',id);if(daily)url.searchParams.set('daily','1');else url.searchParams.delete('daily');history.replaceState({},'',url);if(!$('#game-dialog').open)$('#game-dialog').showModal();
 const abort=new AbortController(),timers=new Set();cleanup=()=>{abort.abort();timers.forEach(clearTimeout);timers.clear();};
 const on=(el,type,fn)=>el.addEventListener(type,fn,{signal:abort.signal});
 const later=(fn,delay)=>{const t=setTimeout(()=>{timers.delete(t);if(run===runSerial&&!abort.signal.aborted)fn();},delay);timers.add(t);return t;};
 const button=(label,fn,parent=$('#arena'))=>{const b=document.createElement('button');b.type='button';b.textContent=label;on(b,'click',fn);parent.append(b);return b;};
 const done=(value,message='Nice play!')=>{if(finished||run!==runSerial||!validNumber(value))return;finished=true;const old=data.best[id],record=old===undefined||(game.order==='low'?value<old:value>old);if(record)data.best[id]=value;data.completed++;if(!data.played.includes(id))data.played.push(id);if(daily){const oldDaily=data.daily[day];data.daily[day]=!validNumber(oldDaily)?value:Math.min(oldDaily,value);const keys=Object.keys(data.daily).sort();while(keys.length>90)delete data.daily[keys.shift()];}save();const box=$('#result');box.hidden=false;const title=document.createElement('strong');title.textContent=value+' '+game.unit;const p=document.createElement('p');p.textContent=(record?'New personal best! ':'')+message;const note=document.createElement('small');note.textContent=daily?'Daily puzzle recorded for '+day+' (UTC).':'Saved on this device · No cash value';box.append(title,p,note);track('game_complete',{game_id:id,score:value,score_unit:game.unit,daily_challenge:daily});beep(680);updateDaily();};
 launch(id,{root:$('#arena'),button,status:s=>$('#game-status').textContent=s,done,later,on,random:daily?seeded(day+':memory-v2'):Math.random,beep});track('game_start',{game_id:id,daily_challenge:daily});
}
function closeGame(){cleanup();runSerial++;if(current&&!finished)track('game_exit',{game_id:current.id});current=null;const url=new URL(location.href);url.searchParams.delete('game');url.searchParams.delete('daily');history.replaceState({},'',url);}
$('#close-game').onclick=()=>$('#game-dialog').close();$('#game-dialog').addEventListener('close',closeGame);$('#restart').onclick=()=>{if(current)openGame(current.id,daily);};$('#share').onclick=async()=>{if(!current)return;const url='https://spin.racharlagpt.in/?game='+current.id+(daily?'&daily=1':'');const title='Play '+current.name+' with me';try{if(navigator.share)await navigator.share({title,url});else{await navigator.clipboard.writeText(url);notify('Game link copied.');}}catch(e){if(e.name!=='AbortError')notify('Copy this link: '+url);}};
$('#daily-play').onclick=()=>openGame('memory',true);$('#surprise').onclick=()=>openGame(games[Math.floor(Math.random()*games.length)].id);document.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>openGame(b.dataset.play));
function updateDaily(){const v=data.daily[today()];$('#daily-copy').textContent=validNumber(v)?'Your best today: '+v+' moves · Resets at midnight UTC. Play again whenever you like.':'Find all six pairs. Same daily board for everyone · Resets at midnight UTC.';}updateDaily();
function info(title){$('#info-title').textContent=title;$('#info-body').replaceChildren();$('#info-dialog').showModal();return $('#info-body');}
$('#close-info').onclick=()=>$('#info-dialog').close();
$('#records').onclick=()=>{const root=info('Your personal scoreboard');const p=document.createElement('p');p.textContent='These are your records on this device, not a global leaderboard. Each game has its own scoring unit. Fewer moves and lower milliseconds are better.';root.append(p);const table=document.createElement('table');table.innerHTML='<thead><tr><th>Game</th><th>Best</th><th>Goal</th></tr></thead>';const body=document.createElement('tbody');games.forEach(g=>{const tr=document.createElement('tr');[g.name,data.best[g.id]===undefined?'Not played':data.best[g.id]+' '+g.unit,g.order==='low'?'Lower is better':'Higher is better'].forEach(t=>{const td=document.createElement('td');td.textContent=t;tr.append(td);});body.append(tr);});table.append(body);root.append(table);const note=document.createElement('p');note.className='status-note';note.textContent='Completed rounds: '+data.completed+'. Previous Memory, 2048 and Quiz bests are carried over where available. Old combined points are not mixed with per-game records.';root.append(note);const reset=document.createElement('button');reset.textContent='Clear my saved game data';reset.onclick=()=>{if(!confirm('Clear your scores, favorites, achievements and daily records on this device?'))return;for(const k of ['rg_play_v2','rg_memory_best','rg_2048_best','rg_tap_best','rg_trivia_best','rg_score','rg_streak','rg_best_dice','rg_ludo_best'])storage.remove(k);location.reload();};root.append(reset);};
$('#achievements').onclick=()=>{const root=info('Little wins worth celebrating');[['First little win','Complete one round',data.completed>=1],['Curious explorer','Complete five different games',data.played.length>=5],['A moment of focus','Complete today’s daily puzzle',validNumber(data.daily[today()])],['Made it your own','Save three favorite games',data.favorites.length>=3],['Happy regular','Complete 25 rounds, at your own pace',data.completed>=25]].forEach(([name,desc,won])=>{const p=document.createElement('div');p.className='achievement';const strong=document.createElement('strong');strong.textContent=(won?'★ ':'☆ ')+name;const text=document.createElement('p');text.textContent=desc+(won?' · Achieved':'');p.append(strong,text);root.append(p);});};
render();const params=new URL(location.href).searchParams;if(games.some(g=>g.id===params.get('game')))openGame(params.get('game'),params.get('game')==='memory'&&params.get('daily')==='1');
// PWA: install is offered only when the browser signals eligibility.
let deferredInstall=null;
const installButton=document.querySelector('#install-app');
const installBanner=document.querySelector('#install-banner');
const dismissedKey='rg_install_dismissed';
const installed=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function hideInstall(){installButton.hidden=true;installBanner.hidden=true;}
function showInstall(){if(installed()||!deferredInstall)return;installButton.hidden=false;if(!sessionStorage.getItem(dismissedKey))installBanner.hidden=false;}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;showInstall();});
async function requestInstall(){
 if(!deferredInstall)return;
 const prompt=deferredInstall;deferredInstall=null;hideInstall();
 await prompt.prompt();
 try{await prompt.userChoice;}catch{}
}
installButton.addEventListener('click',requestInstall);
document.querySelector('#install-banner-button').addEventListener('click',requestInstall);
document.querySelector('#install-dismiss').addEventListener('click',()=>{sessionStorage.setItem(dismissedKey,'1');installBanner.hidden=true;});
window.addEventListener('appinstalled',()=>{deferredInstall=null;hideInstall();notify('App installed! Enjoy your games.');});
if(installed())hideInstall();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));

// Explicit opt-in to existing Monetag vignette integration; no ad-loop or artificial refresh.
const adStatus=document.querySelector('#ad-choice-status');
const adEnabled=()=>storage.get('rg_ads_optin_v1')==='true';
function updateAdChoice(){if(adStatus)adStatus.textContent=adEnabled()?'Advertising enabled for this session':'Advertising not enabled';}
const enableAds=document.querySelector('#enable-ads');
if(enableAds)enableAds.addEventListener('click',()=>{storage.set('rg_ads_optin_v1','true');const ok=window.arcadeSetAdConsent({adult:true,advertising:true});updateAdChoice();notify(ok?'Ad integration enabled. Ads appear only if available.':'Ad request not available right now.');});
const disableAds=document.querySelector('#disable-ads');
if(disableAds)disableAds.addEventListener('click',()=>{storage.set('rg_ads_optin_v1','false');updateAdChoice();notify('Preference saved. Refresh to stop any already loaded ad script.');});
updateAdChoice();
const surpriseHero=document.querySelector('#hero-surprise');
if(surpriseHero)surpriseHero.addEventListener('click',()=>document.querySelector('#surprise')?.click());
const universe=document.querySelector('#game-universe');
if(universe&&window.matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches){
 universe.addEventListener('pointermove',e=>{const r=universe.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;universe.style.setProperty('--mx',x*18+'px');universe.style.setProperty('--my',y*18+'px');});
 universe.addEventListener('pointerleave',()=>{universe.style.setProperty('--mx','0px');universe.style.setProperty('--my','0px');});
}
