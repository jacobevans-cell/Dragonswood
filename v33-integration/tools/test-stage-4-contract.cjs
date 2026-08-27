'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'../..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const modules=read('v33-integration/js/integration/modules.js');
const student=read('v33-integration/js/student-app.js');
const daily=read('daily-quest.html');
const curriculum=read('curriculum-quest.html');

for(const [name,source] of [['Daily Quest',daily],['Curriculum Quest',curriculum]]){
  assert.match(source,/DW_V33_ENV=DW_V33_PARAMS\.get\("dw-env"\)\|\|"production"/,`${name} has an explicit environment selector`);
  assert.match(source,/DW_V33_EMULATOR=DW_V33_ENV==="emulator"/,`${name} gates the fictional project to emulator mode`);
  assert.match(source,/projectId:"demo-dragonswood-v33"/,`${name} uses the fictional emulator project`);
  assert.match(source,/connectAuthEmulator\(auth,"http:\/\/127\.0\.0\.1:9099"/,`${name} connects Auth emulator`);
  assert.match(source,/connectFirestoreEmulator\(db,"127\.0\.0\.1",8080\)/,`${name} connects Firestore emulator`);
  assert.match(source,/connectFunctionsEmulator\(academicFunctions,"127\.0\.0\.1",5001\)/,`${name} prevents callable fallback to live Functions`);
  assert.match(source,/channel:"dw-v33-module"/,`${name} publishes same-origin mission state`);
}

assert.match(modules,/environment==='emulator'\|\|environment==='production-readonly'/,'module URLs propagate only recognized safety environments');
assert.match(modules,/environment==='manual-preview'\|\|environment==='production-readonly'/,'production-readonly modules execute no scripts or forms');
assert.match(student,/event\.origin!==location\.origin/,'parent validates the module message origin');
assert.match(student,/event\.source!==frame\.contentWindow/,'parent validates the exact hosted frame');
assert.match(student,/message\.dateKey!==window\.DWV33Core\?\.phoenixDateKey\(\)/,'parent rejects stale Daily Quest state');
assert.match(student,/if\(!currentModuleId\(\)\|\|!app\.querySelector\('\[data-module-frame\]'\)\)render\(\)/,'progress snapshots cannot reload an active lesson frame');

console.log('V3.3 Stage 4 environment + mission bridge contract: PASS');
