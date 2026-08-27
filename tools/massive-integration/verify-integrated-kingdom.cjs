'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const staged=path.join(root,'staged-systems/kingdom-wars-v11.1/kingdom-wars');
const deployed=path.join(root,'kingdom-wars');
const walk=base=>{const out=[];const visit=dir=>fs.readdirSync(dir,{withFileTypes:true}).forEach(e=>{const full=path.join(dir,e.name);e.isDirectory()?visit(full):out.push(path.relative(base,full).split(path.sep).join('/'))});visit(base);return out.sort()};
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const files=walk(staged),live=walk(deployed),runtimeFiles=live.filter(rel=>rel!=='package.json');
assert.deepEqual(runtimeFiles,files,'deployed Kingdom file inventory must match hardened donor');
assert.equal(JSON.parse(fs.readFileSync(path.join(deployed,'package.json'),'utf8')).type,'commonjs','Node verification boundary must preserve the donor package type');
for(const rel of files){if(rel==='kingdom-wars-test-access.mjs')continue;assert.equal(hash(path.join(deployed,rel)),hash(path.join(staged,rel)),`deployed donor drift: ${rel}`)}

const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const access=read('kingdom-wars/kingdom-wars-test-access.mjs');
for(const token of ['demo-dragonswood-v33','connectAuthEmulator','connectFirestoreEmulator','dw-kingdom-live','I_UNDERSTAND','morningWorkAccess','dailyQuestProgress','dailyAccessOverride','morning-work-check-failed'])assert.ok(access.includes(token),`access gate missing ${token}`);
assert.ok(!access.includes("!email.endsWith('@explore.academy')"),'unsafe domain allow rule returned');
assert.match(access,/environment=production\?'production':'emulator'/);

const html=read('kingdom-test.html'),student=read('v33-integration/js/student-app.js'),bridge=read('v33-integration/js/integration/kingdom-portal.js');
assert.match(html,/v33-integration\/student-test\.html/);assert.doesNotMatch(html,/href="index\.html"/);
assert.match(student,/const kingdomNav=\['kingdom'/);assert.match(student,/function kingdomPage/);
assert.match(student,/page==='games'\|\|page==='scribe'\|\|page==='kingdom'/);
assert.match(bridge,/\.\.\/kingdom-test\.html/);assert.match(bridge,/dw-env/);
console.log(`Integrated Kingdom Wars static gate: PASS (${files.length} hardened runtime files)`);
