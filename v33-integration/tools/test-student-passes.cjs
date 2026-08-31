'use strict';
const assert=require('node:assert/strict');
const Passes=require('../js/integration/passes.js');
const uid='student-1',dateKey='2026-08-27';

let model=Passes.studentPasses(uid,dateKey,{profile:{genderGroup:'girls'}});
assert.equal(model.group,'girl');
assert.equal(model.rows.bathroom.action,'start');
assert.equal(model.rows.bathroom.used,0);
assert.equal(model.rows.snack.action,'start');
assert.equal(model.rows.outOfSeat.action,'start');

model=Passes.studentPasses(uid,dateKey,{profile:{genderGroup:'girls'},statuses:{bathroom:{dateKey,passesUsed:3,approvalCredits:0,active:false}}});
assert.equal(model.rows.bathroom.action,'request');

model=Passes.studentPasses(uid,dateKey,{profile:{genderGroup:'girls'},statuses:{bathroom:{dateKey,passesUsed:3,approvalCredits:1,active:false}}});
assert.equal(model.rows.bathroom.action,'start');

const startedMs=Date.parse('2026-08-27T15:00:00.000Z');
model=Passes.studentPasses(uid,dateKey,{profile:{genderGroup:'girls'},statuses:{bathroom:{dateKey,passesUsed:1,approvalCredits:0,active:true,activeVisitId:'visit-1',visits:[{id:'visit-1',startedMs}]}}});
assert.equal(model.rows.bathroom.action,'return');
assert.equal(model.rows.bathroom.blocking,true);
assert.equal(model.rows.bathroom.startedMs,startedMs);
assert.equal(model.rows.office.blocking,true);
assert.equal(model.rows.snack.blocking,false);
assert.equal(model.rows.outOfSeat.blocking,false);

let timing=Passes.passTiming(startedMs,startedMs+4*60*1000);
assert.equal(timing.overdue,false);
assert.equal(timing.remainingMs,60*1000);
assert.equal(timing.alertBucket,-1);
timing=Passes.passTiming(startedMs,startedMs+5*60*1000);
assert.equal(timing.overdue,true);
assert.equal(timing.overdueMs,0);
assert.equal(timing.alertBucket,0);
timing=Passes.passTiming(startedMs,startedMs+7*60*1000);
assert.equal(timing.alertBucket,1);

model=Passes.studentPasses(uid,dateKey,{profile:{genderGroup:'girls'},requests:{office:{dateKey,status:'pending'}}});
assert.equal(model.pendingType,'office');
assert.equal(model.rows.bathroom.action,'pending');
assert.equal(model.rows.office.action,'pending');

model=Passes.studentPasses(uid,dateKey,{profile:{genderGroup:'girls'},slots:{girl:{dateKey,occupied:true,studentId:'student-2',studentName:'Another Scholar'}}});
assert.equal(model.rows.bathroom.action,'blocked');
assert.match(model.rows.bathroom.message,/Another Scholar/);

model=Passes.studentPasses(uid,dateKey,{blackout:{active:true,reason:'Ask your substitute teacher for a pass.'}});
assert.equal(model.rows.snack.action,'blocked');
assert.equal(model.blackoutReason,'Ask your substitute teacher for a pass.');
assert.equal(model.rows.bathroom.message,'Ask your substitute teacher for a pass.');

assert.equal(Passes.requestId('office',uid,dateKey),`${uid}_office_${dateKey}`);
assert.equal(Passes.statusId('office',uid),`${uid}_office`);
console.log('V3.3 student pass contracts: PASS');
