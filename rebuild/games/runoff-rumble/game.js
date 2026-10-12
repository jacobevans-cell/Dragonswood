/* Dragonswood Watershed Studio: an exploratory classroom model, not a flood forecast. */
'use strict';
const COLS=8, ROWS=5, COUNT=COLS*ROWS, KEY='dw-watershed-studio-v2';
const covers={
  forest:{name:'Forest',icon:'🌳',group:'Natural',capacity:39,held:6,storage:0,risk:.12,about:'Trees intercept rain. Roots and leaf litter help water enter soil.'},
  grass:{name:'Grass',icon:'🌱',group:'Natural',capacity:27,held:2,storage:0,risk:.22,about:'Grass slows water and usually allows more infiltration than pavement.'},
  meadow:{name:'Meadow',icon:'🌼',group:'Natural',capacity:32,held:4,storage:0,risk:.13,about:'Dense, varied plants catch rain and protect the soil.'},
  shrub:{name:'Shrubs',icon:'🌿',group:'Natural',capacity:33,held:4,storage:0,risk:.16,about:'Shrubs intercept rain and help slow downhill flow.'},
  farm:{name:'Cropland',icon:'🌾',group:'Working land',capacity:16,held:1,storage:0,risk:.7,about:'Crops use the soil, but exposed rows can send sediment toward the stream.'},
  bare:{name:'Bare soil',icon:'🟫',group:'Working land',capacity:8,held:0,storage:0,risk:1,about:'Uncovered soil is vulnerable to erosion when water runs across it.'},
  compacted:{name:'Packed soil',icon:'👣',group:'Working land',capacity:5,held:0,storage:0,risk:.68,about:'Foot or vehicle traffic can pack soil and reduce infiltration.'},
  mulch:{name:'Mulch',icon:'🪵',group:'Working land',capacity:24,held:3,storage:1,risk:.2,about:'A mulch layer protects soil and slows raindrops and runoff.'},
  roof:{name:'Roof',icon:'🏠',group:'Built surfaces',capacity:0,held:0,storage:0,risk:.53,about:'Rain cannot soak through an ordinary roof; it runs to an edge or drain.'},
  greenroof:{name:'Green roof',icon:'🏡',group:'Built surfaces',capacity:9,held:3,storage:10,risk:.2,about:'Plants and growing media can hold part of a storm on a roof.'},
  pavement:{name:'Pavement',icon:'🛣️',group:'Built surfaces',capacity:1,held:0,storage:0,risk:.78,about:'Most water flows across sealed pavement and may carry material along.'},
  permeable:{name:'Permeable path',icon:'🧱',group:'Built surfaces',capacity:19,held:0,storage:4,risk:.3,about:'Gaps and a stone base let some water pass through and pause.'},
  gravel:{name:'Gravel',icon:'🪨',group:'Built surfaces',capacity:13,held:0,storage:2,risk:.42,about:'Gravel slows some water, but the soil beneath still matters.'},
  wetland:{name:'Wetland',icon:'🪷',group:'Solutions',capacity:34,held:6,storage:18,risk:.1,about:'Wetland plants and shallow storage slow water before it reaches the stream.'},
  garden:{name:'Rain garden',icon:'🌻',group:'Solutions',capacity:45,held:4,storage:14,risk:.12,about:'A planted low area catches runoff so more water can infiltrate.'},
  barrel:{name:'Rain barrel',icon:'🛢️',group:'Solutions',capacity:3,held:0,storage:23,risk:.19,about:'A barrel stores roof runoff for later use, but its space is limited.'},
  pond:{name:'Pond',icon:'💧',group:'Solutions',capacity:5,held:0,storage:32,risk:.22,about:'A pond delays water that would otherwise rush into the stream.'},
  buffer:{name:'Stream buffer',icon:'🌾',group:'Solutions',capacity:36,held:4,storage:5,risk:.08,about:'Plants near a stream can slow runoff and help protect its banks.'}
};
const soilFactors={A:1.35,B:1,C:.7,D:.4};
const moistureFactors={dry:1.15,normal:1,wet:.65,saturated:.25};
const missions={
  free:{intro:'Change any landscape or storm condition. Make a prediction, run the storm, then inspect where water went.',checks:()=>[]},
  town:{intro:'A town needs buildings and travel space. Try to keep those while reducing stream runoff.',checks:(m,s,r)=>[['At least 8 built-surface tiles',count(m,['roof','greenroof','pavement','permeable','gravel'])>=8],['No more than 40% of rain reaches the stream',r.runoffPct<=40]]},
  farm:{intro:'Keep land for growing food and find ways to protect the stream.',checks:(m,s,r)=>[['At least 8 cropland tiles',count(m,['farm'])>=8],['No more than 45% of rain reaches the stream',r.runoffPct<=45]]},
  cloudburst:{intro:'Design for a sudden heavy storm. Can your watershed slow the rush?',checks:(m,s,r)=>[['Rainfall is at least 70 mm',s.rain>=70],['Storm pattern is a cloudburst',s.stormType==='burst'],['No more than 50% reaches the stream',r.runoffPct<=50]]},
  restore:{intro:'Start with a steep, exposed hillside and experiment with ways to restore its cover.',checks:(m,s,r)=>[['Slope is at least 4 of 5',s.slope>=4],['No more than 4 bare-soil tiles remain',count(m,['bare'])<=4],['No more than 45% reaches the stream',r.runoffPct<=45]]}
};
function count(map,types){return map.filter(x=>types.includes(x)).length}
function preset(which){return Array.from({length:COUNT},(_,i)=>{
  const row=Math.floor(i/COLS),col=i%COLS;
  if(which==='blank')return 'grass';
  if(which==='forest')return row===4&&col===3?'wetland':'forest';
  if(which==='farm')return row===4?'buffer':col===3?'bare':col===6?'grass':'farm';
  if(which==='parking')return row===4?'grass':col===0||col===7?'roof':'pavement';
  if(which==='restored')return row===4?'buffer':col===3||col===4?'permeable':(row===1&&col===1?'greenroof':row===2&&col===6?'garden':col<2?'forest':'grass');
  return row===4?(col===3||col===4?'wetland':'grass'):col===3||col===4?'pavement':((row===1||row===2)&&(col===1||col===6)?'roof':(col<2?'forest':'grass'));
})}
function simulate(map,settings){
  const nextWidth=COLS, totalRain=settings.rain*COUNT;
  let incoming=Array(nextWidth).fill(0),stream=0,soaked=0,held=0,stored=0,pressure=0;
  const cells=[];
  const durationFactor=Math.sqrt(settings.duration);
  const slopeFactor=1-.10*(settings.slope-1);
  const stormFactor=settings.stormType==='burst'?.68:1;
  const moistureFactor=moistureFactors[settings.moisture]??1;
  const soilFactor=soilFactors[settings.soil]??1;
  for(let row=0;row<ROWS;row++){
    const next=Array(nextWidth).fill(0);
    for(let col=0;col<COLS;col++){
      const i=row*COLS+col, id=map[i], cover=covers[id]||covers.grass;
      const rain=settings.rain, arrival=incoming[col];
      const intercepted=Math.min(rain,cover.held);
      const available=Math.max(0,rain+arrival-intercepted);
      const retained=Math.min(available,cover.storage);
      const capacity=cover.capacity*soilFactor*moistureFactor*durationFactor*slopeFactor*stormFactor;
      const infiltrated=Math.min(available-retained,capacity);
      const flowing=Math.max(0,available-retained-infiltrated);
      held+=intercepted;stored+=retained;soaked+=infiltrated;
      pressure+=flowing*cover.risk;
      cells[i]={cover:id,rain,arrival,intercepted,retained,infiltrated,flowing};
      if(row===ROWS-1)stream+=flowing;
      else{const side=col===COLS-1?col-1:col+1;next[col]+=flowing*.86;next[side]+=flowing*.14}
    }
    incoming=next;
  }
  const perArea=x=>x/COUNT;
  const pct=x=>x/totalRain*100;
  const waterPressure=Math.min(100,pressure/(totalRain*ROWS)*100);
  return{rain:settings.rain,runoff:perArea(stream),soaked:perArea(soaked),held:perArea(held),stored:perArea(stored),runoffPct:pct(stream),soakPct:pct(soaked),heldPct:pct(held),storedPct:pct(stored),waterPressure,cells,hard:count(map,['roof','pavement']),totalRain};
}
globalThis.RunoffStudio={simulate,preset,covers,COLS,ROWS};
if(typeof document!=='undefined')init();

function init(){
  const $=id=>document.getElementById(id);
  let state={map:preset('town'),brush:'forest',mode:'paint',rain:40,duration:2,soil:'B',slope:3,moisture:'normal',stormType:'steady',mission:'free',notebook:'',samples:[null,null]};
  try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&Array.isArray(saved.map)&&saved.map.length===COUNT&&saved.map.every(x=>covers[x]))state={...state,...saved,map:saved.map,samples:Array.isArray(saved.samples)?saved.samples.slice(0,2):[null,null]}}catch{}
  if(!covers[state.brush])state.brush='forest';
  if(!missions[state.mission])state.mission='free';
  if(!moistureFactors[state.moisture])state.moisture='normal';
  if(!['steady','burst'].includes(state.stormType))state.stormType='steady';
  if(!['paint','inspect'].includes(state.mode))state.mode='paint';
  const keep=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
  const fmt=n=>`${n.toFixed(1)} mm`;
  const percent=n=>`${n.toFixed(0)}%`;
  function paintTools(){
    const root=$('tools');root.replaceChildren();let group='';
    for(const [id,cover] of Object.entries(covers)){
      if(cover.group!==group){group=cover.group;const h=document.createElement('div');h.className='covergroup';h.textContent=group;root.append(h)}
      const b=document.createElement('button');b.className='tool';b.type='button';b.textContent=`${cover.icon} ${cover.name}`;b.setAttribute('aria-pressed',String(state.brush===id));b.onclick=()=>{state.brush=id;state.mode='paint';paintTools();setModeButtons();keep()};root.append(b);
    }
  }
  function setModeButtons(){for(const mode of ['paint','inspect']){const b=$(mode+'Mode');b.classList.toggle('primary',state.mode===mode);b.setAttribute('aria-pressed',String(state.mode===mode))}}
  function drawMap(result){
    const land=$('land');land.replaceChildren();
    for(let i=0;i<COUNT;i++){
      const type=state.map[i],cover=covers[type],cell=result.cells[i],button=document.createElement('button');
      button.type='button';button.className=`cell ${type}`;button.dataset.i=String(i);
      button.setAttribute('aria-label',`Row ${Math.floor(i/COLS)+1}, column ${i%COLS+1}: ${cover.name}. ${state.mode==='inspect'?'Inspect water movement.':`Paint ${covers[state.brush].name}.`}`);
      const wet=document.createElement('span');wet.className='wet';wet.style.setProperty('--wet',`${Math.min(75,cell.flowing/Math.max(1,state.rain)*75).toFixed(0)}%`);
      const icon=document.createElement('span');icon.className='icon';icon.textContent=cover.icon;
      const name=document.createElement('span');name.className='name';name.textContent=cover.name;
      button.append(wet,icon,name);land.append(button);
    }
  }
  function inspect(i,result){
    const cell=result.cells[i],cover=covers[cell.cover];
    $('tileInfo').textContent=`Row ${Math.floor(i/COLS)+1}, column ${i%COLS+1} · ${cover.name}. ${cover.about} Here: ${fmt(cell.arrival)} arrived from uphill; ${fmt(cell.intercepted)} was held by plants, ${fmt(cell.retained)} stored, ${fmt(cell.infiltrated)} soaked in, and ${fmt(cell.flowing)} kept moving downhill. These are model amounts for this tile, not field measurements.`;
  }
  function summary(r){
    const causes=[];
    if(count(state.map,['roof','pavement'])>=8)causes.push('Many sealed surfaces send rain downhill');
    if(state.moisture==='wet'||state.moisture==='saturated')causes.push('already-wet soil absorbs less');
    if(state.stormType==='burst')causes.push('a cloudburst leaves less time for infiltration');
    if(count(state.map,['garden','wetland','barrel','pond','buffer','greenroof'])>=8)causes.push('storage and planted features hold some water');
    const lead=causes.length?`${causes.join('; ')}. `:'Land cover and soil change the route rain takes. ';
    return `${lead}${percent(r.runoffPct)} of this storm reaches the stream in this model. Change one condition and save A and B to see its effect.`;
  }
  function indicator(r){
    const runoff=r.runoffPct;
    $('streamLevel').textContent=runoff<25?'Lower stream response':runoff<55?'Moderate stream response':'Higher stream response';
    $('streamDetail').textContent=`${percent(runoff)} of rain reached the stream. This is a relative classroom indicator.`;
    $('waterQuality').textContent=r.waterPressure<8?'Lower water-quality pressure':r.waterPressure<25?'Moderate water-quality pressure':'Higher water-quality pressure';
    $('qualityDetail').textContent='Estimated from water flowing over exposed and built surfaces; it is not a pollutant measurement.';
  }
  function drawMission(r){
    const mission=missions[state.mission];$('missionIntro').textContent=mission.intro;
    const list=$('missionChecks');list.replaceChildren();
    for(const [label,met] of mission.checks(state.map,state,r)){
      const li=document.createElement('li');li.className=met?'met':'unmet';li.textContent=`${met?'✓':'○'} ${label}`;list.append(li);
    }
    if(state.mission==='free'){const li=document.createElement('li');li.textContent='Try a prediction, test it, and use Inspect to trace the water.';list.append(li)}
  }
  function drawComparison(){
    for(let i=0;i<2;i++){
      const sample=state.samples[i],el=$('sample'+(i?'B':'A'));
      if(!sample){el.textContent=`${i?'B':'A'} · ${i?'Change one thing, then save again.':'Save a watershed to compare.'}`;continue}
      el.textContent=`Experiment ${i?'B':'A'} · Stream ${fmt(sample.result.runoff)} · Soaked ${fmt(sample.result.soaked)} · Stored ${fmt(sample.result.stored)} · ${sample.hard} sealed tiles · ${sample.settings.rain} mm rain`;
    }
    const [a,b]=state.samples;
    if(!a||!b){$('comparison').textContent='Save A and B to compare two designs or storms.';return}
    const change=b.result.runoff-a.result.runoff;
    const sameStorm=['rain','duration','soil','slope','moisture','stormType'].every(k=>a.settings[k]===b.settings[k]);
    $('comparison').textContent=`From A to B, stream runoff ${Math.abs(change)<.05?'stayed about the same':change>0?`rose by ${fmt(change)}`:`fell by ${fmt(-change)}`}. ${sameStorm?'The storm settings match, so look at the land-cover changes.':'Storm settings also changed. Keep them the same to isolate the effect of land cover.'}`;
  }
  function render(){
    $('rainAmount').value=state.rain;$('duration').value=state.duration;$('soil').value=state.soil;$('slope').value=state.slope;$('moisture').value=state.moisture;$('stormType').value=state.stormType;$('mission').value=state.mission;
    $('rainValue').textContent=`${state.rain} mm`;$('durationValue').textContent=`${state.duration} ${state.duration===1?'hour':'hours'}`;$('slopeValue').textContent=`${state.slope} / 5`;
    const r=simulate(state.map,state);drawMap(r);
    for(const [id,value] of [['runoffAmount',r.runoff],['soakAmount',r.soaked],['heldAmount',r.held],['storedAmount',r.stored]])$(id).textContent=fmt(value);
    for(const [id,value] of [['runoffBar',r.runoffPct],['soakBar',r.soakPct],['heldBar',r.heldPct],['storedBar',r.storedPct]])$(id).style.width=`${Math.max(0,Math.min(100,value))}%`;
    $('explain').textContent=summary(r);indicator(r);drawMission(r);drawComparison();setModeButtons();keep();return r;
  }
  function applyCover(i){if(!Number.isInteger(i)||i<0||i>=COUNT||state.map[i]===state.brush)return;state.map[i]=state.brush;render();$('status').textContent=`Painted ${covers[state.brush].name}. Inspect this tile or compare the stream totals.`}
  let dragging=false;
  $('land').addEventListener('pointerdown',e=>{if(state.mode==='paint'&&e.target.closest('.cell'))dragging=true});
  window.addEventListener('pointerup',()=>dragging=false);
  $('land').addEventListener('pointerover',e=>{if(dragging&&state.mode==='paint'){const cell=e.target.closest('.cell');if(cell)applyCover(Number(cell.dataset.i))}});
  $('land').addEventListener('click',e=>{const cell=e.target.closest('.cell');if(!cell)return;const i=Number(cell.dataset.i);if(state.mode==='inspect')inspect(i,simulate(state.map,state));else applyCover(i)});
  $('paintMode').onclick=()=>{state.mode='paint';setModeButtons();drawMap(simulate(state.map,state));keep()};
  $('inspectMode').onclick=()=>{state.mode='inspect';setModeButtons();drawMap(simulate(state.map,state));keep();$('status').textContent='Choose a tile to trace how water moves through it.'};
  for(const id of ['rainAmount','duration','slope'])$(id).addEventListener('input',e=>{state[{rainAmount:'rain',duration:'duration',slope:'slope'}[id]]=Number(e.target.value);render()});
  for(const id of ['soil','moisture','stormType','mission'])$(id).addEventListener('change',e=>{state[id]=e.target.value;render()});
  $('presets').addEventListener('click',e=>{const button=e.target.closest('[data-preset]');if(!button)return;state.map=preset(button.dataset.preset);render();$('status').textContent=`Loaded ${button.textContent.trim()}. Change one factor and see what happens.`});
  $('run').onclick=()=>{render();$('mapbox').classList.remove('raining');void $('mapbox').offsetWidth;$('mapbox').classList.add('raining');$('status').textContent='Storm running through your watershed…';setTimeout(()=>{$('mapbox').classList.remove('raining');$('status').textContent='Storm finished. Inspect the land or test another design.'},1300)};
  function capture(slot){const r=simulate(state.map,state);state.samples[slot]={result:{runoff:r.runoff,soaked:r.soaked,held:r.held,stored:r.stored},settings:{rain:state.rain,duration:state.duration,soil:state.soil,slope:state.slope,moisture:state.moisture,stormType:state.stormType},hard:r.hard,map:[...state.map]};drawComparison();keep();$('status').textContent=`Saved experiment ${slot?'B':'A'}. Change one thing and compare.`}
  $('saveA').onclick=()=>capture(0);$('saveB').onclick=()=>capture(1);$('clearCompare').onclick=()=>{state.samples=[null,null];drawComparison();keep();$('status').textContent='Comparison cleared.'};
  $('notebook').value=typeof state.notebook==='string'?state.notebook:'';
  $('notebook').addEventListener('input',e=>{state.notebook=e.target.value;keep()});
  paintTools();render();
}
