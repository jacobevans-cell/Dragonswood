(function(){
  "use strict";

  const script=document.currentScript;
  const scriptUrl=script?.src?new URL(script.src,location.href):null;
  const productionHost=location.hostname==="jacobevans-cell.github.io";
  const localTest=["localhost","127.0.0.1"].includes(location.hostname)&&new URLSearchParams(location.search).get("dw-site-cache-test")==="1";
  if((!productionHost&&!localTest)||!scriptUrl||!("serviceWorker" in navigator)||!(["https:","http:"].includes(location.protocol)))return;

  const rootUrl=new URL("./",scriptUrl);
  const workerUrl=new URL("dragonswood-sw.js",rootUrl);
  const FIRST_CONTROL_KEY="dwSiteCacheFirstControlV1";
  const VERSION_KEY="dwSiteVersionSeenV1";
  const DISMISSED_KEY="dwSiteVersionDismissedV1";
  const versionUrl=script.dataset.versionUrl||(
    localTest
      ?new URL("tools/site-cache/browser-version.json",rootUrl).href
      :"https://raw.githubusercontent.com/jacobevans-cell/Dragonswood/refs/heads/automation/site-version/dragonswood-version.json"
  );
  const controlledAtStart=Boolean(navigator.serviceWorker.controller);

  function reloadOnce(key){
    try{
      if(sessionStorage.getItem(key)==="1")return false;
      sessionStorage.setItem(key,"1");
    }catch(_){return false}
    location.reload();
    return true;
  }

  async function install(){
    const registration=await navigator.serviceWorker.register(workerUrl.href,{scope:rootUrl.href,updateViaCache:"none"});
    await registration.update().catch(()=>{});
    await navigator.serviceWorker.ready;

    // A service worker cannot control the page that installed it. Reload once
    // so the very first visit also receives network-fresh HTML, JS, CSS, JSON,
    // and narration manifests without requiring Ctrl+Shift+R.
    if(!controlledAtStart){
      setTimeout(()=>reloadOnce(FIRST_CONTROL_KEY),120);
    }
  }

  function stored(storage,key,value){
    try{
      if(value===undefined)return storage.getItem(key)||"";
      storage.setItem(key,value);return value;
    }catch(_){return ""}
  }

  function showUpdate(version){
    if(document.getElementById("dwSiteUpdateReady"))return;
    const banner=document.createElement("aside");
    banner.id="dwSiteUpdateReady";
    banner.setAttribute("role","status");
    banner.setAttribute("aria-live","polite");
    banner.style.cssText="position:fixed;z-index:2147483646;right:16px;bottom:16px;width:min(390px,calc(100vw - 32px));padding:14px;border:2px solid #f7cf62;border-radius:14px;background:#080923f5;color:#fff;box-shadow:0 16px 48px #000b;font:14px/1.4 Arial,sans-serif";
    banner.innerHTML='<strong style="display:block;color:#ffe58e;font:900 18px Georgia,serif">🐉 Dragonswood update ready</strong><span style="display:block;margin:6px 0 10px">New website changes are available. Your progress and settings will be kept.</span><div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" data-dw-update-later style="border:1px solid #8c83a8;border-radius:8px;background:#25213d;color:#fff;padding:8px 12px;font-weight:800">Later</button><button type="button" data-dw-update-now style="border:1px solid #f7cf62;border-radius:8px;background:#5633a8;color:#fff;padding:8px 12px;font-weight:900">Update now</button></div>';
    banner.querySelector("[data-dw-update-later]").onclick=()=>{stored(sessionStorage,DISMISSED_KEY,version);banner.remove()};
    banner.querySelector("[data-dw-update-now]").onclick=()=>{stored(localStorage,VERSION_KEY,version);stored(sessionStorage,DISMISSED_KEY,"");location.reload()};
    document.body.append(banner);
  }

  let versionCheck=null;
  async function checkVersion(){
    if(document.visibilityState==="hidden"||versionCheck)return versionCheck;
    versionCheck=(async()=>{
      try{
        const url=new URL(versionUrl);url.searchParams.set("dw",Date.now());
        const response=await fetch(url,{cache:"no-store"});
        if(!response.ok)return;
        const payload=await response.json();
        const version=String(payload.sha||payload.version||"").trim();
        if(!/^[a-zA-Z0-9._-]{1,80}$/.test(version))return;
        const seen=stored(localStorage,VERSION_KEY);
        if(!seen){stored(localStorage,VERSION_KEY,version);return}
        if(version!==seen&&stored(sessionStorage,DISMISSED_KEY)!==version)showUpdate(version);
      }catch(_){/* The version signal is optional while offline. */}
    })().finally(()=>{versionCheck=null});
    return versionCheck;
  }

  let controllerChanged=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{
    if(controllerChanged)return;
    controllerChanged=true;
    // Only reload an already-controlled page when the worker itself changes.
    // Ordinary site pushes are handled by the worker's network-first policy.
    if(controlledAtStart&&navigator.serviceWorker.controller)location.reload();
  });

  install().then(checkVersion).catch(error=>console.warn("Dragonswood site updater unavailable:",error?.message||error));
  addEventListener("pageshow",checkVersion);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)checkVersion()});
  setInterval(checkVersion,300000);
})();
