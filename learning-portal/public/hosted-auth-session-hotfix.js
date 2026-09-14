// Emergency production guard for Dragon's Path startup.
// Keep the production session bootstrap resilient without touching saved work.
(()=>{
  'use strict';
  const apiOrigin='https://dragonswood-9289e.web.app';
  const firebaseApiKey='AIzaSyC918WJoGQgxRKsqcz-3bXI7iZWv_1bwYE';
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

  const dragonswoodFirebaseKey=key=>typeof key==='string'&&key.includes(firebaseApiKey)&&/^firebase:(authUser|redirectUser):/.test(key);

  // A few shared/classroom browsers can retain an old Firebase user even after the
  // Dragonswood server session expires. If Google then returns a different account,
  // Firebase's reauthenticate flow can get stuck forever on auth/user-mismatch.
  // Clear only this project's stale Firebase user record, then let the normal clean
  // sign-in flow choose the account again. Cloud work is untouched.
  const clearStoredFirebaseUser=()=>{
    for(const storage of [globalThis.sessionStorage,globalThis.localStorage]){
      try{
        for(let i=storage.length-1;i>=0;i--){
          const key=storage.key(i);
          if(dragonswoodFirebaseKey(key))storage.removeItem(key);
        }
      }catch{}
    }
  };

  const clearIndexedDbFirebaseUser=async()=>{
    try{
      if(!globalThis.indexedDB)return;
      if(typeof indexedDB.databases==='function'){
        const databases=await indexedDB.databases();
        if(!databases.some(database=>database?.name==='firebaseLocalStorageDb'))return;
      }
      await new Promise(resolve=>{
        let request;
        try{request=indexedDB.open('firebaseLocalStorageDb',1);}catch{return resolve();}
        request.onerror=()=>resolve();
        request.onupgradeneeded=()=>{try{request.transaction?.abort();}catch{}resolve();};
        request.onsuccess=()=>{
          const db=request.result;
          if(!db.objectStoreNames.contains('firebaseLocalStorage')){db.close();resolve();return;}
          let transaction;
          try{transaction=db.transaction('firebaseLocalStorage','readwrite');}catch{db.close();resolve();return;}
          const store=transaction.objectStore('firebaseLocalStorage');
          const keys=store.getAllKeys();
          keys.onsuccess=()=>{
            for(const key of keys.result||[]){
              if(dragonswoodFirebaseKey(key))try{store.delete(key);}catch{}
            }
          };
          transaction.oncomplete=()=>{db.close();resolve();};
          transaction.onerror=transaction.onabort=()=>{db.close();resolve();};
        };
      });
    }catch{}
  };

  // Preserve hosted-auth's real Firebase click handler during normal session resume.
  // Only replace it after Firebase explicitly reports a user mismatch.
  const repairAuthScreen=()=>{
    const button=document.getElementById('portal-signin');
    const help=document.getElementById('portal-signin-help');
    if(!button)return;
    const text=help?.textContent||'';
    const mismatch=/auth\/user-mismatch/i.test(text)||button.dataset.dwMismatchRepair==='1';
    if(mismatch){
      button.dataset.dwMismatchRepair='1';
      if(help)help.textContent='This browser has an old Google session saved. Reset it, then choose the correct Google account.';
      button.textContent='Reset Google session';
      button.onclick=async event=>{
        event.preventDefault();
        event.stopImmediatePropagation();
        button.disabled=true;
        if(help)help.textContent='Resetting the old Google session…';
        clearStoredFirebaseUser();
        await clearIndexedDbFirebaseUser();
        location.reload();
      };
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
