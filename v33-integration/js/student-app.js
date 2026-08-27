const app = document.querySelector('#app');
const IS_PRODUCTION = window.DWV33Integration?.environment === 'production';
const TESTER_KEY = IS_PRODUCTION ? 'dw-v33' : 'dw-v33-tester';
function storageGet(key, fallback=''){try{return localStorage.getItem(`${TESTER_KEY}:${key}`) ?? fallback}catch{return fallback}}
function storageSet(key, value){try{localStorage.setItem(`${TESTER_KEY}:${key}`, value)}catch{}}
const toast = document.querySelector('#toast');
const dialogRoot = document.querySelector('#dialog-root');
let integrationController=null;
let integrationSession={status:'loading',message:'Loading Dragonswood identity…'};
let passSafetyInterval=null;
const passFallbackStarts=new Map();
const passAlertBuckets=new Map();
const moduleHost=window.DWV33Modules;
const arcadePortal=window.DWV33ArcadePortal;
const kingdomPortal=window.DWV33KingdomPortal;

const navItems = [
  ['adventure','🛡️','My Adventure','Home base'],
  ['missions','📜','Daily Missions','Do this first','1'],
  ['games','🎮','Academic Games','Learn & play'],
  ['scribe','✍️','Scribe Arena','Write & grow'],
  ['day','🗓️','My Day','Schedule'],
  ['hall','⚔️','Adventurer Hall','Gear & pets'],
  ['boss','👹','Boss Battle','Daily challenge'],
  ['leaderboards','🏆','Leaderboards','Class champions']
];
const arcadeNav=['arcade','🕹️','Arcade Time','3 Tokens • 30 min'];
const kingdomNav=['kingdom','🏰','Kingdom Wars','After Morning Work'];
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
  arcadeStatus: 'idle',
  arcadeAccess: null,
  arcadeOpen: false,
  passes: null
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
function closeDialog(){dialogRoot.innerHTML=''}

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

function currentPage(){
  if(blockingPass())return 'adventure';
  const hash = location.hash.replace('#','');
  const moduleId=moduleHost?.routeId(hash);
  if(moduleId)return moduleHost.definition(moduleId).returnPage;
  const page=studentNavItems().some(n=>n[0]===hash) ? hash : 'adventure';
  return (page==='games'||page==='scribe'||page==='kingdom')&&!state.dailyAccessUnlocked?'missions':page;
}

function currentModuleId(){return moduleHost?.routeId(location.hash)||''}

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
      <div class="student-utility"><button class="btn btn-secondary btn-sm" type="button" data-passes>🎟️ <span>Passes</span></button><button class="btn btn-secondary btn-sm" type="button" data-read>🔊 <span>Read aloud</span></button><div class="profile-pill"><div class="profile-orb">${escapeHtml(state.initial)}</div><span><b>${escapeHtml(state.firstName)}</b><small>Level ${state.level}</small></span></div></div>
    </div></header>
    <aside class="student-sidebar">${navMarkup()}</aside>
    <main class="student-main" id="page-content"><div class="student-content">${pageMarkup()}</div></main>
    ${passSafetyMarkup()}${referenceButton()}${IS_PRODUCTION?'':'<div class="tester-ribbon">V3.3 TESTER • LOCAL ONLY</div>'}
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
  return `${studentTitle('📜','Daily Missions','Your quest path','Finish the glowing mission first. Then choose a bonus adventure.')}
    <div class="panel path-summary"><div class="path-count"><strong>${completeCount}</strong><small>of 3</small></div><div class="path-copy"><div class="eyebrow">TODAY’S PROGRESS</div><b>One mission at a time.</b><div>Games and Scribe Arena unlock after Morning Math.</div></div><div class="path-lock">🔒 Games locked</div></div>
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
  ['math-operations','Math','assets/art/game-visual-2.jpg','Long Division Quest','Solve each family step as a mini battle.'],
  ['fraction-forge','Math','assets/art/game-visual-3.jpg','Fraction Forge','Forge fractions and power up your battle skills.'],
  ['spelling-practice','ELA','assets/art/game-visual-4.jpg','Spelling Practice','Hear, practice, and master this week’s words.'],
  ['class-reader','ELA','assets/art/game-visual-5.jpg','The Witches Reader','Continue the class novel with read-aloud.'],
  ['elemental-laboratory','Science','assets/art/game-visual-6.jpg','Elemental Laboratory','Build atoms and investigate matter.']
];
function gamesPage(){
  const visible=state.gameFilter==='All'?games:games.filter(g=>g[1]===state.gameFilter);
  return `${studentTitle('🎮','Academic Games','Choose your adventure','Every game practices a real school skill. Pick a subject and jump in.')}
  <div class="filter-tabs game-filters">${['All','Math','ELA','Science','History'].map(f=>`<button class="filter-tab ${state.gameFilter===f?'active':''}" data-game-filter="${f}">${f==='All'?'✦ ':''}${f}</button>`).join('')}</div>
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
  return `${studentTitle('✍️','Scribe Arena','Turn your ideas into magic','Write freely. Your work saves as you type, and feedback helps you grow.')}
  <section class="scribe-layout"><div><article class="panel scribe-main-card"><div class="mission-prompt"><span class="rarity-chip">${session||!connected?'🔥 ACTIVE WRITING MISSION':'○ WAITING FOR TEACHER'}</span><h3>${escapeHtml(title)}</h3><div class="prompt-box">${escapeHtml(prompt)}</div><div class="prompt-tags">${hints.slice(0,3).map((hint,index)=>`<span>${['💡','👀','▣'][index]||'✦'} ${escapeHtml(hint)}</span>`).join('')}</div></div><div class="writing-area"><textarea id="scribe-text" aria-label="Your writing" placeholder="Start your story here…" ${connected&&!session?'disabled':''}>${escapeHtml(state.writing)}</textarea><div class="writing-meta"><span>☁ ${submitted?'Submitted':'Saved just now'}</span><span>${wc} words</span><span>⏱ ${session?session.timeMinutes+':00':'12:48'}</span></div><div class="row"><button class="btn btn-primary" data-submit-writing ${submitted||!session&&connected||wc<(session?.minWords||5)?'disabled':''}>${submitted?'✓ Submitted':'📜 Submit quickwrite'}</button><button class="btn btn-secondary" data-writing-hint>✨ Get a writing hint</button></div></div></article></div><aside class="panel coach-card"><div class="coach-avatar">🐉</div><div class="eyebrow center">DRAGONSWOOD WRITING COACH</div><h3>Your ideas belong here.</h3><p>Write at least ${session?.minWords||5} words and submit when you’re ready. Your coach will celebrate a strength and give you one clear next step.</p><button class="btn btn-secondary w-full" data-writing-hint>✨ Feedback appears here</button></aside></section>
  <div class="panel portfolio-strip"><div class="portfolio-title"><span>📚</span><div><div class="eyebrow">MY WRITING PORTFOLIO</div><b>Your writing is growing</b></div></div><div class="portfolio-stats"><div class="portfolio-stat"><strong>${portfolio.count}</strong><small>Quickwrites</small></div><div class="portfolio-stat"><strong>${portfolio.average??'—'}</strong><small>Average score</small></div><div class="portfolio-stat"><strong>${Number(portfolio.growth)>=0?'+':''}${portfolio.growth??0}</strong><small>Points grown</small></div></div><button class="btn btn-secondary btn-sm" data-toast="Portfolio opened in tester mode.">Open portfolio →</button></div>`;
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
  const hall=state.world?.hall,itemCount=hall?.inventory?.length??14;
  return `${studentTitle('⚔️','Adventurer Hall','Build your legend','Choose your class, equip powerful gear, and adventure with a pet companion.')}
  <section class="hall-grid"><article class="panel hall-character"><img src="assets/art/hall-character-v33.jpg" alt="${escapeHtml(state.displayName)} and active pet ${escapeHtml(state.pet)}"></article><div class="hall-controls"><article class="panel choice-panel class-panel"><div class="eyebrow">CHOOSE YOUR CLASS</div><h2>How do you want to adventure?</h2><div class="class-choices">${classes.map(c=>`<button class="choice-btn ${state.characterClass===c[0]?'active':''}" data-class="${c[0]}"><span>${c[1]}</span><b>${c[0]}</b><small>${c[2]}</small></button>`).join('')}</div></article><article class="panel choice-panel pet-panel"><div class="eyebrow">ACTIVE PET</div><h2>Pick your companion</h2><div class="pet-choices">${pets.map(p=>`<button class="pet-btn ${state.pet===p[0]?'active':''}" data-pet="${p[0]}"><div class="pet-art"><img src="${p[1]}" alt=""></div><b>${p[0]}</b></button>`).join('')}</div></article><article class="panel equipment-panel"><div class="equip-card"><span>⚔️</span><div><b>Moonsteel Sword</b><small>+8 ATK • Epic</small></div></div><div class="equip-card"><span>🛡️</span><div><b>Dragonward Shield</b><small>+6 DEF • Rare</small></div></div><div class="equip-card"><span>🎒</span><div><b>${itemCount} items</b><small>Open inventory</small></div></div></article></div></section>`;
}

function bossPage(){
  const pct=Math.max(0,Math.round(state.bossHp/state.bossMax*100));
  const loot=state.world?.boss?.lastLoot,bossNote=loot&&loot.dateKey===state.world?.dateKey?`Today’s chest: ${Number(loot.goldAward||0)} Gold + ${Number(loot.xpAward||0)} XP`:'Use what you learned today to help your class defeat the boss.';
  return `${studentTitle('👹','Boss Battle','The Gloomfang awakens!',bossNote)}
  <article class="panel boss-card"><div class="boss-head"><div class="boss-heading-row"><div class="boss-name"><span class="boss-mini">👹</span><div><div class="eyebrow">CLASS BOSS • DAY 3</div><h2>Gloomfang</h2></div></div><span class="boss-reward">🏆 Reward: 60 XP + Mystery Chest</span></div><div class="boss-hp"><div class="row between"><b>GLOOMFANG HP</b><strong>${state.bossHp} / ${state.bossMax}</strong></div><progress class="dw-progress dw-progress-boss" max="100" value="${pct}" aria-label="Gloomfang hit points">${pct}%</progress></div></div><div class="boss-arena"><img src="assets/art/boss-arena-v33.jpg" alt="Gloomfang boss facing ${escapeHtml(state.firstName)} and ${escapeHtml(state.pet)}"><div class="boss-feedback ${state.bossMessage?'show':''}">${state.bossMessage}</div></div><div class="move-label">✨ Choose your move!</div><div class="move-grid"><button class="move-btn" data-move="Decimal Strike"><span>➗</span><b>Decimal Strike</b><small>Answer a math question</small></button><button class="move-btn" data-move="Story Shield"><span>📚</span><b>Story Shield</b><small>Use reading evidence</small></button><button class="move-btn" data-move="Pet Power"><span>🐾</span><b>Pet Power</b><small>Fight beside ${state.pet}</small></button></div></article>`;
}

function leaderboardPage(){
  const live=state.world?.leaderboard,rows=live?.rows||[];
  const ranks=rows.length?rows.slice(0,5).map(row=>[row.rank===1?'🥇':row.rank===2?'🥈':row.rank===3?'🥉':`#${row.rank}`,row.avatar,`${row.name}${row.isYou?' (You!)':''}`,`${row.activities} qualifying ${row.activities===1?'activity':'activities'}${row.rewarded?' • Rewarded ✓':''}`,Number(row.score).toLocaleString()]):[['🥇','👑','Abigail','Wizard • 4 day streak','1,840'],['🥈','🧙','Joshua','Ranger • 5 day streak','1,720'],['🥉','🛡️','Alaina','Warrior • 6 day streak','1,640'],['#4','🧙','Alejandro','Mage • 7 day streak','1,590'],['#5','🐉','You (You!)','Dragon Keeper • 8 day streak','1,520']];
  const you=live?.you,youIndex=you?Math.min(rows.indexOf(you),4):4;
  return `${studentTitle('🏆','Leaderboards','Celebrate class champions','See effort, growth, and teamwork—not just who finished first.')}
  <div class="leader-topline"><div class="filter-tabs"><button class="filter-tab active">📅 This Week</button><button class="filter-tab">🏰 All Time</button></div><span class="leader-reward-note">⭐ Top 5 earn one reward each school day</span></div><section class="leader-layout"><article class="panel rank-list"><div class="rank-heading"><span class="sparkle-big">✨</span><div><div class="eyebrow">OVERALL XP</div><h2>This Week’s Adventurers</h2></div></div>${ranks.map((r,i)=>`<div class="rank-row ${i===youIndex?'you':''}"><div class="rank-medal">${escapeHtml(r[0])}</div><div class="rank-avatar">${escapeHtml(r[1])}</div><div><b>${escapeHtml(r[2])}</b><div class="muted text-9">${escapeHtml(r[3])}</div></div><div class="rank-score">${escapeHtml(r[4])}<small> XP</small></div></div>`).join('')}</article><aside class="rank-side"><article class="panel rank-card"><div class="rank-dragon">🐉</div><div class="eyebrow">YOUR RANK</div><h2>#${you?.rank||5}</h2><p>${you?'Your real weekly activity scores are live.':'You moved up <b>2 places</b> this week!'}</p><div class="xp-labels"><span>${you?`${you.score.toLocaleString()} points this week`:'120 XP to #4'}</span><span>${you?'LIVE':'82%'}</span></div><progress class="dw-progress" max="100" value="${you?Math.min(100,you.score):82}">${you?Math.min(100,you.score):82}%</progress></article><article class="panel shine-card"><div class="eyebrow">MORE WAYS TO SHINE</div><h3>🌟 Class shout-outs</h3>${[['💛','Kindness','Alaina helped a classmate'],['🔥','Biggest Growth','Alejandro gained +4 points'],['📚','Reading Streak','Joshua reached 10 days']].map(s=>`<div class="shine-row"><span>${s[0]}</span><div><b>${s[1]}</b><small>${s[2]}</small></div></div>`).join('')}</article></aside></section>`;
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
  return `<section class="v33-module-shell"><div class="v33-module-toolbar"><div class="v33-module-heading"><span>🏰</span><div><small>UNLOCKED AFTER MORNING WORK</small><h2>Kingdom Wars</h2></div></div><button class="btn btn-secondary btn-sm" type="button" data-page="adventure">Back</button></div><div class="v33-module-stage"><iframe class="v33-module-frame" title="Kingdom Wars${IS_PRODUCTION?' student beta':' tester realm'}" src="${escapeHtml(kingdomPortal.href())}"></iframe></div></section>`;
}

function escapeHtml(value){return String(value??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

function applyStudentModel(model,academic,world,passes){
  if(!model)return;
  state.firstName=model.firstName;state.displayName=model.displayName;state.initial=model.initial;state.grade=model.grade;
  state.level=model.level;state.hp=model.hp;state.gold=model.gold;state.streak=model.streak;state.xp=model.xp;state.xpFloor=model.xpFloor;state.xpMax=model.xpNext;state.xpPct=model.xpPct;
  state.characterClass=model.classLabel;state.pet=model.petName;state.equipment=model.equipped||{};state.inventory=model.inventory||[];
  state.narrationVoice=model.narrationVoice||'';
  state.dailyAccessUnlocked=model.dailyAccessUnlocked===true;
  if(model.dailyMissions){
    if(state.missionDate&&state.missionDate!==model.dailyMissions.dateKey)state.completedMissions.delete('curriculum');
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
}
function setMissionStatus(id,status){
  if(status==='complete')state.completedMissions.add(id);
  else state.completedMissions.delete(id);
}
function handleModuleState(event){
  if(event.origin!==location.origin||event.data?.channel!=='dw-v33-module')return;
  const frame=app.querySelector('[data-module-frame]');
  if(!frame||event.source!==frame.contentWindow)return;
  const message=event.data;
  if(message.type==='daily-mission-state'){
    if(message.dateKey!==window.DWV33Core?.phoenixDateKey())return;
    setMissionStatus('morning',message.morning);
    setMissionStatus('exit',message.exit);
  }else if(message.type==='curriculum-mission-state'){
    setMissionStatus('curriculum',message.currentComplete?'complete':'not_started');
  }else return;
  if(!currentModuleId())render();
}
function authGate(){
  const status=integrationSession.status||'loading',message=integrationSession.message||'Checking Dragonswood access…';
  const canSignIn=status==='signed-out'||status==='unauthorized'||status==='error';
  return `<div class="portal student-shell" data-${IS_PRODUCTION?'release':'tester-build'}="v3.3"><main class="student-main" id="page-content"><div class="student-content"><section class="panel next-step"><div class="eyebrow">${IS_PRODUCTION?'SECURE STUDENT PORTAL':'SECURE INTEGRATION CANDIDATE'}</div><div class="next-icon">🛡️</div><h2>${status==='unauthorized'?'Account not authorized':'Dragonswood Sign In'}</h2><p>${escapeHtml(message)}</p>${canSignIn?'<button class="btn btn-primary w-full" type="button" data-signin>Sign in with Google</button>':''}<p class="center muted mt-12 text-11">${IS_PRODUCTION?'Explore Academy • live student data':`${escapeHtml(window.DWV33Integration?.environment||'loading')} • no production writes enabled`}</p></section></div></main>${IS_PRODUCTION?'':'<div class="tester-ribbon">V3.3 INTEGRATION • SAFE MODE</div>'}</div>`;
}
function render(){
  state.page=currentPage();
  if(integrationSession.status!=='authorized'){
    app.innerHTML=authGate();bindAuthGate();document.title=IS_PRODUCTION?'Dragonswood | Sign In':'[INTEGRATION] Dragonswood | Sign In';return;
  }
  app.innerHTML=shell();
  bind();
  const moduleId=currentModuleId();
  document.title=`${IS_PRODUCTION?'':'[TESTER] '}Dragonswood | ${moduleId?moduleHost.definition(moduleId).title:studentNavItems().find(n=>n[0]===state.page)[2]}`;
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
  app.querySelector('[data-reference]')?.addEventListener('click',showReference);
  app.querySelectorAll('[data-game-filter]').forEach(el=>el.addEventListener('click',()=>{state.gameFilter=el.dataset.gameFilter;render()}));
  app.querySelector('#scribe-text')?.addEventListener('input',e=>{state.writing=e.target.value;storageSet('writing',state.writing);const count=wordCount(state.writing),spans=e.target.nextElementSibling?.querySelectorAll('span');if(spans?.[1])spans[1].textContent=`${count} words`;const submit=app.querySelector('[data-submit-writing]');if(submit&&state.scribeResponse?.status!=='submitted')submit.disabled=count<(state.scribeSession?.minWords||5);clearTimeout(state.writingSaveTimer);if(state.scribeSession&&integrationController?.saveWriting)state.writingSaveTimer=setTimeout(()=>integrationController.saveWriting(state.writing).catch(err=>showToast(err?.message||'Draft could not save.')),500)});
  app.querySelectorAll('[data-writing-hint]').forEach(el=>el.addEventListener('click',writingHint));
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
  if((page==='games'||page==='scribe'||page==='kingdom')&&!state.dailyAccessUnlocked){showToast('Finish Morning Work or ask for today’s teacher override first.');location.hash='missions';return}
  location.hash=page;
}
function openModule(id){
  if(blockingPass()){showToast('Return your active pass before opening another activity.');location.hash='adventure';return}
  const gate=moduleHost?.allowed(id,{dailyAccessUnlocked:state.dailyAccessUnlocked});
  if(!gate?.ok){if(gate?.reason==='morning-work'){showToast('Academic Games unlock after Morning Work or today’s teacher override.');location.hash='missions'}return}
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
    if(session.status==='authorized')applyStudentModel(session.student,session.academic,session.world,session.passes);
    const passChanged=previousPassSignature!==passModelSignature();
    if(passChanged||!currentModuleId()||!app.querySelector('[data-module-frame]'))render();else syncPassSafety();
  });
})();
