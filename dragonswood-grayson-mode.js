/* Dragonswood Grayson Mode v58.0
   Optional, reward-free Grade 7–10 challenge layer.
   Primary challenges mirror the current page/topic. Every third challenge is a
   harder cross-subject Math/Science problem. Skips are always available and
   never affect Dragonswood progress or rewards. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports) module.exports=api;
  if(typeof window!=='undefined'){
    window.DWGraysonEngine=api;
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>api.mount(),{once:true});
    else api.mount();
  }
})(this,function(){
'use strict';

const VERSION='58.0';
let round=0,correct=0,answered=0,skipped=0,current=null,resolved=false;

const hash=s=>{let h=2166136261>>>0;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const pick=(a,n)=>a[Math.abs(Number(n)||0)%a.length];
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const frac=(n,d)=>{const g=gcd(n,d);return `${n/g}/${d/g}`};
const money=n=>Number(n).toFixed(2);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function shuffle(arr,n){return [...arr].sort((a,b)=>hash(`${a}|${n}`)-hash(`${b}|${n}`));}
function numericChoices(answer,n,step=1,decimals=0){
  const v=Number(answer),deltas=[-3,-2,-1,1,2,3,4,-4],out=new Set([Number(v).toFixed(decimals)]);
  for(let i=0;out.size<4&&i<20;i++) out.add((v+deltas[(n+i*5)%deltas.length]*step).toFixed(decimals));
  return shuffle([...out].slice(0,4),n);
}
function choiceProblem(meta){
  const choices=shuffle([...new Set(meta.choices.map(String))],meta.seed||0).slice(0,4);
  if(!choices.includes(String(meta.answer))) choices[choices.length-1]=String(meta.answer);
  return {...meta,answer:String(meta.answer),choices:shuffle(choices,Number(meta.seed||0)+19)};
}
function gradeForRound(r){return 7+((Math.max(1,r)-1)%4);}

function visibleContextText(){
  if(typeof document==='undefined') return '';
  const selectors=['[aria-current="step"]','[aria-current="true"]','.active','.current','.question','.prompt','.mission-instruction','.cell-instruction','#stepText','#boardTitle','main h1','main h2','main h3'];
  const parts=[];
  for(const sel of selectors){
    for(const el of document.querySelectorAll(sel)){
      if(parts.length>24) break;
      const cs=window.getComputedStyle?getComputedStyle(el):null;
      if(cs && (cs.display==='none'||cs.visibility==='hidden')) continue;
      const t=(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim();
      if(t&&t.length<700) parts.push(t);
    }
  }
  return parts.join(' ').slice(0,4500);
}
function detectContext(input={}){
  const page=String(input.page ?? (typeof location!=='undefined'?(location.pathname.split('/').pop()||''):'')).toLowerCase();
  const title=String(input.title ?? (typeof document!=='undefined'?document.title:'')).toLowerCase();
  const visible=String(input.visible ?? visibleContextText()).toLowerCase();
  const text=`${page} ${title} ${visible}`;
  let subject='math',topic='operations',label='Math • Operations';

  if(/fraction|numerator|denominator|mixed number/.test(text)){subject='math';topic='fraction';label='Math • Fractions';}
  else if(/decimal|percent|percentage|discount|place value/.test(text)){subject='math';topic='decimal';label='Math • Decimals & Percents';}
  else if(/division|divide|quotient|remainder/.test(text)){subject='math';topic='division';label='Math • Division';}
  else if(/multiplication|multiply|product/.test(text)){subject='math';topic='operations';label='Math • Multiplication / Operations';}
  else if(/equation|algebra|solve for x|linear|slope/.test(text)){subject='math';topic='algebra';label='Math • Algebra';}
  else if(/geometry|area|volume|angle|triangle|coordinate/.test(text)){subject='math';topic='geometry';label='Math • Geometry';}
  else if(/element|atom|periodic|reaction|molecule|chem|forge/.test(text)){subject='science';topic='chemistry';label='Science • Chemistry';}
  else if(/solar|orbit|planet|gravity|space|cosmic|astronom/.test(text)){subject='science';topic='astronomy';label='Science • Space & Physics';}
  else if(/force|motion|velocity|energy|wave|physics/.test(text)){subject='science';topic='physics';label='Science • Physical Science';}
  else if(/cell|genetic|dna|ecosystem|organism|biology|photosynthesis/.test(text)){subject='science';topic='biology';label='Science • Life Science';}
  else if(/science|experiment|matter|weather|earth/.test(text)){subject='science';topic='science';label='Science • Reasoning';}
  else if(/spelling|grammar|language|morph|word study|vocabulary/.test(text)){subject='ela';topic='language';label='ELA • Language';}
  else if(/reading|reader|witch|passage|text evidence|inference|theme/.test(text)){subject='ela';topic='reading';label='ELA • Reading';}
  else if(/writing|essay|paragraph|thesis|claim|evidence/.test(text)){subject='ela';topic='writing';label='ELA • Writing';}
  else if(/history|social studies|civics|government|constitution|geography/.test(text)){subject='history';topic='history';label='History / Social Studies';}
  else if(/math|number|operation|add|subtract/.test(text)){subject='math';topic='operations';label='Math • Operations';}

  // Strong page-name overrides for known games beat stray visible words.
  if(/fraction-forge/.test(page)) return {subject:'math',topic:'fraction',label:'Math • Fractions',page};
  if(/decimal-deception/.test(page)) return {subject:'math',topic:'decimal',label:'Math • Decimals & Percents',page};
  if(/long-division/.test(page)) return {subject:'math',topic:'division',label:'Math • Division',page};
  if(/math-operations/.test(page)){
    if(typeof document!=='undefined'){
      const op=document.querySelector('.op-btn.active')?.dataset?.operation;
      if(op==='division') return {subject:'math',topic:'division',label:'Math • Division',page};
      if(op==='subtraction'||op==='addition'||op==='multiplication') return {subject:'math',topic:'operations',label:`Math • ${op[0].toUpperCase()+op.slice(1)}`,page};
    }
    return {subject:'math',topic, label, page};
  }
  if(/elemental-laboratory|arcane-forge/.test(page)) return {subject:'science',topic:'chemistry',label:'Science • Chemistry',page};
  if(/cosmic-architect/.test(page)) return {subject:'science',topic:'astronomy',label:'Science • Space & Physics',page};
  if(/spelling-practice/.test(page)) return {subject:'ela',topic:'language',label:'ELA • Language',page};
  if(/witches|reader/.test(page)) return {subject:'ela',topic:'reading',label:'ELA • Reading',page};
  return {subject,topic,label,page};
}

const mathFactories={
  operations(grade,n){
    const a=18+n%23,b=5+(n>>4)%14,c=3+(n>>8)%8,d=2+(n>>11)%5;
    if(grade>=9){const x=3+n%9,ans=(x+d)*(x-d)+b;return choiceProblem({seed:n,subject:'math',topic:'operations',lesson:'Use structure before arithmetic: (x+d)(x−d)=x²−d². Then combine remaining terms.',prompt:`Evaluate (${x}+${d})(${x}−${d}) + ${b}.`,answer:ans,choices:numericChoices(ans,n,3),why:`Difference of squares gives ${x*x}−${d*d}=${x*x-d*d}; add ${b} to get ${ans}.`});}
    const ans=(a-b)*c+d*d;return choiceProblem({seed:n,subject:'math',topic:'operations',lesson:'Use grouping symbols and exponents before multiplication and addition/subtraction.',prompt:`Evaluate (${a} − ${b}) × ${c} + ${d}².`,answer:ans,choices:numericChoices(ans,n,4),why:`(${a}−${b})=${a-b}; ×${c}=${(a-b)*c}; ${d}²=${d*d}; total ${ans}.`});
  },
  division(grade,n){
    if(grade>=9){const a=3+n%8,b=2+(n>>5)%6,k=2+(n>>9)%5,ans=a*k;return choiceProblem({seed:n,subject:'math',topic:'division',lesson:'Dividing by a fraction means multiplying by its reciprocal.',prompt:`Solve: x ÷ (${a}/${b}) = ${k*b}. What is x?`,answer:ans,choices:numericChoices(ans,n,2),why:`Multiply both sides by ${a}/${b}: x=${k*b}×${a}/${b}=${ans}.`});}
    const divisor=7+n%8,q=24+(n>>4)%42,r=1+(n>>10)%(divisor-1),total=divisor*q+r,ans=`${q} R${r}`;
    return choiceProblem({seed:n,subject:'math',topic:'division',lesson:'A remainder must be less than the divisor. Check by multiplying quotient × divisor, then adding the remainder.',prompt:`Compute ${total} ÷ ${divisor}. Give quotient and remainder.`,answer:ans,choices:[ans,`${q+1} R${Math.max(0,r-divisor)}`,`${q} R${divisor-r}`,`${q-1} R${r+divisor}`],why:`${divisor}×${q}=${divisor*q}; ${total}-${divisor*q}=${r}, so ${ans}.`});
  },
  fraction(grade,n){
    const a=2+n%7,b=5+(n>>3)%7,c=1+(n>>7)%6,d=6+(n>>10)%7;
    if(grade>=9){const x=2+n%8,num=a*x,ans=x;return choiceProblem({seed:n,subject:'math',topic:'fraction',lesson:'To solve a rational equation, multiply both sides by the denominator, then isolate the variable.',prompt:`Solve: (${a}x)/${b} = ${num}/${b}.`,answer:ans,choices:numericChoices(ans,n,1),why:`Multiply by ${b}: ${a}x=${num}. Divide by ${a}: x=${ans}.`});}
    const ans=frac(a*d+c*b,b*d);return choiceProblem({seed:n,subject:'math',topic:'fraction',lesson:'For unlike denominators, use a common denominator, combine numerators, then simplify.',prompt:`Compute and simplify: ${a}/${b} + ${c}/${d}`,answer:ans,choices:[ans,frac(a+c,b+d),frac(a*d-c*b,b*d),frac(a*d+c*b+1,b*d)],why:`Common denominator ${b*d}; numerator ${a}×${d}+${c}×${b}=${a*d+c*b}; simplified result ${ans}.`});
  },
  decimal(grade,n){
    const original=60+n%81,rate=10+5*((n>>5)%7);
    if(grade>=9){const after=original*(1+rate/100),ans=rate;return choiceProblem({seed:n,subject:'math',topic:'decimal',lesson:'Percent change = (new−original) ÷ original × 100%.',prompt:`A quantity rises from ${original} to ${after.toFixed(1)}. What is the percent increase?`,answer:`${ans}%`,choices:[`${ans}%`,`${ans+5}%`,`${Math.max(0,ans-5)}%`,`${ans+10}%`],why:`(${after.toFixed(1)}−${original})÷${original}×100=${ans}%.`});}
    const sale=original*(1-rate/100);return choiceProblem({seed:n,subject:'math',topic:'decimal',lesson:'A discount multiplies the original by 1 minus the discount rate.',prompt:`A $${money(original)} item is discounted ${rate}%. What is the sale price?`,answer:`$${money(sale)}`,choices:[`$${money(sale)}`,`$${money(original*(1+rate/100))}`,`$${money(original-rate)}`,`$${money(sale+5)}`],why:`${original}×${(1-rate/100).toFixed(2)}=${money(sale)}.`});
  },
  algebra(grade,n){
    if(grade>=9){const r1=2+n%6,r2=3+(n>>4)%7,b=-(r1+r2),c=r1*r2,ans=r1;return choiceProblem({seed:n,subject:'math',topic:'algebra',lesson:'A factorable quadratic x²+bx+c can be written (x−r₁)(x−r₂). Both factors can equal zero.',prompt:`One solution of x² ${b<0?'−':'+'} ${Math.abs(b)}x + ${c} = 0 is ${r2}. What is the other solution?`,answer:ans,choices:numericChoices(ans,n,1),why:`The quadratic factors as (x−${r1})(x−${r2})=0, so the other solution is ${r1}.`});}
    const x=6+n%15,a=3+(n>>4)%7,b=8+(n>>8)%18,c=a*x-b;return choiceProblem({seed:n,subject:'math',topic:'algebra',lesson:'Undo operations in reverse order while keeping both sides balanced.',prompt:`Solve for x: ${a}x − ${b} = ${c}`,answer:x,choices:numericChoices(x,n,2),why:`Add ${b}: ${a}x=${c+b}. Divide by ${a}: x=${x}.`});
  },
  geometry(grade,n){
    const a=5+n%8,b=6+(n>>4)%9;
    if(grade>=9){const scale=2+(n>>9)%4,area=a*b,ans=area*scale*scale;return choiceProblem({seed:n,subject:'math',topic:'geometry',lesson:'When linear dimensions scale by k, area scales by k².',prompt:`A ${a}×${b} rectangle is dilated by scale factor ${scale}. What is the new area?`,answer:ans,choices:numericChoices(ans,n,area),why:`Original area ${area}. Area scale factor ${scale}²=${scale*scale}; new area ${ans}.`});}
    const c=Math.sqrt(a*a+b*b),ans=Math.round(c*10)/10;return choiceProblem({seed:n,subject:'math',topic:'geometry',lesson:'For a right triangle, a²+b²=c². The hypotenuse is the square root of the sum.',prompt:`A right triangle has legs ${a} and ${b}. Find the hypotenuse to the nearest tenth.`,answer:ans.toFixed(1),choices:numericChoices(ans,n,1,1),why:`c=√(${a*a}+${b*b})=√${a*a+b*b}≈${ans.toFixed(1)}.`});
  }
};

const scienceFactories={
  chemistry(grade,n){
    const protons=6+n%14,neutrons=6+(n>>4)%18;
    if(grade>=9){const mass=24+(n%37),vol=3+(n>>5)%9,ans=mass/vol;return choiceProblem({seed:n,subject:'science',topic:'chemistry',lesson:'Density is mass divided by volume: d=m/V. Track units as g/mL or g/cm³.',prompt:`A sample has mass ${mass} g and volume ${vol} mL. What is its density to the nearest tenth?`,answer:`${ans.toFixed(1)} g/mL`,choices:numericChoices(ans,n,1,1).map(x=>`${x} g/mL`),why:`${mass}÷${vol}=${ans.toFixed(1)} g/mL.`});}
    const charge=(n>>9)%3-1,electrons=protons-charge;return choiceProblem({seed:n,subject:'science',topic:'chemistry',lesson:'Atomic number equals protons. Ion charge = protons − electrons.',prompt:`An ion has ${protons} protons and a charge of ${charge>0?'+':''}${charge}. How many electrons does it have?`,answer:electrons,choices:numericChoices(electrons,n,1),why:`charge = p−e, so e=${protons}−(${charge})=${electrons}.`});
  },
  physics(grade,n){
    const m=4+n%12,a=2+(n>>4)%8,force=m*a;
    if(grade>=9){const v=3+(n>>8)%9,ke=.5*m*v*v;return choiceProblem({seed:n,subject:'science',topic:'physics',lesson:'Kinetic energy is KE=½mv². Square velocity before multiplying.',prompt:`A ${m} kg object moves at ${v} m/s. What is its kinetic energy?`,answer:`${ke} J`,choices:[`${ke} J`,`${m*v} J`,`${m*v*v} J`,`${.5*m*v} J`],why:`KE=½(${m})(${v}²)=${ke} J.`});}
    return choiceProblem({seed:n,subject:'science',topic:'physics',lesson:'Newton’s second law is F=ma. Force is measured in newtons.',prompt:`What net force accelerates a ${m} kg object at ${a} m/s²?`,answer:`${force} N`,choices:[`${force} N`,`${m+a} N`,`${Math.abs(m-a)} N`,`${force+a} N`],why:`F=${m}×${a}=${force} N.`});
  },
  astronomy(grade,n){
    const dist=2+n%7,time=1+(n>>5)%4,speed=dist*1000/time;
    if(grade>=9){const r=2+n%4,period=Math.round(Math.sqrt(r*r*r)*10)/10;return choiceProblem({seed:n,subject:'science',topic:'astronomy',lesson:'For objects orbiting the same star, Kepler’s third-law model is P²=a³, so P=√(a³).',prompt:`A planet has orbital semi-major axis ${r} AU. Using P²=a³, estimate its orbital period in years to the nearest tenth.`,answer:`${period.toFixed(1)} years`,choices:numericChoices(period,n,1,1).map(x=>`${x} years`),why:`P=√(${r}³)=√${r*r*r}≈${period.toFixed(1)} years.`});}
    return choiceProblem({seed:n,subject:'science',topic:'astronomy',lesson:'Average speed equals distance divided by time. Convert units before calculating if needed.',prompt:`A probe travels ${dist*1000} km in ${time} hours. What is its average speed?`,answer:`${speed} km/h`,choices:[`${speed} km/h`,`${dist*1000*time} km/h`,`${Math.round(speed/10)} km/h`,`${speed+500} km/h`],why:`${dist*1000}÷${time}=${speed} km/h.`});
  },
  biology(grade,n){
    if(grade>=9){const pct=10*(1+(n%5)),remain=100-pct;return choiceProblem({seed:n,subject:'science',topic:'biology',lesson:'Only a fraction of energy is transferred between trophic levels; the rest is used or lost as heat.',prompt:`If producers store 20,000 kJ and ${pct}% transfers to primary consumers, how much energy reaches them?`,answer:`${20000*pct/100} kJ`,choices:[`${20000*pct/100} kJ`,`${20000*(pct+5)/100} kJ`,`${20000*(Math.max(1,pct-5))/100} kJ`,`${20000*pct/10} kJ`],why:`20,000×${pct/100}=${20000*pct/100} kJ.`});}
    return choiceProblem({seed:n,subject:'science',topic:'biology',lesson:'In a simple Aa × Aa cross, the genotype ratio is 1 AA : 2 Aa : 1 aa.',prompt:'Two heterozygous parents (Aa × Aa) have offspring. What fraction are expected to be aa?',answer:'1/4',choices:['1/4','1/2','3/4','1/3'],why:'The four equally likely combinations are AA, Aa, Aa, aa. One of four is aa.'});
  },
  science(grade,n){return (grade+n)%2?scienceFactories.physics(grade,n):scienceFactories.biology(grade,n);}
};

const elaFactories={
  language(grade,n){
    const high=grade>=9;
    const choices=high?[
      'Although the storm intensified, the team continued its survey because the data were essential.',
      'Although the storm intensified the team continued, its survey because the data were essential.',
      'Although, the storm intensified the team continued its survey because the data were essential.',
      'Although the storm intensified; the team continued its survey, because the data were essential.'
    ]:[
      'The scientists, who had worked all night, presented their findings clearly.',
      'The scientists who had worked all night presented, their findings clearly.',
      'The scientists who had worked all night, presented their findings clearly.',
      'The scientists, who had worked all night presented their findings, clearly.'
    ];
    return choiceProblem({seed:n,subject:'ela',topic:'language',lesson:high?'A dependent clause beginning with although needs a comma before the independent clause; do not split the independent clause with stray commas.':'A nonessential who-clause is set off with commas; do not separate the subject from its verb.',prompt:'Which sentence is punctuated correctly?',answer:choices[0],choices,why:high?'The introductory dependent clause ends after “intensified,” so the comma belongs there.':'The who-clause adds nonessential information, so commas correctly surround it.'});
  },
  reading(grade,n){
    const passage=grade>=9?'The council praised the new transit plan as “efficient,” yet quietly delayed publishing the cost estimates until after the vote.':'Mara said the abandoned garden was useless, but she returned every afternoon with a notebook, measuring the soil and sketching where sunlight fell.';
    const opts=grade>=9?['The wording creates irony by contrasting public praise with concealed information.','The council has already published all financial details.','The transit plan is inexpensive because it is efficient.','The author believes voting should be eliminated.']:['Mara’s actions suggest she sees potential in the garden despite what she says.','Mara wants the garden permanently closed.','Mara is measuring the garden because she dislikes sunlight.','Mara has forgotten what she said earlier.'];
    return choiceProblem({seed:n,subject:'ela',topic:'reading',lesson:'Strong inference combines what the text states with what a character or author’s choices imply. Choose the claim supported by specific evidence, not a guess.',prompt:`Read: “${passage}”\nWhich inference is best supported?`,answer:opts[0],choices:opts,why:grade>=9?'The contrast between public praise and delayed cost disclosure creates irony and suggests strategic withholding.':'Her repeated measuring and planning contradict her claim that the garden is useless, implying she sees possibilities.'});
  },
  writing(grade,n){
    const opts=['Schools should start later because adolescent sleep research links adequate sleep with attention, health, and academic performance.','School start times are interesting and many people have opinions about them.','This essay will tell you about school schedules and some facts.','Everyone knows early mornings are terrible, so schools are obviously wrong.'];
    return choiceProblem({seed:n,subject:'ela',topic:'writing',lesson:'A strong argumentative thesis makes a specific, defensible claim and previews a reason that evidence can support.',prompt:'Which sentence is the strongest argumentative thesis?',answer:opts[0],choices:opts,why:'The first choice makes a clear claim and ties it to evidence-based reasons rather than announcing a topic or relying on emotion.'});
  }
};

const historyFactories={
  history(grade,n){
    const opts=grade>=9?['Compare the speech with independent records from the same event and examine the speaker’s purpose.','Assume the speech is fully objective because it is a primary source.','Reject the speech because all first-person accounts are unreliable.','Use only the date of the speech and ignore its audience.']:['Check who created the source, why it was created, and compare it with other evidence.','Believe the source if it is old enough.','Use the source only if it agrees with your first idea.','Ignore who created it because primary sources are always factual.'];
    return choiceProblem({seed:n,subject:'history',topic:'history',lesson:'Historical sourcing asks who created a source, for what audience and purpose, and how its claims compare with other evidence.',prompt:'A historian finds a political speech describing a controversial event. What is the strongest next step?',answer:opts[0],choices:opts,why:'Corroborating evidence while analyzing purpose and audience is stronger than automatically trusting or dismissing a primary source.'});
  }
};

function factoryFor(context){
  if(context.subject==='science') return scienceFactories[context.topic]||scienceFactories.science;
  if(context.subject==='ela') return elaFactories[context.topic]||elaFactories.reading;
  if(context.subject==='history') return historyFactories.history;
  return mathFactories[context.topic]||mathFactories.operations;
}
function crossContext(context,n){
  if(context.subject==='math') return {subject:'science',topic:pick(['chemistry','physics','astronomy','biology'],n),label:'Cross-Subject • Science'};
  if(context.subject==='science') return {subject:'math',topic:pick(['algebra','geometry','fraction','decimal','operations'],n),label:'Cross-Subject • Math'};
  return n%2?{subject:'math',topic:pick(['algebra','geometry','fraction','decimal'],n>>2),label:'Cross-Subject • Math'}:{subject:'science',topic:pick(['chemistry','physics','astronomy','biology'],n>>2),label:'Cross-Subject • Science'};
}
function generate(context,grade,lane,n){
  const ctx=lane==='cross'?crossContext(context,n):context;
  const g=lane==='cross'?clamp(grade+1,7,10):clamp(grade,7,10);
  const p=factoryFor(ctx)(g,n);
  return {...p,grade:g,lane,context:ctx,label:lane==='cross'?ctx.label:(context.label||`${context.subject} • ${context.topic}`)};
}
function problem(){
  round++;
  const context=detectContext();
  const baseGrade=gradeForRound(round);
  const n=hash(`${context.page}|${context.subject}|${context.topic}|${Date.now()}|${round}|${Math.random()}`);
  const lane=round%3===0?'cross':'primary';
  return generate(context,baseGrade,lane,n);
}

function launchTarget(){
  if(typeof document==='undefined') return null;
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page==='math-operations-quest.html') return document.querySelector('.difficulty-row');
  if(page==='fraction-forge.html') return document.querySelector('.difficulty-toggle');
  if(page==='decimal-deception.html') return document.querySelector('.controls');
  return document.querySelector('.difficulty-row,.difficulty-toggle,.game-controls,.controls');
}
function statusText(){return `Correct ${correct}/${answered} answered • Skipped ${skipped}`;}
function setFeedback(text){const el=document.getElementById('dwGFeedback');if(el)el.textContent=text;}
function renderCurrent(){
  resolved=false;
  const nextBtn=document.getElementById('dwGNext');if(nextBtn)nextBtn.disabled=true;
  const lesson=document.getElementById('dwGLesson'),prompt=document.getElementById('dwGPrompt'),choices=document.getElementById('dwGChoices'),meta=document.getElementById('dwGMeta');
  meta.textContent=`${current.lane==='cross'?'⚡ CROSS-SUBJECT':'🎯 CURRENT TOPIC'} • GRADE ${current.grade} • ${current.label}`;
  lesson.textContent='';const b=document.createElement('b');b.textContent='YOU NEED THIS FIRST: ';lesson.append(b,document.createTextNode(current.lesson));
  prompt.textContent=current.prompt;
  choices.replaceChildren();
  for(const x of current.choices){const btn=document.createElement('button');btn.type='button';btn.dataset.gAnswer=String(x);btn.textContent=String(x);btn.addEventListener('click',()=>answer(btn));choices.append(btn);}
  setFeedback(statusText());
}
function next(){current=problem();renderCurrent();}
function answer(button){
  if(!current) return;
  document.querySelectorAll('[data-g-answer]').forEach(b=>b.disabled=true);
  answered++;resolved=true;const nextBtn=document.getElementById('dwGNext');if(nextBtn)nextBtn.disabled=false;
  const ok=String(button.dataset.gAnswer)===String(current.answer);if(ok)correct++;
  setFeedback(`${ok?'✅ Correct.':`❌ Correct answer: ${current.answer}.`} ${current.why} • ${statusText()}`);
}
function skip(){
  if(!current) return next();
  if(resolved) return next();
  resolved=true;skipped++;
  setFeedback(`⏭️ Skipped with no penalty. ${statusText()} • Loading next challenge…`);
  setTimeout(next,180);
}
function mount(){
  if(typeof document==='undefined'||document.getElementById('dwGraysonLaunch')) return;
  const target=launchTarget(),css=document.createElement('style');
  css.textContent=`#dwGraysonLaunch{position:fixed;left:12px;bottom:12px;z-index:8999;padding:10px 14px;border:2px solid #ff4d6d;border-radius:999px;background:linear-gradient(90deg,#330016,#8b003a);color:#fff;font:1000 12px Arial;box-shadow:0 0 25px #ff2f6688;cursor:pointer}#dwGraysonLaunch.dw-grayson-inline{position:static;inset:auto;min-width:120px;margin:4px;padding:10px 13px;border-radius:9px;align-self:stretch}#dwGraysonLaunch small{display:block;margin-top:3px;font-size:9px;color:#ffd7df}#dwGrayson{border:2px solid #ff4d6d;border-radius:16px;background:#090719;color:#fff;width:min(760px,94vw);padding:0;box-shadow:0 25px 80px #000}#dwGrayson::backdrop{background:#000d}.dw-g{padding:20px}.dw-g h2{color:#ffcf55;font:1000 30px Georgia;margin:0}.dw-g-meta{margin:8px 0 0;color:#7fe7ff;font:900 12px Arial;letter-spacing:.5px}.dw-g-lesson{padding:11px;margin:12px 0;border:1px solid #83692e;border-radius:9px;background:#19142a;line-height:1.45}.dw-g-prompt{white-space:pre-line;font:900 24px/1.35 Georgia;margin:17px 0}.dw-g-choices{display:grid;grid-template-columns:1fr 1fr;gap:9px}.dw-g-choices button{padding:12px;border:1px solid #8d5cae;border-radius:8px;background:#171036;color:#fff;font-weight:900}.dw-g-choices button:focus-visible,.dw-g-actions button:focus-visible,#dwGraysonLaunch:focus-visible{outline:3px solid #7fe7ff;outline-offset:2px}.dw-g-feedback{min-height:52px;margin:12px 0;font-weight:800;line-height:1.4}.dw-g-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.dw-g-actions button{padding:11px;font-weight:900}.dw-g-skip{grid-column:1/-1;background:#3a1b18;color:#ffd8c7;border:1px solid #b96b4a}.dw-g-note{font-size:12px;color:#c7bfd8;margin:9px 0 0}@media(max-width:560px){.dw-g-choices,.dw-g-actions{grid-template-columns:1fr}.dw-g-skip{grid-column:auto}.dw-g-prompt{font-size:21px}}`;
  document.head.append(css);
  const launch=document.createElement('button');launch.id='dwGraysonLaunch';launch.type='button';launch.innerHTML='☠️ GRAYSON MODE<small>Grades 7–10 • no rewards</small>';
  const dialog=document.createElement('dialog');dialog.id='dwGrayson';dialog.innerHTML=`<div class="dw-g"><h2>☠️ GRAYSON MODE</h2><div class="dw-g-meta" id="dwGMeta"></div><p>Optional Grade 7–10 challenge. Most questions match what you are working on. Every third challenge jumps to harder Math or Science. No gameplay rewards and no penalty for skipping or leaving.</p><div class="dw-g-lesson" id="dwGLesson"></div><div class="dw-g-prompt" id="dwGPrompt"></div><div class="dw-g-choices" id="dwGChoices"></div><div class="dw-g-feedback" id="dwGFeedback"></div><div class="dw-g-actions"><button id="dwGNext" type="button">NEW CHALLENGE</button><button id="dwGClose" type="button">RETURN TO GAME</button><button class="dw-g-skip" id="dwGSkip" type="button">⏭️ GIVE UP / SKIP → NEXT</button></div><p class="dw-g-note">Skip never changes your Dragonswood score, grade, XP, Gold, or required progress.</p></div>`;
  document.body.append(launch,dialog);
  if(target){launch.classList.add('dw-grayson-inline');target.append(launch);}
  launch.addEventListener('click',()=>{dialog.showModal();next();});
  document.getElementById('dwGClose').addEventListener('click',()=>dialog.close());
  document.getElementById('dwGNext').addEventListener('click',()=>{if(resolved)next();});
  document.getElementById('dwGSkip').addEventListener('click',skip);
}

return {VERSION,detectContext,generate,gradeForRound,crossContext,mount,next,skip,getStats:()=>({round,correct,answered,skipped}),rewardFree:true};
});
