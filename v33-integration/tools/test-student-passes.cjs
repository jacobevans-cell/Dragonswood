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

model=Passes.studentPasses(uid,dateKey,{profile:{genderGroup:'girls'},statuses:{bathroom:{dateKey,passesUsed:1,approvalCredits:0,active:true}}});
assert.equal(model.rows.bathroom.action,'return');

model=Passes.studentPasses(uid,dateKey,{profile:{genderGroup:'girls'},requests:{office:{dateKey,status:'pending'}}});
assert.equal(model.pendingType,'office');
assert.equal(model.rows.bathroom.action,'pending');
assert.equal(model.rows.office.action,'pending');

model=Passes.studentPasses(uid,dateKey,{profile:{genderGroup:'girls'},slots:{girl:{dateKey,occupied:true,studentId:'student-2',studentName:'Another Scholar'}}});
assert.equal(model.rows.bathroom.action,'blocked');
assert.match(model.rows.bathroom.message,/Another Scholar/);

model=Passes.studentPasses(uid,dateKey,{blackout:{active:true}});
assert.equal(model.rows.snack.action,'blocked');

assert.equal(Passes.requestId('office',uid,dateKey),`${uid}_office_${dateKey}`);
assert.equal(Passes.statusId('office',uid),`${uid}_office`);
console.log('V3.3 student pass contracts: PASS');
