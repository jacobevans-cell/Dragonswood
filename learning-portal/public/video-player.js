import {loadLessonMedia} from './lesson-video.js';
import {validPlaybackRate} from './video-policy.js';
const time=s=>`${Math.floor((s||0)/60)}:${String(Math.floor((s||0)%60)).padStart(2,'0')}`;
const memory=new Map();
let tabId;
function tab(){if(tabId)return tabId;try{tabId=sessionStorage.getItem('dw-video-tab-v2');if(!tabId){tabId=crypto.randomUUID();sessionStorage.setItem('dw-video-tab-v2',tabId);}}catch{tabId=crypto.randomUUID();}return tabId;}
export function bindLessonVideos({root=document,grade,scope='preview',api,onProgress=()=>{},now=()=>Date.now(),syncMs=15000,sampleMs=5000}){
 const players=[],cleanups=[];
 for(const box of root.querySelectorAll('[data-video-id]')){
  const video=box.querySelector('video'),speed=box.querySelector('[data-video-rate]'),status=box.querySelector('[data-video-status]'),error=box.querySelector('[data-video-error]'),retry=box.querySelector('[data-video-retry]');
  const supplied=JSON.parse(box.dataset.videoProgress||'null');
  let progress=supplied||{position:0,frontier:0,seconds:0,requiredSeconds:1,durationSeconds:video.duration||0,complete:false};
  const key=`dw-video-v2:${scope}:${grade}:${progress.resource||box.dataset.videoId}:${tab()}`;
  let saved=memory.get(key);try{saved=JSON.parse(localStorage.getItem(key)||'null')||saved;}catch{}
  let state=saved?.version===2?saved:{version:2,clientId:crypto.randomUUID(),origin:now(),initialPosition:progress.position||0,initialRate:Number(speed.value)||1,sequence:0,events:[],position:progress.position||0,frontier:progress.frontier||0,rate:Number(speed.value)||1,at:0,token:null};
  let active=true,syncing=null,retryAt=0,failures=0,internalSeek=null,restored=false,stable=state.position,stableAt=state.at,trackedPlaying=false,switchingMedia=false,stallTimer,storageOK=true;
  const listeners=[],controller=new AbortController();
  const listen=(target,event,fn)=>{target.addEventListener(event,fn);listeners.push(()=>target.removeEventListener(event,fn));};
  const persist=()=>{memory.set(key,state);try{localStorage.setItem(key,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}};
  const at=()=>Math.max(state.at,(now()-state.origin)/1000);
  function display(p){
   progress=p;if(!active)return;
   box.querySelector('[data-video-progress]').value=p.requiredSeconds?Math.min(100,100*p.seconds/p.requiredSeconds):0;
   box.querySelector('[data-video-position]').textContent=`${time(video.currentTime||p.position)} / ${time(p.durationSeconds)}`;
   status.textContent=p.complete?'✓ Video watched. Your activity is unlocked.':state.events.length?`Watching · progress is syncing${storageOK?' and kept in this browser':''}.`:`Saved progress: ${Math.floor(100*p.seconds/p.requiredSeconds)}% · ${time(Math.max(0,p.requiredSeconds-p.seconds))} left to watch`;
   onProgress(box.dataset.videoId,p);
  }
  function capture(event,position=video.currentTime,playing=!video.paused,rate=state.rate,sampleAt=at()){
   if(progress.complete)return;
   if(!Number.isFinite(position))return;
   if(state.sequence===0){state.origin=now();state.at=0;sampleAt=0;}
   const e={sequence:++state.sequence,at:Math.max(state.at,sampleAt),event,position,playing,rate};
   state.events.push(e);state.at=e.at;state.position=position;state.rate=rate;trackedPlaying=playing;
   if(event!=='seek')state.frontier=Math.max(state.frontier,position);
   persist();
  }
  // A recovered page did not keep watching while it was closed. Preserve every
  // queued sample, then close that playback interval without adding coverage.
  if(state.events.length&&state.events.at(-1).playing)capture('pause',state.position,false,state.rate,state.at);
  async function sync(force=false){
   if(syncing||!state.events.length||!force&&now()<retryAt)return syncing;
   syncing=(async()=>{
    try{
     if(!state.token){
      const session=await api('/api/video/start',{protocol:2,grade,videoId:box.dataset.videoId,clientId:state.clientId,position:state.initialPosition,rate:state.initialRate});
      state.token=session.token;
      // A reply may have been lost after its exact samples were saved.
      state.events=state.events.filter(e=>e.sequence>session.sequence);persist();display(session.progress);
     }
     while(state.events.length){
      const events=state.events.slice(0,120);
      const result=await api('/api/video/progress',{protocol:2,grade,clientId:state.clientId,token:state.token,events});
      state.events=state.events.filter(e=>e.sequence>result.sequence);persist();display(result.progress);
      if(result.progress.complete){state.events=[];persist();break;}
     }
     failures=0;retryAt=0;if(active){error.hidden=true;retry.hidden=true;display(progress);}
    }catch(e){
     failures++;retryAt=now()+Math.min(30000,1000*2**Math.min(failures,5));
     if(active){
      status.textContent='Keep watching. Your watched time is waiting to sync.';
      error.hidden=true;retry.hidden=false;retry.textContent='Retry progress sync';
      if(e.status===401||e.status===403)status.textContent='Your watched time is kept here. Sign in again to finish syncing.';
      if(e.code==='VIDEO_SESSION_MISSING'){state.token=null;persist();}
      if(['VIDEO_INVALID','VIDEO_SKIP','VIDEO_SEQUENCE'].includes(e.code)){error.hidden=false;error.textContent='Some watched time could not be verified. Your saved progress is kept; retry syncing before leaving.';}
     }
    }finally{syncing=null;}
   })();return syncing;
  }
  function seekLocal(position){internalSeek=position;stable=position;video.currentTime=position;}
  function restorePosition(){
   if(restored||!video.readyState)return;restored=true;
   if(state.position>0&&state.position<video.duration-.1)seekLocal(state.position);
   video.playbackRate=state.rate;speed.value=String(state.rate);
  }
  async function recoverMedia(){
   if(switchingMedia||!active)return;
   switchingMedia=true;const resume=!video.paused,position=video.seeking?stable:video.currentTime;
   capture('pause',position,false);video.pause();
   try{
    const sources=JSON.parse(box.dataset.videoSources),current=video.getAttribute('src');
    await loadLessonMedia(video,[...sources.filter(s=>s!==current),current],{signal:controller.signal,timeoutMs:5000,onStatus:s=>{if(active)status.textContent=s;}});
    seekLocal(position);if(resume&&active&&!document.hidden)await video.play();
   }catch(e){if(active&&e.name!=='AbortError'){error.hidden=false;error.textContent='The video connection is unavailable. Your watched time is kept. Try Play again.';}}
   finally{switchingMedia=false;void sync();}
  }
  restorePosition();display(progress);
  listen(video,'loadedmetadata',restorePosition);
  listen(video,'play',()=>{
   for(const other of players)if(other!==video&&!other.paused)other.pause();
   restorePosition();
   if(document.hidden){video.pause();return;}
   // Native Play is never paused to wait for authentication or a cloud save.
   capture('play',internalSeek===null?video.currentTime:stable,true);void sync(true);
  });
  listen(video,'pause',()=>{
   if(switchingMedia||!trackedPlaying)return;
   capture('pause',video.seeking?stable:video.currentTime,false);void sync(true);
  });
  listen(video,'timeupdate',()=>{
   if(video.seeking||internalSeek!==null)return;
   stable=video.currentTime;stableAt=at();
   box.querySelector('[data-video-position]').textContent=`${time(stable)} / ${time(progress.durationSeconds||video.duration)}`;
  });
  listen(video,'seeking',()=>{
   if(internalSeek!==null&&Math.abs(video.currentTime-internalSeek)<.1)return;
   const destination=video.currentTime,wasPlaying=!video.paused;
   if(!progress.complete){
    stable=Math.max(stable,state.position);
    capture('pause',stable,false,state.rate,Math.max(state.at,stableAt));
    if(destination>Math.max(progress.frontier,state.frontier,stable)+.1){seekLocal(stable);status.textContent='Watch this part first. Rewinding is allowed; skipping ahead does not count.';}
    else{capture('seek',destination,false);stable=destination;}
    if(wasPlaying)capture('play',stable,true);
   }
   void sync(true);
  });
  listen(video,'seeked',()=>{if(internalSeek!==null&&Math.abs(video.currentTime-internalSeek)<.15)internalSeek=null;});
  const changeRate=next=>{
   if(!validPlaybackRate(next)){video.playbackRate=state.rate;speed.value=String(state.rate);return;}
   if(next===state.rate)return;
   capture('rate',video.currentTime,!video.paused,next);state.rate=next;video.playbackRate=next;speed.value=String(next);
   try{localStorage.setItem('dw-video-speed',String(next));}catch{}persist();void sync(true);
  };
  listen(speed,'change',()=>changeRate(Number(speed.value)));
  listen(video,'ratechange',()=>changeRate(video.playbackRate));
  listen(video,'ended',()=>{capture('pause',video.duration,false);void sync(true);});
  listen(video,'error',()=>void recoverMedia());
  listen(video,'waiting',()=>{clearTimeout(stallTimer);stallTimer=setTimeout(()=>{if(!video.paused&&video.readyState<3)void recoverMedia();},10000);});
  listen(video,'playing',()=>clearTimeout(stallTimer));
  listen(retry,'click',()=>void sync(true));
  listen(window,'online',()=>void sync(true));
  const pause=()=>{if(!video.paused)video.pause();if(trackedPlaying)capture('pause',video.seeking?stable:video.currentTime,false);persist();void sync(true);};
  listen(document,'visibilitychange',()=>{if(document.hidden)pause();});
  listen(window,'pagehide',pause);
  const sampleTimer=setInterval(()=>{if(active&&!video.paused&&!video.seeking&&internalSeek===null&&!switchingMedia){capture('tick');if(video.currentTime>=progress.requiredSeconds&&!progress.complete)void sync();}},sampleMs);
  const syncTimer=setInterval(()=>void sync(),syncMs);
  // Loading a page never opens or evicts another tab's viewing session.
  if(state.events.length)void sync();
  players.push(video);
  cleanups.push(()=>{if(!active)return;pause();active=false;controller.abort();clearInterval(sampleTimer);clearInterval(syncTimer);clearTimeout(stallTimer);listeners.forEach(fn=>fn());});
 }
 return()=>cleanups.forEach(fn=>fn());
}
