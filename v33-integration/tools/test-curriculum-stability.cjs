'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');

const curriculum=read('curriculum-quest.html');
for(const contract of [
  'DWCurriculumRenderCoordinator','captureCurriculumView','restoreCurriculumView',
  'requestCurriculumRefresh','data-mission-id','data-recovery-day',
  'dragonswood_q1_curriculum_drafts_v1','selectionStart','setSelectionRange',
  'window.scrollTo','teacher-override-snapshot'
])assert.ok(curriculum.includes(contract),`missing Curriculum stability contract: ${contract}`);
assert.match(curriculum,/curriculumDraftScope=curriculumScope\(scope\)/,'drafts must follow the authenticated student scope');
assert.match(curriculum,/document[.]addEventListener\("input"[^\n]+saveCurriculumDraftControl/,'free responses must save locally while typed');
assert.match(curriculum,/function renderCurriculumDom\(/,'raw DOM work must be private to the coordinator');
assert.match(curriculum,/DWCurriculumStandardsMasteryReport/,
  'student renders must safely bridge the later teacher Standards report');
assert.match(curriculum,/DWCurriculumStandardCode/,
  'student renders must safely bridge the later Standard-code helper');
assert.match(curriculum,/openMissionIds[.]has\(item[.]id\)&&missionComplete\(item\)/,
  'a newly completed open Recovery mission must remain visible');

for(const file of [
  'q1-no-video-lessons.js','q1-curriculum-interactions.js',
  'q1-curriculum-answer-policy.js','dragonswood-math-autograding.js'
]){
  const source=read(file);
  assert.match(source,/DWCurriculumRenderCoordinator[.]request/,
    `${file} must request the central coordinator`);
  assert.doesNotMatch(source,/(?:window[.])?render\(\)/,
    `${file} must not perform a naked full render`);
}

const student=read('v33-integration/js/student-app.js');
assert.match(student,/!blockingPass\(\)&&requestedModule&&requestedModule===mountedModule/,
  'unchanged active module must retain its iframe');
assert.match(student,/app[.]querySelector\('\[data-module-frame\]'\)/,
  'iframe identity guard must require a mounted frame');
assert.match(student,/if\(!currentModuleId\(\)\)render\(\)/,
  'module progress messages may render only after leaving the module');

const tools=read('dragonswood-student-tools.js');
assert.match(tools,/visibilitychange/,'focus security listener must remain');
assert.match(tools,/querySelectorAll\("video,audio"\)/,'focus security must still pause media');

const loader=read('q1-curriculum-enhancements.js');
for(const version of ['56.25.4','56.24.3','57.1.3'])assert.ok(loader.includes(version),`missing cache bust ${version}`);

console.log('V3.3 Curriculum stability contracts: PASS (coordinator + drafts + iframe identity + focus security)');
