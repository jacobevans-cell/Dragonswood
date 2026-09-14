// Emergency production guard for Dragon's Path startup.
// hosted-auth currently reuses one timeout across Firebase token retrieval and
// the initial /api/session request. Give token refresh more room and give the
// session request its own fresh network budget. Keep the patch narrowly scoped.
(()=>{
  'use strict';
  const apiOrigin='https://dragonswood-9289e.web.app';
  const nativeFetch=globalThis.fetch.bind(globalThis);
  const hasTimeout=typeof AbortSignal!=='undefined'&&typeof AbortSignal.timeout==='function';
  const nativeTimeout=hasTimeout?AbortSignal.timeout.bind(AbortSignal):null;

  if(nativeTimeout&&!AbortSignal.timeout.__dragonswoodSessionBudgetFix){
    const patchedTimeout=milliseconds=>nativeTimeout(milliseconds===30000?45000:milliseconds);
    try{Object.defineProperty(patchedTimeout,'__dragonswoodSessionBudgetFix',{value:true});AbortSignal.timeout=patchedTimeout;}catch{}
  }

  if(globalThis.fetch.__dragonswoodSessionBudgetFix)return;
  const resilientFetch=(input,init={})=>{
    let url;
    try{
      const raw=typeof input==='string'||input instanceof URL?String(input):input?.url;
      url=new URL(raw,location.href);
    }catch{return nativeFetch(input,init);}
    const method=String(init?.method||input?.method||'GET').toUpperCase();
    const startupSession=nativeTimeout&&url.origin===apiOrigin&&url.pathname==='/api/session'&&method==='GET';
    if(!startupSession)return nativeFetch(input,init);
    const next={...init,signal:nativeTimeout(45000)};
    return nativeFetch(input,next);
  };
  try{Object.defineProperty(resilientFetch,'__dragonswoodSessionBudgetFix',{value:true});}catch{}
  globalThis.fetch=resilientFetch;
})();
