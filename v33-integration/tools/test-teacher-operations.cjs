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
const beforeThreshold=Ops.activePasses({bathroomStatus:[{id:'before',studentId:'before',studentName:'Before',dateKey:today,active:true,startedMs:now.getTime()-Ops.PASS_OVERDUE_MS+1}]},now)[0];
const afterThreshold=Ops.activePasses({bathroomStatus:[{id:'after',studentId:'after',studentName:'After',dateKey:today,active:true,startedMs:now.getTime()-Ops.PASS_OVERDUE_MS-1}]},now)[0];
assert.equal(beforeThreshold.overdue,false,'pass is not overdue immediately before five minutes');assert.equal(afterThreshold.overdue,true,'pass is overdue immediately after five minutes');
const overrideKey={studentId:'u1',lessonId:'math-1',questionPrompt:'Explain',studentAnswer:'Because',overrideType:'activity'};
const overrideQueue=Ops.curriculumOverrideRequests([{id:'old',status:'pending',...overrideKey,createdAt:{seconds:10}},{id:'new',status:'pending',...overrideKey,createdAt:{seconds:20}},{id:'resolved',status:'approved',...overrideKey,createdAt:{seconds:30}}]);
assert.equal(overrideQueue.length,1,'identical pending Curriculum reviews collapse to one queue item');
assert.equal(overrideQueue[0].id,'new','newest identical Curriculum review remains visible');
assert.deepEqual([...overrideQueue[0].duplicateIds],['old'],'duplicate review IDs remain available for atomic closure');
const operations=Ops.teacherOperations({
  students:[{id:'u1',name:'Fifth',hp:9,dailyXpEarned:12},{id:'u2',name:'Fourth',hp:10,dailyXpEarned:8}],
  requests:{bathroomRequests:[{id:'u1_'+today,studentId:'u1',studentName:'Fifth',dateKey:today,status:'pending'}]},statuses:{},
  pointRequests:[{id:'point-u2',studentId:'u2',studentName:'Fourth',dateKey:today,status:'pending',reason:'Helpful choice'}],passHistory:[{dateKey:today,status:'returned'}],bathroomSlots:[{id:'boy',occupied:true,studentId:'stale'}],passBlackout:{active:true,reason:'Testing'},curriculumOverrides:[{id:'override',status:'pending'}],dailyOverride:{all:false},
  activePoll:{id:'poll-1',active:true,question:'Choose one',choices:['A','B']},pollVotes:[{pollId:'poll-1',studentId:'u1',choiceIndex:0},{pollId:'poll-1',studentId:'u2',choiceIndex:1}],
  classData:{main:{points:64},universalPoints:{points:24},secondRecess:{points:8,goal:10},classPet:{points:172,goal:250},fieldTrip:{points:418,goal:750}},
  classJobs:{jobs:[{id:'floor',name:'Floor Captain',pay:5}],assignments:{u1:{id:'floor',name:'Floor Captain',pay:5}}},jobWeeks:[{id:'u1_2026-08-24',studentId:'u1',studentName:'Fifth',weekKey:'2026-08-24',completedCount:4,paid:false}],
  classSchedule:{days:{Wednesday:[{time:'8:25',title:'Live Math'}]}},calendarEvents:[{id:'legacy-showcase',title:'Legacy Showcase',startDate:'2026-08-29',endDate:'2026-08-30',startTime:'13:30',endTime:'14:30',category:'school',icon:'🧪'}],scores:[{studentId:'u1',displayName:'Fifth',assignmentId:'math',dateKey:today,score:92},{studentId:'u2',displayName:'Fourth',assignmentId:'older-math',dateKey:'2026-08-01',score:500}],leaderboardRewards:[]
},now);
assert.equal(operations.recognition.length,1);assert.equal(operations.curriculumOverrides.length,1);assert.equal(operations.returned,1);
assert.equal(operations.passHistory.length,1);assert.equal(operations.passBlackout.active,true);assert.equal(operations.needsAttention,1);
assert.equal(operations.poll.active,true);assert.deepEqual([...operations.poll.counts],[1,1]);assert.equal(operations.poll.total,2);
assert.equal(operations.goals.shared,64);assert.equal(operations.goals.universal,24);assert.equal(operations.goals.rows[0].pct,80);
assert.equal(operations.jobs.payrollTotal,5);assert.equal(operations.jobs.payroll.length,1);assert.equal(operations.schedule.today[0].title,'Live Math');
assert.equal(operations.schedule.calendarEvents[0].startDate,'2026-08-29');assert.equal(operations.schedule.calendarEvents[0].endDate,'2026-08-30');assert.equal(operations.schedule.calendarEvents[0].startTime,'13:30');
assert.equal(operations.leaderboard.rows[0].score,92);assert.equal(operations.leaderboard.rows.some(row=>row.studentId==='u2'),false,'older score is excluded from This Week');assert.equal(operations.leaderboardAllTime.rows.some(row=>row.studentId==='u2'),true,'older score appears in All Time');
const selectedAttention=Ops.attentionModel({id:'a1',active:true,dateKey:today,all:false,studentIds:['u1'],message:'Selected only'},[],[{id:'u1',name:'Fifth'},{id:'u2',name:'Fourth'}],now);
assert.equal(selectedAttention.active,true);assert.equal(selectedAttention.total,1);assert.deepEqual([...selectedAttention.waiting].map(row=>row.id),['u1']);
const nonTarget=Ops.attentionModel({id:'a1',active:true,dateKey:today,all:false,studentIds:['u1'],message:'Selected only'},[],[{id:'u2',name:'Fourth'}],now);
assert.equal(nonTarget.active,false,'selected attention must remain invisible to non-targeted students');
console.log('V3.3 Teacher Operations contracts: PASS (pass dedupe + overdue boundary + legacy calendar + weekly/all-time leaderboard)');
