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
  return `<div class="lesson-video" data-video-id="${esc(v.id)}" data-video-progress="${esc(JSON.stringify(p||{resource:v.resource,position:0,frontier:0,seconds:0,requiredSeconds:v.durationSeconds*.9,durationSeconds:v.durationSeconds,complete:false}))}" data-video-sources="${esc(JSON.stringify(lessonVideoSources(v)))}"><div class="row"><h3>${esc(v.title)}</h3><span class="tag">Required video</span></div><video class="video" controls playsinline preload="metadata" disablepictureinpicture disableremoteplayback aria-label="${esc(v.title)}" src="${esc(lessonVideoSource(v))}"></video><div class="row"><p class="small muted">Use the video controls to play, pause, rewind, mute or enter full screen. Finish watching to unlock your questions; skipping ahead does not count.</p><label class="video-speed">Speed <select data-video-rate aria-label="Playback speed">${PLAYBACK_RATES.map(r=>`<option value="${r}" ${r===preferredSpeed()?'selected':''}>${r}×${r===1?' · Normal':''}</option>`).join('')}</select></label></div><p data-video-error class="notice error" role="alert" hidden></p><button class="btn quiet" data-video-retry hidden>Reconnect video progress</button><p data-video-position class="small muted">${time(p?.position)}${v.durationSeconds?' / '+time(v.durationSeconds):''}</p><progress data-video-progress max="100" value="${p?.requiredSeconds?Math.min(100,100*p.seconds/p.requiredSeconds):0}" aria-label="Required video watch progress"></progress><p data-video-status role="status">${p?.complete?'✓ Video watched. Your activity is unlocked.':'Press Play to begin. Your watched time saves automatically.'}</p></div>`;
}

export {bindLessonVideos} from './video-player.js';
