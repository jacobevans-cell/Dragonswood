'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const Core=require('../js/integration/core.js');
const ROOT=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');

const window={DWV33Core:Core};
vm.runInNewContext(read('v33-integration/js/integration/world.js'),{window,Intl,Date,Object,Array,Map,Set,String,Number,Math});
vm.runInNewContext(read('v33-integration/js/integration/operations.js'),{window,Intl,Date,Object,Array,Map,Set,String,Number,Math});
const Ops=window.DWV33Operations,now=new Date('2026-08-27T18:00:00Z');
const kingdom=Ops.datedFeatureAccess({dateKey:'2026-08-27',all:false,studentIds:['u2']},now);
assert.equal(kingdom.active,true);assert.equal(kingdom.all,false);assert.deepEqual([...kingdom.studentIds],['u2']);
const attention=Ops.attentionModel({id:'a1',active:true,dateKey:'2026-08-27',title:'Return now',message:'Open Morning Work',destination:'module/daily-quest'},[
  {attentionId:'a1',type:'sent',studentId:'',dateKey:'2026-08-27',createdAt:{seconds:1}},
  {attentionId:'a1',type:'acknowledged',studentId:'u1',studentName:'One',dateKey:'2026-08-27',createdAt:{seconds:2}}
],[{id:'u1',name:'One'},{id:'u2',name:'Two'}],now);
assert.equal(attention.active,true);assert.equal(attention.acknowledged,1);assert.equal(attention.waiting.length,1);assert.equal(attention.waiting[0].id,'u2');

const student=read('v33-integration/js/student-app.js');
for(const route of ['games','hall','boss','leaderboards','kingdom','arcade'])assert.match(student,new RegExp(`REQUIRED_WORK_PAGES[^\\n]+['\"]${route}['\"]`),`${route} must be rechecked on every entry`);
assert.match(student,/function unfinishedRequiredWork/);assert.match(student,/Recovery Day \$\{day[.]day\}/);assert.match(student,/ensureRecoveryProbe/);assert.match(student,/data-required-route/);
assert.match(student,/if\(state[.]dailyAccessOverride!==true\)\{/,'teacher Daily Access override must bypass Morning and Recovery locks');
assert.match(student,/teacher-direction-overlay/);assert.match(student,/acknowledgeAttention/);assert.match(student,/TEACHER UNLOCK REQUIRED/);

const curriculumProbe=read('curriculum-quest.html');
assert.match(curriculumProbe,/curriculumStateReady=false/,'recovery reporting must wait for authenticated curriculum state');
assert.match(curriculumProbe,/new URLSearchParams\(location[.]search\)[.]get\("dwEmbed"\)/,'embedded recovery reporting must read its own page URL');
assert.match(curriculumProbe,/isTeacher\|\|!curriculumStateReady/,'teacher and pre-ready recovery reports must be suppressed');

const teacher=read('v33-integration/js/teacher-app.js');
assert.doesNotMatch(teacher,/Alerts permanently on/);assert.match(teacher,/Live lesson progress/);assert.match(teacher,/Full-screen student direction/);assert.match(teacher,/Event log/);assert.match(teacher,/Collapse panel/);
assert.match(teacher,/state[.]pendingCommand\?`<div class="review-dock"/,'Selected Command dock must render only while a command is active');
assert.match(teacher,/data-manage-kingdom-access/);assert.match(teacher,/sendAttention/);assert.match(teacher,/playAttentionTone\(true\)/);

const runtime=read('v33-integration/js/integration/runtime.js');
for(const method of ['setKingdomAccess','sendAttention','closeAttention','acknowledgeAttention'])assert.match(runtime,new RegExp(`async ${method}\\(`),`${method} must be connected to Firebase`);
assert.match(runtime,/teacherAttentionEvents/);assert.match(runtime,/activeTeacherAttention/);assert.match(runtime,/classData','kingdomAccess/);

const curriculum=read('curriculum-quest.html');
assert.doesNotMatch(curriculum,/Original Day/);assert.match(curriculum,/Recovery Day/);assert.match(curriculum,/recoveryDays/);

const daily=read('daily-quest.html');
for(const coach of ['ADDITION COACH','SUBTRACTION COACH','DIVISION COACH','MULTIPLICATION COACH'])assert.match(daily,new RegExp(coach),`${coach} must be available without showing an answer`);
assert.match(daily,/The answer stays yours/);

const hall=read('adventurer-hall.html');
assert.match(hall,/No Woodland Egg is ready to hatch yet/);assert.match(hall,/runTransaction\(db,async tx/);assert.match(hall,/already\?1:0/);assert.match(hall,/petTokens/);
const rules=read('firestore.rules');
assert.match(rules,/match \/teacherAttentionEvents\/\{eventId\}/);assert.match(rules,/eventId == request[.]resource[.]data[.]attentionId \+ '_' \+ request[.]auth[.]uid/);
assert.match(rules,/repeated companion preserves the bestiary and grants one Pet Token/);assert.match(rules,/petTokens[^;]+\+ 1/s);

const kingdomAccess=read('kingdom-wars/kingdom-wars-test-access.mjs');
assert.match(kingdomAccess,/kingdomTeacherAccess/);assert.match(kingdomAccess,/reason:'teacher-lock'/);assert.doesNotMatch(kingdomAccess,/adminDecision=authorizeKingdomTester\(\{email\}\)/,'Explore accounts must not bypass the teacher unlock');

console.log('V3.3 Repair Wave 03 contracts: PASS (Kingdom lock + attention + recovery gate + math coach + hatch transaction)');
