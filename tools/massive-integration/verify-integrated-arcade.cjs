'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));

for(const rel of [
  'arcade/index.html','arcade/js/access-client.js','arcade/js/access-bootstrap.js',
  'arcade/games/dragon-dash/access-loader.js','arcade/games/void-runner/js/access-loader.js',
  'functions-arcade-access/core.js','functions-arcade-access/index.js','firebase.arcade-access.json',
  'v33-integration/js/integration/arcade-portal.js','v33-integration/js/integration/arcade-teacher.js'
])assert.ok(exists(rel),`missing ${rel}`);

const allArcade=[];
for(const dir of ['arcade']){
  const walk=p=>fs.readdirSync(p,{withFileTypes:true}).forEach(e=>{const full=path.join(p,e.name);if(e.isDirectory())walk(full);else if(/\.(?:js|html|mjs|cjs)$/.test(e.name))allArcade.push(fs.readFileSync(full,'utf8'))});
  walk(path.join(root,dir));
}
assert.doesNotMatch(allArcade.join('\n'),/signInAnonymously\s*\(/,'anonymous Arcade authentication must remain retired');

const core=read('functions-arcade-access/core.js');
assert.match(core,/TOKEN_CAP=3/);assert.match(core,/SESSION_COST=3/);assert.match(core,/SESSION_MS=30\*60\*1000/);
assert.match(core,/\['ready','responsible','complete'\]/);
const functions=read('functions-arcade-access/index.js');
for(const name of ['getArcadeAccess','getArcadeTeacherState','awardArcadeCriterion','startArcadeSession','endArcadeSession','setArcadeAvailability','refundArcadeSession'])assert.match(functions,new RegExp(`exports\\.${name}=`),`missing callable ${name}`);
assert.match(functions,/runTransaction/);assert.match(functions,/wallet-full/);assert.match(functions,/already-awarded/);assert.match(functions,/reused:true/);assert.match(functions,/already received its one technical refund/);
assert.match(functions,/require\('firebase-admin\/firestore'\)/,'Arcade Functions must use the supported modular Firestore Admin API');
assert.doesNotMatch(functions,/admin\.firestore\.(?:FieldValue|Timestamp)/,'legacy Firestore Admin timestamp API is incompatible with firebase-admin v13');

const access=read('arcade/js/access-client.js'),bootstrap=read('arcade/js/access-bootstrap.js');
assert.match(access,/dw-arcade-live/);assert.match(access,/I_UNDERSTAND/);assert.match(access,/connectFunctionsEmulator/);
assert.match(bootstrap,/setInterval\(refresh,15000\)/);assert.match(bootstrap,/setInterval\(updateClock,1000\)/);
assert.match(bootstrap,/Arcade is locked while this device is offline/);assert.match(bootstrap,/await import\('\.\/arcade\.js'\)/);

const dashHtml=read('arcade/games/dragon-dash/index.html'),voidHtml=read('arcade/games/void-runner/index.html');
assert.match(dashHtml,/src="access-loader\.js"/);assert.doesNotMatch(dashHtml,/src="game\.js"/);
assert.match(voidHtml,/src="js\/access-loader\.js"/);assert.doesNotMatch(voidHtml,/src="js\/game\.js"/);
for(const rel of ['arcade/games/dragon-dash/access-loader.js','arcade/games/void-runner/js/access-loader.js']){
  const loader=read(rel);assert.match(loader,/setInterval\(check,15000\)/);assert.match(loader,/remainingMs/);assert.match(loader,/offline/);
}

assert.match(read('arcade/js/leaderboard-service.js'),/sessionId/);
assert.match(read('arcade/games/void-runner/js/cloud-sync.js'),/arcadeSessionId/);
assert.doesNotMatch(read('arcade/js/arcade.js'),/function refreshProfile\(\)\{profile=getProfile\(\)/);
assert.match(read('arcade/js/arcade.js'),/doc\(C\.db,'students',C\.user\.uid\)/);
assert.match(read('arcade/js/arcade-config.js'),/directGameRewardsEnabled:\s*false/);
assert.doesNotMatch(read('arcade/admin.html'),/admin\.js/);assert.match(read('arcade/admin.html'),/Records only/);
assert.match(read('arcade/sw.js'),/dragonswood-arcade-v9-authoritative-access/);

const rules=read('firestore.rules');
for(const collection of ['arcadeAccess','arcadeSettings','arcadeTokenPeriods','arcadeSessions','arcadeAudit']){
  assert.match(rules,new RegExp(`match \/${collection}\/`));
}
assert.match(rules,/function hasLiveArcadeSession/);assert.match(rules,/function validArcadeScore/);
assert.match(rules,/allow write: if false/);assert.match(rules,/request\.resource\.data\.updatedAt == request\.time/);

const student=read('v33-integration/js/student-app.js'),teacher=read('v33-integration/js/teacher-app.js'),teacherBridge=read('v33-integration/js/integration/arcade-teacher.js');
assert.match(student,/3 Tokens • 30 min/);assert.match(student,/function arcadePage/);assert.match(student,/arcadePortal\?/);
assert.match(teacher,/function arcadePage/);assert.match(teacher,/Ready/);assert.match(teacher,/Responsible/);assert.match(teacher,/Complete/);
assert.match(teacherBridge,/dw-arcade-writes/);assert.match(teacherBridge,/EMULATOR_ONLY/);assert.match(teacherBridge,/environment==='emulator'/);
assert.match(teacherBridge,/enabled=environment==='production'/,'live Arcade teacher controls require the explicit production environment');

console.log('Integrated Arcade static safety gate: PASS');
