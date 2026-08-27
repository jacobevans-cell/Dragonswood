#!/usr/bin/env node
'use strict';
const assert=require('assert'),path=require('path');
const K=require(path.join(process.cwd(),'kingdom-wars/kingdom-wars-core.js'));
assert.equal(K.VERSION,'1.5.0-real-raids');
function kingdom(id,name,crowns=40){return {...K.defaultKingdomPublic(id,name),crowns,keepLevel:3,kingdomLevel:3,defenseStrategy:'fortify'}}
function priv(){const x={...K.defaultKingdomPrivate(),timber:900,stone:850,essence:500,buildings:{...K.defaultBuildings(),keep:3,walls:3,watchtower:2,rangerTower:2,mageTower:2,creatureDen:2,petStable:2,lumberMill:3,quarry:3,essenceWell:2}};x.buildingHealth=K.defaultBuildingHealth(x.buildings);return x}
const attackerStudent={classId:'mage',xp:2600,rpgInventory:['w','a','x'],rpgEquipped:{weapon:'w',armor:'a',accessory:'x'},ownedPets:['p'],activePet:'p'};
const defenderStudent={classId:'warrior',xp:100,rpgInventory:[],rpgEquipped:{},ownedPets:[],activePet:null};
let ap=priv(),dp=priv(),aPub=kingdom('a','Attacker',30),dPub=kingdom('d','Defender',75);
const before=JSON.parse(JSON.stringify(dp.buildingHealth));
const result=K.resolveRaid({attackerStudent,defenderStudent,attackerKingdom:aPub,defenderKingdom:dPub,attackerPrivate:ap,defenderPrivate:dp,strategy:'magic',seed:'v11-guaranteed',friendly:false});
assert.equal(result.victory,true,'Test setup should produce a successful ranked raid');
const planned=Object.keys(result.buildingDamage||{});assert.ok(planned.length>=2&&planned.length<=4,'Successful raid should target 2–4 buildings');
const applied=K.applyRankedResult(aPub,dPub,ap,dp,result);const damaged=Object.keys(applied.damageApplied||{});assert.deepEqual(damaged.sort(),planned.sort());
assert.ok(damaged.every(id=>applied.defenderPrivate.buildingHealth[id].hp<before[id].hp),'Targeted buildings must lose real HP');
assert.ok(K.RESOURCE_KEYS.some(r=>applied.attackerPrivate[r]>ap[r]),'Successful raid should transfer raid-only resources');
assert.ok(applied.attackerPublic.crowns>aPub.crowns,'Successful raid should add Crowns');
const healthyPower=K.powerSnapshot(defenderStudent,dp,dPub,'magic').defense;
const damagedPower=K.powerSnapshot(defenderStudent,applied.defenderPrivate,applied.defenderPublic,'magic').defense;
assert.ok(damagedPower<healthyPower,'Damaged defenses must reduce later defensive power');
const friendlyPriv=priv(),friendlyBefore=JSON.stringify(friendlyPriv.buildingHealth),friendly=K.resolveRaid({attackerStudent,defenderStudent,attackerKingdom:aPub,defenderKingdom:dPub,attackerPrivate:ap,defenderPrivate:friendlyPriv,strategy:'assault',seed:'v11-friendly',friendly:true});
assert.deepEqual(friendly.buildingDamage,{},'Friendly challenge must never plan permanent building damage');
assert.equal(JSON.stringify(friendlyPriv.buildingHealth),friendlyBefore,'Friendly challenge must not mutate defender HP');
console.log('V11 real raids core: PASS');
