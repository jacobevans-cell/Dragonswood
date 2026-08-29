#!/usr/bin/env node
'use strict';
const assert=require('assert'),path=require('path');
const K=require(path.join(process.cwd(),'kingdom-wars/kingdom-wars-core.js'));
assert.ok(/^1\.(4|5)\./.test(K.VERSION),'V10 damage/repair regression expects V1.4+ core');
const b=K.defaultBuildings();b.keep=3;b.walls=3;b.watchtower=2;b.rangerTower=2;b.mageTower=1;b.creatureDen=1;b.petStable=1;b.lumberMill=3;b.quarry=3;b.essenceWell=2;
let h=K.defaultBuildingHealth(b);
for(const id of Object.keys(K.BUILDINGS)){if(b[id]>0){assert.equal(h[id].hp,h[id].maxHp);assert.equal(K.buildingHealthState(h[id]),'healthy')}}
const d=K.applyBuildingDamage(b,h,{keep:75,walls:9999,mageTower:50});h=d.health;assert.ok(h.keep.hp<h.keep.maxHp);assert.equal(h.walls.hp,0);assert.equal(K.buildingHealthState(h.walls),'destroyed');
const res={timber:5000,stone:5000,essence:5000},r=K.applyRepair(b,h,res,'walls',1000,2000);assert.ok(r.ok);assert.equal(r.health.walls.hp,r.health.walls.maxHp);assert.equal(K.buildingHealthState(r.health.walls,1500),'repair');assert.equal(K.buildingHealthState(r.health.walls,4000),'healthy');
const t=K.testRaidDamage(b,K.defaultBuildingHealth(b),'v10-test',3);assert.equal(Object.keys(t.applied).length,3);assert.ok(Object.values(t.applied).every(x=>x.damage>0));
console.log('V10 damage & repair core: PASS');
