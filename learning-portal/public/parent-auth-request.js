// The parent owns Firebase identity; bound the whole request and keep its account.
export function waitForAuthOperation(operation,signal){
 if(signal?.aborted)return Promise.reject(signal.reason);
 return new Promise((resolve,reject)=>{
  const abort=()=>reject(signal.reason);signal?.addEventListener('abort',abort,{once:true});
  Promise.resolve().then(()=>{signal?.throwIfAborted();return operation();}).then(value=>signal?.aborted?reject(signal.reason):resolve(value),reject).finally(()=>signal?.removeEventListener('abort',abort));
 });
}
export function createParentAuthRequest({getAuth,apiOrigin,fetchImpl=globalThis.fetch,timeoutMs=45000}){
 const origin=new URL(apiOrigin);if(origin.protocol!=='https:')throw new Error('The portal API requires HTTPS.');
 return async function request(path,init={}){
  const url=new URL(String(path||''),origin);
  if(url.origin!==origin.origin||!url.pathname.startsWith('/api/'))throw new Error('Account tokens may be sent only to the Dragonswood portal API.');
  const controller=new AbortController(),abort=()=>controller.abort(init.signal.reason);
  if(init.signal?.aborted)abort();else init.signal?.addEventListener('abort',abort,{once:true});
  const deadline=setTimeout(()=>controller.abort(new DOMException('The Dragonswood connection took too long. Your work is kept.','TimeoutError')),timeoutMs);
  const signal=controller.signal,expectedUid=init.expectedAuthUid||null,target=init.teacherTarget||null;
  try{
   const auth=await waitForAuthOperation(()=>getAuth(signal),signal),user=auth.currentUser;
   if(!user)throw Object.assign(new Error('The main Dragonswood portal is not signed in.'),{status:401});
   const assertAccount=()=>{signal.throwIfAborted();if(auth.currentUser?.uid!==user.uid||expectedUid&&expectedUid!==user.uid)throw Object.assign(new Error('Your selected account changed. Reopen the activity; your work is kept.'),{status:409});};
   for(let attempt=0;attempt<2;attempt++){
    assertAccount();const token=await waitForAuthOperation(()=>user.getIdToken(attempt===1),signal);assertAccount();
    const headers=new Headers(init.headers||{});headers.set('Authorization','Bearer '+token);headers.delete('X-Dragonswood-Student');if(target)headers.set('X-Dragonswood-Student',String(target));
    const response=await waitForAuthOperation(()=>fetchImpl(url.href,{method:String(init.method||'GET').toUpperCase(),headers,body:init.body??undefined,redirect:'error',credentials:'omit',cache:'no-store',signal}),signal);assertAccount();
    if(response.status===401&&attempt===0){await waitForAuthOperation(()=>response.body?.cancel(),signal);continue;}
    const body=await waitForAuthOperation(()=>response.text(),signal);assertAccount();
    return {ok:response.ok,status:response.status,statusText:response.statusText,headers:[...response.headers.entries()],body};
   }
  }finally{clearTimeout(deadline);init.signal?.removeEventListener('abort',abort);}
 };
}
