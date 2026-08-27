'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const REPO_ROOT=path.resolve(__dirname,'../..');

const values=new Map();
const context={
  console,Date,Math,JSON,
  localStorage:{getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,String(value))}
};
context.globalThis=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(REPO_ROOT,'arcade/js/manual-preview-store.js'),'utf8'),context,{filename:'manual-preview-store.js'});
const store=context.DWArcadeManualStore;

store.reset();
const firstAccess=store.getAccess(),secondAccess=store.getAccess();
assert.deepEqual(
  {...firstAccess,serverNowMillis:0},
  {...secondAccess,serverNowMillis:0},
  'repeated preview access reads must preserve stable state'
);
assert.ok(
  secondAccess.serverNowMillis>=firstAccess.serverNowMillis,
  'preview server clock must not move backward'
);
assert.equal(store.getAccess().tokens,3,'preview student starts ready for immediate acceptance testing');
assert.equal(store.getAccess().teacherEnabled,true);

const second='second-preview-student';
assert.equal(store.getTeacherState(second,'p1').tokens,0);
store.award(second,'ready','p1');
store.award(second,'ready','p1');
assert.equal(store.getTeacherState(second,'p1').tokens,1,'same criterion cannot be awarded twice in a period');
store.award(second,'responsible','p1');store.award(second,'complete','p1');
store.award(second,'ready','p2');
assert.equal(store.getTeacherState(second,'p2').tokens,3,'wallet remains capped at three');

store.setAvailability(false,second);
assert.equal(store.getTeacherState(second,'p1').teacherEnabled,false,'individual lock closes Arcade');
store.setAvailability(true,second);
assert.equal(store.getTeacherState(second,'p1').teacherEnabled,true);
store.setAvailability(false);
assert.equal(store.getAccess().teacherEnabled,false,'class lock closes Arcade immediately');
store.setAvailability(true);

const session=store.startSession();
assert.equal(session.active,true);assert.equal(session.tokens,0);assert.ok(session.sessionId);
assert.ok(store.remainingMs(session)>29*60*1000,'preview session is exactly thirty minutes at start');
store.setAvailability(false);
assert.equal(store.getAccess().active,false,'teacher lock stops active session');
store.refund(store.STUDENT_UID,session.sessionId,'Preview technical check');
assert.equal(store.getAccess().tokens,3,'technical refund obeys wallet cap');
assert.throws(()=>store.refund(store.STUDENT_UID,session.sessionId,'Again'),/already refunded/);
assert.ok(store.snapshot().audit.length>=10,'preview audit trail records state transitions');
console.log('V3.3 manual preview store tests: PASS');
