#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const ROOT=process.cwd();
const K=require(path.join(ROOT,'kingdom-wars/kingdom-wars-core.js'));

(async()=>{
  const state=await import(pathToFileURL(path.join(ROOT,'kingdom-wars/kingdom-wars-state.mjs')));
  const access=await import(pathToFileURL(path.join(ROOT,'kingdom-wars/kingdom-wars-test-access.mjs')));
  const palette=await import(pathToFileURL(path.join(ROOT,'kingdom-wars/kingdom-palette-engine.mjs')));
  const base=K.defaultKingdomPrivate(),buildings={...base.buildings,keep:5,walls:5,watchtower:4,rangerTower:3,mageTower:2,creatureDen:2,petStable:2,lumberMill:5,quarry:5,essenceWell:4};
  const legacy=state.normalizePersistedPrivate(K,base,{timber:-5000,stone:1e308,essence:'bad',buildings});
  assert.equal(legacy.timber,0);assert.equal(legacy.stone,Number.MAX_SAFE_INTEGER);assert.equal(legacy.essence,base.essence);
  for(const id of Object.keys(K.BUILDINGS))assert.equal(legacy.buildingHealth[id].hp,legacy.buildingHealth[id].maxHp,`${id} legacy row must be healthy`);
  const partial=state.normalizePersistedPrivate(K,base,{buildings,buildingHealth:{keep:{hp:9,maxHp:999,repairingUntil:-10}}});
  assert.equal(partial.buildingHealth.keep.hp,9);assert.equal(partial.buildingHealth.keep.repairingUntil,0);assert.equal(partial.buildingHealth.walls.hp,partial.buildingHealth.walls.maxHp);
  const hostile=state.normalizePersistedPublic({kingdomStyle:'dragon',kingdomPalette:'royal',kingdomCustomPalette:{primary:'#1769d2',secondary:'#f4c85a',glow:'#54d9ff'}},{kingdomStyle:'../../bad',kingdomCustomPalette:{primary:'red; background:url(x)',secondary:'#ABCDEF',glow:'nope'}});
  assert.equal(hostile.kingdomStyle,'dragon');assert.equal(hostile.kingdomCustomPalette.primary,'#1769d2');assert.equal(hostile.kingdomCustomPalette.secondary,'#ABCDEF');assert.equal(hostile.kingdomCustomPalette.glow,'#54d9ff');
  assert.equal(state.ticketIsValid('t',['d'],'t','d',2000,1999),true);
  assert.equal(state.ticketIsValid('t',['d'],'t','d',2000,2001),false);
  assert.equal(state.ticketIsValid('t',['d'],'wrong','d',2000,1000),false);
  const producing={...base,lastResourceClaim:1000,buildings:{...base.buildings,lumberMill:2,quarry:2,essenceWell:2}};
  const accrued=state.accrueProduction(K,producing,3601000).privateState;
  assert.ok(accrued.timber>producing.timber&&accrued.stone>producing.stone&&accrued.essence>producing.essence,'opponents must accrue production');

  assert.deepEqual(access.authorizeKingdomTester({email:'outsider@gmail.com',student:{firstName:'Outsider'}}),{allowed:false,reason:'not-authorized'});
  assert.equal(access.authorizeKingdomTester({email:'outsider@gmail.com',testerAccountExists:true}).allowed,true);
  assert.equal(access.authorizeKingdomTester({email:'student@explore.academy',student:{role:'tester'}}).allowed,true);
  assert.equal(access.authorizeKingdomTester({email:'jacobicusjax@gmail.com'}).allowed,true);
  assert.deepEqual(palette.PALETTE_CACHE_LIMITS,{results:40,images:64});

  const app=fs.readFileSync(path.join(ROOT,'kingdom-wars/kingdom-wars-test-app.mjs'),'utf8'),accessSource=fs.readFileSync(path.join(ROOT,'kingdom-wars/kingdom-wars-test-access.mjs'),'utf8'),css=fs.readFileSync(path.join(ROOT,'kingdom-wars/kingdom-wars.css'),'utf8');
  assert.ok(!accessSource.includes("!email.endsWith('@explore.academy')"),'fail-open domain rule must stay removed');
  for(const token of ['SAVE_VERSION','ticketIsValid','runUiAction','matchTicketExpiresAt','battleAudioContext','normalizePersistedPrivate'])assert.ok(app.includes(token),`app missing ${token}`);
  assert.ok(css.includes('.kw-page-hidden .hp-bar.burning i'));
  assert.ok(css.includes('@media(prefers-reduced-motion:reduce){.hp-bar.burning i'));
  console.log('V11.1 adversarial persistence/access/runtime: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
