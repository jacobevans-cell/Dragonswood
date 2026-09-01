'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const Academic=require('../js/integration/academic.js');

const today='2026-08-31';
const roster=[
  {id:'a',name:'Abigail',grade:'4',spellingGrade:4,genderGroup:'girl'},
  {id:'b',name:'Brandon',grade:'5',spellingGrade:5,genderGroup:'boy'}
];
const daily=[
  {id:'a_old',studentId:'a',dateKey:'2026-08-30',day:20,session:'morning',status:'complete',progressPercent:100},
  {id:'a_today',studentId:'a',dateKey:today,day:21,session:'morning',status:'in_progress',totalQuestions:10,completedQuestions:3,progressPercent:30,updatedAt:'2026-08-31T15:00:00Z'},
  {id:'b_today',studentId:'b',dateKey:today,day:21,session:'morning',status:'complete',progressPercent:100,updatedAt:'2026-08-31T15:01:00Z'}
];
const catalog=[
  {id:'I-HUM-D21-C1-A',grade:'I',day:21,subject:'HUM',strand:'Reading',requirement:'Current lesson'},
  {id:'I-HUM-D21-C2-L1',grade:'I',day:21,subject:'HUM',strand:'Writing',requirement:'Current video lesson',resourceName:'Lesson video',resourceUrl:'https://docs.google.com/videos/d/video-ready/edit'},
  {id:'I-Science-D21-C2-A',grade:'I',day:21,subject:'Science',strand:'Vocabulary',requirement:'vocabulary'},
  {id:'K-Math-D21-C1-A',grade:'K',day:21,subject:'Math',strand:'Core Math',requirement:'Current lesson'}
];
const curriculumProgress=[
  {id:'a_one',studentId:'a',itemId:'I-HUM-D21-C1-A',day:21,practiced:true,complete:true,updatedAt:'2026-08-31T15:02:00Z'},
  {id:'a_video',studentId:'a',itemId:'I-HUM-D21-C2-L1',day:21,practiced:true,watched:false,complete:false,updatedAt:'2026-08-31T15:03:00Z'},
  {id:'b_one',studentId:'b',itemId:'K-Math-D21-C1-A',day:21,practiced:true,complete:true,updatedAt:'2026-08-31T15:04:00Z'}
];
const options={dateKey:today,assignment:{id:today,date:today,day:21},curriculumCatalog:catalog,videoMap:{'video-ready':{status:'ready'}}};

const live=Academic.todayProgress(roster,daily,curriculumProgress,options);
const a=live.rows.find(row=>row.studentId==='a'),b=live.rows.find(row=>row.studentId==='b');
assert.deepEqual(a.morning,{completed:0,total:1,percent:30,started:true,status:'in-progress'});
assert.deepEqual(a.curriculum,{completed:1,total:2,percent:50,started:2,status:'in-progress'});
assert.equal(a.remaining,2,'Abigail has Morning plus one Curriculum mission left today');
assert.equal(a.percent,33,'overall today percent uses completed required items');
assert.deepEqual(b.morning,{completed:1,total:1,percent:100,started:true,status:'complete'});
assert.deepEqual(b.curriculum,{completed:1,total:1,percent:100,started:1,status:'complete'});
assert.equal(b.status,'complete');
assert.deepEqual({required:live.totalRequired,completed:live.totalCompleted,remaining:live.remaining,studentsComplete:live.studentsComplete},{required:5,completed:3,remaining:2,studentsComplete:1});

const finished=Academic.todayProgress(roster,daily.map(row=>row.id==='a_today'?{...row,status:'complete',progressPercent:100}:row),curriculumProgress.map(row=>row.id==='a_video'?{...row,watched:true,complete:true}:row),options);
assert.equal(finished.rows.find(row=>row.studentId==='a').status,'complete');
assert.equal(finished.remaining,0);

const noSchool=Academic.todayProgress(roster,daily,curriculumProgress,{...options,assignment:{}});
assert.equal(noSchool.assigned,false);
assert.equal(noSchool.totalRequired,0);
assert(noSchool.rows.every(row=>row.status==='not-assigned'));

const heldVideo=Academic.todayProgress([roster[0]],daily,curriculumProgress,{...options,videoMap:{'video-ready':{status:'pending'}}});
assert.equal(heldVideo.rows[0].curriculum.total,1,'source-pending curriculum is held out just like the student Current Quest');

const legacyCatalog=[
  {id:'I-HUM-D21-C1-L1',grade:'I',day:21,subject:'HUM',strand:'Reading',requirement:'Legacy video lesson',resourceName:'Lesson video',resourceUrl:'https://docs.google.com/videos/d/legacy-ready/edit'},
  {id:'I-HUM-D21-C3-A',grade:'I',day:21,subject:'HUM',strand:'Writing',requirement:'Publish quickwrite',quickWriteSentenceRange:[3,5]},
];
const legacyComplete=Academic.todayProgress([roster[0]],[],[
  {studentId:'a',itemId:'I-HUM-D21-C1-L1',day:21,practiced:true,watched:true,questionsSeen:6,questionsCorrect:6},
  {studentId:'a',itemId:'I-HUM-D21-C3-A',day:21,practiced:true,watched:false,questionsSeen:0,questionsCorrect:0},
],{...options,curriculumCatalog:legacyCatalog,videoMap:{'legacy-ready':{status:'ready'}}});
assert.equal(legacyComplete.rows[0].curriculum.completed,2,'legacy rows without complete are derived from the same quiz, writing, and video gates');
const legacyWrongButSubmitted=Academic.todayProgress([roster[0]],[],[
  {studentId:'a',itemId:'I-HUM-D21-C1-L1',day:21,practiced:true,watched:true,complete:false,questionsTotal:6,questionsSeen:6,questionsCorrect:2},
],{...options,curriculumCatalog:legacyCatalog,videoMap:{'legacy-ready':{status:'ready'}}});
assert.equal(legacyWrongButSubmitted.rows[0].curriculum.completed,1,'all submitted answers complete the mission even when the preserved score is 2/6');
const legacyIncomplete=Academic.todayProgress([roster[0]],[],[
  {studentId:'a',itemId:'I-HUM-D21-C1-L1',day:21,practiced:true,watched:true,questionsSeen:5,questionsCorrect:5},
],{...options,curriculumCatalog:legacyCatalog,videoMap:{'legacy-ready':{status:'ready'}}});
assert.equal(legacyIncomplete.rows[0].curriculum.completed,0,'partial legacy quiz evidence never counts as complete');

const book=Academic.gradebook(roster,daily,[],[],[],{}, {...options,curriculumProgress});
assert.equal(book.today.dateKey,today);
assert.equal(book.rows[0].today.morning.percent,30);
assert.equal(book.rows[0].today.curriculum.total,2);

const teacher=read('v33-integration/js/teacher-app.js');
const runtime=read('v33-integration/js/integration/runtime.js');
const dailyQuest=read('daily-quest.html');
const host=read('teacher.html');
assert.match(teacher,/Today’s live progress/);
assert.match(teacher,/Morning \$\{Number\(morning\.completed\)/);
assert.match(teacher,/Curriculum \$\{Number\(curriculum\.completed\)/);
assert.match(teacher,/refreshes automatically/);
assert.match(runtime,/collection\(db,'curriculumProgress'\)/);
assert.match(runtime,/doc\(db,'dailyQuests',Core\.phoenixDateKey\(\)\)/);
assert.match(runtime,/where\('day','==',assignedDay\)/);
assert.match(dailyQuest,/totalQuestions:live\.totalQuestions/);
assert.match(dailyQuest,/completedQuestions:live\.completedQuestions/);
assert.match(read('curriculum-quest.html'),/complete:missionComplete\(item,state\)/);
assert.match(read('curriculum-quest.html'),/questionsTotal:counts\.total/);
assert(host.indexOf('../q1-curriculum-day21-overrides.js')<host.indexOf('js/integration/academic.js'),'Day 21 quickwrite and custom-question metadata loads before the academic model');
assert(host.indexOf('../q1-curriculum-data.js')<host.indexOf('js/integration/academic.js'),'the authoritative curriculum catalog loads before the academic model');
assert(host.indexOf('../q1-video-map.js')<host.indexOf('js/integration/academic.js'),'video availability loads before the academic model');

console.log('Teacher today live progress: PASS (Phoenix date + exact assignments + realtime completion counts)');
