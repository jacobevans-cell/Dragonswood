"use strict";

// EMERGENCY RECOVERY WORKER
// The previous network-first worker could turn a single failed GitHub Pages
// request into ERR_FAILED on managed Chromebooks. This replacement deliberately
// has NO fetch handler, so the browser handles every request normally.

self.addEventListener("install",event=>{
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    try{
      const keys=await caches.keys();
      await Promise.all(keys.filter(key=>key.startsWith("dragonswood-site-")).map(key=>caches.delete(key)));
    }catch(_){ }

    // Take over already-open Dragonswood tabs immediately. Because this worker
    // has no fetch listener, their next requests bypass the old cache layer.
    await self.clients.claim();

    // Remove the registration so a later navigation is fully native as well.
    try{await self.registration.unregister();}catch(_){ }

    try{
      const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true});
      for(const client of clients){
        try{client.postMessage({type:"dragonswood-site-cache-disabled"});}catch(_){ }
      }
    }catch(_){ }
  })());
});

// Intentionally no fetch event listener.
