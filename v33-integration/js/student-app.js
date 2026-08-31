const app = document.querySelector('#app');
const IS_PRODUCTION = window.DWV33Integration?.environment === 'production';
const TESTER_KEY = IS_PRODUCTION ? 'dw-v33' : 'dw-v33-tester';
const SIMULATED_DATE_KEY='dw-tester-simulated-date';
const LOCAL_TESTER_UNLOCKS_KEY='dw-local-tester-unlocks';
function storageGet(key, fallback=''){try{return localStorage.getItem(`${TESTER_KEY}:${key}`) ?? fallback}catch{return fallback}}
function storageSet(key, value){try{localStorage.setItem(`${TESTER_KEY}:${key}`, value)}catch{}}
function sessionGet(key,fallback=''){try{return sessionStorage.getItem(key)??fallback}catch{return fallback}}
function sessionSet(key,value){try{value?sessionStorage.setItem(key,value):sessionStorage.removeItem(key)}catch{}}
function localTesterUnlocks(){if(!['localhost','127.0.0.1'].includes(location.hostname))return{};try{const value=JSON.parse(sessionGet(LOCAL_TESTER_UNLOCKS_KEY,'{}'));return value&&typeof value==='object'?value:{}}catch{return{}}}
function setLocalTesterUnlocks(patch){const next={...localTesterUnlocks(),...patch};sessionSet(LOCAL_TESTER_UNLOCKS_KEY,JSON.stringify(next));return next}
function storedRecoverySummary(){try{const value=JSON.parse(storageGet('recovery-summary','{}'));return value&&typeof value==='object'?value:{}}catch{return {}}}
const toast = document.querySelector('#toast');
const dialogRoot = document.querySelector('#dialog-root');
let integrationController=null,recoveryProbe=null,arcadeEntering=false,legacySpellingRecoveryPromise=null,legacySpellingRecoveryUid='',legacySpellingRecoveryLastAttempt=0;
let integrationSession={status:'loading',message:'Loading Dragonswood identity…'};
let passSafetyInterval=null;
const passFallbackStarts=new Map();
const passAlertBuckets=new Map();
const moduleHost=window.DWV33Modules;
const arcadePortal=window.DWV33ArcadePortal;
const kingdomPortal=window.DWV33KingdomPortal;
const REQUIRED_WORK_PAGES=new Set(['games','hall','boss','leaderboards','kingdom','arcade']);
const AFTERNOON_GAME_MODULES=new Set(['decimal-deception','math-operations','fraction-forge','elemental-laboratory','cosmic-architect','arcane-forge','deep-time-lab']);
let pendingRequiredWorkNotice='';
let pendingSubstituteNotice='';
let lastAttentionChime='';
let adventurePetActor=null,adventureMotionTimer=null;

const navItems = [
  ['adventure','my-adventurer','My Adventurer','Hero, pet & profile'],
  ['missions','dragons-path','Dragon’s Path','Today’s required quests','1'],
  ['games','quest-games','Quest Games','Learn through adventure'],
  ['scribe','scribe-and-journal','Scribe & Journal','Write, create & reflect'],
  ['day','schedule','Schedule','Classes, jobs & events'],
  ['hall','adventurer-hall','Adventurer Hall','Gear, pets & inventory'],
  ['boss','boss-battle','Boss Battle','Daily class challenge'],
  ['leaderboards','hall-of-champions','Hall of Champions','Rankings, effort & growth'],
  ['poll','dragon-council','Dragon Council','Class questions & votes']
];
const arcadeNav=['arcade','dragon-arcade','Dragon Arcade','3 tokens • 30 minutes'];
const kingdomNav=['kingdom','kingdom-wars','Kingdom Wars','Teacher unlock required'];
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
  reading: null,
  classGoals: null,
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
  isTester: false,
  testerCapabilities: {},
  testerUnlocks: {},
  testerLabel: '',
  simulatedDate:sessionGet(SIMULATED_DATE_KEY,''),
  previousPortalPage:'adventure',
  curriculumAccessUnlocked: false,
  spellingComplete: false,
  spellingGrade: 5,
  spellingResults: [],
  recoverySummary: storedRecoverySummary(),
  kingdomAccessUnlocked: false,
  substituteMode: null,
  attention: null,
  passes: null,
  poll: null
};

function effectiveDateKey(){return state.isTester&&/^\d{4}-\d{2}-\d{2}$/.test(state.simulatedDate)?state.simulatedDate:(window.DWV33Core?.phoenixDateKey?.()||new Date().toISOString().slice(0,10))}
function substituteModeActive(){const expires=Number(state.substituteMode?.expiresAtMs)||0;return state.substituteMode?.active===true&&(!expires||expires>Date.now())}
function afternoonSubstituteActive(){return substituteModeActive()&&state.substituteMode?.afternoon===true}
function afternoonSubstituteEligible(){return afternoonSubstituteActive()&&state.morningWorkComplete===true&&state.completedMissions.has('curriculum')}
function afternoonDestination(target){const id=String(target||'');return id==='games'||id==='arcade'||AFTERNOON_GAME_MODULES.has(id)}
function substituteBlocked(target){const id=String(target||'');if(!substituteModeActive())return false;if(afternoonSubstituteActive()&&afternoonDestination(id))return false;return ['kingdom','deep-time-lab','dragon-tongues','arcade','boss','boss-battle'].includes(id)}
function moduleAllowed(id){return moduleHost?.allowed(id,{dailyAccessUnlocked:afternoonSubstituteEligible()&&AFTERNOON_GAME_MODULES.has(String(id||''))?true:state.dailyAccessUnlocked})}
function weekendAcademicOpen(target){return window.DWV33Core?.isWeekendDateKey?.(effectiveDateKey())===true&&['rune-spelling','dragon-tongues','curriculum-quest'].includes(String(target||''))}
window.DWV33TesterDateContext=()=>Object.freeze({dateKey:effectiveDateKey(),simulated:state.isTester&&Boolean(state.simulatedDate),isTester:state.isTester,testerUnlocks:Object.freeze({...state.testerUnlocks})});

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
const titleIcons = Object.freeze({
  adventure:{src:'assets/mascot/actions/achievement.webp',alt:'Dragonswood dragon celebrating your adventure'},
  missions:{src:'assets/mascot/animations/guide-right/frame-1.webp',alt:'Dragonswood dragon guiding the next mission'},
  games:{src:'assets/mascot/actions/games.webp',alt:'Dragonswood dragon ready for academic games'},
  scribe:{src:'assets/mascot/actions/scribe.webp',alt:'Dragonswood dragon writing'},
  day:{src:'assets/mascot/actions/calendar.webp',alt:'Dragonswood dragon with today’s calendar'},
  hall:{src:'assets/mascot/actions/achievement.webp',alt:'Dragonswood dragon celebrating achievements'},
  boss:{src:'assets/mascot/actions/boss.webp',alt:'Dragonswood dragon ready for the boss challenge'},
  leaderboards:{src:'assets/mascot/actions/achievement.webp',alt:'Dragonswood dragon celebrating class achievements'},
  poll:{src:'assets/mascot/badges/thinking.webp',alt:'Dragonswood dragon thinking about the class poll'},
  kingdom:{src:'assets/mascot/actions/kingdom.webp',alt:'Dragonswood dragon exploring Kingdom Wars'},
  arcade:{src:'assets/mascot/actions/arcade.webp',alt:'Dragonswood dragon welcoming you to Arcade Time'}
});

function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(()=>toast.classList.remove('show'),4200);
}

function openDialog(title, body, actions=''){
  dialogRoot.innerHTML = `<div class="dialog-backdrop" data-dialog-backdrop><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><h2 id="dialog-title">${title}</h2>${body}<div class="dialog-actions">${actions || '<button class="btn btn-primary" data-close-dialog>Done</button>'}</div></section></div>`;
  dialogRoot.querySelector('[data-close-dialog]')?.addEventListener('click',closeDialog);
  dialogRoot.querySelector('[data-dialog-backdrop]')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeDialog()});
  dialogRoot.querySelector('button')?.focus();
}
function closeDialog(){dialogRoot.innerHTML='';delete dialogRoot.dataset.dialogKind}
function ensureHallProfileStyles(){
  if(window.DWV33VisualFreeze===true||document.querySelector('#v33-hall-profile-stability-styles'))return;
  const style=document.createElement('style');style.id='v33-hall-profile-stability-styles';style.textContent=`
  .student-page-hall .hall-character{min-height:0!important;height:auto!important;aspect-ratio:4/5;overflow:hidden}
  .student-page-hall .hall-character img{width:100%;height:100%;object-fit:contain!important;background:rgba(4,13,38,.35)}
  .student-page-hall .pet-art img{object-fit:contain!important}
  @media(max-width:820px){.student-page-hall .hall-character{min-height:0!important;max-width:520px;margin-inline:auto}}
  `;document.head?.appendChild(style);
}
function ensureTesterControlsStyles(){
  if(document.querySelector('#dw-true-tester-styles'))return;
  const style=document.createElement('style');style.id='dw-true-tester-styles';style.textContent=`
  .true-tester-badge{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border:1px solid #7fffd4;border-radius:999px;background:#092b29;color:#9bffe0;font-size:11px;font-weight:1000;letter-spacing:.08em}
  .tester-controls-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:14px 0}.tester-controls-grid .btn{min-height:48px}.tester-status-list{display:grid;gap:7px;margin:12px 0}.tester-status-row{display:flex;justify-content:space-between;gap:15px;padding:9px 11px;border:1px solid rgba(127,255,212,.22);border-radius:9px;background:rgba(9,43,41,.55)}.tester-status-row strong{color:#9bffe0}.tester-points-row{display:grid;grid-template-columns:120px 1fr;gap:9px}.tester-points-presets{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}@media(max-width:620px){.tester-controls-grid,.tester-points-row{grid-template-columns:1fr}}
  `;document.head?.appendChild(style);
}
function ensureTeacherDirectionStyles(){
  if(document.querySelector('#v33-teacher-direction-styles'))return;
  const style=document.createElement('style');style.id='v33-teacher-direction-styles';style.textContent=`
  .teacher-direction-overlay{display:none;position:fixed;inset:0;z-index:100000;place-items:center;padding:24px;background:rgba(20,0,8,.96);backdrop-filter:blur(12px)}.teacher-direction-overlay.active{display:grid}
  .teacher-direction-card{width:min(720px,94vw);padding:38px;text-align:center;border:4px solid #ff405f;border-radius:24px;background:radial-gradient(circle at 50% 0%,rgba(255,66,91,.32),transparent 55%),linear-gradient(160deg,#3d0714,#12040b 72%);box-shadow:0 0 90px rgba(255,42,76,.58);color:#fff}.teacher-direction-bell{font-size:78px;line-height:1;filter:drop-shadow(0 0 18px #ffda66)}
  .teacher-direction-card h2{margin:12px 0;color:#fff2a2;font:1000 clamp(34px,6vw,68px) var(--display-font);line-height:1.05}.teacher-direction-card p{font-size:clamp(20px,3vw,30px);line-height:1.38}.teacher-direction-target{margin:18px 0;padding:12px;border:1px solid #ff879a;border-radius:12px;background:#26050d;font-size:18px;font-weight:1000}.teacher-direction-card .btn{min-height:58px;font-size:18px}.teacher-direction-card small{display:block;margin-top:10px;color:#ffd9df}
  @media(max-width:820px){.teacher-direction-card{padding:25px 18px}}
  `;document.head?.appendChild(style);
}

function ensureSubstituteModeStyles(){
  if(document.querySelector('#v33-substitute-mode-styles'))return;
  const style=document.createElement('style');style.id='v33-substitute-mode-styles';style.textContent=`
  .substitute-student-banner{display:flex;align-items:center;gap:13px;margin:0 0 16px;padding:14px 17px;border:2px solid #ffc45d;border-radius:14px;background:linear-gradient(120deg,rgba(102,40,9,.97),rgba(72,15,29,.97));box-shadow:0 0 30px rgba(255,116,43,.2);color:#fff}.substitute-student-banner span{font-size:34px}.substitute-student-banner h2,.substitute-student-banner p{margin:0}.substitute-student-banner h2{color:#fff3ad;font-size:19px}.substitute-student-banner p{margin-top:3px;color:#ffe5cf;font-size:14px;line-height:1.45}.game-card.substitute-locked{border-color:rgba(255,174,75,.55);filter:saturate(.55)}.game-card.substitute-locked .game-visual{opacity:.55}.game-card.substitute-locked .subject{color:#ffcf7e}.substitute-lock-note{color:#ffcf7e!important;font-weight:900}
  @media(max-width:620px){.substitute-student-banner{align-items:flex-start}.substitute-student-banner span{font-size:28px}}
  `;document.head?.appendChild(style);
}

function ensureCombinedGameStyles(){
  if(document.querySelector('#v33-combined-game-styles'))return;
  const style=document.createElement('style');style.id='v33-combined-game-styles';style.textContent=`
  .game-actions{display:grid;grid-template-columns:1fr;gap:6px}.game-actions.split{grid-template-columns:repeat(2,minmax(0,1fr))}.game-actions .btn{width:100%;min-width:0;padding-inline:6px}
  `;document.head?.appendChild(style);
}

function recoverySummaryCurrent(){return state.recoverySummary?.checked===true&&state.recoverySummary?.dateKey===state.missionDate}
function ensureRecoveryProbe(){
  if(recoverySummaryCurrent()||recoveryProbe||requestedModuleId()==='curriculum-quest'||!moduleHost?.href)return;
  const frame=document.createElement('iframe');frame.id='v33-recovery-progress-probe';frame.title='Recovery progress check';frame.tabIndex=-1;frame.setAttribute('aria-hidden','true');frame.setAttribute('style','position:fixed;width:1px;height:1px;left:-10000px;top:-10000px;border:0;opacity:0;pointer-events:none');frame.src=moduleHost.href('curriculum-quest',document.baseURI,window.DWV33Integration?.environment);document.body?.appendChild(frame);recoveryProbe=frame;
}
function unfinishedRequiredWork(target='activity'){
  const rows=[];
  const destination=String(target||'activity');
  if(weekendAcademicOpen(destination))return rows;
  if(afternoonSubstituteActive()&&afternoonDestination(destination)){
    if(state.morningWorkComplete!==true)rows.push({id:'morning',icon:'🌅',title:'Morning Work',detail:'Finish today’s Morning Work.',route:'module/daily-quest'});
    if(!state.completedMissions.has('curriculum'))rows.push({id:'curriculum',icon:'🐉',title:'Current Curriculum Quest',detail:'Finish every lesson in today’s Current Quest.',route:'module/curriculum-quest'});
    return rows;
  }
  const testerMorningOverride=state.testerUnlocks.unlockMorning===true;
  if(testerMorningOverride&&['rune-spelling','dragon-tongues'].includes(destination))return rows;
  if(state.testerUnlocks.unlockCurriculum===true&&destination==='curriculum-quest')return rows;
  const needsSpelling=!['daily-quest','rune-spelling'].includes(destination);
  const needsCurriculum=!['daily-quest','rune-spelling','curriculum-quest'].includes(destination);

  // A dated teacher override intentionally opens optional destinations for
  // this scholar without falsely marking Morning or Recovery work complete.
  if(state.dailyAccessOverride!==true){
    if(!testerMorningOverride&&state.dailyAccessUnlocked!==true)rows.push({id:'morning',icon:'🌅',title:'Morning Work',detail:state.morningWorkComplete?'Teacher check-in or access hold remains.':'Not complete today.',route:'module/daily-quest'});
    if(!testerMorningOverride&&needsSpelling&&state.spellingComplete!==true)rows.push({id:'spelling',icon:'🔤',title:'Rune Spelling',detail:`Today’s Grade ${state.spellingGrade} spelling path is not complete.`,route:'module/rune-spelling'});
    if(needsCurriculum&&state.curriculumAccessUnlocked!==true){
      if(!recoverySummaryCurrent())rows.push({id:'recovery',icon:'🐉',title:'Recovery Missions',detail:'Open Recovery Quest for a live check.',route:'module/curriculum-quest'});
      else for(const day of state.recoverySummary.days||[])rows.push({id:`recovery-${day.day}`,icon:'🐉',title:`Recovery Day ${day.day}`,detail:`${day.count} unfinished mission${day.count===1?'':'s'}.`,route:'module/curriculum-quest'});
    }
  }

  // Kingdom Wars retains its own intentional teacher-controlled lock.
  if(String(target)==='kingdom'&&state.kingdomAccessUnlocked!==true)rows.push({id:'kingdom-access',icon:'🔒',title:'Kingdom Wars teacher unlock',detail:'Your teacher has not opened Kingdom Wars today.',route:'missions'});
  return rows;
}
function requiredWorkLocked(page){const target=String(page||'');if(target==='arcade'&&state.testerUnlocks.unlockArcade===true)return false;if(target==='kingdom'&&state.testerUnlocks.unlockKingdom===true)return false;if(target==='boss'&&state.testerUnlocks.unlockBoss===true)return false;return REQUIRED_WORK_PAGES.has(target)&&unfinishedRequiredWork(target).length>0}
function modulePathLocked(id){
  const moduleId=String(id||'');
  if(afternoonSubstituteActive()&&AFTERNOON_GAME_MODULES.has(moduleId))return !afternoonSubstituteEligible();
  if(moduleId==='boss-battle'&&state.testerUnlocks.unlockBoss===true)return false;
  if(['rune-spelling','curriculum-quest','dragon-tongues'].includes(moduleId))return unfinishedRequiredWork(moduleId).length>0;
  return moduleHost?.definition(moduleId)?.morningGate===true&&unfinishedRequiredWork(moduleId).length>0;
}
function requestedModuleId(){return moduleHost?.routeId(location.hash)||''}
function showRequiredWorkDialog(target='activity'){
  const label=target==='arcade'?'Arcade Time':target==='kingdom'?'Kingdom Wars':target==='boss'||target==='boss-battle'?'Boss Battle':target==='scribe'?'Scribe Arena':'this activity';
  const rows=unfinishedRequiredWork(target);
  openDialog(afternoonSubstituteActive()&&afternoonDestination(target)?'Finish Today’s Work to Unlock Free Play':'Finish Dragon’s Path First',`<p><b>${escapeHtml(label)}</b> is still locked. Here is exactly what Dragonswood can see unfinished right now:</p><div class="stack mt-12">${rows.map(row=>`<article class="pass-card"><div class="pass-row"><div class="pass-student"><span class="roster-avatar">${row.icon}</span><div><b>${escapeHtml(row.title)}</b><p>${escapeHtml(row.detail)}</p></div></div>${row.id==='kingdom-access'?'':`<button class="btn btn-primary btn-sm" type="button" data-required-route="${escapeHtml(row.route)}">Go there</button>`}</div></article>`).join('')}</div><p class="muted">${afternoonSubstituteActive()&&afternoonDestination(target)?'When both are complete, Quest Games and Arcade unlock free until the one-hour class window ends. No Arcade Tokens are used.':'This check runs again every time you try to enter a game or recreational area.'}</p>`,`<button class="btn btn-secondary" data-close-dialog>Stay on Dragon’s Path</button>`);
  dialogRoot.dataset.dialogKind='required-work';
  dialogRoot.querySelectorAll('[data-required-route]').forEach(button=>button.addEventListener('click',()=>{closeDialog();location.hash=button.dataset.requiredRoute}));
}
function showSubstituteModeDialog(target='activity'){
  const labels={kingdom:'Kingdom Wars','deep-time-lab':'Deep Time Lab','dragon-tongues':'Dragon Tongues',arcade:'Arcade',boss:'Boss Battle','boss-battle':'Boss Battle'},label=labels[String(target)]||'This activity';
  openDialog('Ask Your Substitute Teacher',`<div class="pass-card serious-warning"><b>🛑 ${escapeHtml(label)} is unavailable today.</b><p>${afternoonSubstituteActive()?'Afternoon Substitute Day keeps passes and restricted areas closed. Finished students may use Quest Games and Arcade during the one-hour window.':'Substitute Mode is on, so passes, Kingdom Wars, Deep Time Lab, Dragon Tongues, Arcade, and Boss Battle are disabled for the day.'}</p></div><p>If you need help or need to leave the room, please ask your substitute teacher directly.</p>`,`<button class="btn btn-primary" data-close-dialog>Return to Dragon’s Path</button>`);
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
  return `<div class="pass-safety-overlay ${blocking?'active':''}" data-active-pass-overlay role="alertdialog" aria-modal="true" aria-labelledby="active-pass-title" aria-hidden="${blocking?'false':'true'}"><section class="pass-safety-card"><div class="pass-safety-icon" data-active-pass-icon>${escapeHtml(blocking?.icon||'🎟️')}</div><div class="eyebrow">CHECK BACK IN REQUIRED</div><h2 id="active-pass-title" data-active-pass-title>${escapeHtml(blocking?`${blocking.label.toUpperCase()} PASS ACTIVE`:'PASS ACTIVE')}</h2><p data-active-pass-copy>${escapeHtml(blocking?`You are currently using your ${blocking.label} pass. Check back in before returning to Dragonswood work.`:'Return your active pass before continuing Dragonswood.')}</p><div class="pass-safety-timer ${timing?.overdue?'overdue':''}" data-active-pass-timer>${timing?(timing.overdue?`⏰ OVERDUE by ${formatPassDuration(timing.overdueMs)}`:`⏱️ ${formatPassDuration(timing.remainingMs)} remaining`):''}</div><button class="btn btn-primary w-full" type="button" data-return-active-pass="${escapeHtml(blocking?.type||'')}">✅ I AM BACK — RETURN PASS</button><small>Games, Scribe Arena, Dragon’s Path, and other Dragonswood activities stay locked until this pass is returned.</small></section></div><div class="pass-overdue-banner ${overdue&&!blocking?'active':''}" data-pass-overdue-banner role="alert" aria-live="assertive"><b data-pass-overdue-title>⏰ ${escapeHtml(overdue?.label?.toUpperCase()||'PASS')} OVERDUE</b><span data-pass-overdue-copy>${overdue?`You are ${formatPassDuration(passTiming(overdue).overdueMs)} overdue. Please return your pass now.`:'Please return your pass.'}</span><button type="button" data-return-active-pass="${escapeHtml(overdue?.type||'')}">RETURN PASS</button></div>`;
}
function passReminder(text){
  try{const AudioContext=window.AudioContext||window.webkitAudioContext;if(AudioContext){const context=new AudioContext(),osc=context.createOscillator(),gain=context.createGain();osc.frequency.value=880;gain.gain.setValueAtTime(.12,context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+.35);osc.connect(gain);gain.connect(context.destination);osc.start();osc.stop(context.currentTime+.36);osc.addEventListener('ended',()=>context.close())}}catch{}
  try{window.DWNarrator?.play({id:'v33/pass-reminder',text:String(text||''),contentType:'general',locale:'en-US',rate:.92})}catch{}
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
function attentionDestinationLabel(destination){return ({'missions':'Dragon’s Path','module/daily-quest':'Morning Work','module/curriculum-quest':'Recovery Quest','day':'My Day','adventure':'My Adventure'})[destination]||'Dragon’s Path'}
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
  if(hash==='arcade'){
    globalThis.history?.replaceState?.(null,'','#adventure');
    return 'adventure';
  }
  const moduleId=moduleHost?.routeId(hash);
  if(moduleId){
    if(substituteBlocked(moduleId)){pendingSubstituteNotice=moduleId;return 'missions'}
    const gate=moduleAllowed(moduleId);
    if(!gate.ok||modulePathLocked(moduleId)){pendingRequiredWorkNotice=moduleId;return 'missions'}
    return moduleHost.definition(moduleId).returnPage;
  }
  const page=studentNavItems().some(n=>n[0]===hash) ? hash : 'adventure';
  if(substituteBlocked(page)){pendingSubstituteNotice=page;return 'missions'}
  if(requiredWorkLocked(page)){pendingRequiredWorkNotice=page;return 'missions'}
  return page;
}

function currentModuleId(){
  const id=requestedModuleId();
  return id&&!substituteBlocked(id)&&moduleAllowed(id)?.ok&&!modulePathLocked(id)?id:'';
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
  const substituteLocked=substituteBlocked(id);
  return `<button class="nav-link ${state.page===id?'active':''}" type="button" data-page="${id}" ${state.page===id?'aria-current="page"':''}><picture class="nav-icon"><source srcset="assets/navigation/sidebar-hq-v1/webp/${icon}.webp" type="image/webp"><img src="assets/navigation/sidebar-hq-v1/png/${icon}.png" alt=""></picture><span><span class="nav-main">${label}</span><span class="nav-sub">${substituteLocked?'Off during Substitute Mode':sub}</span></span>${badge?`<span class="nav-badge">${badge}</span>`:''}</button>`;
}

function shell(){
  ensureTesterControlsStyles();
  ensureSubstituteModeStyles();
  ensureCombinedGameStyles();
  return `<div class="portal student-shell student-page-${state.page}" data-${IS_PRODUCTION?'release':'tester-build'}="v3.3">
    <header class="student-topbar"><div class="student-brand">
      <div class="brand-lockup"><img class="student-crest" src="assets/branding/dragonswood-mascot-crest.png" alt="Dragonswood mascot crest"><div><div class="brand-name">DRAGONSWOOD</div><div class="brand-sub">STUDENT ADVENTURE PORTAL</div></div></div>
      <div class="student-utility">${state.isTester?'<button class="btn btn-secondary btn-sm" type="button" data-tester-controls>🧪 <span>Tester Controls</span></button>':''}<button class="btn btn-secondary btn-sm" type="button" data-passes>🎟️ <span>${substituteModeActive()?'Ask sub for pass':'Passes'}</span></button><button class="btn btn-secondary btn-sm" type="button" data-read>🔊 <span>Read aloud</span></button><div class="profile-pill" role="button" tabindex="0" data-account-menu aria-label="Open account menu"><div class="profile-orb">${escapeHtml(state.initial)}</div><span><b>${escapeHtml(state.firstName)}</b><small>Level ${state.level}</small></span></div></div>
      </div></header>
    <aside class="student-sidebar">${navMarkup()}</aside>
    <main class="student-main" id="page-content">${state.isTester&&state.simulatedDate?`<div class="tester-date-banner" role="status">🧪 SAFE DATE PREVIEW • real date ${escapeHtml(window.DWV33Core?.phoenixDateKey?.()||'today')} • simulated date ${escapeHtml(state.simulatedDate)} • academic and Boss preview writes are disabled <button type="button" data-return-real-date>Return to Today</button></div>`:''}<div class="student-content">${substituteModeActive()?afternoonSubstituteActive()?`<section class="substitute-student-banner" role="alert"><span>🎮</span><div><h2>Afternoon Substitute Day • 1-hour free-play window</h2><p>${afternoonSubstituteEligible()?'You finished Morning Work and today’s Curriculum Quest. Quest Games and Arcade are unlocked free—no Tokens—until the class window ends.':'Finish Morning Work and every lesson in today’s Current Quest to unlock Quest Games and Arcade free. No Tokens will be used.'} Passes and restricted areas remain closed.</p></div></section>`:'<section class="substitute-student-banner" role="alert"><span>🛑</span><div><h2>Substitute Mode is on today</h2><p>Passes, Kingdom Wars, Deep Time Lab, Dragon Tongues, Arcade, and Boss Battle are unavailable. If you need help or need to leave the room, ask your substitute teacher.</p></div></section>':''}${pageMarkup()}</div></main>
    ${passSafetyMarkup()}${teacherAttentionMarkup()}${referenceButton()}${IS_PRODUCTION?'':'<div class="tester-ribbon">V3.3 TESTER • LOCAL ONLY</div>'}
  </div>`;
}

function referenceButton(){
  return new URLSearchParams(location.search).get('reference')==='1' ? `<button type="button" class="btn btn-gold btn-sm reference-button" data-reference>Reference</button>` : '';
}

function welcome(){return `<div class="welcome-strip"><div>✦ &nbsp;<b>Good morning, ${escapeHtml(state.firstName)}!</b> &nbsp;<span>Your next win is ready.</span></div></div>`}
function studentTitle(icon,eyebrow,title,sub){const mascot=titleIcons[state.page];return `<div class="student-page-title"><div class="title-icon">${mascot?`<img src="${mascot.src}" alt="${mascot.alt}">`:icon}</div><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${sub}</p></div></div>`}
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
    default: return adventurePage();
  }
}

function adventurePage(){
  const pct=state.xpPct,identity=canonicalAdventureIdentity(),badge=getLevelBadgeAsset(state.level);
  return `${welcome()}${studentTitle('🛡️','My Adventure','Ready for today’s quest?','Start with your mission, then choose how you want to explore Dragonswood.')}
  <section class="adventure-grid">
    <article class="panel adventurer-card">
      <div class="adventurer-art live-adventurer-stage" style="--adventure-background:url('${escapeHtml(identity.backgroundArt)}')">
        <img class="live-adventurer-hero" data-live-adventurer src="${escapeHtml(identity.heroArt)}" data-static-art="${escapeHtml(identity.staticHeroArt)}" alt="${escapeHtml(state.displayName)} wearing ${escapeHtml(identity.appearanceName)}">
        <div class="live-adventurer-pet" data-live-adventurer-pet aria-live="polite"></div>
      </div>
      <div class="adventurer-info">
        <div class="adventurer-profile-heading">
          <div class="adventurer-profile-copy"><span class="rarity-chip">✦ EPIC ADVENTURER</span><h2>${escapeHtml(state.displayName)}</h2><p>Grade ${escapeHtml(state.grade)} • ${escapeHtml(state.characterClass)} Class</p></div>
          <div class="live-adventurer-level" role="img" aria-label="${badge.alt}"><img src="${badge.src}" width="112" height="112" alt=""><span><small>LEVEL</small><strong>${badge.displayLevel}</strong></span></div>
        </div>
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
  <section class="quest-cards">${(state.classGoals?.rows||[{icon:'🌤️',title:'Second Recess',points:8,goal:10,pct:80},{icon:'🐾',title:'Class Pet',points:72,goal:100,pct:72},{icon:'🚌',title:'Field Trip',points:164,goal:250,pct:66}]).map(goal=>questCard(goal.icon,'Live class goal',goal.title,`${goal.points} / ${goal.goal}`,goal.pct,`${Math.max(0,goal.goal-goal.points)} points remaining • synced live`)).join('')}</section>`;
}

function getLevelBadgeAsset(level){
  const parsed=Number(level),displayLevel=Number.isFinite(parsed)?Math.max(1,Math.min(20,Math.trunc(parsed))):1,id=String(displayLevel).padStart(2,'0');
  return{displayLevel,src:`assets/level-badges/webp-256/level-badge-${id}.webp`,alt:`Level ${displayLevel}`};
}

function canonicalAdventureIdentity(){
  const RPG=window.DWRPG,hall=state.world?.hall||{},profile={classId:String(hall.classId||'').toLowerCase(),activePet:hall.activePet,rpgEquipped:hall.equipped||{},homeBackgroundId:hall.homeBackgroundId},portalPath=value=>{const src=String(value||'');if(/^https?:|^data:|^blob:/.test(src))return src;if(src.startsWith('v33-integration/'))return src.slice('v33-integration/'.length);if(src.startsWith('assets/'))return`../${src}`;return src},rawAppearance=RPG?.resolveAppearance?.(profile)||null,appearance=rawAppearance?{...rawAppearance,skinArt:portalPath(rawAppearance.skinArt),idleArt:portalPath(rawAppearance.idleArt),attackArt:portalPath(rawAppearance.attackArt),hurtArt:portalPath(rawAppearance.hurtArt)}:null,cls=RPG?.classes?.[profile.classId]||null,resolvedPet=RPG?.resolvePet?.(profile)||null,pet=resolvedPet?{...resolvedPet,art:portalPath(resolvedPet.art),animatedArt:portalPath(resolvedPet.animatedArt),motion:Object.fromEntries(Object.entries(resolvedPet.motion||{}).map(([key,value])=>[key,portalPath(value)]))}:null,background=RPG?.resolveBackground?.(profile)||null,reduced=matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true,staticHeroArt=appearance?.skinArt||portalPath(cls?.art)||'../assets/rpg/class-warrior.png',backgroundPath=portalPath(background?.art||'assets/rpg/backgrounds/fairy-purple.webp');
  return {profile,pet,appearance,appearanceName:appearance?.name||cls?.name||'adventurer appearance',staticHeroArt,heroArt:reduced?staticHeroArt:(appearance?.idleArt||staticHeroArt),backgroundArt:new URL(backgroundPath,document.baseURI).href};
}
function disposeAdventureIdentity(){if(adventureMotionTimer){clearInterval(adventureMotionTimer);adventureMotionTimer=null}if(adventurePetActor){adventurePetActor.destroy();adventurePetActor=null}}
function playAdventureIdentity(stateName='play'){
  const hero=app.querySelector('[data-live-adventurer]'),identity=canonicalAdventureIdentity();if(!hero)return;
  const animated=identity.appearance?.[`${stateName}Art`]||identity.appearance?.attackArt||identity.heroArt;hero.src=animated;hero.classList.remove('live-adventurer-action');void hero.offsetWidth;hero.classList.add('live-adventurer-action');adventurePetActor?.play(stateName,stateName==='celebrate'?1400:1000);setTimeout(()=>{if(hero.isConnected){hero.src=identity.heroArt;hero.classList.remove('live-adventurer-action')}},1100);
}
function mountAdventureIdentity(){
  disposeAdventureIdentity();const identity=canonicalAdventureIdentity(),hero=app.querySelector('[data-live-adventurer]'),petHost=app.querySelector('[data-live-adventurer-pet]');if(!hero||!petHost)return;
  hero.onerror=()=>{if(hero.getAttribute('src')!==identity.staticHeroArt)hero.src=identity.staticHeroArt};
  if(identity.pet&&window.DWPetMotion)adventurePetActor=new DWPetMotion.PetActor(petHost,identity.pet,{caption:true});else petHost.hidden=true;
  const states=['play','ability','celebrate'];let index=0;adventureMotionTimer=setInterval(()=>{if(!hero.isConnected){disposeAdventureIdentity();return}playAdventureIdentity(states[index++%states.length])},4800);
}

const missions = [
  {id:'morning',module:'daily-quest',n:'1',kicker:'DO THIS FIRST',icon:'🌅',title:'Morning Math Quest',desc:'8 decimal problems with step-by-step help.',time:'10–15 min',reward:'+40 XP',button:'Start mission →'},
  {id:'spelling',module:'rune-spelling',n:'2',kicker:'SPELLING PRACTICE',icon:'🔤',title:'Rune Spelling',desc:'Study and practice today’s teacher-assigned spelling words.',time:'10–15 min',reward:'Spelling grade',button:'Open spelling →'},
  {id:'curriculum',module:'curriculum-quest',n:'3',kicker:'CLASS MISSION',icon:'🐉',title:'Curriculum Quest',desc:'Watch the short lesson, try it, then ask for teacher verification.',time:'10–15 min',reward:'+50 XP',button:'Open quest →'}
];
function missionsPage(){
  const completeCount=missions.filter(m=>state.completedMissions.has(m.id)).length;
  const optionalOpen=unfinishedRequiredWork('games').length===0;
  const accessSummary=optionalOpen
    ?afternoonSubstituteActive()?afternoonSubstituteEligible()?'Morning Work and Current Quest are complete. Quest Games and Arcade are free during the one-hour window.':'Finish Morning Work and today’s Current Quest for free games and Arcade.':substituteModeActive()?'Dragon’s Path is complete. Substitute Mode keeps passes and five optional activities closed today.':'Dragon’s Path is complete. Dragon Tongues, games, Scribe Arena, Boss Battle, Kingdom Wars, and Arcade are available.'
    :state.testerUnlocks.unlockMorning===true
      ?'Tester access is active. Required work remains incomplete until you do it.'
      :'Complete Morning Work, Rune Spelling, and Curriculum Quest to open free-choice adventures.';
  const accessLabel=state.dailyAccessOverride===true?'🔓 Teacher override':state.testerUnlocks.unlockMorning===true?'🧪 Tester access':optionalOpen?'🔓 Adventures open':'🔒 Path in progress';
  const readingRows=state.reading?.rows||[],today=window.DWV33Core?.phoenixDateKey?.()||'',readingRow=readingRows.find(row=>row.dateKey===today)||readingRows.slice().sort((a,b)=>String(b.dateKey).localeCompare(String(a.dateKey)))[0],readingMinutes=readingRow?Math.round(readingRow.activeSeconds/6)/10:0,readingTarget=state.reading?.targetMinutes||20,readingAssigned=(state.reading?.assignedDateKeys||[]).includes(today);
  const languageSubstituteLocked=substituteBlocked('dragon-tongues'),languageLocked=languageSubstituteLocked||!(optionalOpen||weekendAcademicOpen('dragon-tongues')||state.testerUnlocks.unlockMorning===true);
  return `${studentTitle('📜','DRAGON’S PATH','Your quest path','Complete each glowing step. Free-choice adventures unlock when your required path is finished.')}
    <div class="panel path-summary"><div class="path-count"><strong>${completeCount}</strong><small>of 3</small></div><div class="path-copy"><div class="eyebrow">TODAY’S PROGRESS</div><b>One mission at a time.</b><div>${accessSummary}</div></div><div class="path-lock">${accessLabel}</div></div>
    <div class="mission-list">${missions.map((m,i)=>missionRow(m,i)).join('')}</div>
    <div class="mission-list mt-12"><article class="panel mission-row ${languageLocked?'locked':'current'}"><div class="mission-num">✦</div><div class="mission-art">🗣️</div><div><div class="eyebrow">${languageSubstituteLocked?'SUBSTITUTE MODE':'OPTIONAL LANGUAGE PATH'}</div><h3>Dragon Tongues</h3><p>${languageSubstituteLocked?'Unavailable today. Ask your substitute teacher if you need help.':'Choose a language and learn freely at your own pace after Curriculum Quest.'}</p><div class="reward-line"><span>🌍 12 languages</span><span>${languageSubstituteLocked?'🛑 Closed today':'🐉 Free path'}</span></div></div><button class="btn ${languageLocked?'btn-secondary':'btn-primary'} btn-sm" type="button" data-module="dragon-tongues" ${languageLocked?'disabled':''}>${languageSubstituteLocked?'Unavailable today':'Explore languages →'}</button></article></div>
    <div class="mission-extra"><article class="panel extra-card"><div class="extra-icon">✅</div><div><div class="extra-kicker">END OF DAY</div><h3>Exit Quest</h3><p>Return at the end of the day to show what you learned.</p></div><button class="btn btn-secondary btn-sm" data-module="daily-quest">${state.completedMissions.has('exit')?'Review exit quest':'Open exit quest'}</button></article><article class="panel extra-card"><div class="extra-icon">📖</div><div><div class="extra-kicker">${readingAssigned?'ASSIGNED CLASS READING':'CLASS READING'}</div><h3>The Witches</h3><p>${readingMinutes}/${readingTarget} verified active minutes${readingRow?.lastPage?` • last page ${readingRow.lastPage}`:''}. Time pauses when the reader is hidden or idle.</p></div><button class="btn btn-secondary btn-sm" data-module="class-reader">${readingAssigned&&readingMinutes<readingTarget?'Continue reading':'Open reader'}</button></article><article class="panel extra-card"><div class="extra-icon">⭐</div><div><div class="extra-kicker">BONUS CHALLENGE</div><h3>Level-Up Mission</h3><p>Ready for more? Try a mission one level above.</p></div><button class="btn btn-secondary btn-sm" data-module="level-up-challenge">Try the challenge</button></article></div>`;
}
function missionRow(m,i){
  const done=state.completedMissions.has(m.id);
  const testerUnlocked=(m.id==='spelling'&&state.testerUnlocks.unlockMorning===true)||(m.id==='curriculum'&&state.curriculumAccessUnlocked===true);
  const weekendUnlocked=(m.id==='spelling'||m.id==='curriculum')&&weekendAcademicOpen(m.module);
  const previousDone=i===0||state.completedMissions.has(missions[i-1].id)||state.dailyAccessOverride===true||testerUnlocked||weekendUnlocked;
  const current=!done&&previousDone;
  const locked=!done&&!previousDone;
  return `<article class="panel mission-row ${done?'complete':''} ${current?'current':''} ${locked?'locked':''}"><div class="mission-num">${done?'✓':m.n}</div><div class="mission-art">${m.icon}</div><div><div class="eyebrow">${done?'COMPLETE':m.kicker}</div><h3>${m.title}</h3><p>${m.desc}</p><div class="reward-line"><span>⏱ ${m.time}</span><span>✨ ${m.reward}</span></div></div><button class="btn ${current?'btn-primary':'btn-secondary'} btn-sm" type="button" data-module="${m.module}" ${locked?'disabled':''}>${done?'Review quest':m.button}</button></article>`;
}

const games=[
  ['decimal-deception','Math','assets/art/quest-game-cards/dragonswood-card-decimal-deception-1200x660.webp','Decimal Deception','Restore the crystal grid with decimal clues.'],
  ['math-operations','Math','assets/art/quest-game-cards/dragonswood-card-math-operations-quest-1200x660.webp','Math Operations Quest','Practice whole-number operations or enter Fraction Forge for fraction operations.','fraction-forge'],
  ['elemental-laboratory','Science','assets/art/quest-game-cards/dragonswood-card-elemental-laboratory-1200x660.webp','Elemental Laboratory','Build atoms and investigate matter.'],
  ['cosmic-architect','Science','assets/art/quest-game-cards/dragonswood-card-cosmic-architect-1200x660.webp','Cosmic Architect','Build and investigate a model of the cosmos.'],
  ['arcane-forge','Science','assets/art/quest-game-cards/dragonswood-card-arcane-forge-1200x660.webp','Arcane Forge','Use science evidence to power the forge.'],
  ['deep-time-lab','Science','assets/art/quest-game-cards/dragonswood-card-deep-time-lab-1200x660.webp','Deep Time Lab','Investigate fossils, evidence, and all forty Deep Time cases.']
];
function gamesPage(){
  const visible=state.gameFilter==='All'?games:games.filter(g=>g[1]===state.gameFilter);
  return `${studentTitle('🎮','Quest Games','Choose your adventure','Every game practices a real school skill. Pick a subject and jump in.')}
  <div class="filter-tabs game-filters">${['All','Math','ELA','Science'].map(f=>`<button class="filter-tab ${state.gameFilter===f?'active':''}" data-game-filter="${f}">${f==='All'?'✦ ':''}${f}</button>`).join('')}</div>
  <section class="game-grid">${visible.map(g=>{const substituteLocked=substituteBlocked(g[0]),secondaryId=g[5],secondaryLocked=secondaryId&&substituteBlocked(secondaryId);return `<article class="panel game-card ${substituteLocked?'substitute-locked':''}"><div class="game-visual"><img src="${g[2]}" alt="${g[3]} game artwork" loading="lazy" decoding="async"></div><div class="game-copy"><div class="subject">${substituteLocked?'SUBSTITUTE MODE':`${g[1]} ADVENTURE`}</div><h3>${g[3]}</h3><p>${substituteLocked?'Unavailable today. Ask your substitute teacher if you need help.':g[4]}</p><div class="game-badges"><span class="${substituteLocked?'substitute-lock-note':''}">${substituteLocked?'🛑 Closed today':'✨ Earn XP'}</span></div><div class="game-actions ${secondaryId?'split':''}"><button class="btn ${substituteLocked?'btn-secondary':'btn-primary'}" type="button" data-module="${g[0]}" ${substituteLocked?'disabled':''}>${substituteLocked?'Unavailable today':secondaryId?'Operations →':'Play quest →'}</button>${secondaryId?`<button class="btn btn-secondary" type="button" data-module="${secondaryId}" ${secondaryLocked?'disabled':''}>${secondaryLocked?'Unavailable today':'Fraction Forge →'}</button>`:''}</div></div></article>`}).join('')}</section>`;
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
  <section class="scribe-layout"><div><article class="panel scribe-main-card"><div class="mission-prompt"><span class="rarity-chip">${session||!connected?'🔥 ACTIVE WRITING MISSION':'○ WAITING FOR TEACHER'}</span><h3>${escapeHtml(title)}</h3><div class="prompt-box">${escapeHtml(prompt)}</div><div class="prompt-tags">${hints.slice(0,3).map((hint,index)=>`<span>${['💡','👀','▣'][index]||'✦'} ${escapeHtml(hint)}</span>`).join('')}</div></div><div class="writing-area"><textarea id="scribe-text" aria-label="Your writing" placeholder="Start your story here…" ${connected&&!session?'disabled':''}>${escapeHtml(state.writing)}</textarea><div class="writing-meta"><span>☁ ${submitted?'Submitted':'Saved just now'}</span><span>${wc} words</span><span>⏱ ${session?session.timeMinutes+':00':'—'}</span></div><div class="row"><button class="btn btn-primary" data-submit-writing ${submitted||!session&&connected||wc<(session?.minWords||5)?'disabled':''}>${submitted?'✓ Submitted':'📜 Submit quickwrite'}</button><button class="btn btn-secondary" data-writing-hint>✨ Get a writing hint</button></div></div></article></div><aside class="panel coach-card"><img class="official-mascot-art" src="assets/mascot/actions/scribe.webp" alt="Dragonswood dragon helping with writing"><div class="eyebrow center">DRAGONSWOOD WRITING COACH</div><h3>${feedback?'Your feedback is ready.':'Your ideas belong here.'}</h3><p>${escapeHtml(feedback||`Write at least ${session?.minWords||5} words and submit when you’re ready. Your teacher feedback will appear here after review.`)}</p><button class="btn btn-secondary w-full" ${feedback?'data-open-portfolio':'data-writing-hint'}>${feedback?'📚 Open reviewed writing':'✨ Get a writing hint'}</button></aside></section>
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
  return moduleHost?.markup('adventurer-hall')||'';
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
  <div class="leader-topline"><div class="filter-tabs"><button class="filter-tab active">📅 This Week</button><button class="filter-tab">🏰 All Time</button></div><span class="leader-reward-note">⭐ Top 5 earn one reward each school day</span></div><section class="leader-layout"><article class="panel rank-list"><div class="rank-heading"><span class="sparkle-big">✨</span><div><div class="eyebrow">OVERALL XP</div><h2>This Week’s Adventurers</h2></div></div>${ranks.map((r,i)=>`<div class="rank-row ${i===youIndex?'you':''}"><div class="rank-medal">${escapeHtml(r[0])}</div><div class="rank-avatar">${escapeHtml(r[1])}</div><div><b>${escapeHtml(r[2])}</b><div class="muted text-9">${escapeHtml(r[3])}</div></div><div class="rank-score">${escapeHtml(r[4])}<small> XP</small></div></div>`).join('')}</article><aside class="rank-side"><article class="panel rank-card"><img class="official-mascot-art" src="assets/mascot/actions/achievement.webp" alt="Dragonswood dragon celebrating your rank"><div class="eyebrow">YOUR RANK</div><h2>#${you?.rank||5}</h2><p>${you?'Your real weekly activity scores are live.':'You moved up <b>2 places</b> this week!'}</p><div class="xp-labels"><span>${you?`${you.score.toLocaleString()} points this week`:'120 XP to #4'}</span><span>${you?'LIVE':'82%'}</span></div><progress class="dw-progress" max="100" value="${you?Math.min(100,you.score):82}">${you?Math.min(100,you.score):82}%</progress></article><article class="panel shine-card"><div class="eyebrow">MORE WAYS TO SHINE</div><h3>🌟 Class shout-outs</h3>${[['💛','Kindness','Alaina helped a classmate'],['🔥','Biggest Growth','Alejandro gained +4 points'],['📚','Reading Streak','Joshua reached 10 days']].map(s=>`<div class="shine-row"><span>${s[0]}</span><div><b>${s[1]}</b><small>${s[2]}</small></div></div>`).join('')}</article></aside></section>`;
}
function pollPage(){
  const poll=state.poll||{},choices=poll.choices||[],total=Number(poll.total)||0;
  if(!poll.active)return `${studentTitle('📝','Class Poll','No active poll','Your teacher can launch a quick class question at any time.')}<article class="panel next-step"><div class="next-icon">✓</div><h2>No poll is open right now.</h2><p>When your teacher starts one, it will appear here automatically.</p></article>`;
  return `${studentTitle('📝','Class Poll','Share one answer','Choose once. Results update live for the class.')}<article class="panel teacher-form"><div class="eyebrow">LIVE QUESTION</div><h2>${escapeHtml(poll.question||'Class Poll')}</h2><div class="stack mt-12">${choices.map((choice,index)=>{const count=Number(poll.counts?.[index])||0,pct=total?Math.round(count/total*100):0,voted=poll.myChoice===index;return `<div class="pass-card"><button class="btn ${voted?'btn-primary':'btn-secondary'} w-full" type="button" data-poll-choice="${index}" ${poll.myChoice!==null?'disabled':''}>${voted?'✓ ':''}${escapeHtml(choice)}</button><div class="xp-labels"><span>${count} vote${count===1?'':'s'}</span><span>${pct}%</span></div><progress class="dw-progress" max="100" value="${pct}">${pct}%</progress></div>`}).join('')}</div><p class="center muted mt-12">${poll.myChoice===null?'Choose one answer.':`Your vote is saved. ${total} total vote${total===1?'':'s'}.`}</p></article>`;
}

function kingdomPage(){
  return `<section class="v33-module-shell"><div class="v33-module-toolbar"><div class="v33-module-heading"><span>🏰</span><div><small>TEACHER UNLOCK REQUIRED</small><h2>Kingdom Wars</h2></div></div><button class="btn btn-secondary btn-sm" type="button" data-page="adventure">Back</button></div><div class="v33-module-stage"><iframe class="v33-module-frame" title="Kingdom Wars${IS_PRODUCTION?' student beta':' tester realm'}" src="${escapeHtml(kingdomPortal.href())}"></iframe></div></section>`;
}

function escapeHtml(value){return String(value??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

async function signOutStudent(button=null){
  if(button)button.disabled=true;
  try{state.simulatedDate='';sessionSet(SIMULATED_DATE_KEY,'');await integrationController?.signOut();closeDialog()}catch(err){if(button)button.disabled=false;showToast(`Sign-out failed: ${err?.message||err}`)}
}
function accountDialog(){
  openDialog('Account',`<div class="pass-student"><span class="roster-avatar">${escapeHtml(state.initial)}</span><div><b>${escapeHtml(state.displayName||state.firstName)}</b><p>Level ${state.level} • Grade ${escapeHtml(state.grade)}</p></div></div><p class="muted mt-12">Sign out here when you need to switch Dragonswood accounts.</p>`,`<button class="btn btn-secondary" type="button" data-suggest-improvement>💡 Suggest an Improvement</button><button class="btn btn-secondary" type="button" data-close-dialog>Close</button><button class="btn btn-danger" type="button" data-account-signout>↪ Sign Out</button>`);
  dialogRoot.querySelector('[data-suggest-improvement]')?.addEventListener('click',()=>{closeDialog();window.dispatchEvent(new Event('dragonswood:open-suggestion'))});
  dialogRoot.querySelector('[data-account-signout]')?.addEventListener('click',e=>signOutStudent(e.currentTarget));
}

function testerControlsDialog(){
  if(!state.isTester)return;
  const rows=[['unlockMorning','Morning Work + Rune + Dragon Tongues'],['unlockCurriculum','Curriculum Quest'],['unlockArcade','Arcade'],['unlockKingdom','Kingdom Wars'],['unlockBoss','Boss Battle preview']];
  const statusRows=rows.map(([field,label])=>`<div class="tester-status-row" data-tester-status="${field}"><span>${label}</span><strong>${state.testerUnlocks[field]===true?'UNLOCKED':'LOCKED'}</strong></div>`).join('');
  const controls=rows.map(([field,label])=>{const capability=window.DWTesterAccess?.UNLOCK_CAPABILITIES?.[field],enabled=state.testerCapabilities[capability]===true;return `<button class="btn btn-secondary" type="button" data-tester-unlock="${field}" ${enabled?'':'disabled'}>Unlock ${label}</button>`}).join('');
  const today=window.DWV33Core?.phoenixDateKey?.()||new Date().toISOString().slice(0,10);
  openDialog('🧪 Tester Controls',`<p><b>${escapeHtml(state.testerLabel||'Authorized Dragonswood tester')}</b></p><p class="muted">These controls affect only your authenticated UID. Unlocks bypass access gates; they never mark academic work complete or change classwide locks. Override Morning Work bypasses Morning Work, Rune Spelling, and Dragon’s Tongue gates for this tester. Boss and simulated-date runs are safe previews with no rewards or completion writes.</p><div class="tester-status-list">${statusRows}</div><div class="tester-controls-grid"><button class="btn btn-primary" type="button" data-tester-unlock-all>Unlock Everything for Me</button><button class="btn btn-secondary" type="button" data-tester-relock-all>Relock Everything for Me</button><button class="btn btn-secondary" type="button" data-tester-unlock-kingdom-boss>Unlock Kingdom Wars + Boss Battle</button>${controls}</div><hr><h3>Change Day</h3><p class="muted">Shared safe preview date for Morning Work, Exit Quest, Rune Spelling, Dragon Tongues, Curriculum/Recovery, and Boss Battle.</p><div class="tester-points-row"><button class="btn btn-secondary btn-sm" type="button" data-tester-date-shift="-1">Previous Day</button><input data-tester-date type="date" value="${escapeHtml(state.simulatedDate||today)}" aria-label="Simulated tester date"><button class="btn btn-secondary btn-sm" type="button" data-tester-date-shift="1">Next Day</button></div><div class="tester-points-presets"><button class="btn btn-secondary btn-sm" type="button" data-tester-date-today>Today</button><button class="btn btn-primary btn-sm" type="button" data-tester-date-apply>Use Selected Day</button><button class="btn btn-secondary btn-sm" type="button" data-return-real-date>Return to Today</button></div><hr><h3>Self-points</h3><p class="muted">Awards use the real student balance and transaction ledger.</p><div class="tester-points-row"><select data-tester-currency aria-label="Tester point currency"><option value="xp">XP</option><option value="gold">Gold</option></select><input data-tester-custom-amount type="number" min="1" max="1000" step="1" value="10" aria-label="Custom tester point amount"></div><div class="tester-points-presets"><button class="btn btn-secondary btn-sm" type="button" data-tester-points="10">+10</button><button class="btn btn-secondary btn-sm" type="button" data-tester-points="50">+50</button><button class="btn btn-secondary btn-sm" type="button" data-tester-points="100">+100</button><button class="btn btn-primary btn-sm" type="button" data-tester-custom-points>Award Custom Amount</button></div>`,`<button class="btn btn-secondary" data-close-dialog>Close Tester Controls</button>`);
  dialogRoot.dataset.dialogKind='true-tester';
  dialogRoot.querySelector('.dialog')?.setAttribute('data-dialog-true-tester','');
  const apply=async(button,patch,message)=>{
    button.disabled=true;
    try{const next=await integrationController?.setTesterUnlocks(patch);state.testerUnlocks={...state.testerUnlocks,...next};showToast(message);testerControlsDialog()}
    catch(err){const localPreview=['localhost','127.0.0.1'].includes(location.hostname)&&state.isTester&&String(err?.code||err?.message||'').includes('permission');if(!localPreview){button.disabled=false;showToast(err?.message||'Tester controls could not update.');return}state.testerUnlocks={...state.testerUnlocks,...setLocalTesterUnlocks(patch)};showToast(`${message} Local safe-preview only until Firestore rules are deployed.`);testerControlsDialog()}
  };
  dialogRoot.querySelector('[data-tester-unlock-all]')?.addEventListener('click',e=>apply(e.currentTarget,{unlockMorning:true,unlockCurriculum:true,unlockArcade:true,unlockKingdom:true,unlockBoss:true},'All tester self-unlocks are on.'));
  dialogRoot.querySelector('[data-tester-relock-all]')?.addEventListener('click',e=>apply(e.currentTarget,{unlockMorning:false,unlockCurriculum:false,unlockArcade:false,unlockKingdom:false,unlockBoss:false},'All tester self-unlocks are off.'));
  dialogRoot.querySelector('[data-tester-unlock-kingdom-boss]')?.addEventListener('click',e=>apply(e.currentTarget,{unlockKingdom:true,unlockBoss:true},'Kingdom Wars and Boss Battle tester access are on.'));
  dialogRoot.querySelectorAll('[data-tester-unlock]').forEach(button=>button.addEventListener('click',()=>apply(button,{[button.dataset.testerUnlock]:true},`${button.textContent.trim()} is on.`)));
  const award=async(button,amount)=>{button.disabled=true;try{const currency=dialogRoot.querySelector('[data-tester-currency]')?.value||'xp',result=await integrationController?.adjustTesterSelfPoints(currency,amount);showToast(`Tester self-award saved: +${result.amount} ${String(result.currency||currency).toUpperCase()}.`)}catch(err){showToast(err?.message||'Tester points could not be awarded.')}finally{button.disabled=false}};
  dialogRoot.querySelectorAll('[data-tester-points]').forEach(button=>button.addEventListener('click',()=>award(button,Number(button.dataset.testerPoints))));
  dialogRoot.querySelector('[data-tester-custom-points]')?.addEventListener('click',e=>award(e.currentTarget,Number(dialogRoot.querySelector('[data-tester-custom-amount]')?.value)));
  const dateInput=dialogRoot.querySelector('[data-tester-date]'),useDate=value=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||'')))return;state.simulatedDate=value===today?'':value;sessionSet(SIMULATED_DATE_KEY,state.simulatedDate);closeDialog();render();showToast(state.simulatedDate?`Safe tester date changed to ${state.simulatedDate}.`:'Returned to the real date.');};
  dialogRoot.querySelectorAll('[data-tester-date-shift]').forEach(button=>button.addEventListener('click',()=>{dateInput.value=window.DWV33Core?.shiftDateKey?.(dateInput.value,Number(button.dataset.testerDateShift))||dateInput.value}));
  dialogRoot.querySelector('[data-tester-date-today]')?.addEventListener('click',()=>{dateInput.value=today});
  dialogRoot.querySelector('[data-tester-date-apply]')?.addEventListener('click',()=>useDate(dateInput.value));
  dialogRoot.querySelector('[data-return-real-date]')?.addEventListener('click',()=>useDate(today));
}

function applyStudentModel(model,academic,world,passes,poll,attention,kingdomAccess,classGoals,session={}){
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
  state.isTester=session.isTester===true;
  state.testerCapabilities=session.testerCapabilities||{};
  state.testerUnlocks={...(session.testerUnlocks||{}),...(state.isTester?localTesterUnlocks():{})};
  state.testerLabel=session.testerAccount?.label||'';
  state.curriculumAccessUnlocked=session.curriculumAccess?.unlocked===true;
  state.spellingGrade=Number(session.spelling?.grade||model.spellingGrade||model.grade)||5;
  state.spellingResults=Array.isArray(session.spelling?.results)?session.spelling.results:[];
  state.spellingComplete=state.spellingResults.some(row=>String(row.dateKey||'')===effectiveDateKey()&&String(row.completionStatus||row.status||'').includes('complete'));
  setMissionStatus('spelling',state.spellingComplete?'complete':'not_started');
  state.kingdomAccessUnlocked=kingdomAccess?.unlocked===true;
  state.substituteMode=session.substituteMode||null;
  state.attention=attention||null;
  if(!accessWasUnlocked&&state.dailyAccessUnlocked&&dialogRoot?.dataset.dialogKind==='required-work')closeDialog();
  if(model.dailyMissions&&!state.simulatedDate){
    if(state.missionDate&&state.missionDate!==model.dailyMissions.dateKey){state.completedMissions.delete('curriculum');state.recoverySummary={dateKey:'',checked:false,count:0,days:[]}}
    state.missionDate=model.dailyMissions.dateKey||'';
    setMissionStatus('morning',model.dailyMissions.morning);
    setMissionStatus('exit',model.dailyMissions.exit);
  }else if(state.simulatedDate){
    state.missionDate=effectiveDateKey();setMissionStatus('morning','not_started');setMissionStatus('exit','not_started');setMissionStatus('curriculum','not_started');
  }
  if(academic?.scribe){
    state.academicConnected=true;state.scribeSession=academic.scribe.session||null;state.scribeResponse=academic.scribe.current||null;state.scribePortfolio=academic.scribe.portfolio||null;
    if(state.scribeResponse)state.writing=state.scribeResponse.responseText||'';
  }
  if(academic?.reading)state.reading=academic.reading;
  if(world){state.worldConnected=true;state.world=world;}
  if(passes)state.passes=passes;
  if(poll)state.poll=poll;
  if(classGoals)state.classGoals=classGoals;
  if(state.attention?.active&&!state.attention.acknowledgedByMe&&state.attention.id!==priorAttentionId){location.hash=attentionDestinationHash(state.attention.destination);setTimeout(()=>playTeacherAttentionChime(state.attention.id),0)}
}
function setMissionStatus(id,status){
  if(status==='complete')state.completedMissions.add(id);
  else state.completedMissions.delete(id);
}
function handleModuleState(event){
  if(event.origin===location.origin&&event.data?.type==='dw-witches-reading-heartbeat'){
    const frame=app.querySelector('[data-module-frame]');
    if(frame&&event.source===frame.contentWindow)integrationController?.recordReadingActivity?.(event.data).catch(err=>console.warn('[Witches reading time]',err));
    return;
  }
  if(event.origin!==location.origin||event.data?.channel!=='dw-v33-module')return;
  const frame=app.querySelector('[data-module-frame]');
  const fromVisibleModule=!!frame&&event.source===frame.contentWindow,fromRecoveryProbe=!!recoveryProbe&&event.source===recoveryProbe.contentWindow;
  if(!fromVisibleModule&&!fromRecoveryProbe)return;
  const message=event.data;
  if(message.type==='daily-mission-state'){
    if(message.dateKey!==effectiveDateKey())return;
    setMissionStatus('morning',message.morning);
    setMissionStatus('exit',message.exit);
  }else if(message.type==='curriculum-mission-state'){
    setMissionStatus('curriculum',message.currentComplete?'complete':'not_started');
    state.recoverySummary={dateKey:effectiveDateKey()||state.missionDate,checked:true,count:Number(message.recoveryCount)||0,days:Array.isArray(message.recoveryDays)?message.recoveryDays.map(row=>({day:Number(row.day)||0,count:Number(row.count)||0})).filter(row=>row.day>0&&row.count>0):[]};
    storageSet('recovery-summary',JSON.stringify(state.recoverySummary));
    if(fromRecoveryProbe){recoveryProbe.remove();recoveryProbe=null}
  }else return;
  if(!currentModuleId())render();
}
function authGate(){
  const status=integrationSession.status||'loading',message=integrationSession.message||'Checking Dragonswood access…';
  const canSignIn=status==='signed-out'||status==='unauthorized'||status==='error';
  const emulatorForm=!IS_PRODUCTION&&canSignIn?'<div class="stack mt-12" data-emulator-signin><label>Emulator email<input class="w-full" type="email" autocomplete="username" data-emulator-email></label><label>Emulator password<input class="w-full" type="password" autocomplete="current-password" data-emulator-password></label><button class="btn btn-secondary w-full" type="button" data-emulator-submit>Sign in to local emulator</button></div>':'';
  return `<div class="portal student-shell" data-${IS_PRODUCTION?'release':'tester-build'}="v3.3"><main class="student-main" id="page-content"><div class="student-content"><section class="panel next-step"><div class="eyebrow">${IS_PRODUCTION?'SECURE STUDENT PORTAL':'SECURE INTEGRATION CANDIDATE'}</div><img class="auth-crest" src="assets/branding/dragonswood-mascot-crest.png" alt="Dragonswood mascot crest"><h2>${status==='unauthorized'?'Account not authorized':'Dragonswood Sign In'}</h2><p>${escapeHtml(message)}</p>${canSignIn?'<button class="btn btn-primary w-full" type="button" data-signin>Sign in with Google</button>':''}${emulatorForm}<p class="center muted mt-12 text-11">${IS_PRODUCTION?'Explore Academy • live student data':`${escapeHtml(window.DWV33Integration?.environment||'loading')} • no production writes enabled`}</p></section></div></main>${IS_PRODUCTION?'':'<div class="tester-ribbon">V3.3 INTEGRATION • SAFE MODE</div>'}</div>`;
}
function render(){
  if(integrationSession.status!=='authorized'){
    disposeAdventureIdentity();app.innerHTML=authGate();bindAuthGate();document.title=IS_PRODUCTION?'Dragonswood | Sign In':'[INTEGRATION] Dragonswood | Sign In';return;
  }
  ensureRecoveryProbe();
  const requestedModule=currentModuleId(),mountedModule=app.querySelector('[data-v33-module-shell]')?.dataset.v33ModuleShell||'';
  if(!blockingPass()&&requestedModule&&requestedModule===mountedModule&&app.querySelector('[data-module-frame]')){
    state.page=currentPage();
    document.title=`${IS_PRODUCTION?'':'[TESTER] '}Dragonswood | ${moduleHost.definition(requestedModule).title}`;
    syncPassSafety();
    return;
  }
  state.page=currentPage();
  disposeAdventureIdentity();
  app.innerHTML=shell();
  bind();
  const moduleId=currentModuleId();
  document.title=`${IS_PRODUCTION?'':'[TESTER] '}Dragonswood | ${moduleId?moduleHost.definition(moduleId).title:studentNavItems().find(n=>n[0]===state.page)[2]}`;
  if(pendingRequiredWorkNotice){
    const target=pendingRequiredWorkNotice;pendingRequiredWorkNotice='';
    globalThis.history?.replaceState?.(null,'','#missions');
    showRequiredWorkDialog(target);
  }
  if(pendingSubstituteNotice){
    const target=pendingSubstituteNotice;pendingSubstituteNotice='';
    globalThis.history?.replaceState?.(null,'','#missions');
    showSubstituteModeDialog(target);
  }
}
function bindAuthGate(){
  app.querySelector('[data-signin]')?.addEventListener('click',async()=>{try{await integrationController?.signIn()}catch(err){showToast(`Sign-in failed: ${err?.code||err?.message||err}`)}});
  app.querySelector('[data-emulator-submit]')?.addEventListener('click',async()=>{const email=app.querySelector('[data-emulator-email]')?.value||'',password=app.querySelector('[data-emulator-password]')?.value||'';try{await integrationController?.signInForEmulator(email,password)}catch(err){showToast(`Emulator sign-in failed: ${err?.code||err?.message||err}`)}});
}

function currentSpellingWeek(){
  const today=effectiveDateKey(),start=Date.UTC(2026,7,24),current=Date.parse(`${today}T12:00:00Z`),week=Math.floor((current-start)/(7*86400000))+1;
  return Math.max(1,Math.min(30,Number.isFinite(week)?week:1));
}
function spellingLevelKey(grade=state.spellingGrade){return ({3:'foundation',4:'grade4',5:'grade5',6:'challenge',7:'master',8:'master'})[Number(grade)]||'grade5'}
function legacySpellingStorageId(value){return String(value||'').trim().toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'')||'local'}
async function recoverLegacySpellingOutbox(){
  const uid=String(integrationSession.user?.uid||'').trim();
  if(integrationSession.status!=='authorized'||!uid||!integrationController?.reportSpellingMission)return;
  if(legacySpellingRecoveryPromise)return legacySpellingRecoveryPromise;
  if(legacySpellingRecoveryUid===uid&&Date.now()-legacySpellingRecoveryLastAttempt<30000)return;
  legacySpellingRecoveryUid=uid;legacySpellingRecoveryLastAttempt=Date.now();
  legacySpellingRecoveryPromise=(async()=>{
    const prefix=`dw-spelling-v5:${legacySpellingStorageId(uid)}:`,suffix=':report-outbox';let recovered=0;
    const keys=[];try{for(let index=0;index<localStorage.length;index++){const key=localStorage.key(index);if(key?.startsWith(prefix)&&key.endsWith(suffix))keys.push(key)}}catch{return 0}
    for(const key of keys){
      let records;try{records=JSON.parse(localStorage.getItem(key)||'[]')}catch{continue}if(!Array.isArray(records))continue;
      for(const record of records.filter(item=>item&&item.status!=='sent'&&item.payload?.type==='dragonswood-spelling-complete')){
        try{record.payload.studentId=uid;record.attempts=(Number(record.attempts)||0)+1;record.lastAttemptAt=new Date().toISOString();const acknowledged=await integrationController.reportSpellingMission({...record.payload});if(acknowledged!==true)throw new Error('Portal did not acknowledge the result.');record.status='sent';record.sentAt=new Date().toISOString();recovered++;
          const resultKey=`${key.slice(0,-suffix.length)}:results`;try{const results=JSON.parse(localStorage.getItem(resultKey)||'[]');if(Array.isArray(results)){const match=results.find(item=>item?.idempotencyKey===record.idempotencyKey);if(match){match.studentId=uid;match.reportStatus='sent';match.reportedAt=record.sentAt;localStorage.setItem(resultKey,JSON.stringify(results))}}}catch{}
        }catch(error){record.status='pending';record.lastError='Portal unavailable; safe retry remains queued.'}
      }
      const pending=records.filter(item=>item?.status!=='sent');try{pending.length?localStorage.setItem(key,JSON.stringify(pending)):localStorage.removeItem(key)}catch{}
    }
    if(recovered)showToast(`${recovered} saved Rune Spelling ${recovered===1?'result was':'results were'} recovered.`);return recovered;
  })();
  try{return await legacySpellingRecoveryPromise}finally{legacySpellingRecoveryPromise=null}
}
window.DWV33SpellingContext=()=>({
  studentId:integrationSession.user?.uid||'',studentName:state.displayName||state.firstName||'Adventurer',assignmentId:`weekly-spelling-${currentSpellingWeek()}`,
  spellingLevel:spellingLevelKey(),spellingWeek:currentSpellingWeek(),spellingDay:['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][window.DWV33Core?.weekday?.(effectiveDateKey())]||'',gradeCode:String(state.spellingGrade||5),role:state.isTester?'tester':'student',className:'Explore Academy',level:String(state.level||1),petName:state.pet||'Dragon',lessonBank:[],
  reportMission:async envelope=>integrationController?.reportSpellingMission?.(envelope)
});

function bind(){
  app.querySelectorAll('[data-page]').forEach(el=>el.addEventListener('click',()=>openPage(el.dataset.page,el)));
  app.querySelectorAll('[data-module]').forEach(el=>el.addEventListener('click',()=>openModule(el.dataset.module)));
  app.querySelector('[data-close-module]')?.addEventListener('click',closeModule);
  app.querySelector('[data-retry-module]')?.addEventListener('click',()=>mountModule(currentModuleId()));
  app.querySelectorAll('[data-toast]').forEach(el=>el.addEventListener('click',()=>showToast(el.dataset.toast)));
  app.querySelector('[data-signout]')?.addEventListener('click',e=>signOutStudent(e.currentTarget));
  const accountMenu=app.querySelector('[data-account-menu]');
  accountMenu?.addEventListener('click',accountDialog);
  accountMenu?.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();accountDialog()}});
  app.querySelectorAll('[data-read]').forEach(el=>el.addEventListener('click',readPage));
  app.querySelector('[data-passes]')?.addEventListener('click',passesDialog);
  app.querySelector('[data-tester-controls]')?.addEventListener('click',testerControlsDialog);
  app.querySelector('[data-return-real-date]')?.addEventListener('click',()=>{state.simulatedDate='';sessionSet(SIMULATED_DATE_KEY,'');render();showToast('Returned to the real date.');});
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
  if(currentModuleId())mountModule(currentModuleId());else if(state.page==='hall')mountModule('adventurer-hall');
  if(state.page==='adventure'&&!currentModuleId())mountAdventureIdentity();
  startPassSafetyEngine();
}

function setArcadeBusy(trigger,busy){
  if(!trigger)return;
  if(busy){
    trigger.dataset.arcadeLabel=trigger.innerHTML;
    trigger.disabled=true;
    trigger.setAttribute('aria-busy','true');
    trigger.innerHTML='<span class="nav-icon">🕹️</span><span><span class="nav-main">Opening Arcade…</span><span class="nav-sub">Checking Tokens</span></span>';
  }else{
    trigger.disabled=false;
    trigger.removeAttribute('aria-busy');
    if(trigger.dataset.arcadeLabel){trigger.innerHTML=trigger.dataset.arcadeLabel;delete trigger.dataset.arcadeLabel}
  }
}

function arcadeBlockedMessage(access){
  if(access?.testerOverride===true||access?.afternoonSubstituteAccess===true)return '';
  if(access?.afternoonSubstituteActive===true){const requirements=access.afternoonRequirements||{},missing=[requirements.morningComplete!==true?'Morning Work':'',requirements.curriculumComplete!==true?'every Current Quest lesson':''].filter(Boolean);return `Finish ${missing.join(' and ')} to unlock free Afternoon Arcade Time.`}
  if(access?.teacherEnabled!==true)return 'Arcade Time is still locked by your teacher.';
  const tokens=Math.max(0,Math.min(3,Number(access?.tokens)||0));
  if(tokens<3){const missing=3-tokens;return `You need ${missing} more Arcade Token${missing===1?'':'s'} before entering.`}
  return '';
}
async function enterArcade(trigger){
  if(arcadeEntering)return;
  if(!arcadePortal){showToast('Arcade Time is unavailable.');return}
  arcadeEntering=true;setArcadeBusy(trigger,true);showToast('Checking Arcade Tokens…');
  try{
    let access=await arcadePortal.getAccess();
    if(access?.active!==true){const blocked=arcadeBlockedMessage(access);if(blocked)throw new Error(blocked)}
    showToast(access?.active===true?'Resuming your Arcade Time…':'Preparing Arcade Time…');
    await arcadePortal.preflight?.();
    if(access?.active!==true){
      showToast(access?.afternoonSubstituteAccess===true?'Starting free Afternoon Arcade Time—no Tokens used…':access?.testerOverride===true?'Starting your tester Arcade session…':'Using 3 Tokens and starting 30 minutes…');
      access=await arcadePortal.startSession();
    }
    if(access?.active!==true)throw new Error('Arcade session did not start. Your Tokens were not intentionally spent by this page.');
    if(typeof arcadePortal.navigate==='function')arcadePortal.navigate();
    else location.assign(arcadePortal.href());
  }catch(err){
    arcadeEntering=false;setArcadeBusy(trigger,false);showToast(err?.message||'Arcade Time could not open.');
  }
}

function openPage(page,trigger=null){
  if(blockingPass()){showToast('Return your active pass before continuing Dragonswood.');location.hash='adventure';return}
  if(substituteBlocked(page)){location.hash='missions';showSubstituteModeDialog(page);return}
  if(requiredWorkLocked(page)){location.hash='missions';showRequiredWorkDialog(page);return}
  if(String(page)==='arcade'){enterArcade(trigger);return}
  if(String(page)==='hall'&&state.page!=='hall')state.previousPortalPage=state.page||'adventure';
  location.hash=page;
}
function openModule(id){
  if(blockingPass()){showToast('Return your active pass before opening another activity.');location.hash='adventure';return}
  if(substituteBlocked(id)){location.hash='missions';showSubstituteModeDialog(id);return}
  const gate=moduleAllowed(id);
  if(!gate?.ok||modulePathLocked(id)){location.hash='missions';showRequiredWorkDialog(id);return}
  location.hash=`module/${encodeURIComponent(id)}`;
}
function closeModule(){
  if(state.page==='hall'&&!currentModuleId()){location.hash=state.previousPortalPage||'adventure';return}
  const mod=moduleHost?.definition(currentModuleId());location.hash=mod?.returnPage||'adventure';
}
function mountModule(id){if(id)moduleHost?.mount(app,id,document.baseURI)}

async function readPage(){
  const title=studentNavItems().find(n=>n[0]===state.page)?.[2]||'Dragonswood';
  if(window.DWV33Narration){
    try{await window.DWV33Narration.readPage({id:`v33/student/${state.page}`,root:'#page-content',voiceId:'us-brian',contentType:state.page==='scribe'?'ela':'general'});showToast('Brian read-aloud started.');return}catch(err){showToast(err?.message||'Read-aloud could not start.');return}
  }
  showToast(`Brian read-aloud is still loading for ${title}. Please try again.`);
}
function passesDialog(){
  const rows=state.passes?.rows||{};
  const actionLabel=row=>row?.action==='return'?'✅ I am back':row?.action==='start'?`${row.icon} Use ${row.label} pass`:row?.action==='request'?`🙋 Request extra ${row.label} pass`:row?.action==='pending'?'⏳ Request sent':'🔒 Unavailable';
  const cards=['bathroom','snack','outOfSeat','office'].map(type=>{const row=rows[type]||{type,label:window.DWV33Passes?.definition(type)?.label||type,icon:window.DWV33Passes?.definition(type)?.icon||'🎟️',message:'Loading pass status…',action:'blocked'};return `<div class="pass-card"><div class="pass-row"><div class="pass-student"><span class="roster-avatar">${row.icon}</span><div><b>${escapeHtml(row.label)}</b><p>${escapeHtml(row.message)}</p></div></div><button class="btn ${row.action==='return'?'btn-primary':'btn-secondary'} btn-sm" data-use-student-pass="${escapeHtml(type)}" ${['blocked','pending'].includes(row.action)?'disabled':''}>${escapeHtml(actionLabel(row))}</button></div></div>`}).join('');
  openDialog('Passes',`<p class="muted">${substituteModeActive()?'Substitute Mode is on. If you need to leave the room, ask your substitute teacher directly.':'Only one extra-pass request can wait at a time. Active passes must be checked back in here.'}</p><div class="stack mt-12">${cards}</div>`,'<button class="btn btn-secondary" data-close-dialog>Close</button>');
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
    const previousTesterSignature=JSON.stringify([state.isTester,state.testerCapabilities,state.testerUnlocks]);
    const previousSubstituteSignature=JSON.stringify(state.substituteMode||{});
    if(session.status==='authorized'){applyStudentModel(session.student,session.academic,session.world,session.passes,session.poll,session.attention,session.kingdomAccess,session.classGoals,session);queueMicrotask(()=>recoverLegacySpellingOutbox())}
    const passChanged=previousPassSignature!==passModelSignature(),testerChanged=previousTesterSignature!==JSON.stringify([state.isTester,state.testerCapabilities,state.testerUnlocks]),substituteChanged=previousSubstituteSignature!==JSON.stringify(state.substituteMode||{});
    if(passChanged||!currentModuleId()||testerChanged||substituteChanged||!app.querySelector('[data-module-frame]'))render();else syncPassSafety();
  });
  recoverLegacySpellingOutbox();
})();
window.addEventListener('online',()=>recoverLegacySpellingOutbox());
