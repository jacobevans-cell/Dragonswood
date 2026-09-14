(function(){
  "use strict";

  if(window.top!==window)return;
  if(location.hostname!=="jacobevans-cell.github.io")return;
  if(!("serviceWorker" in navigator))return;

  const script=document.currentScript;
  const rootUrl=script?.src?new URL("./",new URL(script.src,location.href)).href:new URL("./",location.href).href;
  const RECOVERY_KEY="dwSiteWorkerRecovery20260914";

  async function removeLegacySiteCache(){
    let hadController=Boolean(navigator.serviceWorker.controller);

    try{
      const registrations=await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(async registration=>{
        if(registration.scope.startsWith(rootUrl)){
          try{await registration.update();}catch(_){ }
          try{await registration.unregister();}catch(_){ }
        }
      }));
    }catch(_){ }

    try{
      const keys=await caches.keys();
      await Promise.all(keys.filter(key=>key.startsWith("dragonswood-site-")).map(key=>caches.delete(key)));
    }catch(_){ }

    // A worker that already controlled this tab remains attached until one
    // navigation. Reload exactly once after unregistering it.
    if(hadController){
      try{
        if(sessionStorage.getItem(RECOVERY_KEY)!=="1"){
          sessionStorage.setItem(RECOVERY_KEY,"1");
          setTimeout(()=>location.reload(),80);
          return;
        }
      }catch(_){ }
    }

    try{sessionStorage.removeItem(RECOVERY_KEY);}catch(_){ }
  }

  navigator.serviceWorker.addEventListener("message",event=>{
    if(event.data?.type==="dragonswood-site-cache-disabled"){
      try{
        if(sessionStorage.getItem(RECOVERY_KEY)!=="1"){
          sessionStorage.setItem(RECOVERY_KEY,"1");
          location.reload();
        }
      }catch(_){location.reload();}
    }
  });

  removeLegacySiteCache().catch(()=>{});
})();
