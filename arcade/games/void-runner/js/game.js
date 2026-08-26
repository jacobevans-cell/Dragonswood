import { loadThree } from './three-loader.js';
import { initCloudSync, queueCloudSync } from './cloud-sync.js';

const THREE = await loadThree();

// VOID RUNNER
// Original browser tunnel-runner engine inspired by gravity-shifting space runners.
// No Run 3 code, art, music, models, level data, or fonts are included.

const RUNTIME_CONFIG = window.VOID_RUNNER_CONFIG || {};
const PARAMS = new URLSearchParams(location.search);
const ARCADE_MODE = PARAMS.get('arcade') === '1';
const COMFORT_PARAM = PARAMS.get('comfort');
const SYSTEM_REDUCED_MOTION = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
let comfortMode = COMFORT_PARAM === '1' || (COMFORT_PARAM !== '0' && (localStorage.getItem('voidrunner.comfort') === 'on' || (localStorage.getItem('voidrunner.comfort') == null && SYSTEM_REDUCED_MOTION)));
function setComfortMode(on){comfortMode=!!on;localStorage.setItem('voidrunner.comfort',comfortMode?'on':'off');document.documentElement.classList.toggle('comfort-mode',comfortMode);const el=document.querySelector('#comfortToggle');if(el)el.checked=comfortMode;}
document.documentElement.classList.toggle('comfort-mode',comfortMode);

// v1.6 Chromebook rollout performance profiles.
const PERF_PARAM = (PARAMS.get('perf') || '').toLowerCase();
const PERF_MODES = new Set(['auto','standard','low']);
const HARDWARE_HINTS = {
  memory: Number(navigator.deviceMemory || 8),
  cores: Number(navigator.hardwareConcurrency || 8),
  coarsePointer: !!window.matchMedia?.('(pointer: coarse)').matches
};
const HARDWARE_SUGGESTS_LOW = HARDWARE_HINTS.memory <= 4 || HARDWARE_HINTS.cores <= 4;
let performanceMode = PERF_MODES.has(PERF_PARAM) ? PERF_PARAM : ((localStorage.getItem('voidrunner.performance') || 'auto').toLowerCase());
if(!PERF_MODES.has(performanceMode)) performanceMode='auto';
let effectivePerformanceMode = performanceMode==='low' ? 'low' : performanceMode==='standard' ? 'standard' : (HARDWARE_SUGGESTS_LOW ? 'low' : 'standard');
const PERF_PROFILES = {
  standard: { pixelRatio:1.6, stars:1500, renderAhead:44, renderBehind:4, label:'STANDARD' },
  low: { pixelRatio:1.0, stars:450, renderAhead:26, renderBehind:2, label:'CHROMEBOOK LOW' }
};
const perfTelemetry={frames:0,seconds:0,fps:0,lastSwitch:0,autoDowngraded:false};
function currentPerfProfile(){return PERF_PROFILES[effectivePerformanceMode]||PERF_PROFILES.standard;}
function updatePerformanceUi(){
  const select=document.querySelector('#performanceMode'); if(select)select.value=performanceMode;
  const status=document.querySelector('#performanceStatus');
  if(status){const fps=perfTelemetry.fps?` • ${Math.round(perfTelemetry.fps)} FPS`:'';status.textContent=`${performanceMode.toUpperCase()} → ${currentPerfProfile().label}${fps}`;}
  document.documentElement.classList.toggle('performance-low',effectivePerformanceMode==='low');
}
function applyPerformanceProfile(mode,announce=false){
  const next=mode==='low'?'low':'standard'; if(next===effectivePerformanceMode && renderer){updatePerformanceUi();return;}
  effectivePerformanceMode=next;const profile=currentPerfProfile();
  CONFIG.renderAhead=profile.renderAhead;CONFIG.renderBehind=profile.renderBehind;
  if(renderer){renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,profile.pixelRatio));renderer.setSize(innerWidth,innerHeight,false);makeStars();if(game?.level)refreshTunnel(true);}
  updatePerformanceUi();if(announce)toast(next==='low'?'PERFORMANCE • CHROMEBOOK LOW':'PERFORMANCE • STANDARD');
}
function setPerformanceMode(mode){
  performanceMode=PERF_MODES.has(mode)?mode:'auto';localStorage.setItem('voidrunner.performance',performanceMode);
  const target=performanceMode==='low'?'low':performanceMode==='standard'?'standard':(HARDWARE_SUGGESTS_LOW?'low':'standard');
  perfTelemetry.autoDowngraded=false;applyPerformanceProfile(target,true);updatePerformanceUi();
}
function trackPerformance(dt){
  if(document.hidden||!renderer)return;perfTelemetry.frames++;perfTelemetry.seconds+=dt;
  if(perfTelemetry.seconds<2)return;
  perfTelemetry.fps=perfTelemetry.frames/perfTelemetry.seconds;perfTelemetry.frames=0;perfTelemetry.seconds=0;updatePerformanceUi();
  if(performanceMode==='auto'&&effectivePerformanceMode==='standard'&&game.state==='playing'&&perfTelemetry.fps<42&&performance.now()-perfTelemetry.lastSwitch>5000){
    perfTelemetry.lastSwitch=performance.now();perfTelemetry.autoDowngraded=true;applyPerformanceProfile('low',true);toast('AUTO PERFORMANCE • REDUCED 3D LOAD');
  }
}
function arcadeMessage(payload){
  if(!ARCADE_MODE || window.parent===window) return;
  try{window.parent.postMessage({channel:'dragonswood-arcade',...payload},location.origin);}catch{}
}
arcadeMessage({type:'ready',gameId:'void-runner'});
function assetUrl(path) {
  const base = String(RUNTIME_CONFIG.r2?.publicBaseUrl || '').replace(/\/$/, '');
  return base ? `${base}/${path.replace(/^\//, '')}` : path;
}

let localProgressTimer=null;
function progressSnapshot() {
  return {
    cells: progressState.cells,
    unlocked: progressState.unlocked,
    completed: [...progressState.completed],
    runner: progressState.runner,
    achievements: [...progressState.achievements],
    challenges: {...progressState.challenges},
    storySeen: [...progressState.storySeen]
  };
}
function persistProgressNow(){
  clearTimeout(localProgressTimer);localProgressTimer=null;
  const p=progressSnapshot();
  localStorage.setItem('voidrunner.cells',String(p.cells));
  localStorage.setItem('voidrunner.unlocked',String(p.unlocked));
  localStorage.setItem('voidrunner.completed',JSON.stringify(p.completed));
  localStorage.setItem('voidrunner.runner',p.runner);
  localStorage.setItem('voidrunner.achievements',JSON.stringify(p.achievements));
  localStorage.setItem('voidrunner.challenges',JSON.stringify(p.challenges));
  localStorage.setItem('voidrunner.storySeen',JSON.stringify(p.storySeen));
}
function scheduleLocalProgressPersist(){clearTimeout(localProgressTimer);localProgressTimer=setTimeout(persistProgressNow,500);}
function progressChanged() { scheduleLocalProgressPersist(); queueCloudSync(); }
window.addEventListener('pagehide',persistProgressNow);
document.addEventListener('visibilitychange',()=>{if(document.hidden)persistProgressNow();});

const DEFAULT_GEOMETRY = { sides: 8, lanes: 3, radius: 6.2 };
const GEOMETRY_PRESETS = {
  square: { sides: 4, lanes: 4, radius: 5.35 },
  hex: { sides: 6, lanes: 4, radius: 5.85 },
  octo: { sides: 8, lanes: 3, radius: 6.2 },
  deca: { sides: 10, lanes: 3, radius: 6.55 },
  dodeca: { sides: 12, lanes: 2, radius: 6.8 },
  ring: { sides: 16, lanes: 2, radius: 7.1 },
};
const THEMES = {
  astral: { hue:.51, saturation:.58, lightness:.40, clear:0x030611, fog:0x030611, label:'ASTRAL PASSAGE' },
  frost: { hue:.55, saturation:.64, lightness:.44, clear:0x04111b, fog:0x071727, label:'FROZEN VAULT' },
  shadow: { hue:.67, saturation:.42, lightness:.30, clear:0x02030a, fog:0x050714, label:'DARK PASSAGE' },
  flow: { hue:.40, saturation:.60, lightness:.38, clear:0x03110d, fog:0x061914, label:'CURRENT WAY' },
  runic: { hue:.08, saturation:.56, lightness:.38, clear:0x120a05, fog:0x1a0e08, label:'RUNIC RUINS' },
  celestial: { hue:.76, saturation:.55, lightness:.43, clear:0x090414, fog:0x100824, label:'CELESTIAL RING' },
};
const CONFIG = {
  sides: DEFAULT_GEOMETRY.sides,
  lanes: DEFAULT_GEOMETRY.lanes,
  radius: DEFAULT_GEOMETRY.radius,
  sideWidth: 5.08,
  segmentLength: 3.85,
  renderAhead: 44,
  renderBehind: 4,
  playerZ: 0.3,
  baseY: -5.28,
  rotationEase: 11,
  jumpBuffer: 0.105,
  coyoteTime: 0.065,
  fragileBreakTime: 0.44,
  rampRise: .9,
};
function recalcGeometry() {
  CONFIG.sideWidth = 2 * CONFIG.radius * Math.tan(Math.PI / CONFIG.sides) * .99;
  CONFIG.laneWidth = CONFIG.sideWidth / CONFIG.lanes;
  CONFIG.halfSide = CONFIG.sideWidth / 2;
  CONFIG.sideAngle = Math.PI * 2 / CONFIG.sides;
  CONFIG.baseY = -CONFIG.radius + .92;
}
recalcGeometry();

const RUNNERS = [
  { id: 'scout', name: 'MOSSWING', desc: 'A balanced young dragon with dependable speed, jump, and steering.', unlock: 0, speed: 12.4, jump: 8.9, gravity: 21.5, lateral: 5.6, accel: 24, hue: 158 },
  { id: 'skimmer', name: 'STARWING', desc: 'A faster astral dragon that carries farther through fractured tunnels.', unlockLevel: 6, speed: 15.2, jump: 9.0, gravity: 21.0, lateral: 6.3, accel: 27, hue: 275, board: true },
  { id: 'hopper', name: 'EMBERHOP', desc: 'Higher jumps and slower forward speed for large gaps and stubborn landings.', unlock: 80, speed: 11.3, jump: 10.8, gravity: 20.4, lateral: 5.2, accel: 23, hue: 42 },
  { id: 'drifter', name: 'MOONDRIFT', desc: 'Low gravity gives this dragon long floating arcs through the Astral Passage.', unlock: 180, speed: 12.0, jump: 8.7, gravity: 15.7, lateral: 5.0, accel: 21, hue: 330 },
  { id: 'cloudwing', name: 'CLOUDWING', desc: 'Light-footed. Fragile rune panels do not collapse under this dragon.', unlockLevel: 9, speed: 11.9, jump: 9.4, gravity: 18.8, lateral: 5.3, accel: 23, hue: 195, lightfoot: true },
  { id: 'goldwing', name: 'GOLDWING', desc: 'Treasure sense pulls nearby Astral Shards in from adjacent lanes.', unlock: 260, speed: 12.1, jump: 8.8, gravity: 20.8, lateral: 5.2, accel: 23, hue: 54, magnet: true },
  { id: 'bumblewing', name: 'BUMBLEWING', desc: 'Cannot resist bouncing. Automatically hops whenever it lands.', unlock: 340, speed: 11.5, jump: 9.7, gravity: 21.2, lateral: 5.5, accel: 24, hue: 105, autoHop: true },
  { id: 'frostwing', name: 'FROSTWING', desc: 'Grips ice runes without losing steering control or drifting sideways.', unlockLevel: 12, speed: 12.3, jump: 9.0, gravity: 20.8, lateral: 5.7, accel: 25, hue: 202, iceGrip: true },
  { id: 'lanternwing', name: 'LANTERNWING', desc: 'Its glow keeps low-power tunnels readable when other panels fade.', unlock: 420, speed: 12.1, jump: 9.1, gravity: 20.2, lateral: 5.4, accel: 24, hue: 32, darkVision: true },
  { id: 'currentwing', name: 'CURRENTWING', desc: 'Resists sideways current runes and gets extra speed from forward flow.', unlockLevel: 20, speed: 12.5, jump: 8.9, gravity: 21.0, lateral: 5.8, accel: 25, hue: 135, flowMaster: true },
  { id: 'runewing', name: 'RUNEWING', desc: 'Press Q/E or the ability rune to rotate gravity one wall at a time.', unlock: 520, speed: 11.9, jump: 9.0, gravity: 20.6, lateral: 5.3, accel: 23, hue: 286, manualGravity: true },
  { id: 'skywing', name: 'SKYWING', desc: 'Press Shift/X or the ability rune in midair to dash; hold it to glide.', unlock: 650, speed: 12.8, jump: 9.2, gravity: 20.6, lateral: 5.6, accel: 25, hue: 218, airDash: true, glide: true },
];

const BRANCHES = [
  { id:'core', label:'ASTRAL PASSAGE', start:1, end:6, theme:'astral', parent:null, names:['FIRST LIGHT','SIDEWAYS','BROKEN LINE','TURN SIGNAL','THIN ICE','THE JUNCTION'], geoms:['octo','hex','octo','square','octo','deca'] },
  { id:'frost', label:'FROZEN VAULT', start:7, end:14, theme:'frost', parent:6, names:['FROST GATE','SLICKSTONE','ICE SPIRAL','BLUE CHAMBER','COLD CURRENT','BACKTRACK: FROST','SHIVER LINE','VAULT HEART'], geoms:['hex','octo','dodeca','square','deca','octo','ring','dodeca'] },
  { id:'shadow', label:'DARK PASSAGE', start:15, end:22, theme:'shadow', parent:6, names:['LIGHTS OUT','GOLDEN CLUES','BLACK GLASS','ECHO HALL','LOW POWER','BACKTRACK: SHADOW','NIGHT CURRENT','DARK HEART'], geoms:['octo','square','deca','hex','dodeca','octo','ring','deca'] },
  { id:'flow', label:'CURRENT WAY', start:23, end:30, theme:'flow', parent:10, names:['GREEN RIVER','LEFTWARD','RIGHTWARD','RAPID RUNES','RAMPART','BACKTRACK: FLOW','CROSSWIND','CURRENT CROWN'], geoms:['hex','octo','square','deca','dodeca','octo','ring','hex'] },
  { id:'runic', label:'RUNIC RUINS', start:31, end:38, theme:'runic', parent:18, names:['OLD STONES','CRACKED BRIDGE','RUNE RAMP','FALLING HALL','EMBER LINE','BACKTRACK: RUINS','ANCIENT TURN','RUIN CROWN'], geoms:['square','hex','octo','deca','dodeca','octo','ring','hex'] },
  { id:'celestial', label:'CELESTIAL RING', start:39, end:48, theme:'celestial', parents:[14,22,30,38], names:['CONVERGENCE','STAR VAULT','SIXTEEN SIDES','RADIANT ICE','GRAVITY SCRIPT','FLOWING NIGHT','BACKTRACK: STARS','ASTRAL CROWN','LAST LIGHT','THE FAR GATE'], geoms:['dodeca','ring','ring','deca','hex','octo','ring','dodeca','square','ring'] },
];
const GEOMETRY_RADIUS_OFFSETS = [-.35,0,.28,.55];
function buildLevelMeta() {
  const out=[];
  for (const branch of BRANCHES) {
    for (let id=branch.start; id<=branch.end; id++) {
      const local=id-branch.start, base=GEOMETRY_PRESETS[branch.geoms[local] || 'octo'];
      const parent = local===0 ? (branch.parents || (branch.parent ? [branch.parent] : [])) : [id-1];
      const radius = clamp(base.radius + GEOMETRY_RADIUS_OFFSETS[(id+local)%GEOMETRY_RADIUS_OFFSETS.length], 4.7, 7.6);
      out.push({
        id, branch:branch.id, branchLabel:branch.label, name:branch.names[local] || `PASSAGE ${id}`,
        seed:713 + id*1949, length:Math.min(46 + id, 96), difficulty:Math.min(.12 + id*.014,.78),
        parents:parent, geometry:{sides:base.sides,lanes:base.lanes,radius}, theme:branch.theme,
        reverse:[12,20,28,36,45].includes(id),
        challenge: id%9===0 ? {type:'noBreak',label:'GENTLE STEPS'} : id%7===0 ? {type:'maxJumps',value:10,label:'FEW WINGS'} : id%8===0 ? {type:'collect',value:4,label:'SHARD HUNT'} : null,
      });
    }
  }
  return out;
}
const LEVEL_META = buildLevelMeta();
const STORY_BEATS = {
  1:{speaker:'Mosswing',title:'First Light',text:'The Astral Passage is waking up. Keep moving, and trust the walls when the floor runs out.'},
  6:{speaker:'Mosswing',title:'The Junction',text:'The passage splits. Frost glows to the left; the Dark Passage barely glows at all. Both roads lead deeper.'},
  7:{speaker:'Frostwing',title:'Frozen Vault',text:'Ice remembers momentum. Steer early, not late. I can keep my footing here better than most.'},
  15:{speaker:'Lanternwing',title:'Dark Passage',text:'When the power fades, follow the runes that still burn gold. Darkness hides routes, not rules.'},
  23:{speaker:'Currentwing',title:'Current Way',text:'These runes push back. Read the arrows and use the current instead of fighting every panel.'},
  31:{speaker:'Cloudwing',title:'Runic Ruins',text:'Old stone breaks in groups. A single cracked panel can take its neighbors with it.'},
  39:{speaker:'Runewing',title:'Convergence',text:'The branches meet again. From here the tunnel geometry gets stranger, and gravity becomes another tool.'},
  48:{speaker:'Skywing',title:'The Far Gate',text:'You mapped every major branch. Beyond this gate, Infinite Mode keeps rearranging the passage forever.'},
};
const ACHIEVEMENTS = [
  {id:'first-clear',name:'FIRST FLIGHT',desc:'Complete any Explore level.'},
  {id:'wall-walker',name:'WALL WALKER',desc:'Rotate across 8 walls in one run.'},
  {id:'gentle-steps',name:'GENTLE STEPS',desc:'Complete a level without breaking a fragile panel.'},
  {id:'shard-seeker',name:'SHARD SEEKER',desc:'Collect 8 Astral Shards in one run.'},
  {id:'reverse-route',name:'REVERSE ROUTE',desc:'Complete a Backtrack level.'},
  {id:'night-eyes',name:'NIGHT EYES',desc:'Complete a level containing a low-power section.'},
  {id:'ice-road',name:'ICE ROAD',desc:'Complete a level containing ice runes.'},
  {id:'branching-out',name:'BRANCHING OUT',desc:'Complete a level in three different branches.'},
  {id:'ability-cast',name:'RUNECASTER',desc:'Use a dragon special ability.'},
  {id:'infinite-500',name:'VOID 500',desc:'Reach 500m in Infinite Mode.'},
  {id:'infinite-1000',name:'VOID 1000',desc:'Reach 1000m in Infinite Mode.'},
];

const dom = {
  canvas: document.querySelector('#game'),
  hud: document.querySelector('#hud'),
  modeLabel: document.querySelector('#modeLabel'),
  levelLabel: document.querySelector('#levelLabel'),
  progressFill: document.querySelector('#progressFill'),
  progressText: document.querySelector('#progressText'),
  cellCount: document.querySelector('#cellCount'),
  mapCellCount: document.querySelector('#mapCellCount'),
  runnerCellCount: document.querySelector('#runnerCellCount'),
  levelMap: document.querySelector('#levelMap'),
  characterCards: document.querySelector('#characterCards'),
  achievementGrid: document.querySelector('#achievementGrid'),
  achievementCount: document.querySelector('#achievementCount'),
  toast: document.querySelector('#toast'),
  touchControls: document.querySelector('#touchControls'),
  resultEyebrow: document.querySelector('#resultEyebrow'),
  resultTitle: document.querySelector('#resultTitle'),
  resultDistance: document.querySelector('#resultDistance'),
  resultCells: document.querySelector('#resultCells'),
  nextBtn: document.querySelector('#nextBtn'),
  resultMenuBtn: document.querySelector('#resultMenuBtn'),
};

function parseArray(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function parseMap(key){try{const v=JSON.parse(localStorage.getItem(key)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch{return {}}}
const progressState={
  cells:Math.max(0,Math.floor(Number(localStorage.getItem('voidrunner.cells')||0))),
  unlocked:Math.max(1,Number(localStorage.getItem('voidrunner.unlocked')||1)),
  completed:[...new Set(parseArray('voidrunner.completed').filter(Number.isFinite))],
  runner:localStorage.getItem('voidrunner.runner')||'scout',
  achievements:[...new Set(parseArray('voidrunner.achievements'))],
  challenges:parseMap('voidrunner.challenges'),
  storySeen:[...new Set(parseArray('voidrunner.storySeen').filter(Number.isFinite))]
};
const storage = {
  get cells(){return progressState.cells}, set cells(v){progressState.cells=Math.max(0,Math.floor(Number(v)||0));progressChanged()},
  get unlocked(){return progressState.unlocked}, set unlocked(v){progressState.unlocked=Math.max(1,Math.min(LEVEL_META.length,Number(v)||1));progressChanged()},
  get completed(){return [...progressState.completed]}, set completed(v){progressState.completed=[...new Set((v||[]).filter(Number.isFinite))];progressChanged()},
  get runner(){return progressState.runner}, set runner(v){progressState.runner=String(v||'scout');progressChanged()},
  get sound(){return localStorage.getItem('voidrunner.sound')!=='off'}, set sound(v){localStorage.setItem('voidrunner.sound',v?'on':'off')},
  get achievements(){return [...progressState.achievements]}, set achievements(v){progressState.achievements=[...new Set(v||[])];progressChanged()},
  get challenges(){return {...progressState.challenges}}, set challenges(v){progressState.challenges={...(v||{})};progressChanged()},
  get storySeen(){return [...progressState.storySeen]}, set storySeen(v){progressState.storySeen=[...new Set((v||[]).filter(Number.isFinite))];progressChanged()}
};
function migrateV13Progress() {
  if (localStorage.getItem('voidrunner.v13migrated')) return;
  const legacyUnlocked=Math.max(1,Number(localStorage.getItem('voidrunner.unlocked')||1));
  const completed=new Set(storage.completed);
  for(let id=1;id<Math.min(legacyUnlocked,25);id++) completed.add(id);
  storage.completed=[...completed];
  localStorage.setItem('voidrunner.v13migrated','1');
  persistProgressNow();
}
migrateV13Progress();

let renderer, scene, camera, tunnelGroup, playerRoot, playerParts = {}, starPoints;
let tileGeometry, cellGeometry, tileMaterials = [], fragileMaterial, brokenMaterial, cellMaterial, specialMaterials = {};
const segmentGroups = new Map();
const tileMeshes = new Map();
const cellMeshes = new Map();
const fallingPanels = new Set();

const game = {
  state: 'menu', // menu | playing | paused | result | dying
  mode: 'explore',
  levelIndex: 0,
  level: null,
  progress: 0,
  sideOrdinal: 0,
  rotation: 0,
  rotationTarget: 0,
  x: 0,
  vx: 0,
  height: 0,
  vy: 0,
  grounded: true,
  falling: false,
  coyote: 0,
  jumpBuffer: 0,
  runTime: 0,
  distance: 0,
  runCells: 0,
  fragileKey: null,
  fragileTimer: 0,
  broken: new Set(),
  collected: new Set(),
  currentSegment: 0,
  lastRenderedSegment: -999,
  infiniteGenerated: 0,
  deathTimer: 0,
  autoHopTimer: 0,
  cascadeQueue: [],
  seenKinds: new Set(),
  selectedRunner: RUNNERS[0],
  surfaceRise: 0,
  jumpCount: 0,
  rotations: 0,
  fragileBreaks: 0,
  abilityUses: 0,
  dashTimer: 0,
  airDashUsed: false,
  branchesVisited: new Set(),
  currentTheme: 'astral',
};

const input = {
  leftKeys: new Set(),
  rightKeys: new Set(),
  jumpKeys: new Set(),
  pointerLeft: false,
  pointerRight: false,
  pointerJump: false,
  abilityHeld: false,
  get axis() {
    const l = this.leftKeys.size || this.pointerLeft;
    const r = this.rightKeys.size || this.pointerRight;
    return (r ? 1 : 0) - (l ? 1 : 0);
  },
  get jumpHeld() { return this.jumpKeys.size > 0 || this.pointerJump; },
};

// ---------- deterministic utilities ----------
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function mod(n, m) { return ((n % m) + m) % m; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function damp(current, target, lambda, dt) { return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt)); }
function laneFromX(x) {
  return clamp(Math.floor((x + CONFIG.halfSide) / CONFIG.laneWidth), 0, CONFIG.lanes - 1);
}
function tileKey(seg, side, lane) { return `${seg}:${mod(side, CONFIG.sides)}:${lane}`; }

// ---------- audio ----------
class AudioEngine {
  constructor() { this.ctx = null; this.enabled = storage.sound; this.musicTimer = 0; this.musicStep = 0; }
  ensure() {
    if (!this.enabled) return;
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  tone(freq, duration = .09, type = 'sine', volume = .05, slide = 0) {
    if (!this.enabled) return;
    this.ensure(); if (!this.ctx) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + duration);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(volume, t + .008); g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    o.connect(g).connect(this.ctx.destination); o.start(t); o.stop(t + duration + .02);
  }
  jump() { this.tone(360, .11, 'triangle', .045, 230); }
  rotate() { this.tone(190, .12, 'sine', .038, 160); this.tone(510, .08, 'triangle', .02, -120); }
  cell() { this.tone(680, .07, 'triangle', .04, 270); setTimeout(() => this.tone(970, .08, 'sine', .035, 220), 45); }
  crack() { this.tone(95, .10, 'square', .025, -30); }
  fall() { this.tone(310, .42, 'sawtooth', .035, -235); }
  clear() { [440, 554, 659, 880].forEach((f,i)=>setTimeout(()=>this.tone(f,.18,'triangle',.038,80),i*80)); }
  update(dt) {
    if (!this.enabled || game.state !== 'playing') return;
    this.musicTimer -= dt;
    if (this.musicTimer <= 0) {
      this.musicTimer += .36;
      const notes = [110, 138.59, 164.81, 207.65, 164.81, 138.59, 123.47, 164.81];
      const lowPower=!!game.level?.segments?.[game.currentSegment]?.lowPower;
      const f = notes[this.musicStep++ % notes.length];
      if(!lowPower || this.musicStep%3===0) this.tone(f, .16, 'sine', lowPower ? .0035 : .009, 0);
      if (!lowPower && this.musicStep % 4 === 1) this.tone(f * 2, .07, 'triangle', .006, 0);
    }
  }
  toggle() { this.enabled = !this.enabled; storage.sound = this.enabled; if (this.enabled) this.ensure(); updateSoundButton(); }
}
const audio = new AudioEngine();

// ---------- renderer ----------
function initThree() {
  const perf=currentPerfProfile();
  renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias: effectivePerformanceMode!=='low', alpha: false, powerPreference: 'high-performance', failIfMajorPerformanceCaveat:false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, perf.pixelRatio));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x030611, 1);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030611, 0.018);
  camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 240);
  camera.position.set(0, -1.9, 10.3);
  camera.lookAt(0, -2.75, -22);

  const ambient = new THREE.HemisphereLight(0xc7f7ff, 0x080713, 1.65);
  scene.add(ambient);
  const rim = new THREE.DirectionalLight(0x9e7cff, 2.1);
  rim.position.set(-4, 5, 7); scene.add(rim);
  const key = new THREE.PointLight(0x6cecff, 11, 30, 2);
  key.position.set(1, -2, 4); scene.add(key);

  makeStars();
  makeMaterials();
  tunnelGroup = new THREE.Group();
  scene.add(tunnelGroup);
  makePlayer();
  createMenuTunnel();
}

function makeStars() {
  if(starPoints){scene.remove(starPoints);starPoints.geometry?.dispose?.();starPoints.material?.dispose?.();starPoints=null;}
  const count = currentPerfProfile().stars, arr = new Float32Array(count * 3);
  const rng = mulberry32(82198);
  for (let i=0;i<count;i++) {
    const r = 14 + rng() * 85, a = rng()*Math.PI*2, z = -rng()*180 + 25;
    arr[i*3] = Math.cos(a)*r; arr[i*3+1] = Math.sin(a)*r; arr[i*3+2] = z;
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(arr,3));
  const m = new THREE.PointsMaterial({ color:0xd8efff, size:.105, transparent:true, opacity:.8, sizeAttenuation:true });
  starPoints = new THREE.Points(g,m); scene.add(starPoints);
}

function makeMaterials() {
  fragileMaterial = new THREE.MeshStandardMaterial({ color:0x8897b9, roughness:.9, metalness:.02, emissive:0x101b3b });
  brokenMaterial = new THREE.MeshStandardMaterial({ color:0x2b3550, roughness:1, transparent:true, opacity:.25 });
  cellGeometry = new THREE.OctahedronGeometry(.26, 0);
  cellMaterial = new THREE.MeshStandardMaterial({ color:0xffe77a, emissive:0x715b0a, emissiveIntensity:.85, roughness:.3, metalness:.35 });
  specialMaterials = {
    ice: new THREE.MeshStandardMaterial({color:0x8eeeff,roughness:.18,metalness:.08,emissive:0x1a8095,emissiveIntensity:.55}),
    fast: new THREE.MeshStandardMaterial({color:0x79ff99,roughness:.55,emissive:0x14602b,emissiveIntensity:.45}),
    slow: new THREE.MeshStandardMaterial({color:0xffa16f,roughness:.62,emissive:0x6b2612,emissiveIntensity:.42}),
    left: new THREE.MeshStandardMaterial({color:0x80a8ff,roughness:.5,emissive:0x183c8a,emissiveIntensity:.5}),
    right: new THREE.MeshStandardMaterial({color:0xc18cff,roughness:.5,emissive:0x4b1c86,emissiveIntensity:.5}),
    glow: new THREE.MeshStandardMaterial({color:0xffe994,roughness:.34,emissive:0xffb72e,emissiveIntensity:1.15}),
    dark: new THREE.MeshStandardMaterial({color:0x111a25,roughness:.95,transparent:true,opacity:.32,emissive:0x02050a,emissiveIntensity:.08}),
    rampUp: new THREE.MeshStandardMaterial({color:0x85d8c7,roughness:.62,emissive:0x164d43,emissiveIntensity:.34}),
    rampDown: new THREE.MeshStandardMaterial({color:0x85d8c7,roughness:.62,emissive:0x164d43,emissiveIntensity:.34})
  };
  rebuildGeometryMaterials(DEFAULT_GEOMETRY,'astral');
}
function rebuildGeometryMaterials(geometry=DEFAULT_GEOMETRY, themeId='astral') {
  const g=geometry||DEFAULT_GEOMETRY, theme=THEMES[themeId]||THEMES.astral;
  CONFIG.sides=clamp(Math.round(g.sides||8),4,16);
  CONFIG.lanes=clamp(Math.round(g.lanes||3),1,5);
  CONFIG.radius=clamp(Number(g.radius)||6.2,4.7,7.6);
  recalcGeometry();
  tileGeometry?.dispose?.();
  for(const mat of tileMaterials) mat.dispose?.();
  tileMaterials=[];
  tileGeometry=new THREE.BoxGeometry(CONFIG.laneWidth-.075,.15,CONFIG.segmentLength-.075);
  for(let i=0;i<CONFIG.sides;i++){
    const c=new THREE.Color().setHSL(mod(theme.hue+i*.012,1),theme.saturation,theme.lightness+(i%2)*.025);
    tileMaterials.push(new THREE.MeshStandardMaterial({color:c,roughness:.76,metalness:.05,emissive:c.clone().multiplyScalar(.05)}));
  }
  game.currentTheme=themeId;
  if(renderer){ renderer.setClearColor(theme.clear,1); scene.fog.color.setHex(theme.fog); }
  if(camera){
    camera.position.set(0,CONFIG.baseY+3.38,Math.max(9.4,CONFIG.radius+4.1));
    camera.lookAt(0,CONFIG.baseY+2.53,-22);
  }
  if(playerRoot){ playerRoot.position.y=CONFIG.baseY; }
}

function makePlayer() {
  playerRoot = new THREE.Group();
  scene.add(playerRoot);
  playerRoot.position.set(0, CONFIG.baseY, CONFIG.playerZ);

  const skin = new THREE.MeshStandardMaterial({ color:0x79d8c0, roughness:.72, metalness:.03 });
  const dark = new THREE.MeshStandardMaterial({ color:0x071d19, roughness:.7 });
  const accent = new THREE.MeshStandardMaterial({ color:0xe0ba58, emissive:0x4e3a0b, emissiveIntensity:.35, roughness:.45 });
  const belly = new THREE.MeshStandardMaterial({ color:0xb9d6ad, roughness:.8 });

  // Chunky low-poly/block dragon. The movement controller and collision model are unchanged.
  const body = new THREE.Mesh(new THREE.BoxGeometry(.86,.82,1.06), skin); body.position.set(0,.70,0); playerRoot.add(body);
  const bellyPlate = new THREE.Mesh(new THREE.BoxGeometry(.50,.60,.035), belly); bellyPlate.position.set(0,.67,.55); playerRoot.add(bellyPlate);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.84,.67,.75), skin); head.position.set(0,1.36,.20); playerRoot.add(head);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(.52,.29,.42), skin); snout.position.set(0,1.23,.69); playerRoot.add(snout);
  const eyeG = new THREE.BoxGeometry(.095,.095,.045);
  const e1 = new THREE.Mesh(eyeG,dark); e1.position.set(-.20,1.46,.595); playerRoot.add(e1);
  const e2 = e1.clone(); e2.position.x=.20; playerRoot.add(e2);
  const glintG = new THREE.BoxGeometry(.032,.032,.02); const gl1=new THREE.Mesh(glintG,accent); gl1.position.set(-.185,1.475,.625); playerRoot.add(gl1); const gl2=gl1.clone();gl2.position.x=.215;playerRoot.add(gl2);

  const hornG = new THREE.ConeGeometry(.10,.36,4);
  const hornL=new THREE.Mesh(hornG,accent);hornL.position.set(-.25,1.88,.10);hornL.rotation.z=-.12;playerRoot.add(hornL);
  const hornR=hornL.clone();hornR.position.x=.25;hornR.rotation.z=.12;playerRoot.add(hornR);

  const legG = new THREE.BoxGeometry(.20,.55,.25);
  const legL=new THREE.Mesh(legG,skin);legL.position.set(-.25,.20,.12);playerRoot.add(legL);
  const legR=legL.clone();legR.position.x=.25;playerRoot.add(legR);
  const footG=new THREE.BoxGeometry(.28,.15,.42);const footL=new THREE.Mesh(footG,accent);footL.position.set(-.25,-.03,.24);playerRoot.add(footL);const footR=footL.clone();footR.position.x=.25;playerRoot.add(footR);

  const wingG=new THREE.BoxGeometry(.10,.62,.82);
  const wingL=new THREE.Mesh(wingG,skin);wingL.position.set(-.62,.88,-.05);wingL.rotation.z=-.72;wingL.rotation.x=.10;playerRoot.add(wingL);
  const wingR=wingL.clone();wingR.position.x=.62;wingR.rotation.z=.72;playerRoot.add(wingR);
  const wingTipG=new THREE.BoxGeometry(.08,.38,.56);const wtL=new THREE.Mesh(wingTipG,accent);wtL.position.set(-.87,.88,-.08);wtL.rotation.z=-1.02;playerRoot.add(wtL);const wtR=wtL.clone();wtR.position.x=.87;wtR.rotation.z=1.02;playerRoot.add(wtR);

  const tail = new THREE.Mesh(new THREE.BoxGeometry(.20,.20,1.08), skin); tail.position.set(0,.63,-.92); tail.rotation.x=-.16; playerRoot.add(tail);
  const tailTip = new THREE.Mesh(new THREE.ConeGeometry(.20,.43,4),accent);tailTip.position.set(0,.78,-1.47);tailTip.rotation.x=Math.PI/2;playerRoot.add(tailTip);

  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.62,18), new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.28,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2; shadow.position.set(0,-.10,.18); shadow.scale.y=.55; playerRoot.add(shadow);
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.35,.10,.52), new THREE.MeshStandardMaterial({color:0x9a80ff,roughness:.42,metalness:.2,emissive:0x241655}));
  board.position.y=-.11; board.visible=false; playerRoot.add(board);

  playerParts = { body, head, snout, legL, legR, wingL, wingR, wingTipL:wtL, wingTipR:wtR, tail, board, skin, accent, shadow };
}

function applyRunnerVisual() {
  const runner = game.selectedRunner;
  const color = new THREE.Color().setHSL(runner.hue/360,.28,.69);
  playerParts.skin.color.copy(color);
  const accent = new THREE.Color().setHSL(runner.hue/360,.72,.62);
  playerParts.accent.color.copy(accent);
  playerParts.board.visible = !!runner.board;
}

function tileTransform(mesh, side, lane, radialOffset=0) {
  const angle = side * CONFIG.sideAngle;
  const localX = -CONFIG.halfSide + CONFIG.laneWidth * (lane + .5);
  const p = new THREE.Vector3(localX, -CONFIG.radius + radialOffset, 0).applyAxisAngle(new THREE.Vector3(0,0,1), angle);
  mesh.position.x = p.x; mesh.position.y = p.y; mesh.rotation.z = angle;
}

// ---------- level generation ----------
function blankSegment() {
  return { tiles:Array.from({length:CONFIG.sides},()=>Array(CONFIG.lanes).fill(true)), fragile:Array.from({length:CONFIG.sides},()=>Array(CONFIG.lanes).fill(false)), kind:Array.from({length:CONFIG.sides},()=>Array(CONFIG.lanes).fill('normal')), lowPower:false, cells:[] };
}
function randomTile(rng) { return {side:Math.floor(rng()*CONFIG.sides),lane:Math.floor(rng()*CONFIG.lanes)}; }
function markRampPair(segments,start,side,lane=null){
  if(start<0||start+1>=segments.length)return;
  const lanes=lane==null?[...Array(CONFIG.lanes).keys()]:[lane];
  for(const l of lanes){ if(segments[start].tiles[side][l]&&!segments[start].fragile[side][l]) segments[start].kind[side][l]='rampUp'; if(segments[start+1].tiles[side][l]&&!segments[start+1].fragile[side][l]) segments[start+1].kind[side][l]='rampDown'; }
}
function levelContainsKind(segments,kind){return segments.some(seg=>seg.kind.some(side=>side.includes(kind)));}

function generateExploreLevel(meta) {
  const rng=mulberry32(meta.seed),segments=Array.from({length:meta.length},blankSegment),diff=meta.difficulty;
  let i=5;
  while(i<segments.length-5){
    if(rng()>.42+diff*.34){i++;continue;}
    const pattern=Math.floor(rng()*(meta.id<4?3:meta.id<12?5:7)),{side,lane}=randomTile(rng);
    if(pattern===0){segments[i].tiles[side][lane]=false;}
    else if(pattern===1){for(let l=0;l<CONFIG.lanes;l++)segments[i].tiles[side][l]=false;}
    else if(pattern===2){for(let q=0;q<2;q++)for(let l=0;l<CONFIG.lanes;l++)segments[i+q].tiles[side][l]=false;i++;}
    else if(pattern===3){for(let q=0;q<3;q++)segments[i+q].tiles[side][(lane+q)%CONFIG.lanes]=false;i+=2;}
    else if(pattern===4){for(let q=0;q<2;q++)for(let side2=0;side2<CONFIG.sides;side2++)if((side2+q)%3===0)segments[i+q].tiles[side2][(lane+side2)%CONFIG.lanes]=false;i++;}
    else if(pattern===5){for(let q=0;q<3;q++)for(let l=0;l<CONFIG.lanes;l++)if(l!==((q+lane)%CONFIG.lanes))segments[i+q].tiles[side][l]=false;i+=2;}
    else {for(let side2=0;side2<CONFIG.sides;side2++)if(side2!==mod(side+1,CONFIG.sides)&&side2!==mod(side-1,CONFIG.sides))segments[i].tiles[side2][lane]=false;}
    i+=2+Math.floor(rng()*3);
  }

  // Fragile clusters make chain reactions readable instead of purely random.
  if(meta.id>=2){
    const fragility=meta.branch==='runic'?.17:.07+diff*.10;
    for(let s=8;s<segments.length-4;s++)if(rng()<fragility){
      const side=(meta.id<6&&rng()<.68)?0:Math.floor(rng()*CONFIG.sides),lane=Math.floor(rng()*CONFIG.lanes),cluster=1+(rng()<.55?1:0)+(rng()<.18?1:0);
      for(let c=0;c<cluster&&s+c<segments.length-4;c++)if(segments[s+c].tiles[side][lane])segments[s+c].fragile[side][lane]=true;
    }
  }

  // Branch identity: each route teaches a mechanic but later routes mix systems.
  const iceRate=meta.branch==='frost'?.22:(meta.id>=5?.025:0);
  const flowRate=meta.branch==='flow'?.14:(meta.id>=10?.025:0);
  for(let s=7;s<segments.length-4;s++){
    if(iceRate&&rng()<iceRate){const side=meta.branch==='frost'&&rng()<.7?0:Math.floor(rng()*CONFIG.sides);for(let l=0;l<CONFIG.lanes;l++)if(segments[s].tiles[side][l]&&!segments[s].fragile[side][l])segments[s].kind[side][l]='ice';}
    if(flowRate&&rng()<flowRate){const {side,lane}=randomTile(rng),kinds=['fast','slow','left','right'];if(segments[s].tiles[side][lane]&&!segments[s].fragile[side][lane])segments[s].kind[side][lane]=kinds[Math.floor(rng()*kinds.length)];}
  }

  // Paired ramps form a continuous up/down hump and work on any tunnel wall.
  if(meta.id>=11){
    const rampRate=meta.branch==='runic'?.12:.035;
    for(let s=9;s<segments.length-5;s+=2+Math.floor(rng()*4))if(rng()<rampRate){const side=(rng()<.62?0:Math.floor(rng()*CONFIG.sides));markRampPair(segments,s,side,rng()<.45?Math.floor(rng()*CONFIG.lanes):null);}
  }

  // Low-power stretches. Lanternwing can see these more clearly.
  if(meta.id>=8 || meta.branch==='shadow'){
    const chance=meta.branch==='shadow'?.82:.46;
    for(let start=11;start<segments.length-8;start+=16+Math.floor(rng()*9))if(rng()<chance){
      const span=3+Math.floor(rng()*4);
      for(let s=start;s<Math.min(segments.length-4,start+span);s++){
        segments[s].lowPower=true;
        for(let side=0;side<CONFIG.sides;side++)for(let lane=0;lane<CONFIG.lanes;lane++)if(segments[s].tiles[side][lane]&&rng()<.12)segments[s].kind[side][lane]='glow';
      }
    }
  }

  // Collectibles gain value later in the campaign but remain internal game progression.
  for(let s=7;s<segments.length-4;s+=5+Math.floor(rng()*4)){
    const {side,lane}=randomTile(rng);
    if(segments[s].tiles[side][lane]){const value=meta.id>=40&&rng()<.20?3:meta.id>=20&&rng()<.25?2:1;segments[s].cells.push({side,lane,value,id:`${meta.id}-${s}-${side}-${lane}`});}
  }

  // Backtrack challenges traverse the generated obstacle order in reverse.
  if(meta.reverse){
    segments.reverse();
    for(let s=0;s<Math.min(4,segments.length);s++)segments[s]=blankSegment();
    for(let s=Math.max(0,segments.length-3);s<segments.length;s++)segments[s]=blankSegment();
  }
  return {...meta,segments,hasIce:levelContainsKind(segments,'ice'),hasLowPower:segments.some(seg=>seg.lowPower),hasRamps:levelContainsKind(segments,'rampUp')};
}

const INFINITE_CHUNKS=['zigzag','ice-road','fragile-bridge','flow-weave','dark-beacons','ramp-run','gate-run','mixed'];
function applyInfiniteChunk(seg,idx,level,rng,d){
  const chunkSize=10,step=idx%chunkSize;
  if(step===0)level.chunkType=INFINITE_CHUNKS[Math.floor(rng()*INFINITE_CHUNKS.length)];
  const type=level.chunkType||'mixed',floor=0,mid=Math.floor(CONFIG.lanes/2);
  if(type==='zigzag'&&step>=2&&step<=7){seg.tiles[floor][step%CONFIG.lanes]=false;}
  if(type==='ice-road'&&step>=1&&step<=8){for(let l=0;l<CONFIG.lanes;l++)seg.kind[floor][l]='ice';if(step===5)seg.tiles[floor][mod(mid+1,CONFIG.lanes)]=false;}
  if(type==='fragile-bridge'&&step>=2&&step<=7){seg.fragile[floor][mid]=true;if(step===4&&CONFIG.lanes>1)seg.fragile[floor][mod(mid+1,CONFIG.lanes)]=true;}
  if(type==='flow-weave'&&step>=1&&step<=8){const ks=['fast','left','fast','right','slow'];seg.kind[floor][step%CONFIG.lanes]=ks[step%ks.length];}
  if(type==='dark-beacons'&&step>=1&&step<=8){seg.lowPower=true;seg.kind[floor][step%CONFIG.lanes]='glow';}
  if(type==='ramp-run'){if(step===3)for(let l=0;l<CONFIG.lanes;l++)seg.kind[floor][l]='rampUp';if(step===4)for(let l=0;l<CONFIG.lanes;l++)seg.kind[floor][l]='rampDown';}
  if(type==='gate-run'&&(step===3||step===6)){const safe=step%CONFIG.lanes;for(let l=0;l<CONFIG.lanes;l++)if(l!==safe)seg.tiles[floor][l]=false;}
  if(type==='mixed'&&step>1&&rng()<.38){const {side,lane}=randomTile(rng);seg.tiles[side][lane]=false;}
  // Background variety on non-floor walls keeps chunks from feeling stamped.
  if(idx>8&&rng()<.10+d*.12){const {side,lane}=randomTile(rng);if(side!==floor)seg.tiles[side][lane]=false;}
}
function ensureInfiniteThrough(targetIndex){
  if(!game.level)return;const rng=game.level.rng;
  while(game.level.segments.length<=targetIndex){
    const idx=game.level.segments.length,seg=blankSegment(),d=clamp(.14+idx/520,.14,.76);
    applyInfiniteChunk(seg,idx,game.level,rng,d);
    if(idx>14&&rng()<.04+d*.07){const {side,lane}=randomTile(rng);if(seg.tiles[side][lane])seg.fragile[side][lane]=true;}
    const cellEvery=Math.max(4,7-Math.floor(idx/180));
    if(idx>4&&idx%cellEvery===0){let attempts=0;while(attempts++<12){const {side,lane}=randomTile(rng);if(seg.tiles[side][lane]){const value=Math.min(3,1+Math.floor(idx/160));seg.cells.push({side,lane,value,id:`inf-${idx}-${side}-${lane}`});break;}}}
    game.level.segments.push(seg);
  }
}
function createInfiniteLevel(){
  const keys=Object.keys(GEOMETRY_PRESETS),key=keys[Math.floor(Math.random()*keys.length)],base=GEOMETRY_PRESETS[key];
  const themes=Object.keys(THEMES),theme=themes[Math.floor(Math.random()*themes.length)];
  return {id:'∞',name:'INFINITE',length:Infinity,difficulty:.3,segments:[],rng:mulberry32((Date.now()^0x51ca7e)>>>0),geometry:{...base,radius:base.radius+(Math.random()-.5)*.5},theme,chunkType:'mixed'};
}

// ---------- tunnel streaming ----------
function clearTunnel() {
  for (const group of segmentGroups.values()) tunnelGroup.remove(group);
  segmentGroups.clear(); tileMeshes.clear(); cellMeshes.clear(); fallingPanels.clear();
}

function buildSegment(index) {
  const seg = game.level?.segments[index]; if (!seg) return;
  const group = new THREE.Group(); group.position.z = -index * CONFIG.segmentLength;
  group.userData.index = index;
  for (let side=0;side<CONFIG.sides;side++) {
    for (let lane=0;lane<CONFIG.lanes;lane++) {
      if (!seg.tiles[side][lane]) continue;
      const key = tileKey(index,side,lane);
      const isBroken = game.broken.has(key);
      const kind=seg.kind?.[side]?.[lane]||'normal';
      let mat=isBroken?brokenMaterial:(seg.fragile[side][lane]?fragileMaterial:(specialMaterials[kind]||tileMaterials[side]));
      const lowPower=!!seg.lowPower && kind!=='glow' && !seg.fragile[side][lane] && !isBroken;
      if(lowPower) mat=specialMaterials.dark.clone();
      const mesh = new THREE.Mesh(tileGeometry,mat);
      const isRamp=kind==='rampUp'||kind==='rampDown';
      tileTransform(mesh,side,lane,isRamp?CONFIG.rampRise*.5:0);
      if(isRamp){const slope=Math.atan2(CONFIG.rampRise,CONFIG.segmentLength);mesh.rotation.x += kind==='rampUp'?-slope:slope;}
      mesh.userData={key,fragile:seg.fragile[side][lane],kind,lowPower};
      if (isBroken) mesh.visible=false;
      group.add(mesh); tileMeshes.set(key,mesh);
    }
  }
  for (const cell of seg.cells) {
    if (game.collected.has(cell.id)) continue;
    const value=Math.max(1,Number(cell.value)||1);
    const shardMat=value===1?cellMaterial:cellMaterial.clone();
    if(value===2){shardMat.color.setHex(0xa8f4ff);shardMat.emissive.setHex(0x1d6f82);shardMat.emissiveIntensity=1.0;}
    if(value>=3){shardMat.color.setHex(0xffb3ff);shardMat.emissive.setHex(0x7d2588);shardMat.emissiveIntensity=1.15;}
    const mesh = new THREE.Mesh(cellGeometry,shardMat);
    const angle=cell.side*CONFIG.sideAngle, localX=-CONFIG.halfSide+CONFIG.laneWidth*(cell.lane+.5);
    const p=new THREE.Vector3(localX,-CONFIG.radius+.62,0).applyAxisAngle(new THREE.Vector3(0,0,1),angle);
    mesh.position.set(p.x,p.y,0); mesh.rotation.z=angle; mesh.userData.cell=cell;
    mesh.scale.setScalar(1+(value-1)*.18);
    group.add(mesh); cellMeshes.set(cell.id,mesh);
  }
  tunnelGroup.add(group); segmentGroups.set(index,group);
}

function refreshTunnel(force=false) {
  if (!game.level) return;
  const current = game.currentSegment;
  if (game.mode==='infinite') ensureInfiniteThrough(current + CONFIG.renderAhead + 3);
  if (!force && current===game.lastRenderedSegment) return;
  game.lastRenderedSegment=current;
  const min=Math.max(0,current-CONFIG.renderBehind), max=Math.min(game.level.segments.length-1,current+CONFIG.renderAhead);
  for (const [idx,group] of segmentGroups) {
    if (idx<min || idx>max) { tunnelGroup.remove(group); segmentGroups.delete(idx); for(const child of group.children){if(child.userData?.key) tileMeshes.delete(child.userData.key); if(child.userData?.cell) cellMeshes.delete(child.userData.cell.id);} }
  }
  for (let i=min;i<=max;i++) if(!segmentGroups.has(i)) buildSegment(i);
}

function createMenuTunnel() {
  rebuildGeometryMaterials(DEFAULT_GEOMETRY,'astral');
  game.level = generateExploreLevel({id:0,name:'DEMO',seed:919,length:52,difficulty:.20,branch:'core',geometry:DEFAULT_GEOMETRY,theme:'astral'});
  game.mode='demo'; game.currentSegment=0; game.progress=0; clearTunnel(); refreshTunnel(true);
  tunnelGroup.position.z=0; tunnelGroup.rotation.z=0;
  playerRoot.visible=false;
}

// ---------- gameplay ----------
function selectRunner(id) {
  const r=RUNNERS.find(x=>x.id===id); if(!r || !runnerUnlocked(r)) return;
  storage.runner=id; game.selectedRunner=r; applyRunnerVisual(); renderCharacterCards(); updateAbilityButton(); toast(`${r.name} selected`);
}
function runnerUnlocked(r) {
  if (r.unlockLevel) return Math.max(storage.unlocked, Math.max(0,...storage.completed)+1) > r.unlockLevel;
  return storage.cells >= (r.unlock||0);
}
function currentRunner() {
  const r=RUNNERS.find(x=>x.id===storage.runner);
  return r && runnerUnlocked(r) ? r : RUNNERS[0];
}
function levelUnlocked(meta){
  if(!meta)return false;if(meta.id===1)return true;
  const done=new Set(storage.completed),parents=meta.parents||[];
  return parents.length===0 || parents.every(id=>done.has(id));
}
function nextAvailableIndex(currentIndex){
  for(let i=currentIndex+1;i<LEVEL_META.length;i++)if(levelUnlocked(LEVEL_META[i])&&!storage.completed.includes(LEVEL_META[i].id))return i;
  for(let i=0;i<LEVEL_META.length;i++)if(levelUnlocked(LEVEL_META[i])&&!storage.completed.includes(LEVEL_META[i].id))return i;
  return -1;
}
function markStorySeen(id){const seen=storage.storySeen;if(!seen.includes(id)){seen.push(id);storage.storySeen=seen;}}
function showStoryBeat(meta){
  const beat=STORY_BEATS[meta.id]; if(!beat)return false;
  const seen=storage.storySeen;if(seen.includes(meta.id))return false;
  const title=document.querySelector('#storyTitle'),speaker=document.querySelector('#storySpeaker'),text=document.querySelector('#storyText'),start=document.querySelector('#storyStartBtn');
  if(!title||!speaker||!text||!start)return false;
  game.state='menu';title.textContent=beat.title;speaker.textContent=beat.speaker;text.textContent=beat.text;
  hideAllScreens();showScreen('storyScreen');
  start.onclick=()=>{markStorySeen(meta.id);startExplore(LEVEL_META.findIndex(m=>m.id===meta.id),true);};
  return true;
}
function startExplore(index,skipStory=false) {
  const meta=LEVEL_META[clamp(index,0,LEVEL_META.length-1)];
  if(!levelUnlocked(meta)){toast('Finish the connected route first');return;}
  game.mode='explore';game.levelIndex=LEVEL_META.indexOf(meta);
  if(!skipStory && showStoryBeat(meta))return;
  rebuildGeometryMaterials(meta.geometry,meta.theme);game.level=generateExploreLevel(meta);beginRun();
}
function startInfinite() {
  game.mode='infinite';game.levelIndex=-1;game.level=createInfiniteLevel();rebuildGeometryMaterials(game.level.geometry,game.level.theme);ensureInfiniteThrough(CONFIG.renderAhead+10);beginRun();
}
function beginRun() {
  game.selectedRunner=currentRunner();applyRunnerVisual();
  Object.assign(game,{state:'playing',progress:0,sideOrdinal:0,rotation:0,rotationTarget:0,x:0,vx:0,height:0,vy:0,grounded:true,falling:false,coyote:0,jumpBuffer:0,runTime:0,distance:0,runCells:0,fragileKey:null,fragileTimer:0,currentSegment:0,lastRenderedSegment:-999,deathTimer:0,autoHopTimer:0,cascadeQueue:[],surfaceRise:0,jumpCount:0,rotations:0,fragileBreaks:0,abilityUses:0,dashTimer:0,airDashUsed:false});
  game.broken=new Set();game.collected=new Set();game.seenKinds=new Set();
  clearTunnel();refreshTunnel(true);tunnelGroup.position.z=0;tunnelGroup.rotation.z=0;
  playerRoot.visible=true;playerRoot.position.set(0,CONFIG.baseY,CONFIG.playerZ);playerRoot.rotation.set(0,0,0);
  hideAllScreens();dom.hud.classList.remove('hidden');dom.touchControls.classList.remove('hidden');
  dom.modeLabel.textContent=game.mode==='explore'?(game.level.branchLabel||'EXPLORE'):'INFINITE';dom.levelLabel.textContent=game.mode==='explore'?`LEVEL ${game.level.id} · ${CONFIG.sides} SIDES`:`ENDLESS · ${CONFIG.sides} SIDES`;
  updateAbilityButton();audio.ensure();updateHud();
}
function restartRun(){if(game.mode==='explore')startExplore(game.levelIndex,true);else startInfinite();}

function supportInfo() {
  if(!game.level)return {present:false,fragile:false,key:null,kind:'void',surfaceRise:0};
  const seg=game.level.segments[game.currentSegment];if(!seg)return {present:false,fragile:false,key:null,kind:'void',surfaceRise:0};
  const side=mod(game.sideOrdinal,CONFIG.sides),lane=laneFromX(game.x),key=tileKey(game.currentSegment,side,lane),present=!!seg.tiles[side]?.[lane]&&!game.broken.has(key),kind=present?(seg.kind?.[side]?.[lane]||'normal'):'void';
  const phase=clamp(((game.progress+CONFIG.segmentLength*.48)/CONFIG.segmentLength)-game.currentSegment,0,1);
  const surfaceRise=kind==='rampUp'?phase*CONFIG.rampRise:kind==='rampDown'?(1-phase)*CONFIG.rampRise:0;
  return {present,fragile:present&&!!seg.fragile[side]?.[lane],kind,lowPower:!!seg.lowPower,key,side,lane,surfaceRise};
}

function requestJump() {
  if (game.state!=='playing') return;
  game.jumpBuffer=CONFIG.jumpBuffer; audio.ensure();
}

function performJump() {
  game.vy=game.selectedRunner.jump;game.height=Math.max(0,game.height);game.grounded=false;game.coyote=0;game.jumpBuffer=0;game.fragileKey=null;game.fragileTimer=0;game.jumpCount++;audio.jump();
}

function rotateSide(dir) {
  game.sideOrdinal+=dir;game.rotations++;
  const over=dir>0?game.x-CONFIG.halfSide:-CONFIG.halfSide-game.x;
  game.x=dir>0?-CONFIG.halfSide+Math.max(0,over):CONFIG.halfSide-Math.max(0,over);
  game.x=clamp(game.x,-CONFIG.halfSide+.04,CONFIG.halfSide-.04);
  game.rotationTarget=-game.sideOrdinal*CONFIG.sideAngle;audio.rotate();
}
function manualRotate(dir){
  if(game.state!=='playing'||!game.selectedRunner.manualGravity)return;
  game.sideOrdinal+=dir;game.rotations++;game.rotationTarget=-game.sideOrdinal*CONFIG.sideAngle;game.x=clamp(game.x,-CONFIG.halfSide+.12,CONFIG.halfSide-.12);game.abilityUses++;unlockAchievement('ability-cast');audio.rotate();toast(dir<0?'GRAVITY RUNE • LEFT':'GRAVITY RUNE • RIGHT');
}
function useAbility(dir=1){
  const r=game.selectedRunner;if(game.state!=='playing')return;
  if(r.manualGravity){manualRotate(dir);return;}
  if(r.airDash&&!game.grounded&&!game.airDashUsed){game.airDashUsed=true;game.dashTimer=.38;game.vy=Math.max(game.vy,3.8);game.abilityUses++;unlockAchievement('ability-cast');audio.tone(520,.12,'triangle',.04,250);toast('SKYWING DASH');}
}
function updateAbilityButton(){
  const btn=document.querySelector('#abilityTouch');if(!btn)return;const r=game.selectedRunner;
  if(r.manualGravity){btn.hidden=false;btn.textContent='↻';btn.setAttribute('aria-label','Rotate gravity');}
  else if(r.airDash||r.glide){btn.hidden=false;btn.textContent='✦';btn.setAttribute('aria-label','Dash or glide');}
  else btn.hidden=true;
}

function resetFragileVisual(key) {
  const mesh=tileMeshes.get(key);
  if(!mesh || mesh.userData?.falling) return;
  mesh.position.z=0;
  mesh.rotation.x=0;
  mesh.scale.y=1;
}

function breakFragile(key, cascade=true) {
  if (!key || game.broken.has(key)) return;
  game.broken.add(key);audio.crack();if(game.fragileKey===key)game.fragileBreaks++;
  if(cascade){
    const [segN,sideN,laneN]=key.split(':').map(Number);
    const neighbors=[[segN-1,sideN,laneN],[segN+1,sideN,laneN],[segN,sideN,laneN-1],[segN,sideN,laneN+1]];
    let delay=.07;
    for(const [sg,sd,ln] of neighbors){
      const seg=game.level?.segments?.[sg];
      if(ln<0||ln>=CONFIG.lanes||!seg?.fragile?.[mod(sd,CONFIG.sides)]?.[ln]) continue;
      const nk=tileKey(sg,sd,ln);
      if(!game.broken.has(nk)&&!game.cascadeQueue.some(q=>q.key===nk)) game.cascadeQueue.push({key:nk,delay:delay+=.055});
    }
  }
  const mesh=tileMeshes.get(key);
  if(mesh){
    mesh.material=brokenMaterial;
    mesh.userData.falling=true;
    mesh.userData.fallLife=0;
    mesh.userData.fallSpeed=1.2;
    mesh.userData.fallDir=new THREE.Vector3(mesh.position.x,mesh.position.y,0).normalize();
    mesh.userData.spinX=(Math.random()-.5)*4.8;
    mesh.userData.spinY=(Math.random()-.5)*3.6;
    mesh.userData.spinZ=(Math.random()-.5)*2.8;
    mesh.scale.y=.82;
    fallingPanels.add(mesh);
  }
}

function collectCells() {
  if(!game.level) return;
  const runner=game.selectedRunner;
  const side=mod(game.sideOrdinal,CONFIG.sides),lane=laneFromX(game.x);
  const scan=runner.magnet?[-1,0,1]:[0];
  for(const offset of scan){
    const segIndex=game.currentSegment+offset;
    const seg=game.level.segments[segIndex]; if(!seg) continue;
    for(const cell of seg.cells){
      if(game.collected.has(cell.id)) continue;
      const laneClose=Math.abs(cell.lane-lane)<= (runner.magnet?1:0);
      const canCollect=cell.side===side && laneClose && (runner.magnet || (offset===0 && game.height<1.8));
      if(!canCollect) continue;
      const value=Math.max(1,Number(cell.value)||1);
      game.collected.add(cell.id); game.runCells+=value; storage.cells=storage.cells+value; audio.cell();
      const mesh=cellMeshes.get(cell.id); if(mesh) mesh.visible=false;
      updateCellDisplays();
    }
  }
}

function unlockAchievement(id){
  const all=storage.achievements;if(all.includes(id))return false;const a=ACHIEVEMENTS.find(x=>x.id===id);if(!a)return false;all.push(id);storage.achievements=all;toast(`ACHIEVEMENT • ${a.name}`);renderAchievements();return true;
}
function challengePassed(meta){
  const c=meta?.challenge;if(!c)return false;
  if(c.type==='noBreak')return game.fragileBreaks===0;
  if(c.type==='maxJumps')return game.jumpCount<=c.value;
  if(c.type==='collect')return game.runCells>=c.value;
  return false;
}
function evaluateExploreAchievements(){
  unlockAchievement('first-clear');
  if(game.rotations>=8)unlockAchievement('wall-walker');
  if(game.fragileBreaks===0)unlockAchievement('gentle-steps');
  if(game.runCells>=8)unlockAchievement('shard-seeker');
  if(game.level?.reverse)unlockAchievement('reverse-route');
  if(game.level?.hasLowPower)unlockAchievement('night-eyes');
  if(game.level?.hasIce)unlockAchievement('ice-road');
  const branches=new Set(storage.completed.map(id=>LEVEL_META.find(m=>m.id===id)?.branch).filter(Boolean));if(game.level?.branch)branches.add(game.level.branch);if(branches.size>=3)unlockAchievement('branching-out');
  if(game.level?.challenge&&challengePassed(game.level)){const ch=storage.challenges;ch[game.level.id]=true;storage.challenges=ch;toast(`CHALLENGE CLEAR • ${game.level.challenge.label}`);}
}
function evaluateInfiniteAchievements(){if(game.distance>=500)unlockAchievement('infinite-500');if(game.distance>=1000)unlockAchievement('infinite-1000');}

function die() {
  if(game.state!=='playing')return;if(game.mode==='infinite')evaluateInfiniteAchievements();
  game.state='dying'; game.deathTimer=0; game.falling=true; audio.fall();
}

function completeLevel() {
  if(game.state!=='playing') return;
  game.state='result'; audio.clear();
  const completed=storage.completed; if(!completed.includes(game.level.id)){completed.push(game.level.id); storage.completed=completed;}
  storage.unlocked=Math.max(storage.unlocked,Math.min(LEVEL_META.length,game.level.id+1));evaluateExploreAchievements();
  showResult(true);renderLevelMap();renderCharacterCards();
}

function showResult(cleared) {
  dom.hud.classList.add('hidden'); dom.touchControls.classList.add('hidden');
  dom.resultEyebrow.textContent=cleared?'LEVEL COMPLETE':'RUN ENDED';
  dom.resultTitle.textContent=cleared?game.level.name:'VOIDED';
  dom.resultDistance.textContent=game.mode==='infinite'?`${Math.floor(game.distance)}m`:`${Math.round((game.progress/(game.level.segments.length*CONFIG.segmentLength))*100)}%`;
  dom.resultCells.textContent=String(game.runCells);
  const nextIndex=cleared&&game.mode==='explore'?nextAvailableIndex(game.levelIndex):-1;dom.nextBtn.dataset.nextIndex=String(nextIndex);dom.nextBtn.style.display=nextIndex>=0?'':'none';
  dom.resultMenuBtn.textContent=game.mode==='explore'?'MAP':'MENU';
  if(cleared && game.mode==='explore') {
    const levelNumber=game.level.id;
    const seconds=Math.max(.01,game.runTime);
    const score=levelNumber*1000000 + Math.max(0,500000-Math.floor(seconds*100)) + Math.min(50000,game.runCells*500);
    arcadeMessage({type:'score',gameId:'void-runner',boardId:'void-runner-explore',score,metric:`Level ${levelNumber} · ${seconds.toFixed(1)}s`,details:{mode:'explore',level:levelNumber,seconds:Number(seconds.toFixed(2)),cells:game.runCells}});
  } else if(!cleared && game.mode==='infinite' && game.distance>0) {
    const score=Math.floor(game.distance*1000);
    arcadeMessage({type:'score',gameId:'void-runner',boardId:'void-runner-infinite',score,metric:`${Math.floor(game.distance)}m`,details:{mode:'infinite',distance:Math.floor(game.distance),cells:game.runCells}});
  }
  showScreen('resultScreen');
}

function updateGame(dt) {
  if(game.state==='menu'||game.state==='result'||game.state==='paused')return;
  if(game.state==='dying'){
    game.deathTimer+=dt;game.height-=9.5*dt;game.x+=game.vx*dt;playerRoot.rotation.z+=dt*5.5;updatePlayerVisual(dt);
    if(game.deathTimer>.82){if(game.mode==='explore')startExplore(game.levelIndex,true);else{game.state='result';showResult(false);}}return;
  }

  game.runTime+=dt;game.autoHopTimer=Math.max(0,game.autoHopTimer-dt);game.dashTimer=Math.max(0,game.dashTimer-dt);
  const runner=game.selectedRunner;let surface=supportInfo(),speed=runner.speed;
  if(surface.kind==='fast')speed*=runner.flowMaster?1.42:1.28;
  else if(surface.kind==='slow')speed*=runner.flowMaster?.86:.72;
  else if(surface.kind==='ice')speed*=runner.iceGrip?1.04:1.12;
  if(game.dashTimer>0)speed*=1.72;
  if(game.mode==='infinite')speed*=1+Math.min(game.distance/1800,.28);
  game.progress+=speed*dt;game.distance=game.progress/CONFIG.segmentLength*2.2;
  game.currentSegment=Math.max(0,Math.floor((game.progress+CONFIG.segmentLength*.48)/CONFIG.segmentLength));
  if(game.mode==='infinite')ensureInfiniteThrough(game.currentSegment+CONFIG.renderAhead+5);
  refreshTunnel();tunnelGroup.position.z=game.progress;surface=supportInfo();
  if(surface.present){
    const label={ice:'ICE RUNES • slippery momentum',fast:'FLOW RUNE • speed boost',slow:'WARD RUNE • speed reduced',left:'CURRENT RUNE • pushes left',right:'CURRENT RUNE • pushes right',rampUp:'RAMP • ride the rise',rampDown:'RAMP • stay centered'}[surface.kind];
    if(label&&!game.seenKinds.has(surface.kind)){game.seenKinds.add(surface.kind);toast(label);}
    if(surface.lowPower&&!game.seenKinds.has('lowPower')){game.seenKinds.add('lowPower');toast('LOW POWER • follow the glowing runes');}
  }

  const axis=input.axis,isIce=surface.kind==='ice'&&!runner.iceGrip,accelScale=isIce?.48:1,releaseDamping=isIce?1.55:8.8;
  if(axis)game.vx+=axis*runner.accel*accelScale*dt;else game.vx*=Math.exp(-releaseDamping*dt);
  const currentPush=runner.flowMaster?2.1:5.1;
  if(surface.kind==='left')game.vx-=currentPush*dt;else if(surface.kind==='right')game.vx+=currentPush*dt;
  game.vx=clamp(game.vx,-runner.lateral*(isIce?1.15:1),runner.lateral*(isIce?1.15:1));game.x+=game.vx*dt;
  if(!game.falling){if(game.x>CONFIG.halfSide)rotateSide(1);else if(game.x<-CONFIG.halfSide)rotateSide(-1);}
  game.rotation=damp(game.rotation,game.rotationTarget,comfortMode?4.2:CONFIG.rotationEase,dt);tunnelGroup.rotation.z=game.rotation;

  game.jumpBuffer=Math.max(0,game.jumpBuffer-dt);game.coyote=Math.max(0,game.coyote-dt);
  const support=supportInfo();
  if(game.grounded&&support.present){game.coyote=CONFIG.coyoteTime;game.surfaceRise=support.surfaceRise;game.airDashUsed=false;}
  else if(!game.grounded)game.surfaceRise=damp(game.surfaceRise,0,4.5,dt);
  if(runner.autoHop&&game.grounded&&support.present&&game.autoHopTimer<=0){game.jumpBuffer=CONFIG.jumpBuffer;game.autoHopTimer=.18;}
  if(game.jumpBuffer>0&&(game.grounded||game.coyote>0)&&!game.falling)performJump();

  if(!game.grounded&&!game.falling){
    const holdingJump=input.jumpHeld&&game.vy>0,gliding=runner.glide&&input.abilityHeld&&game.vy<1.5;
    const gravityFactor=gliding?.30:(holdingJump?.67:1);
    game.vy-=runner.gravity*gravityFactor*dt;game.height+=game.vy*dt;
    if(game.height<=0&&game.vy<=0){if(support.present){game.height=0;game.vy=0;game.grounded=true;game.coyote=CONFIG.coyoteTime;game.surfaceRise=support.surfaceRise;game.airDashUsed=false;}else{game.falling=true;game.grounded=false;}}
  }else if(game.grounded){
    game.height=0;game.surfaceRise=support.surfaceRise;
    if(!support.present){game.grounded=false;game.falling=true;game.vy=-1.4;}
  }
  if(game.falling){const glide=runner.glide&&input.abilityHeld;game.vy-=runner.gravity*(glide?.24:.72)*dt;game.height+=game.vy*dt;if(game.height<-6.5)die();}

  if(game.grounded&&support.fragile&&!runner.lightfoot){
    if(game.fragileKey!==support.key){resetFragileVisual(game.fragileKey);game.fragileKey=support.key;game.fragileTimer=0;}else game.fragileTimer+=dt;
    const fragileMesh=tileMeshes.get(support.key);
    if(fragileMesh&&!fragileMesh.userData?.falling){const stress=clamp(game.fragileTimer/CONFIG.fragileBreakTime,0,1);fragileMesh.position.z=comfortMode?0:Math.sin(game.fragileTimer*48)*.055*stress;fragileMesh.rotation.x=comfortMode?0:Math.sin(game.fragileTimer*39)*.028*stress;fragileMesh.scale.y=1-stress*.16;}
    if(game.fragileTimer>CONFIG.fragileBreakTime){breakFragile(support.key);game.grounded=false;game.falling=true;game.vy=-.8;}
  }else{resetFragileVisual(game.fragileKey);game.fragileKey=null;game.fragileTimer=0;}

  collectCells();if(game.mode==='explore'&&game.progress>(game.level.segments.length-.7)*CONFIG.segmentLength)completeLevel();updatePlayerVisual(dt);updateHud();audio.update(dt);
}

function updatePlayerVisual(dt) {
  const y=CONFIG.baseY+game.surfaceRise+game.height;
  playerRoot.position.x=damp(playerRoot.position.x,game.x,18,dt);
  playerRoot.position.y=y;
  if(game.state!=='dying') playerRoot.rotation.z=damp(playerRoot.rotation.z,-game.vx*.035,10,dt);
  const phase=game.runTime*(game.selectedRunner.speed*.86);
  const stride=game.grounded?Math.sin(phase)*.62:.12;
  playerParts.legL.rotation.x=stride; playerParts.legR.rotation.x=-stride;
  // Visible but deliberately modest wing beats: a little while running, stronger in the air.
  const flap=game.grounded?Math.sin(phase*.62)*.12:Math.sin(game.runTime*13.5)*.28;
  playerParts.wingL.rotation.z=-.72-flap; playerParts.wingR.rotation.z=.72+flap;
  playerParts.wingTipL.rotation.z=-1.02-flap*.72; playerParts.wingTipR.rotation.z=1.02+flap*.72;
  playerParts.wingL.rotation.x=.10+Math.abs(flap)*.10; playerParts.wingR.rotation.x=.10+Math.abs(flap)*.10;
  playerParts.tail.rotation.y=Math.sin(phase*.35)*.16;
  playerParts.body.position.y=.70+(game.grounded?Math.abs(Math.sin(phase))*0.035:0);
  playerParts.shadow.material.opacity=clamp(.28-game.height*.035,.06,.28);
  playerParts.shadow.scale.set(1+game.height*.05,.55+game.height*.015,1);
}

function updateDemo(dt) {
  if(game.state!=='menu') return;
  game.progress=(game.progress+dt*2.1)%(CONFIG.segmentLength*7);
  tunnelGroup.position.z=game.progress;
  tunnelGroup.rotation.z+=dt*.028;
  starPoints.rotation.z-=dt*.002;
  for(const mesh of cellMeshes.values()) mesh.rotation.y+=dt*1.7;
}

function updateDecor(dt) {
  if(game.state==='playing') {
    for(const mesh of cellMeshes.values()) if(mesh.visible){mesh.rotation.y+=dt*2.2;mesh.rotation.x+=dt*.8;}
  }
  // Connected fragile panels can chain-collapse instead of behaving as isolated trapdoors.
  if(game.state==='playing' && game.cascadeQueue.length){
    for(const q of game.cascadeQueue) q.delay-=dt;
    const due=game.cascadeQueue.filter(q=>q.delay<=0); game.cascadeQueue=game.cascadeQueue.filter(q=>q.delay>0);
    for(const q of due) breakFragile(q.key,true);
  }
  // Low-power panels flicker while glow panels remain bright route clues.
  if(game.state==='playing'){
    const base=(game.selectedRunner.darkVision?.62:.20),span=(game.selectedRunner.darkVision?.16:.12);const flicker=comfortMode?base+span*.55:base+span*(1+Math.sin(game.runTime*17.7))/2;
    for(const mesh of tileMeshes.values()) if(mesh.userData?.lowPower && !mesh.userData?.falling){ mesh.material.opacity=flicker; mesh.material.emissiveIntensity=comfortMode?.075:.05+.05*Math.max(0,Math.sin(game.runTime*11+mesh.position.x)); }
  }
  // Broken panels keep existing as real 3D objects for a moment instead of simply vanishing.
  for(const mesh of [...fallingPanels]){
    if(!mesh.visible){fallingPanels.delete(mesh);continue;}
    const u=mesh.userData; u.fallLife+=dt; u.fallSpeed+=7.4*dt;
    mesh.position.addScaledVector(u.fallDir,u.fallSpeed*dt);
    mesh.position.z+=1.3*dt;
    mesh.rotation.x+=u.spinX*dt; mesh.rotation.y+=u.spinY*dt; mesh.rotation.z+=u.spinZ*dt;
    mesh.scale.multiplyScalar(Math.max(.985,1-dt*.18));
    if(u.fallLife>1.25){mesh.visible=false;fallingPanels.delete(mesh);}
  }
}

// ---------- UI ----------
function hideAllScreens(){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('visible'));}
function showScreen(id){document.querySelector(`#${id}`)?.classList.add('visible');}
function goMenu(){game.state='menu';dom.hud.classList.add('hidden');dom.touchControls.classList.add('hidden');hideAllScreens();showScreen('menu');createMenuTunnel();updateCellDisplays();}
function showMap(){game.state='menu';renderLevelMap();hideAllScreens();showScreen('mapScreen');}
function showCharacters(){game.state='menu';renderCharacterCards();hideAllScreens();showScreen('characterScreen');}
function showAchievements(){game.state='menu';renderAchievements();hideAllScreens();showScreen('achievementScreen');}
function showHelp(){game.state='menu';hideAllScreens();showScreen('helpScreen');}
function pauseGame(){if(game.state!=='playing')return;game.state='paused';showScreen('pauseScreen');dom.touchControls.classList.add('hidden');}
function resumeGame(){if(game.state!=='paused')return;game.state='playing';document.querySelector('#pauseScreen').classList.remove('visible');dom.touchControls.classList.remove('hidden');audio.ensure();}
function toast(text){clearTimeout(toast._t);dom.toast.textContent=text;dom.toast.classList.add('show');toast._t=setTimeout(()=>dom.toast.classList.remove('show'),1300);}
function updateCellDisplays(){const n=storage.cells;dom.cellCount.textContent=n;dom.mapCellCount.textContent=n;dom.runnerCellCount.textContent=n;}
function updateSoundButton(){document.querySelector('#soundBtn').textContent=audio.enabled?'♪':'×';document.querySelector('#soundBtn').title=audio.enabled?'Sound on':'Sound off';}

function renderLevelMap(){
  const completed=storage.completed,challenges=storage.challenges;dom.levelMap.innerHTML='';
  for(const branch of BRANCHES){
    const section=document.createElement('section');section.className='branch-section';
    const branchLevels=LEVEL_META.filter(meta=>meta.branch===branch.id),doneCount=branchLevels.filter(meta=>completed.includes(meta.id)).length;
    section.innerHTML=`<div class="branch-head"><h3>${branch.label}</h3><span>${doneCount} / ${branchLevels.length} COMPLETE</span></div><div class="branch-grid"></div>`;
    const grid=section.querySelector('.branch-grid');
    for(const meta of branchLevels){
      const locked=!levelUnlocked(meta),done=completed.includes(meta.id),challengeDone=!!challenges[meta.id];
      const btn=document.createElement('button');btn.className=`level-node${locked?' locked':''}${done?' done':''}${challengeDone?' challenge-done':''}`;btn.disabled=locked;
      const challenge=meta.challenge?`<span class="challenge-star" title="${meta.challenge.label}">${challengeDone?'★':'☆'}</span>`:'';
      btn.innerHTML=`${challenge}<span class="orb">${locked?'·':meta.id}</span><span class="label">${locked?'LOCKED':meta.name}</span><span class="geometry">${meta.geometry.sides} SIDES · ${meta.geometry.lanes} LANES${meta.reverse?' · BACKTRACK':''}</span>`;
      if(!locked)btn.addEventListener('click',()=>startExplore(LEVEL_META.indexOf(meta)));grid.appendChild(btn);
    }
    dom.levelMap.appendChild(section);
  }
  updateCellDisplays();
}
function renderAchievements(){
  if(!dom.achievementGrid)return;const unlocked=new Set(storage.achievements);dom.achievementGrid.innerHTML='';
  for(const a of ACHIEVEMENTS){const earned=unlocked.has(a.id),card=document.createElement('article');card.className=`achievement-card${earned?'':' locked'}`;card.innerHTML=`<div class="badge">${earned?'✦':'◇'}</div><h3>${a.name}</h3><p>${a.desc}</p>`;dom.achievementGrid.appendChild(card);}
  if(dom.achievementCount)dom.achievementCount.textContent=`${unlocked.size} / ${ACHIEVEMENTS.length}`;
}

function renderCharacterCards(){
  game.selectedRunner=currentRunner();dom.characterCards.innerHTML='';
  RUNNERS.forEach(r=>{
    const unlocked=runnerUnlocked(r), selected=game.selectedRunner.id===r.id;
    const card=document.createElement('article');card.className=`character-card${selected?' selected':''}${unlocked?'':' locked'}`;
    const req=r.unlockLevel?`Reach Level ${r.unlockLevel+1}`:`${r.unlock||0} cells`;
    card.innerHTML=`<div class="runner-preview"><img src="${assetUrl(`assets/runner-${r.id}.svg`)}" alt="${r.name}"></div><h3>${r.name}</h3><p>${r.desc}</p><div class="stats"><div class="stat"><strong>${Math.round(r.speed)}</strong><span>SPEED</span></div><div class="stat"><strong>${Math.round(r.jump)}</strong><span>JUMP</span></div><div class="stat"><strong>${Math.round(r.lateral)}</strong><span>STEER</span></div></div><button class="card-btn" ${unlocked?'':'disabled'}>${selected?'SELECTED':unlocked?'SELECT':`LOCKED · ${req}`}</button>`;
    if(unlocked&&!selected)card.querySelector('button').addEventListener('click',()=>selectRunner(r.id));dom.characterCards.appendChild(card);
  });updateCellDisplays();
}

function updateHud(){
  if(game.state!=='playing')return;
  if(game.mode==='explore'){
    const pct=clamp(game.progress/(game.level.segments.length*CONFIG.segmentLength),0,1);dom.progressFill.style.width=`${pct*100}%`;dom.progressText.textContent=`${Math.floor(pct*100)}%`;
  }else{
    const pseudo=(game.progress%(CONFIG.segmentLength*25))/(CONFIG.segmentLength*25);dom.progressFill.style.width=`${pseudo*100}%`;dom.progressText.textContent=`${Math.floor(game.distance)}m`;
  }
}

function updateCloudStatus(text) {
  const el = document.querySelector('#cloudStatus');
  if (el) el.textContent = text;
}

function applyCloudProgress(remote = {}) {
  const localCompleted = progressState.completed;
  const remoteCompleted = Array.isArray(remote.completed) ? remote.completed.filter(Number.isFinite) : [];
  progressState.completed = [...new Set([...localCompleted, ...remoteCompleted])].filter(n => n >= 1 && n <= LEVEL_META.length);
  progressState.cells = Math.max(progressState.cells, Math.max(0,Math.floor(Number(remote.cells)||0)));
  progressState.unlocked = Math.max(progressState.unlocked, Math.max(1,Math.min(LEVEL_META.length,Math.floor(Number(remote.unlocked)||1))));
  const remoteAchievements=Array.isArray(remote.achievements)?remote.achievements:[];
  progressState.achievements=[...new Set([...progressState.achievements,...remoteAchievements])].filter(id=>ACHIEVEMENTS.some(a=>a.id===id));
  progressState.challenges={...progressState.challenges,...(remote.challenges&&typeof remote.challenges==='object'?remote.challenges:{})};
  const remoteStories=Array.isArray(remote.storySeen)?remote.storySeen:[];
  progressState.storySeen=[...new Set([...progressState.storySeen,...remoteStories])].filter(Number.isFinite);
  if (typeof remote.runner === 'string' && RUNNERS.some(r => r.id === remote.runner)) progressState.runner=remote.runner;
  persistProgressNow();
  queueCloudSync();
  game.selectedRunner = currentRunner();applyRunnerVisual();renderLevelMap();renderCharacterCards();renderAchievements();updateAbilityButton();updateCellDisplays();
}

// ---------- input ----------
const leftCodes=new Set(['ArrowLeft','KeyA']),rightCodes=new Set(['ArrowRight','KeyD']),jumpCodes=new Set(['Space','ArrowUp','KeyW']);
window.addEventListener('keydown',e=>{
  if(leftCodes.has(e.code)){e.preventDefault();input.leftKeys.add(e.code);} if(rightCodes.has(e.code)){e.preventDefault();input.rightKeys.add(e.code);}
  if(jumpCodes.has(e.code)){e.preventDefault();if(!input.jumpKeys.has(e.code))requestJump();input.jumpKeys.add(e.code);}
  if((e.code==='KeyQ'||e.code==='KeyE')&&!e.repeat&&game.selectedRunner.manualGravity){e.preventDefault();useAbility(e.code==='KeyQ'?-1:1);}
  if((e.code==='ShiftLeft'||e.code==='ShiftRight'||e.code==='KeyX')&&game.selectedRunner.airDash){e.preventDefault();input.abilityHeld=true;if(!e.repeat)useAbility(1);}
  if((e.code==='Escape'||e.code==='KeyP')&&!e.repeat){if(game.state==='playing')pauseGame();else if(game.state==='paused')resumeGame();}
  if(e.code==='KeyR'&&!e.repeat&&(game.state==='playing'||game.state==='paused'))restartRun();
},{passive:false});
window.addEventListener('keyup',e=>{input.leftKeys.delete(e.code);input.rightKeys.delete(e.code);input.jumpKeys.delete(e.code);if(e.code==='ShiftLeft'||e.code==='ShiftRight'||e.code==='KeyX')input.abilityHeld=false;});
window.addEventListener('blur',()=>{input.leftKeys.clear();input.rightKeys.clear();input.jumpKeys.clear();input.pointerLeft=input.pointerRight=input.pointerJump=input.abilityHeld=false;if(game.state==='playing')pauseGame();});

// Canvas click/touch jump is intentionally immediate pointerdown, not delayed click/up.
dom.canvas.addEventListener('pointerdown',e=>{if(game.state==='playing'&&e.pointerType!=='mouse'||(game.state==='playing'&&e.button===0)){input.pointerJump=true;requestJump();dom.canvas.setPointerCapture?.(e.pointerId);}}, {passive:true});
dom.canvas.addEventListener('pointerup',e=>{input.pointerJump=false;dom.canvas.releasePointerCapture?.(e.pointerId);});
dom.canvas.addEventListener('pointercancel',()=>{input.pointerJump=false;});

function bindHoldButton(id,on,off){const el=document.querySelector(id);const down=e=>{e.preventDefault();on();el.setPointerCapture?.(e.pointerId);};const up=e=>{e.preventDefault();off();el.releasePointerCapture?.(e.pointerId);};el.addEventListener('pointerdown',down,{passive:false});el.addEventListener('pointerup',up,{passive:false});el.addEventListener('pointercancel',off);el.addEventListener('contextmenu',e=>e.preventDefault());}
bindHoldButton('#leftTouch',()=>input.pointerLeft=true,()=>input.pointerLeft=false);
bindHoldButton('#rightTouch',()=>input.pointerRight=true,()=>input.pointerRight=false);
bindHoldButton('#jumpTouch',()=>{input.pointerJump=true;requestJump();},()=>input.pointerJump=false);
bindHoldButton('#abilityTouch',()=>{input.abilityHeld=true;useAbility(1);},()=>input.abilityHeld=false);

// ---------- buttons ----------
document.querySelector('#exploreBtn').addEventListener('click',showMap);
document.querySelector('#infiniteBtn').addEventListener('click',startInfinite);
document.querySelector('#charactersBtn').addEventListener('click',showCharacters);
document.querySelector('#achievementsBtn').addEventListener('click',showAchievements);
document.querySelector('#helpBtn').addEventListener('click',showHelp);
document.querySelector('#settingsBtn').addEventListener('click',()=>{game.state='menu';hideAllScreens();showScreen('settingsScreen');});
document.querySelector('#comfortToggle').addEventListener('change',e=>setComfortMode(e.target.checked));
document.querySelector('#performanceMode').addEventListener('change',e=>setPerformanceMode(e.target.value));
document.querySelectorAll('[data-back="menu"]').forEach(b=>b.addEventListener('click',goMenu));
document.querySelector('#pauseBtn').addEventListener('click',pauseGame);
document.querySelector('#resumeBtn').addEventListener('click',resumeGame);
document.querySelector('#restartBtn').addEventListener('click',restartRun);
document.querySelector('#quitBtn').addEventListener('click',()=>game.mode==='explore'?showMap():goMenu());
document.querySelector('#retryBtn').addEventListener('click',restartRun);
dom.nextBtn.addEventListener('click',()=>{const i=Number(dom.nextBtn.dataset.nextIndex);if(Number.isInteger(i)&&i>=0)startExplore(i);else showMap();});
dom.resultMenuBtn.addEventListener('click',()=>game.mode==='explore'?showMap():goMenu());
document.querySelector('#soundBtn').addEventListener('click',()=>audio.toggle());

// ---------- loop ----------
let last=performance.now();
function loop(now){
  const dt=Math.min((now-last)/1000,.05);last=now;
  updateGame(dt);updateDemo(dt);updateDecor(dt);trackPerformance(dt);
  renderer.render(scene,camera);requestAnimationFrame(loop);
}
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize);

function showStartupFailure(error){
  console.error('Void Runner startup failed:',error);
  const el=document.querySelector('#startupFailure');if(el){el.hidden=false;const detail=el.querySelector('[data-error-detail]');if(detail)detail.textContent=String(error?.message||error||'Unknown WebGL error').slice(0,240);}
  document.querySelector('#menu')?.classList.remove('visible');
}
setComfortMode(comfortMode);updatePerformanceUi();
try{
  initThree();applyPerformanceProfile(effectivePerformanceMode,false);
  game.selectedRunner=currentRunner();applyRunnerVisual();renderLevelMap();renderCharacterCards();renderAchievements();updateCellDisplays();updateSoundButton();updateAbilityButton();requestAnimationFrame(loop);
  initCloudSync({ getSnapshot: progressSnapshot, applySnapshot: applyCloudProgress, onStatus: updateCloudStatus });
}catch(error){showStartupFailure(error);}


