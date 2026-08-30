'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');

const rootTeacher=read('teacher.html');
const app=read('v33-integration/js/teacher-app.js');
const css=read('v33-integration/overrides/teacher-gradebook-cards.css');
const liveGradebook=app.slice(app.indexOf('function gradebookPage(){'),app.indexOf('function gradeClass('));

assert.match(rootTeacher,/overrides\/teacher-gradebook-cards\.css\?v=58\.0\.1/,'live Teacher Command must load the approved gradebook-card layer');
assert.match(rootTeacher,/js\/teacher-app\.js\?v=58\.0\.1/,'live Teacher Command must cache-bust the Dragon’s Path gradebook app');
assert.match(liveGradebook,/<details class="gradebook-student-card/,'live gradebook must use the preferred full-width expandable scholar cards');
assert.match(liveGradebook,/gradebook-card-head/,'live gradebook must render the V2-style summary row');
assert.match(liveGradebook,/gradebook-student-body/,'live cards must retain assignment evidence expansion');
assert.doesNotMatch(liveGradebook,/<table class="grade-table">/,'live gradebook must not fall back to the cramped V3 table');
assert.match(liveGradebook,/row\.totalStatus\|\|'Provisional'/,'cards must keep the hardened evidence status');
assert.match(liveGradebook,/row\.readingAssigned/,'cards must distinguish assigned from unassigned Witches reading');
assert.match(app,/gradeIntegrityVersion!==4\|\|gradebook\.reportCardPercentageReady!==true/,'CSV percentage export must remain V4 grade-integrity gated');
assert.doesNotMatch(app,/gradebookGrades|gradebookAssignments/,'the legacy V2 write engine must not be transplanted into V3');
assert.match(css,/\.teacher-page-gradebook \.gradebook-card-head/,'the visual transplant must stay scoped to the gradebook route');
assert.match(css,/grid-template-columns: 48px minmax\(180px, 1\.5fr\) 105px 100px 100px 110px 135px 90px 62px/,'desktop cards must preserve the wide information row with the added Rune column');
assert.match(css,/@media \(max-width: 720px\)/,'the new gradebook cards must retain a mobile layout');

console.log('V58.0.1 gradebook cards with Rune Spelling on hardened V3 model: PASS');
