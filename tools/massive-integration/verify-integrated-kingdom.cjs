'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const deployed=path.join(root,'kingdom-wars');
const walk=base=>{const out=[];const visit=dir=>fs.readdirSync(dir,{withFileTypes:true}).forEach(e=>{const full=path.join(dir,e.name);e.isDirectory()?visit(full):out.push(path.relative(base,full).split(path.sep).join('/'))});visit(base);return out.sort()};
const files=walk(deployed);
for(const rel of ['kingdom-wars-core.js','kingdom-wars-state.mjs','kingdom-wars-test-access.mjs','kingdom-wars-test-app.mjs','kingdom-wars-test-nav.mjs','kingdom-wars.css'])
  assert.ok(files.includes(rel),`deployed Kingdom runtime is missing ${rel}`);
assert.ok(files.filter(rel=>/[.](?:webp|png|gif)$/.test(rel)).length>=902,'deployed Kingdom runtime must keep its complete production art inventory');
assert.equal(JSON.parse(fs.readFileSync(path.join(deployed,'package.json'),'utf8')).type,'commonjs','Node verification boundary must preserve the production package type');

const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const access=read('kingdom-wars/kingdom-wars-test-access.mjs');
for(const token of ['demo-dragonswood-v33','connectAuthEmulator','connectFirestoreEmulator','dw-kingdom-live','I_UNDERSTAND','morningWorkAccess','dailyQuestProgress','dailyAccessOverride','morning-work-check-failed'])assert.ok(access.includes(token),`access gate missing ${token}`);
assert.ok(!access.includes("!email.endsWith('@explore.academy')"),'unsafe domain allow rule returned');
assert.match(access,/environment=production\?'production':'emulator'/);

const html=read('kingdom-test.html'),student=read('v33-integration/js/student-app.js'),bridge=read('v33-integration/js/integration/kingdom-portal.js');
assert.match(html,/v33-integration\/student-test\.html/);assert.doesNotMatch(html,/href="index\.html"/);
assert.match(student,/const kingdomNav=\['kingdom'/);assert.match(student,/function kingdomPage/);
assert.match(student,/REQUIRED_WORK_PAGES=new Set\([^\n]+['"]kingdom['"]/,'Kingdom remains part of the current required-work gate');
assert.match(bridge,/\.\.\/kingdom-test\.html/);assert.match(bridge,/dw-env/);
console.log(`Integrated Kingdom Wars static gate: PASS (${files.length} production files; no donor clone required)`);
