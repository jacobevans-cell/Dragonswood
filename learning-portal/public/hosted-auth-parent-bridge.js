// Embedded Dragon's Path auth adapter.
// Authentication belongs to the outer Dragonswood portal. This iframe never
// initializes Firebase Auth and never asks students to sign in separately.

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function parentAuthBridge(){
  if(window.parent===window)throw Object.assign(new Error('Dragon’s Path must open inside the Dragonswood portal.'),{status:409});
  for(let i=0;i<100;i++){
    try{
      const bridge=window.parent.DWDragonPathParentAuth;
      if(bridge?.request)return bridge;
    }catch{}
    await sleep(100);
  }
  throw Object.assign(new Error('The main Dragonswood sign-in bridge did not start. Reload Dragonswood once.'),{status:503});
}

export async function startHostedAuth({config,onClear,onReady,beforeSwitch,onError}){
  let session=null;
  let teacherTarget=null;
  let opening=false;

  async function request(input,init={}){
    const bridge=await parentAuthBridge();
    const headers=[...new Headers(init.headers||{}).entries()];
    const result=await bridge.request(input,{
      method:String(init.method||'GET').toUpperCase(),
      headers,
      body:init.body??null,
      timeoutMs:45000,
      teacherTarget
    });
    return new Response(result.body,{status:result.status,statusText:result.statusText,headers:result.headers});
  }

  function showProblem(message){
    onClear?.();
    const app=document.getElementById('app');
    if(!app)return;
    app.innerHTML=`<main class="loading"><img src="/Dragonswood/learning-portal/public/assets/dragonswood-mascot/assets/icons/dragonswood-mascot-64.png" width="64" height="64" alt="Dragonswood dragon"><h1>Dragonswood</h1><p id="portal-signin-help" role="status">${esc(message)}</p><button class="btn" id="portal-signin">Reload Dragonswood</button></main>`;
    document.getElementById('portal-signin').onclick=()=>{try{window.parent.location.reload()}catch{location.reload()}};
  }

  async function openSession(){
    if(opening)return;
    opening=true;
    try{
      const response=await request('/api/session',{method:'GET'});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw Object.assign(new Error(data.error||'Dragonswood could not open your learning session.'),data,{status:response.status});
      session=data;
      if(!data.student){
        if(data.role!=='teacher')throw new Error('Your student profile could not be verified.');
        const roster=Array.isArray(data.roster)?data.roster:[];
        if(!teacherTarget&&roster.length)teacherTarget=roster[0].uid;
        if(teacherTarget){
          const teacherResponse=await request('/api/session',{method:'GET'});
          const teacherData=await teacherResponse.json().catch(()=>({}));
          if(!teacherResponse.ok)throw Object.assign(new Error(teacherData.error||'Teacher review session could not open.'),{status:teacherResponse.status});
          session=teacherData;
          await onReady(teacherData);
          return;
        }
      }
      await onReady(data);
    }catch(error){
      showProblem(error?.message||'Dragon’s Path could not open. Reload Dragonswood once.');
      onError?.(error?.message||String(error));
    }finally{opening=false}
  }

  return {
    fetch:request,
    controls:()=>session?`<span>Grade ${session.student?.grade||''}</span>${session.role==='teacher'&&Array.isArray(session.roster)?`<select id="hosted-student" aria-label="Selected student">${session.roster.map(row=>`<option value="${esc(row.uid)}" ${row.uid===teacherTarget?'selected':''}>${esc(row.displayName)} · Grade ${row.grade}</option>`).join('')}</select>`:''}`:'',
    bind:()=>{
      const select=document.getElementById('hosted-student');
      if(select)select.onchange=async event=>{
        try{
          await beforeSwitch?.();
          teacherTarget=event.target.value;
          onClear?.();
          await openSession();
        }catch(error){onError?.(error?.message||String(error));}
      };
    },
    teacher:()=>session?.role==='teacher',
    start:()=>{openSession();}
  };
}
