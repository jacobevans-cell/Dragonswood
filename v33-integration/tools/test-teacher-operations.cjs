'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const Core=require('../js/integration/core.js');
function load(file,window){const source=fs.readFileSync(path.resolve(__dirname,file),'utf8');vm.runInNewContext(source,{window,Intl,Date,Object,Array,Map,Set,String,Number,Math},{filename:file})}
const window={DWV33Core:Core};
load('../js/integration/world.js',window);
load('../js/integration/operations.js',window);
const Ops=window.DWV33Operations;
const now=new Date('2026-08-26T18:00:00Z'),today='2026-08-26';
const pending=Ops.pendingPasses({
  bathroomRequests:[{id:'u1_'+today,studentId:'u1',studentName:'Fifth',dateKey:today,status:'pending',createdAt:{seconds:10}}],
  snackRequests:[{id:'legacy',studentId:'u1',studentName:'Fifth',dateKey:today,status:'pending',createdAt:{seconds:20}}],
  passRequests:[{id:'u2_office_'+today,studentId:'u2',studentName:'Fourth',dateKey:today,status:'pending',type:'office',createdAt:{seconds:15}}]
},now);
assert.equal(pending.length,2,'legacy cross-type duplicates collapse to one student request');
assert.equal(pending.find(row=>row.studentId==='u1').collection,'snackRequests','newest pending legacy record wins');
assert.equal(pending.find(row=>row.studentId==='u2').kind,'Office');
const active=Ops.activePasses({bathroomStatus:[{id:'u1',studentId:'u1',studentName:'Fifth',dateKey:today,active:true}],passStatus:[{id:'u2_office',studentId:'u2',studentName:'Fourth',dateKey:today,active:true,type:'office'}]},now);
assert.equal(active.length,2);assert.equal(active[1].kind,'Office');
const operations=Ops.teacherOperations({
  students:[{id:'u1',name:'Fifth',hp:9,dailyXpEarned:12},{id:'u2',name:'Fourth',hp:10,dailyXpEarned:8}],
  requests:{bathroomRequests:[{id:'u1_'+today,studentId:'u1',studentName:'Fifth',dateKey:today,status:'pending'}]},statuses:{},
  pointRequests:[{id:'point-u2',studentId:'u2',studentName:'Fourth',dateKey:today,status:'pending',reason:'Helpful choice'}],passHistory:[{dateKey:today,status:'returned'}],curriculumOverrides:[{id:'override',status:'pending'}],dailyOverride:{all:false},
  classData:{main:{points:64},universalPoints:{points:24},secondRecess:{points:8,goal:10},classPet:{points:172,goal:250},fieldTrip:{points:418,goal:750}},
  classJobs:{jobs:[{id:'floor',name:'Floor Captain',pay:5}],assignments:{u1:{id:'floor',name:'Floor Captain',pay:5}}},jobWeeks:[{id:'u1_2026-08-24',studentId:'u1',studentName:'Fifth',weekKey:'2026-08-24',completedCount:4,paid:false}],
  classSchedule:{days:{Wednesday:[{time:'8:25',title:'Live Math'}]}},calendarEvents:[{title:'Showcase',dateKey:'2026-08-29'}],scores:[{studentId:'u1',displayName:'Fifth',assignmentId:'math',dateKey:today,score:92}],leaderboardRewards:[]
},now);
assert.equal(operations.recognition.length,1);assert.equal(operations.curriculumOverrides.length,1);assert.equal(operations.returned,1);
assert.equal(operations.goals.shared,64);assert.equal(operations.goals.universal,24);assert.equal(operations.goals.rows[0].pct,80);
assert.equal(operations.jobs.payrollTotal,5);assert.equal(operations.jobs.payroll.length,1);assert.equal(operations.schedule.today[0].title,'Live Math');assert.equal(operations.leaderboard.rows[0].score,92);
console.log('V3.3 Teacher Operations contracts: PASS (pass dedupe + recognition + rewards + jobs + schedule + leaderboard)');
