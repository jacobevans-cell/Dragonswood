#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const teacher=read('js/teacher-app.js');
const student=read('js/student-app.js');
const runtime=read('js/integration/runtime.js');
const academic=require(path.join(root,'js/integration/academic.js'));
const rules=fs.readFileSync(path.resolve(root,'../firestore.rules'),'utf8');
const reader=fs.readFileSync(path.resolve(root,'../witches-reader.html'),'utf8');
function check(ok,message){if(!ok)throw new Error(message)}

check(!teacher.includes('Alerts permanently on'),'redundant permanent-alert label remains');
check(/teacher-attention-scroll\{[^}]*overflow:visible/.test(teacher),'Teacher Attention still owns an outer scrollbar');
check(/attention-student-list\{[^}]*overflow:auto/.test(teacher),'student selector lost its local scroll');
check(teacher.includes('[data-send-attention]{position:sticky'),'chime action is not kept visible');
check(teacher.includes('summaryActions=[recognitionReview,manageDailyAccess,reviewCurriculumOverrides]'),'summary cards are not fully clickable');
check(teacher.includes('showPointLedger')&&teacher.includes('showGoalEvidence')&&teacher.includes('showJobMetric'),'evidence drilldowns missing');
check(runtime.includes("['readingSessions','readingSessions']")&&runtime.includes("['studentTransactions','studentTransactions']"),'teacher evidence listeners missing');
check(runtime.includes('recordReadingActivity')&&runtime.includes('activeSeconds')&&runtime.includes('targetMinutes'),'verified reader persistence missing');
check(runtime.includes('saveReadingAssignment'),'teacher reading assignment control missing');
check(student.includes('dw-witches-reading-heartbeat')&&student.includes('recordReadingActivity'),'reader-to-student bridge missing');
check(reader.includes("type:'dw-witches-reading-heartbeat'")&&reader.includes("document.visibilityState==='visible'")&&reader.includes('document.hasFocus()'),'focused active-time heartbeat missing');
check(rules.includes('match /readingSessions/{sessionId}')&&rules.includes('request.resource.data.activeSeconds <= resource.data.activeSeconds + 20'),'reading security increment cap missing');

const roster=[{id:'a',name:'A',grade:'4',genderGroup:'girl'},{id:'b',name:'B',grade:'5',genderGroup:'boy'}];
const settings={daily:40,curriculum:40,reading:20,readingTargetMinutes:20,readingAssignedDateKeys:['2026-08-28']};
const daily=[{id:'d1',studentId:'a',status:'complete',score:80},{id:'d2',studentId:'b',status:'complete',score:100}];
const curriculum=[{id:'c1',studentId:'a',questionsSeen:10,questionsCorrect:9,accuracy:90},{id:'c2',studentId:'b',questionsSeen:10,questionsCorrect:10,accuracy:100}];
const games=[{id:'ela-perfect',studentId:'a',gameId:'witches-test',subject:'ELA',status:'complete',score:100}];
const reading=[{id:'a_2026-08-28_witches',studentId:'a',bookId:'witches',dateKey:'2026-08-28',activeSeconds:1080,targetMinutes:1,firstPage:24,lastPage:31,pages:[24,31]}];
const gradebook=academic.teacherAcademic(roster,{},[],daily,curriculum,games,reading,settings).gradebook;
const a=gradebook.rows.find(row=>row.id==='a'),b=gradebook.rows.find(row=>row.id==='b');
check(a.reading===90,'teacher-assigned 20-minute target must override any student-stored target');
check(a.total===86,'weighted total must use 80/90/90 without ELA game rescue');
check(a.assignments.some(row=>String(row.evidence||'').includes('18/20 verified min')),'reading evidence is not teacher-readable');
check(b.reading===0&&b.provisional===true&&b.missing>=1,'missing assigned reading must stay incomplete/provisional');
check(!a.assignments.some(row=>row.id==='ela-perfect'),'ELA game leaked into Witches reading grade');
console.log('V3.3 teacher live evidence contracts: PASS (attention + multi-select + passes + points + goals + jobs + verified Witches grade)');
