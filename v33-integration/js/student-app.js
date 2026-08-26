const app = document.querySelector('#app');
const TESTER_KEY = 'dw-v33-tester';
function storageGet(key, fallback=''){try{return localStorage.getItem(`${TESTER_KEY}:${key}`) ?? fallback}catch{return fallback}}
function storageSet(key, value){try{localStorage.setItem(`${TESTER_KEY}:${key}`, value)}catch{}}
const toast = document.querySelector('#toast');
const dialogRoot = document.querySelector('#dialog-root');
let integrationController=null;
let integrationSession={status:'loading',message:'Loading Dragonswood identity…'};
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
  day: 'Today',
  characterClass: 'Unchosen',
  pet: 'No active pet',
  equipment: {},
  inventory: [],
  bossHp: 72,
  bossMax: 100,
  bossMessage: '',
  dailyAccessUnlocked: false,
  arcadeStatus: 'idle',
  arcadeAccess: null,
  arcadeOpen: false
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

function currentPage(){
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
  return `<div class="portal student-shell student-page-${state.page}" data-tester-build="v3.3">
    <header class="student-topbar"><div class="student-brand">
      <div class="brand-lockup"><img class="student-crest" src="assets/art/dragonswood-crest-v33.jpg" alt=""><div><div class="brand-name">DRAGONSWOOD</div><div class="brand-sub">STUDENT ADVENTURE PORTAL</div></div></div>
      <div class="student-utility"><button class="btn btn-secondary btn-sm" type="button" data-passes>🎟️ <span>Passes</span></button><button class="btn btn-secondary btn-sm" type="button" data-read>🔊 <span>Read aloud</span></button><div class="profile-pill"><div class="profile-orb">${escapeHtml(state.initial)}</div><span><b>${escapeHtml(state.firstName)}</b><small>Level ${state.level}</small></span></div></div>
    </div></header>
    <aside class="student-sidebar">${navMarkup()}</aside>
    <main class="student-main" id="page-content"><div class="student-content">${pageMarkup()}</div></main>
    ${referenceButton()}<div class="tester-ribbon">V3.3 TESTER • LOCAL ONLY</div>
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
  return `${studentTitle('✍️','Scribe Arena','Turn your ideas into magic','Write freely. Your work saves as you type, and feedback helps you grow.')}
  <section class="scribe-layout"><div><article class="panel scribe-main-card"><div class="mission-prompt"><span class="rarity-chip">🔥 ACTIVE WRITING MISSION</span><h3>A door appears in the oldest tree…</h3><div class="prompt-box">You find a tiny golden key under your desk. At recess, it begins to glow and points toward the oldest tree in Dragonswood. What happens next?</div><div class="prompt-tags"><span>💡 Show, don’t tell</span><span>👀 Add one sensory detail</span><span>▣ Use complete sentences</span></div></div><div class="writing-area"><textarea id="scribe-text" aria-label="Your writing" placeholder="Start your story here…">${escapeHtml(state.writing)}</textarea><div class="writing-meta"><span>☁ Saved just now</span><span>${wc} words</span><span>⏱ 12:48</span></div><div class="row"><button class="btn btn-primary" data-submit-writing ${wc<5?'disabled':''}>📜 Submit quickwrite</button><button class="btn btn-secondary" data-writing-hint>✨ Get a writing hint</button></div></div></article></div><aside class="panel coach-card"><div class="coach-avatar">🐉</div><div class="eyebrow center">DRAGONSWOOD WRITING COACH</div><h3>Your ideas belong here.</h3><p>Write at least 5 words and submit when you’re ready. Your coach will celebrate a strength and give you one clear next step.</p><button class="btn btn-secondary w-full" data-writing-hint>✨ Feedback appears here</button></aside></section>
  <div class="panel portfolio-strip"><div class="portfolio-title"><span>📚</span><div><div class="eyebrow">MY WRITING PORTFOLIO</div><b>Your writing is growing</b></div></div><div class="portfolio-stats"><div class="portfolio-stat"><strong>12</strong><small>Quickwrites</small></div><div class="portfolio-stat"><strong>16.8</strong><small>Average score</small></div><div class="portfolio-stat"><strong>+3</strong><small>Points grown</small></div></div><button class="btn btn-secondary btn-sm" data-toast="Portfolio opened in tester mode.">Open portfolio →</button></div>`;
}

function dayPage(){
  const rows={
    Yesterday:[['8:00','✓','Morning Meeting',''],['8:25','✓','Math',''],['9:30','📚','ELA',''],['10:15','🔬','Science',''],['11:00','🍎','Lunch & Recess',''],['12:00','🏛️','Social Studies',''],['1:30','🎨','Specials','']],
    Today:[['8:00','✓','Morning Meeting',''],['8:25','✓','Math',''],['9:30','📚','ELA',''],['10:15','🔬','Science','Elemental Laboratory'],['11:00','🍎','Lunch & Recess',''],['12:00','🏛️','Social Studies',''],['1:30','🎨','Specials','']],
    Tomorrow:[['8:00','☀️','Morning Meeting','Community challenge'],['8:25','➗','Math','Division strategies'],['9:30','📚','ELA','Novel study'],['10:15','🔭','Science','Lab day'],['11:00','🍎','Lunch & Recess',''],['12:00','🏛️','Social Studies','Map skills'],['1:30','🎵','Specials','Music']]
  };
  const current=state.day==='Today';
  return `${studentTitle('🗓️','My Day','Know what’s next','Your schedule, class jobs, and upcoming events in one calm place.')}
  <div class="day-tabs">${['Yesterday','Today','Tomorrow'].map(d=>`<button class="day-tab ${state.day===d?'active':''}" data-day="${d}">${d}</button>`).join('')}</div><section class="day-layout"><article class="panel timeline">${current?'<div class="current-block"><div class="current-icon">🔬</div><div><div class="eyebrow">RIGHT NOW • 10:15–11:00</div><h2>Science</h2><p>Elemental Laboratory</p></div><span class="current-time-left">32 min left</span></div><h3 class="today-path-title">Today’s path</h3>':''}${rows[state.day].map((r,i)=>`<div class="timeline-row ${current&&i===3?'current':''}"><div class="timeline-dot">${r[1]}</div><div class="timeline-time">${r[0]}</div><div><h3>${r[2]}</h3>${r[3]?`<p>${r[3]}</p>`:''}</div>${current&&i===3?'<span class="now-pill">NOW</span>':''}</div>`).join('')}</article><aside class="day-side"><article class="panel job-card"><div class="job-broom">🧹</div><div class="eyebrow">MY CLASS JOB</div><h3>Floor Captain</h3><p>Check the reading corner before dismissal.</p><div class="job-checks">${['M','T','W','T','F'].map((d,i)=>`<div class="job-day ${i<2?'done':''} ${i===2?'today':''}">${i<2?'✓':d}</div>`).join('')}</div><button class="btn btn-job w-full" data-toast="Job check-in saved locally.">✓ Check off today’s job</button></article><article class="panel events-card"><div class="eyebrow">UPCOMING</div><h3>📅 Events</h3>${[['🏐','Volleyball Game','Tomorrow • 4:00 PM'],['🧪','Science Showcase','Friday • 1:30 PM'],['🌴','Fall Break','In 12 school days']].map(e=>`<div class="event-row"><div class="event-icon">${e[0]}</div><div><b>${e[1]}</b><small>${e[2]}</small></div></div>`).join('')}</article></aside></section>`;
}

function hallPage(){
  const classes=[['Warrior','🛡️','Strong & brave'],['Ranger','🏹','Quick & clever'],['Mage','🔮','Powerful magic'],['Healer','🌿','Help your team']];
  const pets=[['Nyx','assets/art/pet-nyx.jpg'],['Ember','assets/art/pet-ember.jpg'],['Blink','assets/art/pet-blink.jpg'],['Mochi','assets/art/pet-mochi.jpg']];
  return `${studentTitle('⚔️','Adventurer Hall','Build your legend','Choose your class, equip powerful gear, and adventure with a pet companion.')}
  <section class="hall-grid"><article class="panel hall-character"><img src="assets/art/hall-character-v33.jpg" alt="${escapeHtml(state.displayName)} and active pet ${escapeHtml(state.pet)}"></article><div class="hall-controls"><article class="panel choice-panel class-panel"><div class="eyebrow">CHOOSE YOUR CLASS</div><h2>How do you want to adventure?</h2><div class="class-choices">${classes.map(c=>`<button class="choice-btn ${state.characterClass===c[0]?'active':''}" data-class="${c[0]}"><span>${c[1]}</span><b>${c[0]}</b><small>${c[2]}</small></button>`).join('')}</div></article><article class="panel choice-panel pet-panel"><div class="eyebrow">ACTIVE PET</div><h2>Pick your companion</h2><div class="pet-choices">${pets.map(p=>`<button class="pet-btn ${state.pet===p[0]?'active':''}" data-pet="${p[0]}"><div class="pet-art"><img src="${p[1]}" alt=""></div><b>${p[0]}</b></button>`).join('')}</div></article><article class="panel equipment-panel"><div class="equip-card"><span>⚔️</span><div><b>Moonsteel Sword</b><small>+8 ATK • Epic</small></div></div><div class="equip-card"><span>🛡️</span><div><b>Dragonward Shield</b><small>+6 DEF • Rare</small></div></div><div class="equip-card"><span>🎒</span><div><b>14 items</b><small>Open inventory</small></div></div></article></div></section>`;
}

function bossPage(){
  const pct=Math.max(0,Math.round(state.bossHp/state.bossMax*100));
  return `${studentTitle('👹','Boss Battle','The Gloomfang awakens!','Use what you learned today to help your class defeat the boss.')}
  <article class="panel boss-card"><div class="boss-head"><div class="boss-heading-row"><div class="boss-name"><span class="boss-mini">👹</span><div><div class="eyebrow">CLASS BOSS • DAY 3</div><h2>Gloomfang</h2></div></div><span class="boss-reward">🏆 Reward: 60 XP + Mystery Chest</span></div><div class="boss-hp"><div class="row between"><b>GLOOMFANG HP</b><strong>${state.bossHp} / ${state.bossMax}</strong></div><progress class="dw-progress dw-progress-boss" max="100" value="${pct}" aria-label="Gloomfang hit points">${pct}%</progress></div></div><div class="boss-arena"><img src="assets/art/boss-arena-v33.jpg" alt="Gloomfang boss facing ${escapeHtml(state.firstName)} and ${escapeHtml(state.pet)}"><div class="boss-feedback ${state.bossMessage?'show':''}">${state.bossMessage}</div></div><div class="move-label">✨ Choose your move!</div><div class="move-grid"><button class="move-btn" data-move="Decimal Strike"><span>➗</span><b>Decimal Strike</b><small>Answer a math question</small></button><button class="move-btn" data-move="Story Shield"><span>📚</span><b>Story Shield</b><small>Use reading evidence</small></button><button class="move-btn" data-move="Pet Power"><span>🐾</span><b>Pet Power</b><small>Fight beside ${state.pet}</small></button></div></article>`;
}

function leaderboardPage(){
  const ranks=[['🥇','👑','Abigail','Wizard • 4 day streak','1,840'],['🥈','🧙','Joshua','Ranger • 5 day streak','1,720'],['🥉','🛡️','Alaina','Warrior • 6 day streak','1,640'],['#4','🧙','Alejandro','Mage • 7 day streak','1,590'],['#5','🐉','You (You!)','Dragon Keeper • 8 day streak','1,520']];
  return `${studentTitle('🏆','Leaderboards','Celebrate class champions','See effort, growth, and teamwork—not just who finished first.')}
  <div class="leader-topline"><div class="filter-tabs"><button class="filter-tab active">📅 This Week</button><button class="filter-tab">🏰 All Time</button></div><span class="leader-reward-note">⭐ Top 5 earn one reward each school day</span></div><section class="leader-layout"><article class="panel rank-list"><div class="rank-heading"><span class="sparkle-big">✨</span><div><div class="eyebrow">OVERALL XP</div><h2>This Week’s Adventurers</h2></div></div>${ranks.map((r,i)=>`<div class="rank-row ${i===4?'you':''}"><div class="rank-medal">${r[0]}</div><div class="rank-avatar">${r[1]}</div><div><b>${r[2]}</b><div class="muted text-9">${r[3]}</div></div><div class="rank-score">${r[4]}<small> XP</small></div></div>`).join('')}</article><aside class="rank-side"><article class="panel rank-card"><div class="rank-dragon">🐉</div><div class="eyebrow">YOUR RANK</div><h2>#5</h2><p>You moved up <b>2 places</b> this week!</p><div class="xp-labels"><span>120 XP to #4</span><span>82%</span></div><progress class="dw-progress" max="100" value="82">82%</progress></article><article class="panel shine-card"><div class="eyebrow">MORE WAYS TO SHINE</div><h3>🌟 Class shout-outs</h3>${[['💛','Kindness','Alaina helped a classmate'],['🔥','Biggest Growth','Alejandro gained +4 points'],['📚','Reading Streak','Joshua reached 10 days']].map(s=>`<div class="shine-row"><span>${s[0]}</span><div><b>${s[1]}</b><small>${s[2]}</small></div></div>`).join('')}</article></aside></section>`;
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
  return `<section class="v33-module-shell"><div class="v33-module-toolbar"><div class="v33-module-heading"><span>🏰</span><div><small>UNLOCKED AFTER MORNING WORK</small><h2>Kingdom Wars</h2></div></div><button class="btn btn-secondary btn-sm" type="button" data-page="adventure">Back</button></div><div class="v33-module-stage"><iframe class="v33-module-frame" title="Kingdom Wars tester realm" src="${escapeHtml(kingdomPortal.href())}"></iframe></div></section>`;
}

function escapeHtml(value){return String(value??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

function applyStudentModel(model){
  if(!model)return;
  state.firstName=model.firstName;state.displayName=model.displayName;state.initial=model.initial;state.grade=model.grade;
  state.level=model.level;state.hp=model.hp;state.gold=model.gold;state.streak=model.streak;state.xp=model.xp;state.xpFloor=model.xpFloor;state.xpMax=model.xpNext;state.xpPct=model.xpPct;
  state.characterClass=model.classLabel;state.pet=model.petName;state.equipment=model.equipped||{};state.inventory=model.inventory||[];
  state.dailyAccessUnlocked=model.dailyAccessUnlocked===true;
  if(model.dailyMissions){
    if(state.missionDate&&state.missionDate!==model.dailyMissions.dateKey)state.completedMissions.delete('curriculum');
    state.missionDate=model.dailyMissions.dateKey||'';
    setMissionStatus('morning',model.dailyMissions.morning);
    setMissionStatus('exit',model.dailyMissions.exit);
  }
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
  return `<div class="portal student-shell" data-tester-build="v3.3"><main class="student-main" id="page-content"><div class="student-content"><section class="panel next-step"><div class="eyebrow">SECURE INTEGRATION CANDIDATE</div><div class="next-icon">🛡️</div><h2>${status==='unauthorized'?'Account not authorized':'Dragonswood Sign In'}</h2><p>${escapeHtml(message)}</p>${canSignIn?'<button class="btn btn-primary w-full" type="button" data-signin>Sign in with Google</button>':''}<p class="center muted mt-12 text-11">${escapeHtml(window.DWV33Integration?.environment||'loading')} • no production writes enabled</p></section></div></main><div class="tester-ribbon">V3.3 INTEGRATION • SAFE MODE</div></div>`;
}
function render(){
  state.page=currentPage();
  if(integrationSession.status!=='authorized'){
    app.innerHTML=authGate();bindAuthGate();document.title='[INTEGRATION] Dragonswood | Sign In';return;
  }
  app.innerHTML=shell();
  bind();
  const moduleId=currentModuleId();
  document.title=`[TESTER] Dragonswood | ${moduleId?moduleHost.definition(moduleId).title:studentNavItems().find(n=>n[0]===state.page)[2]}`;
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
  app.querySelector('[data-reference]')?.addEventListener('click',showReference);
  app.querySelectorAll('[data-game-filter]').forEach(el=>el.addEventListener('click',()=>{state.gameFilter=el.dataset.gameFilter;render()}));
  app.querySelector('#scribe-text')?.addEventListener('input',e=>{state.writing=e.target.value;storageSet('writing',state.writing);const meta=e.target.nextElementSibling?.querySelector('span:last-child');if(meta)meta.textContent=`${wordCount(state.writing)} words`});
  app.querySelectorAll('[data-writing-hint]').forEach(el=>el.addEventListener('click',writingHint));
  app.querySelector('[data-submit-writing]')?.addEventListener('click',submitWriting);
  app.querySelectorAll('[data-day]').forEach(el=>el.addEventListener('click',()=>{state.day=el.dataset.day;render()}));
  app.querySelectorAll('[data-class]').forEach(el=>el.addEventListener('click',()=>openModule('adventurer-hall')));
  app.querySelectorAll('[data-pet]').forEach(el=>el.addEventListener('click',()=>openModule('adventurer-hall')));
  app.querySelectorAll('[data-move]').forEach(el=>el.addEventListener('click',()=>openModule('boss-battle')));
  if(currentModuleId())mountModule(currentModuleId());
  if(state.page==='arcade'&&state.arcadeStatus==='idle')refreshArcadePortal();
}

async function refreshArcadePortal(){
  if(!arcadePortal)return;state.arcadeStatus='loading';if(state.page==='arcade')render();
  try{state.arcadeAccess=await arcadePortal.getAccess();state.arcadeStatus='ready'}catch(err){state.arcadeStatus='error';state.arcadeAccess={tokens:0,teacherEnabled:false};showToast(err?.message||'Arcade access is unavailable.')}
  if(state.page==='arcade')render();
}

function openPage(page){
  if((page==='games'||page==='scribe'||page==='kingdom')&&!state.dailyAccessUnlocked){showToast('Finish Morning Work or ask for today’s teacher override first.');location.hash='missions';return}
  location.hash=page;
}
function openModule(id){
  const gate=moduleHost?.allowed(id,{dailyAccessUnlocked:state.dailyAccessUnlocked});
  if(!gate?.ok){if(gate?.reason==='morning-work'){showToast('Academic Games unlock after Morning Work or today’s teacher override.');location.hash='missions'}return}
  location.hash=`module/${encodeURIComponent(id)}`;
}
function closeModule(){
  const mod=moduleHost?.definition(currentModuleId());location.hash=mod?.returnPage||'adventure';
}
function mountModule(id){if(id)moduleHost?.mount(app,id,location.href)}

function readPage(){
  const title=studentNavItems().find(n=>n[0]===state.page)?.[2]||'Dragonswood';
  if('speechSynthesis' in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(`Dragonswood. ${title}. ${document.querySelector('#page-content h1')?.textContent||''}`);u.rate=.9;speechSynthesis.speak(u);showToast('Read-aloud started.');}else showToast('Read-aloud is not available in this browser.');
}
function passesDialog(){openDialog('Passes',`<p class="muted">Pass controls live in their own protected area so they never cover the Dragonswood title.</p><div class="grid-2 mt-12"><button class="btn btn-primary" data-close-dialog>🚻 Request Bathroom Pass</button><button class="btn btn-secondary" data-close-dialog>💧 Request Water Pass</button></div>`)}
function showReference(){
  const path=references[state.page];
  if(!path){openDialog('New approved route',`<p>This approved addition uses the V3.3 shell without modifying the protected original routes.</p>`);return}
  const overlay=document.createElement('div');overlay.className='reference-overlay';overlay.innerHTML=`<button class="btn btn-gold reference-close">Close reference</button><img src="${path}" alt="Approved reference screenshot for current page">`;document.body.appendChild(overlay);overlay.querySelector('button').addEventListener('click',()=>overlay.remove());
}
function writingHint(){
  const wc=wordCount(state.writing);const hint=wc<10?'Start by naming what the character can see, hear, or feel.':wc<40?'Choose one moment and slow it down with a sensory detail.':'Reread your last two sentences. Which one could use a stronger verb?';openDialog('Writing Coach Hint',`<p>${hint}</p><p class="muted">The coach gives a nudge, not the answer.</p>`)
}
function submitWriting(){
  const wc=wordCount(state.writing);if(wc<5){openDialog('Checkpoint not ready',`<p>You have <b>${wc} words</b>. Add a little more detail before submitting so your teacher has enough writing to review.</p>`);return}openDialog('Checkpoint ready',`<p>Your draft has <b>${wc} words</b>. In production this would submit once, show a success state, and prevent duplicate submission.</p>`)
}
window.addEventListener('hashchange',()=>{if(integrationSession.status==='authorized')render()});
window.addEventListener('message',handleModuleState);
(async function bootstrapIntegration(){
  if(!window.DWV33Integration){integrationSession={status:'error',message:'Integration runtime did not load.'};render();return}
  integrationController=await window.DWV33Integration.startStudent(session=>{
    integrationSession=session;
    if(session.status==='authorized')applyStudentModel(session.student);
    if(!currentModuleId()||!app.querySelector('[data-module-frame]'))render();
  });
})();
