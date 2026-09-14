import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const root=new URL('../../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
function navigate(href){const url=new URL(href),calls=[];const location={hostname:url.hostname,pathname:url.pathname,hash:url.hash,search:url.search,replace:x=>calls.push(x)};vm.runInNewContext(read('portal-entry.js'),{location,history:{replaceState:(_,__,hash)=>calls.push(hash)}});return calls;}
test('the existing GitHub homepage renders the approved replacement directly',()=>{
 const index=read('index.html');assert.match(index,/learning-portal\/public\/app.js/);assert.match(index,/learning-portal\/public\/daily-battle.css/);assert.doesNotMatch(index,/student-app\.js|web\.app|http-equiv="refresh"/);
 for(const hash of ['','#home','#morning','#math','#reading','#science','#writing','#ccf','#morphology'])assert.deepEqual(navigate('https://jacobevans-cell.github.io/Dragonswood/'+hash),[]);
 assert.deepEqual(navigate('https://jacobevans-cell.github.io/Dragonswood/#module/daily-quest'),['#morning']);
});
test('school tools and teacher dashboard remain on GitHub and reuse the default Firebase session',()=>{
 assert.deepEqual(navigate('https://jacobevans-cell.github.io/Dragonswood/teacher.html'),[]);
 assert.deepEqual(navigate('https://jacobevans-cell.github.io/Dragonswood/#module/rune-spelling'),['./school-tools.html#module/rune-spelling']);
 const runtime=read('v33-integration/js/integration/runtime.js');assert.match(runtime,/canonicalPortal=\['jacobevans-cell.github.io','dragonswood-9289e.web.app'\]/);assert.match(runtime,/role==='teacher'&&!canonicalPortal/);assert.match(runtime,/Core\.TEACHER_EMAIL/);
});
test('browser config contains only public Firebase configuration and the pinned backend',()=>{
 const config=JSON.parse(read('learning-portal/public/runtime-config.json'));assert.equal(config.mode,'production');assert.equal(config.apiOrigin,'https://dragonswood-9289e.web.app');assert.deepEqual(Object.keys(config).sort(),['apiOrigin','firebase','mode']);
 const app=read('learning-portal/public/app.js');assert.match(app,/\/Dragonswood\/school-tools.html/);assert.doesNotMatch(app,/Back to main portal/);assert.match(app,/\/Dragonswood\/learning-portal\/public\/assets/);
});
