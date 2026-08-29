'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const REPO_ROOT=path.resolve(__dirname,'../..');

const values=new Map();
const context={console,Date,Math,JSON,URL,Promise,queueMicrotask,location:{href:'http://preview.test/v33-integration/student-manual-preview.html'},localStorage:{getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,String(value))}};
context.globalThis=context;context.window=context;
vm.createContext(context);
for(const file of ['arcade/js/manual-preview-store.js','v33-integration/tools/manual-preview-runtime.js'])vm.runInContext(fs.readFileSync(path.join(REPO_ROOT,file),'utf8'),context,{filename:file});

(async()=>{
  assert.equal(context.DWV33Integration.environment,'manual-preview');
  let studentSession=null,teacherSession=null;
  await context.DWV33Integration.startStudent(value=>{studentSession=value});
  await context.DWV33Integration.startTeacher(value=>{teacherSession=value});
  await new Promise(resolve=>queueMicrotask(resolve));
  assert.equal(studentSession.status,'authorized');
  assert.equal(studentSession.student.dailyAccessUnlocked,true);
  assert.equal(studentSession.kingdomAccess.unlocked,true);
  assert.equal(teacherSession.status,'authorized');
  assert.ok(teacherSession.students.some(row=>row.id===context.DWArcadeManualStore.STUDENT_UID&&row.name==='Jacob Preview'));
  assert.equal((await context.DWV33ArcadePortal.getAccess()).tokens,3);
  assert.match(context.DWV33ArcadePortal.href(),/arcade\/manual-preview\.html$/);
  assert.match(context.DWV33KingdomPortal.href(),/kingdom-test\.html\?dwEmbed=1&dw-env=emulator$/);
  assert.equal(context.DWV33ArcadeTeacher.enabled,true);
  await context.DWV33ArcadeTeacher.setAvailability(false);
  assert.equal((await context.DWV33ArcadePortal.getAccess()).teacherEnabled,false);
  console.log('V3.3 manual preview runtime tests: PASS');
})().catch(error=>{console.error(error);process.exit(1)});
