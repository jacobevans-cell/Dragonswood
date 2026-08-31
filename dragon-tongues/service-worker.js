const CACHE_NAME = "dragon-tongues-v1-5-4-teach-me";
const CACHE_PREFIX = "dragon-tongues-";
const CORE_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./data/courses.js",
  "./data/additional-courses.js",
  "./data/arizona-courses.js",
  "./data/voice-library.js",
  "./data/asl-video-library.js",
  "./data/academic-engine.js",
  "./manifest.webmanifest",
  "./assets/dragon-tongues-icon.svg",
  "./assets/asl-alphabet-gallaudet.png",
  "./assets/mascot-atlas.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => caches.match(event.request))
  );
});
