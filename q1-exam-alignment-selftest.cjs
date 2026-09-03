const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const context={window:{},console:{...console,error(){},warn(){}}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('q1-exam-alignment-data.js','utf8'),context);
const alignment=context.window.DW_Q1_EXAM_ALIGNMENT;

assert.equal(alignment.version,'q1-exam60-pacing40-v2');
assert.deepEqual(JSON.parse(JSON.stringify(alignment.authorityWeights)),{exam:0.60,pacingGuide:0.40});
assert.deepEqual(JSON.parse(JSON.stringify(alignment.morningSubjects)),{MATH:10,HUM:10,SCIENCE:10});
assert.equal(alignment.sources.exams.length,7);
assert.deepEqual(JSON.parse(JSON.stringify(alignment.sources.intentionallyExcluded)),['SS HUM I Q1.pdf','SS HUM K Q1.pdf']);
assert(!alignment.sources.exams.some(name=>/^SS\b/i.test(name)));

vm.runInContext(
  fs.readFileSync('dragonswood-grading-core.js','utf8')+'\n'+
  fs.readFileSync('curriculum-question-engine.js','utf8')+
  '\n;globalThis.__examTest={DW_SKILLS,SCI_GEN,hashSeed,dwQuestionWithParams,dwValidQuestion};',
  context,{timeout:30000}
);
const engine=context.__examTest;
for(const gradeCode of ['I','K']){
  const form=alignment.forms[gradeCode];
  for(const subject of ['MATH','HUM','SCIENCE']){
    assert(form[subject].length>0,`${gradeCode} ${subject} must have exam blueprint rows`);
    for(const row of form[subject]){
      assert.equal(alignment.byId[row.id],row,`${row.id} must be indexed`);
      assert(row.standard&&row.sourceExam&&row.sourceQuestion!==undefined);
      assert(engine.DW_SKILLS[row.skillId],`${row.id} skill ${row.skillId} must be registered`);
      const q=engine.dwQuestionWithParams(row.skillId,{...(row.questionParams||{}),grade:form.gradeLevel,examAligned:true},810001+Number(row.sourceQuestion||0)*9973,Number(row.preferredIndex||0));
      assert(q&&q.source==='registry'&&engine.dwValidQuestion(q),`${row.id} must generate a fair, gradable exam-aligned question`);
    }
  }
}

assert.deepEqual(Object.keys(alignment.pacingBridges.K.Science).map(Number),[3,4,5,6,7,8,9,10]);
for(const day of Object.keys(alignment.pacingBridges.K.Science)){
  const bridge=alignment.pacingBridges.K.Science[day];
  assert(bridge.standards.length&&bridge.skills.length&&bridge.iCan);
  assert(bridge.skills.every(id=>engine.DW_SKILLS[id]));
}

for(const [family,modes] of Object.entries({observation_evidence:4,matter_properties:6,mass_conservation:3,density:4,physical_chemical_change:4,noncontact_forces:4,food_energy:4,plant_materials:4,matter_movement:4,collisions:5})){
  for(let index=0;index<modes;index++){
    const q=engine.SCI_GEN[family](engine.hashSeed(12345+index*31),{},index);
    assert.deepEqual(JSON.parse(JSON.stringify(context.window.DWGrading.auditQuestion(q))),[],`${family} mode ${index} must not reveal its answer through formatting or length`);
  }
}

console.log('Q1 exam alignment selftest: PASS (7 included exams / SS excluded / Grade 5 Science bridge verified)');
