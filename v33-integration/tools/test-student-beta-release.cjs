'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');

const student=read('index.html');
const teacher=read('teacher.html');
for(const [name,html] of [['student',student],['teacher',teacher]]){
  assert.match(html,/data-dw-environment="production"/i,`${name} root must force production mode`);
  assert.match(html,/data-dw-release="v3\.3-student-beta"/i,`${name} root must expose the release marker`);
  assert.match(html,/<base href="v33-integration\/">/i,`${name} root must resolve V3 assets from the integration directory`);
  assert.match(html,/js\/integration\/passes\.js/i,`${name} root must load the pass contract before runtime`);
  assert.doesNotMatch(html,/Student Tester|Teacher Tester/i,`${name} root must not retain tester titles`);
}
assert.match(teacher,/\.\.\/functions-arcade-access\/tester-core\.js\?v=57\.1\.16/,'teacher root must load the shared tester contract');
assert.ok(teacher.indexOf('../functions-arcade-access/tester-core.js?v=57.1.16')<teacher.indexOf('js/integration/runtime.js?v=58.1.0'),'teacher root must load the tester contract before runtime');
for(const legacy of ['student-v2.html','teacher-v2.html','Tester1111.html','index-live-welcome-test.html','dragonswood-teacher-tools.js','dragonswood-request-center.js','dragonswood-academic-ai-teacher.js']){
  assert.equal(fs.existsSync(path.join(ROOT,legacy)),false,`${legacy} must stay retired; Git history and the rollback branch preserve the pre-cutover portal`);
}
assert.equal(fs.existsSync(path.join(ROOT,'dragonswood-v33-test')),false,'the duplicate V3 tester package must stay retired; v33-integration is canonical');

const runtime=read('v33-integration/js/integration/runtime.js');
assert.match(runtime,/declaredEnvironment==='production'/,'production must be declared by the root document, not a query string alone');
assert.match(runtime,/environment!=='emulator'&&environment!=='production'/,'read-only environments must reject writes');
assert.match(runtime,/async usePass\(type\)/,'student pass actions must be wired into the controller');
assert.match(runtime,/watchDoc\(\['classData','substituteMode'\]/,'students must receive the live Substitute Mode record');
assert.match(runtime,/async setSubstituteMode\(active\)/,'the teacher runtime must expose the one-click Substitute Mode write');
assert.match(runtime,/substituteSnap[\s\S]*datedSubstituteMode[\s\S]*Ask your substitute teacher/,'pass starts must re-check Substitute Mode inside the Firestore transaction');

const modules=read('v33-integration/js/integration/modules.js');
assert.match(modules,/environment==='production'/,'embedded modules must inherit live production mode');
assert.match(modules,/id:'boss-battle'[^\n]+morningGate:true/,'Boss Battle must inherit the Morning Work gate');
assert.match(modules,/id:'adventurer-hall'[^\n]+morningGate:true/,'Adventurer Hall must inherit the required-work gate');
const studentApp=read('v33-integration/js/student-app.js');
assert.match(studentApp,/data-account-menu aria-label="Open account menu"/,'the top profile control must open the account menu');
assert.doesNotMatch(studentApp,/profile-pill[^>]+data-module="adventurer-hall"/,'the top profile control must not duplicate the Adventurer Hall route');
assert.match(studentApp,/data-account-signout>↪ Sign Out<\/button>/,'the account menu must expose a clear sign-out action');
assert.match(studentApp,/data-account-signout[^\n]+signOutStudent/,'the account-menu sign-out action must use the existing Firebase controller logout');
for(const route of ['games','boss','leaderboards','kingdom','arcade'])assert.match(studentApp,new RegExp(`REQUIRED_WORK_PAGES[^\\n]+['\"]${route}['\"]`),`${route} must use the required-work gate`);
assert.match(studentApp,/globalThis\.history\?\.replaceState\?\.\(null,'','#missions'\)/,'direct locked hashes must be replaced with the Daily Missions route');
for(const blocked of ['kingdom','deep-time-lab','dragon-tongues'])assert.match(studentApp,new RegExp(`substituteModeActive\\(\\)[^\\n]+${blocked}`),`${blocked} must be blocked by the shared Substitute Mode route guard`);
assert.match(studentApp,/Ask Your Substitute Teacher/,'blocked students must receive a direct instruction to ask the substitute');
const teacherApp=read('v33-integration/js/teacher-app.js');
assert.match(teacherApp,/data-substitute-mode/,'Teacher Command must expose the Substitute Mode quick button');
assert.match(teacherApp,/function manageSubstituteMode\(\)/,'the quick button must use a confirmation flow');
const arcade=read('v33-integration/js/integration/arcade-portal.js');
assert.match(arcade,/dw-arcade-live/,'Arcade production routing must retain the explicit live opt-in');
const kingdom=read('v33-integration/js/integration/kingdom-portal.js');
assert.match(kingdom,/kingdom\.html/,'the production portal must route to the student beta entry');
assert.match(kingdom,/dw-kingdom-live/,'Kingdom production routing must retain the explicit live opt-in');

const kingdomPage=read('kingdom.html');
assert.match(kingdomPage,/STUDENT BETA/,'Kingdom Wars must disclose beta status');
assert.match(kingdomPage,/stored only in this browser/,'Kingdom Wars must disclose local-only progress');

const release=JSON.parse(read('firebase.v33-release.json'));
assert.deepEqual(release.functions.map(row=>row.codebase),['academic-ai','arcade-access']);
assert.equal(release.firestore.rules,'firestore.rules');
assert.equal(release.firestore.indexes,'arcade/firestore.indexes.json');
const productionGate=JSON.parse(read('firebase.v33-production-gate.json'));
assert.equal(productionGate.firestore.rules,'firestore.rules');
assert.equal(productionGate.firestore.indexes,'arcade/firestore.indexes.json');

const rules=read('firestore.rules');
assert.match(rules,/match \/passStatus\/\{passId\}[\s\S]*passId\.matches\('\^' \+ request\.auth\.uid \+ '_\.\*\$'\)/,'students must be able to read their not-yet-created pass status documents');
assert.doesNotMatch(release.firestore.rules,/gate/i,'release must never deploy emulator gate rules');
assert.match(rules,/function substituteModeAllowsPasses\(\)/,'production rules must recognize Substitute Mode');
assert.match(rules,/match \/bathroomStatus\/[\s\S]*substituteModeAllowsPasses\(\)/,'production rules must block bathroom pass starts during Substitute Mode');
assert.match(rules,/match \/passRequests\/[\s\S]*substituteModeAllowsPasses\(\)/,'production rules must block extra pass requests during Substitute Mode');

const identityGate=read('v33-integration/tools/firebase-identity-gate.cjs');
assert.match(identityGate,/v instanceof Date[^\n]+timestampValue/,'the REST fixture encoder must preserve Firestore timestamps');
assert.match(identityGate,/seed\('dailyQuests'[\s\S]*unlockAt:dailyUnlockAt,lockAt:dailyLockAt/,'the exact-rules fixture must include the live Daily Quest access window');
assert.match(identityGate,/validLoot[\s\S]*goalPoints:0,rareGoal:'none'/,'the exact-rules fixture must include every required Boss loot reward field');

const academicBrowserGate=read('v33-integration/tools/academic-systems-browser-gate.py');
assert.match(academicBrowserGate,/wait_for_saved_review/,'the Academic Systems browser gate must verify the persisted teacher review');
assert.match(academicBrowserGate,/getDoc[\s\S]*writingResponses/,'the review gate must read the authoritative fictional Firestore record');
assert.doesNotMatch(academicBrowserGate,/get_by_text\('Teacher review saved/,'the review gate must not depend on a transient toast being visible');

const teacherOperationsBrowserGate=read('v33-integration/tools/teacher-operations-browser-gate.py');
assert.match(teacherOperationsBrowserGate,/schedule saved to the fictional Firebase emulator\./,'the downstream schedule gate must match the release portal label');

const studentBetaBrowserGate=read('v33-integration/tools/student-beta-browser-gate.py');
assert.match(studentBetaBrowserGate,/pass_action\(page,'bathroom','start','🚻 Use Bathroom pass'\)[\s\S]*return_blocking_pass\(page,'bathroom'\)[\s\S]*pass_action\(page,'bathroom','start','🚻 Use Bathroom pass'\)/,'the final pass gate must follow the actual post-Teacher-Operations state through the restored blocking return flow');
assert.match(studentBetaBrowserGate,/arg=\{'type': pass_type, 'action': expected_action\}/,'the pass-state wait must use the installed Playwright keyword-only argument API');
assert.match(studentBetaBrowserGate,/state\.passes\?\.rows\?\.\[type\]\?\.action === action/,'pass transitions must wait for the live student state before opening the next dialog');
assert.match(studentBetaBrowserGate,/data-active-pass-overlay/,'the pass browser gate must verify the restored full-screen safety layer');
assert.match(studentBetaBrowserGate,/location\.hash/,'the pass browser gate must verify forced navigation back to the student home route');

const bossBattle=read('boss-battle.html');
assert.match(bossBattle,/rareGoal:"none",goalPoints:0/,'the live Boss Battle must write the required goal fields');

console.log('V3.3 consolidated student-beta release contracts: PASS');
