const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const dataContext={window:{}};vm.createContext(dataContext);
vm.runInContext(fs.readFileSync('placement-benchmark-data.js','utf8'),dataContext);
const data=dataContext.window.DW_PLACEMENT_BENCHMARK;
assert.equal(data.version,'math-ela-adaptive-placement-v2');
assert.equal(data.math.length,20);assert.equal(data.ela.length,20);
for(const rows of [data.math,data.ela])for(const level of data.levels)assert.equal(rows.filter(x=>x.placementLevel===level).length,5);

const engineContext={console:{...console,error(){},warn(){}},window:{}};vm.createContext(engineContext);
vm.runInContext(fs.readFileSync('dragonswood-grading-core.js','utf8')+'\n'+fs.readFileSync('curriculum-question-engine.js','utf8')+'\n;globalThis.__engine={DW_SKILLS,dwQuestionWithParams,dwValidQuestion,dwQuestionClarityIssues};',engineContext,{timeout:30000});
const engine=engineContext.__engine,used=new Set();
for(const [subject,rows] of [['MATH',data.math],['ELA',data.ela]])for(let i=0;i<rows.length;i++){
 const row=rows[i];assert(engine.DW_SKILLS[row.skillId],`${row.skillId} must be registered`);let question=null;
 for(let attempt=0;attempt<120&&!question;attempt++){const q=engine.dwQuestionWithParams(row.skillId,{...(row.questionParams||{}),grade:row.placementLevel==='foundation'?3:Number(row.placementLevel),difficulty:'benchmark'},930003+i*7919+(subject==='ELA'?40009:0)+attempt*9973,attempt*17),sig=q?`${q.prompt}||${q.answer}`.toLowerCase():'';if(q?.source==='registry'&&engine.dwValidQuestion(q)&&!used.has(sig)){question=q;used.add(sig)}}
 assert(question,`${subject} ${row.standard} must generate a unique valid question`);assert.equal(engine.dwQuestionClarityIssues(question).length,0,`${subject} ${row.standard} must be child-clear`);
}
assert.equal(used.size,40);
const daily=fs.readFileSync('daily-quest.html','utf8'),rules=fs.readFileSync('firestore.rules','utf8');
assert(daily.includes('DW_PLACEMENT_DATE="2026-09-03"'));
assert(daily.includes('sessionName=DW_PLACEMENT_MODE?"morning"'));
assert(daily.includes('studentVisible:false'));
assert(daily.includes('gradeBandDifference:delta'));
assert(daily.includes('if(DW_PLACEMENT_MODE)setTimeout(advance,450)'));
assert(daily.includes('function dwAdaptivePlacementTarget(subject)'));
assert(daily.includes('function dwExtendPlacementSubject(subject)'));
assert(daily.includes('answered>=50'));
assert(daily.includes('answered>=40'));
assert(daily.includes('if(!DW_PLACEMENT_MODE)dwValidateMorningSequence(tasks.filter(t=>!t._isRetry))'),'placement must not be blocked by Morning Work sequence rules');
assert(daily.includes('enforceMorning=sessionName==="morning"&&!DW_PLACEMENT_MODE'),'placement must not use Morning Work answer-pattern restrictions');
assert(daily.includes('async function startSessionUnsafe()'));
assert(daily.includes('Benchmark":"Quest"} could not start:'),'startup failures must be visible instead of leaving a dead button');
assert(daily.includes('<body class="dw-quest-loading">'),'ordinary Morning Work must not flash before benchmark mode is ready');
assert(rules.includes('match /placementReports/{studentId}'));
assert(rules.includes('allow read, delete: if isTeacher()'));
console.log('placement benchmark selftest: PASS (30-question core / adaptive to 40–50 per subject / four bands / private teacher report)');
