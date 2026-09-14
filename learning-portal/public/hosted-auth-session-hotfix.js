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

  // Preserve hosted-auth's real Firebase click handler. It is responsible for
  // reauthenticating a paused session. Only clarify the button/copy for humans.
  const repairAuthScreen=()=>{
    const button=document.getElementById('portal-signin');
    const help=document.getElementById('portal-signin-help');
    if(!button)return;
    const text=help?.textContent||'';
    if(/auth\/user-mismatch/i.test(text)){
      if(help)help.textContent='Google opened a different account. Choose the same Google account already signed into Dragonswood.';
      button.textContent='Choose Google account again';
      return;
    }
    if(/session paused after inactivity|sign in again to continue/i.test(text)){
      button.textContent='Sign in again with Google';
    }
  };
  const app=document.getElementById('app');
  if(app){
    new MutationObserver(repairAuthScreen).observe(app,{childList:true,subtree:true,characterData:true});
    repairAuthScreen();
  }
})();
