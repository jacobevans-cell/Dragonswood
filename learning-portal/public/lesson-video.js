import { lessonVideoSource, lessonVideoSources } from "./video-delivery.js?v=dragon-path-11";
import { PLAYBACK_RATES, validPlaybackRate } from "./video-policy.js?v=dragon-path-11";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const time = (s) =>
  `${Math.floor((s || 0) / 60)}:${String(Math.floor((s || 0) % 60)).padStart(2, "0")}`;
function preferredSpeed() {
  try {
    const rate = Number(localStorage.getItem("dw-video-speed"));
    return validPlaybackRate(rate) ? rate : 1;
  } catch {
    return 1;
  }
}
// Delivery may change; the server's video ID, duration and viewing receipt do not.
const mediaHostHealth=new Map();
const hostOf=url=>{try{return new URL(url).origin;}catch{return null;}};
const retryableDelivery=error=>!error.status||[408,429,500,502,503,504].includes(error.status);
export async function loadLessonMedia(video, sources, {
  signal, onStatus = () => {}, timeoutMs = 8000,
} = {}) {
  const candidates = [...new Set(sources.filter(Boolean))];
  // Remember recent delivery failures only in this page. Every candidate is
  // retained; no URL, lesson identity, or watch receipt is rewritten.
  const score=url=>{const health=mediaHostHealth.get(hostOf(url));return health&&Date.now()-health.at<300000?health.score:0;};
  candidates.sort((a,b)=>score(b)-score(a));
  if (signal?.aborted) throw new DOMException("Video opening cancelled.", "AbortError");
  if (!video.error && video.readyState >= 1 && candidates.includes(video.getAttribute("src"))) return;
  for (let index = 0; index < candidates.length; index++) {
    if (signal?.aborted) throw new DOMException("Video opening cancelled.", "AbortError");
    onStatus(index ? "Trying another copy of this lesson…" : "Loading lesson video…");
    try {
      await new Promise((resolve, reject) => {
        let timer;
        const done = (failure) => {
          clearTimeout(timer);
          video.removeEventListener("loadedmetadata", loaded);
          video.removeEventListener("error", failed);
          signal?.removeEventListener("abort", cancelled);
          failure ? reject(failure) : resolve();
        };
        const loaded = () => done();
        const failed = () => done(new Error("This video copy could not load."));
        const cancelled = () => {
          video.pause();
          done(new DOMException("Video opening cancelled.", "AbortError"));
        };
        video.addEventListener("loadedmetadata", loaded, { once: true });
        video.addEventListener("error", failed, { once: true });
        signal?.addEventListener("abort", cancelled, { once: true });
        timer = setTimeout(failed, timeoutMs);
        video.preload = "metadata";
        // The native element may already be fetching this source from its HTML.
        if(video.getAttribute('src')!==candidates[index]||video.error||video.networkState!==2){
          video.setAttribute("src", candidates[index]);
          video.load();
        }
      });
      if(hostOf(candidates[index]))mediaHostHealth.set(hostOf(candidates[index]),{score:1,at:Date.now()});
      return;
    } catch (failure) {
      if (failure.name === "AbortError") throw failure;
      if(hostOf(candidates[index]))mediaHostHealth.set(hostOf(candidates[index]),{score:-1,at:Date.now()});
    }
  }
  throw new Error("The lesson video could not load. Check the connection and try Play again.");
}
export function lockedVideo(v, p) {
  return `<div class="lesson-video" data-video-id="${esc(v.id)}" data-video-sources="${esc(JSON.stringify(lessonVideoSources(v)))}"><div class="row"><h3>${esc(v.title)}</h3><span class="tag">Required video</span></div><video class="video" controls playsinline preload="metadata" disablepictureinpicture disableremoteplayback aria-label="${esc(v.title)}" src="${esc(lessonVideoSource(v))}"></video><div class="row"><p class="small muted">Use the video controls to play, pause, rewind, mute or enter full screen. Finish watching to unlock your questions; skipping ahead does not count.</p><label class="video-speed">Speed <select data-video-rate aria-label="Playback speed">${PLAYBACK_RATES.map(r=>`<option value="${r}" ${r===preferredSpeed()?'selected':''}>${r}×${r===1?' · Normal':''}</option>`).join('')}</select></label></div><p data-video-error class="notice error" role="alert" hidden></p><button class="btn quiet" data-video-retry hidden>Reconnect video progress</button><p data-video-position class="small muted">${time(p?.position)}${v.durationSeconds?' / '+time(v.durationSeconds):''}</p><progress data-video-progress max="100" value="${p?.requiredSeconds?Math.min(100,100*p.seconds/p.requiredSeconds):0}" aria-label="Required video watch progress"></progress><p data-video-status role="status">${p?.complete?'✓ Video watched. Your activity is unlocked.':'Your watched time saves automatically. Preparing your saved place…'}</p></div>`;
}

export function bindLessonVideos({root=document,grade,api,onProgress}) {
  const cleanups=[];
  // The server allows one viewing session per account. Only the first player
  // prepares a session automatically; selecting another drains the former one.
  let selected=null,selection=Promise.resolve();
  function select(player) {
    const next=selection.then(async()=>{
      if(!player.active())return false;
      if(selected!==player){if(selected)await selected.deactivate();selected=player;}
      return player.active();
    });
    selection=next.catch(()=>{});return next;
  }
  root.querySelectorAll('[data-video-id]').forEach((box,index)=>{
    const video=box.querySelector('video'),speed=box.querySelector('[data-video-rate]'),status=box.querySelector('[data-video-status]'),error=box.querySelector('[data-video-error]'),retry=box.querySelector('[data-video-retry]');
    let active=true,token=null,sequence=0,progress=null,chain=Promise.resolve(),pendingReceipts=0,preparing=null,mediaPromise=null;
    let transition=false,wantPlay=false,rate=Number(speed.value),stablePosition=0,checkpointPosition=0,internalSeek=null,suppressPlay=0,suppressPause=0;
    const controller=new AbortController(),listeners=[];
    const listen=(target,event,handler)=>{target.addEventListener(event,handler);listeners.push(()=>target.removeEventListener(event,handler));};
    const alive=()=>active&&selected===player;
    const pausePosition=()=>video.seeking?Math.max(stablePosition,checkpointPosition):video.currentTime;
    function pauseMedia(){if(!video.paused){suppressPause++;video.pause();}}
    async function playMedia(){
      if(!alive()||!wantPlay||document.hidden)return;
      if(video.paused){suppressPlay++;try{await video.play();}catch(e){suppressPlay=Math.max(0,suppressPlay-1);wantPlay=false;if(active)status.textContent='Use the video’s Play button to continue.';}}
    }
    function seekMedia(position){stablePosition=position;if(Math.abs(video.currentTime-position)>.01){internalSeek=position;video.currentTime=position;}}
    function showError(message){
      token=null;wantPlay=false;pauseMedia();
      if(!active)return;
      error.hidden=false;error.textContent=message+' Your saved work and confirmed watched time are kept.';retry.hidden=false;
      status.textContent='Video progress needs to reconnect. Resume from your confirmed place.';
    }
    function display(p){
      progress=p;if(!active)return;
      box.querySelector('[data-video-progress]').value=Math.min(100,Math.floor(100*p.seconds/p.requiredSeconds));
      box.querySelector('[data-video-position]').textContent=`${time(video.currentTime||p.position)} / ${time(p.durationSeconds)}`;
      status.textContent=p.complete?'✓ Video watched. Your activity is unlocked.':`Lesson progress: ${Math.floor(100*p.seconds/p.requiredSeconds)}% · ${time(Math.max(0,p.requiredSeconds-p.seconds))} of the video left to watch`;
      onProgress(box.dataset.videoId,p);
    }
    function send(event,position=video.currentTime,playing=!video.paused,playbackRate=rate){
      const captured=token;
      if(!captured)return {done:Promise.resolve(false),sent:Promise.resolve(false)};
      // Never queue a sampled heartbeat behind another receipt (including Play).
      // A delayed sample would reset the server clock at an old position and
      // make the next normal pause appear to have advanced too quickly.
      if(event==='tick'&&pendingReceipts)return {done:chain,sent:Promise.resolve(false)};
      pendingReceipts++;
      checkpointPosition=position;
      let dispatched;const sent=new Promise(resolve=>dispatched=resolve);
      const done=chain.then(async()=>{
        if(token!==captured){dispatched(false);return false;}
        const payload={grade,token:captured,sequence:++sequence,event,position,playing,rate:playbackRate};
        let result;
        try{
          // Playback may start once this request is dispatched. It no longer
          // waits for a full durable checkpoint acknowledgment to show a frame.
          const request=api('/api/video/progress',payload);dispatched(true);
          try{result=await request;}catch(e){if(retryableDelivery(e))result=await api('/api/video/progress',payload);else throw e;}
          if(token===captured)display(result.progress);
          return token===captured;
        }catch(e){if(token===captured){if(e.videoProgress)display(e.videoProgress);showError(e.message);}return false;}
        finally{dispatched(false);}
      }).finally(()=>{pendingReceipts--;});
      chain=done;return {done,sent};
    }
    function media(){
      if(!mediaPromise)mediaPromise=loadLessonMedia(video,JSON.parse(box.dataset.videoSources),{signal:controller.signal,onStatus:message=>{if(active&&!token)status.textContent=message;}}).catch(e=>{mediaPromise=null;throw e;});
      return mediaPromise;
    }
    async function prepare(){
      if(preparing)return preparing;
      preparing=(async()=>{
        if(!await select(player))return false;
        await media();if(!alive())return false;
        if(token)return true;
        status.textContent='Connecting your saved video progress…';
        const session=await api('/api/video/start',{grade,videoId:box.dataset.videoId,rate});
        if(!alive())return false;
        if(Math.abs(video.duration-session.progress.durationSeconds)>1)throw Error('The video length has changed. Its source needs verification.');
        token=session.token;sequence=session.sequence;display(session.progress);checkpointPosition=progress.position;
        seekMedia(Math.min(progress.position,video.duration-.01));
        video.playbackRate=rate;error.hidden=true;retry.hidden=true;return true;
      })().catch(e=>{if(active&&e.name!=='AbortError')showError(e.message);return false;}).finally(()=>{preparing=null;});
      return preparing;
    }
    async function resume(){
      if(transition)return;
      transition=true;pauseMedia();
      try{
        if(!await prepare()||!wantPlay||!alive()||document.hidden)return;
        await chain;if(!token||!wantPlay||!alive())return;
        // A native Play event can advance a few frames before its handler pauses
        // for preparation. Resume at the confirmed checkpoint, not those frames.
        seekMedia(progress.position);
        if(video.currentTime>=video.duration-.1){if(!await send('seek',0,false).done)return;seekMedia(0);}
        const receipt=send('play',video.currentTime,true);
        if(await receipt.sent)await playMedia();
      }finally{transition=false;}
    }
    async function pauseTracked(){wantPlay=false;pauseMedia();return send('pause',pausePosition(),false).done;}
    const player={active:()=>active,deactivate:async()=>{wantPlay=false;pauseMedia();await send('pause',pausePosition(),false).done;token=null;}};
    listen(video,'play',()=>{
      if(suppressPlay){suppressPlay--;return;}
      wantPlay=true;pauseMedia();if(!transition)void resume();
    });
    listen(video,'pause',()=>{
      if(suppressPause){suppressPause--;return;}
      wantPlay=false;if(!transition&&token)send('pause',pausePosition(),false);
    });
    async function changeRate(next){
      if(next===rate)return;
      // A speed picked while the initial session is connecting must be applied
      // to that session after its response, not silently disagree with its rate.
      if(preparing&&!transition){video.playbackRate=rate;speed.disabled=true;await preparing;speed.disabled=false;if(!active)return;}
      if(!validPlaybackRate(next)||transition){video.playbackRate=rate;speed.value=String(rate);if(active&&!validPlaybackRate(next))status.textContent='Choose a speed from 0.5× to 1.5× so watched time can be verified.';return;}
      const resumeAfter=!video.paused||wantPlay,position=video.currentTime;
      transition=true;pauseMedia();video.playbackRate=rate;
      try{
        if(token){if(!await send('pause',position,false).done)return;if(!await send('rate',position,false,next).done)return;}
        rate=next;video.playbackRate=next;speed.value=String(next);
        try{localStorage.setItem('dw-video-speed',String(next));}catch{}
      }finally{transition=false;wantPlay=resumeAfter&&!!token;if(wantPlay)void resume();}
    }
    listen(speed,'change',()=>void changeRate(Number(speed.value)));
    listen(video,'ratechange',()=>void changeRate(video.playbackRate));
    listen(video,'timeupdate',()=>{
      if(!video.seeking&&internalSeek===null&&!transition)stablePosition=video.currentTime;
      if(active&&progress)box.querySelector('[data-video-position]').textContent=`${time(video.currentTime)} / ${time(progress.durationSeconds)}`;
    });
    listen(video,'seeked',()=>{if(internalSeek!==null&&Math.abs(video.currentTime-internalSeek)<.1)internalSeek=null;});
    listen(video,'seeking',()=>{
      if(internalSeek!==null&&Math.abs(video.currentTime-internalSeek)<.1)return;
      // Native timeupdate can lag a just-dispatched heartbeat. The pause that
      // precedes a seek must never move backward behind that queued checkpoint.
      const destination=video.currentTime,previous=Math.max(stablePosition,checkpointPosition);
      if(transition||!token){seekMedia(previous);if(active&&!token)status.textContent='Connecting your saved place before seeking…';return;}
      const resumeAfter=!video.paused||wantPlay,allowed=progress.complete||destination<=Math.max(progress.frontier,previous)+.05;
      transition=true;pauseMedia();seekMedia(previous);
      void(async()=>{
        try{
          if(!await send('pause',previous,false).done||!alive())return;
          if(allowed){if(!await send('seek',destination,false).done||!alive())return;seekMedia(destination);}
          else status.textContent='Watch this part first. You can rewind; skipping ahead does not count.';
        }finally{transition=false;wantPlay=resumeAfter&&!!token;if(wantPlay)void resume();}
      })();
    });
    listen(video,'ended',()=>{wantPlay=false;if(token)send('pause',video.duration,false);});
    listen(video,'error',()=>{mediaPromise=null;if(token)showError('Playback was interrupted. Reconnect to restore your saved place.');});
    listen(retry,'click',()=>{wantPlay=true;void resume();});
    const timer=setInterval(()=>{if(active&&token&&!transition&&!video.paused&&!video.seeking)send('tick');},5000);
    listen(document,'visibilitychange',()=>{if(document.hidden)void pauseTracked();});
    listen(window,'pagehide',()=>void pauseTracked());
    // Fetch only metadata automatically; do not download every full lesson.
    // Start no viewing clock until the student actually presses Play.
    void media().then(()=>{if(active&&index===0&&!selected&&!preparing)return prepare();}).catch(e=>{if(active&&e.name!=='AbortError')showError(e.message);});
    cleanups.push(()=>{
      if(!active)return;wantPlay=false;pauseMedia();if(token)send('pause',pausePosition(),false);
      active=false;controller.abort();clearInterval(timer);listeners.forEach(remove=>remove());
    });
  });
  return()=>cleanups.forEach(stop=>stop());
}
