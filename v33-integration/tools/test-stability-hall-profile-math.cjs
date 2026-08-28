#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const curriculum=read('curriculum-quest.html');
for(const marker of ['requestCurriculumRefresh','captureCurriculumView','restoreCurriculumView','curriculumDraft'])
  assert.match(curriculum,new RegExp(marker),`published Curriculum stability coordinator lost ${marker}`);

const hall=read('adventurer-hall.html');
assert.match(hall,/[.]pet-layout>aside\{position:static/,'active companion must use natural page scroll');
assert.doesNotMatch(hall,/[.]pet-layout>aside\{position:sticky/,'Hall must not detach the active companion');
assert.match(hall,/repeat\(auto-fit,minmax\(min\(180px,100%\),1fr\)\)/,'pet grid must collapse without horizontal overflow');
assert.match(hall,/function migrateCanonicalClass\(\)/,'legacy class choices must migrate to canonical classId');
assert.match(hall,/\{classId:migrated,classChosenAt:serverTimestamp\(\),updatedAt:serverTimestamp\(\)\}/,'migration must remain within existing one-time class security rules');
assert.match(hall,/object-fit:contain/,'Hall art must preserve aspect ratios');

const app=read('v33-integration/js/student-app.js');
assert.match(app,/chosenClass=classes[.]find/,'portal class card must use the canonical model');
assert.match(app,/YOUR CLASS • LOCKED/,'chosen class must not look selectable again');
assert.match(app,/function ensureHallProfileStyles\(\)/);
assert.match(app,/DWV33VisualFreeze===true/,'protected visual fixture must remain unchanged');
assert.match(app,/hall-character img\{[^}]+object-fit:contain/);
assert.match(app,/pet-art img\{object-fit:contain/);

const teacher=read('v33-integration/js/teacher-app.js');
const runtime=read('v33-integration/js/integration/runtime.js');
assert.match(teacher,/Reset Class Choice/);
assert.match(runtime,/'Reset Class Choice':\{resetClass:true,serious:true\}/);
assert.match(runtime,/classId:'',classChosenAt:null,classResetAt:/);
assert.match(runtime,/category:'teacher-class-reset'/);

for(const file of [
  'js/math-operations-quest.js',
  'staged-systems/unified-math-v56.27-grayson-v58/math-v56.27/runtime/js/math-operations-quest.js',
]){
  const math=read(file);
  for(const helper of ['difficultyInfo','pointValue','setDifficultyLocked','closeHint','hintControlUI','difficultyUI','normalPrompt','hardPrompt','taskPrompt','walkthroughSteps','renderNormalWalkthrough','renderEasyAddition','renderEasySubtraction','renderEasyMultiplication','renderEasyDivision','renderEasyHint'])
    assert.equal((math.match(new RegExp(`function ${helper}\\(`,'g'))||[]).length,1,`${file}: ${helper} must exist exactly once`);
  assert.match(math,/eligibleForRewards:diff[.]rewardEligible&&!state[.]roundHadCustom&&state[.]mode==='random'/,'reward eligibility integration must remain');
  assert.match(math,/window[.]DWMathAudio[?][.]positive/,'Math audio integration must remain');
  assert.match(math,/closeHint\(\);hintControlUI\(\);els[.]progress[.]textContent=/,'active Math task must expose the correct coach control');
}
assert.match(read('math-operations-quest.html'),/math-operations-quest[.]js[?]v=56[.]27[.]1/);

console.log('V3.3 one-pass stability + Hall + profile + Math contracts: PASS');
