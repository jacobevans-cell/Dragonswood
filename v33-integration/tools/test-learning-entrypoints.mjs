import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url)),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const assigned=[];const context=vm.createContext({window:{location:{assign:url=>assigned.push(url)}},document:{currentScript:{src:'https://school.example/Dragonswood/v33-integration/js/learning-bridge.js'}},URL,Intl,console});
vm.runInContext(read('v33-integration/js/learning-bridge.js'),context);const bridge=context.window.DWLearningBridge;
test('learning entry points navigate the whole page to authenticated Firebase, keeping the main-site subpath out of API calls',()=>{
 for(const [id,route] of [['daily-quest','morning'],['curriculum-quest','home'],['adventurer-hall','home']]){assert.equal(bridge.href(id),'https://dragonswood-9289e.web.app/#'+route);assert.equal(bridge.open(id),true);}
 assert.equal(bridge.open('boss-battle'),false);assert.equal(assigned.length,3);
});
test('new character identity preserves level one and only equips an owned eligible companion',()=>{
 const raw={adventurerProgression:{version:'dragonswood-adventurer-progression.1',level:1,xp:0,heroId:'warrior-light-male-1',needsClassSelection:false},learningAdventurer:{petId:'pet-new-emberdrake-bold'},petRosterVersion:2,ownedPetIds:['pet-new-emberdrake-bold']};
 const p=bridge.profileFor(raw);assert.equal(p.heroId,'warrior-light-male-1');assert.equal(p.level,1);assert.equal(p.petId,'pet-new-emberdrake-bold');
 assert.equal(bridge.profileFor({...raw,ownedPetIds:[]}).petId,null);
 assert.equal(bridge.profileFor({...raw,learningAdventurer:{...raw.learningAdventurer,appearance:{skin:'deep'}}}).appearance.skin,'deep');
 assert.equal(bridge.profileFor({...raw,adventurerProgression:{...raw.adventurerProgression,needsClassSelection:true}}).heroId,null);
 assert.equal(bridge.profileFor({xp:12000,characterV5ClassId:'old'}).heroId,null);
});
test('schedule covers the eight actual Monday–Thursday dates and supplies no invented Friday blocks',()=>{
 for(const date of ['2026-09-14','2026-09-15','2026-09-16','2026-09-17','2026-09-21','2026-09-22','2026-09-23','2026-09-24']){const schedule=bridge.schedule(new Date(date+'T12:00:00-07:00'));assert.ok(schedule.length);assert.ok(schedule.every(s=>s.time&&s.end&&s.title));}
 for(const date of ['2026-09-13','2026-09-18','2026-09-25'])assert.equal(bridge.schedule(new Date(date+'T12:00:00-07:00')),null);
});
test('direct legacy URLs reach their replacement and retired Boss code cannot execute or award loot',()=>{
 for(const p of ['curriculum-quest.html','adventurer-hall.html'])assert.match(read(p),/https:\/\/dragonswood-9289e.web.app\/#home/);
 assert.match(read('daily-quest.html'),/data-learning-cutover/);assert.match(read('daily-quest.html'),/get\('levelup'\)!=='1'/);
 const boss=read('boss-battle.html');assert.match(boss,/old Boss Battle is closed/);assert.doesNotMatch(boss,/<script|runTransaction|bossLoot|gameResults/);
 const rules=read('firestore.rules');assert.match(rules,/match \/bossLoot\/\{lootId\}[^}]*allow create: if false/);assert.doesNotMatch(rules,/'daily_quest','daily_boss'/);
});
test('the main student and teacher shells load the new identity bridge and the student pass guard remains before learning navigation',()=>{
 for(const p of ['school-tools.html','teacher.html'])assert.match(read(p),/js\/learning-bridge.js/);
 assert.match(read('index.html'),/portal-entry.js/);assert.doesNotMatch(read('index.html'),/student-app.js|firebase-auth|learning-bridge.js/);
 const student=read('v33-integration/js/student-app.js'),open=student.slice(student.indexOf('function openModule(id)'),student.indexOf('function closeModule()'));
 assert.ok(open.indexOf('blockingPass()')<open.indexOf('DWLearningBridge'));assert.ok(open.indexOf('substituteBlocked')<open.indexOf('DWLearningBridge'));
 assert.match(student,/function mountModule\(id\)\{if\(id==='boss-battle'\)/);
 assert.match(read('v33-integration/js/teacher-app.js'),/https:\/\/dragonswood-9289e.web.app\/#teacher/);
});
