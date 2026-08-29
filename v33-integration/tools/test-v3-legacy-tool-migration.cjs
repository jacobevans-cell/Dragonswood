'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');

const app=read('v33-integration/js/teacher-app.js');
const runtime=read('v33-integration/js/integration/runtime.js');
const rules=read('firestore.rules');
const teacherRoot=read('teacher.html');

for(const legacy of ['dragonswood-teacher-tools.js','dragonswood-request-center.js','dragonswood-academic-ai-teacher.js']){
  assert.equal(fs.existsSync(path.join(ROOT,legacy)),false,`${legacy} must remain retired after its useful controls move into V3`);
}

for(const collection of ['studentSuggestions','studentSuggestionNotes','academicAiUsage']){
  assert.match(runtime,new RegExp(`['"]${collection}['"]`),`V3 runtime must watch ${collection}`);
}
assert.match(runtime,/\['academicAiConfig','academicAiConfig'\]/,'V3 runtime must watch the AI configuration');
assert.match(runtime,/async reviewStudentSuggestion/,'V3 runtime must save student request workflow and private notes');
assert.match(runtime,/async saveAcademicAiConfig/,'V3 runtime must own AI Answer Rescue settings');
assert.match(runtime,/async awardEggs/,'V3 runtime must own Woodland Egg awards');
assert.match(runtime,/eggInventory:S\.firestore\.increment\(1\)/,'egg awards must increment atomically');
assert.match(runtime,/category:'teacher-egg'/,'egg awards must write a permanent audit transaction');
assert.match(teacherRoot,/js\/integration\/runtime\.js\?v=57\.1\.8/,'live Teacher Command must cache-bust the migrated V3 runtime');

for(const control of ['data-manage-student-requests','data-manage-academic-ai','data-award-eggs']){
  assert.match(app,new RegExp(control),`Classroom Tools must render and bind ${control}`);
}
assert.match(app,/function manageStudentRequests\(\)/,'V3 must provide the request-review dialog');
assert.match(app,/Private teacher note/,'V3 request review must distinguish teacher-only notes');
assert.match(app,/function manageAcademicAi\(\)/,'V3 must provide the AI settings and usage dialog');
assert.match(app,/function openEggAward\(\)/,'V3 must provide the roster-based egg award dialog');

assert.match(rules,/match \/studentSuggestions\/\{suggestionId\}/,'student request rules must remain explicit');
assert.match(rules,/match \/studentSuggestionNotes\/\{suggestionId\}/,'private teacher-note rules must remain explicit');
assert.match(rules,/match \/academicAiUsage\/\{docId\}/,'AI usage must remain teacher-readable and client-write denied');

console.log('V57.1.8 legacy Teacher tools migrated into canonical V3: PASS');
