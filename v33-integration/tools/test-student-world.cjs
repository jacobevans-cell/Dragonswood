'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const Core=require('../js/integration/core.js');
const source=fs.readFileSync(require('node:path').resolve(__dirname,'../js/integration/world.js'),'utf8');
const context={window:{DWV33Core:Core},Intl,Date,Object,Array,Map,Set,String,Number,Math};
vm.runInNewContext(source,context,{filename:'world.js'});
const World=context.window.DWV33World;
const now=new Date('2026-08-26T18:00:00Z');
assert.equal(World.weekKey(now),'2026-08-24');
const schedule=World.scheduleRows({days:{Wednesday:[{time:'8:25',title:'Live Math',detail:'Decimals'}]}},now);
assert.equal(schedule[0].title,'Live Math');
assert.equal(schedule[0].icon,'➗');
const job=World.assignedJob('u1',{assignments:{u1:{id:'floor',name:'Floor Captain',pay:50}}},{checkedDays:[0,2],paid:false});
assert.equal(job.name,'Floor Captain');
assert.deepEqual([...job.checkedDays],[0,2]);
const board=World.leaderboard([
  {studentId:'u1',displayName:'Fifth',assignmentId:'math',dateKey:'2026-08-26',score:92},
  {studentId:'u1',displayName:'Fifth',assignmentId:'math',dateKey:'2026-08-26',score:80},
  {studentId:'u2',displayName:'Fourth',assignmentId:'math',dateKey:'2026-08-26',score:75}
],[{studentId:'u1',dateKey:'2026-08-26'}],'u1',now);
assert.equal(board.rows.length,2);
assert.equal(board.rows[0].score,92,'only the best score per assignment counts');
assert.equal(board.rows[0].isYou,true);
assert.equal(board.rows[0].rewarded,true);
const world=World.studentWorld('u1',{classId:'mage',activePet:'pet-nyx',ownedPets:['pet-nyx'],rpgInventory:['wand'],rpgEquipped:{weapon:'wand'}},{days:{Wednesday:[['8:25','Math']]}},{assignments:{u1:{id:'floor',name:'Floor Captain'}}},[{title:'Showcase',dateKey:'2026-08-29'}],null,[],[],[],[],now);
assert.equal(world.dayName,'Wednesday');
assert.equal(world.hall.activePet,'pet-nyx');
assert.equal(world.events[0].title,'Showcase');
console.log('V3.3 Student World contracts: PASS (My Day + Hall + pets + boss + leaderboard)');
