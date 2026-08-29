'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=file=>fs.readFileSync(path.resolve(__dirname,file),'utf8');

const teacher=read('../js/teacher-app.js');
const runtime=read('../js/integration/runtime.js');
const world=read('../js/integration/world.js');
const operations=read('../js/integration/operations.js');
const seating=read('../../seating-command/js/app.js');
const seatingHtml=read('../../seating-command/index.html');
const student=read('../js/student-app.js');
const studentTools=read('../../dragonswood-student-tools.js');
const teacherHtml=read('../../teacher.html');
const studentHtml=read('../../index.html');

assert.match(teacher,/data-leader-range=/,'leaderboard range controls must be wired');
assert.match(teacher,/leaderboardAllTime/,'teacher UI must read the all-time model');
assert.match(operations,/leaderboardAllTime:teacherLeaderboard/,'operations must expose weekly and all-time boards');
assert.match(world,/period==='all-time'/,'world model must support all-time scoring');

assert.doesNotMatch(teacher,/arcade-period|arcadePeriodOptions|phoenixClockMinutes/,'Arcade Tokens must not depend on a period or the current clock');
assert.match(teacher,/once per Phoenix school day/,'daily Ready, Responsible, and Complete eligibility must be explicit');
assert.match(teacher,/data-arcade-student=/,'Arcade Time must include an inline roster selector');
assert.doesNotMatch(teacher,/data-arcade-refund/,'refund controls must not remain visible');
assert.doesNotMatch(teacher,/One-time session refund/,'refund panel copy must be removed');

assert.match(seating,/DragonswoodV33TeacherIntegration/,'Seating Command must reuse the current Teacher Command auth app');
assert.doesNotMatch(seating,/DragonswoodTeacherPortal/,'obsolete Seating auth app must be retired');
assert.match(seating,/connectAuthEmulator/,'authenticated Seating browser coverage must stay emulator-safe');
assert.match(seatingHtml,/js\/app[.]js\?v=57[.]1[.]6/,'Seating repair must be cache-busted');
assert.match(teacher,/case'seating':return seatingPage/,'Seating Command must be owned by the teacher router');
assert.match(teacher,/url\.searchParams\.set\('dwEmbed','1'\)/,'the native Seating route must remove the standalone inner chrome');
assert.doesNotMatch(teacher,/openDialog\('Seating Command & Room Builder'/,'Seating Command must not open as a giant dialog');

assert.match(world,/row[.]startDate\|\|row[.]dateKey/,'calendar adapter must accept legacy startDate');
assert.match(teacher,/data-calendar-add/);assert.match(teacher,/data-calendar-edit/);assert.match(teacher,/data-calendar-delete/);
assert.match(runtime,/saveCalendarEvent/);assert.match(runtime,/deleteCalendarEvent/);

assert.match(studentTools,/bottom:76px/,'suggestion control must reserve the toast corner');
assert.match(student,/4200/,'student pass messages must remain visible long enough to read');
assert.match(teacher,/pending-pass-badge/,'Pass Control needs a persistent pending count');

assert.match(teacher,/arcade-token-panel/,'Arcade Tokens must replace the visible legacy bank space');
assert.match(teacher,/pass-overdue/);assert.match(operations,/PASS_OVERDUE_MS/);
assert.match(teacher,/Legacy adjustment/,'legacy evidence must render honestly without invented balances');
assert.doesNotMatch(runtime,/'Dragonswood Leadership':\{xp:40,gold:8,goal:'universalPoints'/,'new rewards must stop feeding the hidden Universal bank');

for(const html of [teacherHtml,studentHtml])assert.match(html,/v=57[.]1[.]6/,'changed production scripts must be cache-busted');
console.log('V3.3 Teacher daily-use repair contracts: PASS (nine-item UI and model wiring)');
