import {environment,getArcadeAccess,startArcadeSession,setCurrentAccess,remainingMs} from './access-client.js?v=58.0.1';
let loaded=false;
let refreshing=false;
let access=null;
let refreshTimer=null;
let clockTimer=null;
let leaving=false;
const params=new URLSearchParams(location.search);
const direct=params.get('dwDirect')==='1';
const portalOwned=direct||environment==='production';

const gate=document.createElement('section');
gate.className='arcade-access-gate';
gate.setAttribute('role','dialog');
gate.setAttribute('aria-modal','true');
gate.hidden=portalOwned;
document.body.append(gate);
const badge=document.createElement('div');
badge.className='arcade-time-badge';
badge.hidden=true;
document.body.append(badge);

function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function tokens(count){return `<div class="arcade-token-row" aria-label="${count} of 3 Arcade Tokens">${[1,2,3].map(i=>`<span class="arcade-token ${i<=count?'':'empty'}">A</span>`).join('')}</div>`}
function portalHref(){
  const url=new URL(environment==='production'?'../index.html':'../v33-integration/student-test.html',location.href);
  url.hash='adventure';
  return url.href;
}
function returnToPortal(message=''){
  if(leaving)return;
  leaving=true;
  if(message)try{sessionStorage.setItem('dw-arcade-return-message',String(message).slice(0,220))}catch{}
  location.replace(portalHref());
}
function renderLocked(message='Checking your Arcade Time…'){
  if(portalOwned){returnToPortal(message);return}
  const count=Math.max(0,Math.min(3,Number(access?.tokens)||0));
  const enabled=access?.teacherEnabled===true;
  const testerOverride=access?.testerOverride===true;
  const ready=testerOverride||(count===3&&enabled);
  document.documentElement.classList.remove('arcade-auth-pending');
  gate.hidden=false;
  badge.hidden=true;
  gate.innerHTML=`<div class="arcade-access-card"><img src="../v33-integration/assets/branding/dragonswood-mascot-crest.png" alt=""><h1>Arcade Time</h1>${tokens(count)}<p>${esc(message)}</p><p class="arcade-access-note">${testerOverride?'🧪 TRUE TESTER self-unlock is active. Your normal Token wallet will not be charged.':'3 Tokens = one 30-minute session. Tokens are earned for Ready, Responsible, and Complete choices. Wallet maximum: 3.'}</p><div class="arcade-access-actions"><button type="button" data-start-arcade ${ready?'':'disabled'}>${testerOverride?'Start Tester Session':'Use 3 Tokens — Start 30 Minutes'}</button><a href="${portalHref()}">Return to Dragonswood</a></div><p class="arcade-access-note">${testerOverride?'Tester-only personal access':enabled?'Teacher Arcade Time is open.':'Teacher Arcade Time is currently locked.'} • ${environment}</p></div>`;
  gate.querySelector('[data-start-arcade]')?.addEventListener('click',begin);
}
function updateClock(){
  if(!access?.active){badge.hidden=true;return}
  const ms=remainingMs(access);
  if(ms<=0){lockNow('Your 30-minute Arcade Time has ended.');return}
  const total=Math.ceil(ms/1000);
  const minutes=Math.floor(total/60);
  const seconds=String(total%60).padStart(2,'0');
  badge.textContent=`ARCADE TIME ${minutes}:${seconds}`;
}
async function unlock(next){
  access=setCurrentAccess(next);
  if(!loaded){await import('./arcade.js?v=58.0.2');loaded=true}
  document.documentElement.classList.remove('arcade-auth-pending');
  gate.hidden=true;
  badge.hidden=false;
  updateClock();
}
function lockNow(message){
  access=setCurrentAccess(null);
  document.querySelector('#gameFrame')?.setAttribute('src','about:blank');
  renderLocked(message);
}
async function refresh(){
  if(refreshing||leaving)return;
  refreshing=true;
  try{
    const next=await getArcadeAccess();
    access=next;
    if(next.active&&remainingMs(next)>0)await unlock(next);
    else renderLocked(next.testerOverride?'Your tester self-unlock is ready. Start a tester session.':next.teacherEnabled?'Return to Dragonswood and earn all 3 Arcade Tokens first.':'Arcade is locked until your teacher opens Arcade Time.');
  }catch(err){
    console.error('[Arcade access]',err);
    renderLocked(navigator.onLine?`Arcade could not finish loading: ${err?.message||err}`:'Arcade is locked while this device is offline.');
  }finally{refreshing=false}
}
async function begin(){
  const btn=gate.querySelector('[data-start-arcade]');
  if(btn){btn.disabled=true;btn.textContent='Starting 30 minutes…'}
  try{await unlock(await startArcadeSession())}
  catch(err){console.error('[Arcade session start]',err);renderLocked(err?.message||'Arcade Time could not start.')}
}
window.addEventListener('offline',()=>lockNow('Arcade is locked while this device is offline.'));
window.addEventListener('online',refresh);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
refreshTimer=setInterval(refresh,15000);
clockTimer=setInterval(updateClock,1000);
window.addEventListener('pagehide',()=>{clearInterval(refreshTimer);clearInterval(clockTimer)},{once:true});
if(!portalOwned)renderLocked();
refresh();
