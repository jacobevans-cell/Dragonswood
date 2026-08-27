'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const student=fs.readFileSync(path.join(root,'js/student-app.js'),'utf8');
const runtime=fs.readFileSync(path.join(root,'js/integration/runtime.js'),'utf8');

assert.match(student,/data-active-pass-overlay/,'student shell must render the blocking active-pass overlay');
assert.match(student,/data-return-active-pass/,'active-pass overlay must provide a live return action');
assert.match(student,/setInterval\(syncPassSafety,1000\)/,'pass timer must refresh every second');
assert.match(student,/location\.hash='adventure'/,'blocking passes must return navigation to the student home route');
assert.match(student,/speechSynthesis/,'overdue passes must provide an audible spoken reminder');
assert.match(student,/passChanged\|\|!currentModuleId\(\)/,'a pass-state change must interrupt an embedded module and render the safety layer');
assert.match(student,/z-index:99990/,'pass safety overlay must remain above the student portal and dialogs');

assert.match(runtime,/\['bathroomSlots','bathroomSlots'\]/,'teacher runtime must subscribe to shared bathroom slots');
assert.match(runtime,/slotRefs=collection==='bathroomStatus'/,'teacher bathroom return must include the shared slots in its transaction');
assert.match(runtime,/reconcileBathroomSlot/,'teacher runtime must reconcile stale shared bathroom slots');
assert.match(runtime,/activeVisitId:''/,'slot release must clear the active visit identifier');

console.log('V3.3 pass safety recovery contracts: PASS');
