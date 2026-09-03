const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const daily = read('daily-quest.html');
const boss = read('boss-battle.html');
const portal = read('v33-integration/js/student-app.js');
const core = read('v33-integration/js/integration/core.js');
const seed = read('daily-quest-seed.html');

assert(daily.includes('id="morningCard"'));
assert(daily.includes('UNIFIED MORNING WORK'));
assert(daily.includes('10 Math, 10 HUM/ELA, and 10 Science'));
assert(daily.includes('q1-exam-alignment-data.js?v=60.0.0'));
assert(daily.includes('DW_MORNING_AUTHORITY_PATTERN'));
assert(daily.includes('sourceAuthority:examRow?"exam":"pacing"'));
assert(!daily.includes('subject:"SOCIAL STUDIES"'));
assert(!daily.includes('id="exitCard"'));
assert(!daily.includes('id="exitBtn"'));
assert(!daily.includes('startSession("exit")'));
assert(!daily.includes('lesson.exit'));
assert(daily.includes('Number(lesson.gold??1)*2'), 'the former two-session Gold reward should be paid once');

assert(!portal.includes('Open exit quest'));
assert(!portal.includes('<h3>Exit Quest</h3>'));
assert(!portal.includes("setMissionStatus('exit'"));
assert(!core.includes("exit:status('exit')"));

assert(boss.includes('if(!morning)'));
assert(boss.includes('The boss unlocks after Morning Work.'));
assert(!boss.includes('const exit='));
assert(!boss.includes('session==="exit"'));

const marker = 'const LESSONS=';
const start = seed.indexOf(marker) + marker.length;
const tail = /;\r?\nconst STALE_DAILY_QUEST_DATES/.exec(seed.slice(start));
const end = tail ? start + tail.index : -1;
const lessons = JSON.parse(seed.slice(start, end).trim());
assert.equal(lessons.length, 180);
for (const lesson of lessons) {
  assert(!Object.hasOwn(lesson, 'exit'));
  assert(!Object.hasOwn(lesson, 'exitXp'));
  assert.equal(lesson.morningXp, 6);
}

for (const [file, html] of [['daily-quest.html', daily], ['boss-battle.html', boss]]) {
  const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(match => !/\bsrc\s*=/.test(match[1]))
    .map(match => match[2].replace(/\bimport\s*\{[^}]+\}\s*from\s*["'][^"']+["'];/g, ''));
  scripts.forEach((script, index) => {
    try { new Function(script); }
    catch (error) { throw new Error(`${file} inline script ${index + 1}: ${error.message}`); }
  });
}

console.log('unified-morning-work selftest: PASS');
