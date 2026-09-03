const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const daily = fs.readFileSync('daily-quest.html', 'utf8');

function initializer(source, name) {
  const marker = `const ${name}=`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Missing ${name}`);
  let i = start + marker.length;
  while (/\s/.test(source[i])) i++;
  const opening = source[i], closing = opening === '{' ? '}' : opening === '[' ? ']' : null;
  if (!closing) throw new Error(`Unsupported ${name} initializer`);
  let depth = 0, quote = '', escaped = false, regex = false, inClass = false;
  for (let j = i; j < source.length; j++) {
    const ch = source[j];
    if (escaped) { escaped = false; continue; }
    if (quote) { if (ch === '\\') escaped = true; else if (ch === quote) quote = ''; continue; }
    if (regex) {
      if (ch === '\\') escaped = true;
      else if (ch === '[') inClass = true;
      else if (ch === ']') inClass = false;
      else if (ch === '/' && !inClass) regex = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '/' && source[j - 1] !== '/') { regex = true; continue; }
    if (ch === opening) depth++;
    if (ch === closing && --depth === 0) return source.slice(i, j + 1);
  }
  throw new Error(`Unclosed ${name}`);
}

const q1Context = {window: {}};
vm.createContext(q1Context);
vm.runInContext(fs.readFileSync('q1-curriculum-data.js', 'utf8'), q1Context);
const canonicalItems = q1Context.window.DRAGONSWOOD_DATA.items;

const plannerStart = daily.indexOf('const DW_PACING_ENGINES=');
const plannerEnd = daily.indexOf('function dwBuildPacingLesson', plannerStart);
assert(plannerStart > 0 && plannerEnd > plannerStart, 'planner source block should be discoverable');

const plannerSource = `
const DW_SKILLS=${initializer(daily, 'DW_SKILLS')};
const DW_CURRIC_PLAN=${initializer(daily, 'DW_CURRIC_PLAN')};
const DW_CURRIC_ITEMS=${initializer(daily, 'DW_CURRIC_ITEMS')};
const DW_TOPIC_RULES=${initializer(daily, 'DW_TOPIC_RULES')};
function dwLabelOf(id){return (DW_SKILLS[id]&&DW_SKILLS[id][0])||id}
function dwCurricEntry(item){return DW_CURRIC_PLAN[item.id]||null}
function dwMorphParts(item){const t=String(item.requirement||"");const root=(t.match(/M[o0]r?ph[o0]?emes?[^\\S\\r\\n]*(?:\\r?\\n)+[^\\S\\r\\n]*([^\\r\\n]+)/i)||[])[1];const word=(t.match(/Word[^\\S\\r\\n]*(?:\\r?\\n)+[^\\S\\r\\n]*([^\\r\\n]+)/i)||[])[1];return {root:(root||"").trim(),word:(word||"").trim()}}
function dwObservationOnly(item){const t=((item.requirement||"")+" "+(item.strand||"")).toLowerCase();return /progress monitor|fluency|partner read|listen to students|cursive:|dictation|anecdotal|check ?point|present and share/.test(t)}
${daily.slice(plannerStart, plannerEnd)}
function dwValidateMorningSequence(taskList){for(let start=0;start<taskList.length;start+=5){const set=taskList.slice(start,start+5);if(set.length<5)continue;const counts=new Map();for(const t of set){const key=String(t.skillId||t.pacingItemId||t.skill||"");counts.set(key,(counts.get(key)||0)+1)}if(counts.size<3||Math.max(...counts.values())>2)throw new Error("Morning variety release blocked.");if(set.every(t=>String(t.engine||"")===String(set[0].engine||"")))throw new Error("Morning interaction variety release blocked.")}return true}
globalThis.__planner={DW_SKILLS,DW_MORNING_PLAN_VERSION,dwPacingSpecs,dwMorningPriorPools,dwBuildSubjectMorning,dwValidateMorningSequence};`;
const plannerContext = {window: {DRAGONSWOOD_DATA: {items: canonicalItems}}, dqProgressRows: []};
vm.createContext(plannerContext);
vm.runInContext(plannerSource, plannerContext, {timeout: 30000});
const planner = plannerContext.__planner;

const quietConsole = {...console, error() {}, warn() {}, info() {}};
const engineContext = {console: quietConsole, window: {}};
vm.createContext(engineContext);
vm.runInContext(
  fs.readFileSync('dragonswood-grading-core.js', 'utf8') + '\n' +
  fs.readFileSync('curriculum-question-engine.js', 'utf8') +
  '\n;globalThis.__engine={dwQuestion,dwQuestionWithParams,dwValidQuestion};',
  engineContext,
  {timeout: 30000}
);
const engine = engineContext.__engine;
const signature = q => `${String(q?.prompt || '').trim()}||${[...(q?.choices || [])].map(String).sort().join('|')}`.toLowerCase();
const directDefinition = q => /^(what (?:does|is)|which (?:word|choice))\b.*\b(?:mean|meaning|definition)|\bmeans\s+[“"]|\bdefinition of\b/i.test(String(q?.prompt || '').trim());

function generateUniqueSession(tasks) {
  const used = new Set(), groups = new Map();
  tasks.forEach((task, index) => {
    const stats = groups.get(Math.floor(index / 5)) || {direct: 0, answers: new Set()};
    const ids = [task.skillId, ...(task.alternateSkillIds || [])].filter((id, i, list) => planner.DW_SKILLS[id] && list.indexOf(id) === i);
    let selected = null;
    for (let pass = 0; pass < 2 && !selected; pass++) for (const skillId of ids) {
      const alternate = skillId !== task.skillId;
      const params = alternate ? {grade: task.questionParams?.grade, difficulty: task.questionParams?.difficulty} : task.questionParams;
      for (let tries = 0; tries < 120; tries++) {
        const seed = Number(task.seed || 1) + tries * 9973 + ids.indexOf(skillId) * 104729;
        const qIndex = tries * 17;
        const q = params
          ? engine.dwQuestionWithParams(skillId, params, seed, qIndex)
          : engine.dwQuestion(skillId, seed, qIndex, task.subject, task.skill);
        if (!q || q.source !== 'registry' || !engine.dwValidQuestion(q) || used.has(signature(q))) continue;
        if (pass === 0 && directDefinition(q) && stats.direct >= 1) continue;
        if (pass === 0 && stats.answers.has(String(q.answer).trim().toLowerCase())) continue;
        selected = q; break;
      }
      if (selected) break;
    }
    assert(selected, `question ${index + 1} should have a unique verified generator`);
    used.add(signature(selected));
    if (directDefinition(selected)) stats.direct++;
    stats.answers.add(String(selected.answer).trim().toLowerCase());
    groups.set(Math.floor(index / 5), stats);
  });
  assert.equal(used.size, 30, 'all 30 questions should be unique within a session');
}

assert(daily.includes('q1-curriculum-data.js?v=59.1.0'), 'Morning Work should read the same curriculum source as Curriculum Quest');
assert(daily.includes('window.DRAGONSWOOD_DATA?.items'), 'canonical curriculum items should win over the embedded fallback');
assert(daily.includes('const DAILY_QUEST_BUILD="v49"'));
assert(daily.includes('taskPlan:tasks.slice(0,60)'), 'started assignments should be frozen in progress');

for (const [gradeCode, gradeLevel] of [['I', 4], ['K', 5]]) {
  for (let day = 1; day <= 180; day++) {
    const mappedSpecs = planner.dwPacingSpecs(day, gradeCode);
    const expectedSubjects = new Set(canonicalItems.filter(x => day >= 3 && x.grade === gradeCode && Number(x.day) === day && !/assessment|reflection|review,? extension|make-?up/i.test(x.requirement || '') && (
      (x.subject === 'Math' && /Core Math/i.test(x.strand || '')) ||
      (x.subject === 'HUM' && /-L\d+$/.test(x.id) && !/progress monitor|fluency|partner read|listen to students|cursive:|dictation|anecdotal|check ?point|present and share/i.test(`${x.requirement || ''} ${x.strand || ''}`))
    )).map(x => x.subject));
    for (const subject of expectedSubjects) assert(mappedSpecs.some(x => x.item.subject === subject), `${gradeCode} day ${day} ${subject} curriculum target must map to a verified skill`);
    const math = planner.dwBuildSubjectMorning(day, gradeCode, 'Math');
    const ela = planner.dwBuildSubjectMorning(day, gradeCode, 'HUM');
    const tasks = [];
    for (let i = 0; i < 15; i++) tasks.push(math[i], ela[i]);
    assert.equal(tasks.length, 30);
    assert.equal(tasks.filter(x => x.subject === 'MATH').length, 15);
    assert.equal(tasks.filter(x => x.subject === 'ELA').length, 15);
    for (const [kind, expected] of [['previous', 16], ['past', 8], ['remedial', 4], ['challenge', 2]]) {
      assert.equal(tasks.filter(x => x.sourceKind === kind).length, expected, `${gradeCode} day ${day} ${kind}`);
    }
    assert(tasks.every(x => x.gradeLevel === gradeLevel));
    assert(tasks.every(x => x.sourceDay < day), `${gradeCode} day ${day} must not use today or future content`);
    assert(tasks.every(x => planner.DW_SKILLS[x.skillId]), `${gradeCode} day ${day} skills must be registered`);
    try { planner.dwValidateMorningSequence(tasks); }
    catch (error) { throw new Error(`${gradeCode} day ${day}: ${error.message} :: ${tasks.map(x => x.skillId).join(', ')}`); }
    for (const task of tasks) {
      let q = null;
      for (let attempt = 0; attempt < 30 && !q; attempt++) {
        const candidate = engine.dwQuestionWithParams(task.skillId, task.questionParams, task.seed + attempt * 9973, attempt * 17);
        if (candidate?.source === 'registry' && engine.dwValidQuestion(candidate)) q = candidate;
      }
      assert(q, `${gradeCode} day ${day} ${task.skillId} ${JSON.stringify(task.questionParams)} must generate`);
    }
    if (day <= 40 || [41, 60, 100, 140, 180].includes(day)) generateUniqueSession(tasks);
  }
}

plannerContext.dqProgressRows = [{session: 'morning', day: 10, needsReteach: ['math.add.multi', 'ela.meaning'], skills: {}}];
const personalized = [
  ...planner.dwBuildSubjectMorning(23, 'I', 'Math'),
  ...planner.dwBuildSubjectMorning(23, 'I', 'HUM')
].filter(x => x.sourceKind === 'remedial');
assert(personalized.some(x => x.skillId === 'math.add.multi' && x.remediationStatus === 'personalized'));
assert(personalized.some(x => x.skillId === 'ela.meaning' && x.remediationStatus === 'personalized'));

for (let i = 0; i < 12; i++) {
  const decimal = engine.dwQuestionWithParams('math.pk.rounding_decimals', {grade: 5}, 1000 + i, i);
  assert(/\d+\.\d+/.test(decimal.prompt) && /nearest (tenth|hundredth|thousandth)/.test(decimal.prompt));
  const multi = engine.dwQuestionWithParams('math.wordproblems', {grade: 4}, 2000 + i, i);
  assert(/then|plus/.test(multi.prompt), 'grade 4 word problems should require more than one step');
}

console.log('morning-work prior-learning selftest: PASS (360 plans / 10,800 generator checks / 90 full unique sessions)');
