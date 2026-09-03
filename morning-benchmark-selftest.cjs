const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const dataContext={window:{}};
vm.createContext(dataContext);
vm.runInContext(fs.readFileSync('morning-benchmark-data.js','utf8'),dataContext);
const data=dataContext.window.DW_MORNING_BENCHMARKS;
assert.equal(data.version,'q1-pacing-az-v1');

const quietConsole={...console,error(){},warn(){}};
const engineContext={console:quietConsole,window:{}};
vm.createContext(engineContext);
vm.runInContext(
  fs.readFileSync('dragonswood-grading-core.js','utf8')+'\n'+
  fs.readFileSync('curriculum-question-engine.js','utf8')+
  '\n;globalThis.__engine={DW_SKILLS,dwQuestionWithParams,dwValidQuestion};',
  engineContext,{timeout:30000}
);
const engine=engineContext.__engine;
const signature=q=>`${q.prompt}||${[...q.choices].map(String).sort().join('|')}`.toLowerCase();

for(const [gradeCode,gradeLevel] of [['I',4],['K',5]]){
  const form=data.forms[gradeCode];
  assert.equal(form.gradeLevel,gradeLevel);
  assert.equal(form.math.length,15);
  assert.equal(form.ela.length,15);
  const tasks=[...form.math.map(x=>({...x,subject:'MATH'})),...form.ela.map(x=>({...x,subject:'ELA'}))];
  assert.equal(tasks.length,30);
  assert(tasks.every(x=>x.standard&&x.skillId&&x.sourceDocumentId&&x.firstTaughtDay>0));
  assert(tasks.every(x=>engine.DW_SKILLS[x.skillId]),`${gradeCode} benchmark skills must be registered`);
  const used=new Set();
  for(let index=0;index<tasks.length;index++){
    const task=tasks[index];let q=null;
    for(let attempt=0;attempt<120&&!q;attempt++){
      const candidate=engine.dwQuestionWithParams(task.skillId,{...(task.questionParams||{}),grade:gradeLevel,difficulty:'benchmark'},910003+gradeLevel*10007+index*7919+attempt*9973,attempt*17);
      if(candidate?.source==='registry'&&engine.dwValidQuestion(candidate)&&!used.has(signature(candidate)))q=candidate;
    }
    assert(q,`${gradeCode} ${task.standard} ${task.skillId} must generate a unique valid question`);
    used.add(signature(q));
  }
  assert.equal(used.size,30);
}

const daily=fs.readFileSync('daily-quest.html','utf8');
assert(daily.includes('row?.session==="benchmark_q1"&&row?.status==="complete"'));
assert(daily.includes('bySkill.has(id)'), 'benchmark gaps must remain restricted to already-taught Morning Work skills');
assert(daily.includes('No XP or Gold awarded'));
assert(daily.includes('standards:standardStats'));
console.log('morning benchmark selftest: PASS (Grade 4 + Grade 5 / 60 unique verified questions)');
