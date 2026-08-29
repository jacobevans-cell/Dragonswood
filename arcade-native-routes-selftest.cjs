'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

const student=read('v33-integration/js/student-app.js');
const portal=read('v33-integration/js/integration/arcade-portal.js');
const arcade=read('arcade/js/access-bootstrap.js');
const accessClient=read('arcade/js/access-client.js');
const arcadeHtml=read('arcade/index.html');
const teacher=read('v33-integration/js/teacher-app.js');
const teacherApi=read('v33-integration/js/integration/arcade-teacher.js');
const functions=read('functions-arcade-access/index.js');
const core=read('functions-arcade-access/core.js');
const kingdomBridge=read('v33-integration/js/integration/kingdom-portal.js');
const kingdom=read('kingdom.html');
const kingdomTest=read('kingdom-test.html');
const fallback=read('v33-integration/index.html');

assert.match(student,/if\(String\(page\)==='arcade'\)\{enterArcade\(trigger\);return\}/,'the student router owns Arcade entry');
assert.doesNotMatch(student,/function arcadePage|ARCADE TOKEN WALLET|data-arcade-enter|v33-module-frame[^\n]+Arcade/,'no wallet, confirmation page, or framed Arcade may remain');
assert.ok(student.indexOf('await arcadePortal.preflight?.()')<student.indexOf('access=await arcadePortal.startSession()'),'the runtime preflight must finish before the server debit');
assert.match(student,/access\?\.active!==true/,'an active session must resume without another debit');
assert.match(student,/You need \$\{missing\} more Arcade Token/,'the exact missing-token count must remain visible');
assert.doesNotMatch(portal,/addEventListener\('click'|data-page="arcade"/,'the integration bridge must not intercept portal routing');
assert.match(portal,/Promise\.all\(\[/,'preflight must verify the complete Arcade shell before spending');
assert.match(portal,/preflightPromise=null;throw err/,'a failed preflight must be retryable');

assert.match(arcade,/const portalOwned=direct\|\|environment==='production'/,'production Arcade entry is portal-owned');
assert.match(accessClient,/trustedProductionHost=location\.protocol==='https:'&&location\.hostname==='jacobevans-cell\.github\.io'/,'the deployed bare Arcade URL must identify the production host without unsafe local writes');
assert.match(arcade,/if\(portalOwned\)\{returnToPortal\(message\);return\}/,'production may not reveal the old wallet gate');
assert.match(arcade,/next\.active&&remainingMs\(next\)>0/,'refresh must resume an authoritative active session');
assert.match(arcadeHtml,/arcade-auth-pending/,'the Arcade shell stays hidden until authorization completes');
assert.match(arcadeHtml,/arcade-return-link[^>]+href="\.\.\/index\.html#adventure"/,'Arcade exposes a normal Return to Dragonswood control');

assert.match(core,/settings\.enabled===true&&access\.individualEnabled!==false/,'class lock must remain authoritative');
assert.match(functions,/C\.DAILY_PERIOD_ID/,'daily token eligibility must be fixed on the server');
assert.doesNotMatch(functions,/request\.data\?\.periodId/,'the client cannot create a second token period');
assert.match(functions,/individualEnabled:FieldValue\.delete\(\)/,'a later class-wide Open clears stale individual overrides on the server');
assert.match(functions,/db\.runTransaction/,'session debit and creation remain transactional');
assert.match(functions,/reused:true/,'duplicate starts must reuse an active session');

assert.match(teacher,/case'seating':return seatingPage/,'Seating is a native Teacher Command route');
assert.match(teacher,/data-page="seating"/,'Classroom Tools links to the owned Seating route');
assert.doesNotMatch(teacher,/openDialog\('Seating Command & Room Builder'/,'Seating no longer opens in a giant dialog');
assert.doesNotMatch(teacher,/arcade-period|arcadePeriodOptions|phoenixClockMinutes/,'teacher Arcade criteria have no schedule or clock dependency');
assert.doesNotMatch(teacherApi,/MutationObserver|data-native-seating|setWholeClassAvailability/,'the teacher API does not patch the DOM');

assert.match(kingdomBridge,/dwEmbed','1'/,'Kingdom is hosted without duplicate inner portal chrome');
assert.match(kingdom,/dw-embedded/);assert.match(kingdomTest,/dw-embedded/);
assert.match(fallback,/location\.replace\(target\.href\)/,'a bare v33-integration URL returns to the canonical portal');
assert.doesNotMatch(fallback,/README|launcher\.html/,'the canonical fallback never renders tester documentation');

console.log('Arcade direct entry + native Seating/Kingdom route contracts: PASS');
