const store=window.DWArcadeManualStore;
if(!store)throw new Error('Arcade manual preview store did not load.');

let loaded=false,access=null,clockTimer=null;
const gate=document.createElement('section');gate.className='arcade-access-gate';gate.setAttribute('role','dialog');gate.setAttribute('aria-modal','true');document.body.append(gate);
const badge=document.createElement('div');badge.className='arcade-time-badge';badge.hidden=true;document.body.append(badge);
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function tokens(count){return `<div class="arcade-token-row" aria-label="${count} of 3 Arcade Tokens">${[1,2,3].map(i=>`<span class="arcade-token ${i<=count?'':'empty'}">A</span>`).join('')}</div>`}
function renderLocked(message){
  const count=Math.max(0,Math.min(3,Number(access?.tokens)||0)),enabled=access?.teacherEnabled===true,ready=count===3&&enabled;
  gate.hidden=false;badge.hidden=true;
  gate.innerHTML=`<div class="arcade-access-card"><img src="../v33-integration/assets/branding/dragonswood-mascot-crest.png" alt=""><h1>Arcade Time</h1>${tokens(count)}<p>${esc(message)}</p><p class="arcade-access-note">3 Tokens = one 30-minute session. This isolated preview uses browser-only state and cannot write to Firebase.</p><div class="arcade-access-actions"><button type="button" data-start-arcade ${ready?'':'disabled'}>Use 3 Tokens — Start 30 Minutes</button><a href="../v33-integration/student-manual-preview.html#arcade">Return to Dragonswood</a></div><p class="arcade-access-note">${enabled?'Teacher Arcade Time is open.':'Teacher Arcade Time is currently locked.'} • LOCAL MANUAL PREVIEW</p></div>`;
  gate.querySelector('[data-start-arcade]')?.addEventListener('click',begin);
}
function updateClock(){
  const ms=store.remainingMs(access);if(ms<=0){lockNow('Your 30-minute preview session has ended.');return}
  const total=Math.ceil(ms/1000),m=Math.floor(total/60),s=String(total%60).padStart(2,'0');badge.textContent=`PREVIEW ARCADE TIME ${m}:${s}`;
}
async function unlock(next){
  access=next;gate.hidden=true;badge.hidden=false;updateClock();
  if(!loaded){loaded=true;await import('./manual-preview-arcade.js?v=58.0.3')}
}
function lockNow(message){
  access=store.getAccess();document.querySelector('#gameFrame')?.setAttribute('src','about:blank');renderLocked(message);
}
async function refresh(){
  const next=store.getAccess();access=next;
  if(next.active&&store.remainingMs(next)>0)await unlock(next);
  else renderLocked(next.teacherEnabled?(next.tokens===3?'Your teacher opened Arcade Time. Start when you are ready.':'You need all 3 Arcade Tokens to begin.'):'Arcade is locked until your teacher opens Arcade Time.');
}
async function begin(){
  const btn=gate.querySelector('[data-start-arcade]');if(btn)btn.disabled=true;
  try{await unlock(store.startSession());window.parent?.postMessage({channel:'dw-v33-manual-preview',type:'arcade-state-changed'},location.origin)}catch(err){access=store.getAccess();renderLocked(err?.message||'Arcade Time could not start.')}
}
window.addEventListener('storage',event=>{if(event.key===store.STORAGE_KEY)refresh()});
clockTimer=setInterval(()=>{if(access?.active)updateClock()},1000);
window.addEventListener('pagehide',()=>clearInterval(clockTimer),{once:true});
renderLocked('Checking the isolated preview wallet…');refresh();
