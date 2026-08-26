'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const M=require('../js/integration/modules.js');

assert.equal(M.modules.length,16,'all 16 current production student modules remain registered');
assert.equal(new Set(M.modules.map(x=>x.id)).size,16,'module IDs are unique');
for(const mod of M.modules){
  assert.ok(fs.existsSync(path.join(__dirname,'../..',mod.path)),`${mod.path} exists in frozen production`);
  assert.equal(M.definition(mod.id),mod,`${mod.id} resolves to its frozen definition`);
}
assert.equal(M.routeId('#module/math-operations'),'math-operations');
assert.equal(M.routeId('#module/unknown'),'');
assert.equal(M.allowed('math-operations',{dailyAccessUnlocked:false}).reason,'morning-work');
assert.equal(M.allowed('math-operations',{dailyAccessUnlocked:true}).ok,true);
assert.equal(M.allowed('daily-quest',{dailyAccessUnlocked:false}).ok,true);
assert.match(M.href('level-up-challenge','https://example.test/v33-integration/student-test.html'),/daily-quest\.html\?levelup=1&dwEmbed=1$/);
assert.match(M.markup('boss-battle'),/data-module-frame/);
const studentApp=fs.readFileSync(path.join(__dirname,'../js/student-app.js'),'utf8');
assert.match(studentApp,/page==='games'\|\|page==='scribe'/,'Games and Scribe share the Morning Work gate');
assert.match(studentApp,/data-module="\$\{g\[0\]\}"/,'visible game cards launch contained production modules');
assert.doesNotMatch(studentApp,/opened in safe tester mode/,'production modules replaced tester-only launch toasts');
console.log('V3.3 production module host tests: PASS');
