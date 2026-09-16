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
        video.setAttribute("src", candidates[index]);
        video.load();
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
  return `<div class="lesson-video" data-video-id="${esc(v.id)}" data-video-sources="${esc(JSON.stringify(lessonVideoSources(v)))}"><div class="row"><h3>${esc(v.title)}</h3><span class="tag">Required video · choose your pace</span></div><video class="video" playsinline preload="none" disablepictureinpicture disableremoteplayback aria-label="${esc(v.title)}" src="${esc(lessonVideoSource(v))}"></video><div class="btn-row"><button class="btn primary" data-video-play>Play lesson</button><button class="btn" data-video-back disabled>Back 10 seconds</button><button class="btn" data-video-forward disabled>Forward 10 seconds</button><label class="video-speed">Speed <select data-video-rate aria-label="Playback speed">${PLAYBACK_RATES.map((r) => `<option value="${r}" ${r === preferredSpeed() ? "selected" : ""}>${r}×${r === 1 ? " · Normal" : ""}</option>`).join("")}</select></label><button class="btn" data-video-mute aria-pressed="false">Mute</button><button class="btn" data-video-full>Full screen</button></div><p data-video-error class="notice error" role="alert" hidden></p><p data-video-position class="small muted">${time(p?.position)}${v.durationSeconds ? " / " + time(v.durationSeconds) : ""}</p><progress data-video-progress max="100" value="${p?.requiredSeconds ? Math.min(100, (100 * p.seconds) / p.requiredSeconds) : 0}" aria-label="Required video watch progress"></progress><p data-video-status role="status">${p?.complete ? "✓ Video watched. Your activity is unlocked." : "Watch the lesson to unlock your activity. Your place and watched time save automatically."}</p><p class="small muted">Choose a speed from 0.5× to 1.5×. You can pause or go back anytime. Forward 10 seconds unlocks after the viewing requirement is met. Rewatching or skipping does not add extra progress.</p></div>`;
}
export function bindLessonVideos({ root = document, grade, api, onProgress }) {
  const cleanups = [];
  root.querySelectorAll("[data-video-id]").forEach((box) => {
    const video = box.querySelector("video"),
      play = box.querySelector("[data-video-play]"),
      back = box.querySelector("[data-video-back]"),
      forward = box.querySelector("[data-video-forward]"),
      speed = box.querySelector("[data-video-rate]"),
      error = box.querySelector("[data-video-error]"),
      status = box.querySelector("[data-video-status]");
    let token = null,
      sequence = 0,
      active = true,
      busy = false,
      starting = false,
      progress = null,
      chain = Promise.resolve(),
      tickPending = false,
      adjusting = false,
      mediaController = null,
      rate = Number(speed.value);
    function showError(message) {
      video.pause();
      token = null;
      play.textContent = "Resume lesson";
      error.hidden = false;
      error.textContent =
        message +
        (progress?.complete
          ? " Your saved work and video completion are safe."
          : " Your saved work is safe. The video requirement stays pending.");
    }
    function display(p) {
      progress = p;
      if (!active) return;
      const percent = Math.min(
        100,
        Math.floor((100 * p.seconds) / p.requiredSeconds),
      );
      box.querySelector("[data-video-progress]").value = percent;
      box.querySelector("[data-video-position]").textContent =
        `${time(video.currentTime || p.position)} / ${time(p.durationSeconds)}`;
      status.textContent = p.complete
        ? "✓ Video watched. Your activity is unlocked."
        : `Lesson progress: ${percent}% · ${time(Math.max(0, p.requiredSeconds - p.seconds))} of the video left to watch`;
      back.disabled = (video.currentTime || p.position) < 1;
      forward.disabled = !p.complete || !token || !video.readyState;
      onProgress(box.dataset.videoId, p);
    }
    function send(
      event,
      position = video.currentTime,
      playing = !video.paused,
      playbackRate = rate,
    ) {
      const capturedToken = token;
      if (!capturedToken) return Promise.resolve();
      // One unacknowledged heartbeat at a time. A slow save must not queue
      // stale positions behind itself; the next heartbeat samples the player.
      if (event === "tick" && tickPending) return chain;
      if (event === "tick") tickPending = true;
      chain = chain
        .then(async () => {
          if (token !== capturedToken) return;
          const payload = {
            grade,
            token: capturedToken,
            sequence: ++sequence,
            event,
            position,
            playing,
            rate: playbackRate,
          };
          let result;
          try {
            result = await api("/api/video/progress", payload);
          } catch (e) {
            // An uncertain delivery retries its identical sequence, never adds time twice.
            if (retryableDelivery(e)) result = await api("/api/video/progress", payload);
            else throw e;
          }
          display(result.progress);
        })
        .catch((e) => {
          if (e.videoProgress) display(e.videoProgress);
          showError(e.message);
        })
        .finally(() => {
          if (event === "tick") tickPending = false;
        });
      return chain;
    }
    async function pause() {
      if (starting) return;
      video.pause();
      play.textContent = "Resume lesson";
      await send("pause", video.currentTime, false);
    }
    async function toggle() {
      if (busy) return;
      if (!video.paused) return pause();
      busy = true;
      starting = true;
      play.disabled = true;
      play.textContent = "Loading lesson…";
      error.hidden = true;
      status.textContent = "Opening this lesson video…";
      const controller = new AbortController();
      mediaController = controller;
      try {
        await chain;
        if (!active) return;
        const sources = box.dataset.videoSources
          ? JSON.parse(box.dataset.videoSources)
          : [video.getAttribute("src")];
        // A slow media-host fallback must not consume the viewing session's
        // receipt window before playback can even begin.
        await loadLessonMedia(video, sources, {
          signal: controller.signal,
          onStatus: (message) => { if (active) status.textContent = message; },
        });
        // A fresh lease restores server-confirmed progress after a pause or reload.
        if (!active) return;
        const session = await api("/api/video/start", {
            grade,
            videoId: box.dataset.videoId,
            rate,
          });
        if (!active) return;
        token = session.token;
        sequence = session.sequence;
        display(session.progress);
        if (Math.abs(video.duration - progress.durationSeconds) > 1)
          throw Error(
            "The video length has changed. Its source needs verification.",
          );
        adjusting = true;
        video.currentTime = Math.min(progress.position, video.duration - 0.01);
        adjusting = false;
        if (progress.position >= video.duration - 0.1) {
          await send("seek", 0, false);
          adjusting = true;
          video.currentTime = 0;
          adjusting = false;
        }
        video.playbackRate = rate;
        await send("play", video.currentTime, true);
        if (!token || !active || document.hidden) return;
        await video.play();
        play.textContent = "Pause lesson";
        error.hidden = true;
      } catch (e) {
        if (active) showError(e.message);
      } finally {
        controller.abort();
        if (mediaController === controller) mediaController = null;
        busy = false;
        starting = false;
        play.disabled = false;
      }
    }
    play.addEventListener("click", toggle);
    async function jump(seconds) {
      if (busy || !token || (seconds > 0 && !progress?.complete)) return;
      const wasPlaying = !video.paused;
      busy = true;
      back.disabled = forward.disabled = true;
      await pause();
      const destination = Math.min(
        video.duration,
        Math.max(0, video.currentTime + seconds),
      );
      await send("seek", destination, false);
      if (token) {
        adjusting = true;
        video.currentTime = destination;
        adjusting = false;
        if (wasPlaying && !document.hidden && destination < video.duration) {
          await send("play", destination, true);
          if (token) {
            await video.play().catch((e) => showError(e.message));
            play.textContent = video.paused ? "Resume lesson" : "Pause lesson";
          }
        }
      }
      busy = false;
      if (progress) display(progress);
    }
    back.addEventListener("click", () => jump(-10));
    forward.addEventListener("click", () => jump(10));
    speed.addEventListener("change", async () => {
      const next = Number(speed.value);
      if (busy || !validPlaybackRate(next)) {
        speed.value = String(rate);
        return;
      }
      const wasPlaying = !video.paused;
      busy = true;
      speed.disabled = true;
      await pause();
      rate = next;
      video.playbackRate = rate;
      try {
        localStorage.setItem("dw-video-speed", String(rate));
      } catch {}
      await send("rate", video.currentTime, false, rate);
      if (token && wasPlaying && !document.hidden) {
        await send("play", video.currentTime, true);
        if (token) {
          await video.play().catch((e) => showError(e.message));
          play.textContent = video.paused ? "Resume lesson" : "Pause lesson";
        }
      }
      busy = false;
      speed.disabled = false;
    });
    box.querySelector("[data-video-mute]").addEventListener("click", (e) => {
      video.muted = !video.muted;
      e.currentTarget.textContent = video.muted ? "Unmute" : "Mute";
      e.currentTarget.setAttribute("aria-pressed", String(video.muted));
    });
    box
      .querySelector("[data-video-full]")
      .addEventListener("click", () =>
        box
          .requestFullscreen?.()
          .catch(() =>
            showError(
              "Full screen is unavailable; continue in the lesson player.",
            ),
          ),
      );
    video.addEventListener("ratechange", () => {
      if (video.playbackRate !== rate) video.playbackRate = rate;
    });
    video.addEventListener("timeupdate", () => {
      forward.disabled =
        !progress?.complete || !token || !video.readyState || busy;
      if (progress)
        box.querySelector("[data-video-position]").textContent =
          `${time(video.currentTime)} / ${time(progress.durationSeconds)}`;
    });
    video.addEventListener("seeking", () => {
      if (
        !adjusting &&
        !starting &&
        progress &&
        !progress.complete &&
        video.currentTime > progress.frontier + 3 * rate
      ) {
        video.pause();
        adjusting = true;
        video.currentTime = progress.position;
        adjusting = false;
        play.textContent = "Resume lesson";
        status.textContent =
          "Skipping ahead is locked. Resume from your saved place.";
      }
    });
    video.addEventListener("ended", () => {
      play.textContent = "Replay lesson";
      send("pause", video.currentTime, false);
    });
    video.addEventListener("error", () => {
      if (!starting) showError("Playback is unavailable. Try Play again.");
    });
    const timer = setInterval(() => {
      if (!starting && !video.paused && !busy) send("tick");
    }, 5000);
    const visibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", visibility);
    const pagehide = () => pause();
    window.addEventListener("pagehide", pagehide);
    cleanups.push(() => {
      if (!active) return;
      mediaController?.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", pagehide);
      video.pause();
      pause();
      active = false;
    });
  });
  return () => cleanups.forEach((stop) => stop());
}
