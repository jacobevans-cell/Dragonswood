(() => {
  'use strict';

  const W = 1280;
  const H = 720;
  const GROUND_Y = 610;
  const CEILING_Y = 90;
  const TILE = 40;
  const PLAYER_BASE = 38;
  const SPEEDS = { slow: 255, normal: 330, fast: 410, faster: 500, fastest: 610 };
  // Small forgiveness windows make press-down input feel immediate without
  // changing the core physics. Presses survive briefly until an action is valid.
  const INPUT_BUFFER_SECONDS = 0.09;
  const GROUND_GRACE_SECONDS = 0.04;

  const $ = (id) => document.getElementById(id);
  const PARAMS = new URLSearchParams(location.search);
  const ARCADE_MODE = PARAMS.get('arcade') === '1';
  const COMFORT_PARAM = PARAMS.get('comfort');
  const PERFORMANCE_PARAM = (PARAMS.get('perf')||'auto').toLowerCase();
  const HARDWARE_LOW = (Number(navigator.deviceMemory||8)<=4 || Number(navigator.hardwareConcurrency||8)<=4);
  const PERFORMANCE_LOW = PERFORMANCE_PARAM==='low' || (PERFORMANCE_PARAM==='auto' && HARDWARE_LOW);
  const SYSTEM_REDUCED_MOTION = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let GLOBAL_ARCADE_CONFIG = window.DRAGONSWOOD_ARCADE_CONFIG||{};
  try{if(window.parent!==window)GLOBAL_ARCADE_CONFIG=window.parent.DRAGONSWOOD_ARCADE_CONFIG||GLOBAL_ARCADE_CONFIG;}catch{}
  function arcadeMessage(payload) {
    if (!ARCADE_MODE || window.parent === window) return;
    try { window.parent.postMessage({ channel: 'dragonswood-arcade', ...payload }, location.origin); } catch {}
  }
  arcadeMessage({ type: 'ready', gameId: 'dragon-dash' });
  const screens = [...document.querySelectorAll('.screen')];
  const gameCanvas = $('gameCanvas');
  const ctx = gameCanvas.getContext('2d');
  const editorCanvas = $('editorCanvas');
  const ectx = editorCanvas.getContext('2d');

  const settings = {
    practice: false,
    muted: false,
    volume: 0.45,
    shake: true,
    particles: !PERFORMANCE_LOW,
    hitboxes: false,
    performanceLow: PERFORMANCE_LOW,
    comfort: COMFORT_PARAM==='1' || (COMFORT_PARAM!=='0' && (localStorage.getItem('dragonDash.comfort')==='on' || (localStorage.getItem('dragonDash.comfort')==null && SYSTEM_REDUCED_MOTION))),
  };

  const input = {
    held: false,
    pressed: false,
    released: false,
    pressBuffer: 0,
    sources: new Set(),
    keys: new Set(),
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rectsOverlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const pointDist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

  function showScreen(id) {
    screens.forEach(s => s.classList.toggle('active', s.id === id));
    if (id !== 'gameScreen') stopGame();
    if (id === 'editorScreen') drawEditor();
  }

  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.nextBeat = 0;
      this.beatIndex = 0;
      this.pattern = [220,0,330,0,247,0,370,0,220,0,294,0,330,0,415,0];
    }
    ensure() {
      if (settings.muted) return false;
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = settings.volume;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this.master.gain.value = settings.muted ? 0 : settings.volume;
      return true;
    }
    tone(freq, dur = .08, type = 'square', vol = .08, slide = 0) {
      if (!this.ensure()) return;
      const now = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, now);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), now + dur);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(vol, now + .006);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.connect(g); g.connect(this.master);
      o.start(now); o.stop(now + dur + .02);
    }
    jump() { this.tone(520, .075, 'square', .06, 170); }
    orb() { this.tone(740, .12, 'sine', .10, 260); }
    portal() { this.tone(310, .18, 'sawtooth', .08, 500); }
    checkpoint() { this.tone(900, .06, 'sine', .06, 200); }
    death() { this.tone(160, .32, 'sawtooth', .13, -110); }
    win() { [523,659,784,1046].forEach((n,i)=>setTimeout(()=>this.tone(n,.18,'sine',.10,100), i*95)); }
    setPattern(pattern) { if (pattern) this.pattern = pattern; this.beatIndex = 0; this.nextBeat = 0; }
    tick(gameTime, beat = .24) {
      if (!this.ensure() || game.state !== 'playing') return;
      if (gameTime >= this.nextBeat) {
        const f = this.pattern[this.beatIndex % this.pattern.length];
        if (f) this.tone(f, .09, this.beatIndex % 4 === 0 ? 'triangle':'square', .027, 0);
        if (this.beatIndex % 4 === 0) this.tone(75, .12, 'sine', .04, -15);
        this.beatIndex++;
        this.nextBeat += beat;
      }
    }
  }
  const audio = new AudioEngine();

  function obj(type, x, y, extra = {}) { return { type, x, y, ...extra }; }
  function blocksLine(arr, start, count, y = GROUND_Y - TILE, step = TILE) {
    for (let i=0;i<count;i++) arr.push(obj('block', start + i*step, y));
  }
  function spikes(arr, xs, y = GROUND_Y - TILE) { xs.forEach(x => arr.push(obj('spike', x, y))); }

  function levelOne() {
    const o = [];
    spikes(o, [760, 920, 960, 1240, 1540,1580,1620]);
    blocksLine(o, 1080, 3);
    o.push(obj('orb', 1210, 490, {orb:'yellow'}));
    blocksLine(o, 1820, 4, 490);
    spikes(o, [1880,1960], 450);
    o.push(obj('pad', 2220, GROUND_Y-20,{pad:'yellow'}));
    spikes(o,[2440,2480,2520,2760,2920,2960]);
    blocksLine(o, 2680, 2);
    o.push(obj('portal', 3260, 520,{mode:'ship'}));
    blocksLine(o, 3500, 3, 520); blocksLine(o, 3820,4,260); blocksLine(o, 4240,3,500); blocksLine(o, 4560,4,240);
    o.push(obj('saw', 3740, 440,{r:34}), obj('saw', 4140, 330,{r:36}), obj('saw', 4480, 460,{r:38}));
    o.push(obj('portal', 4920, 520,{mode:'cube'}));
    spikes(o,[5260,5300,5660,5700,5740,6180,6220]);
    blocksLine(o, 5460,3,490);
    o.push(obj('orb',5560,420,{orb:'blue'}));
    o.push(obj('orb',5750,455,{orb:'pink'}));
    o.push(obj('portal', 5960, 520,{speed:'fast'}));
    blocksLine(o, 6420,5,490); spikes(o,[6500,6580],450);
    o.push(obj('finish',7200,390));
    return {id:'level1',name:'First Flight',difficulty:'Normal',description:'Cube basics, orbs, pads, ship flight, and a speed change.',theme:['#123c88','#061b42','#55d9ff'], length:7200, beat:.245, song:[220,0,330,0,247,0,370,0,220,0,294,0,330,0,415,0], objects:o};
  }

  function levelTwo() {
    const o=[];
    spikes(o,[720,760,1040,1220,1260,1500,1540,1580]);
    blocksLine(o,920,2,490); o.push(obj('orb',980,420,{orb:'yellow'}));
    o.push(obj('portal', 1840, 520,{mode:'ball'}));
    blocksLine(o,2040,5,500); blocksLine(o,2380,4,170); blocksLine(o,2760,4,500); blocksLine(o,3120,4,170);
    o.push(obj('saw',2320,390,{r:38}),obj('saw',2700,320,{r:38}),obj('saw',3060,390,{r:38}));
    o.push(obj('portal', 3380, 520,{mode:'ufo'}));
    blocksLine(o,3640,4,510); blocksLine(o,4000,4,210); blocksLine(o,4380,4,500);
    o.push(obj('saw',3940,430,{r:34}),obj('saw',4300,300,{r:34}));
    o.push(obj('portal', 4680, 520,{gravity:-1}));
    blocksLine(o,4920,5,170); spikes(o,[5040,5120],210);
    o.push(obj('portal',5380,290,{mode:'cube'}), obj('portal',5560,290,{gravity:1}));
    spikes(o,[5840,5880,6160,6360,6400,6440]);
    o.push(obj('pad',6040,GROUND_Y-20,{pad:'blue'}));
    o.push(obj('orb',6280,420,{orb:'green'}));
    o.push(obj('portal', 6740, 520,{speed:'faster'}));
    spikes(o,[7020,7060,7100,7420,7460,7820,7860]);
    o.push(obj('finish',8200,390));
    return {id:'level2',name:'Gravity Grove',difficulty:'Hard',description:'Ball flips, UFO timing, inverted gravity, and tighter corridors.',theme:['#4f1b86','#160d38','#ff75d8'], length:8200, beat:.225, song:[196,294,0,392,220,330,0,440,247,370,0,494,220,330,392,0],objects:o};
  }

  function levelThree() {
    const o=[];
    spikes(o,[700,740,1020,1060,1100,1380,1540,1580]);
    blocksLine(o,880,2,500); o.push(obj('orb',940,430,{orb:'yellow'}));
    o.push(obj('portal', 1800, 520,{mode:'robot'}));
    spikes(o,[2100,2140,2460,2500,2820]); blocksLine(o,2300,3,500); blocksLine(o,2660,2,460);
    o.push(obj('portal', 3180, 520,{mode:'wave'}));
    blocksLine(o,3400,5,200); blocksLine(o,3400,5,520); blocksLine(o,3860,5,280); blocksLine(o,3860,5,600); blocksLine(o,4320,5,150); blocksLine(o,4320,5,470);
    o.push(obj('saw',3780,440,{r:34}),obj('saw',4240,300,{r:34}),obj('saw',4700,430,{r:34}));
    o.push(obj('portal', 4860, 520,{mode:'spider'}));
    blocksLine(o,5100,5,500); blocksLine(o,5480,5,170); blocksLine(o,5860,5,500); blocksLine(o,6240,5,170);
    o.push(obj('saw',5420,390,{r:35}),obj('saw',5800,320,{r:35}),obj('saw',6180,390,{r:35}));
    o.push(obj('portal', 6500, 520,{mode:'ship'}), obj('portal', 6660, 520,{speed:'fastest'}));
    blocksLine(o,6920,4,500); blocksLine(o,7240,4,210); blocksLine(o,7600,4,500); blocksLine(o,7940,4,190);
    o.push(obj('saw',7180,390,{r:36}),obj('saw',7540,310,{r:36}),obj('saw',7900,400,{r:36}));
    o.push(obj('portal', 8280, 520,{mode:'cube'}), obj('portal', 8420, 520,{speed:'normal'}));
    o.push(obj('pad',8660,GROUND_Y-20,{pad:'yellow'}));
    o.push(obj('pad',8780,GROUND_Y-20,{pad:'red'})); spikes(o,[8900,8940,8980,9300,9340,9660,9700,9740]);
    blocksLine(o,9140,3,490); o.push(obj('orb',9240,410,{orb:'blue'}));
    o.push(obj('orb',9440,360,{orb:'red'}), obj('orb',9580,430,{orb:'black'}));
    o.push(obj('finish',10300,390));
    return {id:'level3',name:'Dragon Circuit',difficulty:'Insane',description:'Robot, wave, spider, ship, speed portals, and rapid mode changes.',theme:['#6b3211','#261107','#ffb83d'], length:10300, beat:.205, song:[165,247,330,0,196,294,392,0,220,330,440,0,247,370,494,0],objects:o};
  }


  function levelFour() {
    const o=[];
    // Showcase level for the v1.4 medium-parity systems.
    spikes(o,[720,760,1120,1160]);
    o.push(obj('portal',900,520,{size:.65,label:'MINI'}));
    blocksLine(o,1040,3,500); o.push(obj('orb',1120,430,{orb:'dash',angle:-18}));
    o.push(obj('portal',1480,520,{size:1,label:'FULL'}));
    // slopes
    o.push(obj('slope',1660,530,{w:160,h:80,dir:'up'}));
    o.push(obj('slope',1820,530,{w:160,h:80,dir:'down'}));
    // moving and orbiting platforms
    o.push(obj('movingBlock',2200,480,{w:120,h:30,dx:0,dy:-150,period:2.4,group:'movers'}));
    o.push(obj('rotatingBlock',2520,410,{w:100,h:28,anchorX:2520,anchorY:410,radius:95,period:3.0,group:'movers'}));
    o.push(obj('orb',2780,390,{orb:'spider'}));
    // linked teleport portals
    o.push(obj('portal',3100,430,{teleport:'A',teleportRole:'entry'}));
    o.push(obj('portal',3640,310,{teleport:'A',teleportRole:'exit'}));
    blocksLine(o,3560,5,470);
    // swing passage
    o.push(obj('portal',4040,520,{mode:'swing'}));
    blocksLine(o,4260,5,190); blocksLine(o,4260,5,520);
    blocksLine(o,4720,5,270); blocksLine(o,4720,5,600);
    o.push(obj('orb',4560,390,{orb:'gravitydash',angle:18}));
    o.push(obj('portal',5200,520,{mode:'cube'}));
    // trigger demo: camera zoom/offset then move grouped blocks
    o.push(obj('block',5480,490,{group:'gate'}),obj('block',5520,490,{group:'gate'}));
    o.push(obj('trigger',5360,0,{trigger:'camera',zoom:1.22,offsetY:-35,duration:.6,hidden:true}));
    o.push(obj('trigger',5440,0,{trigger:'move',targetGroup:'gate',dx:0,dy:-160,duration:1.0,hidden:true}));
    o.push(obj('trigger',5700,0,{trigger:'camera',zoom:1,offsetY:0,duration:.7,hidden:true}));
    // Spawn-trigger demo: a hidden trigger lifts a rune gate when spawned.
    o.push(obj('block',5920,490,{group:'spawnGate'}));
    o.push(obj('trigger',0,0,{trigger:'move',group:'spawnA',spawnOnly:true,targetGroup:'spawnGate',dx:0,dy:-160,duration:.7,hidden:true}));
    o.push(obj('trigger',5780,0,{trigger:'spawn',targetGroup:'spawnA',hidden:true}));
    // reverse corridor then reverse back
    o.push(obj('portal',6100,520,{reverse:true}));
    spikes(o,[5860,5900,5940],570);
    o.push(obj('portal',5660,520,{reverse:true}));
    // teleport orb target
    o.push(obj('orb',6460,420,{orb:'teleport',targetGroup:'orbA'}));
    o.push(obj('teleportTarget',6920,360,{group:'orbA'}));
    // free-fly ship chamber
    o.push(obj('portal',7160,520,{mode:'ship'}),obj('portal',7280,520,{freeFly:true}));
    blocksLine(o,7500,4,580); blocksLine(o,7860,4,100); o.push(obj('saw',7780,350,{r:42}));
    o.push(obj('portal',8280,520,{freeFly:false}),obj('portal',8420,520,{mode:'cube'}));
    o.push(obj('finish',9000,390));
    return {id:'level4',name:'Runestone Engine',creator:'Dragonswood',difficulty:'Insane',description:'Mini, Swing, slopes, moving platforms, teleportation, triggers, reverse travel, and advanced orbs.',theme:['#0d5148','#071d1b','#ffe89a'],length:9000,beat:.205,song:[196,294,392,0,220,330,440,0,247,370,494,0],objects:o};
  }

  const levels = [levelOne(), levelTwo(), levelThree(), levelFour()];

  const game = {
    state:'stopped', level:null, player:null, cameraX:0, cameraZoom:1, cameraZoomTarget:1,
    cameraOffsetX:0, cameraOffsetXTarget:0, cameraOffsetY:0, cameraOffsetYTarget:0,
    time:0, attempt:1, lastTs:0, accumulator:0, progressX:0,
    particles:[], checkpoints:[], lastAutoCheckpointX:0, activeTouches:new Set(), shakePower:0,
    portalSeen:new Set(), padSeen:new Set(), triggerSeen:new Set(), orbLock:null, editorTest:false,
    customMusic:null,
  };

  function createPlayer() {
    return {x:260,y:GROUND_Y-PLAYER_BASE,w:PLAYER_BASE,h:PLAYER_BASE,vx:SPEEDS.normal,vy:0,mode:'cube',gravity:1,gravityStrength:1,size:1,rotation:0,onGround:true,groundGrace:GROUND_GRACE_SECONDS,jumpHold:0,dead:false,direction:1,freeFly:false,dashTime:0,dashAngle:0,standingOn:null};
  }

  function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function validateMusicUrl(raw){
    const value=String(raw||'').trim();if(!value)return {ok:true,url:''};
    try{const u=new URL(value);if(u.protocol!=='https:')return {ok:false,error:'Custom music must use HTTPS.'};const allow=GLOBAL_ARCADE_CONFIG.customMusic?.allowedHosts||[];if(Array.isArray(allow)&&allow.length&&!allow.includes(u.hostname))return {ok:false,error:'That music host is not approved for this arcade.'};return {ok:true,url:u.href};}catch{return {ok:false,error:'Custom music URL is not valid.'}}
  }
  function applyComfortMode(on){settings.comfort=!!on;localStorage.setItem('dragonDash.comfort',settings.comfort?'on':'off');document.documentElement.classList.toggle('comfort-mode',settings.comfort);document.documentElement.classList.toggle('performance-low',settings.performanceLow);if(settings.comfort){settings.shake=false;$('shakeToggle')&&($('shakeToggle').checked=false);}const c=$('comfortToggle');if(c)c.checked=settings.comfort;}

  function stopCustomMusic(){
    if(game.customMusic){try{game.customMusic.pause();game.customMusic.src='';}catch{} game.customMusic=null;}
  }
  function startCustomMusic(level){
    stopCustomMusic();
    if(!level.musicUrl) return;
    const valid=validateMusicUrl(level.musicUrl);if(!valid.ok){toast(valid.error);return;}
    try{const a=new Audio(valid.url);a.preload='auto';a.volume=settings.muted?0:settings.volume;a.currentTime=Math.max(0,Number(level.musicOffset)||0);a.play().catch(()=>toast('Custom music could not be played.'));game.customMusic=a;}catch{toast('Custom music could not be loaded.');}
  }

  function prepareRuntimeObjects(){
    (game.level.objects||[]).forEach((o,i)=>{o._uid=o._uid||`o${i}`;o._baseX=o.x;o._baseY=o.y;o._prevX=o.x;o._prevY=o.y;});
  }

  function startLevel(level, editorTest=false) {
    game.level = JSON.parse(JSON.stringify(level));
    game.editorTest = editorTest;
    game.state='playing';
    game.player=createPlayer();
    prepareRuntimeObjects();
    game.cameraX=0; game.cameraZoom=game.cameraZoomTarget=1; game.cameraOffsetX=game.cameraOffsetXTarget=0; game.cameraOffsetY=game.cameraOffsetYTarget=0;
    game.time=0; game.lastTs=performance.now(); game.accumulator=0; game.progressX=0;
    game.attempt=1; game.particles=[]; game.checkpoints=[]; game.lastAutoCheckpointX=0; game.shakePower=0;
    game.portalSeen.clear(); game.padSeen.clear(); game.triggerSeen.clear(); game.orbLock=null;
    clearPendingPress();
    audio.ensure();
    audio.setPattern(game.level.song || [220,0,330,0,247,0,370,0]);
    startCustomMusic(game.level);
    $('attemptText').textContent='Attempt 1';
    $('practiceBadge').classList.toggle('hidden', !settings.practice);
    $('gameOverlay').classList.add('hidden');
    showScreenDirect('gameScreen');
    requestAnimationFrame(loop);
  }

  function showScreenDirect(id) { screens.forEach(s=>s.classList.toggle('active',s.id===id)); }
  function stopGame() { if (game.state !== 'stopped') game.state='stopped'; stopCustomMusic(); }

  function playerRect(p=game.player) {
    const s=PLAYER_BASE*p.size;
    return {x:p.x,y:p.y,w:s,h:s};
  }

  function dynamicRect(o,t=game.time) {
    const w=o.w||TILE,h=o.h||TILE;
    if(o.type==='movingBlock'){
      const a=(t/(o.period||2.4))*Math.PI*2;
      return {x:(o._baseX??o.x)+(o.dx||0)*(.5-.5*Math.cos(a)),y:(o._baseY??o.y)+(o.dy||0)*(.5-.5*Math.cos(a)),w,h};
    }
    if(o.type==='rotatingBlock'){
      const a=(t/(o.period||3))*Math.PI*2+(o.phase||0),r=o.radius||80;
      const ax=o.anchorX??o._baseX??o.x, ay=o.anchorY??o._baseY??o.y;
      return {x:ax+Math.cos(a)*r-w/2,y:ay+Math.sin(a)*r-h/2,w,h,rotation:a};
    }
    return {x:o.x,y:o.y,w,h,rotation:o.rotation||0};
  }

  function objectRect(o,t=game.time) {
    if (o.type==='block'||o.type==='movingBlock'||o.type==='rotatingBlock') return dynamicRect(o,t);
    if (o.type==='slope') return {x:o.x,y:o.y,w:o.w||160,h:o.h||80};
    if (o.type==='spike') return {x:o.x+7,y:o.y+10,w:(o.w||TILE)-14,h:(o.h||TILE)-10};
    if (o.type==='pad') return {x:o.x,y:o.y,w:70,h:22};
    if (o.type==='portal') return {x:o.x-26,y:o.y-92,w:58,h:184};
    if (o.type==='orb') return {x:o.x-25,y:o.y-25,w:50,h:50};
    if (o.type==='teleportTarget') return {x:o.x-18,y:o.y-18,w:36,h:36};
    if (o.type==='trigger') return {x:o.x-12,y:CEILING_Y,w:24,h:GROUND_Y-CEILING_Y};
    if (o.type==='finish') return {x:o.x,y:CEILING_Y,w:30,h:GROUND_Y-CEILING_Y};
    if (o.type==='saw') { const r=o.r||32; return {x:o.x-r,y:o.y-r,w:r*2,h:r*2}; }
    return {x:o.x,y:o.y,w:TILE,h:TILE};
  }

  function addParticles(x,y,count=8,kind='trail') {
    if (!settings.particles) return;
    for(let i=0;i<count;i++) game.particles.push({x,y,vx:(Math.random()-.5)*(kind==='death'?420:100),vy:(Math.random()-.5)*(kind==='death'?420:100),life:kind==='death'?.7:.32,max:kind==='death'?.7:.32,size:kind==='death'?4+Math.random()*8:2+Math.random()*4,kind});
  }

  function saveCheckpoint(manual=false) {
    if (!settings.practice || !game.player || game.player.dead) return;
    const p=game.player;
    const cp={x:p.x,y:p.y,vy:p.vy,mode:p.mode,gravity:p.gravity,gravityStrength:p.gravityStrength,size:p.size,vx:p.vx,rotation:p.rotation,direction:p.direction,freeFly:p.freeFly};
    game.checkpoints.push(cp);
    if (game.checkpoints.length>10) game.checkpoints.shift();
    game.lastAutoCheckpointX=p.x;
    audio.checkpoint();
    { const s=PLAYER_BASE*p.size; addParticles(p.x+s/2,p.y+s/2,10,'checkpoint'); }
    if (manual) toast('Checkpoint placed');
  }

  function restoreCheckpoint() {
    const cp=game.checkpoints[game.checkpoints.length-1];
    if (!cp) { resetPlayer(false); return; }
    Object.assign(game.player,cp,{dead:false,onGround:false});
    game.cameraX=Math.max(0,cp.x-(cp.direction>0?300:980));
    game.portalSeen.clear(); game.padSeen.clear(); game.triggerSeen.clear(); game.orbLock=null;
  }

  function resetRuntimeObjects(){
    (game.level?.objects||[]).forEach(o=>{if(o._baseX!=null){o.x=o._baseX;o.y=o._baseY;}delete o._tween;delete o._rotateTween;delete o._disabled;});
  }

  function resetPlayer(countAttempt=true) {
    if (countAttempt) game.attempt++;
    resetRuntimeObjects();
    if (settings.practice && game.checkpoints.length) restoreCheckpoint();
    else {
      game.player=createPlayer(); game.cameraX=0; game.time=0; game.progressX=0; game.portalSeen.clear(); game.padSeen.clear(); game.triggerSeen.clear(); game.orbLock=null; game.lastAutoCheckpointX=0;
    }
    game.cameraZoom=game.cameraZoomTarget=1;game.cameraOffsetX=game.cameraOffsetXTarget=0;game.cameraOffsetY=game.cameraOffsetYTarget=0;
    game.player.dead=false;
    clearPendingPress();
    game.state='playing';
    $('attemptText').textContent=`Attempt ${game.attempt}`;
    $('gameOverlay').classList.add('hidden');
    audio.nextBeat=game.time;
    if(game.customMusic){try{game.customMusic.currentTime=Math.max(0,Number(game.level.musicOffset)||0);game.customMusic.play().catch(()=>{});}catch{}}
  }

  function killPlayer(reason='Crash') {
    if (game.player.dead || game.state!=='playing') return;
    game.player.dead=true; game.state='dead';
    game.shakePower=settings.shake?18:0;
    addParticles(game.player.x+20,game.player.y+20,26,'death');
    audio.death();
    if(game.customMusic) try{game.customMusic.pause();}catch{}
    setTimeout(()=>{ if(game.state==='dead') resetPlayer(true); }, 430);
  }

  function completeLevel() {
    if (game.state!=='playing') return;
    game.state='complete'; audio.win(); addParticles(game.player.x+20,game.player.y+20,45,'death');
    if(game.customMusic) try{game.customMusic.pause();}catch{}
    const bestKey=`dragonDashBest:${game.level.id}`;
    localStorage.setItem(bestKey,'100');
    $('overlayTitle').textContent='LEVEL COMPLETE!';
    $('overlayBody').textContent=`${game.level.name} cleared in ${game.attempt} attempt${game.attempt===1?'':'s'}.`;
    if(!settings.practice && game.level.id!=='custom') {
      const levelNumber=Math.max(1,levels.findIndex(l=>l.id===game.level.id)+1);
      const seconds=Math.max(0,game.time);
      const score=levelNumber*1000000 + Math.max(0,500000-Math.floor(seconds*120)-Math.max(0,game.attempt-1)*5000);
      arcadeMessage({type:'score',gameId:'dragon-dash',boardId:'dragon-dash',score,metric:`Level ${levelNumber} · ${game.attempt} attempt${game.attempt===1?'':'s'} · ${seconds.toFixed(1)}s`,details:{levelId:game.level.id,level:levelNumber,attempts:game.attempt,seconds:Number(seconds.toFixed(2))},practice:false,custom:false});
    }
    $('resumeButton').textContent='PLAY AGAIN';
    $('gameOverlay').classList.remove('hidden');
  }

  function teleportPlayer(link, role='entry'){
    if(role==='exit') return false;
    const p=game.player;
    const target=game.level.objects.find(x=>x.type==='portal'&&x.teleport===link&&x.teleportRole==='exit') || game.level.objects.find(x=>x.type==='teleportTarget'&&x.group===link);
    if(!target) return false;
    p.x=(target.x||p.x)+50*p.direction;
    p.y=clamp((target.y||p.y)-PLAYER_BASE*p.size/2,CEILING_Y,GROUND_Y-PLAYER_BASE*p.size);
    p.vy*=.35; game.cameraX=Math.max(0,p.x-(p.direction>0?300:980));
    game.shakePower=settings.shake?8:0; addParticles(p.x,p.y,22,'portal'); return true;
  }

  function applyPortal(o) {
    const key=`${o.type}:${o.x}:${o.y}:${o.teleport||''}:${o.teleportRole||''}`;
    if (game.portalSeen.has(key)) return;
    game.portalSeen.add(key);
    const p=game.player;
    if (o.teleport) teleportPlayer(o.teleport,o.teleportRole);
    if (o.mode) { p.mode=o.mode; p.vy=0; p.onGround=false; p.dashTime=0; }
    if (o.gravity) { p.gravity=o.gravity; p.vy*=.25; }
    if (o.speed) p.vx=SPEEDS[o.speed] || SPEEDS.normal;
    if (o.size) { const old=PLAYER_BASE*p.size;p.size=o.size;p.y+=(old-PLAYER_BASE*p.size)*(p.gravity>0?1:0); }
    if (o.reverse) { p.direction*=-1; p.rotation*=-1; }
    if (typeof o.freeFly==='boolean') p.freeFly=o.freeFly;
    audio.portal(); game.shakePower=settings.shake?5:0;
    addParticles(o.x,o.y,15,'portal');
  }

  function triggerOrb(o) {
    const p=game.player;
    const key=`${o.x}:${o.y}:${o.orb}`;
    if (game.orbLock===key) return false;
    const pr=playerRect();
    const cx=pr.x+pr.w/2, cy=pr.y+pr.h/2;
    if (pointDist(cx,cy,o.x,o.y)>72) return false;
    if (o.orb==='blue') { p.gravity*=-1; p.vy=-520*p.gravity; }
    else if (o.orb==='pink') p.vy=-560*p.gravity;
    else if (o.orb==='green') { p.gravity*=-1; p.vy=-690*p.gravity; }
    else if (o.orb==='red') p.vy=-940*p.gravity;
    else if (o.orb==='black') p.vy=760*p.gravity;
    else if (o.orb==='dash'||o.orb==='gravitydash') {
      if(o.orb==='gravitydash') p.gravity*=-1;
      p.dashTime=.58; p.dashAngle=(Number(o.angle)||0)*Math.PI/180; p.vy=Math.sin(p.dashAngle)*p.vx*1.25; p.onGround=false;
    }
    else if (o.orb==='spider') { trySpiderTeleport(); }
    else if (o.orb==='teleport') { teleportPlayer(o.targetGroup||o.group||'A','entry'); }
    else p.vy=-760*p.gravity;
    p.onGround=false; game.orbLock=key; audio.orb(); addParticles(o.x,o.y,12,'orb');
    return true;
  }

  function triggerPad(o) {
    const key=`${o.x}:${o.y}:${o.pad}`;
    if (game.padSeen.has(key)) return;
    const p=game.player;
    if (o.pad==='blue') { p.gravity*=-1; p.vy=-620*p.gravity; }
    else if (o.pad==='pink') p.vy=-620*p.gravity;
    else if (o.pad==='red') p.vy=-1050*p.gravity;
    else p.vy=-850*p.gravity;
    p.onGround=false; game.padSeen.add(key); audio.orb(); addParticles(o.x+35,o.y,10,'orb');
  }

  function nearestSurfaceY(p,newGravity){
    const size=PLAYER_BASE*p.size, cx=p.x+size/2;
    if(newGravity<0){
      let best=CEILING_Y;
      for(const o of game.level.objects){if(!['block','movingBlock','rotatingBlock'].includes(o.type))continue;const r=objectRect(o);if(cx>=r.x&&cx<=r.x+r.w&&r.y+r.h<p.y+size/2)best=Math.max(best,r.y+r.h);}
      return best;
    }
    let best=GROUND_Y-size;
    for(const o of game.level.objects){if(!['block','movingBlock','rotatingBlock'].includes(o.type))continue;const r=objectRect(o);if(cx>=r.x&&cx<=r.x+r.w&&r.y>p.y+size/2)best=Math.min(best,r.y-size);}
    return best;
  }

  function trySpiderTeleport() {
    const p=game.player;
    p.gravity*=-1;
    p.y=nearestSurfaceY(p,p.gravity);
    p.vy=0; p.onGround=true; audio.portal(); game.shakePower=settings.shake?6:0;
  }

  function activateTrigger(o,fromSpawn=false){
    const key=o._uid||`${o.x}:${o.trigger}:${o.targetGroup||''}`;
    if(!fromSpawn && game.triggerSeen.has(key)) return;
    if(!o.multi) game.triggerSeen.add(key);
    const group=o.targetGroup||o.group||'';
    if(o.trigger==='move'){
      for(const x of game.level.objects.filter(x=>x.group===group && x!==o)) x._tween={t:0,d:Math.max(.05,o.duration||1),sx:x.x,sy:x.y,ex:x.x+(o.dx||0),ey:x.y+(o.dy||0)};
    } else if(o.trigger==='rotate'){
      for(const x of game.level.objects.filter(x=>x.group===group && x!==o)) x._rotateTween={t:0,d:Math.max(.05,o.duration||1),sr:x.rotation||0,er:(x.rotation||0)+(Number(o.degrees)||90)*Math.PI/180};
    } else if(o.trigger==='spawn'){
      for(const x of game.level.objects.filter(x=>x.type==='trigger'&&x.group===group)) activateTrigger(x,true);
    } else if(o.trigger==='camera'){
      game.cameraZoomTarget=clamp(Number(o.zoom)||1,.55,1.8);game.cameraOffsetXTarget=Number(o.offsetX)||0;game.cameraOffsetYTarget=Number(o.offsetY)||0;
    }
  }

  function updateObjectTweens(dt){
    for(const o of game.level.objects){
      if(o._tween){const q=o._tween;q.t=Math.min(q.d,q.t+dt);const e=q.t/q.d;const k=e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2;o.x=lerp(q.sx,q.ex,k);o.y=lerp(q.sy,q.ey,k);if(e>=1)delete o._tween;}
      if(o._rotateTween){const q=o._rotateTween;q.t=Math.min(q.d,q.t+dt);const e=q.t/q.d;o.rotation=lerp(q.sr,q.er,e);if(e>=1)delete o._rotateTween;}
    }
  }

  function slopeSurface(o,x){
    const w=o.w||160,h=o.h||80,t=clamp((x-o.x)/w,0,1);
    return o.dir==='down'?o.y+h*t:o.y+h*(1-t);
  }

  function updatePlayer(dt) {
    const p=game.player;
    if (!p || p.dead) return;
    const prev={x:p.x,y:p.y,w:PLAYER_BASE*p.size,h:PLAYER_BASE*p.size};

    if (p.onGround) p.groundGrace=GROUND_GRACE_SECONDS;
    else p.groundGrace=Math.max(0,(p.groundGrace||0)-dt);

    p.x += p.vx*p.direction*dt;
    p.onGround=false; p.standingOn=null;
    game.progressX=Math.max(game.progressX,p.x);

    let orbTriggered=false,actionTriggered=false;
    if (input.pressBuffer>0) {
      for (const o of game.level.objects) {
        if (o.type==='orb' && Math.abs(o.x-p.x)<115 && triggerOrb(o)) { orbTriggered=true; actionTriggered=true; break; }
      }
      if (!orbTriggered) {
        const canGroundJump=(p.groundGrace||0)>0;
        if (p.mode==='cube' && canGroundJump) { p.vy=-735*p.gravity; p.onGround=false; p.groundGrace=0; audio.jump(); actionTriggered=true; }
        else if (p.mode==='robot' && canGroundJump) { p.vy=-750*p.gravity; p.jumpHold=.22; p.groundGrace=0; audio.jump(); actionTriggered=true; }
        else if (p.mode==='ufo') { p.vy=-470*p.gravity; audio.jump(); actionTriggered=true; }
        else if (p.mode==='ball') { p.gravity*=-1; p.vy=100*p.gravity; audio.portal(); actionTriggered=true; }
        else if (p.mode==='spider') { trySpiderTeleport(); actionTriggered=true; }
        else if (p.mode==='swing') { p.gravity*=-1; p.vy*=.25; audio.portal(); actionTriggered=true; }
        else if (p.mode==='ship' || p.mode==='wave') actionTriggered=true;
      }
      if (actionTriggered) consumePendingPress();
    }

    if (game.orbLock) {
      const parts=game.orbLock.split(':');const ox=Number(parts[0]),oy=Number(parts[1]);
      if (pointDist(p.x,p.y,ox,oy)>130) game.orbLock=null;
    }

    if(p.dashTime>0){
      p.dashTime=Math.max(0,p.dashTime-dt);p.vy=Math.sin(p.dashAngle)*p.vx*1.25;p.rotation=p.dashAngle;
    } else if (p.mode==='ship') {
      const accel = input.held ? -1650*p.gravity : 900*p.gravity;
      p.vy += accel*dt; p.vy=clamp(p.vy,-520,520); p.rotation=clamp(p.vy/700,-.55,.55);
    } else if (p.mode==='swing') {
      p.vy += 1080*p.gravity*dt; p.vy=clamp(p.vy,-480,480); p.rotation=clamp(p.vy/850,-.45,.45);
    } else if (p.mode==='wave') {
      p.vy=(input.held?-1:1)*p.vx*.82*p.gravity; p.rotation=(input.held?-1:1)*.78*p.gravity;
    } else if (p.mode==='spider') {
      p.vy=0; p.rotation=0;
    } else {
      const grav = (p.mode==='ufo'?1250:p.mode==='ball'?1500:2100)*(p.gravityStrength||1);
      p.vy += grav*p.gravity*dt;
      if (p.mode==='robot' && input.held && p.jumpHold>0 && p.vy*p.gravity<0) { p.vy-=1450*p.gravity*dt; p.jumpHold-=dt; }
      if (!input.held) p.jumpHold=0;
      if (p.mode==='cube' || p.mode==='robot') p.rotation += p.vx*dt*.006*p.gravity*p.direction;
      if (p.mode==='ball') p.rotation += p.vx*dt*.008*p.gravity*p.direction;
      if (p.mode==='ufo') p.rotation=lerp(p.rotation,clamp(p.vy/700,-.35,.35),.12);
    }
    p.y += p.vy*dt;

    const size=PLAYER_BASE*p.size;
    const flight=['ship','wave','ufo','swing'].includes(p.mode);
    if (!flight) {
      if (p.gravity>0 && p.y+size>=GROUND_Y && prev.y+prev.h<=GROUND_Y+8) { p.y=GROUND_Y-size; p.vy=0; p.onGround=true; if(p.mode==='cube'||p.mode==='robot') p.rotation=Math.round(p.rotation/(Math.PI/2))*(Math.PI/2); }
      if (p.gravity<0 && p.y<=CEILING_Y && prev.y>=CEILING_Y-8) { p.y=CEILING_Y; p.vy=0; p.onGround=true; if(p.mode==='cube'||p.mode==='robot') p.rotation=Math.round(p.rotation/(Math.PI/2))*(Math.PI/2); }
    } else if(!p.freeFly) {
      if (p.y+size>=GROUND_Y || p.y<=CEILING_Y) { killPlayer('Boundary'); return; }
    } else if(p.y+size>H-15 || p.y<15){ killPlayer('Outer Boundary'); return; }

    let pr=playerRect();
    for (const o of game.level.objects) {
      if (Math.abs(o.x-p.x)>180 && !['trigger','movingBlock','rotatingBlock'].includes(o.type)) continue;
      if(o._disabled)continue;
      if (o.type==='portal' && o.teleportRole!=='exit' && rectsOverlap(pr,objectRect(o))) applyPortal(o);
      else if (o.type==='pad' && rectsOverlap(pr,objectRect(o))) triggerPad(o);
      else if (o.type==='trigger' && !o.spawnOnly && rectsOverlap(pr,objectRect(o))) activateTrigger(o,false);
      else if (o.type==='finish' && rectsOverlap(pr,objectRect(o))) { completeLevel(); return; }
      else if (o.type==='spike' && rectsOverlap(pr,objectRect(o))) { killPlayer('Spike'); return; }
      else if (o.type==='saw') {
        const cx=pr.x+pr.w/2,cy=pr.y+pr.h/2,r=(o.r||32)*.82;
        if(pointDist(cx,cy,o.x,o.y)<r+Math.min(pr.w,pr.h)*.34){killPlayer('Saw');return;}
      } else if (o.type==='slope') {
        const cx=pr.x+pr.w/2;if(cx>=o.x&&cx<=o.x+(o.w||160)&&p.gravity>0){const sy=slopeSurface(o,cx);if(prev.y+prev.h<=sy+12&&p.y+pr.h>=sy&&p.vy>=0){p.y=sy-pr.h;p.vy=0;p.onGround=true;p.rotation=Math.atan2((o.dir==='down'?1:-1)*(o.h||80),o.w||160);pr=playerRect();}}
      } else if (['block','movingBlock','rotatingBlock'].includes(o.type) && rectsOverlap(pr,objectRect(o))) {
        if (flight) { killPlayer('Block'); return; }
        const b=objectRect(o),wasAbove=prev.y+prev.h<=b.y+12,wasBelow=prev.y>=b.y+b.h-12;
        if (p.gravity>0 && wasAbove && p.vy>=0) { p.y=b.y-pr.h; p.vy=0; p.onGround=true;p.standingOn=o._uid; }
        else if (p.gravity<0 && wasBelow && p.vy<=0) { p.y=b.y+b.h; p.vy=0; p.onGround=true;p.standingOn=o._uid; }
        else { killPlayer('Wall'); return; }
      }
    }

    if (p.y>H+150 || p.y<-150 || p.x<-250) { killPlayer('Void'); return; }
    if (settings.practice && Math.abs(p.x-game.lastAutoCheckpointX)>900 && p.onGround) saveCheckpoint(false);
    if (settings.particles && Math.random()<.55) addParticles(p.x+size*.25,p.y+size*.75,1,'trail');
  }

  function updateParticles(dt) {
    for (const q of game.particles) { q.x+=q.vx*dt; q.y+=q.vy*dt; q.vy+=250*dt; q.life-=dt; }
    game.particles=game.particles.filter(q=>q.life>0);
  }

  function update(dt) {
    if (game.state!=='playing') return;
    game.time+=dt;
    if(!game.customMusic) audio.tick(game.time,game.level.beat||.24);
    updateObjectTweens(dt);
    updatePlayer(dt);
    updateParticles(dt);
    if(game.player){
      const anchor=game.player.direction>0?300:980;
      const target=Math.max(0,game.player.x-anchor+game.cameraOffsetX);
      game.cameraX=lerp(game.cameraX,target,.11);
    }
    game.cameraZoom=lerp(game.cameraZoom,game.cameraZoomTarget,.08);
    game.cameraOffsetX=lerp(game.cameraOffsetX,game.cameraOffsetXTarget,.08);
    game.cameraOffsetY=lerp(game.cameraOffsetY,game.cameraOffsetYTarget,.08);
    game.shakePower*=.86;
    input.pressBuffer=Math.max(0,input.pressBuffer-dt);
    input.pressed=false; input.released=false;
  }

  function loop(ts) {
    if (game.state==='stopped') return;
    const delta=Math.min(.05,(ts-game.lastTs)/1000||0); game.lastTs=ts;
    game.accumulator+=delta;
    const step=1/120;
    let guard=0;
    while(game.accumulator>=step && guard++<8){update(step);game.accumulator-=step;}
    render();
    requestAnimationFrame(loop);
  }

  function theme() { return game.level?.theme || ['#123c88','#061b42','#55d9ff']; }

  function renderBackground(c, cam, t, editor=false) {
    const [a,b,accent]=theme();
    const g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,a); g.addColorStop(1,b); c.fillStyle=g; c.fillRect(0,0,W,H);
    const pulse=settings.comfort?.5:.5+.5*Math.sin(t*2*Math.PI/(game.level?.beat||.24)/4);
    c.globalAlpha=settings.comfort?.055:.07+.05*pulse; c.fillStyle='#fff';
    const cell=80; const off=-(cam*(settings.comfort?.05:.18))%cell;
    for(let x=off;x<W;x+=cell)c.fillRect(x,0,2,H);
    for(let y=50;y<H;y+=cell)c.fillRect(0,y,W,2);
    c.globalAlpha=.13;
    c.fillStyle=accent;
    c.beginPath(); c.moveTo(0,GROUND_Y);
    for(let x=0;x<=W+160;x+=160){ const wx=x+cam*(settings.comfort?.02:.08); const peak=360+Math.sin(wx*.004)*70+Math.sin(wx*.009)*35; c.lineTo(x,peak); c.lineTo(x+80,GROUND_Y); }
    c.closePath(); c.fill();
    c.globalAlpha=1;
    c.fillStyle='rgba(3,9,22,.72)'; c.fillRect(0,GROUND_Y,W,H-GROUND_Y);
    c.fillStyle='rgba(255,255,255,.08)';
    const goff=-(cam)%TILE; for(let x=goff;x<W;x+=TILE)c.fillRect(x,GROUND_Y,2,H-GROUND_Y);
    for(let y=GROUND_Y;y<H;y+=TILE)c.fillRect(0,y,W,2);
    c.fillStyle=accent; c.globalAlpha=.55; c.fillRect(0,GROUND_Y,W,4); c.globalAlpha=1;
    if(!editor){ c.fillStyle='rgba(255,255,255,.14)'; c.fillRect(0,CEILING_Y-3,W,3); }
  }

  function drawBlock(c,x,y,w=TILE,h=TILE,alpha=1) {
    c.save(); c.globalAlpha=alpha;
    const g=c.createLinearGradient(x,y,x+w,y+h); g.addColorStop(0,'#5fe7ff');g.addColorStop(1,'#315bd6');
    c.fillStyle=g;c.fillRect(x,y,w,h);c.strokeStyle='#e9fbff';c.lineWidth=3;c.strokeRect(x+1.5,y+1.5,w-3,h-3);
    c.strokeStyle='rgba(0,20,80,.65)';c.lineWidth=5;c.strokeRect(x+8,y+8,w-16,h-16);
    c.beginPath();c.moveTo(x+w/2,y+10);c.lineTo(x+w-10,y+h/2);c.lineTo(x+w/2,y+h-10);c.lineTo(x+10,y+h/2);c.closePath();c.strokeStyle='rgba(255,255,255,.34)';c.lineWidth=2;c.stroke();c.restore();
  }
  function drawSpike(c,x,y,w=TILE,h=TILE) { c.save(); const g=c.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'#fff');g.addColorStop(1,'#3a74ff');c.fillStyle=g;c.strokeStyle='#eaf8ff';c.lineWidth=3;c.beginPath();c.moveTo(x+4,y+h);c.lineTo(x+w/2,y+3);c.lineTo(x+w-4,y+h);c.closePath();c.fill();c.stroke();c.restore(); }
  function drawSaw(c,x,y,r=32,t=0) { c.save();c.translate(x,y);c.rotate(t*2);c.fillStyle='#eaf4ff';c.strokeStyle='#5f79b9';c.lineWidth=3;c.beginPath();for(let i=0;i<24;i++){const a=i*Math.PI/12,rr=i%2?r*.75:r;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();c.stroke();c.fillStyle='#16356e';c.beginPath();c.arc(0,0,r*.35,0,Math.PI*2);c.fill();c.fillStyle='#b9d8ff';c.beginPath();c.arc(0,0,r*.12,0,Math.PI*2);c.fill();c.restore(); }
  function drawOrb(c,o,cam,t) { const x=o.x-cam,y=o.y; const map={yellow:['#fff45f','#ff9e26'],blue:['#7de8ff','#2868ff'],pink:['#ff9dea','#ff3ba5'],green:['#a8ff6d','#34c65a'],red:['#ff857d','#d72d2d'],black:['#bbbfd0','#171923'],dash:['#80ff8d','#16a357'],gravitydash:['#ff9eea','#8c39c7'],spider:['#d9ff66','#8aae1f'],teleport:['#ffd477','#ff7147']};const [a,b]=map[o.orb]||map.yellow;c.save();c.shadowBlur=settings.comfort?8:12+5*Math.sin(t*7);c.shadowColor=a;c.fillStyle=a;c.beginPath();c.arc(x,y,24,0,Math.PI*2);c.fill();c.shadowBlur=0;c.fillStyle=b;c.beginPath();c.arc(x,y,13,0,Math.PI*2);c.fill();c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=3;c.beginPath();c.arc(x,y,19,0,Math.PI*2);c.stroke();c.restore(); }
  function drawPad(c,o,cam) { const x=o.x-cam,y=o.y;const map={yellow:['#fff45f','#ff9e26'],blue:['#7de8ff','#2868ff'],pink:['#ff9dea','#ff3ba5'],red:['#ff857d','#d72d2d']};const [a,b]=map[o.pad]||map.yellow;c.save();c.fillStyle=a;c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.moveTo(x,y+20);c.lineTo(x+14,y);c.lineTo(x+56,y);c.lineTo(x+70,y+20);c.closePath();c.fill();c.stroke();c.strokeStyle=b;c.lineWidth=6;c.beginPath();c.moveTo(x+18,y+15);c.lineTo(x+35,y+4);c.lineTo(x+52,y+15);c.stroke();c.restore(); }
  function portalColor(o){ if(o.mode){return {cube:'#5cf47d',ship:'#ff72d6',ball:'#ffca4c',ufo:'#a67dff',wave:'#66f7ff',robot:'#ff8b55',spider:'#e9f24b',swing:'#77ffb0'}[o.mode]||'#fff';} if(o.teleport)return o.teleportRole==='exit'?'#ff983d':'#56a8ff'; if(o.reverse)return '#ff6e95'; if(o.size)return o.size<1?'#ff82e9':'#71ff9b'; if(typeof o.freeFly==='boolean')return o.freeFly?'#a77cff':'#78dfff'; if(o.gravity)return o.gravity<0?'#69a8ff':'#ffd758'; if(o.speed)return {slow:'#7ae4ff',normal:'#72f79b',fast:'#ffcf57',faster:'#ff6f5f',fastest:'#c77cff'}[o.speed]; return '#fff';}
  function drawPortal(c,o,cam,t){const x=o.x-cam,y=o.y,col=portalColor(o);c.save();c.translate(x,y);c.shadowBlur=16;c.shadowColor=col;c.strokeStyle=col;c.lineWidth=7;c.beginPath();c.ellipse(0,0,25,68,0,0,Math.PI*2);c.stroke();c.shadowBlur=0;c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2;c.beginPath();c.ellipse(0,0,14,53,0,0,Math.PI*2);c.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4+(settings.comfort?0:t*1.5);c.fillStyle=col;c.fillRect(Math.cos(a)*31-3,Math.sin(a)*65-3,6,6);}c.restore();}
  function drawFinish(c,o,cam,t){const x=o.x-cam;c.save();c.globalAlpha=settings.comfort?.62:.55+.25*Math.sin(t*8);const g=c.createLinearGradient(x,CEILING_Y,x+30,GROUND_Y);g.addColorStop(0,'#fff');g.addColorStop(.5,'#7bffad');g.addColorStop(1,'#fff');c.fillStyle=g;c.fillRect(x,CEILING_Y,12,GROUND_Y-CEILING_Y);c.restore();}
  function drawSlope(c,o,cam){const x=o.x-cam,w=o.w||160,h=o.h||80;c.save();const g=c.createLinearGradient(x,o.y,x+w,o.y+h);g.addColorStop(0,'#65e9ff');g.addColorStop(1,'#315bd6');c.fillStyle=g;c.strokeStyle='#e9fbff';c.lineWidth=3;c.beginPath();if(o.dir==='down'){c.moveTo(x,o.y);c.lineTo(x+w,o.y+h);c.lineTo(x,o.y+h);}else{c.moveTo(x,o.y+h);c.lineTo(x+w,o.y);c.lineTo(x+w,o.y+h);}c.closePath();c.fill();c.stroke();c.restore();}
  function drawTrigger(c,o,cam){if(!document.getElementById('editorScreen')?.classList.contains('active'))return;const x=o.x-cam;c.save();c.globalAlpha=.7;c.strokeStyle='#ffe89a';c.setLineDash([5,5]);c.strokeRect(x-10,CEILING_Y,20,GROUND_Y-CEILING_Y);c.setLineDash([]);c.fillStyle='#ffe89a';c.font='10px system-ui';c.fillText((o.trigger||'TRG').toUpperCase(),x-18,CEILING_Y+18);c.restore();}
  function drawTarget(c,o,cam){const x=o.x-cam,y=o.y;c.save();c.strokeStyle='#ffb95e';c.lineWidth=3;c.beginPath();c.arc(x,y,15,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(x-20,y);c.lineTo(x+20,y);c.moveTo(x,y-20);c.lineTo(x,y+20);c.stroke();c.restore();}
  function drawDynamicBlock(c,o,cam,t){const r=dynamicRect(o,t);c.save();c.translate(r.x-cam+r.w/2,r.y+r.h/2);c.rotate((r.rotation||0)+(o.rotation||0));drawBlock(c,-r.w/2,-r.h/2,r.w,r.h);c.restore();}
  function drawObject(c,o,cam,t){const x=o.x-cam;if(x<-300||x>W+300)return;if(o.type==='block'){c.save();const w=o.w||TILE,h=o.h||TILE;c.translate(x+w/2,o.y+h/2);c.rotate(o.rotation||0);drawBlock(c,-w/2,-h/2,w,h,o.alpha??1);c.restore();}else if(o.type==='movingBlock'||o.type==='rotatingBlock')drawDynamicBlock(c,o,cam,t);else if(o.type==='slope')drawSlope(c,o,cam);else if(o.type==='spike')drawSpike(c,x,o.y,o.w||TILE,o.h||TILE);else if(o.type==='saw')drawSaw(c,x,o.y,o.r||32,t);else if(o.type==='orb')drawOrb(c,o,cam,t);else if(o.type==='pad')drawPad(c,o,cam);else if(o.type==='portal')drawPortal(c,o,cam,t);else if(o.type==='teleportTarget')drawTarget(c,o,cam);else if(o.type==='trigger')drawTrigger(c,o,cam);else if(o.type==='finish')drawFinish(c,o,cam,t);}

  function drawPlayer(c,p,cam) {
    const s=PLAYER_BASE*p.size,x=p.x-cam+s/2,y=p.y+s/2;
    c.save();c.translate(x,y);c.rotate(p.rotation);c.lineWidth=3;c.strokeStyle='#f6feff';
    if(p.mode==='cube'||p.mode==='robot'){
      // Dragonswood dragon-cube visual. Physics/hitbox stays the exact same square.
      const g=c.createLinearGradient(-s/2,-s/2,s/2,s/2);g.addColorStop(0,'#82ddc4');g.addColorStop(1,'#176b60');
      c.fillStyle='#2a8171';c.strokeStyle='#ffe89a';c.lineWidth=Math.max(2,s*.065);
      // horns
      c.beginPath();c.moveTo(-s*.31,-s*.45);c.lineTo(-s*.48,-s*.76);c.lineTo(-s*.12,-s*.51);c.closePath();c.fill();c.stroke();
      c.beginPath();c.moveTo(s*.31,-s*.45);c.lineTo(s*.48,-s*.76);c.lineTo(s*.12,-s*.51);c.closePath();c.fill();c.stroke();
      // tiny animated wings outside the collision square; visual only, hitbox is untouched.
      const wingBeat=Math.sin(game.time*(p.onGround?9:14))*s*(settings.comfort?.018:(p.onGround?.045:.075));
      c.beginPath();c.moveTo(-s*.46,-s*.08);c.lineTo(-s*.76,-s*.31-wingBeat);c.lineTo(-s*.66,s*.15-wingBeat*.35);c.lineTo(-s*.47,s*.22);c.closePath();c.fill();c.stroke();
      c.beginPath();c.moveTo(s*.46,-s*.08);c.lineTo(s*.76,-s*.31-wingBeat);c.lineTo(s*.66,s*.15-wingBeat*.35);c.lineTo(s*.47,s*.22);c.closePath();c.fill();c.stroke();
      // tail
      c.beginPath();c.moveTo(s*.45,s*.23);c.quadraticCurveTo(s*.82,s*.30,s*.72,s*.58);c.quadraticCurveTo(s*.61,s*.42,s*.43,s*.43);c.closePath();c.fill();c.stroke();
      c.fillStyle=g;c.fillRect(-s/2,-s/2,s,s);c.strokeStyle='#ffe89a';c.strokeRect(-s/2,-s/2,s,s);
      // crown ridge
      c.fillStyle='#d4aa4c';c.beginPath();c.moveTo(-s*.15,-s*.49);c.lineTo(0,-s*.72);c.lineTo(s*.15,-s*.49);c.closePath();c.fill();
      // eyes
      c.fillStyle='#071d19';c.fillRect(-s*.27,-s*.22,s*.18,s*.18);c.fillRect(s*.08,-s*.22,s*.18,s*.18);c.fillStyle='#fff0a5';c.fillRect(-s*.22,-s*.18,s*.06,s*.06);c.fillRect(s*.13,-s*.18,s*.06,s*.06);
      // block snout
      c.fillStyle='#246f63';c.strokeStyle='#092a25';c.lineWidth=Math.max(2,s*.055);c.fillRect(-s*.19,s*.02,s*.38,s*.22);c.strokeRect(-s*.19,s*.02,s*.38,s*.22);
      c.strokeStyle='#ffe89a';c.lineWidth=Math.max(2,s*.05);c.beginPath();c.moveTo(-s*.11,s*.10);c.lineTo(-s*.05,s*.10);c.moveTo(s*.05,s*.10);c.lineTo(s*.11,s*.10);c.stroke();
      c.strokeStyle='#071d19';c.lineWidth=Math.max(2,s*.065);c.beginPath();c.moveTo(-s*.21,s*.33);c.quadraticCurveTo(0,s*.43,s*.21,s*.33);c.stroke();
      if(p.mode==='robot'){c.fillStyle='#ffe89a';c.fillRect(-s*.31,s*.5-2,s*.20,7);c.fillRect(s*.11,s*.5-2,s*.20,7);}}
    else if(p.mode==='ship'){c.fillStyle='#ff73d8';c.beginPath();c.moveTo(s*.55,0);c.lineTo(-s*.42,-s*.35);c.lineTo(-s*.32,0);c.lineTo(-s*.42,s*.35);c.closePath();c.fill();c.stroke();c.fillStyle='#74f3ff';c.fillRect(-s*.15,-s*.18,s*.24,s*.36);c.fillStyle='#ffd54c';c.beginPath();c.moveTo(-s*.45,-s*.18);c.lineTo(-s*.75,0);c.lineTo(-s*.45,s*.18);c.closePath();c.fill();}
    else if(p.mode==='ball'){c.fillStyle='#ffca4c';c.beginPath();c.arc(0,0,s*.5,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle='#6b4300';c.lineWidth=5;c.beginPath();c.arc(0,0,s*.28,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(-s*.45,0);c.lineTo(s*.45,0);c.moveTo(0,-s*.45);c.lineTo(0,s*.45);c.stroke();}
    else if(p.mode==='ufo'){c.fillStyle='#9c7bff';c.beginPath();c.ellipse(0,s*.08,s*.52,s*.24,0,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#75efff';c.beginPath();c.arc(0,-s*.12,s*.25,Math.PI,0);c.fill();c.stroke();}
    else if(p.mode==='swing'){const flap=Math.sin(game.time*(settings.comfort?7:18))*(settings.comfort?.09:.22);c.fillStyle='#62dca8';c.strokeStyle='#ffe89a';c.beginPath();c.arc(0,0,s*.26,0,Math.PI*2);c.fill();c.stroke();c.save();c.rotate(flap);c.beginPath();c.moveTo(-s*.12,0);c.lineTo(-s*.58,-s*.28);c.lineTo(-s*.48,s*.16);c.closePath();c.fill();c.stroke();c.restore();c.save();c.rotate(-flap);c.beginPath();c.moveTo(s*.12,0);c.lineTo(s*.58,-s*.28);c.lineTo(s*.48,s*.16);c.closePath();c.fill();c.stroke();c.restore();c.fillStyle='#ffe89a';c.fillRect(-s*.10,-s*.36,s*.07,s*.16);c.fillRect(s*.03,-s*.36,s*.07,s*.16);}
    else if(p.mode==='wave'){c.fillStyle='#63f6ff';c.beginPath();c.moveTo(s*.55,0);c.lineTo(-s*.45,-s*.34);c.lineTo(-s*.18,0);c.lineTo(-s*.45,s*.34);c.closePath();c.fill();c.stroke();}
    else if(p.mode==='spider'){c.fillStyle='#e4ef4f';c.rotate(Math.PI/4);c.fillRect(-s*.34,-s*.34,s*.68,s*.68);c.strokeRect(-s*.34,-s*.34,s*.68,s*.68);c.strokeStyle='#e4ef4f';c.lineWidth=4;for(let i=0;i<4;i++){const sy=(i<2?-1:1)*s*.18;const sx=(i%2?-1:1)*s*.18;c.beginPath();c.moveTo(sx,sy);c.lineTo(sx*2.2,sy*1.8);c.lineTo(sx*2.5,sy*2.5);c.stroke();}}
    c.restore();
  }

  function render() {
    if (!game.level || !game.player) return;
    const sx=settings.shake&&!settings.comfort?(Math.random()-.5)*game.shakePower:0, sy=settings.shake&&!settings.comfort?(Math.random()-.5)*game.shakePower:0;
    ctx.save();ctx.translate(sx,sy);ctx.translate(W/2,H/2);ctx.scale(game.cameraZoom,game.cameraZoom);ctx.translate(-W/2,-H/2+game.cameraOffsetY);
    renderBackground(ctx,game.cameraX,game.time);
    const ordered=[...game.level.objects].sort((a,b)=>(a.layer||0)-(b.layer||0));
    for(const o of ordered) drawObject(ctx,o,game.cameraX,game.time);
    for(const q of game.particles){ctx.globalAlpha=clamp(q.life/q.max,0,1);ctx.fillStyle=q.kind==='death'?'#f9fbff':q.kind==='checkpoint'?'#ffe663':'#7cf7ff';ctx.fillRect(q.x-game.cameraX,q.y,q.size,q.size);}ctx.globalAlpha=1;
    if(!game.player.dead) drawPlayer(ctx,game.player,game.cameraX);
    if(settings.hitboxes){ctx.strokeStyle='#ff4343';ctx.lineWidth=2;const pr=playerRect();ctx.strokeRect(pr.x-game.cameraX,pr.y,pr.w,pr.h);for(const o of game.level.objects){if(Math.abs(o.x-game.player.x)<700){const r=objectRect(o);ctx.strokeRect(r.x-game.cameraX,r.y,r.w,r.h);}}}
    ctx.restore();
    const percent=clamp((game.progressX/(game.level.length||1))*100,0,100);$('progressBar').style.width=`${percent}%`;$('progressText').textContent=`${Math.floor(percent)}%`;$('modeText').textContent=`${game.player.mode.toUpperCase()}${game.player.size<1?' · MINI':''}${game.player.direction<0?' · REV':''}`;
  }

  function pauseGame() {
    if(game.state==='playing'){game.state='paused';if(game.customMusic)try{game.customMusic.pause();}catch{};$('overlayTitle').textContent='PAUSED';$('overlayBody').textContent='The square has been temporarily spared.';$('resumeButton').textContent='RESUME';$('gameOverlay').classList.remove('hidden');}
    else if(game.state==='paused') resumeGame();
  }
  function resumeGame(){if(game.state==='paused'){game.state='playing';game.lastTs=performance.now();if(game.customMusic)try{game.customMusic.play().catch(()=>{});}catch{};$('gameOverlay').classList.add('hidden');}}

  function toast(text){const el=document.createElement('div');el.textContent=text;Object.assign(el.style,{position:'fixed',left:'50%',bottom:'26px',transform:'translateX(-50%)',zIndex:1000,padding:'10px 14px',borderRadius:'10px',background:'rgba(0,0,0,.75)',color:'#fff',fontWeight:'800',pointerEvents:'none'});document.body.appendChild(el);setTimeout(()=>el.remove(),900);}

  function renderLevelCards(){const host=$('levelCards');host.innerHTML='';for(const l of levels){const best=localStorage.getItem(`dragonDashBest:${l.id}`)||'0';const card=document.createElement('button');card.className='level-card';card.innerHTML=`<h3>${escapeHtml(l.name)}</h3><p>${escapeHtml(l.description)}</p><span class="difficulty">${escapeHtml(l.difficulty)}</span><p style="margin-top:9px">Best: ${escapeHtml(best)}%</p>`;card.onclick=()=>startLevel(l,false);host.appendChild(card);}const saved=loadEditorData(false);if(saved&&saved.objects.length){const card=document.createElement('button');card.className='level-card';card.innerHTML='<h3>My Custom Level</h3><p>Your locally saved editor level.</p><span class="difficulty">CUSTOM</span>';card.onclick=()=>startLevel(editorLevelFromData(saved),true);host.appendChild(card);}}

  const editor={selected:'block',scrollX:0,objects:[],keys:new Set(),mode:'place',selection:new Set(),drag:null,grid:TILE,meta:{}};
  const paletteItems=[
    ['block','Block'],['spike','Spike'],['saw','Saw'],['slopeUp','Slope ↑'],['slopeDown','Slope ↓'],['movingBlock','Moving Platform'],['rotatingBlock','Rotating Platform'],
    ['orbYellow','Yellow Orb'],['orbPink','Pink Orb'],['orbRed','Red Orb'],['orbBlue','Blue Orb'],['orbGreen','Green Orb'],['orbBlack','Black Orb'],['orbDash','Dash Orb'],['orbGravitydash','Gravity Dash'],['orbSpider','Spider Orb'],['orbTeleport','Teleport Orb'],
    ['padYellow','Yellow Pad'],['padPink','Pink Pad'],['padRed','Red Pad'],['padBlue','Blue Pad'],
    ['portalCube','Cube'],['portalShip','Ship'],['portalBall','Ball'],['portalUfo','UFO'],['portalWave','Wave'],['portalRobot','Robot'],['portalSpider','Spider'],['portalSwing','Swing'],
    ['mini','Mini'],['full','Full Size'],['teleportEntry','Teleport In'],['teleportExit','Teleport Out'],['reverse','Reverse'],['freeFlyOn','Free Fly ON'],['freeFlyOff','Free Fly OFF'],
    ['gravityUp','Gravity ↑'],['gravityDown','Gravity ↓'],['speedFast','Speed +'],['speedFaster','Speed ++'],['speedFastest','Speed +++'],['speedNormal','Speed Normal'],
    ['triggerMove','Move Trigger'],['triggerRotate','Rotate Trigger'],['triggerSpawn','Spawn Trigger'],['triggerCamera','Camera Trigger'],['teleportTarget','Teleport Target'],['finish','Finish']
  ];
  function val(id,fallback=''){const e=$(id);return e?e.value:fallback;}
  function num(id,fallback=0){const n=Number(val(id,fallback));return Number.isFinite(n)?n:fallback;}
  function currentProps(){return{group:String(val('editorGroup','1')).trim()||'1',layer:clamp(Math.round(num('editorLayer',0)),-9,9),dx:num('editorMoveX',120),dy:num('editorMoveY',0),duration:clamp(num('editorDuration',1),.1,10),degrees:num('editorRotation',90),link:String(val('editorLink','A')).trim()||'A',zoom:clamp(num('editorZoom',1.15),.55,1.8),offsetX:num('editorCameraX',0),offsetY:num('editorCameraY',0)};}
  function setupPalette(){const host=$('palette');host.innerHTML='';for(const [id,label] of paletteItems){const b=document.createElement('button');b.className='chip';b.textContent=label;b.dataset.item=id;b.onclick=()=>{editor.mode='place';$('editorSelect')?.classList.remove('active');editor.selected=id;[...host.children].forEach(x=>x.classList.toggle('active',x===b));};if(id===editor.selected)b.classList.add('active');host.appendChild(b);}}
  function editorObject(item,x,y){const p=currentProps(),common={group:p.group,layer:p.layer};if(item==='block')return obj('block',x,y,common);if(item==='spike')return obj('spike',x,y,common);if(item==='saw')return obj('saw',x+20,y+20,{r:28,...common});if(item==='slopeUp'||item==='slopeDown')return obj('slope',x,y-40,{w:160,h:80,dir:item==='slopeUp'?'up':'down',...common});if(item==='movingBlock')return obj('movingBlock',x,y,{w:120,h:30,dx:p.dx,dy:p.dy,period:Math.max(.4,p.duration*2),...common});if(item==='rotatingBlock')return obj('rotatingBlock',x,y,{w:100,h:28,anchorX:x,anchorY:y,radius:Math.max(40,Math.abs(p.dx)||80),period:Math.max(.6,p.duration*2),...common});if(item.startsWith('orb')){const orb=item.replace('orb','').toLowerCase();return obj('orb',x+20,y+20,{orb,targetGroup:p.link,angle:p.degrees,...common});}if(item.startsWith('pad'))return obj('pad',x,y+18,{pad:item.replace('pad','').toLowerCase(),...common});if(item.startsWith('portal'))return obj('portal',x+20,y+20,{mode:item.replace('portal','').toLowerCase(),...common});if(item==='mini')return obj('portal',x+20,y+20,{size:.65,...common});if(item==='full')return obj('portal',x+20,y+20,{size:1,...common});if(item==='teleportEntry')return obj('portal',x+20,y+20,{teleport:p.link,teleportRole:'entry',...common});if(item==='teleportExit')return obj('portal',x+20,y+20,{teleport:p.link,teleportRole:'exit',...common});if(item==='reverse')return obj('portal',x+20,y+20,{reverse:true,...common});if(item==='freeFlyOn')return obj('portal',x+20,y+20,{freeFly:true,...common});if(item==='freeFlyOff')return obj('portal',x+20,y+20,{freeFly:false,...common});if(item==='gravityUp')return obj('portal',x+20,y+20,{gravity:-1,...common});if(item==='gravityDown')return obj('portal',x+20,y+20,{gravity:1,...common});if(item==='speedFast')return obj('portal',x+20,y+20,{speed:'fast',...common});if(item==='speedFaster')return obj('portal',x+20,y+20,{speed:'faster',...common});if(item==='speedFastest')return obj('portal',x+20,y+20,{speed:'fastest',...common});if(item==='speedNormal')return obj('portal',x+20,y+20,{speed:'normal',...common});if(item==='triggerMove')return obj('trigger',x,0,{trigger:'move',group:p.group,targetGroup:p.group,dx:p.dx,dy:p.dy,duration:p.duration,hidden:true,layer:p.layer});if(item==='triggerRotate')return obj('trigger',x,0,{trigger:'rotate',group:p.group,targetGroup:p.group,degrees:p.degrees,duration:p.duration,hidden:true,layer:p.layer});if(item==='triggerSpawn')return obj('trigger',x,0,{trigger:'spawn',targetGroup:p.group,hidden:true,layer:p.layer});if(item==='triggerCamera')return obj('trigger',x,0,{trigger:'camera',zoom:p.zoom,offsetX:p.offsetX,offsetY:p.offsetY,duration:p.duration,hidden:true,layer:p.layer});if(item==='teleportTarget')return obj('teleportTarget',x+20,y+20,{group:p.link,layer:p.layer});if(item==='finish')return obj('finish',x,y,{layer:p.layer});return obj('block',x,y,common);}
  function drawEditor(){if(!editorCanvas.isConnected)return;renderEditorBackground();const ordered=[...editor.objects].map((o,i)=>({o,i})).sort((a,b)=>(a.o.layer||0)-(b.o.layer||0));for(const {o,i} of ordered){drawObject(ectx,o,editor.scrollX,performance.now()/1000);if(editor.selection.has(i)){const r=objectRect(o,0);ectx.save();ectx.strokeStyle='#ffe89a';ectx.lineWidth=3;ectx.strokeRect(r.x-editor.scrollX-5,r.y-5,r.w+10,r.h+10);ectx.restore();}}ectx.fillStyle='rgba(255,255,255,.55)';ectx.font='14px system-ui';ectx.fillText(`World X: ${Math.round(editor.scrollX)} • Objects: ${editor.objects.length} • Selected: ${editor.selection.size}`,14,24);}
  function renderEditorBackground(){const old=game.level;game.level={theme:['#143b7d','#08182f','#5ae7ff'],beat:.24};renderBackground(ectx,editor.scrollX,0,true);game.level=old;ectx.strokeStyle='rgba(255,255,255,.09)';ectx.lineWidth=1;const off=-(editor.scrollX)%editor.grid;for(let x=off;x<W;x+=editor.grid){ectx.beginPath();ectx.moveTo(x,0);ectx.lineTo(x,editorCanvas.height);ectx.stroke();}for(let y=0;y<editorCanvas.height;y+=editor.grid){ectx.beginPath();ectx.moveTo(0,y);ectx.lineTo(W,y);ectx.stroke();}}
  function canvasPos(canvas,e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};}
  function nearestEditorObject(wx,wy){let best=-1,bd=999;editor.objects.forEach((o,i)=>{const r=objectRect(o,0),d=pointDist(wx,wy,r.x+r.w/2,r.y+r.h/2);if(d<bd){bd=d;best=i;}});return bd<85?best:-1;}
  function placeEditor(e){e.preventDefault();if(editor.mode==='select')return;const p=canvasPos(editorCanvas,e);const wx=Math.round((p.x+editor.scrollX)/editor.grid)*editor.grid;const wy=Math.round(p.y/editor.grid)*editor.grid;if(e.button===2){const best=nearestEditorObject(wx,wy);if(best>=0){editor.objects.splice(best,1);editor.selection.clear();}}else if(e.button===0){if(editor.selected==='finish')editor.objects=editor.objects.filter(o=>o.type!=='finish');editor.objects.push(editorObject(editor.selected,wx,wy));}drawEditor();}
  function selectPointerDown(e){if(editor.mode!=='select'||e.button!==0)return;e.preventDefault();const p=canvasPos(editorCanvas,e),wx=p.x+editor.scrollX,wy=p.y,idx=nearestEditorObject(wx,wy);if(idx<0){if(!e.shiftKey)editor.selection.clear();drawEditor();return;}if(e.shiftKey){editor.selection.has(idx)?editor.selection.delete(idx):editor.selection.add(idx);}else if(!editor.selection.has(idx)){editor.selection.clear();editor.selection.add(idx);}editor.drag={pointerId:e.pointerId,lastX:wx,lastY:wy};editorCanvas.setPointerCapture?.(e.pointerId);drawEditor();}
  function selectPointerMove(e){if(editor.mode!=='select'||!editor.drag||e.pointerId!==editor.drag.pointerId)return;const p=canvasPos(editorCanvas,e),wx=p.x+editor.scrollX,wy=p.y;const dx=wx-editor.drag.lastX,dy=wy-editor.drag.lastY;for(const i of editor.selection){const o=editor.objects[i];if(!o)continue;o.x+=dx;o.y+=dy;if(o.anchorX!=null)o.anchorX+=dx;if(o.anchorY!=null)o.anchorY+=dy;}editor.drag.lastX=wx;editor.drag.lastY=wy;drawEditor();}
  function selectPointerUp(e){if(editor.drag&&e.pointerId===editor.drag.pointerId)editor.drag=null;}
  function duplicateSelection(){if(!editor.selection.size){toast('Select an object first');return;}const added=[];for(const i of [...editor.selection]){const o=JSON.parse(JSON.stringify(editor.objects[i]));o.x+=editor.grid;if(o.anchorX!=null)o.anchorX+=editor.grid;editor.objects.push(o);added.push(editor.objects.length-1);}editor.selection=new Set(added);drawEditor();}
  function deleteSelection(){if(!editor.selection.size)return;editor.objects=editor.objects.filter((_,i)=>!editor.selection.has(i));editor.selection.clear();drawEditor();}
  function applySelectionProps(){const p=currentProps();for(const i of editor.selection){const o=editor.objects[i];if(!o)continue;o.group=p.group;o.layer=p.layer;}drawEditor();toast('Group/layer applied');}
  function collectMeta(){const raw=val('editorMusicUrl','').trim(),checked=validateMusicUrl(raw);return{name:val('editorLevelName','My Custom Level').slice(0,80),creator:val('editorCreator','Dragonswood Adventurer').slice(0,60),difficulty:val('editorDifficulty','Normal').slice(0,30),description:val('editorDescription','Built in the Dragon Dash editor.').slice(0,240),musicUrl:checked.ok?checked.url:'',musicUrlError:checked.ok?'':checked.error,musicOffset:Math.max(0,num('editorMusicOffset',0))};}
  function applyMeta(meta={}){if($('editorLevelName'))$('editorLevelName').value=meta.name||'My Custom Level';if($('editorCreator'))$('editorCreator').value=meta.creator||'Dragonswood Adventurer';if($('editorDifficulty'))$('editorDifficulty').value=meta.difficulty||'Normal';if($('editorDescription'))$('editorDescription').value=meta.description||'Built in the Dragon Dash editor.';if($('editorMusicUrl'))$('editorMusicUrl').value=meta.musicUrl||'';if($('editorMusicOffset'))$('editorMusicOffset').value=meta.musicOffset||0;}
  function saveEditor(){const meta=collectMeta();if(meta.musicUrlError){toast(meta.musicUrlError);return;}delete meta.musicUrlError;localStorage.setItem('dragonDashEditor',JSON.stringify({objects:editor.objects,scrollX:editor.scrollX,meta}));toast('Custom level saved');}
  function loadEditorData(apply=true){try{const d=JSON.parse(localStorage.getItem('dragonDashEditor')||'null');if(d&&Array.isArray(d.objects)){if(apply){editor.objects=d.objects;editor.scrollX=d.scrollX||0;editor.selection.clear();applyMeta(d.meta||{});drawEditor();toast('Custom level loaded');}return d;}}catch(e){}return null;}
  function editorLevelFromData(d){const objects=JSON.parse(JSON.stringify(d.objects));let finish=objects.find(o=>o.type==='finish');let maxX=Math.max(2400,...objects.map(o=>o.x||0));if(!finish){finish=obj('finish',maxX+800,390);objects.push(finish);maxX=finish.x;}const meta=d.meta||collectMeta();return{id:'custom',name:meta.name||'My Custom Level',creator:meta.creator||'',difficulty:meta.difficulty||'Custom',description:meta.description||'Built in the Dragon Dash editor.',theme:['#173c82','#071831','#56efff'],length:Math.max(maxX,finish.x),beat:.235,song:[220,330,392,0,247,370,440,0],musicUrl:meta.musicUrl||'',musicOffset:Number(meta.musicOffset)||0,objects};}

  function queuePress(source) {
    if (input.sources.has(source)) return;
    input.sources.add(source);
    input.held=true;
    input.pressed=true;
    input.pressBuffer=INPUT_BUFFER_SECONDS;
    audio.ensure();
  }
  function releasePress(source) {
    if (!input.sources.delete(source)) return;
    const wasHeld=input.held;
    input.held=input.sources.size>0;
    if (wasHeld && !input.held) input.released=true;
  }
  function consumePendingPress() {
    input.pressBuffer=0;
    input.pressed=false;
  }
  function clearPendingPress() {
    input.pressBuffer=0;
    input.pressed=false;
    input.released=false;
  }
  function clearAllInput() {
    input.sources.clear();
    input.keys.clear();
    input.held=false;
    clearPendingPress();
  }

  window.addEventListener('keydown',e=>{
    if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();if(!e.repeat)queuePress(`key:${e.code}`);}
    input.keys.add(e.code);
    if(e.code==='KeyR'&&document.getElementById('gameScreen').classList.contains('active'))resetPlayer(true);
    if((e.code==='Escape'||e.code==='KeyP')&&document.getElementById('gameScreen').classList.contains('active'))pauseGame();
    if(e.code==='KeyC'&&game.state==='playing')saveCheckpoint(true);
    if(e.code==='Backspace'&&game.state==='playing'&&settings.practice&&game.checkpoints.length){game.checkpoints.pop();toast('Checkpoint removed');}
    if(document.getElementById('editorScreen').classList.contains('active')){if(e.code==='KeyA'){editor.scrollX=Math.max(0,editor.scrollX-120);drawEditor();}if(e.code==='KeyD'){editor.scrollX+=120;drawEditor();}if(editor.mode==='select'&&editor.selection.size&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)){e.preventDefault();const step=e.shiftKey?5:editor.grid,dx=e.code==='ArrowLeft'?-step:e.code==='ArrowRight'?step:0,dy=e.code==='ArrowUp'?-step:e.code==='ArrowDown'?step:0;for(const i of editor.selection){const o=editor.objects[i];o.x+=dx;o.y+=dy;if(o.anchorX!=null)o.anchorX+=dx;if(o.anchorY!=null)o.anchorY+=dy;}drawEditor();}if((e.ctrlKey||e.metaKey)&&e.code==='KeyD'){e.preventDefault();duplicateSelection();}if(e.code==='Delete'){deleteSelection();}}
  });
  window.addEventListener('keyup',e=>{if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();releasePress(`key:${e.code}`);}input.keys.delete(e.code);});

  // pointerdown fires at physical press time for mouse, pen, and touch. Track
  // pointers independently so releasing one input cannot cancel another held one.
  gameCanvas.addEventListener('pointerdown',e=>{e.preventDefault();gameCanvas.setPointerCapture?.(e.pointerId);queuePress(`pointer:${e.pointerId}`);},{passive:false});
  window.addEventListener('pointerup',e=>releasePress(`pointer:${e.pointerId}`),{passive:true});
  window.addEventListener('pointercancel',e=>releasePress(`pointer:${e.pointerId}`),{passive:true});
  window.addEventListener('blur',clearAllInput);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearAllInput();});
  gameCanvas.addEventListener('contextmenu',e=>e.preventDefault());
  editorCanvas.addEventListener('mousedown',placeEditor);editorCanvas.addEventListener('pointerdown',selectPointerDown);editorCanvas.addEventListener('pointermove',selectPointerMove);window.addEventListener('pointerup',selectPointerUp);editorCanvas.addEventListener('contextmenu',e=>e.preventDefault());editorCanvas.addEventListener('wheel',e=>{e.preventDefault();editor.scrollX=Math.max(0,editor.scrollX+Math.sign(e.deltaY)*(e.shiftKey?480:120));drawEditor();},{passive:false});

  $('playButton').onclick=()=>{renderLevelCards();showScreenDirect('levelScreen');};
  $('editorButton').onclick=()=>{setupPalette();loadEditorData(true);showScreenDirect('editorScreen');drawEditor();};
  $('howButton').onclick=()=>showScreenDirect('infoScreen');
  $('settingsButton').onclick=()=>showScreenDirect('settingsScreen');
  document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>showScreenDirect(b.dataset.back));
  $('practiceToggle').onclick=()=>{settings.practice=!settings.practice;$('practiceToggle').textContent=`Practice: ${settings.practice?'ON':'OFF'}`;$('practiceToggle').setAttribute('aria-pressed',settings.practice);$('practiceBadge').classList.toggle('hidden',!settings.practice);};
  $('muteToggle').onclick=()=>{settings.muted=!settings.muted;$('muteToggle').textContent=`Sound: ${settings.muted?'OFF':'ON'}`;$('muteToggle').setAttribute('aria-pressed',settings.muted);if(audio.master)audio.master.gain.value=settings.muted?0:settings.volume;if(game.customMusic)game.customMusic.volume=settings.muted?0:settings.volume;};
  $('volumeSlider').oninput=e=>{settings.volume=Number(e.target.value);if(audio.master)audio.master.gain.value=settings.muted?0:settings.volume;if(game.customMusic)game.customMusic.volume=settings.muted?0:settings.volume;};
  $('shakeToggle').onchange=e=>{settings.shake=e.target.checked&&!settings.comfort};$('particlesToggle').onchange=e=>settings.particles=e.target.checked;$('hitboxToggle').onchange=e=>settings.hitboxes=e.target.checked;$('comfortToggle').onchange=e=>applyComfortMode(e.target.checked);
  $('pauseButton').onclick=pauseGame;$('resumeButton').onclick=()=>{if(game.state==='complete')resetPlayer(true);else resumeGame();};$('restartButton').onclick=()=>resetPlayer(true);$('quitButton').onclick=()=>{game.state='stopped';renderLevelCards();showScreenDirect('levelScreen');};
  $('editorSave').onclick=saveEditor;$('editorLoad').onclick=()=>loadEditorData(true);$('editorClear').onclick=()=>{editor.objects=[];editor.selection.clear();drawEditor();toast('Editor cleared');};$('editorPlay').onclick=()=>{if(!editor.objects.length){toast('Place a few objects first');return;}const meta=collectMeta();if(meta.musicUrlError){toast(meta.musicUrlError);return;}delete meta.musicUrlError;startLevel(editorLevelFromData({objects:editor.objects,meta}),true);};
  $('editorSelect').onclick=()=>{editor.mode=editor.mode==='select'?'place':'select';$('editorSelect').classList.toggle('active',editor.mode==='select');if(editor.mode==='select')[...$('palette').children].forEach(x=>x.classList.remove('active'));drawEditor();};$('editorDuplicate').onclick=duplicateSelection;$('editorDelete').onclick=deleteSelection;$('editorApplyProps').onclick=applySelectionProps;

  applyComfortMode(settings.comfort);setupPalette();renderLevelCards();
  requestAnimationFrame(()=>{ if(document.getElementById('editorScreen').classList.contains('active')) drawEditor(); });
})();
