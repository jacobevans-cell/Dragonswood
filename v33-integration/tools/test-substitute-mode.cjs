'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const Core=require('../js/integration/core.js');
const Passes=require('../js/integration/passes.js');

const window={DWV33Core:Core};
const load=file=>vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,file),'utf8'),{window,Intl,Date,Object,Array,Map,Set,String,Number,Math},{filename:file});
load('../js/integration/world.js');
load('../js/integration/operations.js');
const Ops=window.DWV33Operations;

const now=new Date('2026-08-31T18:00:00.000Z');
let mode=Ops.datedSubstituteMode({active:true,dateKey:'2026-08-31',reason:'Ask the substitute.',expiresAt:'2026-09-01T07:00:00.000Z'},now);
assert.equal(mode.active,true);
assert.equal(mode.reason,'Ask the substitute.');
mode=Ops.datedSubstituteMode({active:true,dateKey:'2026-08-31',expiresAt:'2026-09-01T07:00:00.000Z'},new Date('2026-09-01T08:00:00.000Z'));
assert.equal(mode.active,false,'mode must expire after the Arizona day changes');

const passes=Passes.studentPasses('student-1','2026-08-31',{blackout:{active:true,reason:'Substitute Mode is on today. Ask your substitute teacher if you need a pass.'}});
for(const row of Object.values(passes.rows)){
  assert.equal(row.action,'blocked');
  assert.match(row.message,/Ask your substitute teacher/);
}

const ROOT=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const student=read('v33-integration/js/student-app.js'),teacher=read('v33-integration/js/teacher-app.js'),runtime=read('v33-integration/js/integration/runtime.js'),rules=read('firestore.rules');
for(const blocked of ['kingdom','deep-time-lab','dragon-tongues','arcade','boss','boss-battle'])assert.ok(student.includes(blocked),`${blocked} must remain in the Substitute Mode guard`);
assert.match(student,/Arcade, and Boss Battle are disabled for the day/,'the student block dialog must name Arcade and Boss Battle');
assert.match(teacher,/Arcade, and Boss Battle are unavailable to students/,'the teacher banner must name Arcade and Boss Battle');
assert.match(student,/Ask Your Substitute Teacher/);
assert.match(teacher,/data-substitute-mode/);
assert.match(runtime,/async setSubstituteMode\(active\)/);
assert.match(rules,/function substituteModeAllowsPasses\(\)/);

console.log('V58.1.1 Substitute Mode contracts: PASS');
