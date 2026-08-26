'use strict';
const assert=require('node:assert/strict');
const C=require('../js/integration/core.js');
assert.equal(C.isExploreEmail(' Scholar@Explore.Academy '),true);
assert.equal(C.isExploreEmail('scholar@example.com'),false);
assert.equal(C.isTeacherEmail(' JACOBICUSJAX@GMAIL.COM '),true);
assert.equal(C.isStudentEligibleEmail('scholar@explore.academy',false),true);
assert.equal(C.isStudentEligibleEmail('tester@example.com',true),true);
assert.equal(C.isStudentEligibleEmail('outsider@example.com',false),false);
assert.equal(C.levelInfo(0).level,1);
assert.equal(C.levelInfo(199).level,1);
assert.equal(C.levelInfo(200).level,2);
assert.equal(C.levelInfo(1520).level,6);
assert.equal(C.levelInfo(12000).level,20);
assert.equal(C.levelInfo(12000).pct,100);
assert.equal(C.formatDisplayName({firstName:'Jacob',title:'dragonkeeper'},{}),'Jacob the Dragon Keeper');
assert.equal(C.humanizeId('pet-emberbean'),'Emberbean');
const rows=[
 {id:'a_v48',status:'complete',session:'morning',dateKey:'2026-08-24'},
 {id:'b_v48',status:'complete',session:'morning',dateKey:'2026-08-21'},
 {id:'c_v48',status:'complete',session:'morning',dateKey:'2026-08-20'},
 {id:'bad',status:'complete',session:'morning',dateKey:'2026-08-19'}
];
assert.equal(C.schoolDayStreak(rows,new Date('2026-08-25T15:00:00Z')),3,'before Tuesday completion, Monday+Friday+Thursday remain a 3-school-day streak');
rows.push({id:'d_v48',status:'complete',session:'morning',dateKey:'2026-08-25'});
assert.equal(C.schoolDayStreak(rows,new Date('2026-08-25T18:00:00Z')),4);
assert.equal(C.dailyAccessState(rows,{},'u1',false,new Date('2026-08-25T18:00:00Z')).unlocked,true);
assert.equal(C.dailyAccessState([],{},'u1',false,new Date('2026-08-25T18:00:00Z')).unlocked,false);
assert.equal(C.dailyAccessState([],{dateKey:'2026-08-25',studentIds:['u1']},'u1',false,new Date('2026-08-25T18:00:00Z')).overrideToday,true);
const p=C.normalizeStudent({uid:'u1',email:'scholar@explore.academy',displayName:'Test Scholar'},{firstName:'Test',grade:5,hp:10,gold:9,xp:450,classId:'mage',activePet:'pet-emberbean',rpgInventory:['x'],rpgEquipped:{weapon:'x'}},rows);
assert.equal(p.level,3);assert.equal(p.classLabel,'Mage');assert.equal(p.petName,'Emberbean');assert.deepEqual(p.inventory,['x']);
const roster=C.normalizeTeacherRoster([{id:'2',firstName:'Nala',grade:4,genderGroup:'girls'},{id:'1',firstName:'Aliya',grade:5,genderGroup:'girls'}]);
assert.deepEqual(roster.map(x=>x.id),['1','2']);
assert.equal(new Set(roster.map(x=>x.id)).size,roster.length);
console.log('integration-core tests: PASS');
