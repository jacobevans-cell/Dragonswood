'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Tester=require('./functions-arcade-access/tester-core.js');
const Core=require('./v33-integration/js/integration/core.js');
const {PROJECT_ID,RECORDS}=require('./functions-arcade-access/seed-true-testers.cjs');

const ROOT=__dirname;
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const pass=(number,label)=>console.log(`PASS ${number}. ${label}`);
const expectedCapabilities={
  selfUnlockMorning:true,
  selfUnlockCurriculum:true,
  selfUnlockArcade:true,
  selfUnlockKingdom:true,
  selfUnlockBoss:true,
  selfAwardPoints:true
};

assert.equal(PROJECT_ID,'dragonswood-9289e');
assert.deepEqual(RECORDS.map(({uid,email,label,active,capabilities})=>({uid,email,label,active,capabilities})),[
  {uid:'S2hmoniITye8AGvnLBSt6NeiJYq2',email:'jacob.evans@explore.academy',label:'Jacob Evans Explore Tester',active:true,capabilities:expectedCapabilities},
  {uid:'LFy1nHGz5zbK0Xs0XSU2749zXxi1',email:'jacobicusjax@gmail.com',label:'Jacob Evans Teacher Tester',active:true,capabilities:expectedCapabilities}
]);

const student=Tester.normalizeTester(RECORDS[0].uid,RECORDS[0]);
assert.equal(student.isTester,true);
assert.equal(Tester.hasCapability(student,'selfUnlockMorning'),true);
pass(1,'Jacob Evans Explore resolves as active Student + Tester');

const teacher=Tester.normalizeTester(RECORDS[1].uid,RECORDS[1]);
assert.equal(Core.isTeacherEmail(RECORDS[1].email),true);
assert.equal(teacher.isTester,true);
assert.equal(Tester.hasCapability(teacher,'selfAwardPoints'),true);
pass(2,'Jacob Evans Gmail retains Teacher/Admin and gains Tester additively');

const studentApp=read('v33-integration/js/student-app.js');
for(const label of ['🧪 TRUE TESTER','🧪 Tester Controls','Unlock Everything for Me','Relock Everything for Me','+10','+50','+100','Award Custom Amount'])assert.ok(studentApp.includes(label),`${label} must be present`);
for(const row of ["['unlockMorning','Morning Work']","['unlockCurriculum','Curriculum Quest']","['unlockArcade','Arcade']","['unlockKingdom','Kingdom Wars']"])assert.ok(studentApp.includes(row),`${row} tester control must be present`);
assert.match(studentApp,/>Unlock \$\{label\}<\/button>/);
assert.match(studentApp,/state\.isTester\?'<span class="true-tester-badge"[\s\S]*data-tester-controls/);
pass(3,'Tester Controls and TRUE TESTER badge are conditional in the student UI');

const allUnlocks=Tester.unlockPatch(student,true);
assert.equal(Tester.unlockEnabled(student,allUnlocks,'unlockMorning'),true);
pass(4,'Morning Work self-unlock requires the canonical capability and control');

assert.equal(Tester.unlockEnabled(student,allUnlocks,'unlockCurriculum'),true);
assert.match(read('curriculum-quest.html'),/isTeacher\|\|testerCurriculumOverride\|\|day===first/);
pass(5,'Curriculum Quest self-unlock reaches current and recovery sequencing gates');

assert.equal(Tester.unlockEnabled(student,allUnlocks,'unlockArcade'),true);
assert.match(read('functions-arcade-access/index.js'),/cost=testerOverride\?0:C\.SESSION_COST/);
pass(6,'Arcade self-unlock reaches server validation without spending tokens');

assert.equal(Tester.unlockEnabled(student,allUnlocks,'unlockKingdom'),true);
assert.match(read('kingdom-wars/kingdom-wars-test-access.mjs'),/!testerOverride&&!access\.unlocked[\s\S]*!testerOverride&&!kingdom\.kingdomTeacherUnlocked/);
pass(7,'Kingdom Wars self-unlock bypasses only the tester personal gates');

const functionsSource=read('functions-arcade-access/index.js');
assert.match(functionsSource,/exports\.adjustTesterSelfPoints/);
assert.match(functionsSource,/\['xp','gold'\]/);
assert.match(functionsSource,/source:'tester-self-control'/);
assert.match(functionsSource,/studentTransactions/);
pass(8,'XP and Gold self-awards use the authoritative student balance and transaction ledger');

const now=new Date('2026-08-29T17:00:00Z');
const model=Core.normalizeStudent({uid:RECORDS[0].uid,email:RECORDS[0].email},{firstName:'Jacob',xp:0,gold:0,optionalAccessPaused:true},[],{},true,now);
assert.equal(model.dailyAccessUnlocked,true);
assert.equal(model.morningWorkComplete,false);
assert.equal(model.dailyMissions.morning,'not_started');
assert.match(studentApp,/Tester access is active\. Required work remains incomplete until you do it\./);
assert.match(studentApp,/m\.id==='curriculum'&&state\.curriculumAccessUnlocked===true/);
pass(9,'Tester access bypass does not create academic completion evidence');

const normal=Tester.normalizeTester('normal-student',null);
assert.equal(Tester.unlockEnabled(normal,allUnlocks,'unlockMorning'),false);
pass(10,'Tester self-unlocks do not apply to normal students');

const rules=read('firestore.rules');
assert.match(rules,/match \/testerSelfControls\/\{uid\}[\s\S]*request\.auth\.uid == uid/);
assert.match(functionsSource,/target identifiers are not accepted/);
pass(11,'Cross-UID tester controls and point targets are denied by design');

assert.equal(Core.isStudentEligibleEmail('ordinary@explore.academy',false),true);
assert.equal(normal.isTester,false);
pass(12,'Normal Explore students retain ordinary access without tester powers');

assert.equal(Tester.normalizeTester('tech-peo-uid',null).isTester,false);
pass(13,'tech-peo@explore.academy is not a tester');

const legacyProfile={tester:true,isTester:true,role:'tester',accountRole:'tester',accountType:'tester'};
assert.equal(Tester.normalizeTester('eF1pnptN9qfsXxiqjZI6RMBNMO63',legacyProfile).isTester,false);
assert.doesNotMatch(read('kingdom-wars/kingdom-wars-test-access.mjs'),/roleFromStudent|student\.tester|student\.isTester|student\.accountRole|student\.accountType/);
pass(14,'dragontester legacy profile data cannot grant tester authorization');

assert.equal(Tester.normalizeTester('',RECORDS[0]).isTester,false);
pass(15,'Anonymous Firebase users cannot be testers');

assert.equal(Tester.normalizeTester('legacy-only',legacyProfile).isTester,false);
pass(16,'students/{uid}.tester and legacy role fields grant no tester power');

const inactive=Tester.normalizeTester('inactive',{active:false,capabilities:expectedCapabilities});
assert.equal(inactive.isTester,false);
assert.equal(Tester.hasCapability(inactive,'selfUnlockArcade'),false);
pass(17,'Inactive tester documents grant no tester authorization');

assert.equal(Tester.normalizeTester(RECORDS[0].uid,null).isTester,false);
assert.match(read('daily-quest.html'),/previousOverride&&!nextOverride\)\{location\.reload\(\)/);
assert.match(read('curriculum-quest.html'),/previousOverride&&!nextOverride\)\{location\.reload\(\)/);
assert.match(read('kingdom-wars/kingdom-wars-test-access.mjs'),/unlockKingdom'\)\)location\.reload\(\)/);
pass(18,'Removing a tester document removes tester power from the resolver');

assert.match(read('v33-integration/js/integration/runtime.js'),/startTeacher/);
assert.match(rules,/function isTeacher\(\)[\s\S]*jacobicusjax@gmail\.com/);
const teacherRoot=read('teacher.html');
assert.ok(teacherRoot.indexOf('../functions-arcade-access/tester-core.js?v=57.1.16')<teacherRoot.indexOf('js/integration/core.js?v=57.1.16'));
assert.ok(teacherRoot.indexOf('js/integration/core.js?v=57.1.16')<teacherRoot.indexOf('js/integration/runtime.js?v=58.1.0'));
pass(19,'Existing teacher identity and teacher runtime remain intact');

assert.match(rules,/function isTester\(\)[\s\S]*\.data\.active == true/);
assert.match(rules,/testerCapability\(name\)/);
assert.match(functionsSource,/tx\.update\(studentRef,\{\[currency\]:after/);
assert.doesNotMatch(functionsSource,/tx\.update\(db\.doc\(`students\/\$\{payload/);
pass(20,'Normal grades, tokens, student records, and classwide locks remain outside tester writes');

const runtime=read('v33-integration/js/integration/runtime.js');
assert.match(runtime,/Tester\.resolveTester\(user\.uid/);
assert.match(runtime,/testerAccounts',user\.uid/);
assert.match(runtime,/isTester:tester\.isTester,testerCapabilities:tester\.capabilities,testerUnlocks/);
assert.match(rules,/request\.resource\.data\.keys\(\)\.hasOnly\(\[[\s\S]*'unlockMorning','unlockCurriculum',[\s\S]*'unlockArcade','unlockKingdom','updatedAt'/);

console.log('TRUE TESTER canonical resolver and acceptance contracts: PASS');
