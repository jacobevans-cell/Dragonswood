// Rendering only. This module contains no assessed answer keys or recovery banks.
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STYLES=`<style>
.curriculum-lab{margin:1.2rem 0;padding:1.15rem;border:1px solid #6d5b82;border-radius:16px;background:#191525}.curriculum-lab h3{margin-top:0}.curriculum-controls{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin:.8rem 0}.curriculum-controls button,.curriculum-controls select{min-height:42px}.curriculum-model{background:#f4efdf;border-radius:14px;overflow:hidden;padding:.6rem;color:#253943}.curriculum-model svg{display:block;width:100%;max-height:310px;margin:auto}.curriculum-question-visual{max-width:640px;margin:1rem auto}.curriculum-caption{font-size:.9rem;line-height:1.5;margin:.6rem .2rem 0}.curriculum-place-scroll{overflow-x:auto;border-radius:12px;background:#f4efdf}.curriculum-place-chart{min-width:710px;height:210px;width:100%;display:block}.curriculum-place-chart .moving-digit{transition:transform .65s cubic-bezier(.2,.7,.25,1)}.curriculum-step-trail{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin:.8rem 0;font-variant-numeric:tabular-nums}.curriculum-step-trail span{padding:.3rem .6rem;border:1px solid #65537d;border-radius:9px}.curriculum-step-trail .current{background:#615084;color:#fff;border-color:#efc36b}.curriculum-story{font-family:Georgia,serif;font-size:1.06rem;line-height:1.9}.curriculum-story .para-row{display:block;position:relative;padding-left:2rem}.curriculum-story p{position:relative;padding-left:0}.curriculum-story .paragraph-number{position:absolute;left:0;top:.15rem;font-size:.7rem;color:#70547e}.curriculum-organizer{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}.curriculum-organizer>section{padding:1rem;border:1px solid #68537e;border-radius:12px;background:#201a30}.curriculum-organizer textarea{width:100%}.curriculum-method{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.8rem}.curriculum-method>div{padding:1rem;background:#211b31;border-radius:12px}.curriculum-method h3{font-size:1.1rem;margin:.2rem 0}.curriculum-picture{margin:0 0 1.2rem}.curriculum-picture img{width:100%;max-height:470px;object-fit:contain;background:#151322;border-radius:16px;display:block}.curriculum-picture figcaption{margin:.7rem .2rem;font-size:.88rem;line-height:1.55;color:#d0c4df}.curriculum-wordbank{display:flex;flex-wrap:wrap;gap:.7rem;margin:1rem 0}.curriculum-wordbank span{padding:.65rem 1rem;border:1px solid #bf9a58;border-radius:12px;background:#2d243d;font-weight:700}.curriculum-coach{margin:.9rem 0;border:1px solid #667570;border-radius:12px;padding:.85rem}.curriculum-coach summary{cursor:pointer;color:#8de2cb;font-weight:700}.curriculum-coach svg{width:100%;max-height:170px;display:block;margin-top:.8rem}.curriculum-grid-input{width:100%;accent-color:#087f79}.curriculum-fold{transition:transform .65s;transform-origin:170px 100px}.curriculum-grid-buttons{display:flex;flex-wrap:wrap;gap:.4rem}.curriculum-grid-buttons button{min-height:40px}.curriculum-rubric-list{font-size:.94rem}.curriculum-rubric-list li{margin:.45rem 0}
.curriculum-morph-activity{border:0;padding:0;margin:0;min-width:0}.curriculum-word-parts{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;margin:1rem 0}.curriculum-word-parts button{min-width:95px;min-height:56px;font-size:1.3rem;font-family:Georgia,serif;border:1px solid #c8a96d;border-radius:12px;background:#332844;color:#fff4d8;padding:.5rem 1rem}.curriculum-word-parts button[aria-pressed=true]{background:#15655e;border-color:#8de2cb}.curriculum-practice-choices{display:grid;gap:.6rem}.curriculum-practice-choices button{text-align:left;white-space:normal;padding:.8rem 1rem;line-height:1.6;min-height:48px}.curriculum-practice-choices button[aria-pressed=true]{border-color:#8de2cb;background:#164b49}.curriculum-practice-feedback{padding:.8rem 1rem;border-left:3px solid #83d8c7;background:#242034;min-height:3rem;line-height:1.65}
@media(max-width:720px){.curriculum-organizer,.curriculum-method{grid-template-columns:1fr}.curriculum-lab{padding:.8rem}.curriculum-story{font-size:1rem}.curriculum-picture img{max-height:360px}}
@media(prefers-reduced-motion:reduce){.curriculum-place-chart .moving-digit,.curriculum-fold{transition:none}}
</style>`;

function svg(body,alt,width=340,height=200) {return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(alt)}"><title>${esc(alt)}</title><rect width="${width}" height="${height}" rx="14" fill="#f4efdf"/>${body}</svg>`;}
function arrow(point,other) {
  const [x,y]=point, angle=Math.atan2(y-other[1],x-other[0]), l=13, spread=.48;
  return `<path d="M${x-l*Math.cos(angle-spread)} ${y-l*Math.sin(angle-spread)}L${x} ${y}L${x-l*Math.cos(angle+spread)} ${y-l*Math.sin(angle+spread)}" stroke="#087f79" stroke-width="4" fill="none" stroke-linejoin="round"/>`;
}
function drawStroke(s) {
  const dot=p=>`<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="#087f79"/>`;
  return `<path d="M${s.a.join(' ')}L${s.b.join(' ')}" stroke="#67518c" stroke-width="4" fill="none"/>${s.start==='dot'?dot(s.a):s.start==='arrow'?arrow(s.a,s.b):''}${s.end==='dot'?dot(s.b):s.end==='arrow'?arrow(s.b,s.a):''}`;
}
function rightMarks(points) {
  return points.map((p,i)=>{
    const a=points[(i+points.length-1)%points.length].map((v,k)=>v-p[k]), b=points[(i+1)%points.length].map((v,k)=>v-p[k]);
    if(Math.abs(a[0]*b[0]+a[1]*b[1])>1e-6)return '';
    const u=a.map(v=>v/Math.hypot(...a)*13),v=b.map(x=>x/Math.hypot(...b)*13);
    return `<path d="M${p[0]+u[0]} ${p[1]+u[1]}l${v.join(' ')}l${-u[0]} ${-u[1]}" fill="none" stroke="#087f79" stroke-width="2"/>`;
  }).join('');
}
const SHAPES={
  ray:{type:'geometry',segments:[{a:[80,130],b:[270,60],start:'dot',end:'arrow'}],alt:'One endpoint and one continuing direction.'},
  segment:{type:'geometry',segments:[{a:[95,55],b:[245,145],start:'dot',end:'dot'}],alt:'A straight figure with two endpoints.'},
  line:{type:'geometry',segments:[{a:[55,145],b:[285,55],start:'arrow',end:'arrow'}],alt:'A straight figure continuing both ways.'},
  parallel:{type:'geometry',segments:[{a:[70,155],b:[230,35],start:'arrow',end:'arrow'},{a:[130,175],b:[290,55],start:'arrow',end:'arrow'}],alt:'Lines with matching direction that do not meet.'},
  perpendicular:{type:'geometry',segments:[{a:[80,160],b:[240,40],start:'arrow',end:'arrow'},{a:[115,40],b:[205,160],start:'arrow',end:'arrow'}],rightAngle:true,alt:'Lines meet at a square corner.'},
  crossing:{type:'geometry',segments:[{a:[45,100],b:[300,100],start:'arrow',end:'arrow'},{a:[100,170],b:[235,30],start:'arrow',end:'arrow'}],alt:'Lines cross without making a square corner.'},
  rectangle:{type:'polygon',points:[[65,55],[275,55],[275,145],[65,145]],rightAngles:true,alt:'A rectangle with unequal neighboring side lengths.'},
  square:{type:'polygon',points:[[105,35],[235,35],[235,165],[105,165]],rightAngles:true,alt:'A square with four equal sides and four square corners.'},
  slant:{type:'polygon',points:[[65,150],[225,150],[275,50],[115,50]],alt:'A parallelogram with no right angles.'},
  triangle:{type:'polygon',points:[[95,45],[265,155],[95,155]],rightAngles:true,alt:'A triangle with one square corner.'},
  isosceles:{type:'polygon',points:[[170,30],[65,170],[275,170]],alt:'A triangle with equal sloping sides.'},
  asymmetric:{type:'polygon',points:[[60,165],[280,165],[215,50],[85,85]],alt:'An irregular quadrilateral with unequal, unmatched sides.'},
};
const shapeNames={ray:'Ray',segment:'Segment',line:'Line',parallel:'Parallel lines',perpendicular:'Perpendicular lines',crossing:'Other intersecting lines',rectangle:'Non-square rectangle',square:'Square',slant:'Slanted parallelogram',triangle:'Right triangle',isosceles:'Isosceles triangle',asymmetric:'Irregular quadrilateral'};

export function exactDecimalShift(value,steps) {
  const text=String(value);if(!/^\d+(?:\.\d+)?$/.test(text)||!Number.isInteger(steps)||Math.abs(steps)>6) throw new Error('Unsupported decimal model.');
  const [whole,decimal='']=text.split('.'), digits=whole+decimal, point=whole.length+steps;
  let out=point<=0?'0.'+'0'.repeat(-point)+digits:point>=digits.length?digits+'0'.repeat(point-digits.length):digits.slice(0,point)+'.'+digits.slice(point);
  out=out.replace(/^0+(?=\d)/,'');if(out.includes('.'))out=out.replace(/0+$/,'').replace(/\.$/,'');return out||'0';
}

export function decimalPlaceModel(value,steps=0) {
  const labels=['ten thousands','thousands','hundreds','tens','ones','tenths','hundredths','thousandths','ten-thousandths','hundred-thousandths'];
  const [w,f='']=String(value).split('.'), chars=(w+f).split(''), cx=35,cell=72, y=107;
  const current=exactDecimalShift(value,steps),parts=current.split('.');
  const currentDigits=[...parts[0]].map((digit,i)=>({digit,exponent:parts[0].length-1-i})).concat([...(parts[1]||'')].map((digit,i)=>({digit,exponent:-1-i})));
  const real=chars.map((digit,i)=>({digit,exponent:w.length-1-i+steps}));
  let body=labels.map((label,i)=>`<rect x="${i*cell+1}" y="24" width="${cell-2}" height="135" fill="${i<5?'#e6dcee':'#d6e9e1'}" rx="5"/><text x="${i*cell+cx}" y="${label.length>12?175:185}" text-anchor="middle" font-size="${label.length>12?9:11}" fill="#253943">${esc(label)}</text>`).join('');
  body+=`<path d="M${5*cell-3} 16V158" stroke="#b07b22" stroke-width="3"/><circle cx="${5*cell-3}" cy="135" r="5" fill="#b07b22"/>`;
  currentDigits.filter(d=>d.digit==='0'&&!real.some(r=>r.exponent===d.exponent)).forEach(d=>{const i=4-d.exponent;if(i>=0&&i<labels.length)body+=`<text x="${i*cell+cx}" y="${y}" text-anchor="middle" fill="#83948e" font-size="34">0</text>`;});
  chars.forEach((digit,i)=>{const exponent=w.length-1-i,base=4-exponent;if(base-steps<0||base-steps>=labels.length)return;body+=`<text class="moving-digit" data-digit="${i}" x="${base*cell+cx}" y="${y}" text-anchor="middle" fill="#514174" font-size="34" font-weight="700" style="transform:translateX(${-steps*cell}px)">${digit}</text>`;});
  return `<svg class="curriculum-place-chart" viewBox="0 0 720 210" role="img" aria-label="${esc(`${value}, changed by ${steps>=0?'multiplication':'division'} by ${10**Math.abs(steps)}, is ${current}. The decimal boundary remains between ones and tenths.`)}"><title>Fixed places; changing digit values</title>${body}</svg>`;
}

export function curriculumMathVisual(spec, {rotate=0,fold=null,folded=false,showResult=false}={}) {
  if(!spec)return '';
  let out='';
  if(spec.type==='geometry') {
    let inner=spec.segments.map(drawStroke).join('');
    if(spec.rightAngle)inner+='<path d="M172 91l9 12l-12 9" fill="none" stroke="#087f79" stroke-width="2"/>';
    out=svg(`<g transform="translate(0 50)"><g transform="rotate(${rotate} 170 100)">${inner}</g></g>`,spec.alt,340,300);
  } else if(spec.type==='polygon') {
    let body=`<polygon points="${spec.points.map(p=>p.join(',')).join(' ')}" fill="#e1d7ed" stroke="#67518c" stroke-width="4"/>${spec.rightAngles?rightMarks(spec.points):''}`;
    if(fold) {
      const paths={vertical:'M170 12V188',horizontal:'M18 100H322',diagonal:'M50 -20L290 220'};
      body+=`<path d="${paths[fold]}" stroke="#b87829" stroke-width="3" stroke-dasharray="7 6"/>`;
      if(folded){
        const reflect=fold==='vertical'?([x,y])=>[340-x,y]:fold==='horizontal'?([x,y])=>[x,200-y]:([x,y])=>[y+70,x-70];
        body+=`<polygon points="${spec.points.map(reflect).map(p=>p.join(',')).join(' ')}" fill="#087f7944" stroke="#087f79" stroke-width="3" stroke-dasharray="5 4"/>`;
      }
    }
    out=svg(`<g transform="translate(0 50)"><g transform="rotate(${rotate} 170 100)">${body}</g></g>`,spec.alt+(fold?` A ${fold} fold is marked.${folded?' The teal reflected outline shows whether the shape matches.':''}`:''),340,300);
  } else if(spec.type==='angle') {
    const degrees=Number(spec.degrees), length=spec.length||140, a=[100,160],b=[100+length,160],c=[100+length*Math.cos(degrees*Math.PI/180),160-length*Math.sin(degrees*Math.PI/180)];
    const end=[100+40*Math.cos(degrees*Math.PI/180),160-40*Math.sin(degrees*Math.PI/180)];
    out=svg(drawStroke({a,b,start:'dot',end:'arrow'})+drawStroke({a,b:c,start:'dot',end:'arrow'})+`<path d="M140 160A40 40 0 0 0 ${end.join(' ')}" fill="none" stroke="#b87829" stroke-width="3"/><path d="M275 70V25H320M275 40h15V25" fill="none" stroke="#087f79" stroke-width="3"/><text x="280" y="94" text-anchor="middle" fill="#253943" font-size="11">right-angle reference</text>`,spec.alt,360,205);
  } else if(spec.type==='hundredGrid') {
    const shaded=Number(spec.shaded);let body='';for(let col=0;col<10;col++)for(let row=0;row<10;row++)body+=`<rect x="${52+col*18}" y="${10+row*18}" width="16" height="16" fill="${col*10+row<shaded?'#087f79':'#ffffff'}" stroke="#94b3a6" stroke-width=".5"/>`;
    body+='<text x="280" y="67" text-anchor="middle" fill="#253943" font-size="13">This grid is</text><text x="280" y="87" text-anchor="middle" fill="#253943" font-size="15" font-weight="700">ONE WHOLE</text><text x="280" y="122" text-anchor="middle" fill="#253943" font-size="12">100 equal cells</text>';
    if(showResult)body+=`<text x="280" y="153" text-anchor="middle" fill="#087f79" font-size="22" font-weight="700">${shaded}/100</text><text x="280" y="181" text-anchor="middle" fill="#087f79" font-size="22">${(shaded/100).toFixed(2)}</text>`;
    out=svg(body,spec.alt,360,205);
  } else if(spec.type==='place') out=`<div class="curriculum-place-scroll">${decimalPlaceModel(spec.value)}</div>`;
  else throw new Error(`Unknown curriculum visual: ${spec.type}`);
  return `<figure class="curriculum-question-visual"><div class="curriculum-model">${out}</div><figcaption class="curriculum-caption">${esc(spec.alt)}</figcaption></figure>`;
}

export function curriculumCoach(coach) {
  return `<details class="curriculum-coach"><summary>Visual coach · ${esc(coach.title)}</summary>${coach.svg}<p>${esc(coach.text)}</p></details>`;
}

function explorer(spec) {
  const safe=esc(JSON.stringify(spec));
  if(spec.kind==='place') return `<div class="curriculum-lab" data-curriculum-explorer="place" data-spec="${safe}"><h3>${esc(spec.title)}</h3><p class="small">Practice model · the gold line always separates ones from tenths. Digits travel to different value places.</p><div class="curriculum-place-scroll" tabindex="0" role="region" aria-label="Place-value chart; scroll horizontally on small screens"><div data-place-chart>${decimalPlaceModel(spec.start)}</div></div><div class="curriculum-controls"><button type="button" class="btn small" data-place-change="-1" ${spec.direction==='multiply'?'hidden':''}>÷10 · one step</button><button type="button" class="btn small" data-place-change="1" ${spec.direction==='divide'?'hidden':''}>×10 · one step</button><button type="button" class="btn small quiet" data-place-reset>Reset</button></div><div class="curriculum-step-trail" data-place-trail aria-live="polite"><span class="current">${esc(spec.start)}</span></div><p data-place-explanation aria-live="polite">Start at ${esc(spec.start)}. Choose a step to see the value change.</p></div>`;
  if(spec.kind==='grid')return `<div class="curriculum-lab" data-curriculum-explorer="grid"><h3>${esc(spec.title)}</h3><div data-grid-model>${curriculumMathVisual({type:'hundredGrid',shaded:spec.start,alt:`${spec.start} out of 100 equal cells are shaded.`},{showResult:true})}</div><label>Shaded hundredths: <output data-grid-count>${spec.start}</output><input class="curriculum-grid-input" data-grid-slider type="range" min="0" max="100" value="${spec.start}"></label><div class="curriculum-grid-buttons"><button type="button" class="btn small" data-grid-add="-10">− one tenth</button><button type="button" class="btn small" data-grid-add="-1">− one hundredth</button><button type="button" class="btn small" data-grid-add="1">+ one hundredth</button><button type="button" class="btn small" data-grid-add="10">+ one tenth</button></div><p data-grid-explanation aria-live="polite"></p></div>`;
  if(spec.kind==='compare')return `<div class="curriculum-lab" data-curriculum-explorer="compare"><h3>${esc(spec.title)}</h3><div class="curriculum-controls"><label>Left decimal <select data-compare-left>${['0.6','0.58','0.407','2.305'].map(v=>`<option>${v}</option>`).join('')}</select></label><label>Right decimal <select data-compare-right>${['0.58','0.60','0.5','2.350'].map(v=>`<option>${v}</option>`).join('')}</select></label></div><div data-compare-model aria-live="polite"></div><p>Zeros added at the right end help us compare equal-sized units. They do not change the number.</p></div>`;
  if(spec.kind==='angle')return `<div class="curriculum-lab" data-curriculum-explorer="angle"><h3>${esc(spec.title)}</h3><div data-angle-model>${curriculumMathVisual({type:'angle',degrees:60,alt:'An opening smaller than the separate right-angle reference.'})}</div><div class="curriculum-controls"><label>Opening <select data-angle-opening><option value="60">Smaller than a square corner</option><option value="90">Matches a square corner</option><option value="120">Larger than a square corner</option></select></label><button type="button" class="btn small" data-angle-length>Change visible ray length</button></div><p data-angle-explanation aria-live="polite">An acute angle is smaller than a square corner. The drawn ray length does not determine the opening.</p></div>`;
  const first=spec.modes[0],symmetry=spec.kind==='symmetry';
  return `<div class="curriculum-lab" data-curriculum-explorer="${symmetry?'symmetry':'geometry'}"><h3>${esc(spec.title)}</h3><div class="curriculum-controls"><label>Figure <select data-geometry-mode>${spec.modes.map(mode=>`<option value="${mode}">${esc(shapeNames[mode])}</option>`).join('')}</select></label>${symmetry?'<label>Try a fold <select data-geometry-fold><option value="vertical">Vertical center</option><option value="horizontal">Horizontal center</option><option value="diagonal">Diagonal through center</option></select></label><button type="button" class="btn small" data-geometry-test>Reflect and check</button>':'<button type="button" class="btn small" data-geometry-rotate>Turn the figure</button><button type="button" class="btn small quiet" data-geometry-properties>Show properties</button>'}</div><div data-geometry-model>${curriculumMathVisual(SHAPES[first],{fold:symmetry?'vertical':null})}</div><p data-geometry-explanation aria-live="polite">${symmetry?'Predict whether the halves will match, then compare the original purple outline with its teal reflection.':'Trace the endpoints, sides, and corners. Turn the picture and check which properties stay the same.'}</p></div>`;
}

export function renderCurriculumMath(lesson) {
  return STYLES+`<section class="panel curriculum-daily-math"><div class="eyebrow">1 · Learn & explore</div><h2>${esc(lesson.title)}</h2><p>${esc(lesson.goal)}</p>${lesson.lesson.map((part,i)=>`<section><h3>${i+1}. ${esc(part.title)}</h3><p>${esc(part.text)}</p></section>`).join('')}${explorer(lesson.explorer)}</section>`;
}

export function readingSentences(passage) {
  const rows=[];
  passage.paragraphs.forEach((text,para)=>{
    const regex=/[^.!?]+[.!?]+[”"']?|[^.!?]+$/g;let match;
    while((match=regex.exec(text))){const raw=match[0],trimmed=raw.trim(),lead=raw.length-raw.trimStart().length;if(trimmed)rows.push({para,start:match.index+lead,end:match.index+lead+trimmed.length,quote:trimmed});}
  });
  return rows;
}

function ownField(assignment,path,label,hint,rows=3,work={}) {
  const value=path.split('.').reduce((v,key)=>v?.[key],work)||'';
  return `<label class="field">${esc(label)}<small>${esc(hint)}</small><textarea data-assignment="${assignment}" data-field="${esc(path)}" rows="${rows}">${esc(value)}</textarea></label>`;
}

export function renderCurriculumReading(lesson,helpers={}) {
  const work=helpers.work||{},field=helpers.field||((a,p,l,h,r)=>ownField(a,p,l,h,r,work)),marked=helpers.markedParagraph||((text)=>esc(text));
  const sentences=typeof helpers.sentences==='function'?helpers.sentences():readingSentences(lesson.passage),evidence=work.evidence||[];
  return STYLES+`<section class="panel"><div class="eyebrow">Reading mission · ${esc(lesson.skill)}</div><h2>${esc(lesson.passage.title)}</h2><p>${esc(lesson.prompt)}</p><div class="curriculum-method">${lesson.method.map((part,i)=>`<div><div class="eyebrow">${i+1}</div><h3>${esc(part.title)}</h3><p>${esc(part.text)}</p></div>`).join('')}</div></section><div class="split"><section class="panel light"><div class="eyebrow" style="color:#785b3f">Read the complete story</div><h2>${esc(lesson.passage.title)}</h2><p class="small muted">${esc(lesson.passage.author)}</p><article id="passage" class="curriculum-story">${lesson.passage.paragraphs.map((text,i)=>`<div class="para-row"><span class="paragraph-number" aria-hidden="true">${i+1}</span><p data-para="${i}">${marked(text,i)}</p></div>`).join('')}</article><div class="curriculum-controls"><button class="btn small" type="button" data-action="add-selection" id="add-selection">Save highlighted evidence</button></div><details><summary>Choose a sentence instead · keyboard-friendly</summary><label for="sentence-picker">A sentence from the supplied story</label><select id="sentence-picker">${sentences.map((s,i)=>`<option value="${i}">Paragraph ${s.para+1}: ${esc(s.quote)}</option>`).join('')}</select><button class="btn small" type="button" data-action="add-sentence">Add this sentence</button></details><p class="small">Highlight text within one paragraph, or choose a sentence. Your saved selections stay linked to this story.</p></section><section class="panel"><h2>Your evidence desk</h2><p>Collect at least two different useful selections. Explain why each one matters.</p>${evidence.length?evidence.map((e,i)=>`<article class="evidence-card"><blockquote>${esc(e.quote)}</blockquote><p class="small">Paragraph ${e.para+1}</p><label>Connect this evidence to<select data-assignment="reading" data-field="evidence.${i}.category">${lesson.evidenceCategories.map(c=>`<option value="${esc(c.id)}" ${e.category===c.id?'selected':''}>${esc(c.label)}</option>`).join('')}</select></label>${field('reading',`evidence.${i}.note`,'What does this show?','Explain the link to your idea.',2)}<button class="btn small quiet" type="button" data-action="insert-quote" data-index="${i}">Use quotation in response</button><button class="btn small quiet" type="button" data-action="remove-evidence" data-index="${i}">Remove</button></article>`).join(''):'<p class="muted">Your saved evidence will appear here.</p>'}${curriculumCoach(lesson.coach)}</section></div><section class="panel"><div class="eyebrow">Organize, then explain</div><h2>Build your thinking</h2><div class="curriculum-organizer">${lesson.organizer.map(item=>`<section>${field('reading',`claims.${item.id}`,item.label,item.prompt,3)}</section>`).join('')}</div><h3>Your connected explanation</h3>${field('reading','response','Explain your answer',lesson.prompt,7)}${curriculumCoach(lesson.coach)}</section>`+(helpers.finish?helpers.finish('reading',lesson.requirements):'');
}

export function renderCurriculumMorphology(lesson,helpers={}) {
  const work=helpers.work||{},field=helpers.field||((a,p,l,h,r)=>ownField(a,p,l,h,r,work));
  const study=lesson.wordStudy,video=lesson.video?(typeof helpers.video==='function'?helpers.video(lesson.video):helpers.video||'<p class="notice">The required lesson video is loading. Its viewing requirement stays pending.</p>'):'';
  const practice=study?`<section class="curriculum-lab" data-curriculum-explorer="word"><div class="eyebrow">Explore · connect · apply</div><h3>Open the word’s toolkit</h3><p>Tap each word part to explore its meaning.</p><div class="curriculum-word-parts">${study.parts.map((part,i)=>`${i?'<span aria-hidden="true">+</span>':''}<button type="button" data-word-part data-part-meaning="${esc(`${part.label}: ${part.meaning}`)}" aria-pressed="false">${esc(part.label)}</button>`).join('')}</div><p data-word-part-meaning class="curriculum-practice-feedback" role="status">Choose a part above. A word’s history gives clues; its use in a sentence helps you choose the right meaning.</p><p>${esc(study.note)}</p><h3>Test the meaning in a situation</h3><p>${esc(study.prompt)}</p><div class="curriculum-practice-choices">${study.choices.map(choice=>`<button class="btn" type="button" data-word-context data-practice-feedback="${esc(choice.feedback)}" aria-pressed="false">${esc(choice.text)}</button>`).join('')}</div><p data-word-context-feedback class="curriculum-practice-feedback" role="status">Choose a situation to see how its details fit the focus word. Try each one if you wish.</p><p class="small muted">${esc(study.practicePolicy)}</p></section>`:'';
  return STYLES+`<section class="panel"><div class="eyebrow">${study?'Watch + word workshop':'Picture + word study'}</div><h2>${esc(lesson.title)}</h2>${video}<fieldset class="curriculum-morph-activity" data-video-activity="morphology"><figure class="curriculum-picture"><img src="${esc(lesson.picture.src)}" alt="${esc(lesson.picture.alt)}"><figcaption>${esc(lesson.picture.alt)}</figcaption></figure><div class="curriculum-wordbank">${lesson.wordBank.map(word=>`<span>${esc(word)}</span>`).join('')}</div><h3>Know the meaning</h3><p>${esc(lesson.meaning)}</p>${practice}<h3>Your supplied situation</h3><p>${esc(lesson.context)}</p><div class="notice"><strong>${study?'Your written application':'Your quickwrite'}</strong><p>${esc(lesson.prompt)}</p></div>${field('morphology','response','Bring the word to life','Use the supplied meaning and develop the requested scene or explanation.',7)}${curriculumCoach(lesson.coach)}<p class="small muted">${esc(lesson.spelling)}</p></fieldset></section>`+(helpers.finish?helpers.finish('morphology',lesson.requirements):'');
}

function compareModels(left,right) {
  const places=Math.max((left.split('.')[1]||'').length,(right.split('.')[1]||'').length),normalize=value=>{const [w,f='']=value.split('.');return `${w}.${f.padEnd(places,'0')}`;},a=normalize(left),b=normalize(right),operator=Number(left)===Number(right)?'=':Number(left)<Number(right)?'<':'>';
  const message=`${a} ${operator} ${b}. Compare ones, then tenths, then hundredths, then thousandths; the first different place decides.`;
  return `<div class="curriculum-model">${svg(`<text x="180" y="85" text-anchor="middle" fill="#514174" font-size="35" font-family="sans-serif" font-weight="700">${esc(`${a} ${operator} ${b}`)}</text><path d="M38 140H322l-9-6m9 6l-9 6" stroke="#087f79" stroke-width="3" fill="none"/><text x="180" y="170" text-anchor="middle" fill="#253943" font-size="13">Positive values increase to the right</text>`,message,360,200)}</div><p>${esc(message)}</p>`;
}

export function symmetryMatches(mode,fold) {
  const points=SHAPES[mode]?.points;if(!points)return false;
  const reflect=fold==='vertical'?([x,y])=>[340-x,y]:fold==='horizontal'?([x,y])=>[x,200-y]:([x,y])=>[y+70,x-70];
  return points.every(p=>{const r=reflect(p);return points.some(q=>Math.hypot(q[0]-r[0],q[1]-r[1])<.001);});
}

export function bindCurriculumDays(root) {
  root.querySelectorAll('[data-curriculum-explorer]').forEach(lab=>{
    if(lab.dataset.curriculumBound)return;lab.dataset.curriculumBound='true';const kind=lab.dataset.curriculumExplorer;
    if(kind==='word') {
      const parts=lab.querySelectorAll('[data-word-part]'),choices=lab.querySelectorAll('[data-word-context]');
      parts.forEach(button=>button.addEventListener('click',()=>{parts.forEach(part=>part.ariaPressed=String(part===button));lab.querySelector('[data-word-part-meaning]').textContent=button.dataset.partMeaning;}));
      choices.forEach(button=>button.addEventListener('click',()=>{choices.forEach(choice=>choice.ariaPressed=String(choice===button));lab.querySelector('[data-word-context-feedback]').textContent=button.dataset.practiceFeedback;}));
    } else if(kind==='place') {
      const spec=JSON.parse(lab.dataset.spec);let step=0;
      const update=next=>{
        if(Math.abs(next)>spec.maxSteps||spec.direction==='multiply'&&next<0||spec.direction==='divide'&&next>0)return;
        const previous=step;step=next;
        const holder=lab.querySelector('[data-place-chart]'), oldPositions=[...holder.querySelectorAll('[data-digit]')].map(el=>el.style.transform);
        holder.innerHTML=decimalPlaceModel(spec.start,step);
        // Keep the old transform for one paint so the same authored digits visibly travel.
        const digits=[...holder.querySelectorAll('[data-digit]')];digits.forEach((el,i)=>{const target=el.style.transform;el.style.transition='none';el.style.transform=oldPositions[i]||target;void el.getBoundingClientRect();el.style.transition='';el.style.transform=target;});
        const direction=step<0?-1:1,sequence=Array.from({length:Math.abs(step)+1},(_,i)=>exactDecimalShift(spec.start,i*direction));
        lab.querySelector('[data-place-trail]').innerHTML=sequence.map((v,i)=>`${i?`<b aria-label="${direction>0?'times ten':'divided by ten'}">${direction>0?'×10 →':'÷10 →'}</b>`:''}<span class="${i===sequence.length-1?'current':''}">${esc(v)}</span>`).join('');
        lab.querySelector('[data-place-explanation]').textContent=step===0?`Back to ${spec.start}. The decimal boundary has stayed fixed.`:`${spec.start} ${step>0?'×':'÷'} ${10**Math.abs(step)} = ${exactDecimalShift(spec.start,step)}. ${Math.abs(step)} place-value ${Math.abs(step)===1?'step':'steps'} ${step>0?'left into greater-value places':'right into smaller-value places'}. Written shortcut: move the decimal mark ${step>0?'right':'left'} ${Math.abs(step)} ${Math.abs(step)===1?'place':'places'}.`;
        lab.querySelectorAll('[data-place-change]').forEach(b=>{const nextValue=step+Number(b.dataset.placeChange);b.disabled=Math.abs(nextValue)>spec.maxSteps||spec.direction==='multiply'&&nextValue<0||spec.direction==='divide'&&nextValue>0;});
      };
      lab.querySelectorAll('[data-place-change]').forEach(b=>b.addEventListener('click',()=>update(step+Number(b.dataset.placeChange))));lab.querySelector('[data-place-reset]').addEventListener('click',()=>update(0));update(0);
    } else if(kind==='grid') {
      const slider=lab.querySelector('[data-grid-slider]');const update=()=>{const n=Number(slider.value);lab.querySelector('[data-grid-count]').textContent=n;lab.querySelector('[data-grid-model]').innerHTML=curriculumMathVisual({type:'hundredGrid',shaded:n,alt:`${n} of 100 equal cells shaded.`},{showResult:true});lab.querySelector('[data-grid-explanation]').textContent=`${n} hundredths = ${(n/100).toFixed(2)}. ${Math.floor(n/10)} complete tenths and ${n%10} extra hundredths.`;};
      slider.addEventListener('input',update);lab.querySelectorAll('[data-grid-add]').forEach(b=>b.addEventListener('click',()=>{slider.value=Math.max(0,Math.min(100,Number(slider.value)+Number(b.dataset.gridAdd)));update();}));update();
    } else if(kind==='compare') {
      const update=()=>lab.querySelector('[data-compare-model]').innerHTML=compareModels(lab.querySelector('[data-compare-left]').value,lab.querySelector('[data-compare-right]').value);lab.querySelectorAll('select').forEach(s=>s.addEventListener('change',update));update();
    } else if(kind==='angle') {
      let short=false;const update=()=>{const degrees=Number(lab.querySelector('[data-angle-opening]').value),name=degrees<90?'acute':degrees===90?'right':'obtuse';lab.querySelector('[data-angle-model]').innerHTML=curriculumMathVisual({type:'angle',degrees,length:short?90:140,alt:`A ${name} angle beside a separate right-angle reference.`});lab.querySelector('[data-angle-explanation]').textContent=`This is ${name==='acute'||name==='obtuse'?'an':'a'} ${name} angle. Changing the visible ray lengths keeps its opening the same.`;};
      lab.querySelector('[data-angle-opening]').addEventListener('change',update);lab.querySelector('[data-angle-length]').addEventListener('click',()=>{short=!short;update();});
    } else {
      let rotate=0,properties=false,tested=false;
      const update=()=>{const mode=lab.querySelector('[data-geometry-mode]').value,fold=kind==='symmetry'?lab.querySelector('[data-geometry-fold]').value:null;lab.querySelector('[data-geometry-model]').innerHTML=curriculumMathVisual(SHAPES[mode],{rotate,fold,folded:tested});lab.querySelector('[data-geometry-explanation]').textContent=kind==='symmetry'?(tested?(symmetryMatches(mode,fold)?'The outlines match exactly. This fold is a line of symmetry.':'The reflected outline does not match exactly. This fold is not a line of symmetry.'):'Predict whether the two halves match. Then reflect the outline to check.'):(properties?`${shapeNames[mode]}: ${SHAPES[mode].alt} Turning the figure preserves these properties.`:'Turn the figure, then check its endpoints, sides, and corners.');};
      lab.querySelector('[data-geometry-mode]').addEventListener('change',()=>{tested=false;update();});
      lab.querySelector('[data-geometry-fold]')?.addEventListener('change',()=>{tested=false;update();});
      lab.querySelector('[data-geometry-rotate]')?.addEventListener('click',()=>{rotate=(rotate+45)%360;update();});
      lab.querySelector('[data-geometry-properties]')?.addEventListener('click',()=>{properties=!properties;update();});
      lab.querySelector('[data-geometry-test]')?.addEventListener('click',()=>{tested=!tested;update();});
    }
  });
}
