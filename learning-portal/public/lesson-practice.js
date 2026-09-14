import { GRADE4_PRACTICE } from './lesson-practice-grade4.js?v=dragon-path-9';
import { GRADE5_PRACTICE } from './lesson-practice-grade5.js?v=dragon-path-9';
import { checkPracticeTask, geometrySVG, geometryExample, PLACE_LABELS, placeValue, placeDigits } from './practice-models.js?v=dragon-path-9';

export const PRACTICE_VERSION = 'lesson-practice.1';
export function getLessonPractice(grade, day, subject = 'math') {
  if (subject !== 'math') return null;
  const source = (Number(grade) === 4 ? GRADE4_PRACTICE : Number(grade) === 5 ? GRADE5_PRACTICE : {})[day];
  if (!source) return null;
  const phases = Number(grade) === 4
    ? ([30,31,32,35].includes(Number(day)) ? ['construction','reasoning'] : Number(day) === 33 ? ['construction','reasoning','exit'] : null)
    : null;
  const tasks = source.tasks.filter(t => !phases || phases.includes(t.phase));
  return { ...source, version:PRACTICE_VERSION, tasks, minutes:[0,1].map(i => tasks.reduce((sum,t) => sum+t.minutes[i],0)) };
}

// A saved practice model never controls points, required video coverage, or
// assignment completion. The existing draft revision/receipt system saves it.
export function validatePracticeData(grade, day, subject, data) {
  if (data === undefined) return;
  const bundle = getLessonPractice(grade, day, subject);
  const object = value => value && typeof value === 'object' && !Array.isArray(value);
  const keys = (value, allowed) => object(value) && Object.keys(value).every(k => allowed.includes(k));
  const point = p => Array.isArray(p) && p.length === 2 && p.every(n => Number.isInteger(n) && n >= 0 && n <= 8);
  if (!bundle || !keys(data,['version','tasks']) || data.version !== PRACTICE_VERSION || !object(data.tasks)) throw Error('Invalid practice notebook.');
  for (const [id, saved] of Object.entries(data.tasks)) {
    const task = bundle.tasks.find(t => t.id === id);
    if (!task || !keys(saved,['answer','explanation','digits','model','checked'])) throw Error('Unknown practice task or field.');
    for (const key of ['answer','explanation']) if (saved[key] !== undefined && (typeof saved[key] !== 'string' || saved[key].length > 5000)) throw Error('Invalid practice response.');
    if (saved.checked !== undefined && typeof saved.checked !== 'boolean') throw Error('Invalid practice review flag.');
    if (saved.digits !== undefined && (task.type !== 'place' || !Array.isArray(saved.digits) || saved.digits.length !== 7 || saved.digits.some(x => typeof x !== 'string' || !/^\d?$/.test(x)))) throw Error('Use one digit in each place.');
    if (saved.model !== undefined) {
      const m = saved.model;
      if (task.type !== 'geometry' || !keys(m,['tool','shapes','pending']) || !['segment','ray','line','polygon'].includes(m.tool)
        || !Array.isArray(m.shapes) || m.shapes.length > 8 || !Array.isArray(m.pending) || m.pending.length >= (m.tool==='polygon'?4:2) || !m.pending.every(point)
        || new Set(m.pending.map(p=>p.join(','))).size !== m.pending.length) throw Error('Invalid construction model.');
      for (const s of m.shapes) if (!keys(s,['tool','points']) || !['segment','ray','line','polygon'].includes(s.tool) || !Array.isArray(s.points)
        || s.points.length !== (s.tool === 'polygon' ? 4 : 2) || !s.points.every(point) || new Set(s.points.map(p => p.join(','))).size !== s.points.length) throw Error('Use distinct grid points for each figure.');
    }
  }
}

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const modelFor = (task, saved) => saved.model || {tool:['ray','line'].includes(task.geometry?.mode) ? task.geometry.mode : ['parallel','perpendicular'].includes(task.geometry?.mode) ? 'line' : ['rectangle','garden'].includes(task.geometry?.mode) ? 'polygon' : 'segment',shapes:[],pending:[]};
const range = a => `${a[0]}–${a[1]} min`;
function placeSummary(digits) {
  const value = placeValue(digits);
  if (value === null) return 'Build your model by entering digits in their places. Blank places count as zero.';
  const parts = digits.flatMap((digit,i) => Number(digit) ? [`${digit} ${PLACE_LABELS[i]}`] : []);
  return `${parts.join(' + ') || 'Zero'} = ${value}`;
}
function construction(task, saved) {
  const model = modelFor(task,saved);
  return `<p>${esc(task.geometry.instructions)}</p><p class="small">Keep only the requested final figures in your model. Reset your trial before building the final version.</p><div class="practice-builder" data-practice-builder><div class="practice-tools"><label>Draw a<select data-practice-tool aria-label="Construction tool">${[['segment','Segment'],['ray','Ray'],['line','Line'],['polygon','Four-sided shape']].map(([v,label])=>`<option value="${v}" ${model.tool===v?'selected':''}>${label}</option>`).join('')}</select></label><button type="button" class="btn small quiet" data-practice-undo>Undo last figure</button><button type="button" class="btn small quiet" data-practice-clear>Reset model</button></div><p class="small">Choose ${model.tool==='polygon'?'four':'two'} grid points. For a shape, go around its boundary. Try a different position or direction to test what stays true.</p><div class="practice-grid"><div class="practice-grid-points">${Array.from({length:81},(_,n)=>`<button type="button" data-practice-point="${n%9},${Math.floor(n/9)}" aria-label="Row ${Math.floor(n/9)+1}, column ${n%9+1}"></button>`).join('')}</div><div class="practice-drawing">${geometrySVG(model,task.id)}</div></div><p class="practice-model-status" role="status">${model.shapes.length} figures saved${model.pending.length?` · ${model.pending.length} points selected for your next figure`:''}.</p><details><summary>Use row and column controls</summary><div class="practice-coordinate"><label>Row<select data-practice-row>${Array.from({length:9},(_,i)=>`<option value="${i}">${i+1}</option>`).join('')}</select></label><label>Column<select data-practice-column>${Array.from({length:9},(_,i)=>`<option value="${i}">${i+1}</option>`).join('')}</select></label><button type="button" class="btn small" data-practice-add-point>Add grid point</button></div></details></div>`;
}
function placeEditor(task,saved) {
  const digits = saved.digits || Array(7).fill('');
  return `<p>${esc(task.place.label)}</p><div class="practice-place" role="group" aria-label="Build a place-value model">${PLACE_LABELS.map((place,i)=>`<label class="${i===4?'decimal-boundary':''}"><span>${place}</span><input type="text" inputmode="numeric" maxlength="1" pattern="[0-9]?" data-practice-digit="${i}" aria-label="Digit in ${place}" value="${esc(digits[i])}"></label>`).join('')}</div><p class="practice-place-total" role="status">${esc(placeSummary(digits))}</p><p class="small">The gold boundary stays between ones and tenths. Empty places have a value of zero.</p>`;
}
function shiftModel(task) {
  if (!task.place?.from || !task.place.operation) return '';
  const steps = Math.log10(task.place.power) * (task.place.operation==='multiply' ? -1 : 1);
  const digits = placeDigits(task.place.from);
  return `<div class="practice-shift" data-practice-shift><div class="practice-shift-grid">${PLACE_LABELS.map((name,i)=>`<div><span>${name}</span><b data-shift-digit style="--shift:${steps}" data-value="${esc(digits[i])}">${digits[i]}</b></div>`).join('')}</div><button type="button" class="btn small quiet" data-practice-move>Watch the place-value shift</button><p class="small">${esc(task.place.from)} ${task.place.operation==='multiply'?'×':'÷'} ${task.place.power} = ${esc(task.place.value)}. Digits change places; the ones–tenths boundary stays fixed.</p></div>`;
}
function feedback(task,saved) {
  if (!saved.checked) return '';
  const check = checkPracticeTask(task,saved);
  if (check.kind==='empty') return `<p class="notice">${esc(check.message)}</p>`;
  return `<div class="practice-feedback ${check.kind==='correct'?'matched':''}" role="status"><strong>${esc(check.message)}</strong><p>${esc(task.help)}</p><details><summary>${task.type==='explain'?'Compare with a model explanation':'See a worked example'}</summary>${task.type==='geometry'?`<div class="practice-example">${geometryExample(task.geometry.check,task.id+'-example')}</div>`:''}${shiftModel(task)}<p>${esc(task.solution)}</p>${task.checklist?.length?`<ul>${task.checklist.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:''}</details></div>`;
}
export function renderLessonPractice(grade,day,assignment,work={}) {
  const bundle = getLessonPractice(grade,day,assignment);
  if (!bundle) return '';
  return `<section class="panel lesson-practice" data-lesson-practice="${assignment}"><div class="row"><div><div class="eyebrow">Practice workshop</div><h2>${esc(bundle.title)}</h2></div><span class="tag">About ${range(bundle.minutes)}</span></div><p>Build, explain, and check your thinking. Your practice saves with this lesson. These activities are unscored; your existing question checks still earn the lesson points.</p><fieldset data-video-activity="${assignment}" class="practice-activities"><legend class="sr-only">Practice activities</legend>${bundle.tasks.map((task,i)=>{
    const saved = work.practice?.tasks?.[task.id] || {};
    return `<details class="practice-task" data-practice-task="${esc(task.id)}" ${i===0?'open':''}><summary><span>${i+1}. ${esc(task.title)}</span><small>${range(task.minutes)}</small></summary><div class="practice-task-body"><p>${esc(task.prompt)}</p>${task.visual?.lines?`<div class="practice-supplied-model">${task.visual.lines.map(line=>`<p>${esc(line)}</p>`).join('')}</div>`:''}${task.type==='geometry'?construction(task,saved):task.type==='place'?placeEditor(task,saved):task.type==='choice'?`<div class="practice-choices">${task.choices.map((choice,index)=>`<label><input type="radio" name="practice-${task.id}" data-practice-answer value="${index}" ${String(saved.answer)===String(index)?'checked':''}>${esc(choice)}</label>`).join('')}</div>`:task.type==='number'?`<label>Your answer · number or fraction<input type="text" inputmode="decimal" data-practice-answer value="${esc(saved.answer)}"></label>`:''}${['geometry','place','explain'].includes(task.type)?`<label>Explain your thinking<textarea data-practice-explanation rows="3">${esc(saved.explanation)}</textarea></label>`:''}<div class="btn-row"><button type="button" class="btn small" data-practice-check>${task.type==='explain'?'Review my explanation':'Check my practice'}</button><details class="practice-help"><summary>Help me start</summary><p>${esc(task.help)}</p></details></div><div data-practice-feedback>${feedback(task,saved)}</div></div></details>`;
  }).join('')}</fieldset><p class="caption">You can pause between activities and continue later. The time labels are estimates.</p></section>`;
}

export function bindLessonPractice(root,{grade,day,getWork,patch}) {
  root.querySelectorAll('[data-lesson-practice]').forEach(panel=>{
    const assignment = panel.dataset.lessonPractice, bundle = getLessonPractice(grade,day,assignment);
    if (!bundle) return;
    panel.querySelectorAll('[data-practice-task]').forEach(el=>{
      const task = bundle.tasks.find(t=>t.id===el.dataset.practiceTask);
      const read = () => structuredClone(getWork(assignment).practice?.tasks?.[task.id] || {});
      const allowed = () => !el.closest('fieldset')?.disabled;
      const write = saved => {
        if (!allowed()) return;
        const practice = structuredClone(getWork(assignment).practice || {version:PRACTICE_VERSION,tasks:{}});
        practice.tasks[task.id] = saved;
        patch(assignment,practice);
      };
      const change = (key,value) => { const saved=read();saved[key]=value;saved.checked=false;write(saved);el.querySelector('[data-practice-feedback]').innerHTML=''; };
      el.querySelectorAll('[data-practice-answer]').forEach(input=>input.addEventListener(input.type==='radio'?'change':'input',()=>change('answer',input.value)));
      el.querySelector('[data-practice-explanation]')?.addEventListener('input',e=>change('explanation',e.target.value));
      el.querySelectorAll('[data-practice-digit]').forEach(input=>input.addEventListener('input',()=>{
        input.value=input.value.replace(/\D/g,'').slice(-1);
        const saved=read(),digits=saved.digits || Array(7).fill('');digits[Number(input.dataset.practiceDigit)]=input.value;change('digits',digits);
        el.querySelector('.practice-place-total').textContent=placeSummary(digits);
      }));
      const bindShift = () => el.querySelector('[data-practice-move]')?.addEventListener('click',e=>{
        const moved=el.querySelector('[data-practice-shift]').classList.toggle('shifted');
        e.target.textContent=moved?'Return to the starting value':'Watch the place-value shift';
      });
      bindShift();
      el.querySelector('[data-practice-check]').addEventListener('click',()=>{
        if (!allowed()) return;const saved=read();saved.checked=true;write(saved);el.querySelector('[data-practice-feedback]').innerHTML=feedback(task,saved);bindShift();
      });
      if(task.type==='geometry') {
        const refresh = model => {
          change('model',model);
          el.querySelector('.practice-drawing').innerHTML=geometrySVG(model,task.id);
          el.querySelector('[data-practice-tool]').value=model.tool;
          el.querySelector('.practice-builder > p').textContent=`Choose ${model.tool==='polygon'?'four':'two'} grid points. For a shape, go around its boundary. Try a different position or direction to test what stays true.`;
          el.querySelector('.practice-model-status').textContent=`${model.shapes.length} figures saved${model.pending.length?` · ${model.pending.length} points selected for your next figure`:''}.`;
        };
        const add = point => {
          if (!allowed()) return;const model=modelFor(task,read());
          if(model.shapes.length>=8){el.querySelector('.practice-model-status').textContent='You have eight figures. Undo one or clear the model to try a new design.';return;}
          if(model.pending.some(p=>p[0]===point[0]&&p[1]===point[1]))return;
          model.pending.push(point);
          if(model.pending.length===(model.tool==='polygon'?4:2)){
            model.shapes.push({tool:model.tool,points:model.pending});model.pending=[];
            if(task.geometry.check==='garden'&&model.shapes.length===1&&model.tool==='polygon')model.tool='segment';
          }
          refresh(model);
        };
        el.querySelectorAll('[data-practice-point]').forEach(button=>button.addEventListener('click',()=>add(button.dataset.practicePoint.split(',').map(Number))));
        el.querySelector('[data-practice-add-point]').addEventListener('click',()=>add([Number(el.querySelector('[data-practice-column]').value),Number(el.querySelector('[data-practice-row]').value)]));
        el.querySelector('[data-practice-tool]').addEventListener('change',e=>{
          const model=modelFor(task,read());model.tool=e.target.value;model.pending=[];refresh(model);
          el.querySelector('.practice-builder > p').textContent=`Choose ${model.tool==='polygon'?'four':'two'} grid points. For a shape, go around its boundary. Try a different position or direction to test what stays true.`;
        });
        el.querySelector('[data-practice-undo]').addEventListener('click',()=>{const model=modelFor(task,read());if(model.pending.length)model.pending=[];else model.shapes.pop();refresh(model);});
        el.querySelector('[data-practice-clear]').addEventListener('click',()=>refresh(modelFor(task,{})));
      }
    });
  });
}
