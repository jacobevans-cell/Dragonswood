import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import vm from 'node:vm';

// Execute the real browser functions with controlled network ordering. No
// preview server, browser database, or student work is touched by these tests.
const source = readFileSync(new URL('../../learning-portal/public/app.js', import.meta.url), 'utf8');
const between = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
const functions = [
  between('const profileContext =', 'const names ='),
  between('function shell(body)', 'function home()'),
  between('function recoveryKey(', 'async function exportWork()'),
  between('function exportAssignment(', 'function addEvidence('),
  between('async function load()', 'window.addEventListener("hashchange"'),
].join('\n');
const makeState = (grade = 4) => ({ grade, previewId: 'isolated-test', serverTime: Date.now(), drafts: {}, submissions: {}, videoProgress: {}, interviews: {}, writingProject: null,
  completion: { sections: { math: false, writing: false, morphology: false }, done: 0, total: 3, complete: false } });
const boot = (grade = 4) => ({ content: { grade, day:30, version: 'day30', assignments: ['math', 'writing', 'morphology'], lessonVersions: { math: 'm1', writing: 'w1', morphology: 'q1' } }, state: makeState(grade), videoLessons: [] });
const projectBoot = (day = 31, grade = 4) => {
  const b = boot(grade);
  b.content.day = day;
  b.content.assignments.push('science');
  b.content.lessonVersions.science = 'science-v1';
  Object.assign(b.state,{day,writingProject:{topicId:'teamwork'},scienceStrategy:{choice:{strategyId:'cushioning'}},
    projectWork:{writing:{revision:8,sourceDay:32,data:{topicId:'teamwork',draft:'Newer shared essay'}},science:{revision:7,sourceDay:32,data:{design:'Newer shared design'}}},
    projectReviews:{designCurrent:true,design:{approved:true,note:'Review of newer design'}}});
  b.state.drafts.writing={revision:2,data:structuredClone(b.state.projectWork.writing.data)};
  b.state.drafts.science={revision:2,data:structuredClone(b.state.projectWork.science.data)};
  b.state.completion.sections.science=false;b.state.completion.total++;
  return b;
};
const tick = () => new Promise((resolve) => setImmediate(resolve));

function harness(network = async () => makeState()) {
  const storage = new Map();
  const calls = [], messages = [], downloads = [];
  const dayElement = {value:'30',disabled:false,addEventListener:(_event,handler)=>{dayElement.onchange=handler;}};
  const gradeElement = { value: '4', disabled: false, addEventListener: (_event, handler) => { gradeElement.onchange = handler; } };
  const appElement = { innerHTML: '' };
  const retryElement = { addEventListener: (_event, handler) => { retryElement.click = handler; } };
  const context = vm.createContext({
    structuredClone, Set, Map, Date, JSON, Number, Object, Error, Blob, hosted:false, embeddedPath:false, crypto: { randomUUID },
    setTimeout: () => 1, clearTimeout() {},
    localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) },
    URL: { createObjectURL: (blob) => { downloads.push(blob); return 'blob:isolated'; }, revokeObjectURL() {} },
    document: { activeElement: null, querySelector: selector => selector === '[data-retry-quest]' ? retryElement : null, querySelectorAll: () => [], getElementById: () => null, createElement: () => ({ click() {} }) },
    $: (selector) => selector === '#day' ? dayElement : selector === '#grade' ? gradeElement : selector === '#app' ? appElement : null,
    api: async (path, body) => { calls.push({ path, body }); return network(path, body); },
    toast: (message) => messages.push(message),
    portalIdentityMarkup:()=>'',portalGuideMarkup:()=>'',
    canPreviewDays:()=>true,visibleTeachingDays:()=>[30,31,32,33,35,36,37,38],
  });
  vm.runInContext(`let grade=4, day=30, state=${JSON.stringify(makeState())}, content=${JSON.stringify(boot().content)}, videos=[], clockOffset=0, work={}, pendingWritingTopic=null, pendingRequests={}, dirty=new Set(), conflicts=new Set(), resolvingConflicts=new Set(), profileGeneration=0, loadingProfile=false, switchingProfile=false, lockingTopic=false, saveChain=Promise.resolve(), saveTimer=null, route='writing', renderCount=0;
    const TEACHING_DAYS=[30,31,32,33,35,36,37,38],weekday=d=>['Monday','Tuesday','Wednesday','Thursday'][(d-30)%5]; const names={writing:'Writing',morphology:'Morphology',math:'Math'};
    const questionChecking=new Set(), questionMessages=new Map(), recoveryAnswers=new Map(); let pendingQuestions={};
    const esc=x=>String(x??''), nav=()=>'', render=()=>{renderCount++}, renderKeepingFocus=render, mergeVideoProgress=()=>{}, updateVideoLocks=()=>{}, stopVideos=()=>{}, stopScienceStrategy=()=>{}, stopCCF=()=>{}, stopBattle=()=>{};
    const data=id=>work[id]||(work[id]=structuredClone(state.drafts[id]?.data||{}));
    ${functions}`, context);
  const run = (code) => vm.runInContext(code, context);
  const read = (code) => JSON.parse(run(`JSON.stringify(${code})`));
  return { run, read, storage, calls, messages, downloads, dayElement, gradeElement, appElement, retryElement, context };
}

test('a failed lesson load retries the same profile without navigating away or erasing recovery', async () => {
  let attempts=0;
  const h=harness(async()=>{if(++attempts===1)throw Error('Temporary outage');return boot(4);});
  h.storage.set('unrelated-recovery', 'Preserved student writing');
  await h.run('load()');
  assert.match(h.appElement.innerHTML,/data-retry-quest/);
  assert.doesNotMatch(h.appElement.innerHTML,/href="\/"/);
  assert.equal(h.read('loadingProfile'),false);
  await h.retryElement.click();
  assert.equal(h.calls[1].path,h.calls[0].path);
  assert.equal(h.read('renderCount'),1);
  assert.equal(h.storage.get('unrelated-recovery'),'Preserved student writing');
});

test('a writing conflict leaves morphology autosave fully operational', async () => {
  const h = harness(async (_path, payload) => {
    if (payload.assignment === 'writing') throw Object.assign(new Error('Newer writing draft.'), { conflict: true, status: 409 });
    const next = makeState();
    next.drafts.morphology = { revision: 1, data: structuredClone(payload.data) };
    return next;
  });
  h.run("work.writing={opinion:'My saved opinion'}; work.morphology={response:'A thoughtful quickwrite'}; dirty.add('writing'); dirty.add('morphology')");
  await h.run("queueSave('writing')");
  await h.run("queueSave('morphology')");
  assert.deepEqual(h.calls.map((c) => c.body.assignment), ['writing', 'morphology']);
  assert.deepEqual(h.read('[...conflicts]'), ['writing']);
  assert.deepEqual(h.read('[...dirty]'), ['writing']);
  assert.equal(h.read('state.drafts.morphology.data.response'), 'A thoughtful quickwrite');
  assert.ok([...h.storage.keys()].some((key) => key.endsWith(':writing:w1')));
  assert.ok(![...h.storage.keys()].some((key) => key.endsWith(':morphology')));
});

test('an exhausted busy response retains the persisted receipt until the exact save is acknowledged',async()=>{
 let attempts=0;const h=harness(async(_path,body)=>{if(++attempts===1)throw Object.assign(Error('Server busy'),{status:429});const next=makeState();next.drafts.morphology={revision:1,data:structuredClone(body.data)};return next;});
 h.run("work.morphology={response:'Keep this quickwrite'};dirty.add('morphology')");await h.run("queueSave('morphology')");
 const key=h.read('pendingRequests.morphology.payload.key');assert.ok(key);assert.equal(h.read('work.morphology.response'),'Keep this quickwrite');assert.equal(JSON.parse(h.storage.get('dw-recovery:isolated-test:4:morphology')).pending.payload.key,key);
 await h.run("queueSave('morphology')");assert.equal(h.calls[1].body.key,key);assert.equal(h.read('dirty.size'),0);assert.equal(h.storage.has('dw-recovery:isolated-test:4:morphology'),false);
});

test('conflict recovery exports and replaces only its assignment, retaining unrelated edits and pending requests', async () => {
  const next = makeState();
  next.drafts.writing = { revision: 9, data: { opinion: 'Newer server opinion' } };
  next.drafts.morphology = { revision: 1, data: { response: 'Old server quickwrite' } };
  const h = harness(async () => next);
  h.run("work.writing={opinion:'Unsent opinion'}; work.morphology={response:'New unsent quickwrite'}; state.drafts.morphology={revision:4,data:{response:'Earlier local revision'}}; dirty.add('writing');dirty.add('morphology');conflicts.add('writing');pendingRequests.morphology={submit:false,payload:{grade:4,assignment:'morphology',key:'keep-this-key'}};");
  h.run("localStorage.setItem(recoveryKey('writing'),'writing-recovery');localStorage.setItem(recoveryKey('morphology'),'morphology-recovery')");
  await h.run("resolveConflict('writing')");
  assert.equal(h.read('work.writing.opinion'), 'Newer server opinion');
  assert.equal(h.read('work.morphology.response'), 'New unsent quickwrite');
  assert.equal(h.read('state.drafts.morphology.revision'), 4);
  assert.equal(h.read('pendingRequests.morphology.payload.key'), 'keep-this-key');
  assert.deepEqual(h.read('[...dirty]'), ['morphology']);
  assert.deepEqual(h.read('[...conflicts]'), []);
  assert.equal(h.storage.get('dw-recovery:isolated-test:4:morphology'), 'morphology-recovery');
  assert.equal(h.storage.get('dw-recovery:isolated-test:4:writing:w1'), undefined);
  assert.equal(h.downloads.length, 1);
  const exported = JSON.parse(await h.downloads[0].text());
  assert.equal(exported.assignment, 'writing');
  assert.equal(exported.data.opinion, 'Unsent opinion');
  assert.equal(exported.browserRecovery, 'writing-recovery');
});

test('failed conflict recovery retains original work, conflict and browser recovery copy', async () => {
  const h = harness(async () => { throw new Error('offline'); });
  h.run("work.writing={opinion:'Keep my work'};dirty.add('writing');conflicts.add('writing');localStorage.setItem(recoveryKey('writing'),'recover-me')");
  await assert.rejects(h.run("resolveConflict('writing')"), /offline/);
  assert.equal(h.read('work.writing.opinion'), 'Keep my work');
  assert.deepEqual(h.read('[...conflicts]'), ['writing']);
  assert.deepEqual(h.read('[...dirty]'), ['writing']);
  assert.equal(h.storage.get('dw-recovery:isolated-test:4:writing:w1'), 'recover-me');
  assert.equal(h.read('resolvingConflicts.size'), 0);
});

test('older bootstrap responses cannot overwrite a newer grade or same-grade generation', async () => {
  const pending = [];
  const h = harness(() => new Promise((resolve, reject) => pending.push({ resolve, reject })));
  const first = h.run('load()');
  h.run('grade=5');
  const second = h.run('load()');
  pending[1].resolve(boot(5));
  await second;
  pending[0].resolve(boot(4));
  await first;
  assert.deepEqual(h.read('({grade,contentGrade:content.grade,stateGrade:state.grade,loadingProfile})'), { grade: 5, contentGrade: 5, stateGrade: 5, loadingProfile: false });
  const olderSame = h.run('load()');
  const newerSame = h.run('load()');
  const latest = boot(5); latest.state.drafts.math = { revision: 8, data: { value: 'latest' } };
  pending[3].resolve(latest); await newerSame;
  pending[2].reject(new Error('Old request failure')); await olderSame;
  assert.equal(h.read('state.drafts.math.revision'), 8);
  assert.ok(!h.appElement.innerHTML.includes('Old request failure'));
});

test('preview selector serializes transitions and refuses to abandon conflicted drafts', async () => {
  let resolve;
  const h = harness(() => new Promise((r) => { resolve = r; }));
  h.run("shell('')");
  const first = h.gradeElement.onchange({ target: { value: '5', disabled: false } });
  await tick();
  assert.equal(h.read('switchingProfile'), true);
  const secondTarget = { value: '4', disabled: false };
  await h.gradeElement.onchange({ target: secondTarget });
  assert.equal(h.calls.length, 1);
  assert.match(h.calls[0].path, /grade=5/);
  resolve(boot(5)); await first;
  assert.equal(h.read('grade'), 5);
  assert.equal(h.read('state.grade'), 5);
  assert.equal(h.read('switchingProfile'), false);
  h.run("dirty.add('writing');conflicts.add('writing')");
  await h.gradeElement.onchange({ target: { value: '4', disabled: false } });
  assert.equal(h.read('grade'), 5);
  assert.equal(h.calls.length, 1);
  assert.match(h.messages.at(-1), /resolve your current drafts/);
});

test('a delayed save acknowledgment cannot mutate a newly loaded profile or erase the original recovery request', async () => {
  let resolve;
  const h = harness(() => new Promise((r) => { resolve = r; }));
  h.run("work.morphology={response:'Grade 4 pending'};dirty.add('morphology')");
  const pendingSave = h.run("queueSave('morphology')");
  await tick();
  h.run(`grade=5;profileGeneration++;state=${JSON.stringify(makeState(5))};work={morphology:{response:'Grade 5 current'}};pendingRequests={};dirty=new Set()`);
  const stale = makeState(4); stale.drafts.morphology = { revision: 1, data: { response: 'Grade 4 pending' } };
  resolve(stale); await pendingSave;
  assert.equal(h.read('state.grade'), 5);
  assert.equal(h.read('work.morphology.response'), 'Grade 5 current');
  const oldRecovery = JSON.parse(h.storage.get('dw-recovery:isolated-test:4:morphology'));
  assert.equal(oldRecovery.pending.payload.grade, 4);
  assert.equal(oldRecovery.data.response, 'Grade 4 pending');
});

test('polling yields to dirty work then updates completion without replacing unrelated conflict text or focus', async () => {
  let poll;
  const h = harness(async () => { const next = makeState(); next.completion.sections.math = true; next.completion.done = 1; next.submissions.math = { id: 'math-done' }; return next; });
  const navLabel = { textContent: '' };
  h.context.document.querySelectorAll = (selector) => selector === '.nav-link' ? [{ hash: '#math', querySelector: () => navLabel }] : [];
  h.context.document.activeElement = { id: 'writing-opinion', value: 'Still typing', closest: () => true };
  h.context.setInterval = (callback) => { poll = callback; };
  h.run("let statePolling=false;const feedback=()=>'', teacher=async()=>{};work.writing={opinion:'Unsaved writing'};dirty.add('writing');conflicts.add('writing');");
  h.run(source.slice(source.lastIndexOf('setInterval(async () => {'), source.lastIndexOf('\nif(hosted){')));
  await poll();
  assert.equal(h.read('state.completion.sections.math'),false);
  h.run("dirty.delete('writing')");await poll();
  assert.equal(h.read('state.completion.sections.math'), true);
  assert.equal(h.read('work.writing.opinion'), 'Unsaved writing');
  assert.equal(h.read('renderCount'), 0);
  assert.equal(navLabel.textContent, '✓');
  assert.equal(h.context.document.activeElement.value, 'Still typing');
});

test('cross-day project recovery blocks stale or missing bases even when the daily draft revision is unchanged',async()=>{
  for(const assignment of ['writing','science'])for(const withRevision of [true,false]) {
    const b=projectBoot(),h=harness(async()=>b);
    h.run(`day=31;state=${JSON.stringify(b.state)};content=${JSON.stringify(b.content)}`);
    const recovery={revision:2,data:assignment==='writing'?{topicId:'teamwork',draft:'Older browser essay'}:{design:'Older browser design'},...(withRevision?{projectRevision:3}:{})};
    h.storage.set(h.run(`recoveryKey('${assignment}')`),JSON.stringify(recovery));
    await h.run('load()');
    assert.equal(h.read(`conflicts.has('${assignment}')`),true);
    assert.deepEqual(h.read(`work.${assignment}`),recovery.data);
    await h.run(`queueSave('${assignment}');flush()`);
    assert.equal(h.calls.filter(c=>c.body).length,0);
    assert.equal(h.context.document.title,'Dragonswood · Day 31 · Grade 4');
  }
});

test('legacy Day 30 recovery remains compatible until another day changes the shared project',async()=>{
  for(const sourceDay of [30,32]) {
    const b=projectBoot(30);b.state.projectWork.writing.sourceDay=sourceDay;
    const h=harness(async()=>b);h.run(`state=${JSON.stringify(b.state)};content=${JSON.stringify(b.content)}`);
    h.storage.set(h.run("recoveryKey('writing')"),JSON.stringify({revision:2,data:{topicId:'teamwork',draft:'Legacy unsaved essay'}}));
    await h.run('load()');
    assert.equal(h.read("conflicts.has('writing')"),sourceDay===32);
    assert.equal(h.read('work.writing.draft'),'Legacy unsaved essay');
  }
});

test('identical shared fields with older recovery metadata can safely retain only daily edits',async()=>{
  const b=projectBoot(),h=harness(async()=>b);h.run(`day=31;state=${JSON.stringify(b.state)};content=${JSON.stringify(b.content)}`);
  h.storage.set(h.run("recoveryKey('writing')"),JSON.stringify({revision:2,projectRevision:3,data:{...b.state.drafts.writing.data,dailyNote:'Local daily reflection'}}));
  await h.run('load()');
  assert.equal(h.read("conflicts.has('writing')"),false);
  assert.equal(h.read("projectBaseRevision('writing')"),8);
  assert.equal(h.read('work.writing.dailyNote'),'Local daily reflection');
});

test('all recovery writes retain the work base through unrelated snapshots and definitive save errors',async()=>{
  const b=projectBoot();let saves=0;
  const h=harness(async(path)=>{if(path.startsWith('/api/bootstrap'))return b;saves++;throw Object.assign(Error('Newer shared project'),{status:409,conflict:true});});
  h.run('day=31');await h.run('load()');
  h.run("work.writing.draft='My new text';changed('writing')");
  const key=h.run("recoveryKey('writing')");
  assert.equal(JSON.parse(h.storage.get(key)).projectRevision,8);
  h.run("state.projectWork.writing={revision:12,sourceDay:35,data:{topicId:'teamwork',draft:'Another day changed it'}};changed('writing')");
  assert.equal(JSON.parse(h.storage.get(key)).projectRevision,8);
  await h.run("queueSave('writing')");
  assert.equal(saves,1);assert.equal(h.calls.at(-1).body.projectRevision,8);
  const envelope=JSON.parse(h.storage.get(key));
  assert.equal(envelope.projectRevision,8);assert.equal(envelope.pending,undefined);
  assert.equal(envelope.day,31);assert.equal(envelope.grade,4);assert.equal(envelope.previewId,'isolated-test');
  assert.equal(envelope.data.draft,'My new text');
});

test('science conflict recovery refreshes its canonical revision and reviews without rebasing unrelated writing',async()=>{
  const b=projectBoot(),next=structuredClone(b.state);
  next.projectWork.science={revision:11,sourceDay:35,data:{design:'Reviewed current design'}};
  next.drafts.science={revision:4,data:structuredClone(next.projectWork.science.data)};
  next.projectReviews={designCurrent:false,design:{approved:true,note:'Previous review needs renewal'}};
  next.projectWork.writing={revision:20,sourceDay:35,data:{topicId:'teamwork',draft:'Server writing changed'}};
  const h=harness(async(path,payload)=>{
    if(path.startsWith('/api/bootstrap'))return b;
    if(!payload)return structuredClone(next);
    assert.equal(payload.assignment,'science');assert.equal(payload.projectRevision,11);assert.equal(payload.revision,4);
    const accepted=structuredClone(next);accepted.projectWork.science={revision:12,sourceDay:31,data:payload.data};accepted.drafts.science={revision:5,data:payload.data};return accepted;
  });
  h.run('day=31');await h.run('load()');
  h.run("work.science.design='Keep exported design';changed('science');conflicts.add('science');work.writing.draft='Unsent unrelated essay';changed('writing');pendingRequests.writing={submit:false,payload:{day:31,grade:4,assignment:'writing',key:'keep-writing-receipt',projectRevision:8}};");
  const writingRecovery=h.storage.get(h.run("recoveryKey('writing')"));
  await h.run("resolveConflict('science')");
  assert.equal(h.read("projectBaseRevision('science')"),11);
  assert.deepEqual(h.read('state.projectReviews'),next.projectReviews);
  assert.equal(h.read('state.projectWork.writing.revision'),8);
  assert.equal(h.read("projectBaseRevision('writing')"),8);
  assert.equal(h.read('work.writing.draft'),'Unsent unrelated essay');
  assert.equal(h.read('pendingRequests.writing.payload.key'),'keep-writing-receipt');
  assert.equal(h.storage.get(h.run("recoveryKey('writing')")),writingRecovery);
  const exported=JSON.parse(await h.downloads[0].text());assert.equal(exported.day,31);assert.equal(exported.projectRevision,7);assert.equal(exported.data.design,'Keep exported design');
  h.run("work.science.design='Current design with new detail';changed('science')");await h.run("queueSave('science')");
  assert.equal(h.read("conflicts.has('science')"),false);assert.equal(h.read("dirty.has('science')"),false);
  assert.equal(h.read('state.projectWork.science.revision'),12);
});

test('an uncertain receipt replays its original project revision then adopts current shared work',async()=>{
  const b=projectBoot(),payload={grade:4,day:31,assignment:'writing',projectRevision:3,revision:1,lessonVersion:'w1',key:'same-original-key',data:{topicId:'teamwork',draft:'Already accepted old delivery'}};
  const h=harness(async(path)=>path.startsWith('/api/bootstrap')?b:structuredClone(b.state));
  h.run(`day=31;state=${JSON.stringify(b.state)};content=${JSON.stringify(b.content)}`);
  h.storage.set(h.run("recoveryKey('writing')"),JSON.stringify({revision:1,projectRevision:3,data:payload.data,pending:{submit:false,payload}}));
  await h.run('load()');await h.run("queueSave('writing')");
  assert.deepEqual(h.calls.at(-1).body,payload);
  assert.equal(h.read('work.writing.draft'),'Newer shared essay');assert.equal(h.read("projectBaseRevision('writing')"),8);
  h.run("work.writing.draft+=' and one new detail';changed('writing')");
  assert.equal(JSON.parse(h.storage.get(h.run("recoveryKey('writing')"))).projectRevision,8);
});

test('a save acknowledgment advances the base for in-flight edits only for its own revision',async()=>{
  for(const finalRevision of [9,12]) {
    const b=projectBoot();let resolve;
    const h=harness(async(path,payload)=>path.startsWith('/api/bootstrap')?b:new Promise(r=>{resolve=()=>{const n=structuredClone(b.state);n.projectWork.writing={revision:finalRevision,sourceDay:finalRevision===9?31:35,data:finalRevision===9?payload.data:{topicId:'teamwork',draft:'Other-day essay'}};n.drafts.writing={revision:3,data:structuredClone(n.projectWork.writing.data)};r(n)}}));
    h.run('day=31');await h.run('load()');
    h.run("work.writing.draft='First edit';changed('writing')");
    const save=h.run("queueSave('writing')");await tick();
    h.run("work.writing.draft='New edit while waiting';changed('writing')");resolve();await tick();
    if(finalRevision===9) {
      assert.equal(h.calls.at(-1).body.projectRevision,9);
      assert.equal(JSON.parse(h.storage.get(h.run("recoveryKey('writing')"))).projectRevision,9);
      resolve();await save;assert.equal(h.read("conflicts.has('writing')"),false);
    } else {
      await save;assert.equal(h.calls.filter(c=>c.body).length,1);assert.equal(h.read("conflicts.has('writing')"),true);
      assert.equal(h.read('work.writing.draft'),'New edit while waiting');assert.equal(h.read("projectBaseRevision('writing')"),8);
      assert.equal(JSON.parse(h.storage.get(h.run("recoveryKey('writing')"))).projectRevision,8);
    }
  }
});

test('wrong-day save responses and saved requests cannot replace current work or erase receipts',async()=>{
  const b=projectBoot(),wrong=structuredClone(b.state);wrong.day=32;
  const h=harness(async(path)=>path.startsWith('/api/bootstrap')?b:wrong);
  h.run('day=31');await h.run('load()');h.run("work.writing.draft='Day 31 work';changed('writing')");
  await h.run("queueSave('writing')");assert.equal(h.read('state.day'),31);assert.equal(h.read('work.writing.draft'),'Day 31 work');
  assert.equal(h.read('pendingRequests.writing.payload.day'),31);assert.ok(h.storage.get(h.run("recoveryKey('writing')")));
  const before=h.calls.length;h.run('pendingRequests.writing.payload.day=32');await h.run("queueSave('writing')");
  assert.equal(h.calls.length,before);assert.match(h.messages.at(-1),/another profile/);
});

test('wrong-day conflict recovery preserves both local work and its shared revision',async()=>{
  const b=projectBoot(),wrong=structuredClone(b.state);wrong.day=32;wrong.projectWork.science.revision=99;
  const h=harness(async(path)=>path.startsWith('/api/bootstrap')?b:wrong);
  h.run('day=31');await h.run('load()');h.run("work.science.design='Keep local';changed('science');conflicts.add('science')");
  await assert.rejects(h.run("resolveConflict('science')"),/different preview profile/);
  assert.equal(h.read('work.science.design'),'Keep local');assert.equal(h.read("projectBaseRevision('science')"),7);assert.equal(h.read("conflicts.has('science')"),true);
});

test('historical Day 30 fields need explicit export and recovery before using a future canonical project revision',async()=>{
  const b=projectBoot(30);b.state.drafts.writing.data={topicId:'teamwork',draft:'Historical Day 30 essay',dailyNote:'Day 30 note'};
  const original=structuredClone(b.state);
  const h=harness(async()=>structuredClone(b));
  await h.run('load()');
  assert.equal(h.read("conflicts.has('writing')"),true);assert.equal(h.read('work.writing.draft'),'Historical Day 30 essay');
  await h.run("queueSave('writing');flush()");assert.equal(h.calls.filter(c=>c.body).length,0);
  // State endpoint returns the same historical daily row and the newer shared
  // project. Explicit recovery must combine them without changing either row.
  h.context.api=async(path,body)=>{h.calls.push({path,body});return structuredClone(original)};
  await h.run("resolveConflict('writing')");
  assert.equal(h.read('work.writing.draft'),'Newer shared essay');assert.equal(h.read('work.writing.dailyNote'),'Day 30 note');
  assert.equal(h.read('state.drafts.writing.data.draft'),'Historical Day 30 essay');
  assert.equal(h.read("conflicts.has('writing')"),false);assert.equal(h.read("projectBaseRevision('writing')"),8);
  assert.equal(JSON.parse(await h.downloads[0].text()).data.draft,'Historical Day 30 essay');
  assert.deepEqual(b.state,original);
});

test('legacy Day 30 receipt replay cannot silently rebase new text over a future-day project',async()=>{
  for(const editedAgain of [false,true]) {
    const b=projectBoot(30),originalText={topicId:'teamwork',draft:'Accepted historical essay'};
    b.state.drafts.writing.data=originalText;
    const payload={grade:4,assignment:'writing',revision:1,lessonVersion:'w1',key:'legacy-day30-receipt',data:originalText};
    const h=harness(async(path)=>path.startsWith('/api/bootstrap')?structuredClone(b):structuredClone(b.state));
    h.run(`state=${JSON.stringify(b.state)};content=${JSON.stringify(b.content)}`);
    h.storage.set(h.run("recoveryKey('writing')"),JSON.stringify({revision:1,data:editedAgain?{topicId:'teamwork',draft:'Further local edits'}:originalText,pending:{submit:false,payload}}));
    await h.run('load()');assert.equal(h.read("conflicts.has('writing')"),false);
    await h.run("queueSave('writing')");assert.equal(h.calls.filter(c=>c.body).length,1);
    assert.equal(h.calls.at(-1).body.projectRevision,undefined);assert.equal(h.calls.at(-1).body.day,undefined);
    assert.equal(h.read("conflicts.has('writing')"),editedAgain);
    assert.equal(h.read('work.writing.draft'),editedAgain?'Further local edits':'Newer shared essay');
    assert.equal(h.read('state.drafts.writing.data.draft'),'Accepted historical essay');
  }
});

test('actual passage pointer/keyboard/touch bindings save exact single-paragraph evidence and clear stale selections',async()=>{
  const text='Mira paused. Rowan checked the map. Then they agreed.';
  const listeners=new Map(),buttonListeners=new Map();let domSelection=null;
  const passage={addEventListener:(type,fn)=>listeners.set(type,fn)};
  const button={addEventListener:(type,fn)=>buttonListeners.set(type,fn)};
  const paragraph={dataset:{para:'0'},closest:selector=>selector==='#passage'?passage:paragraph,contains:node=>node?.paragraph===paragraph};
  const markedSpan={closest:()=>paragraph};
  const node={nodeType:3,parentElement:markedSpan,paragraph,baseOffset:12};
  const outsider={nodeType:3,parentElement:{closest:()=>null}};
  const document={getElementById:id=>id==='passage'?passage:id==='add-selection'?button:null,
    createRange:()=>{let prefix='';return{selectNodeContents(){},setEnd:(n,offset)=>{prefix=text.slice(0,n.baseOffset+offset)},toString:()=>prefix}},
    querySelectorAll:()=>({item:()=>null})};
  const context=vm.createContext({structuredClone,Set,Map,Object,Number,JSON,crypto:{randomUUID},document,window:{getSelection:()=>domSelection},toast:()=>{}});
  vm.runInContext(`let grade=4,day=31,profileGeneration=1,state={previewId:'highlight-test'},route='reading',loadingProfile=false,selection=null,content={passage:{id:'story-31',version:'v1',paragraphs:[${JSON.stringify(text)}]},readingTask:{evidenceCategories:[{id:'evidence'}]}},work={reading:{}},renderCount=0;
    const data=id=>work[id],changed=()=>{},render=()=>{selection=null;renderCount++};
    ${between('const profileContext =','const names =')}
    ${between('function addEvidence(','function bind()')}
    ${between('async function action(el)','async function load()')}`,context);
  const run=code=>vm.runInContext(code,context);
  const read=code=>JSON.parse(run(`JSON.stringify(${code})`));
  const choose=(start,end,endNode=node)=>{domSelection={rangeCount:1,isCollapsed:false,getRangeAt:()=>({startContainer:node,endContainer:endNode,startOffset:start-node.baseOffset,toString:()=>text.slice(start,end)})}};
  run('bindPassageSelection()');assert.deepEqual([...listeners.keys()],['pointerup','keyup','touchend']);assert.ok(buttonListeners.has('pointerdown'));
  const start=text.indexOf('Rowan'),end=text.indexOf(' Then');
  choose(start,end+1);listeners.get('pointerup')();
  assert.deepEqual(read('selection'),{para:0,start,end,quote:'Rowan checked the map.'});
  // Button focus may collapse the native selection. The bound pointer capture
  // and action preserve that exact excerpt, then addEvidence records its source.
  buttonListeners.get('pointerdown')();domSelection={rangeCount:0,isCollapsed:true};
  await run("action({dataset:{action:'add-selection'}})");
  assert.equal(read('work.reading.evidence.length'),1);
  assert.deepEqual(read('Object.fromEntries(Object.entries(work.reading.evidence[0]).filter(([key])=>key!=="id"))'),{para:0,start,end,quote:'Rowan checked the map.',source:'story-31',version:'v1',category:'evidence',note:''});
  assert.equal(read('selection'),null);
  choose(start,end);listeners.get('keyup')();assert.equal(read('selection.quote'),'Rowan checked the map.');
  choose(start,end,outsider);listeners.get('touchend')();assert.equal(read('selection'),null);
  choose(start,end);listeners.get('pointerup')();run('day=32');listeners.get('keyup')();
  // A previous render's event handler cannot capture under a different day.
  assert.equal(read('selection.quote'),'Rowan checked the map.');run('bindPassageSelection()');assert.equal(read('selection'),null);
  // Execute the actual render reset with no content; it must discard a cached
  // excerpt even before the replacement view builds its new paragraph nodes.
  run(`content=null;selection={quote:'stale'};(${between('function render()','function renderKeepingFocus()')})()`);
  assert.equal(read('selection'),null);
});
