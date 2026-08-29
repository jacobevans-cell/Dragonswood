#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=process.cwd(),styles=['dark','dragon','bright'],states=['healthy','damaged','destroyed'];
const families={
  keep:['keep-production/keeps','keep'],
  walls:['wave-a-production/assets','walls-gates'],
  watchtower:['wave-a-production/assets','watchtower'],
  rangerTower:['wave-a-production/assets','ranger-tower'],
  mageTower:['wave-a-production/assets','mage-tower'],
  creatureDen:['wave-bc-production/assets','creature-den'],
  petStable:['wave-bc-production/assets','pet-stable-hatchery'],
  lumberMill:['wave-bc-production/assets','lumber-mill'],
  quarry:['wave-bc-production/assets','quarry'],
  essenceWell:['wave-bc-production/assets','essence-well']
};
const requested=new Set();
for(const [id,[tree,family]] of Object.entries(families))for(const style of styles)for(let level=1;level<=5;level++){
  const root=path.join(ROOT,'kingdom-wars',tree,id==='keep'?style:family,id==='keep'?`level-${level}`:style, ...(id==='keep'?[]:[`level-${level}`]));
  for(const state of states)requested.add(path.join(root,`${state}.webp`));
  for(const mask of ['primary','secondary','glow'])requested.add(path.join(root,`mask-${mask}.png`));
}
requested.add(path.join(ROOT,'kingdom-wars/keep-production/effects/fire.gif'));
requested.add(path.join(ROOT,'kingdom-wars/keep-production/effects/repair.gif'));
for(const file of requested)assert.ok(fs.existsSync(file),`Missing live asset: ${path.relative(ROOT,file)}`);
assert.equal(requested.size,902,'live renderer should have exactly 902 unique asset requests');
console.log('Kingdom Wars live asset routing: PASS (902/902 files present)');
