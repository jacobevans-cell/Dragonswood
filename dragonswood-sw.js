"use strict";

const CODE_CACHE="dragonswood-site-code-v5";
const MEDIA_CACHE="dragonswood-site-media-v5";
const CODE_PREFIX="dragonswood-site-code-";
const MEDIA_PREFIX="dragonswood-site-media-";

self.addEventListener("install",event=>{
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>(key.startsWith(CODE_PREFIX)&&key!==CODE_CACHE)||(key.startsWith(MEDIA_PREFIX)&&key!==MEDIA_CACHE)).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

async function networkFirst(request){
  const cache=await caches.open(CODE_CACHE);
  try{
    // "reload" is the programmatic equivalent of bypassing a stale browser
    // cache. It still allows normal HTTP validation instead of redownloading
    // an unchanged response body.
    const response=await fetch(new Request(request,{cache:"reload"}));
    if(response.ok&&response.type!=="opaque")await cache.put(request,response.clone());
    return response;
  }catch(error){
    const cached=await cache.match(request,{ignoreSearch:false});
    if(cached)return cached;
    if(request.mode==="navigate"){
      const home=await cache.match(new URL("index.html",self.registration.scope).href);
      if(home)return home;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request){
  const cache=await caches.open(MEDIA_CACHE);
  const cached=await cache.match(request,{ignoreSearch:false});
  const update=fetch(new Request(request,{cache:"no-cache"})).then(async response=>{
    if(response.ok&&response.type!=="opaque")await cache.put(request,response.clone());
    return response;
  });
  if(cached){update.catch(()=>{});return cached}
  return update;
}

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET"||request.headers.has("range"))return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  const extension=(url.pathname.match(/\.([a-z0-9]+)$/i)||[])[1]?.toLowerCase()||"";
  const freshCode=request.mode==="navigate"||
    ["script","style","worker"].includes(request.destination)||
    ["html","htm","js","mjs","css","json","webmanifest"].includes(extension)||
    /\/narration-manifest(?:\.generated)?\.(?:js|json)$/.test(url.pathname);

  if(freshCode){event.respondWith(networkFirst(request));return}

  // Audio/video is intentionally left to the browser HTTP cache. This avoids
  // duplicating the 73 MB Brian library in Cache Storage and preserves byte-
  // range playback. Brian URLs include a text hash when their content changes.
  if(["audio","video"].includes(request.destination)||["mp3","wav","ogg","mp4","webm"].includes(extension))return;

  if(["image","font"].includes(request.destination)||["png","jpg","jpeg","gif","webp","svg","ico","woff","woff2","ttf","otf"].includes(extension)){
    event.respondWith(staleWhileRevalidate(request));
  }
});
