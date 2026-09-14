// Permanent single-auth bridge for embedded Dragon's Path.
// The outer Dragonswood portal owns Firebase Auth. Embedded curriculum code never
// initializes Firebase Auth, never opens Google, and never reads auth storage.

import {getApp,getApps} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import {getAuth} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';

const API_ORIGIN='https://dragonswood-9289e.web.app';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function outerAuth(){
  // Dragon's Path is only mounted after the outer portal reports authorized, but
  // allow a short grace period for module scheduling on slower Chromebooks.
  for(let i=0;i<100;i++){
    if(getApps().length){
      const auth=getAuth(getApp());
      if(auth.currentUser)return auth;
      try{
        await Promise.race([auth.authStateReady(),sleep(100)]);
      }catch{}
      if(auth.currentUser)return auth;
    }
    await sleep(100);
  }
  throw Object.assign(new Error('The main Dragonswood portal is not signed in yet.'),{status:401});
}

async function authenticatedRequest(path,init={},forceRefresh=false){
  const url=new URL(String(path||''),API_ORIGIN);
  if(url.origin!==API_ORIGIN||!url.pathname.startsWith('/api/')){
    throw new Error('Dragon’s Path can only use the Dragonswood portal API.');
  }

  const auth=await outerAuth();
  const user=auth.currentUser;
  if(!user)throw Object.assign(new Error('The main Dragonswood portal is not signed in.'),{status:401});

  const token=await user.getIdToken(forceRefresh);
  const headers=new Headers(init.headers||{});
  headers.set('Authorization',`Bearer ${token}`);
  headers.delete('X-Dragonswood-Student');
  if(init.teacherTarget)headers.set('X-Dragonswood-Student',String(init.teacherTarget));

  const timeoutMs=Math.max(5000,Math.min(60000,Number(init.timeoutMs)||45000));
  const response=await fetch(url.href,{
    method:String(init.method||'GET').toUpperCase(),
    headers,
    body:init.body??undefined,
    redirect:'error',
    credentials:'omit',
    cache:'no-store',
    signal:AbortSignal.timeout(timeoutMs)
  });

  if(response.status===401&&!forceRefresh){
    return authenticatedRequest(path,init,true);
  }

  return {
    ok:response.ok,
    status:response.status,
    statusText:response.statusText,
    headers:[...response.headers.entries()],
    body:await response.text()
  };
}

window.DWDragonPathParentAuth=Object.freeze({
  version:'single-auth-v1',
  request:authenticatedRequest
});
