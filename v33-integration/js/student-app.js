const app = document.querySelector('#app');
const IS_PRODUCTION = window.DWV33Integration?.environment === 'production';
const TESTER_KEY = IS_PRODUCTION ? 'dw-v33' : 'dw-v33-tester';
function storageGet(key, fallback=''){try{return localStorage.getItem(`${TESTER_KEY}:${key}`) ?? fallback}catch{return fallback}}
function storageSet(key, value){try{localStorage.setItem(`${TESTER_KEY}:${key}`, value)}catch{}}
function storedRecoverySummary(){try{const value=JSON.parse(storageGet('recovery-summary','{}'));return value&&typeof value==='object'?value:{}}catch{return {}}}
const toast = document.querySelector('#toast');
const dialogRoot = document.querySelector('#dialog-root');
let integrationController=null,recoveryProbe=null;
let integrationSession={status:'loading',message:'Loading Dragonswood identity…'};
let passSafetyInterval=null;
const passFallbackStarts=new Map();
const passAlertBuckets=new Map();
const moduleHost=window.DWV33Modules;
const arcadePortal=window.DWV33ArcadePortal;
const kingdomPortal=window.DWV33KingdomPortal;
const REQUIRED_WORK_PAGES=new Set(['games','scribe','hall','boss','leaderboards','kingdom','arcade']);
let pendingRequiredWorkNotice='';
let lastAttentionChime='';

const navItems = [
  ['adventure','🛡️','My Adventure','Home base'],
  ['missions','📜','Daily Missions','Do this first','1'],
  ['games','🎮','Academic Games','Learn & play'],
  ['scribe','✍️','Scribe Arena','Write & grow'],
  ['day','🗓️','My Day','Schedule'],
  ['hall','⚔️','Adventurer Hall','Gear & pets'],
  ['boss','👹','Boss Battle','Daily challenge'],
  ['leaderboards','🏆','Leaderboards','Class champions'],
  ['poll','📝','Class Poll','Teacher question']
];
const arcadeNav=['arcade','🕹️','Arcade Time','3 Tokens • 30 min'];
const kingdomNav=['kingdom','🏰','Kingdom Wars','Teacher unlock required'];
function studentNavItems(){return [...navItems,...(kingdomPortal?[kingdomNav]:[]),...(arcadePortal?[arcadeNav]:[])]}

const state = {
  page: 'adventure',
  firstName: '',
  displayName: '',
  initial: 'A',
  grade: '—',
  level: 1,
  hp: 0,
  gold: 0,
  streak: 0,
  xp: 0,
  xpFloor: 0,
  xpMax: 200,
  xpPct: 0,
  missionDate: '',
  completedMissions: new Set(),
  gameFilter: 'All',
  writing: storageGet('writing',''),
  academicConnected: false,
  scribeSession: null,
  scribeResponse: null,
  scribePortfolio: null,
  writingSaveTimer: null,
  worldConnected: false,
  world: null,
  day: 'Today',
  characterClass: 'Unchosen',
  pet: 'No active pet',
  narrationVoice: '',
  equipment: {},
  inventory: [],
  bossHp: 72,
  bossMax: 100,
  bossMessage: '',
  dailyAccessUnlocked: false,
  morningWorkComplete: false,
  dailyAccessOverride: false,
  recoverySummary: storedRecoverySummary(),
  kingdomAccessUnlocked: false,
  attention: null,
  arcadeStatus: 'idle',
  arcadeAccess: null,
  arcadeOpen: false,
  passes: null,
  poll: null
};

const references = {
  adventure:'assets/reference/student/dragonswood-student-01-my-adventure-final.jpg',
  missions:'assets/reference/student/dragonswood-student-02-daily-missions-final.jpg',
  games:'assets/reference/student/dragonswood-student-03-academic-games-final.jpg',
  scribe:'assets/reference/student/dragonswood-student-04-scribe-arena-final.jpg',
  day:'assets/reference/student/dragonswood-student-05-my-day-final.jpg',
  hall:'assets/reference/student/dragonswood-student-06-adventurer-hall-final.jpg',
  boss:'assets/reference/student/dragonswood-student-07-boss-battle-final.jpg',
  leaderboards:'assets/reference/student/dragonswood-student-08-leaderboards-final.jpg'
};
const titleIcons = Object.fromEntries(Object.keys(references).map(k=>[k,`assets/art/title-${k}.jpg`]));

function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(()=>toast.classList.remove('show'),2400);
}

function openDialog(title, body, actions=''){
  dialogRoot.innerHTML = `<div class="dialog-backdrop" data-dialog-backdrop><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><h2 id="dialog-title">${title}</h2>${body}<div class="dialog-actions">${actions || '<button class="btn btn-primary" data-close-dialog>Done</button>'}</div></section></div>`;
  dialogRoot.querySelector('[data-close-dialog]')?.addEventListener('click',closeDialog);
  dialogRoot.querySelector('[data-dialog-backdrop]')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeDialog()});
  dialogRoot.querySelector('button')?.focus();
}
function closeDialog(){dialogRoot.innerHTML='';delete dialogRoot.dataset.dialogKind}
function ensureTeacherDirectionStyles(){
  if(document.querySelector('#v33-teacher-direction-styles'))return;
  const style=document.createElement('style');style.id='v33-teacher-direction-styles';style.textContent=`
  .teacher-direction-overlay{display:none;position:fixed;inset:0;z-index:100000;place-items:center;padding:24px;background:rgba(20,0,8,.96);backdrop-filter:blur(12px)}.teacher-direction-overlay.active{display:grid}
  .teacher-direction-card{width:min(720px,94vw);padding:38px;text-align:center;border:4px solid #ff405f;border-radius:24px;background:radial-gradient(circle at 50% 0%,rgba(255,66,91,.32),transparent 55%),linear-gradient(160deg,#3d0714,#12040b 72%);box-shadow:0 0 90px rgba(255,42,76,.58);color:#fff}.teacher-direction-bell{font-size:78px;line-height:1;filter:drop-shadow(0 0 18px #ffda66)}
  .teacher-direction-card h2{margin:12px 0;color:#fff2a2;font:1000 clamp(34px,6vw,68px) var(--display-font);line-height:1.05}.teacher-direction-card p{font-size:clamp(20px,3vw,30px);line-height:1.38}.teacher-direction-target{margin:18px 0;padding:12px;border:1px solid #ff879a;border-radius:12px;background:#26050d;font-size:18px;font-weight:1000}.teacher-direction-card .btn{min-height:58px;font-size:18px}.teacher-direction-card small{display:block;margin-top:10px;color:#ffd9df}
  @media(max-width:820px){.teacher-direction-card{padding:25px 18px}}
  `;document.head?.appendChild(style);
}

function recoverySummaryCurrent(){return state.recoverySummary?.checked===true&&state.recoverySummary?.dateKey===state.missionDate}
function ensureRecoveryProbe(){
  if(recoverySummaryCurrent()||recoveryProbe||requestedModuleId()==='curriculum-quest'||!moduleHost?.href)return;
  const frame=document.createElement('iframe');frame.id='v33-recovery-progress-probe';frame.title='Recovery progress check';frame.tabIndex=-1;frame.setAttribute('aria-hidden','true');frame.setAttribute('style','position:fixed;width:1px;height:1px;left:-10000px;top:-10000px;border:0;opacity:0;pointer-events:none');frame.src=moduleHost.href('curriculum-quest',document.baseURI,window.DWV33Integration?.environment);document.body?.appendChild(frame);recoveryProbe=frame;
}
function unfinishedRequiredWork(target='activity'){
  const rows=[];
  if(state.dailyAccessUnlocked!==true)rows.push({id:'morning',icon:'🌅',title:'Morning Work',detail:state.morningWorkComplete?'Teacher check-in or access hold remains.':'Not complete today.',route:'module/daily-quest'});
  if(!recoverySummaryCurrent())rows.push({id:'recovery',icon:'🐉',title:'Recovery Missions',detail:'Open Recovery Quest for a live check.',route:'module/curriculum-quest'});
  else for(const day of state.recoverySummary.days||[])rows.push({id:`recovery-${day.day}`,icon:'🐉',title:`Recovery Day ${day.day}`,detail:`${day.count} unfinished mission${day.count===1?'':'s'}.`,route:'module/curriculum-quest'});
  if(String(target)==='kingdom'&&state.kingdomAccessUnlocked!==true)rows.push({id:'kingdom-access',icon:'🔒',title:'Kingdom Wars teacher unlock',detail:'Your teacher has not opened Kingdom Wars today.',route:'missions'});
  return rows;
}
function requiredWorkLocked(page){return REQUIRED_WORK_PAGES.has(String(page||''))&&unfinishedRequiredWork(page).length>0}
function requestedModuleId(){return moduleHost?.routeId(location.hash)||''}
function showRequiredWorkDialog(target='activity'){
  const label=target==='arcade'?'Arcade Time':target==='kingdom'?'Kingdom Wars':target==='boss'||target==='boss-battle'?'Boss Battle':target==='scribe'?'Scribe Arena':'this activity';
  const rows=unfinishedRequiredWork(target);
  openDialog('Finish Required Work First',`<p><b>${escapeHtml(label)}</b> is still locked. Here is exactly what Dragonswood can see unfinished right now:</p><div class="stack mt-12">${rows.map(row=>`<article class="pass-card"><div class="pass-row"><div class="pass-student"><span class="roster-avatar">${row.icon}</span><div><b>${escapeHtml(row.title)}</b><p>${escapeHtml(row.detail)}</p></div></div>${row.id==='kingdom-access'?'':`<button class="btn btn-primary btn-sm" type="button" data-required-route="${escapeHtml(row.route)}">Go there</button>`}</div></article>`).join('')}</div><p class="muted">This check runs again every time you try to enter a game or recreational area.</p>`,`<button class="btn btn-secondary" data-close-dialog>Stay in Daily Missions</button>`);
  dialogRoot.dataset.dialogKind='required-work';
  dialogRoot.querySelectorAll('[data-required-route]').forEach(button=>button.addEventListener('click',()=>{closeDialog();location.hash=button.dataset.requiredRoute}));
}

function activePassRows(){
  const active=Object.values(state.passes?.rows||{}).filter(row=>row?.active===true);
  const activeTypes=new Set(active.map(row=>row.type));
  for(const type of passFallbackStarts.keys())if(!activeTypes.has(type))passFallbackStarts.delete(type);
  return active.map(row=>{if(row.startedMs)passFallbackStarts.set(row.type,row.startedMs);else if(!passFallbackStarts.has(row.type))passFallbackStarts.set(row.type,Date.now());return {...row,startedMs:passFallbackStarts.get(row.type)}});
}
function passModelSignature(model=state.passes){return Object.values(model?.rows||{}).map(row=>`${row.type}:${row.action}:${row.active?'1':'0'}:${row.startedMs||0}`).join('|')}
function blockingPass(){return activePassRows().find(row=>row.blocking===true)||null}
function passTiming(row,now=Date.now()){return window.DWV33Passes?.passTiming(row?.startedMs,now)||{remainingMs:0,overdueMs:0,overdue:false,alertBucket:-1}}
function formatPassDuration(ms){const seconds=Math.max(0,Math.ceil(Number(ms||0)/1000)),minutes=Math.floor(seconds/60);return `${minutes}:${String(seconds%60).padStart(2,'0')}`}
function ensurePassSafetyStyles(){
  if(document.querySelector('#v33-pass-safety-styles'))return;
  const style=document.createElement('style');style.id='v33-pass-safety-styles';style.textContent=`
  .pass-safety-overlay{display:none;position:fixed;inset:0;z-index:99990;align-items:center;justify-content:center;padding:18px;background:rgba(1,2,13,.93);backdrop-filter:blur(11px)}
  .pass-safety-overlay.active{display:flex}.pass-safety-card{width:min(620px,94vw);padding:28px 24px;text-align:center;border:2px solid #f4c95d;border-radius:20px;background:radial-gradient(circle at 18% 0%,rgba(145,78,255,.25),transparent 24rem),linear-gradient(155deg,#160a39,#071a36 70%,#08152b);box-shadow:0 0 55px rgba(101,45,193,.5),inset 0 0 35px rgba(2,204,254,.08)}
  .pass-safety-icon{font-size:64px;line-height:1;margin-bottom:8px}.pass-safety-card h2{margin:5px 0 10px;color:#fff0a4;font:900 34px var(--display-font)}.pass-safety-card p{max-width:520px;margin:0 auto 10px;color:#eef5ff;font-size:18px;line-height:1.45}.pass-safety-card small{display:block;color:#cbbfe0;line-height:1.4}.pass-safety-timer{margin:12px 0;color:#8feaff;font-size:26px;font-weight:1000}.pass-safety-timer.overdue{color:#ff859d;animation:v33PassOverduePulse 1s infinite alternate}.pass-safety-card .btn{margin:8px 0 11px;padding:15px;font-size:17px}
  .pass-overdue-banner{display:none;position:fixed;left:12px;right:12px;top:12px;z-index:99980;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:12px 14px;border:2px solid #ff5f7d;border-radius:12px;background:rgba(60,11,27,.96);color:#fff;box-shadow:0 0 24px rgba(255,74,112,.45)}.pass-overdue-banner.active{display:grid}.pass-overdue-banner b{color:#ffd3dc;font-size:15px}.pass-overdue-banner span{font-weight:800}.pass-overdue-banner button{padding:9px 13px;border:1px solid #ffd3dc;border-radius:8px;background:#7d1830;color:#fff;font-weight:1000;cursor:pointer}@keyframes v33PassOverduePulse{from{transform:scale(1)}to{transform:scale(1.035)}}
  @media(max-width:620px){.pass-safety-card{padding:22px 16px}.pass-safety-card h2{font-size:27px}.pass-safety-card p{font-size:16px}.pass-overdue-banner{grid-template-columns:1fr}.pass-overdue-banner button{width:100%}}
  @media(prefers-reduced-motion:reduce){.pass-safety-timer.overdue{animation:none}}
  `;document.head?.appendChild(style);
}
function passSafetyMarkup(){
  ensurePassSafetyStyles();
  const active=activePassRows(),blocking=active.find(row=>row.blocking===true),overdue=active.find(row=>passTiming(row).overdue),timing=blocking?passTiming(blocking):null;
  return `<div class="pass-safety-overlay ${blocking?'active':''}" data-active-pass-overlay role="alertdialog" aria-modal="true" aria-labelledby="active-pass-title" aria-hidden="${blocking?'false':'true'}"><section class="pass-safety-card"><div class="pass-safety-icon" data-active-pass-icon>${escapeHtml(blocking?.icon||'🎟️')}</div><div class="eyebrow">CHECK BACK IN REQUIRED</div><h2 id="active-pass-title" data-active-pass-title>${escapeHtml(blocking?`${blocking.label.toUpperCase()} PASS ACTIVE`:'PASS ACTIVE')}</h2><p data-active-pass-copy>${escapeHtml(blocking?`You are currently using your ${blocking.label} pass. Check back in before returning to Dragonswood work.`:'Return your active pass before continuing Dragonswood.')}</p><div class="pass-safety-timer ${timing?.overdue?'overdue':''}" data-active-pass-timer>${timing?(timing.overdue?`⏰ OVERDUE by ${formatPassDuration(timing.overdueMs)}`:`⏱️ ${formatPassDuration(timing.remainingMs)} remaining`):''}</div><button class="btn btn-primary w-full" type="button" data-return-active-pass="${escapeHtml(blocking?.type||'')}">✅ I AM BACK — RETURN PASS</button><small>Games, Scribe Arena, Daily Missions, and other Dragonswood activities stay locked until this pass is returned.</small></section></div><div class="pass-overdue-banner ${overdue&&!blocking?'active':''}" data-pass-overdue-banner role="alert" aria-live="assertive"><b data-pass-overdue-title>⏰ ${escapeHtml(overdue?.label?.toUpperCase()||'PASS')} OVERDUE</b><span data-pass-overdue-copy>${overdue?`You are ${formatPassDuration(passTiming(overdue).overdueMs)} overdue. Please return your pass now.`:'Please return your pass.'}</span><button type="button" data-return-active-pass="${escapeHtml(overdue?.type||'')}">RETURN PASS</button></div>`;
}
function passReminder(text){
  try{const AudioContext=window.AudioContext||window.webkitAudioContext;if(AudioContext){const context=new AudioContext(),osc=context.createOscillator(),gain=context.createGain();osc.frequency.value=880;gain.gain.setValueAtTime(.12,context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+.35);osc.connect(gain);gain.connect(context.destination);osc.start();osc.stop(context.currentTime+.36);osc.addEventListener('ended',()=>context.close())}}catch{}
  try{if('speechSynthesis' in window){speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.rate=.92;utterance.volume=1;speechSynthesis.speak(utterance)}}catch{}
}
function syncPassSafety(){
  const active=activePassRows(),blocking=active.find(row=>row.blocking===true),overlay=document.querySelector('[data-active-pass-overlay]'),banner=document.querySelector('[data-pass-overdue-banner]');
  if(overlay){overlay.classList.toggle('active',!!blocking);overlay.setAttribute('aria-hidden',blocking?'false':'true')}
  if(blocking){
    const timing=passTiming(blocking),timer=overlay?.querySelector('[data-active-pass-timer]');
    if(overlay?.querySelector('[data-active-pass-icon]'))overlay.querySelector('[data-active-pass-icon]').textContent=blocking.icon;
    if(overlay?.querySelector('[data-active-pass-title]'))overlay.querySelector('[data-active-pass-title]').textContent=`${blocking.label.toUpperCase()} PASS ACTIVE`;
    if(overlay?.querySelector('[data-active-pass-copy]'))overlay.querySelector('[data-active-pass-copy]').textContent=`You are currently using your ${blocking.label} pass. Check back in before returning to Dragonswood work.`;
    if(timer){timer.textContent=timing.overdue?`⏰ OVERDUE by ${formatPassDuration(timing.overdueMs)}`:`⏱️ ${formatPassDuration(timing.remainingMs)} remaining`;timer.classList.toggle('overdue',timing.overdue)}
    const button=overlay?.querySelector('[data-return-active-pass]');if(button)button.dataset.returnActivePass=blocking.type;
    if(location.hash!=='#adventure')location.hash='adventure';
  }
  const overdue=active.find(row=>passTiming(row).overdue);
  if(banner){banner.classList.toggle('active',!!overdue&&!blocking);if(overdue&&!blocking){const timing=passTiming(overdue);banner.querySelector('[data-pass-overdue-title]').textContent=`⏰ ${overdue.label.toUpperCase()} PASS OVERDUE`;banner.querySelector('[data-pass-overdue-copy]').textContent=`You are ${formatPassDuration(timing.overdueMs)} overdue. Please return your pass now.`;banner.querySelector('[data-return-active-pass]').dataset.returnActivePass=overdue.type}}
  for(const row of active){const timing=passTiming(row);if(!timing.overdue)continue;const key=`${row.type}:${row.startedMs}`;if(passAlertBuckets.get(key)===timing.alertBucket)continue;passAlertBuckets.set(key,timing.alertBucket);passReminder(`Your ${row.label} pass is overdue. Please return your pass and check back in now.`)}
}
function startPassSafetyEngine(){clearInterval(passSafetyInterval);passSafetyInterval=null;syncPassSafety();if(activePassRows().length)passSafetyInterval=setInterval(syncPassSafety,1000)}
async function returnActivePass(button){const type=button?.dataset?.returnActivePass;if(!type)return;button.disabled=true;button.textContent='Checking you back in…';try{await integrationController?.usePass(type);showToast('Pass returned. Welcome back.')}catch(err){button.disabled=false;button.textContent='✅ I AM BACK — RETURN PASS';showToast(err?.message||'Pass could not return.')}}

function teacherAttentionMarkup(){
  ensureTeacherDirectionStyles();
  const attention=state.attention,show=attention?.active===true&&attention?.acknowledgedByMe!==true;
  return `<div class="teacher-direction-overlay ${show?'active':''}" data-teacher-direction role="alertdialog" aria-modal="true" aria-labelledby="teacher-direction-title" aria-hidden="${show?'false':'true'}"><section class="teacher-direction-card"><div class="teacher-direction-bell">🔔</div><div class="eyebrow">TEACHER ATTENTION</div><h2 id="teacher-direction-title">${escapeHtml(attention?.title||'Teacher Direction')}</h2><p>${escapeHtml(attention?.message||'Please follow your teacher’s direction.')}</p><div class="teacher-direction-target">Next: ${escapeHtml(attentionDestinationLabel(attention?.destination))}</div><button class="btn btn-primary w-full" type="button" data-acknowledge-attention="${escapeHtml(attention?.id||'')}">I UNDERSTAND — GO NOW</button><small>Your acknowledgment is recorded so your teacher can see that you received the direction.</small></section></div>`;
}
function attentionDestinationLabel(destination){return ({'missions':'Daily Missions','module/daily-quest':'Morning Work','module/curriculum-quest':'Recovery Quest','day':'My Day','adventure':'My Adventure'})[destination]||'Daily Missions'}
function attentionDestinationHash(destination){return ['missions','module/daily-quest','module/curriculum-quest','day','adventure'].includes(String(destination))?String(destination):'missions'}
function playTeacherAttentionChime(id){
  if(!id||lastAttentionChime===id)return;lastAttentionChime=id;
  try{const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;const context=new Context(),notes=[659.25,987.77,1318.51];notes.forEach((frequency,index)=>{const osc=context.createOscillator(),gain=context.createGain();osc.type='triangle';osc.frequency.value=frequency;gain.gain.setValueAtTime(.28,context.currentTime+index*.16);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+index*.16+.42);osc.connect(gain);gain.connect(context.destination);osc.start(context.currentTime+index*.16);osc.stop(context.currentTime+index*.16+.44)});setTimeout(()=>context.close(),1200)}catch{}
}
async function acknowledgeTeacherAttention(button){
  const id=button?.dataset?.acknowledgeAttention;if(!id)return;button.disabled=true;button.textContent='Recording acknowledgment…';
  try{await integrationController?.acknowledgeAttention(id);location.hash=attentionDestinationHash(state.attention?.destination);showToast('Teacher direction acknowledged.')}catch(err){button.disabled=false;button.textContent='I UNDERSTAND — GO NOW';showToast(err?.message||'Acknowledgment could not save.')}
}

function currentPage(){
  if(blockingPass())return 'adventure';
  const hash = location.hash.replace('#','');
  const moduleId=moduleHost?.routeId(hash);
  if(moduleId){
    const gate=moduleHost.allowed(moduleId,{dailyAccessUnlocked:state.dailyAccessUnlocked});
    if(!gate.ok||moduleHost.definition(moduleId)?.morningGate&&unfinishedRequiredWork(moduleId).length){pendingRequiredWorkNotice=moduleId;return 'missions'}
    return moduleHost.definition(moduleId).returnPage;
  }
  const page=studentNavItems().some(n=>n[0]===hash) ? hash : 'adventure';
  if(requiredWorkLocked(page)){pendingRequiredWorkNotice=page;return 'missions'}
  return page;
}

function currentModuleId(){
  const id=requestedModuleId();
  return id&&moduleHost?.allowed(id,{dailyAccessUnlocked:state.dailyAccessUnlocked})?.ok&&(!moduleHost.definition(id)?.morningGate||unfinishedRequiredWork(id).length===0)?id:'';
}

function navMarkup(){
  const kingdomExtras=kingdomPortal?[kingdomNav]:[],freeExtras=arcadePortal?[arcadeNav]:[];
  return `
    <div class="nav-group-title">Explore</div>
    <nav class="portal-nav" aria-label="Student portal">
      ${navItems.slice(0,5).map(navButton).join('')}
    </nav>
    <div class="nav-group-title">Dragonswood</div>
    <nav class="portal-nav" aria-label="Dragonswood features">
      ${navItems.slice(5).map(navButton).join('')}
    </nav>${kingdomExtras.length?`\n    <div class="nav-group-title">Kingdom</div><nav class="portal-nav" aria-label="Kingdom features">${kingdomExtras.map(navButton).join('')}</nav>`:''}${freeExtras.length?`\n    <div class="nav-group-title">Free Time</div><nav class="portal-nav" aria-label="Free-time features">${freeExtras.map(navButton).join('')}</nav>`:''}
    <div class="streak-card">
      <div class="streak-top"><span class="streak-flame">🔥</span><div><b>${state.streak} day streak!</b><small>Keep it going</small></div></div>
      <div class="row between mt-12"><small>Weekly goal</small><small>70%</small></div>
      <progress class="dw-progress dw-progress-mini streak-progress" max="100" value="70" aria-label="Weekly goal progress">70%</progress>
    </div>
    <button class="signout" type="button" data-signout>↪ Sign out</button>`;
}
function navButton(item){
  const [id,icon,label,sub,badge] = item;
  return `<button class="nav-link ${state.page===id?'active':''}" type="button" data-page="${id}" ${state.page===id?'aria-current="page"':''}><span class="nav-icon">${icon}</span><span><span class="nav-main">${label}</span><span class="nav-sub">${sub}</span></span>${badge?`<span class="nav-badge">${badge}</span>`:''}</button>`;
}

function shell(){
  return `<div class="portal student-shell student-page-${state.page}" data-${IS_PRODUCTION?'release':'tester-build'}="v3.3">
    <header class="student-topbar"><div class="student-brand">
      <div class="brand-lockup"><img class="student-crest" src="assets/art/dragonswood-crest-v33.jpg" alt=""><div><div class="brand-name">DRAGONSWOOD</div><div class="brand-sub">STUDENT ADVENTURE PORTAL</div></div></div>
      <div class="student-utility"><button class="btn btn-secondary btn-sm" type="button" data-passes>🎟️ <span>Passes</span></button><button class="btn btn-secondary btn-sm" type="button" data-read>🔊 <span>Read aloud</span></button><div class="profile-pill" role="button" tabindex="0" data-module="adventurer-hall" aria-label="Open profile and Adventurer Hall"><div class="profile-orb">${escapeHtml(state.initial)}</div><span><b>${escapeHtml(state.firstName)}</b><small>Level ${state.level}</small></span></div></div>
    </div></header>
    <aside class="student-sidebar">${navMarkup()}</aside>
    <main class="student-main" id="page-content"><div class="student-content">${pageMarkup()}</div></main>
    ${passSafetyMarkup()}${teacherAttentionMarkup()}${referenceButton()}${IS_PRODUCTION?'':'<div class="tester-ribbon">V3.3 TESTER • LOCAL ONLY</div>'}
  </div>`;
}

function referenceButton(){
  return new URLSearchParams(location.search).get('reference')==='1' ? `<button type="button" class="btn btn-gold btn-sm reference-button" data-reference>Reference</button>` : '';
}

function welcome(){return `<div class="welcome-strip"><div>✦ &nbsp;<b>Good morning, ${escapeHtml(state.firstName)}!</b> &nbsp;<span>Your next win is ready.</span></div><button class="btn btn-secondary btn-sm" data-read>🔊 Read this page</button></div>`}
function studentTitle(icon,eyebrow,title,sub){const src=titleIcons[state.page];return `<div class="student-page-title"><div class="title-icon">${src?`<img src="${src}" alt="">`:icon}</div><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${sub}</p></div></div>`}
function questCard(icon,kicker,title,count,pct,copy){return `<article class="panel quest-card"><div class="quest-top"><span class="text-26">${icon}</span><span class="big-count">${count}</span></div><div class="eyebrow">${kicker}</div><h3>${title}</h3><p>${copy}</p><progress class="dw-progress" max="100" value="${pct}" aria-label="${title} progress">${pct}%</progress></article>`}

function pageMarkup(){
  const moduleId=currentModuleId();
  if(moduleId)return moduleHost.markup(moduleId);
  switch(state.page){
    case 'missions': return missionsPage();
    case 'games': return gamesPage();
    case 'scribe': return scribePage();
    case 'day': return dayPage();
    case 'hall': return hallPage();
    case 'boss': return bossPage();
    case 'leaderboards': return leaderboardPage();
    case 'poll': return pollPage();
    case 'kingdom': return kingdomPage();
    case 'arcade': return arcadePage();
    default: return adventurePage();
  }
}

function adventurePage(){
  const pct=state.xpPct;
  return `${welcome()}${studentTitle('🛡️','My Adventure','Ready for today’s quest?','Start with your mission, then choose how you want to explore Dragonswood.')}
  <section class="adventure-grid">
    <article class="panel adventurer-card">
      <div class="adventurer-art"><img src="assets/art/adventurer-art.jpg" alt="${escapeHtml(state.displayName)} with active pet ${escapeHtml(state.pet)}"></div>
      <div class="adventurer-info">
        <span class="rarity-chip">✦ EPIC ADVENTURER</span>
        <h2>${escapeHtml(state.displayName)}</h2><p>Grade ${escapeHtml(state.grade)} • ${escapeHtml(state.characterClass)} Class</p>
        <div class="stat-row"><div class="stat-box"><strong>❤️ ${state.hp}</strong><small>HP</small></div><div class="stat-box"><strong>🪙 ${state.gold}</strong><small>Gold</small></div><div class="stat-box"><strong>🔥 ${state.streak}</strong><small>Streak</small></div></div>
        <div class="xp-labels"><span>${state.xp.toLocaleString()} / ${state.xpMax.toLocaleString()} XP</span><span>${pct}%</span></div><progress class="dw-progress" max="100" value="${pct}" aria-label="Experience progress">${pct}%</progress>
        <button class="btn btn-secondary w-full" type="button" data-page="hall">⚔️ Open my character</button>
      </div>
    </article>
    <article class="panel next-step">
      <div class="eyebrow">⭐ Your next step</div><div class="next-reward">+40 XP</div><div class="next-icon">📜</div><h2>Morning Math Quest</h2><p>Complete 8 decimal problems. Your Math Coach will help one step at a time.</p>
      <div class="step-pills"><div class="step-pill done">✓ Log in</div><div class="step-pill current">2 Start math</div><div class="step-pill">3 Exit Quest</div></div>
      <button class="btn btn-primary w-full" type="button" data-page="missions">Start today’s mission →</button><p class="center muted mt-12 text-11">About 12 minutes • You can use read-aloud</p>
    </article>
  </section>
  <div class="section-heading"><div><div class="eyebrow">🏰 Teamwork</div><h2>Our class quests</h2></div><span class="muted text-11">Every point helps the whole guild.</span></div>
  <section class="quest-cards">${questCard('🌤️','Today','Second Recess','8 / 10',80,'Almost there! Just 2 more points to unlock it.')}${questCard('🐾','Class Quest','New Class Pet','72 / 100',72,'Keep making kind, ready choices.')}${questCard('🚌','Big Adventure','Field Trip','164 / 250',66,'Our adventure fund keeps growing.')}</section>`;
}

const missions = [
  {id:'morning',module:'daily-quest',n:'1',kicker:'DO THIS FIRST',icon:'🌅',title:'Morning Math Quest',desc:'8 decimal problems with step-by-step help.',time:'10–15 min',reward:'+40 XP',button:'Start mission →'},
  {id:'curriculum',module:'curriculum-quest',n:'2',kicker:'CLASS MISSION',icon:'🐉',title:'Curriculum Quest',desc:'Watch the short lesson, try it, then ask for teacher verification.',time:'10–15 min',reward:'+50 XP',button:'Open quest →'},
  {id:'exit',module:'daily-quest',n:'3',kicker:'END OF DAY',icon:'✅',title:'Exit Quest',desc:'Show what you learned in 3 quick questions.',time:'10–15 min',reward:'+25 XP',button:'Open quest →'}
];
function missionsPage(){
  const completeCount=state.completedMissions.size;
  const optionalOpen=state.dailyAccessUnlocked===true;
  return `${studentTitle('📜','Daily Missions','Your quest path','Finish the glowing mission first. Then choose a bonus adventure.')}
    <div class="panel path-summary"><div class="path-count"><strong>${completeCount}</strong><small>of 3</small></div><div class="path-copy"><div class="eyebrow">TODAY’S PROGRESS</div><b>One mission at a time.</b><div>${optionalOpen?'Morning Work is complete. Games, Scribe Arena, Boss Battle, Kingdom Wars, and Arcade are available.':'Games and optional adventures unlock after Morning Work.'}</div></div><div class="path-lock">${optionalOpen?'🔓 Adventures open':'🔒 Adventures locked'}</div></div>
    <div class="mission-list">${missions.map((m,i)=>missionRow(m,i)).join('')}</div>
    <div class="mission-extra"><article class="panel extra-card"><div class="extra-icon">📖</div><div><div class="extra-kicker">CLASS READING</div><h3>The Witches</h3><p>Continue from page 46. Page memory and read-aloud are ready.</p></div><button class="btn btn-secondary btn-sm" data-module="class-reader">Open reader</button></article><article class="panel extra-card"><div class="extra-icon">⭐</div><div><div class="extra-kicker">BONUS CHALLENGE</div><h3>Level-Up Mission</h3><p>Ready for more? Try a mission one level above.</p></div><button class="btn btn-secondary btn-sm" data-module="level-up-challenge">Try the challenge</button></article></div>`;
}
function missionRow(m,i){
  const done=state.completedMissions.has(m.id);
  const previousDone=i===0||state.completedMissions.has(missions[i-1].id);
  const current=!done&&previousDone;
  const locked=!done&&!previousDone;
  return `<article class="panel mission-row ${done?'complete':''} ${current?'current':''} ${locked?'locked':''}"><div class="mission-num">${done?'✓':m.n}</div><div class="mission-art">${m.icon}</div><div><div class="eyebrow">${done?'COMPLETE':m.kicker}</div><h3>${m.title}</h3><p>${m.desc}</p><div class="reward-line"><span>🔊 Read aloud</span><span>⏱ ${m.time}</span><span>✨ ${m.reward}</span></div></div><button class="btn ${current?'btn-primary':'btn-secondary'} btn-sm" type="button" data-module="${m.module}" ${locked?'disabled':''}>${done?'Review quest':m.button}</button></article>`;
}

const games=[
  ['decimal-deception','Math','assets/art/game-visual-1.jpg','Decimal Deception','Restore the crystal grid with decimal clues.'],
  ['math-operations','Math','assets/art/game-visual-2.jpg','Math Operations Quest','Practice the four operations through a guided adventure.'],
  ['fraction-forge','Math','assets/art/game-visual-3.jpg','Fraction Forge','Forge fractions and power up your battle skills.'],
  ['long-division','Math','assets/art/game-visual-2.jpg','Long Division Quest','Solve each division step as a mini battle.'],
  ['long-division-custom','Math','assets/art/game-visual-3.jpg','Custom Long Division','Practice teacher-selected long-division problems.'],
  ['spelling-practice','ELA','assets/art/game-visual-4.jpg','Spelling Practice','Hear, practice, and master this week’s words.'],
  ['witches-test','ELA','assets/art/game-visual-5.jpg','The Witches Reading Test','Show your understanding of the current class reading.'],
  ['class-reader','ELA','assets/art/game-visual-5.jpg','The Witches Reader','Continue the class novel with read-aloud.'],
  ['elemental-laboratory','Science','assets/art/game-visual-6.jpg','Elemental Laboratory','Build atoms and investigate matter.'],
  ['cosmic-architect','Science','assets/art/game-visual-6.jpg','Cosmic Architect','Build and investigate a model of the cosmos.'],
  ['arcane-forge','Science','assets/art/game-visual-6.jpg','Arcane Forge','Use science evidence to power the forge.']
];
function gamesPage(){
  const visible=state.gameFilter==='All'?games:games.filter(g=>g[1]===state.gameFilter);
  return `${studentTitle('🎮','Academic Games','Choose your adventure','Every game practices a real school skill. Pick a subject and jump in.')}
  <div class="filter-tabs game-filters">${['All','Math','ELA','Science'].map(f=>`<button class="filter-tab ${state.gameFilter===f?'active':''}" data-game-filter="${f}">${f==='All'?'✦ ':''}${f}</button>`).join('')}</div>
  <section class="game-grid">${visible.map(g=>`<article class="panel game-card"><div class="game-visual"><img src="${g[2]}" alt=""></div><div class="game-copy"><div class="subject">${g[1]} ADVENTURE</div><h3>${g[3]}</h3><p>${g[4]}</p><div class="game-badges"><span>✨ Earn XP</span><span>🔊 Read-aloud</span></div><button class="btn btn-primary" type="button" data-module="${g[0]}">Play quest →</button></div></article>`).join('')}</section>`;
}

function wordCount(text){return text.trim()?text.trim().split(/\s+/).length:0}
function scribePage(){
  const wc=wordCount(state.writing);
  const connected=state.academicConnected,session=state.scribeSession;
  const title=connected?(session?.title||'No active writing mission'):'A door appears in the oldest tree…';
  const prompt=connected?(session?.prompt||'Your teacher has not opened a writing mission yet.'):'You find a tiny golden key under your desk. At recess, it begins to glow and points toward the oldest tree in Dragonswood. What happens next?';
  const hints=session?.hints?.length?session.hints:['Show, don’t tell','Add one sensory detail','Use complete sentences'];
  const portfolio=state.scribePortfolio||{count:12,average:16.8,growth:3};
  const submitted=state.scribeResponse?.status==='submitted';
  const feedback=state.scribeResponse?.teacherFeedback||state.scribeResponse?.aiFeedback?.feedback||state.scribeResponse?.aiFeedback?.nextStep||'';
  return `${studentTitle('✍️','Scribe Arena','Turn your ideas into magic','Write freely. Your work saves as you type, and feedback helps you grow.')}
  <section class="scribe-layout"><div><article class="panel scribe-main-card"><div class="mission-prompt"><span class="rarity-chip">${session||!connected?'🔥 ACTIVE WRITING MISSION':'○ WAITING FOR TEACHER'}</span><h3>${escapeHtml(title)}</h3><div class="prompt-box">${escapeHtml(prompt)}</div><div class="prompt-tags">${hints.slice(0,3).map((hint,index)=>`<span>${['💡','👀','▣'][index]||'✦'} ${escapeHtml(hint)}</span>`).join('')}</div></div><div class="writing-area"><textarea id="scribe-text" aria-label="Your writing" placeholder="Start your story here…" ${connected&&!session?'disabled':''}>${escapeHtml(state.writing)}</textarea><div class="writing-meta"><span>☁ ${submitted?'Submitted':'Saved just now'}</span><span>${wc} words</span><span>⏱ ${session?session.timeMinutes+':00':'—'}</span></div><div class="row"><button class="btn btn-primary" data-submit-writing ${submitted||!session&&connected||wc<(session?.minWords||5)?'disabled':''}>${submitted?'✓ Submitted':'📜 Submit quickwrite'}</button><button class="btn btn-secondary" data-writing-hint>✨ Get a writing hint</button></div></div></article></div><aside class="panel coach-card"><div class="coach-avatar">🐉</div><div class="eyebrow center">DRAGONSWOOD WRITING COACH</div><h3>${feedback?'Your feedback is ready.':'Your ideas belong here.'}</h3><p>${escapeHtml(feedback||`Write at least ${session?.minWords||5} words and submit when you’re ready. Your teacher feedback will appear here after review.`)}</p><button class="btn btn-secondary w-full" ${feedback?'data-open-portfolio':'data-writing-hint'}>${feedback?'📚 Open reviewed writing':'✨ Get a writing hint'}</button></aside></section>
  <div class="panel portfolio-strip"><div class="portfolio-title"><span>📚</span><div><div class="eyebrow">MY WRITING PORTFOLIO</div><b>Your writing is growing</b></div></div><div class="portfolio-stats"><div class="portfolio-stat"><strong>${portfolio.count}</strong><small>Quickwrites</small></div><div class="portfolio-stat"><strong>${portfolio.average??'—'}</strong><small>Average score</small></div><div class="portfolio-stat"><strong>${Number(portfolio.growth)>=0?'+':''}${portfolio.growth??0}</strong><small>Points grown</small></div></div><button class="btn btn-secondary btn-sm" data-open-portfolio>Open portfolio →</button></div>`;
}

function dayPage(){
  const rows={
    Yesterday:[['8:00','✓','Morning Meeting',''],['8:25','✓','Math',''],['9:30','📚','ELA',''],['10:15','🔬','Science',''],['11:00','🍎','Lunch & Recess',''],['12:00','🏛️','Social Studies',''],['1:30','🎨','Specials','']],
    Today:[['8:00','✓','Morning Meeting',''],['8:25','✓','Math',''],['9:30','📚','ELA',''],['10:15','🔬','Science','Elemental Laboratory'],['11:00','🍎','Lunch & Recess',''],['12:00','🏛️','Social Studies',''],['1:30','🎨','Specials','']],
    Tomorrow:[['8:00','☀️','Morning Meeting','Community challenge'],['8:25','➗','Math','Division strategies'],['9:30','📚','ELA','Novel study'],['10:15','🔭','Science','Lab day'],['11:00','🍎','Lunch & Recess',''],['12:00','🏛️','Social Studies','Map skills'],['1:30','🎵','Specials','Music']]
  };
  const current=state.day==='Today';
  if(current&&state.worldConnected&&state.world){rows.Today=state.world.schedule.map(row=>[row.time,row.icon,row.title,row.detail]);}
  const job=state.worldConnected?state.world?.job:null,events=state.worldConnected?state.world?.events:null,dayIndex=state.world?.dayIndex??-1;
  const jobMarkup=job?`<div class="job-broom">${escapeHtml(job.icon)}</div><div class="eyebrow">MY CLASS JOB</div><h3>${escapeHtml(job.name)}</h3><p>${escapeHtml(job.description)}</p><div class="job-checks">${['M','T','W','T','F'].map((d,i)=>`<div class="job-day ${job.checkedDays.includes(i)?'done':''} ${i===dayIndex?'today':''}">${job.checkedDays.includes(i)?'✓':d}</div>`).join('')}</div><button class="btn btn-job w-full" data-job-checkoff ${dayIndex<0||job.checkedDays.includes(dayIndex)?'disabled':''}>${job.checkedDays.includes(dayIndex)?'✓ Today is complete':'✓ Check off today’s job'}</button>`:`<div class="job-broom">🧹</div><div class="eyebrow">MY CLASS JOB</div><h3>${state.worldConnected?'No job assigned':'Floor Captain'}</h3><p>${state.worldConnected?'Your teacher can assign this week’s guild job.':'Check the reading corner before dismissal.'}</p><div class="job-checks">${['M','T','W','T','F'].map((d,i)=>`<div class="job-day ${!state.worldConnected&&i<2?'done':''} ${!state.worldConnected&&i===2?'today':''}">${!state.worldConnected&&i<2?'✓':d}</div>`).join('')}</div>${state.worldConnected?'':'<button class="btn btn-job w-full" data-toast="Job check-in saved locally.">✓ Check off today’s job</button>'}`;
  const eventRows=events?.length?events.map(event=>[event.icon,event.title,[event.dateKey,event.time].filter(Boolean).join(' • ')||event.detail]):[['🏐','Volleyball Game','Tomorrow • 4:00 PM'],['🧪','Science Showcase','Friday • 1:30 PM'],['🌴','Fall Break','In 12 school days']];
  const liveDay=state.worldConnected&&state.world,currentIndex=liveDay?0:3;
  const currentMarkup=liveDay?`<div class="current-block"><div class="current-icon">${escapeHtml(rows.Today[0]?.[1]||'✦')}</div><div><div class="eyebrow">RIGHT NOW • TODAY</div><h2>${escapeHtml(rows.Today[0]?.[2]||'Your class day')}</h2><p>${escapeHtml(rows.Today[0]?.[3]||'Follow today’s live schedule below.')}</p></div><span class="current-time-left">Live schedule</span></div><h3 class="today-path-title">Today’s path</h3>`:'<div class="current-block"><div class="current-icon">🔬</div><div><div class="eyebrow">RIGHT NOW • 10:15–11:00</div><h2>Science</h2><p>Elemental Laboratory</p></div><span class="current-time-left">32 min left</span></div><h3 class="today-path-title">Today’s path</h3>';
  return `${studentTitle('🗓️','My Day','Know what’s next','Your schedule, class jobs, and upcoming events in one calm place.')}
  <div class="day-tabs">${['Yesterday','Today','Tomorrow'].map(d=>`<button class="day-tab ${state.day===d?'active':''}" data-day="${d}">${d}</button>`).join('')}</div><section class="day-layout"><article class="panel timeline">${current?currentMarkup:''}${rows[state.day].map((r,i)=>`<div class="timeline-row ${current&&i===currentIndex?'current':''}"><div class="timeline-dot">${escapeHtml(r[1])}</div><div class="timeline-time">${escapeHtml(r[0])}</div><div><h3>${escapeHtml(r[2])}</h3>${r[3]?`<p>${escapeHtml(r[3])}</p>`:''}</div>${current&&i===currentIndex?`<span class="now-pill">${liveDay?'TODAY':'NOW'}</span>`:''}</div>`).join('')}</article><aside class="day-side"><article class="panel job-card">${jobMarkup}</article><article class="panel events-card"><div class="eyebrow">UPCOMING</div><h3>📅 Events</h3>${eventRows.map(e=>`<div class="event-row"><div class="event-icon">${escapeHtml(e[0])}</div><div><b>${escapeHtml(e[1])}</b><small>${escapeHtml(e[2])}</small></div></div>`).join('')}</article></aside></section>`;
}

function hallPage(){
  const classes=[['Warrior','🛡️','Strong & brave'],['Ranger','🏹','Quick & clever'],['Mage','🔮','Powerful magic'],['Healer','🌿','Help your team']];
  const pets=[['Nyx','assets/art/pet-nyx.jpg'],['Ember','assets/art/pet-ember.jpg'],['Blink','assets/art/pet-blink.jpg'],['Mochi','assets/art/pet-mochi.jpg']];
  const hall=state.world?.hall,itemCount=hall?.inventory?.length??0,equipped=Object.entries(hall?.equipped||state.equipment||{}).filter(([,id])=>id);
  return `${studentTitle('⚔️','Adventurer Hall','Build your legend','Choose your class, equip powerful gear, and adventure with a pet companion.')}
  <section class="hall-grid"><article class="panel hall-character"><img src="assets/art/hall-character-v33.jpg" alt="${escapeHtml(state.displayName)} and active pet ${escapeHtml(state.pet)}"></article><div class="hall-controls"><article class="panel choice-panel class-panel"><div class="eyebrow">CHOOSE YOUR CLASS</div><h2>How do you want to adventure?</h2><div class="class-choices">${classes.map(c=>`<button class="choice-btn ${state.characterClass===c[0]?'active':''}" data-class="${c[0]}"><span>${c[1]}</span><b>${c[0]}</b><small>${c[2]}</small></button>`).join('')}</div></article><article class="panel choice-panel pet-panel"><div class="eyebrow">ACTIVE PET</div><h2>Pick your companion</h2><div class="pet-choices">${pets.map(p=>`<button class="pet-btn ${state.pet===p[0]?'active':''}" data-pet="${p[0]}"><div class="pet-art"><img src="${p[1]}" alt=""></div><b>${p[0]}</b></button>`).join('')}</div></article><article class="panel equipment-panel">${equipped.length?equipped.slice(0,2).map(([slot,id])=>`<div class="equip-card"><span>${slot==='weapon'?'⚔️':slot==='armor'?'🛡️':'✨'}</span><div><b>${escapeHtml(String(id).replace(/[_-]+/g,' '))}</b><small>${escapeHtml(slot)} • equipped</small></div></div>`).join(''):'<div class="equip-card"><span>○</span><div><b>No gear equipped</b><small>Open the Hall to choose gear</small></div></div>'}<div class="equip-card"><span>🎒</span><div><b>${itemCount} items</b><small>Authoritative inventory</small></div></div><button class="btn btn-secondary w-full" type="button" data-module="adventurer-hall">Open full Hall & inventory →</button></article></div></section>`;
}

function bossPage(){
  const loot=state.world?.boss?.lastLoot,bossNote=loot&&loot.dateKey===state.world?.dateKey?`Today’s chest: ${Number(loot.goldAward||0)} Gold + ${Number(loot.xpAward||0)} XP`:'Use what you learned today to help your class defeat the boss.';
  return `${studentTitle('👹','Boss Battle','The Gloomfang awakens!',bossNote)}
  <article class="panel boss-card"><div class="boss-arena"><img src="assets/art/boss-arena-v33.jpg" alt="Daily boss arena for ${escapeHtml(state.firstName)} and ${escapeHtml(state.pet)}"></div><div class="boss-head"><div class="boss-heading-row"><div class="boss-name"><span class="boss-mini">👹</span><div><div class="eyebrow">AUTHORITATIVE DAILY BATTLE</div><h2>Your boss challenge is ready inside the arena.</h2></div></div></div><p>${escapeHtml(bossNote)}</p><button class="btn btn-primary w-full" type="button" data-module="boss-battle">Enter today’s Boss Battle →</button></div></article>`;
}

function leaderboardPage(){
  const live=state.world?.leaderboard,rows=live?.rows||[];
  const ranks=rows.length?rows.slice(0,5).map(row=>[row.rank===1?'🥇':row.rank===2?'🥈':row.rank===3?'🥉':`#${row.rank}`,row.avatar,`${row.name}${row.isYou?' (You!)':''}`,`${row.activities} qualifying ${row.activities===1?'activity':'activities'}${row.rewarded?' • Rewarded ✓':''}`,Number(row.score).toLocaleString()]):[['🥇','👑','Abigail','Wizard • 4 day streak','1,840'],['🥈','🧙','Joshua','Ranger • 5 day streak','1,720'],['🥉','🛡️','Alaina','Warrior • 6 day streak','1,640'],['#4','🧙','Alejandro','Mage • 7 day streak','1,590'],['#5','🐉','You (You!)','Dragon Keeper • 8 day streak','1,520']];
  const you=live?.you,youIndex=you?Math.min(rows.indexOf(you),4):4;
  return `${studentTitle('🏆','Leaderboards','Celebrate class champions','See effort, growth, and teamwork—not just who finished first.')}
  <div class="leader-topline"><div class="filter-tabs"><button class="filter-tab active">📅 This Week</button><button class="filter-tab">🏰 All Time</button></div><span class="leader-reward-note">⭐ Top 5 earn one reward each school day</span></div><section class="leader-layout"><article class="panel rank-list"><div class="rank-heading"><span class="sparkle-big">✨</span><div><div class="eyebrow">OVERALL XP</div><h2>This Week’s Adventurers</h2></div></div>${ranks.map((r,i)=>`<div class="rank-row ${i===youIndex?'you':''}"><div class="rank-medal">${escapeHtml(r[0])}</div><div class="rank-avatar">${escapeHtml(r[1])}</div><div><b>${escapeHtml(r[2])}</b><div class="muted text-9">${escapeHtml(r[3])}</div></div><div class="rank-score">${escapeHtml(r[4])}<small> XP</small></div></div>`).join('')}</article><aside class="rank-side"><article class="panel rank-card"><div class="rank-dragon">🐉</div><div class="eyebrow">YOUR RANK</div><h2>#${you?.rank||5}</h2><p>${you?'Your real weekly activity scores are live.':'You moved up <b>2 places</b> this week!'}</p><div class="xp-labels"><span>${you?`${you.score.toLocaleString()} points this week`:'120 XP to #4'}</span><span>${you?'LIVE':'82%'}</span></div><progress class="dw-progress" max="100" value="${you?Math.min(100,you.score):82}">${you?Math.min(100,you.score):82}%</progress></article><article class="panel shine-card"><div class="eyebrow">MORE WAYS TO SHINE</div><h3>🌟 Class shout-outs</h3>${[['💛','Kindness','Alaina helped a classmate'],['🔥','Biggest Growth','Alejandro gained +4 points'],['📚','Reading Streak','Joshua reached 10 days']].map(s=>`<div class="shine-row"><span>${s[0]}</span><div><b>${s[1]}</b><small>${s[2]}</small></div></div>`).join('')}</article></aside></section>`;
}
function pollPage(){
  const poll=state.poll||{},choices=poll.choices||[],total=Number(poll.total)||0;
  if(!poll.active)return `${studentTitle('📝','Class Poll','No active poll','Your teacher can launch a quick class question at any time.')}<article class="panel next-step"><div class="next-icon">✓</div><h2>No poll is open right now.</h2><p>When your teacher starts one, it will appear here automatically.</p></article>`;
  return `${studentTitle('📝','Class Poll','Share one answer','Choose once. Results update live for the class.')}<article class="panel teacher-form"><div class="eyebrow">LIVE QUESTION</div><h2>${escapeHtml(poll.question||'Class Poll')}</h2><div class="stack mt-12">${choices.map((choice,index)=>{const count=Number(poll.counts?.[index])||0,pct=total?Math.round(count/total*100):0,voted=poll.myChoice===index;return `<div class="pass-card"><button class="btn ${voted?'btn-primary':'btn-secondary'} w-full" type="button" data-poll-choice="${index}" ${poll.myChoice!==null?'disabled':''}>${voted?'✓ ':''}${escapeHtml(choice)}</button><div class="xp-labels"><span>${count} vote${count===1?'':'s'}</span><span>${pct}%</span></div><progress class="dw-progress" max="100" value="${pct}">${pct}%</progress></div>`}).join('')}</div><p class="center muted mt-12">${poll.myChoice===null?'Choose one answer.':`Your vote is saved. ${total} total vote${total===1?'':'s'}.`}</p></article>`;
}

function arcadePage(){
  if(state.arcadeOpen&&state.arcadeAccess?.teacherEnabled){
    return `<section class="v33-module-shell"><div class="v33-module-toolbar"><div class="v33-module-heading"><span>🕹️</span><div><small>FREE-TIME ADVENTURE</small><h2>Dragonswood Arcade</h2></div></div><button class="btn btn-secondary btn-sm" type="button" data-arcade-close>Back</button></div><div class="v33-module-stage"><iframe class="v33-module-frame" title="Dragonswood Arcade" src="${escapeHtml(arcadePortal.href())}"></iframe></div></section>`;
  }
  const a=state.arcadeAccess||{},count=Math.max(0,Math.min(3,Number(a.tokens)||0));
  const ready=a.teacherEnabled===true&&(count===3||a.active===true),loading=state.arcadeStatus==='loading';
  return `${studentTitle('🕹️','Free-time currency','Arcade Time','Earn Ready, Responsible, and Complete Tokens. Three Tokens unlock one teacher-approved 30-minute session.')}<section class="adventure-grid"><article class="panel adventurer-card"><div class="adventurer-info"><span class="rarity-chip">ARCADE TOKEN WALLET</span><h2>${count} / 3 Tokens</h2><p>Your wallet cannot hold more than three.</p><div class="stat-row">${[1,2,3].map(i=>`<div class="stat-box"><strong>${i<=count?'🪙':'○'}</strong><small>${i<=count?'Earned':'Empty'}</small></div>`).join('')}</div><button class="btn btn-secondary w-full" type="button" data-arcade-refresh ${loading?'disabled':''}>${loading?'Checking…':'Refresh access'}</button></div></article><article class="panel next-step"><div class="eyebrow">${a.teacherEnabled?'ARCADE TIME OPEN':'TEACHER LOCK'}</div><div class="next-icon">${a.teacherEnabled?'🕹️':'🔒'}</div><h2>${a.active?'Session in progress':a.teacherEnabled?'Ready when you have 3 Tokens':'Arcade is closed right now'}</h2><p>${a.active?'Your authoritative timer follows you across refreshes, tabs, and devices.':a.teacherEnabled?'Spend all 3 Tokens inside the Arcade to start exactly 30 minutes.':'Like a field trip or second recess, Arcade opens only when your teacher activates it.'}</p><button class="btn btn-primary w-full" type="button" data-arcade-enter ${ready?'':'disabled'}>${a.active?'Return to Arcade':'Open Arcade Time'}</button><p class="center muted mt-12 text-11">Games record scores only • No Gold, XP, or Tokens from gameplay</p></article></section>`;
}

function kingdomPage(){
  return `<section class="v33-module-shell"><div class="v33-module-toolbar"><div class="v33-module-heading"><span>🏰</span><div><small>TEACHER UNLOCK REQUIRED</small><h2>Kingdom Wars</h2></div></div><button class="btn btn-secondary btn-sm" type="button" data-page="adventure">Back</button></div><div class="v33-module-stage"><iframe class="v33-module-frame" title="Kingdom Wars${IS_PRODUCTION?' student beta':' tester realm'}" src="${escapeHtml(kingdomPortal.href())}"></iframe></div></section>`;
}

function escapeHtml(value){return String(value??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

function applyStudentModel(model,academic,world,passes,poll,attention,kingdomAccess){
  if(!model)return;
  const accessWasUnlocked=state.dailyAccessUnlocked===true;
  const priorAttentionId=state.attention?.id;
  state.firstName=model.firstName;state.displayName=model.displayName;state.initial=model.initial;state.grade=model.grade;
  state.level=model.level;state.hp=model.hp;state.gold=model.gold;state.streak=model.streak;state.xp=model.xp;state.xpFloor=model.xpFloor;state.xpMax=model.xpNext;state.xpPct=model.xpPct;
  state.characterClass=model.classLabel;state.pet=model.petName;state.equipment=model.equipped||{};state.inventory=model.inventory||[];
  state.narrationVoice=model.narrationVoice||'';
  state.dailyAccessUnlocked=model.dailyAccessUnlocked===true;
  state.morningWorkComplete=model.morningWorkComplete===true;
  state.dailyAccessOverride=model.dailyAccessOverride===true;
  state.kingdomAccessUnlocked=kingdomAccess?.unlocked===true;
  state.attention=attention||null;
  if(!accessWasUnlocked&&state.dailyAccessUnlocked&&dialogRoot?.dataset.dialogKind==='required-work')closeDialog();
  if(model.dailyMissions){
    if(state.missionDate&&state.missionDate!==model.dailyMissions.dateKey){state.completedMissions.delete('curriculum');state.recoverySummary={dateKey:'',checked:false,count:0,days:[]}}
    state.missionDate=model.dailyMissions.dateKey||'';
    setMissionStatus('morning',model.dailyMissions.morning);
    setMissionStatus('exit',model.dailyMissions.exit);
  }
  if(academic?.scribe){
    state.academicConnected=true;state.scribeSession=academic.scribe.session||null;state.scribeResponse=academic.scribe.current||null;state.scribePortfolio=academic.scribe.portfolio||null;
    if(state.scribeResponse)state.writing=state.scribeResponse.responseText||'';
  }
  if(world){state.worldConnected=true;state.world=world;}
  if(passes)state.passes=passes;
  if(poll)state.poll=poll;
  if(state.attention?.active&&!state.attention.acknowledgedByMe&&state.attention.id!==priorAttentionId){location.hash=attentionDestinationHash(state.attention.destination);setTimeout(()=>playTeacherAttentionChime(state.attention.id),0)}
}
function setMissionStatus(id,status){
  if(status==='complete')state.completedMissions.add(id);
  else state.completedMissions.delete(id);
}
function handleModuleState(event){
  if(event.origin!==location.origin||event.data?.channel!=='dw-v33-module')return;
  const frame=app.querySelector('[data-module-frame]');
  const fromVisibleModule=!!frame&&event.source===frame.contentWindow,fromRecoveryProbe=!!recoveryProbe&&event.source===recoveryProbe.contentWindow;
  if(!fromVisibleModule&&!fromRecoveryProbe)return;
  const message=event.data;
  if(message.type==='daily-mission-state'){
    if(message.dateKey!==window.DWV33Core?.phoenixDateKey())return;
    setMissionStatus('morning',message.morning);
    setMissionStatus('exit',message.exit);
  }else if(message.type==='curriculum-mission-state'){
    setMissionStatus('curriculum',message.currentComplete?'complete':'not_started');
    state.recoverySummary={dateKey:window.DWV33Core?.phoenixDateKey()||state.missionDate,checked:true,count:Number(message.recoveryCount)||0,days:Array.isArray(message.recoveryDays)?message.recoveryDays.map(row=>({day:Number(row.day)||0,count:Number(row.count)||0})).filter(row=>row.day>0&&row.count>0):[]};
    storageSet('recovery-summary',JSON.stringify(state.recoverySummary));
    if(fromRecoveryProbe){recoveryProbe.remove();recoveryProbe=null}
  }else return;
  if(!currentModuleId())render();
}
function authGate(){
  const status=integrationSession.status||'loading',message=integrationSession.message||'Checking Dragonswood access…';
  const canSignIn=status==='signed-out'||status==='unauthorized'||status==='error';
  return `<div class="portal student-shell" data-${IS_PRODUCTION?'release':'tester-build'}="v3.3"><main class="student-main" id="page-content"><div class="student-content"><section class="panel next-step"><div class="eyebrow">${IS_PRODUCTION?'SECURE STUDENT PORTAL':'SECURE INTEGRATION CANDIDATE'}</div><div class="next-icon">🛡️</div><h2>${status==='unauthorized'?'Account not authorized':'Dragonswood Sign In'}</h2><p>${escapeHtml(message)}</p>${canSignIn?'<button class="btn btn-primary w-full" type="button" data-signin>Sign in with Google</button>':''}<p class="center muted mt-12 text-11">${IS_PRODUCTION?'Explore Academy • live student data':`${escapeHtml(window.DWV33Integration?.environment||'loading')} • no production writes enabled`}</p></section></div></main>${IS_PRODUCTION?'':'<div class="tester-ribbon">V3.3 INTEGRATION • SAFE MODE</div>'}</div>`;
}
function render(){
  if(integrationSession.status!=='authorized'){
    app.innerHTML=authGate();bindAuthGate();document.title=IS_PRODUCTION?'Dragonswood | Sign In':'[INTEGRATION] Dragonswood | Sign In';return;
  }
  ensureRecoveryProbe();
  state.page=currentPage();
  app.innerHTML=shell();
  bind();
  const moduleId=currentModuleId();
  document.title=`${IS_PRODUCTION?'':'[TESTER] '}Dragonswood | ${moduleId?moduleHost.definition(moduleId).title:studentNavItems().find(n=>n[0]===state.page)[2]}`;
  if(pendingRequiredWorkNotice){
    const target=pendingRequiredWorkNotice;pendingRequiredWorkNotice='';
    globalThis.history?.replaceState?.(null,'','#missions');
    showRequiredWorkDialog(target);
  }
}
function bindAuthGate(){
  app.querySelector('[data-signin]')?.addEventListener('click',async()=>{try{await integrationController?.signIn()}catch(err){showToast(`Sign-in failed: ${err?.code||err?.message||err}`)}});
}

function bind(){
  app.querySelectorAll('[data-page]').forEach(el=>el.addEventListener('click',()=>openPage(el.dataset.page)));
  app.querySelectorAll('[data-module]').forEach(el=>el.addEventListener('click',()=>openModule(el.dataset.module)));
  app.querySelector('[data-close-module]')?.addEventListener('click',closeModule);
  app.querySelector('[data-retry-module]')?.addEventListener('click',()=>mountModule(currentModuleId()));
  app.querySelector('[data-arcade-refresh]')?.addEventListener('click',refreshArcadePortal);
  app.querySelector('[data-arcade-enter]')?.addEventListener('click',()=>{state.arcadeOpen=true;render()});
  app.querySelector('[data-arcade-close]')?.addEventListener('click',()=>{state.arcadeOpen=false;render()});
  app.querySelectorAll('[data-toast]').forEach(el=>el.addEventListener('click',()=>showToast(el.dataset.toast)));
  app.querySelector('[data-signout]')?.addEventListener('click',async()=>{try{await integrationController?.signOut()}catch(err){showToast(`Sign-out failed: ${err?.message||err}`)}});
  app.querySelectorAll('[data-read]').forEach(el=>el.addEventListener('click',readPage));
  app.querySelector('[data-passes]')?.addEventListener('click',passesDialog);
  app.querySelectorAll('[data-return-active-pass]').forEach(el=>el.addEventListener('click',()=>returnActivePass(el)));
  app.querySelector('[data-acknowledge-attention]')?.addEventListener('click',e=>acknowledgeTeacherAttention(e.currentTarget));
  app.querySelector('[data-reference]')?.addEventListener('click',showReference);
  app.querySelectorAll('[data-game-filter]').forEach(el=>el.addEventListener('click',()=>{state.gameFilter=el.dataset.gameFilter;render()}));
  app.querySelectorAll('[data-poll-choice]').forEach(el=>el.addEventListener('click',async()=>{try{await integrationController?.votePoll(Number(el.dataset.pollChoice));showToast('Your poll vote was saved.')}catch(err){showToast(err?.message||'Poll vote could not save.')}}));
  app.querySelector('#scribe-text')?.addEventListener('input',e=>{state.writing=e.target.value;storageSet('writing',state.writing);const count=wordCount(state.writing),spans=e.target.nextElementSibling?.querySelectorAll('span');if(spans?.[1])spans[1].textContent=`${count} words`;const submit=app.querySelector('[data-submit-writing]');if(submit&&state.scribeResponse?.status!=='submitted')submit.disabled=count<(state.scribeSession?.minWords||5);clearTimeout(state.writingSaveTimer);if(state.scribeSession&&integrationController?.saveWriting)state.writingSaveTimer=setTimeout(()=>integrationController.saveWriting(state.writing).catch(err=>showToast(err?.message||'Draft could not save.')),500)});
  app.querySelectorAll('[data-writing-hint]').forEach(el=>el.addEventListener('click',writingHint));
  app.querySelectorAll('[data-open-portfolio]').forEach(el=>el.addEventListener('click',openWritingPortfolio));
  app.querySelector('[data-submit-writing]')?.addEventListener('click',submitWriting);
  app.querySelectorAll('[data-day]').forEach(el=>el.addEventListener('click',()=>{state.day=el.dataset.day;render()}));
  app.querySelector('[data-job-checkoff]')?.addEventListener('click',async()=>{try{await integrationController?.checkOffJob(state.world?.dayIndex);showToast('Today’s guild job is checked off.')}catch(err){showToast(err?.message||'Job check-off could not save.')}});
  app.querySelectorAll('[data-class]').forEach(el=>el.addEventListener('click',()=>openModule('adventurer-hall')));
  app.querySelectorAll('[data-pet]').forEach(el=>el.addEventListener('click',()=>openModule('adventurer-hall')));
  app.querySelectorAll('[data-move]').forEach(el=>el.addEventListener('click',()=>openModule('boss-battle')));
  if(currentModuleId())mountModule(currentModuleId());
  if(state.page==='arcade'&&state.arcadeStatus==='idle')refreshArcadePortal();
  startPassSafetyEngine();
}

async function refreshArcadePortal(){
  if(!arcadePortal)return;state.arcadeStatus='loading';if(state.page==='arcade')render();
  try{state.arcadeAccess=await arcadePortal.getAccess();state.arcadeStatus='ready'}catch(err){state.arcadeStatus='error';state.arcadeAccess={tokens:0,teacherEnabled:false};showToast(err?.message||'Arcade access is unavailable.')}
  if(state.page==='arcade')render();
}

function openPage(page){
  if(blockingPass()){showToast('Return your active pass before continuing Dragonswood.');location.hash='adventure';return}
  if(requiredWorkLocked(page)){location.hash='missions';showRequiredWorkDialog(page);return}
  location.hash=page;
}
function openModule(id){
  if(blockingPass()){showToast('Return your active pass before opening another activity.');location.hash='adventure';return}
  const gate=moduleHost?.allowed(id,{dailyAccessUnlocked:state.dailyAccessUnlocked});
  if(!gate?.ok||moduleHost?.definition(id)?.morningGate&&unfinishedRequiredWork(id).length){location.hash='missions';showRequiredWorkDialog(id);return}
  location.hash=`module/${encodeURIComponent(id)}`;
}
function closeModule(){
  const mod=moduleHost?.definition(currentModuleId());location.hash=mod?.returnPage||'adventure';
}
function mountModule(id){if(id)moduleHost?.mount(app,id,document.baseURI)}

async function readPage(){
  const title=studentNavItems().find(n=>n[0]===state.page)?.[2]||'Dragonswood';
  if(window.DWV33Narration){
    try{await window.DWV33Narration.readPage({id:`v33/student/${state.page}`,root:'#page-content',voiceId:state.narrationVoice,contentType:state.page==='scribe'?'ela':'general'});showToast('Cedar read-aloud started.');return}catch(err){showToast(err?.message||'Read-aloud could not start.');return}
  }
  if('speechSynthesis' in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(`Dragonswood. ${title}. ${document.querySelector('#page-content h1')?.textContent||''}`);u.rate=.9;speechSynthesis.speak(u);showToast('Read-aloud started.');}else showToast('Read-aloud is not available in this browser.');
}
function passesDialog(){
  const rows=state.passes?.rows||{};
  const actionLabel=row=>row?.action==='return'?'✅ I am back':row?.action==='start'?`${row.icon} Use ${row.label} pass`:row?.action==='request'?`🙋 Request extra ${row.label} pass`:row?.action==='pending'?'⏳ Request sent':'🔒 Unavailable';
  const cards=['bathroom','snack','outOfSeat','office'].map(type=>{const row=rows[type]||{type,label:window.DWV33Passes?.definition(type)?.label||type,icon:window.DWV33Passes?.definition(type)?.icon||'🎟️',message:'Loading pass status…',action:'blocked'};return `<div class="pass-card"><div class="pass-row"><div class="pass-student"><span class="roster-avatar">${row.icon}</span><div><b>${escapeHtml(row.label)}</b><p>${escapeHtml(row.message)}</p></div></div><button class="btn ${row.action==='return'?'btn-primary':'btn-secondary'} btn-sm" data-use-student-pass="${escapeHtml(type)}" ${['blocked','pending'].includes(row.action)?'disabled':''}>${escapeHtml(actionLabel(row))}</button></div></div>`}).join('');
  openDialog('Passes',`<p class="muted">Only one extra-pass request can wait at a time. Active passes must be checked back in here.</p><div class="stack mt-12">${cards}</div>`,'<button class="btn btn-secondary" data-close-dialog>Close</button>');
  dialogRoot.querySelectorAll('[data-use-student-pass]').forEach(button=>button.addEventListener('click',async()=>{button.disabled=true;try{await integrationController?.usePass(button.dataset.useStudentPass);closeDialog();showToast('Pass status updated.')}catch(err){button.disabled=false;showToast(err?.message||'Pass could not update.')}}));
}
function showReference(){
  const path=references[state.page];
  if(!path){openDialog('New approved route',`<p>This approved addition uses the V3.3 shell without modifying the protected original routes.</p>`);return}
  const overlay=document.createElement('div');overlay.className='reference-overlay';overlay.innerHTML=`<button class="btn btn-gold reference-close">Close reference</button><img src="${path}" alt="Approved reference screenshot for current page">`;document.body.appendChild(overlay);overlay.querySelector('button').addEventListener('click',()=>overlay.remove());
}
function writingHint(){
  const wc=wordCount(state.writing);const hint=wc<10?'Start by naming what the character can see, hear, or feel.':wc<40?'Choose one moment and slow it down with a sensory detail.':'Reread your last two sentences. Which one could use a stronger verb?';openDialog('Writing Coach Hint',`<p>${hint}</p><p class="muted">The coach gives a nudge, not the answer.</p>`)
}
function openWritingPortfolio(){
  const responses=state.scribePortfolio?.responses||[];
  const submitted=responses.filter(row=>row.status==='submitted');
  const rows=submitted.length?submitted.map(row=>`<article class="pass-card"><b>${escapeHtml(row.sessionTitle||row.writingType||'Writing response')}</b><p>${row.teacherScore===null||row.teacherScore===undefined?'Awaiting score':`${Number(row.teacherScore)}/20`} • ${Number(row.wordCount)||0} words</p>${row.teacherFeedback?`<p><b>Teacher feedback:</b> ${escapeHtml(row.teacherFeedback)}</p>`:''}<details><summary>Read my response</summary><p>${escapeHtml(row.responseText||'')}</p></details></article>`).join(''):'<div class="pass-card"><p>No submitted writing is available yet.</p></div>';
  openDialog('My Writing Portfolio',`<div class="stack mt-12">${rows}</div>`,`<button class="btn btn-primary" data-close-dialog>Close portfolio</button>`);
}
async function submitWriting(){
  const minimum=state.scribeSession?.minWords||5,wc=wordCount(state.writing);if(wc<minimum){openDialog('Checkpoint not ready',`<p>You have <b>${wc} words</b>. Add a little more detail before submitting so your teacher has enough writing to review.</p>`);return}
  if(state.scribeSession&&integrationController?.submitWriting){try{await integrationController.submitWriting(state.writing);openDialog('Checkpoint submitted',`<p>Your <b>${wc}-word</b> response is saved. Your teacher can review it, and the writing coach will add feedback when the grading service is available.</p>`)}catch(err){openDialog('Submission needs attention',`<p>${escapeHtml(err?.message||'Writing could not be submitted.')}</p>`)}return}
  openDialog('Checkpoint ready',`<p>Your draft has <b>${wc} words</b>. In production this would submit once, show a success state, and prevent duplicate submission.</p>`)
}
window.addEventListener('hashchange',()=>{if(integrationSession.status==='authorized')render()});
window.addEventListener('message',handleModuleState);
(async function bootstrapIntegration(){
  if(!window.DWV33Integration){integrationSession={status:'error',message:'Integration runtime did not load.'};render();return}
  integrationController=await window.DWV33Integration.startStudent(session=>{
    integrationSession=session;
    const previousPassSignature=passModelSignature();
    if(session.status==='authorized')applyStudentModel(session.student,session.academic,session.world,session.passes,session.poll,session.attention,session.kingdomAccess);
    const passChanged=previousPassSignature!==passModelSignature();
    if(passChanged||!currentModuleId()||!app.querySelector('[data-module-frame]'))render();else syncPassSafety();
  });
})();
