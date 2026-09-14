// Emergency production guard for Dragon's Path startup.
// Keep the embedded lesson on the same working Firebase session as the outer portal.
(()=>{
  'use strict';
  const apiOrigin='https://dragonswood-9289e.web.app';
  const nativeFetch=globalThis.fetch.bind(globalThis);
  const hasTimeout=typeof AbortSignal!=='undefined'&&typeof AbortSignal.timeout==='function';
  const nativeTimeout=hasTimeout?AbortSignal.timeout.bind(AbortSignal):null;
  const nativeIdbOpen=globalThis.indexedDB?.open?.bind(globalThis.indexedDB)||null;

  // A token refresh and /api/session must not fight over the same tiny budget.
  if(nativeTimeout&&!AbortSignal.timeout.__dragonswoodSessionBudgetFix){
    const patchedTimeout=milliseconds=>nativeTimeout(milliseconds===30000?45000:milliseconds);
    try{Object.defineProperty(patchedTimeout,'__dragonswoodSessionBudgetFix',{value:true});AbortSignal.timeout=patchedTimeout;}catch{}
  }

  if(!globalThis.fetch.__dragonswoodSessionBudgetFix){
    const resilientFetch=(input,init={})=>{
      let url;
      try{
        const raw=typeof input==='string'||input instanceof URL?String(input):input?.url;
        url=new URL(raw,location.href);
      }catch{return nativeFetch(input,init);}
      const method=String(init?.method||input?.method||'GET').toUpperCase();
      const startupSession=nativeTimeout&&url.origin===apiOrigin&&url.pathname==='/api/session'&&method==='GET';
      if(!startupSession)return nativeFetch(input,init);
      return nativeFetch(input,{...init,signal:nativeTimeout(45000)});
    };
    try{Object.defineProperty(resilientFetch,'__dragonswoodSessionBudgetFix',{value:true});}catch{}
    globalThis.fetch=resilientFetch;
  }

  // The outer Dragonswood portal is already authenticated before this iframe opens.
  // Firebase's embedded SDK still probes IndexedDB (auth + heartbeat) before reading
  // the shared sessionStorage record. On a few managed Chromebooks that probe never
  // resolves, leaving the child frame forever on "Opening your quest…". Dragon's
  // Path does not use IndexedDB for lesson work, so make IndexedDB unavailable only
  // inside this embedded frame. Firebase then immediately falls through to the
  // already-working browser session storage used by the parent portal.
  if(window.parent!==window&&nativeIdbOpen&&globalThis.indexedDB){
    const blockedOpen=()=>{throw new DOMException('IndexedDB is disabled inside the embedded Dragon Path session.','InvalidStateError');};
    try{Object.defineProperty(globalThis.indexedDB,'open',{value:blockedOpen,configurable:true});}
    catch{try{globalThis.indexedDB.open=blockedOpen;}catch{}}
  }

  // IMPORTANT: never clear Firebase local/session storage from this iframe. It is
  // shared with the outer portal, which is visibly signed in and is the authority
  // for the student's identity. Earlier recovery code cleared that shared session
  // and could create a reload loop on the exact Chromebooks we were trying to fix.
  const stallRepairKey='dw-dragon-path-stall-repair-v2';
  const emergencyRepair=async()=>{location.reload();};
  globalThis.DWDragonPathEmergencyRepair=emergencyRepair;

  const repairAuthScreen=()=>{
    const button=document.getElementById('portal-signin');
    const help=document.getElementById('portal-signin-help');
    if(!button)return;
    const text=help?.textContent||'';
    if(/auth\/user-mismatch/i.test(text)){
      if(help)help.textContent='Dragon’s Path opened a different Google account than the main Dragonswood portal. Reload the quest to reuse the signed-in student account.';
      button.textContent='Reload Dragon’s Path';
      button.onclick=event=>{event.preventDefault();event.stopImmediatePropagation();location.reload();};
      return;
    }
    if(/session paused after inactivity|sign in again to continue/i.test(text)){
      button.textContent='Sign in again with Google';
    }
  };

  const app=document.getElementById('app');
  if(app){
    new MutationObserver(()=>{
      repairAuthScreen();
      if(!document.querySelector('[data-quest-opening]')){
        try{sessionStorage.removeItem(stallRepairKey);}catch{}
      }
    }).observe(app,{childList:true,subtree:true,characterData:true});
    repairAuthScreen();
  }

  // One automatic reload is enough to evict an already-running copy of the old
  // embedded auth code. Do not erase the parent's login while doing it.
  setTimeout(()=>{
    if(!document.querySelector('[data-quest-opening]'))return;
    let repaired=false;
    try{repaired=sessionStorage.getItem(stallRepairKey)==='1';}catch{}
    if(!repaired){
      try{sessionStorage.setItem(stallRepairKey,'1');}catch{}
      location.reload();
      return;
    }
    const status=document.querySelector('[data-quest-opening-status]');
    const retry=document.querySelector('[data-quest-opening-retry]');
    if(status)status.textContent='Dragon’s Path could not finish opening on this Chromebook. Your main Dragonswood sign-in is still safe.';
    if(retry){retry.hidden=false;retry.textContent='Reload Dragon’s Path';}
  },12000);
})();
