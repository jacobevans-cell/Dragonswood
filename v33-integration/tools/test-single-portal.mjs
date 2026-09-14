import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const root=new URL('../../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
function navigate(href){const url=new URL(href),calls=[];const location={hostname:url.hostname,pathname:url.pathname,hash:url.hash,search:url.search,replace:x=>calls.push(x)};vm.runInNewContext(read('portal-entry.js'),{location,URL,URLSearchParams});return calls;}
test('existing home bookmarks enter the new portal before any legacy login',()=>{
 for(const hash of ['', '#adventure','#missions','#curriculum-quest','#module/curriculum-quest'])assert.deepEqual(navigate('https://jacobevans-cell.github.io/Dragonswood/'+hash),['https://dragonswood-9289e.web.app/#home']);
 assert.deepEqual(navigate('https://jacobevans-cell.github.io/Dragonswood/#module/daily-quest'),['https://dragonswood-9289e.web.app/#morning']);
 assert.doesNotMatch(read('index.html'),/student-app\.js|firebase-auth|Back to main portal/);
});
test('tools, teacher and lesson routes stay on the canonical origin without redirect loops',()=>{
 assert.deepEqual(navigate('https://jacobevans-cell.github.io/Dragonswood/teacher.html#gradebook'),['https://dragonswood-9289e.web.app/teacher.html#gradebook']);
 assert.deepEqual(navigate('https://jacobevans-cell.github.io/Dragonswood/#module/rune-spelling'),['https://dragonswood-9289e.web.app/school-tools.html#module/rune-spelling']);
 assert.deepEqual(navigate('https://jacobevans-cell.github.io/Dragonswood/#science'),['https://dragonswood-9289e.web.app/#science']);
 assert.deepEqual(navigate('https://dragonswood-9289e.web.app/school-tools.html#games'),[]);
});
test('navigation never copies credentials or permits an external redirect',()=>{
 const target=navigate('https://jacobevans-cell.github.io/Dragonswood/teacher.html?token=private&studentId=someone&book=valid#access_token=private')[0];
 assert.equal(target,'https://dragonswood-9289e.web.app/teacher.html?book=valid');
 assert.equal(navigate('https://jacobevans-cell.github.io/Dragonswood//attacker.example/')[0],'https://dragonswood-9289e.web.app/#home');
});
test('canonical teacher dashboard uses the existing default Firebase session while authority checks remain',()=>{
 const runtime=read('v33-integration/js/integration/runtime.js');
 assert.match(runtime,/const canonicalPortal=location\.hostname==='dragonswood-9289e.web.app'/);
 assert.match(runtime,/role==='teacher'&&!canonicalPortal/);
 assert.match(runtime,/Core\.TEACHER_EMAIL/);
});
