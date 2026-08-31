#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Academic=require('../js/integration/academic.js');

const root=path.resolve(__dirname,'../..');
const teacher=fs.readFileSync(path.join(root,'v33-integration/js/teacher-app.js'),'utf8');
const runtime=fs.readFileSync(path.join(root,'v33-integration/js/integration/runtime.js'),'utf8');
const rules=fs.readFileSync(path.join(root,'firestore.rules'),'utf8');
const roster=[{id:'scholar',name:'Scholar',grade:'5',genderGroup:'boys'}];
const daily=[{id:'daily',studentId:'scholar',dateKey:'2026-08-31',day:21,session:'morning',status:'complete',accuracy:100,score:999}];
const curriculum=[{id:'curriculum',studentId:'scholar',itemId:'K-Math-D21-C1-A',dateKey:'2026-08-31',day:21,accuracy:100,questionsSeen:5,autoQuestionsSeen:5,status:'complete'}];
const session=(day,seconds,id=`scholar_${day}_witches`)=>({id,studentId:'scholar',bookId:'witches',dateKey:day,activeSeconds:seconds,firstPage:24,lastPage:31,pages:[24,31]});
const book=(reading,settings)=>Academic.gradebook(roster,daily,curriculum,reading,{daily:40,curriculum:40,reading:20,readingTargetMinutes:20,...settings});

const unassigned=book([session('2026-08-31',1200)],{});
assert.equal(unassigned.rows[0].reading,null,'unassigned Witches must have no numeric score');
assert.equal(unassigned.rows[0].readingStatus,'Recorded');
assert.equal(unassigned.rows[0].total,100,'unassigned Witches must not change the weighted total');
assert.equal(unassigned.rows[0].assignments.at(-1).score,null,'historical unassigned evidence must not expose a grade');

const twoDates=book([session('2026-08-31',1200)],{readingTargetsByDate:{'2026-08-31':20,'2026-09-01':20}});
assert.equal(twoDates.rows[0].reading,50,'one complete and one missing assigned date must average to 50%');
assert.equal(twoDates.rows[0].total,88,'the 20/40/20/20 gradebook must exclude unassigned Rune work and normalize the active categories');
assert.equal(twoDates.rows[0].readingStatus,'Incomplete');
assert.equal(twoDates.rows[0].missing,1);
assert.equal(twoDates.rows[0].provisional,true);
assert.equal(twoDates.rows[0].totalStatus,'Provisional');
assert.equal(twoDates.rows[0].assignments.find(row=>row.id==='witches:2026-09-01').score,0,'missing assigned date must be scored as 0');
assert.notEqual(twoDates.rows[0].totalStatus,'Complete evidence','Incomplete and Complete evidence may never appear together');

const snapshots=book([session('2026-08-31',600),session('2026-09-01',1200)],{readingTargetMinutes:30,readingTargetsByDate:{'2026-08-31':10,'2026-09-01':20}});
assert.equal(snapshots.rows[0].reading,100,'later default-target changes must not recalculate older assignment dates');
assert.equal(snapshots.rows[0].readingStatus,'Complete');
assert.equal(snapshots.rows[0].totalStatus,'Complete evidence');
assert.deepEqual(snapshots.readingTargetsByDate,{'2026-08-31':10,'2026-09-01':20});

const removed=book([session('2026-08-31',600)],{readingTargetsByDate:{}});
assert.equal(removed.rows[0].reading,null,'removing the last assignment must remove Witches from active totals');
assert.equal(removed.rows[0].total,100);
assert.equal(removed.rows[0].readingStatus,'Recorded');
assert.match(removed.rows[0].assignments.at(-1).evidence,/not assigned/,'removing an assignment must retain historical evidence');

const forged=book([session('2026-08-31',1200,'forged-duplicate')],{readingTargetsByDate:{'2026-08-31':20}});
assert.equal(forged.rows[0].reading,0,'non-deterministic reading IDs must never inflate a grade');
assert.equal(forged.rows[0].readingEvidenceIssue,true);
assert.equal(forged.rows[0].totalStatus,'Evidence review required');
assert.equal(forged.reportCardPercentageReady,false,'percentage export must stay locked when assigned evidence fails integrity');

const legacy=Academic.normalizeReadingAssignments({readingTargetMinutes:15,readingAssignedDateKeys:['2026-08-26']});
assert.deepEqual(legacy.targetsByDate,{'2026-08-26':15},'legacy assignment dates must migrate to a stable target snapshot');

assert.match(runtime,/readingTargetsByDate/);
assert.match(runtime,/gradeIntegrityVersion:Academic\.GRADE_INTEGRITY_VERSION/);
assert.doesNotMatch(runtime,/lastHeartbeatMs:Date\.now\(\)/,'student-controlled heartbeat time must not be stored');
assert.match(teacher,/Total Status/);
for(const header of ['Witches Reading','Verified Minutes','Reading Status','Incomplete Assignments'])assert.match(teacher,new RegExp(header));
assert.match(teacher,/gradeIntegrityVersion!==5\|\|gradebook\.reportCardPercentageReady!==true/,'percentage CSV needs the V5 grade-integrity guard');
for(const contract of ['sessionId == request.auth.uid','keys().hasOnly','duration.value(10, \'s\')','request.resource.data.updatedAt == request.time','hasReadingAssignment'])assert.match(rules,new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));

console.log('V5 grade/evidence hardening contracts: PASS (date targets + zeroed missing days + safe statuses/totals/export)');
