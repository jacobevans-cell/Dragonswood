// Embedded Dragon's Path auth bridge.
// The outer Dragonswood portal is already authenticated. Reuse that same-tab
// Firebase session directly instead of booting a second Firebase Auth client in
// the iframe. This avoids managed-Chromebook IndexedDB/auth initialization stalls.

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function decodeJwtExpiration(token){
  try{
    const payload=token.split('.')[1];
    if(!payload)return 0;
    const normalized=payload.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(payload.length/4)*4,'=');
    const data=JSON.parse(atob(normalized));
    return Number(data.exp||0)*1000;
  }catch{return 0}
}

function authStorageRecord(apiKey){
  const prefix=`firebase:authUser:${apiKey}:`;
  for(let i=0;i<sessionStorage.length;i++){
    const key=sessionStorage.key(i);
    if(!key?.startsWith(prefix))continue;
    try{
      const user=JSON.parse(sessionStorage.getItem(key)||'null');
      if(user?.stsTokenManager?.accessToken)return {key,user};
    }catch{}
  }
  return null;
}

function saveAuthStorageRecord(record){
  try{sessionStorage.setItem(record.key,JSON.stringify(record.user));return true}catch{return false}
}

async function refreshToken(config,record){
  const manager=record?.user?.stsTokenManager||{};
  const refresh=manager.refreshToken;
  if(!refresh)throw Object.assign(Error('Your Dragonswood sign-in needs to be refreshed from the main portal.'),{status:401});
  const response=await fetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(config.firebase.apiKey)}`,{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({grant_type:'refresh_token',refresh_token:refresh}).toString(),
    cache:'no-store'
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!data.access_token)throw Object.assign(Error('Your Dragonswood sign-in expired. Reload the main portal once.'),{status:401});
  manager.accessToken=data.access_token;
  manager.refreshToken=data.refresh_token||refresh;
  manager.expirationTime=Date.now()+Math.max(60,Number(data.expires_in)||3600)*1000;
  record.user.stsTokenManager=manager;
  saveAuthStorageRecord(record);
  return manager.accessToken;
}

async function sharedToken(config,{forceRefresh=false}={}){
  // Give the already-authorized parent portal a moment to finish migrating its
  // Firebase user into browserSessionPersistence on a fresh page load.
  let record=null;
  for(let attempt=0;attempt<20&&!record;attempt++){
    record=authStorageRecord(config.firebase.apiKey);
    if(!record)await sleep(100);
  }
  if(!record)throw Object.assign(Error('Dragon’s Path could not find the signed-in student session from the main portal.'),{status:401});
  const manager=record.user.stsTokenManager||{};
  const token=manager.accessToken||'';
  const expires=Number(manager.expirationTime)||decodeJwtExpiration(token);
  if(!forceRefresh&&token&&expires>Date.now()+60000)return token;
  return refreshToken(config,record);
}

export async function startHostedAuth({config,onClear,onReady,beforeSwitch,onError}){
  const origin=new URL(config.apiOrigin||location.origin);
  if(origin.protocol!=='https:')throw new TypeError('Authenticated hosted requests require HTTPS.');
  let session=null;
  let teacherTarget=null;
  let opening=false;

  async function request(input,init={},retry=true){
    const url=new URL(input,origin);
    if(url.origin!==origin.origin||!url.pathname.startsWith('/api/'))throw Error('Account tokens may be sent only to this portal API.');
    const token=await sharedToken(config);
    const headers=new Headers(init.headers||{});
    headers.set('Authorization',`Bearer ${token}`);
    headers.delete('X-Dragonswood-Student');
    if(teacherTarget)headers.set('X-Dragonswood-Student',teacherTarget);
    const response=await fetch(url.href,{...init,headers,redirect:'error',credentials:location.origin===origin.origin?'same-origin':'omit'});
    if(response.status===401&&retry){
      await sharedToken(config,{forceRefresh:true});
      return request(input,init,false);
    }
    return response;
  }

  function showProblem(message){
    onClear?.();
    const app=document.getElementById('app');
    if(!app)return;
    app.innerHTML=`<main class="loading"><img src="/Dragonswood/learning-portal/public/assets/dragonswood-mascot/assets/icons/dragonswood-mascot-64.png" width="64" height="64" alt="Dragonswood dragon"><h1>Welcome to Dragonswood</h1><p id="portal-signin-help" role="status">${esc(message)}</p><button class="btn" id="portal-signin">Reload Dragon’s Path</button></main>`;
    document.getElementById('portal-signin').onclick=()=>location.reload();
  }

  async function openSession(){
    if(opening)return;
    opening=true;
    try{
      const response=await request('/api/session',{method:'GET',signal:AbortSignal.timeout(30000)});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw Object.assign(Error(data.error||'Dragonswood could not open your learning session.'),data,{status:response.status});
      session=data;
      if(!data.student){
        if(data.role!=='teacher')throw Error('Your student profile could not be verified.');
        const roster=Array.isArray(data.roster)?data.roster:[];
        if(!teacherTarget&&roster.length)teacherTarget=roster[0].uid;
        if(teacherTarget)return openSessionForTeacher();
      }
      await onReady(data);
    }catch(error){
      showProblem(error?.message||'Dragon’s Path could not open. Reload the main Dragonswood portal once.');
      onError?.(error?.message||String(error));
    }finally{opening=false}
  }

  async function openSessionForTeacher(){
    const response=await request('/api/session',{method:'GET',signal:AbortSignal.timeout(30000)});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw Object.assign(Error(data.error||'Teacher review session could not open.'),{status:response.status});
    session=data;
    await onReady(data);
  }

  return {
    fetch:request,
    controls:()=>session?`<span>Grade ${session.student?.grade||''}</span>${session.role==='teacher'&&Array.isArray(session.roster)?`<select id="hosted-student" aria-label="Selected student">${session.roster.map(row=>`<option value="${esc(row.uid)}" ${row.uid===teacherTarget?'selected':''}>${esc(row.displayName)} · Grade ${row.grade}</option>`).join('')}</select>`:''}`:'',
    bind:()=>{
      const select=document.getElementById('hosted-student');
      if(select)select.onchange=async event=>{
        try{await beforeSwitch?.();teacherTarget=event.target.value;onClear?.();await openSessionForTeacher();}
        catch(error){onError?.(error?.message||String(error));}
      };
    },
    teacher:()=>session?.role==='teacher',
    start:()=>{openSession();}
  };
}
