/* Deep Time Lab reusable investigation engine v2
   Purpose: render v17-quality investigations from case data instead of one-off HTML.
   Production note: objective answer keys and identity-bearing fossil assets belong server-side.
*/
(function(global){
'use strict';

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

class DeepTimeEngine{
  constructor(root,config,opts={}){
    this.root=typeof root==='string'?document.querySelector(root):root;
    this.config=config;
    this.opts=opts;
    this.current=0;
    this.cleared=[...(config.priorClearedTiles||[])];
    this.dayStartCleared=this.cleared.length;
    this.totalSectors=Number(config.totalSectors||40);
    this.authorized=null;
    this.pendingZone=[];
    this.zoneSize=0;
    this.zoneCleared=0;
    this.brushing=false;
    this.brushProgress=0;
    this.lastBrushPoint=null;
    this.brushDustDistance=0;
    this.soundOn=true;
    this.audioCtx=null;
    this.visualCache=new Map();
    this.clipTicker=null;this.clipDeadline=0;this.clipAlarmAudio=null;this.clipAlarmUrl=null;
    this.state={};
    this.choiceSeed=Math.floor(Math.random()*1e9);
    for(const inv of config.investigations)this.state[inv.id]={attempts:0,answers:{},matches:{},selected:new Set(),stage:0,reason:'',confidence:'',custom:{}};
    this.validateConfig();
  }

  validateConfig(){
    const errors=[];
    const c=this.config;
    if(!c.caseId||!c.day||!Array.isArray(c.investigations))errors.push('Missing caseId/day/investigations');
    if(!c.investigations?.length)errors.push('A research day must contain at least one investigation.');
    const seenDig=new Set(c.priorClearedTiles||[]);
    for(const inv of c.investigations||[]){
      if(!inv.id||!inv.title||!inv.type)errors.push(`Investigation missing id/title/type: ${JSON.stringify(inv).slice(0,80)}`);
      const zone=Array.isArray(inv.digTiles)?inv.digTiles:(Number.isInteger(inv.tile)?[inv.tile]:[]);
      if(zone.some(t=>!Number.isInteger(t)||t<0||t>=Number(c.totalSectors||40)))errors.push(`${inv.id}: digTiles contains an invalid sector.`);
      if(new Set(zone).size!==zone.length)errors.push(`${inv.id}: digTiles contains duplicate sectors.`);
      for(const t of zone){if(seenDig.has(t))errors.push(`${inv.id}: sector ${t} is already cleared or assigned earlier in this day.`);seenDig.add(t)}
      const introduced=new Set(inv.introducedTerms||[]);
      for(const term of inv.requiredTerms||[])if(!introduced.has(term))errors.push(`${inv.id}: required term "${term}" is not declared introduced.`);
      for(const v of inv.visuals||[])if(!c.visualManifest?.[v])errors.push(`${inv.id}: visual key ${v} is not in visualManifest.`);
    }
    if(errors.length){console.warn('Deep Time authoring validation:',errors);if(this.opts.strict)throw new Error(errors.join('\n'));}
    return errors;
  }

  mount(){
    this.root.innerHTML=this.shellHTML();
    this.bindGlobal();
    this.initDig();
    this.render();
    return this;
  }

  shellHTML(){const c=this.config;return `
<header class="topbar"><div class="brand"><div class="brandmark">DW</div><div><b>DRAGONSWOOD</b><small>Deep Time Laboratory</small></div></div><div class="top-actions"><button class="topbtn" id="soundBtn">🔊 FIELD AUDIO</button><button class="topbtn" id="resetBtn">RESET DAY</button></div></header>
<main class="shell"><section class="hero"><div><p class="eyebrow">PALEONTOLOGY FIELD PROGRAM · ${esc(c.studentTheme||'FOSSIL INVESTIGATION')}</p><h1>Research Day ${c.day}</h1><p>${esc(c.heroLine)}</p></div><div class="permit"><span class="tag">ACTIVE RESEARCH PERMIT</span><strong>Specimen ${esc(c.caseId)}</strong><small id="permitStatus">Day ${c.day} of ${c.caseDays||c.totalDays||1} · ${this.cleared.length}/${this.totalSectors} fossil squares uncovered · identity sealed</small></div></section>
<div class="day-route" id="dayRoute"></div>
<div class="workspace"><section class="card"><div class="mission-head"><div><span class="daytag">RESEARCH DAY ${c.day} / ${c.caseDays||c.totalDays||1}</span><h2>${esc(c.dayTitle)}</h2><p>${esc(c.daySubtitle)}</p></div><div class="progress-mini"><strong id="progressCount">0/${c.investigations.length}</strong><small>INVESTIGATIONS CLEARED</small></div></div><div class="brief"><button class="speak" id="readBrief">▶ READ ALOUD</button><b>FIELD BRIEFING</b><br>${c.briefing}</div><div id="activityMount"></div></section>
<aside class="card dig-card"><div class="dig-head"><div><h2>Excavation Grid</h2><p>8 × 5 fossil grid · each investigation unlocks a new dig area</p></div><div class="dig-percent"><strong id="digPct">${Math.round(this.cleared.length/this.totalSectors*100)}%</strong><small>EXPOSED</small></div></div><div class="dig-toolbar"><span class="toolchip">SOFT BRUSH · ACTIVE</span><span class="coords" id="coordReadout">NO SECTOR AUTHORIZED</span></div><div class="dig-wrap"><div class="dig-frame"><div class="col-labels">${'ABCDEFGH'.split('').map(x=>`<span>${x}</span>`).join('')}</div><div class="row-labels">${[1,2,3,4,5].map(x=>`<span>${x}</span>`).join('')}</div><div class="dig-stage"><div class="dig-grid" id="digGrid"></div></div></div></div><div class="permit-stamp" id="permitStamp"><b>FIELD CLEARANCE GRANTED</b><span id="permitMessage">Complete the current investigation.</span></div><div class="dig-footer"><div class="dig-status" id="digStatus"><span class="lamp"></span><span>Complete Investigation 1 to authorize the next dig zone.</span></div></div></aside></div></main>
<div class="toast" id="toast"></div><div class="clip-timer" id="clipTimer" style="position:fixed;right:16px;bottom:16px;z-index:450;display:none;border:1px solid rgba(99,221,193,.25);border-radius:13px;background:#071a22;padding:11px 12px;box-shadow:0 16px 50px #000;min-width:190px"><b style="display:block;color:var(--teal);font-size:10px">VIDEO CLIP TIMER</b><span id="clipCount" style="display:block;font-size:24px;font-weight:950;margin:3px 0">0:00</span><p id="clipTimerMsg" style="font-size:10.5px;color:#a9bcbd;margin:0">Return when the chime sounds.</p></div>
<div class="visual-codex-backdrop" id="visualCodexBackdrop" role="dialog" aria-modal="true"><section class="visual-codex"><div class="visual-codex-head"><div><b>🔎 DEEP TIME VISUAL CODEX</b><span>Curated mystery-safe science imagery</span></div><button class="visual-codex-close" id="visualCodexClose">×</button></div><div class="visual-codex-body" id="visualCodexBody"></div></section></div>`}

  bindGlobal(){
    $('#soundBtn').onclick=()=>{this.soundOn=!this.soundOn;$('#soundBtn').textContent=this.soundOn?'🔊 FIELD AUDIO':'🔇 FIELD AUDIO';this.toast(this.soundOn?'Field audio enabled':'Field audio muted')};
    $('#resetBtn').onclick=()=>{if(confirm('Reset this Day '+this.config.day+' test?'))location.reload()};
    $('#readBrief').onclick=()=>this.speak(this.strip(this.config.briefing));
    $('#visualCodexClose').onclick=()=>$('#visualCodexBackdrop').classList.remove('show');
    $('#visualCodexBackdrop').onclick=e=>{if(e.target.id==='visualCodexBackdrop')e.currentTarget.classList.remove('show')};
  }

  strip(s){const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||''}
  speak(t){if(!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=.93;speechSynthesis.speak(u)}
  tone(freq=480,dur=.07,vol=.022,type='sine'){if(!this.soundOn)return;try{const c=this.audioCtx||(this.audioCtx=new (window.AudioContext||window.webkitAudioContext)());const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(vol,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+dur)}catch(_){}}
  toast(t){const x=$('#toast');x.textContent=t;x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),2200)}

  renderRoute(){const invs=this.config.investigations;$('#dayRoute').innerHTML=invs.map((x,i)=>`<div class="route-step ${i<this.current?'done':i===this.current?'current':''}"><span>${i+1} OF ${invs.length} · ${i<this.current?'DONE':i===this.current?'NOW':'UPCOMING'}</span><b>${x.icon} ${esc(x.routeLabel||x.title)}</b></div>`).join('')}

  render(){
    this.renderRoute();
    $('#progressCount').textContent=`${Math.min(this.current,this.config.investigations.length)}/${this.config.investigations.length}`;
    $('#permitStatus').textContent=`Day ${this.config.day} of ${this.config.caseDays||this.config.totalDays||1} · ${this.cleared.length}/${this.totalSectors} fossil squares uncovered · identity sealed`;
    if(this.current>=this.config.investigations.length){this.renderComplete();return}
    const inv=this.config.investigations[this.current];
    $('#activityMount').innerHTML=this.activityHTML(inv);
    this.bindCommon(inv);
    this.hydrateVisuals($('#activityMount'));
    this.bindActivity(inv);
  }

  activityHTML(inv){return `<section class="activity"><div class="activity-head"><div class="activity-icon">${inv.icon}</div><div><h3>${esc(inv.title)}</h3><small>${esc(inv.kicker||`INVESTIGATION ${this.current+1} · ABOUT ${inv.minutes||'6–8'} MIN`)}</small></div><span class="activity-badge">EVIDENCE MISSION</span></div><div class="challenge"><b>Your challenge:</b> ${inv.challenge}</div>${this.wordsHTML(inv.vocabulary||[])}${this.lessonHTML(inv)}${this.taskHTML(inv)}${this.sourceHTML(inv.sources||[])}</section>`}

  wordsHTML(items){if(!items.length)return'';return `<div class="word-help"><strong>🧠 WORDS THAT HELP</strong><p>Use these when you need them. You do not need to memorize them today.</p><div class="word-grid">${items.map(x=>`<button class="word" data-speak="${esc(x.term+'. '+x.definition)}"><b>${esc(x.term)}</b><span>${esc(x.definition)}</span></button>`).join('')}</div></div>`}

  lessonHTML(inv){const l=inv.lesson;if(!l)return'';const speech=[l.intro,...(l.cards||[]).flatMap(x=>[x.title,x.what,x.quick,x.why]),l.tip].filter(Boolean).join(' ');return `<section class="field-lesson"><div class="field-lesson-head"><span class="lesson-mark">📖</span><div><b>FIELD LESSON · READ FIRST</b><span>${esc(l.title)}</span></div><button class="lesson-read" data-speech="${esc(speech)}">🔊 READ TO ME</button></div><div class="field-lesson-body"><p>${l.intro}</p>${l.cards?.length?`<div class="concept-strip">${l.cards.map(x=>`<div class="concept-box"><b>${esc(x.title)}</b><span>${x.what}</span>${x.quick?`<div class="quick"><strong>QUICK FACT</strong><span>${x.quick}</span></div>`:''}${x.why?`<div class="why"><strong>WHY IT MATTERS</strong><span>${x.why}</span></div>`:''}</div>`).join('')}</div>`:''}${this.canCannotHTML(l.can,l.cannot,l.whyMatters)}${l.diagram?this.diagramHTML(l.diagram):''}${l.video?this.videoHTML(l.video):''}${inv.visuals?.length?`<div class="visual-row">${inv.visuals.map(k=>this.visualCardHTML(k)).join('')}</div>`:''}${l.tip?`<div class="scientist-tip"><b>Scientist tip:</b> ${l.tip}</div>`:''}</div></section><div class="learn-apply">NOW USE WHAT YOU READ</div>`}

  canCannotHTML(can,cannot,why){if(!can&&!cannot)return'';return `<div class="can-cannot"><div class="evidence-rule good"><h5>✓ THIS EVIDENCE CAN HELP US</h5><ul>${(can||[]).map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="evidence-rule stop"><h5>✕ THIS EVIDENCE ALONE CANNOT TELL US</h5><ul>${(cannot||[]).map(x=>`<li>${x}</li>`).join('')}</ul></div></div>${why?`<div class="why-matters"><b>Why this matters:</b> ${why}</div>`:''}`}

  videoHTML(v){const dur=Math.max(10,Number(v.duration||60)),start=Math.max(0,Number(v.start||0)),stop=start+dur;return `<section class="lesson-media" style="margin-top:11px;border:1px solid rgba(99,221,193,.16);border-radius:14px;overflow:hidden;background:#071a22"><div style="padding:10px 12px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:8px"><b style="color:var(--teal);font-size:11px">▶ WATCH THE IDEA · ${dur} SEC</b><span style="font-size:10px;color:#8fa5a5">Optional support</span></div><div style="padding:12px"><p style="margin:0 0 9px;font-size:12px;line-height:1.45;color:#d3dfdc">${v.watchFor||''}</p><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><button type="button" class="clip-test" style="border:1px solid var(--line);border-radius:9px;background:#0a2430;color:#fff;padding:9px 10px;font-weight:850;cursor:pointer">🔔 TEST CHIME</button><a class="clip-open" data-duration="${dur}" href="${esc(v.url)}" target="_blank" rel="noopener" style="text-decoration:none;border:1px solid rgba(239,190,107,.35);border-radius:9px;background:rgba(239,190,107,.08);color:#ffe1a3;padding:9px 11px;font-weight:900">▶ WATCH ${dur}-SECOND CLIP</a><span style="font-size:10.5px;color:#9db2b0">${v.startLabel||`Start ${start}s`} → ${v.stopLabel||`Stop ${stop}s`} · return at chime</span></div><p style="margin:9px 0 0;font-size:10.5px;color:#8fa5a5">${v.sourceLabel||''} · The written lesson contains everything needed if video is unavailable.</p></div></section>`}
  wavBlobUrl(seconds=70,withDelay=true){
    const sr=8000,n=Math.ceil(seconds*sr),bytes=44+n,a=new Uint8Array(bytes),v=new DataView(a.buffer),wr=(o,t)=>{for(let i=0;i<t.length;i++)a[o+i]=t.charCodeAt(i)};
    wr(0,'RIFF');v.setUint32(4,36+n,true);wr(8,'WAVE');wr(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr,true);v.setUint16(32,1,true);v.setUint16(34,8,true);wr(36,'data');v.setUint32(40,n,true);a.fill(128,44);
    const add=(at,dur,freq,amp=.72)=>{const from=Math.max(0,Math.floor(at*sr)),to=Math.min(n,Math.floor((at+dur)*sr));for(let i=from;i<to;i++){const t=(i-from)/sr,attack=Math.min(1,t/.025),release=Math.min(1,(to-i)/(sr*.06)),env=Math.max(0,Math.min(attack,release));a[44+i]=Math.max(0,Math.min(255,Math.round(128+127*amp*env*Math.sin(2*Math.PI*freq*t))))}};
    if(withDelay){add(.03,.07,660,.28);add(Math.max(.1,seconds-.82),.30,880,.82);add(Math.max(.25,seconds-.48),.40,1175,.78)}else{add(.03,.24,880,.82);add(.31,.34,1175,.78)}
    return URL.createObjectURL(new Blob([a],{type:'audio/wav'}));
  }
  unlockAudio(){try{const c=this.audioCtx||(this.audioCtx=new (window.AudioContext||window.webkitAudioContext)());if(c.state==='suspended')c.resume()}catch(_){}}
  playTestChime(){if(!this.soundOn){this.toast('Field audio is muted. Turn FIELD AUDIO on first.');return}try{const url=this.wavBlobUrl(.8,false),au=new Audio(url);au.volume=1;au.play().then(()=>this.toast('If you heard that, the clip alarm is ready.')).catch(()=>this.toast('Browser blocked audio. Click FIELD AUDIO, then test again.'));au.onended=()=>URL.revokeObjectURL(url)}catch(_){this.toast('Could not start the test chime on this browser.')}}
  startClipAlarmMedia(duration){if(!this.soundOn)return;try{if(this.clipAlarmAudio){this.clipAlarmAudio.pause();this.clipAlarmAudio=null}if(this.clipAlarmUrl){URL.revokeObjectURL(this.clipAlarmUrl);this.clipAlarmUrl=null}this.clipAlarmUrl=this.wavBlobUrl(duration,true);this.clipAlarmAudio=new Audio(this.clipAlarmUrl);this.clipAlarmAudio.volume=1;this.clipAlarmAudio.preload='auto';this.clipAlarmAudio.play().then(()=>this.toast('🔔 Clip timer armed · return when you hear the chime')).catch(()=>{this.clipAlarmAudio=null;this.toast('Audio alarm was blocked. Use the visible stop time.')});this.clipAlarmAudio.onended=()=>{if(this.clipAlarmUrl){URL.revokeObjectURL(this.clipAlarmUrl);this.clipAlarmUrl=null}this.clipAlarmAudio=null}}catch(_){this.clipAlarmAudio=null}}
  armClip(duration){duration=Math.max(10,Number(duration)||60);this.unlockAudio();this.clipDeadline=Date.now()+duration*1000;const box=$('#clipTimer');box.style.display='block';$('#clipTimerMsg').textContent='Watch until the chime · return to the investigation.';const update=()=>{const left=this.clipDeadline-Date.now(),sec=Math.max(0,Math.ceil(left/1000));if(left<=0){$('#clipCount').textContent='DONE ✓';$('#clipTimerMsg').textContent='Selected segment complete. Return to the investigation.';if(this.clipTicker){clearInterval(this.clipTicker);this.clipTicker=null}return}$('#clipCount').textContent=`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`};update();if(this.clipTicker)clearInterval(this.clipTicker);this.clipTicker=setInterval(update,250);this.startClipAlarmMedia(duration)}
  diagramHTML(d){if(d.type==='river')return `<div class="river-diagram"><div class="river-sky"></div><div class="river-channel"></div><div class="river-bank"></div><span class="river-label channel"><span class="river-dot"></span>River channel · stronger flow can move sand</span><span class="river-label flood"><span class="river-dot"></span>Floodplain · slower water can leave mud</span><span class="river-label wet"><span class="river-dot"></span>Wet low area · plant material can build up</span></div><div class="river-legend">${d.caption||'Teaching model: real river systems shift over time. This diagram shows the clue relationships, not the exact shape of the ancient Lance landscape.'}</div>`;
    if(d.type==='plantProcess')return `<div class="process-flow"><div class="process-step"><b>1 · PLANTS</b><span>Plant material grows and falls into wet ground.</span></div><div class="process-arrow">→</div><div class="process-step"><b>2 · BURIAL</b><span>Sediment covers and preserves some of that material.</span></div><div class="process-arrow">→</div><div class="process-step"><b>3 · CARBON-RICH LAYER</b><span>Buried plant material can contribute to lignite or other carbon-rich beds.</span></div></div>`;
    return''}

  visualCardHTML(key){const v=this.config.visualManifest[key];return `<article class="visual-card" data-visual-key="${esc(key)}"><div class="visual-image" data-image><div class="visual-fallback"><i>${v.icon||'🔬'}</i><b>Loading curated image…</b></div></div><div class="visual-copy"><div class="visual-badges"><span class="visual-badge real">${esc(v.badge||'REAL SCIENCE VISUAL')}</span><span class="visual-badge">CURATED SOURCE</span></div><h5>${esc(v.title)}</h5><p>${v.caption}</p><div class="visual-credit" data-credit>Checking creator + license…</div><div class="visual-actions"><button class="open-codex" data-key="${esc(key)}">🔎 INSPECT + LEARN</button><a data-source hidden target="_blank" rel="noopener">SOURCE + LICENSE ↗</a></div></div></article>`}

  sourceHTML(items){if(!items.length)return'';return `<details class="day-source"><summary>📚 Where this science comes from <span style="color:#71898b;font-weight:700">(optional)</span></summary><ul>${items.map(x=>`<li>${x}</li>`).join('')}</ul></details>`}

  taskHTML(inv){const custom=DeepTimeEngine.customRenderers?.[inv.type];if(custom?.render)return custom.render.call(this,inv);switch(inv.type){
    case 'waterEvidence': return this.waterTaskHTML(inv);
    case 'plantArchive': return this.plantTaskHTML(inv);
    case 'rockLab': return this.rockTaskHTML(inv);
    case 'associatedFauna': return this.faunaTaskHTML(inv);
    case 'landscapeSynthesis': return this.synthesisTaskHTML(inv);
    default:return `<div class="engine-note"><b>Unsupported activity renderer:</b> ${esc(inv.type)}</div>`;
  }}

  shuffled(options,salt=''){const a=options.map((x,i)=>({...x,_i:i}));let seed=this.choiceSeed+[...salt].reduce((n,c)=>n+c.charCodeAt(0),0);for(let i=a.length-1;i>0;i--){seed=(seed*1664525+1013904223)>>>0;const j=seed%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
  choicesHTML(options,cls,salt){return `<div class="choice-grid">${this.shuffled(options,salt).map(o=>`<button class="engine-choice ${cls}" data-value="${esc(o.value)}">${o.text}</button>`).join('')}</div>`}

  waterTaskHTML(inv){const s=this.state[inv.id];return `<div class="task-card" id="w1"><h4>1 · Match grain size to water movement</h4><p>The lesson taught that sand-sized grains need more moving-water energy than tiny mud particles. Match both clues.</p><div class="match-board"><div class="match-column"><div class="match-label">SEDIMENT CLUES</div><button class="match-item water-clue" data-clue="sand">Sand-sized grains</button><button class="match-item water-clue" data-clue="mud">Tiny mud particles</button></div><div class="match-column"><div class="match-label">BEST FIT</div><button class="match-item water-place" data-place="channel">Stronger-flow river channel</button><button class="match-item water-place" data-place="floodplain">Slower floodplain water</button></div></div><div class="task-feedback" id="waterMatchFb">0 of 2 matches complete.</div></div><div class="task-card locked" id="w2"><h4>2 · Use both clues together</h4><p>Which landscape idea fits sandstone and mudstone together?</p>${this.choicesHTML(inv.finalChoices,'water-final',inv.id+'final')}<div class="task-feedback" id="waterFinalFb"></div><div class="submit-line"><div class="task-feedback" id="waterSubmitFb">Complete both tasks to earn the sector.</div><button class="engine-submit" id="waterSubmit">SAVE WATER EVIDENCE</button></div></div>`}

  plantTaskHTML(inv){return `<div class="task-card"><h4>1 · Follow the preservation story</h4><p>Use the visual process above. Which step comes directly before a carbon-rich layer can form?</p>${this.choicesHTML(inv.processChoices,'plant-process',inv.id+'process')}<div class="task-feedback" id="plantProcessFb"></div></div><div class="task-card locked" id="p2"><h4>2 · Keep the claim inside the evidence</h4><p>What can a carbon-rich or lignite bed support most directly?</p>${this.choicesHTML(inv.finalChoices,'plant-final',inv.id+'final')}<div class="task-feedback" id="plantFinalFb"></div><div class="submit-line"><div class="task-feedback" id="plantSubmitFb">Finish both plant-evidence checks.</div><button class="engine-submit" id="plantSubmit">SAVE PLANT EVIDENCE</button></div></div>`}

  rockTaskHTML(inv){return `<div class="task-card"><h4>1 · Inspect three rock samples</h4><p>For each sample, make the observation first. Then connect it to the water or ground condition it supports.</p><div id="rockStations">${inv.samples.map((x,i)=>`<div class="task-card ${i?'locked':''}" id="rock-${x.id}"><h4>${i+1}. ${esc(x.title)}</h4><p>${x.prompt}</p>${this.choicesHTML(x.observeChoices,`rock-observe-${x.id}`,inv.id+x.id+'o')}<div class="task-feedback" id="rock-${x.id}-obsfb"></div><div class="${i===0?'':'locked'}" id="rock-${x.id}-infer" style="margin-top:9px"><p>${x.inferPrompt}</p>${this.choicesHTML(x.inferChoices,`rock-infer-${x.id}`,inv.id+x.id+'i')}<div class="task-feedback" id="rock-${x.id}-inferfb"></div></div></div>`).join('')}</div></div><div class="task-card locked" id="rockBuild"><h4>2 · Build the ancient landscape</h4><p>Match each rock clue to the place where it fits best.</p><div class="match-board"><div class="match-column"><div class="match-label">ROCK CLUES</div>${inv.samples.map(x=>`<button class="match-item rock-clue" data-clue="${x.id}"><b>${esc(x.short)}</b><br>${esc(x.clue)}</button>`).join('')}</div><div class="match-column"><div class="match-label">LANDSCAPE PARTS</div>${inv.landscapePlaces.map(x=>`<button class="match-item rock-place" data-place="${x.id}"><b>${esc(x.title)}</b><br>${esc(x.desc)}</button>`).join('')}</div></div><div class="task-feedback" id="rockMatchFb">0 of ${inv.samples.length} clues matched.</div></div><div class="task-card locked" id="rockDecision"><h4>3 · Make the landscape decision</h4><p>${inv.finalPrompt}</p>${this.choicesHTML(inv.finalChoices,'rock-final',inv.id+'final')}<div class="task-feedback" id="rockFinalFb"></div><div class="submit-line"><div class="task-feedback" id="rockSubmitFb">Finish the rock lab and final decision.</div><button class="engine-submit" id="rockSubmit">SAVE ROCK INTERPRETATION</button></div></div>`}

  faunaTaskHTML(inv){return `<div class="task-card"><h4>1 · Read the associated-fossil record</h4><p>${inv.recordIntro}</p><div class="fauna-grid">${inv.faunaCards.map(x=>`<div class="fauna-clue"><b>${esc(x.title)}</b><span>${x.text}</span><small>${x.note}</small></div>`).join('')}</div></div><div class="task-card"><h4>2 · What can an assemblage tell us?</h4><p>${inv.question}</p>${this.choicesHTML(inv.finalChoices,'fauna-final',inv.id+'final')}<div class="task-feedback" id="faunaFinalFb"></div><div class="can-cannot"><div class="evidence-rule good"><h5>✓ ASSOCIATED FOSSILS CAN HELP</h5><ul>${inv.can.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="evidence-rule stop"><h5>✕ THEY CANNOT PROVE BY THEMSELVES</h5><ul>${inv.cannot.map(x=>`<li>${x}</li>`).join('')}</ul></div></div><div class="submit-line"><div class="task-feedback" id="faunaSubmitFb">Choose the conclusion that stays inside the evidence.</div><button class="engine-submit" id="faunaSubmit">SAVE ASSOCIATED-FOSSIL EVIDENCE</button></div></div>`}

  synthesisTaskHTML(inv){const s=this.state[inv.id];return `<div class="task-card"><h4>1 · Place the evidence into the landscape</h4><p>Choose an evidence chip, then choose the landscape part where it fits best.</p><div class="evidence-bank">${inv.evidence.map(x=>`<button class="evidence-chip syn-evidence" data-e="${x.id}">${x.text}</button>`).join('')}</div><div class="landscape-slots">${inv.slots.map(x=>`<div class="landscape-slot" data-slot="${x.id}"><b>${esc(x.title)}</b><span>${esc(x.desc)}</span><div data-placed></div></div>`).join('')}</div><div class="task-feedback" id="synMatchFb">0 of ${inv.evidence.length} evidence clues placed.</div></div><div class="task-card locked" id="synDecision"><h4>2 · Choose the best landscape model</h4><p>${inv.finalPrompt}</p>${this.choicesHTML(inv.finalChoices,'syn-final',inv.id+'final')}<div class="task-feedback" id="synFinalFb"></div><div class="reason-panel"><b>3 · Which two clues helped you most?</b><textarea id="synReason" maxlength="280" placeholder="Two clues that helped me were…"></textarea><div class="confidence-row"><b>HOW SURE ARE YOU?</b>${['LOW','MEDIUM','HIGH'].map(x=>`<button class="confidence syn-conf" data-c="${x}">${x}</button>`).join('')}</div><div id="synSupport"></div></div><div class="submit-line"><div class="task-feedback" id="synSubmitFb">Finish the landscape model, reasoning, and confidence check.</div><button class="engine-submit" id="synSubmit">RUN AI CHECK + SAVE DAY 2</button></div></div>`}

  bindCommon(inv){$$('.word').forEach(b=>b.onclick=()=>this.speak(b.dataset.speak));$$('.lesson-read').forEach(b=>b.onclick=()=>this.speak(b.dataset.speech));$$('.open-codex').forEach(b=>b.onclick=()=>this.openCodex(b.dataset.key));$$('.clip-test').forEach(b=>b.onclick=()=>this.playTestChime());$$('.clip-open').forEach(a=>a.addEventListener('click',()=>this.armClip(+a.dataset.duration||60)))}
  bindActivity(inv){const custom=DeepTimeEngine.customRenderers?.[inv.type];if(custom?.bind)return custom.bind.call(this,inv);switch(inv.type){case'waterEvidence':return this.bindWater(inv);case'plantArchive':return this.bindPlant(inv);case'rockLab':return this.bindRock(inv);case'associatedFauna':return this.bindFauna(inv);case'landscapeSynthesis':return this.bindSynthesis(inv)}}

  markChoice(selector,value){$$(selector).forEach(b=>b.classList.toggle('selected',b.dataset.value===value))}
  async checkObjective(inv,value,extra={}){
    if(typeof this.opts.objectiveCheck!=='function')return false;
    const r=await this.opts.objectiveCheck({caseId:this.config.caseId,day:this.config.day,investigationId:inv.id,value,checkId:extra.checkId||inv.serverCheckId,subcheck:extra.subcheck,index:extra.index,evidenceId:extra.evidenceId,sampleId:extra.sampleId});
    return r===true||r?.correct===true;
  }
  bindWater(inv){const s=this.state[inv.id];let selected='';$$('.water-clue').forEach(b=>b.onclick=()=>{if(b.classList.contains('matched'))return;selected=b.dataset.clue;$$('.water-clue').forEach(x=>x.classList.toggle('selected',x===b))});$$('.water-place').forEach(b=>b.onclick=async()=>{if(!selected||b.classList.contains('matched'))return;const ok=await this.checkObjective(inv,b.dataset.place,{subcheck:'waterMap',evidenceId:selected});if(ok){const c=$(`.water-clue[data-clue="${selected}"]`);c.classList.add('matched');b.classList.add('matched');s.matches[selected]=b.dataset.place;selected='';$$('.water-clue').forEach(x=>x.classList.remove('selected'));const n=Object.keys(s.matches).length;$('#waterMatchFb').textContent=`${n} of 2 matches complete.`;$('#waterMatchFb').className='task-feedback good';if(n===2)$('#w2').classList.remove('locked');this.tone(620,.06)}else{b.classList.add('wrong');$('#waterMatchFb').textContent='That pairing does not fit the lesson. Compare grain size with water energy.';$('#waterMatchFb').className='task-feedback bad';setTimeout(()=>b.classList.remove('wrong'),600)}});$$('.water-final').forEach(b=>b.onclick=()=>{s.answers.final=b.dataset.value;this.markChoice('.water-final',s.answers.final)});$('#waterSubmit').onclick=async()=>{const fb=$('#waterSubmitFb');if(Object.keys(s.matches).length<2||!s.answers.final){fb.className='task-feedback bad';fb.textContent='Finish both water clues and the final landscape idea.';return}if(!(await this.checkObjective(inv,s.answers.final,{subcheck:'final'}))){fb.className='task-feedback bad';fb.textContent=inv.wrongFeedback;return}fb.className='task-feedback good';fb.textContent='Water evidence accepted. Excavation clearance granted.';this.completeInvestigation()}}

  bindPlant(inv){const s=this.state[inv.id];$$('.plant-process').forEach(b=>b.onclick=async()=>{s.answers.process=b.dataset.value;this.markChoice('.plant-process',s.answers.process);const fb=$('#plantProcessFb');if(await this.checkObjective(inv,s.answers.process,{subcheck:'process'})){fb.className='task-feedback good';fb.textContent='Right. Burial protects some plant material long enough to become part of the rock record.';$('#p2').classList.remove('locked');this.tone(620,.06)}else{fb.className='task-feedback bad';fb.textContent='Recheck the three-step preservation visual above.'}});$$('.plant-final').forEach(b=>b.onclick=()=>{s.answers.final=b.dataset.value;this.markChoice('.plant-final',s.answers.final);$('#plantFinalFb').textContent='Choice recorded. Use the lesson before you save.'});$('#plantSubmit').onclick=async()=>{const fb=$('#plantSubmitFb');if(!s.answers.process||!s.answers.final){fb.className='task-feedback bad';fb.textContent='Complete both plant-evidence checks first.';return}if(!(await this.checkObjective(inv,s.answers.process,{subcheck:'process'}))||!(await this.checkObjective(inv,s.answers.final,{subcheck:'final'}))){s.attempts++;fb.className='task-feedback bad';fb.textContent=inv.wrongFeedback;return}fb.className='task-feedback good';fb.textContent='Plant evidence accepted. Excavation clearance granted.';this.completeInvestigation()}}

  bindRock(inv){const s=this.state[inv.id];const done=new Set();for(let idx=0;idx<inv.samples.length;idx++){const sample=inv.samples[idx];$$(`.rock-observe-${sample.id}`).forEach(b=>b.onclick=async()=>{if(await this.checkObjective(inv,b.dataset.value,{subcheck:'observe',sampleId:sample.id})){b.classList.add('correct');$(`#rock-${sample.id}-obsfb`).className='task-feedback good';$(`#rock-${sample.id}-obsfb`).textContent=sample.observeFeedback;$(`#rock-${sample.id}-infer`).classList.remove('locked');this.tone(610,.05)}else{b.classList.add('wrong');$(`#rock-${sample.id}-obsfb`).className='task-feedback bad';$(`#rock-${sample.id}-obsfb`).textContent='Recheck the sample description and lesson.';setTimeout(()=>b.classList.remove('wrong'),550)}});$$(`.rock-infer-${sample.id}`).forEach(b=>b.onclick=async()=>{if(await this.checkObjective(inv,b.dataset.value,{subcheck:'infer',sampleId:sample.id})){b.classList.add('correct');$(`#rock-${sample.id}-inferfb`).className='task-feedback good';$(`#rock-${sample.id}-inferfb`).textContent=sample.inferFeedback;done.add(sample.id);$(`#rock-${sample.id}`).classList.add('done');const next=inv.samples[idx+1];if(next)$(`#rock-${next.id}`).classList.remove('locked');if(done.size===inv.samples.length)$('#rockBuild').classList.remove('locked');this.tone(700,.05)}else{b.classList.add('wrong');$(`#rock-${sample.id}-inferfb`).className='task-feedback bad';$(`#rock-${sample.id}-inferfb`).textContent='That interpretation does not match the lesson. Use what the sample can actually tell us.';setTimeout(()=>b.classList.remove('wrong'),550)}})}let selected='';$$('.rock-clue').forEach(b=>b.onclick=()=>{if(b.classList.contains('matched'))return;selected=b.dataset.clue;$$('.rock-clue').forEach(x=>x.classList.toggle('selected',x===b))});$$('.rock-place').forEach(b=>b.onclick=async()=>{if(!selected||b.classList.contains('matched'))return;if(await this.checkObjective(inv,b.dataset.place,{subcheck:'place',sampleId:selected})){const c=$(`.rock-clue[data-clue="${selected}"]`);c.classList.add('matched');b.classList.add('matched');s.matches[selected]=b.dataset.place;selected='';$$('.rock-clue').forEach(x=>x.classList.remove('selected'));const n=Object.keys(s.matches).length;$('#rockMatchFb').textContent=`${n} of ${inv.samples.length} clues matched.`;$('#rockMatchFb').className='task-feedback good';if(n===inv.samples.length)$('#rockDecision').classList.remove('locked')}else{b.classList.add('wrong');$('#rockMatchFb').className='task-feedback bad';$('#rockMatchFb').textContent='Try a different landscape part. Match the clue to the condition that formed it.';setTimeout(()=>b.classList.remove('wrong'),550)}});$$('.rock-final').forEach(b=>b.onclick=()=>{s.answers.final=b.dataset.value;this.markChoice('.rock-final',s.answers.final)});$('#rockSubmit').onclick=async()=>{const fb=$('#rockSubmitFb');if(done.size<inv.samples.length||Object.keys(s.matches).length<inv.samples.length||!s.answers.final){fb.className='task-feedback bad';fb.textContent='Finish all samples, clue matches, and the final decision.';return}if(!(await this.checkObjective(inv,s.answers.final,{subcheck:'final'}))){fb.className='task-feedback bad';fb.textContent=inv.wrongFeedback;return}fb.className='task-feedback good';fb.textContent='Rock interpretation accepted. Excavation clearance granted.';this.completeInvestigation()}}

  bindFauna(inv){const s=this.state[inv.id];$$('.fauna-final').forEach(b=>b.onclick=()=>{s.answers.final=b.dataset.value;this.markChoice('.fauna-final',s.answers.final)});$('#faunaSubmit').onclick=async()=>{const fb=$('#faunaSubmitFb');if(!s.answers.final){fb.className='task-feedback bad';fb.textContent='Choose the conclusion that best fits the associated-fossil record.';return}if(!(await this.checkObjective(inv,s.answers.final,{subcheck:'final'}))){s.attempts++;fb.className='task-feedback bad';fb.textContent=inv.wrongFeedback;return}fb.className='task-feedback good';fb.textContent='Associated-fossil evidence accepted. Excavation clearance granted.';this.completeInvestigation()}}

  bindSynthesis(inv){const s=this.state[inv.id];let selected='';$$('.syn-evidence').forEach(b=>b.onclick=()=>{if(b.classList.contains('used'))return;selected=b.dataset.e;$$('.syn-evidence').forEach(x=>x.classList.toggle('selected',x===b))});$$('.landscape-slot').forEach(slot=>slot.onclick=async()=>{if(!selected)return;if(await this.checkObjective(inv,slot.dataset.slot,{subcheck:'synthesisMap',evidenceId:selected})){const chip=$(`.syn-evidence[data-e="${selected}"]`),data=inv.evidence.find(x=>x.id===selected);chip.classList.add('used');chip.classList.remove('selected');slot.querySelector('[data-placed]').innerHTML+=`<span class="placed">${data.text}</span>`;s.matches[selected]=slot.dataset.slot;selected='';const n=Object.keys(s.matches).length;$('#synMatchFb').textContent=`${n} of ${inv.evidence.length} evidence clues placed.`;$('#synMatchFb').className='task-feedback good';if(n===inv.evidence.length)$('#synDecision').classList.remove('locked');this.tone(650,.05)}else{$('#synMatchFb').className='task-feedback bad';$('#synMatchFb').textContent='That clue fits a different part of the landscape. Recheck what formed it.'}});$$('.syn-final').forEach(b=>b.onclick=()=>{s.answers.final=b.dataset.value;this.markChoice('.syn-final',s.answers.final)});$$('.syn-conf').forEach(b=>b.onclick=()=>{s.confidence=b.dataset.c;$$('.syn-conf').forEach(x=>x.classList.toggle('active',x===b))});$('#synReason').oninput=e=>s.reason=e.target.value;$('#synSubmit').onclick=async()=>{const fb=$('#synSubmitFb');if(Object.keys(s.matches).length<inv.evidence.length||!s.answers.final||!s.confidence||s.reason.trim().length<18){s.attempts++;fb.className='task-feedback bad';fb.textContent='Finish the evidence map, pick a model and confidence level, and write one short reason.';this.renderSupport(inv);return}if(!(await this.checkObjective(inv,s.answers.final,{subcheck:'final'}))){s.attempts++;fb.className='task-feedback bad';fb.textContent='That landscape does not explain the full evidence set. Use more than one clue.';this.renderSupport(inv);return}const result=await this.gradeReasoning(s.reason,{}, {investigationId:inv.id,confidence:s.confidence,serverRubricId:inv.serverRubricId});if(result==='approve'){fb.className='task-feedback good';fb.textContent='Reasoning accepted. Day 2 excavation clearance granted.';this.completeInvestigation()}else{s.attempts++;fb.className='task-feedback bad';fb.textContent='Your idea is close. Add one specific clue from today.';this.renderSupport(inv)}}}

  renderSupport(inv){const s=this.state[inv.id],box=$('#synSupport');if(!box)return;let html='';if(s.attempts===1)html=`<div class="support-box"><b>Clue:</b> Name one rock clue and one life/plant clue from today.</div>`;else if(s.attempts===2)html=`<div class="support-box"><b>Sentence starter:</b> “I think this was a river and floodplain landscape because the rocks show ___ and the other evidence shows ___.”</div>`;else if(s.attempts>=3)html=`<div class="support-box"><b>Model you may use:</b> “I think this was a river-and-floodplain landscape because sandstone can record moving water, mudstone can record quieter floodplain water, and carbon-rich layers show plant material built up in wet areas.”</div>`;box.innerHTML=html}

  async gradeReasoning(text,rubric={},context={}){if(typeof this.opts.aiCheck==='function'){try{const r=await this.opts.aiCheck({text,rubric,context,caseId:this.config.caseId,day:this.config.day});return r===true||r?.decision==='approved'||r?.decision==='approve'?'approve':'coach'}catch(e){console.warn('AI adapter failed; using preview rubric',e)}}return this.previewAI(text,rubric)}

  previewAI(text,rubric={}){const t=text.toLowerCase();const concepts=(rubric.acceptConcepts||['rock','sand','mud','plant','water','river','floodplain']).filter(x=>t.includes(x));return concepts.length>=1&&text.trim().split(/\s+/).length>=6?'approve':'coach'}

  completeInvestigation(){
    if(this.authorized!==null||this.pendingZone.length)return;
    const inv=this.config.investigations[this.current];
    let tiles=Array.isArray(inv.digTiles)?[...inv.digTiles]:(Number.isInteger(inv.tile)?[inv.tile]:[]);
    if(!tiles.length&&Number(inv.digCount)>0){
      const used=new Set(this.cleared);
      for(const other of this.config.investigations){for(const t of (other.digTiles||[]))used.add(t)}
      tiles=[...Array(this.totalSectors).keys()].filter(t=>!used.has(t)).slice(0,Number(inv.digCount));
    }
    tiles=tiles.filter(t=>!this.cleared.includes(t));
    if(!tiles.length){console.warn(inv.id+': no uncleared dig sectors configured');this.advanceAfterZone();return}
    this.authorizeZone(tiles);
  }
  authorizeZone(tiles){
    this.pendingZone=[...tiles];this.zoneSize=tiles.length;this.zoneCleared=0;
    this.authorizeNextZoneTile();
  }
  authorizeNextZoneTile(){
    if(!this.pendingZone.length){this.advanceAfterZone();return}
    this.authorize(this.pendingZone.shift());
  }
  advanceAfterZone(){
    this.current++;
    setTimeout(()=>{this.render();window.scrollTo({top:140,behavior:'smooth'});$('#digStatus').classList.remove('done');if(this.current<this.config.investigations.length)$('#digStatus').innerHTML=`<span class="lamp"></span><span>Complete Investigation ${this.current+1} to authorize the next dig zone.</span>`},650);
  }

  loadTileImage(tile){const d=$(`.dig-tile[data-tile="${tile}"]`);if(!d||d.dataset.imageLoaded==='1')return;const img=this.config.previewTiles?.[tile];if(img){d.style.backgroundImage=`url(${img})`;d.dataset.imageLoaded='1';return}if(typeof this.opts.tileResolver==='function'){try{const r=this.opts.tileResolver(tile,this.config);if(r&&typeof r.then==='function')r.then(url=>{if(url){d.style.backgroundImage=`url(${url})`;d.dataset.imageLoaded='1'}}).catch(()=>{});else if(r){d.style.backgroundImage=`url(${r})`;d.dataset.imageLoaded='1'}}catch(_){}}}
  initDig(){const g=$('#digGrid');for(let t=0;t<this.totalSectors;t++){const d=document.createElement('div');d.className='dig-tile';d.dataset.tile=t;d.dataset.coord='ABCDEFGH'[t%8]+(Math.floor(t/8)+1);if(this.cleared.includes(t))d.classList.add('cleared');d.onmouseenter=()=>$('#coordReadout').textContent=`FOSSIL SQUARE ${d.dataset.coord}${d.classList.contains('authorized')?' · AUTHORIZED':d.classList.contains('cleared')?' · UNCOVERED':' · SEALED'}`;g.appendChild(d)};for(const t of this.cleared)this.loadTileImage(t);const grid=$('#digGrid');grid.addEventListener('pointerdown',e=>this.startBrush(e));grid.addEventListener('pointermove',e=>this.brush(e));grid.addEventListener('pointerup',e=>this.stopBrush(e));grid.addEventListener('pointercancel',e=>this.stopBrush(e));grid.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')this.stopBrush(e)})}
  authorize(tile){
    this.authorized=tile;this.brushProgress=0;this.lastBrushPoint=null;this.brushDustDistance=0;
    const d=$(`.dig-tile[data-tile="${tile}"]`),n=this.zoneCleared+1,total=this.zoneSize||1;
    d.classList.add('authorized');
    this.loadTileImage(tile);
    d.innerHTML=`<span class="dig-label">ZONE ${n}/${total}<br>PRESS + DRAG</span><span class="brushbar"><i></i></span>`;
    $('#permitStamp').classList.add('show');
    $('#permitMessage').textContent=`Investigation ${this.current+1} accepted. Dig zone contains ${total} sector${total===1?'':'s'}. Brush sector ${n} of ${total}.`;
    $('#digStatus').innerHTML=`<span class="lamp"></span><span>Evidence accepted · brush each authorized sector in this ${total}-sector zone.</span>`;
    $('#coordReadout').textContent=`SECTOR ${d.dataset.coord} · ZONE ${n}/${total} AUTHORIZED`;
    this.tone(760,.12,.03,'triangle');setTimeout(()=>this.tone(980,.13,.025,'triangle'),95);d.scrollIntoView({behavior:'smooth',block:'center'});
  }

  startBrush(ev){const d=ev.target.closest('.dig-tile');if(!d||!d.classList.contains('authorized'))return;this.brushing=true;this.lastBrushPoint={x:ev.clientX,y:ev.clientY};this.brushDustDistance=0;try{d.setPointerCapture(ev.pointerId)}catch(_){}ev.preventDefault()}
  stopBrush(ev){this.brushing=false;this.lastBrushPoint=null;try{ev.target.releasePointerCapture?.(ev.pointerId)}catch(_){}}
  brush(ev){if(!this.brushing||this.authorized===null)return;if(ev.pointerType==='mouse'&&!(ev.buttons&1)){this.stopBrush(ev);return}const d=$(`.dig-tile[data-tile="${this.authorized}"]`),p={x:ev.clientX,y:ev.clientY};if(!this.lastBrushPoint){this.lastBrushPoint=p;return}const dist=Math.hypot(p.x-this.lastBrushPoint.x,p.y-this.lastBrushPoint.y);this.lastBrushPoint=p;if(dist<2)return;this.brushProgress=Math.min(100,this.brushProgress+Math.min(6,dist*.28));this.brushDustDistance+=dist;d.style.setProperty('--dirt-opacity',String(1-this.brushProgress/100));const bar=$('.brushbar i',d);if(bar)bar.style.width=this.brushProgress+'%';if(this.brushDustDistance>=9){this.dust(ev,d);this.brushDustDistance=0;this.tone(140,.02,.005,'sawtooth')}if(this.brushProgress>=100)this.finishBrush(d)}
  dust(ev,d){const r=d.getBoundingClientRect(),p=document.createElement('i');p.className='dust';p.style.left=(ev.clientX-r.left)+'px';p.style.top=(ev.clientY-r.top)+'px';p.style.setProperty('--dx',(Math.random()*40-20)+'px');p.style.setProperty('--dy',(Math.random()*-38-7)+'px');d.appendChild(p);setTimeout(()=>p.remove(),680)}
  finishBrush(d){
    this.brushing=false;d.classList.remove('authorized');d.classList.add('cleared');d.innerHTML='';
    const finished=this.authorized;this.cleared.push(finished);this.authorized=null;this.zoneCleared++;
    $('#digPct').textContent=Math.round(this.cleared.length/this.totalSectors*100)+'%';
    $('#permitStatus').textContent=`Day ${this.config.day} of ${this.config.caseDays||this.config.totalDays||1} · ${this.cleared.length}/${this.totalSectors} fossil squares uncovered · identity sealed`;
    $('#coordReadout').textContent=`SECTOR ${d.dataset.coord} · CLEARED`;
    this.tone(880,.12,.03,'triangle');setTimeout(()=>this.tone(1170,.15,.025,'sine'),100);this.toast(`Fossil square ${d.dataset.coord} uncovered`);
    try{this.opts.onEvent?.({type:'sectorCleared',caseId:this.config.caseId,day:this.config.day,investigationId:this.config.investigations[this.current]?.id,tile:finished,zoneIndex:this.zoneCleared,zoneSize:this.zoneSize,cleared:[...this.cleared]})}catch(_){}
    if(this.pendingZone.length){
      $('#permitStamp').classList.add('show');$('#digStatus').classList.remove('done');
      $('#digStatus').innerHTML=`<span class="lamp"></span><span>${this.pendingZone.length} sector${this.pendingZone.length===1?'':'s'} remain in this excavation zone.</span>`;
      setTimeout(()=>this.authorizeNextZoneTile(),420);return;
    }
    $('#permitStamp').classList.remove('show');$('#digStatus').classList.add('done');
    $('#digStatus').innerHTML='<span class="lamp"></span><span>Excavation zone secured · next investigation unlocked.</span>';
    this.zoneSize=0;this.zoneCleared=0;this.advanceAfterZone();
  }

  renderComplete(){const c=this.config;$('#progressCount').textContent=`${c.investigations.length}/${c.investigations.length}`;$('#activityMount').innerHTML=`<div class="engine-complete"><div class="seal">✓</div><h3>Research Day ${c.day} Complete</h3><p>${c.completeText}</p><div class="recap-grid">${c.recap.map(x=>`<div class="recap-tile"><i>${x.icon}</i><b>${esc(x.title)}</b><span>${x.text}</span></div>`).join('')}</div>${c.completionBanner===false?'':`<div class="sealed-banner" style="margin-top:14px">${c.completionBanner||'🔒 IDENTITY STILL SEALED · Keep using the full evidence set. One clue alone does not name the animal.'}</div>`}</div>`;$('#digStatus').classList.add('done');$('#digStatus').innerHTML=`<span class="lamp"></span><span>Day ${c.day} excavation complete · ${this.cleared.length-this.dayStartCleared} fossil squares uncovered today.</span>`;$('#coordReadout').textContent=`DAY ${c.day} FIELDWORK COMPLETE`;try{this.opts.onEvent?.({type:'dayComplete',caseId:c.caseId,day:c.day,cleared:[...this.cleared],state:this.state})}catch(_){}}

  async hydrateVisuals(root=document){for(const card of $$('[data-visual-key]',root)){if(card.dataset.hydrated)continue;card.dataset.hydrated='1';const key=card.dataset.visualKey;try{const data=await this.fetchVisual(key),shell=$('[data-image]',card),credit=$('[data-credit]',card),source=$('[data-source]',card);const img=new Image();img.loading='lazy';img.alt=data.alt||data.title;img.src=data.thumb;shell.innerHTML='';shell.appendChild(img);credit.textContent=`${data.artist} · ${data.license}`;source.href=data.source;source.hidden=false}catch(e){const shell=$('[data-image]',card),credit=$('[data-credit]',card);shell.innerHTML='<div class="visual-fallback"><i>🔬</i><b>Image unavailable</b><span>The lesson still works without it.</span></div>';credit.textContent='Curated image could not load right now.'}}}
  async fetchVisual(key){if(this.visualCache.has(key))return this.visualCache.get(key);const v=this.config.visualManifest[key];if(!v)throw new Error('visual not allowlisted');if(typeof this.opts.visualResolver==='function'){const p=Promise.resolve(this.opts.visualResolver(key,v,this.config));this.visualCache.set(key,p);return p}const p=(async()=>{const api='https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=850&format=json&origin=*&titles='+encodeURIComponent(v.file);const d=await fetch(api,{mode:'cors',credentials:'omit'}).then(r=>r.json()),page=Object.values(d.query?.pages||{})[0],ii=page?.imageinfo?.[0];if(!ii)throw 0;const meta=ii.extmetadata||{},strip=x=>{const z=document.createElement('div');z.innerHTML=String(x||'');return(z.textContent||'').replace(/\s+/g,' ').trim()},license=strip(meta.LicenseShortName?.value||v.license),artist=strip(meta.Artist?.value||v.credit),safe=(url,host)=>{try{const u=new URL(url);return u.protocol==='https:'&&u.hostname===host?u.href:''}catch(_){return''}},thumb=safe(ii.thumburl||ii.url,'upload.wikimedia.org'),source=safe(ii.descriptionurl,'commons.wikimedia.org');if(!thumb||!source)throw new Error('unexpected media host');if(!/^(public domain|cc0|cc by|creative commons attribution)/i.test(license))throw new Error('license rejected');return{...v,thumb,source,license,artist}})();this.visualCache.set(key,p);return p}
  async openCodex(key){const b=$('#visualCodexBackdrop'),body=$('#visualCodexBody'),v=this.config.visualManifest[key];b.classList.add('show');body.innerHTML='<div class="visual-fallback"><i>🔬</i><b>Loading curated science visual…</b></div>';try{const d=await this.fetchVisual(key);body.innerHTML=`<img src="${d.thumb}" alt="${esc(d.alt||d.title)}"><div class="codex-copy"><h3>${esc(d.title)}</h3><p>${d.caption}</p><p><b>Why it is here:</b> ${d.why||'This visual supports the lesson.'}</p><p>${esc(d.artist)} · ${esc(d.license)} · <a href="${d.source}" target="_blank" rel="noopener">View source/license</a></p></div>`}catch(_){body.innerHTML='<div class="visual-fallback"><i>🔬</i><b>Visual unavailable right now</b><span>The lesson remains fully usable.</span></div>'}}
}

DeepTimeEngine.customRenderers=Object.create(null);
DeepTimeEngine.registerActivityType=function(type,renderer){if(!type||!renderer)throw new Error('type and renderer required');DeepTimeEngine.customRenderers[type]=renderer};
global.DeepTimeEngine=DeepTimeEngine;
})(window);
