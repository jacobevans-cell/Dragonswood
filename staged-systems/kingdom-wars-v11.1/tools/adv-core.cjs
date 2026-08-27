#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=process.cwd();
const K=require(path.join(ROOT,'kingdom-wars/kingdom-wars-core.js'));

function fullBuildings(){const b=K.defaultBuildings();for(const id of Object.keys(b))b[id]=3;return b}

const buildings=fullBuildings();
const fresh=K.defaultBuildingHealth(buildings);
const missing=K.normalizeBuildingHealth(buildings,{});
for(const id of Object.keys(K.BUILDINGS))assert.equal(missing[id].hp,missing[id].maxHp,`${id} missing health must migrate as healthy`);
const partial=K.normalizeBuildingHealth(buildings,{keep:{hp:0,maxHp:1,repairingUntil:0},walls:{hp:12,maxHp:1,repairingUntil:0}});
assert.equal(partial.keep.hp,0,'recorded destruction must survive migration');
assert.equal(partial.walls.hp,12,'recorded partial damage must survive migration');
assert.equal(partial.watchtower.hp,partial.watchtower.maxHp,'missing partial-save row must migrate as healthy');
assert.equal(K.buildingHealthState({hp:0,maxHp:0,repairingUntil:0}),'none');

const attackerPublic=K.defaultKingdomPublic('a','A'),defenderPublic=K.defaultKingdomPublic('d','D');
const attackerPrivate={...K.defaultKingdomPrivate(),timber:10,stone:10,essence:10,buildings};
attackerPrivate.buildingHealth=fresh;
const defenderPrivate={...K.defaultKingdomPrivate(),timber:0,stone:7,essence:3,buildings};
defenderPrivate.buildingHealth=fresh;
const applied=K.applyRankedResult(attackerPublic,defenderPublic,attackerPrivate,defenderPrivate,{friendly:false,attackerCrownDelta:0,defenderCrownDelta:0,loot:{timber:75,stone:75,essence:75},buildingDamage:{}});
assert.deepEqual([applied.attackerPrivate.timber,applied.defenderPrivate.timber],[10,0]);
assert.deepEqual([applied.attackerPrivate.stone,applied.defenderPrivate.stone],[17,0]);
assert.deepEqual([applied.attackerPrivate.essence,applied.defenderPrivate.essence],[13,0]);
for(const resource of K.RESOURCE_KEYS)assert.equal(applied.attackerPrivate[resource]+applied.defenderPrivate[resource],attackerPrivate[resource]+defenderPrivate[resource],`${resource} must be conserved`);
assert.notEqual(applied.attackerPrivate.buildings,attackerPrivate.buildings,'result must not alias nested attacker state');
assert.notEqual(applied.defenderPrivate.battleFeed,defenderPrivate.battleFeed,'result must not alias nested defender state');

const destroyed={};for(const id of Object.keys(fresh))destroyed[id]={...fresh[id],hp:0};
const noDamage=K.testRaidDamage(buildings,destroyed,'destroyed-test',3);
assert.deepEqual(noDamage.applied,{},'test damage must not report destroyed buildings');
assert.ok(Object.values(noDamage.health).every(row=>row.hp===0));

const coreSource=fs.readFileSync(path.join(ROOT,'kingdom-wars/kingdom-wars-core.js'),'utf8');
assert.ok(coreSource.includes('HEALTH_THRESHOLDS'),'health thresholds must have one source of truth');
console.log('V11.1 adversarial core: PASS (loot conservation, migration health, no aliases, no phantom damage)');
