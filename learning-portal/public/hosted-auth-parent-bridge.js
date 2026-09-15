// The iframe reuses the parent account and never initializes another Firebase app.
import {waitForAuthOperation} from './parent-auth-request.js?v=dragon-path-11';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function parentAuthBridge(signal){
  if(window.parent===window)throw Object.assign(new Error('Open Dragon’s Path inside Dragonswood.'),{status:409});
  for(let i=0;i<100;i++){
    signal?.throwIfAborted();
    try{const bridge=window.parent.DWDragonPathParentAuth;if(bridge?.version==='single-auth-v2'&&bridge.request)return bridge;}catch{}
    await waitForAuthOperation(()=>new Promise(resolve=>setTimeout(resolve,100)),signal);
  }
  throw Object.assign(new Error('The main Dragonswood session needs the latest update. Reload Dragonswood once.'),{status:503});
}
export async function startHostedAuth({config,onClear,onReady,beforeSwitch,onError}){
  let session=null,teacherTarget=null,opening=false,epoch=0,lastPing=0,pinging=false,reconnecting=false;
  async function request(input,init={}){
    const generation=epoch,target=teacherTarget,expectedAuthUid=session?.authUid;
    const signal=init.signal||AbortSignal.timeout(45000);
    const bridge=await parentAuthBridge(signal);
    if(generation!==epoch)throw Object.assign(new Error('Your selected student changed. Reopen the activity.'),{status:409});
    const result=await bridge.request(input,{method:String(init.method||'GET').toUpperCase(),headers:[...new Headers(init.headers||{}).entries()],body:init.body??null,signal,teacherTarget:target,expectedAuthUid});
    if(generation!==epoch||teacherTarget!==target)throw Object.assign(new Error('Your selected student changed. Your earlier work is kept.'),{status:409});
    if(result.status===401&&session)showReconnectNotice();
    return new Response([204,205,304].includes(result.status)?null:result.body,{status:result.status,statusText:result.statusText,headers:result.headers});
  }
  function showReconnectNotice(){
    if(document.getElementById('portal-session-reconnect'))return;
    const notice=document.createElement('div');notice.id='portal-session-reconnect';notice.className='notice';notice.setAttribute('role','status');notice.style.cssText='position:fixed;bottom:12px;left:12px;right:12px;z-index:2000;background:#211c35;border:2px solid #e9c870;padding:16px';
    notice.innerHTML='<p>Your account needs to reconnect. Your writing stays on this page and in its recovery copy.</p><button type="button" class="btn">Reconnect my account</button>';
    notice.querySelector('button').onclick=reconnectSession;document.body.append(notice);
  }
  async function reconnectSession(){
    if(reconnecting)return;reconnecting=true;const generation=epoch,previous=session;
    const button=document.querySelector('#portal-session-reconnect button')||document.getElementById('portal-signin');if(button)button.disabled=true;
    try{
      const bridge=window.parent.DWDragonPathParentAuth;
      if(typeof bridge?.reauthenticate!=='function')throw Error('Reload Dragonswood to finish installing the login update. Your recovery copy is kept.');
      // The parent opens Google directly from this click; the child never signs in separately.
      await bridge.reauthenticate(previous?.authUid);
      if(generation!==epoch)return;
      if(!previous){await openSession();return;}
      const response=await request('/api/session'),next=await response.json();
      if(!response.ok)throw Object.assign(Error(next.error||'Your account could not reconnect yet.'),{status:response.status});
      if(generation!==epoch||next.authUid!==previous.authUid||next.student?.uid!==previous.student?.uid)throw Error('Your selected account changed. Your current writing has been kept.');
      session=next;lastPing=Date.now();document.getElementById('portal-session-reconnect')?.remove();
      onError?.('Your account is reconnected. Your writing is still here; save it to sync your latest changes.');
    }catch(error){onError?.(error.message||'Reconnection did not finish. Your writing is kept.');}
    finally{reconnecting=false;if(button)button.disabled=false;}
  }
  function showProblem(message,needsReauthentication=false){
    const app=document.getElementById('app');if(!app)return;
    app.innerHTML=`<main class="loading"><h1>Dragonswood</h1><p id="portal-signin-help" role="status">${esc(message)}</p><p>Your saved work and browser recovery copies are kept.</p><button class="btn" id="portal-signin">Try opening my quest again</button><button class="btn quiet" id="portal-reload">Reload Dragonswood</button></main>`;
    const resume=document.getElementById('portal-signin');if(needsReauthentication)resume.textContent='Reconnect my school account';
    resume.onclick=needsReauthentication?reconnectSession:()=>openSession();
    const reload=document.getElementById('portal-reload');if(reload)reload.onclick=()=>{try{window.parent.location.reload();}catch{window.location.reload();}};
  }
  async function openSession(){
    if(opening)return;opening=true;const generation=epoch;
    try{
      let data;
      for(let attempt=0;attempt<2;attempt++){
        try{const response=await request('/api/session');data=await response.json();if(!response.ok)throw Object.assign(new Error(data.error||'Your learning session could not open.'),{status:response.status});break;}
        catch(error){if(attempt||error.status&&![408,429,502,503,504].includes(error.status))throw error;await new Promise(resolve=>setTimeout(resolve,750));}
      }
      if(generation!==epoch)return;
      if(!data.student){
        if(data.role!=='teacher')throw new Error('Your student profile could not be verified.');
        if(!teacherTarget&&data.roster?.length)teacherTarget=data.roster[0].uid;
        if(teacherTarget){const response=await request('/api/session');const selected=await response.json();if(!response.ok)throw Object.assign(new Error(selected.error||'Teacher review could not open.'),{status:response.status});data=selected;}
      }
      if(generation!==epoch)return;if(data.role==='teacher'&&data.student&&!teacherTarget)teacherTarget=data.student.uid;session=data;lastPing=Date.now();await onReady(data);
    }catch(error){if(generation===epoch){showProblem(error.message||'Your quest could not open yet.',error.status===401);onError?.(error.message||String(error));}}finally{opening=false;}
  }
  async function activity(){
    if(!session||opening||pinging||Date.now()-lastPing<60000)return;
    pinging=true;lastPing=Date.now();const generation=epoch;
    try{const response=await request('/api/session/activity',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(response.ok&&generation===epoch)lastPing=Date.now();else if(response.status===401)onError?.('Your sign-in needs attention. Export any unsaved work before reopening Dragonswood.');}
    catch{/* Save requests retain their own recovery copy and report their own errors. */}finally{pinging=false;}
  }
  for(const event of ['pointerdown','keydown','input'])document.addEventListener(event,activity,{passive:true});
  return {
    fetch:request,
    controls:()=>session?`<span>Grade ${session.student?.grade||''}</span>${session.role==='teacher'&&Array.isArray(session.roster)?`<select id="hosted-student" aria-label="Selected student">${session.roster.map(row=>`<option value="${esc(row.uid)}" ${row.uid===teacherTarget?'selected':''}>${esc(row.displayName)} · Grade ${row.grade}</option>`).join('')}</select><a href="#teacher" class="btn quiet small">Teacher view</a>`:''}`:'',
    bind:()=>{const select=document.getElementById('hosted-student');if(select)select.onchange=async event=>{const next=event.target.value;try{if(opening)throw new Error('Wait for this student to finish opening.');await beforeSwitch?.();epoch++;teacherTarget=next;onClear?.();await openSession();}catch(error){event.target.value=teacherTarget;onError?.(error.message);}};},
    teacher:()=>session?.role==='teacher',start:openSession
  };
}
