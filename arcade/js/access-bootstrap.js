import {environment,getArcadeAccess,startArcadeSession,setCurrentAccess,remainingMs} from './access-client.js';
let loaded=false,refreshing=false,access=null,refreshTimer=null,clockTimer=null;

const gate=document.createElement('section');gate.className='arcade-access-gate';gate.setAttribute('role','dialog');gate.setAttribute('aria-modal','true');document.body.append(gate);
const badge=document.createElement('div');badge.className='arcade-time-badge';badge.hidden=true;document.body.append(badge);
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function tokens(count){return `<div class="arcade-token-row" aria-label="${count} of 3 Arcade Tokens">${[1,2,3].map(i=>`<span class="arcade-token ${i<=count?'':'empty'}">A</span>`).join('')}</div>`}
function renderLocked(message='Checking your Arcade Time…'){
  const count=Math.max(0,Math.min(3,Number(access?.tokens)||0)),enabled=access?.teacherEnabled===true,ready=count===3&&enabled;
  gate.hidden=false;badge.hidden=true;
  gate.innerHTML=`<div class="arcade-access-card"><img src="assets/dragonswood-arcade-crest.svg" alt=""><h1>Arcade Time</h1>${tokens(count)}<p>${esc(message)}</p><p class="arcade-access-note">3 Tokens = one 30-minute session. Tokens are earned for Ready, Responsible, and Complete choices. Wallet maximum: 3.</p><div class="arcade-access-actions"><button type="button" data-start-arcade ${ready?'':'disabled'}>Use 3 Tokens — Start 30 Minutes</button><a href="../v33-integration/student-test.html">Return to Dragonswood</a></div><p class="arcade-access-note">${enabled?'Teacher Arcade Time is open.':'Teacher Arcade Time is currently locked.'} • ${environment}</p></div>`;
  gate.querySelector('[data-start-arcade]')?.addEventListener('click',begin);
}
function updateClock(){
  const ms=remainingMs(access);if(ms<=0){lockNow('Your 30-minute Arcade Time has ended.');return}
  const total=Math.ceil(ms/1000),m=Math.floor(total/60),s=String(total%60).padStart(2,'0');badge.textContent=`ARCADE TIME ${m}:${s}`;
}
async function unlock(next){
  access=setCurrentAccess(next);gate.hidden=true;badge.hidden=false;updateClock();
  if(!loaded){loaded=true;await import('./arcade.js')}
}
function lockNow(message){
  access=setCurrentAccess(null);document.querySelector('#gameFrame')?.setAttribute('src','about:blank');renderLocked(message);
}
async function refresh(){
  if(refreshing)return;refreshing=true;
  try{const next=await getArcadeAccess();access=next;if(next.active&&remainingMs(next)>0)await unlock(next);else renderLocked(next.teacherEnabled?'You need all 3 Arcade Tokens to begin.':'Arcade is locked until your teacher opens Arcade Time.');}
  catch(err){lockNow(navigator.onLine?`Arcade authorization could not be verified: ${err?.message||err}`:'Arcade is locked while this device is offline.');}
  finally{refreshing=false}
}
async function begin(){
  const btn=gate.querySelector('[data-start-arcade]');if(btn)btn.disabled=true;
  try{await unlock(await startArcadeSession())}catch(err){renderLocked(err?.message||'Arcade Time could not start.');}
}
window.addEventListener('offline',()=>lockNow('Arcade is locked while this device is offline.'));
window.addEventListener('online',refresh);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
refreshTimer=setInterval(refresh,15000);clockTimer=setInterval(updateClock,1000);
window.addEventListener('pagehide',()=>{clearInterval(refreshTimer);clearInterval(clockTimer)},{once:true});
renderLocked();refresh();
