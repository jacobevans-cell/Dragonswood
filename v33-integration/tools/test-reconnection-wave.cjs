'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');

const studentRoot=read('index.html');
const studentTest=read('v33-integration/student-test.html');
const student=read('v33-integration/js/student-app.js');
const teacher=read('v33-integration/js/teacher-app.js');
const runtime=read('v33-integration/js/integration/runtime.js');
const core=read('v33-integration/js/integration/core.js');

for(const [name,html] of [['production student root',studentRoot],['student fixture root',studentTest]]){
  assert.match(html,/dragonswood-student-tools[.]js/,`${name} must load the existing student tool bundle`);
}

const games=['decimal-deception','math-operations','long-division','long-division-custom','spelling-practice','elemental-laboratory','cosmic-architect','arcane-forge'];
for(const game of games)assert.match(student,new RegExp(`\\['${game}'`),`${game} must be present in the student catalog`);
assert.match(student,/\['math-operations','Math'[^\n]+,'fraction-forge'\]/,'Fraction Forge must remain available inside the combined Math Operations card');
assert.doesNotMatch(student,/\['(?:witches-test|class-reader)','ELA'/,'Witches test and reader must stay out of the Quest Games catalog');
assert.match(student,/data-module="class-reader"/,'the daily reader path must remain connected');
assert.doesNotMatch(student,/History'\]\s*\.map|\['All','Math','ELA','Science','History'\]/,'the empty History game filter must not return');
assert.match(student,/data-open-portfolio/,'the Scribe portfolio must have a live control');
assert.match(student,/data-module="boss-battle"/,'Boss Battle must route to the authoritative module');
assert.doesNotMatch(student,/PLAYER MOVE|Abyssal Strike|OBSIDIAN WYRM/,'the student shell must not simulate boss combat');
assert.match(student,/data-poll-choice/,'the student Class Poll must expose vote controls');
assert.match(runtime,/async votePoll\(choiceIndex\)/,'student poll votes must use the runtime');
assert.match(core,/optionalAccessPaused[\s\S]*teacherCheckInRequired[\s\S]*reflectionRequired/,'teacher access holds must feed the student access gate');

assert.doesNotMatch(teacher,/teacher-v2[.]html|Open V2 controls|not yet migrated/i,'no V3 teacher command may redirect to the legacy popup');
const commands=['Ready & Working','Excellent Transition','Great Lunch Behavior','Great Specials Behavior','Outstanding Effort','Dragonswood Leadership','Reset Focus','Pause Access','Teacher Check-In','Reflection Needed','Custom XP Change','Custom Gold Change','Custom HP Change','Recognition Note','Unlock Daily Access','Pause Optional Area','Profile Review','Teacher Flag'];
for(const command of commands)assert.match(teacher,new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),`${command} must remain visible in Student Command`);
assert.match(teacher,/applyStudentCommand\(command,\[\.\.\.state[.]selected\]/,'reviewed Student Commands must call the native runtime');
assert.match(runtime,/async applyStudentCommand\(command,studentIds,options=\{\}\)/,'the runtime must implement native Student Commands');
for(const filter of ['All','4th','5th','Boys','Girls'])assert.match(teacher,new RegExp(`'${filter}'`),`${filter} roster filter must remain available`);
assert.match(teacher,/data-roster-filter/,'roster filters must have control identifiers');
assert.match(teacher,/setDailyAccess/,'Daily Access management must call the runtime');
assert.match(runtime,/async reviewCurriculumOverride/,'Curriculum review must be implemented by the runtime');

for(const feature of ['passHistory','bathroomSlots','passBlackout'])assert.match(runtime,new RegExp(feature),`${feature} must be watched by the teacher runtime`);
assert.match(teacher,/data-pass-history/,'Pass History must have a live control');
assert.match(teacher,/data-pass-blackout/,'Pass Blackout must have a live control');
assert.doesNotMatch(teacher,/students[.]slice\(0,4\)/,'Guild Jobs must use the full roster');

const tools=['Visual Timer','Volume Meter','Focus Screen','Random Scholar','Group Maker','Number Picker','Quick Poll','Ambient Sound','Attention Signal','Seating Command'];
for(const tool of tools)assert.match(teacher,new RegExp(tool),`${tool} must be exposed by Classroom Tools`);
assert.match(teacher,/seating-command\/index[.]html/,'Seating Command must route to the existing room builder');
assert.match(teacher,/function openQuickPoll/,'Quick Poll must have a teacher handler');
assert.match(runtime,/async launchPoll\(question,choices\)/,'Quick Poll launch must write through the runtime');
assert.match(runtime,/async closePoll\(\)/,'Quick Poll close must write through the runtime');

console.log('V3.3 consolidated reconnection wave contracts: PASS (student routes + teacher commands + passes + tools + poll)');
