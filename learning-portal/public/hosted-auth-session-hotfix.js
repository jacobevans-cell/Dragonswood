// Emergency production guard for Dragon's Path startup.
// Keep the production session bootstrap resilient without touching saved work.
(()=>{
  'use strict';
  const apiOrigin='https://dragonswood-9289e.web.app';
  const nativeFetch=globalThis.fetch.bind(globalThis);
  const hasTimeout=typeof AbortSignal!=='undefined'&&typeof AbortSignal.timeout==='function';
  const nativeTimeout=hasTimeout?AbortSignal.timeout.bind(AbortSignal):null;

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

  // Firebase reauthenticateWithPopup throws auth/user-mismatch when a browser has
  // more than one Google account and the wrong account is clicked. Dragonswood
  // already has a valid Firebase user at this point, so do not force another
  // account chooser. Retry the existing session instead.
  const mismatchKey='dw-auth-mismatch-reload-v1';
  const repairAuthScreen=()=>{
    const button=document.getElementById('portal-signin');
    const help=document.getElementById('portal-signin-help');
    if(!button)return;
    const mismatch=/auth\/user-mismatch/i.test(help?.textContent||'');
    const existingUser=/continue with google/i.test(button.textContent||'');
    if(mismatch){
      let reloaded=false;
      try{reloaded=sessionStorage.getItem(mismatchKey)==='1';}catch{}
      if(!reloaded){
        try{sessionStorage.setItem(mismatchKey,'1');}catch{}
        setTimeout(()=>location.reload(),50);
        return;
      }
    }else{
      try{sessionStorage.removeItem(mismatchKey);}catch{}
    }
    if(existingUser||mismatch){
      button.textContent='Retry Dragonswood';
      button.onclick=event=>{
        event.preventDefault();
        event.stopImmediatePropagation();
        try{sessionStorage.removeItem(mismatchKey);}catch{}
        location.reload();
      };
    }
  };
  const app=document.getElementById('app');
  if(app){
    new MutationObserver(repairAuthScreen).observe(app,{childList:true,subtree:true,characterData:true});
    repairAuthScreen();
  }
})();
