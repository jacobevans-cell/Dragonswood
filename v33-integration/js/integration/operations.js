(function(){
  'use strict';
  const Core=window.DWV33Core;
  const World=window.DWV33World;
  if(!Core||!World)throw new Error('DWV33Core and DWV33World must load before Teacher Operations.');

  const REQUEST_TYPES=Object.freeze({
    bathroomRequests:Object.freeze({kind:'Bathroom',type:'bathroom',statusCollection:'bathroomStatus'}),
    snackRequests:Object.freeze({kind:'Snack',type:'snack',statusCollection:'snackStatus'}),
    passRequests:Object.freeze({kind:'Out of Seat',type:'outOfSeat',statusCollection:'passStatus'})
  });
  const STATUS_TYPES=Object.freeze({
    bathroomStatus:Object.freeze({kind:'Bathroom',type:'bathroom'}),
    snackStatus:Object.freeze({kind:'Snack',type:'snack'}),
    passStatus:Object.freeze({kind:'Out of Seat',type:'outOfSeat'})
  });
  const text=(value,fallback='')=>String(value??fallback).trim();
  const number=value=>Number.isFinite(Number(value))?Number(value):0;
  function timestamp(value){
    if(value?.seconds)return Number(value.seconds)*1000;
    if(typeof value?.toMillis==='function')return value.toMillis();
    const parsed=Date.parse(value||'');
    return Number.isFinite(parsed)?parsed:0;
  }
  function requestKind(collection,row){
    const base=REQUEST_TYPES[collection]||{};
    const type=text(row?.type,base.type);
    if(type==='office')return 'Office';
    if(type==='outOfSeat')return 'Out of Seat';
    return base.kind||'Pass';
  }
  function elapsed(row,now=new Date()){
    const ms=timestamp(row?.createdAt||row?.requestedAt||row?.updatedAt);
    if(!ms)return 'now';
    const minutes=Math.max(0,Math.floor((now.getTime()-ms)/60000));
    return minutes<1?'now':minutes===1?'1 min ago':`${minutes} min ago`;
  }
  function pendingPasses(groups,date=new Date()){
    const today=Core.phoenixDateKey(date),byStudent=new Map();
    for(const [collection,rows] of Object.entries(groups||{})){
      if(!REQUEST_TYPES[collection])continue;
      for(const row of Array.isArray(rows)?rows:[]){
        if(row?.status!=='pending'||text(row.dateKey)!==today)continue;
        const studentId=text(row.studentId||row.uid);
        if(!studentId)continue;
        const item={id:text(row.id),collection,studentId,name:text(row.studentName||row.displayName,'Student'),kind:requestKind(collection,row),type:text(row.type,REQUEST_TYPES[collection].type),time:elapsed(row,date),createdMs:timestamp(row.createdAt||row.requestedAt||row.updatedAt)};
        const prior=byStudent.get(studentId);
        if(!prior||item.createdMs>=prior.createdMs)byStudent.set(studentId,item);
      }
    }
    return Object.freeze([...byStudent.values()].sort((a,b)=>a.createdMs-b.createdMs||a.name.localeCompare(b.name)).map(Object.freeze));
  }
  function activePasses(groups,date=new Date()){
    const today=Core.phoenixDateKey(date),rows=[];
    for(const [collection,items] of Object.entries(groups||{})){
      const base=STATUS_TYPES[collection];if(!base)continue;
      for(const row of Array.isArray(items)?items:[]){
        if(row?.active!==true||text(row.dateKey)!==today)continue;
        const type=text(row.type,base.type),kind=type==='office'?'Office':type==='outOfSeat'?'Out of Seat':base.kind;
        rows.push(Object.freeze({id:text(row.id),collection,studentId:text(row.studentId||row.id),name:text(row.studentName||row.displayName,'Student'),kind,type,time:text(row.startedAtText||row.leftAtText,'just now'),startedMs:number(row.startedMs||row.leftMs)}));
      }
    }
    return Object.freeze(rows.sort((a,b)=>a.startedMs-b.startedMs||a.name.localeCompare(b.name)));
  }
  function recognitionRequests(rows,date=new Date()){
    const today=Core.phoenixDateKey(date),byStudent=new Map();
    for(const row of Array.isArray(rows)?rows:[]){
      if(row?.status!=='pending'||(row.dateKey&&text(row.dateKey)!==today))continue;
      const studentId=text(row.studentId);if(!studentId)continue;
      const item={id:text(row.id),studentId,name:text(row.studentName||row.displayName,'Student'),reason:text(row.reason,'Positive choice'),time:elapsed(row,date),createdMs:timestamp(row.createdAt||row.updatedAt)};
      const prior=byStudent.get(studentId);if(!prior||item.createdMs>=prior.createdMs)byStudent.set(studentId,item);
    }
    return Object.freeze([...byStudent.values()].sort((a,b)=>a.createdMs-b.createdMs).map(Object.freeze));
  }
  function returnedToday(rows,date=new Date()){
    const today=Core.phoenixDateKey(date);
    return (Array.isArray(rows)?rows:[]).filter(row=>text(row.dateKey)===today&&['returned','done','closed'].includes(text(row.status).toLowerCase())).length;
  }
  function goals(data={}){
    const goal=(id,title,icon,fallbackGoal)=>{const row=data[id]||{},points=Math.max(0,number(row.points)),target=Math.max(1,number(row.goal)||fallbackGoal);return Object.freeze({id,title,icon,points,goal:target,pct:Math.min(100,Math.round(points/target*100))})};
    return Object.freeze({shared:Math.max(0,number(data.main?.points)),universal:Math.max(0,number(data.universalPoints?.points)),rows:Object.freeze([goal('secondRecess','Second Recess','🌤️',10),goal('classPet','Class Pet','🐾',250),goal('fieldTrip','Field Trip','🚌',750)])});
  }
  function jobsModel(students,config,jobWeeks,date=new Date()){
    const weekKey=World.weekKey(date),studentMap=new Map((students||[]).map(row=>[row.id,row]));
    const jobs=Array.isArray(config?.jobs)?config.jobs:[],assignments=config?.assignments||{},weekMap=new Map((jobWeeks||[]).filter(row=>text(row.weekKey)===weekKey).map(row=>[text(row.studentId),row]));
    const rows=jobs.map((job,index)=>{
      const pair=Object.entries(assignments).find(([,raw])=>text(typeof raw==='string'?raw:raw?.id||raw?.jobId)===text(job.id));
      const studentId=text(pair?.[0]),student=studentMap.get(studentId),week=weekMap.get(studentId)||{},pay=Math.max(0,number((typeof pair?.[1]==='object'?pair[1]?.pay:0)||job.pay));
      return Object.freeze({id:text(job.id,`job-${index}`),name:text(job.name,'Guild Job'),icon:text(job.icon,'🧹'),description:text(job.description||job.instructions),pay,studentId,studentName:text(student?.name||week.studentName,'Unassigned'),completedCount:Math.max(0,number(week.completedCount)),paid:week.paid===true,weekId:text(week.id,`${studentId}_${weekKey}`)});
    });
    const payroll=rows.filter(row=>row.studentId&&row.completedCount>=4&&!row.paid).map(Object.freeze);
    return Object.freeze({weekKey,rows:Object.freeze(rows),filled:rows.filter(row=>row.studentId).length,completed:rows.reduce((sum,row)=>sum+row.completedCount,0),needsCheckIn:rows.filter(row=>row.studentId&&row.completedCount<4).length,payroll:Object.freeze(payroll),payrollTotal:payroll.reduce((sum,row)=>sum+row.pay,0)});
  }
  function scheduleModel(config,events,date=new Date()){
    const today=World.scheduleRows(config,date),tomorrow=new Date(date.getTime()+86400000);
    return Object.freeze({today:Object.freeze(today),tomorrow:Object.freeze(World.scheduleRows(config,tomorrow)),events:World.upcomingEvents(events,date)});
  }
  function teacherLeaderboard(scores,rewards,date=new Date()){
    const board=World.leaderboard(scores,rewards,'',date),source=Array.isArray(scores)?scores:[];
    const rows=board.rows.map(row=>{const match=source.find(score=>text(score.studentId||score.uid||score.studentEmail).toLowerCase()===row.studentId);return Object.freeze({...row,studentId:text(match?.studentId||match?.uid||row.studentId)})});
    return Object.freeze({...board,rows:Object.freeze(rows)});
  }
  function teacherOperations(input={},date=new Date()){
    const pending=pendingPasses(input.requests,date),active=activePasses(input.statuses,date),recognition=recognitionRequests(input.pointRequests,date),overrides=(input.curriculumOverrides||[]).filter(row=>row.status==='pending');
    const students=Array.isArray(input.students)?input.students:[];
    return Object.freeze({dateKey:Core.phoenixDateKey(date),pending,active,returned:returnedToday(input.passHistory,date),recognition,curriculumOverrides:Object.freeze(overrides.map(row=>Object.freeze({...row}))),dailyUnlocked:input.dailyOverride?.all===true,classHp:students.reduce((sum,row)=>sum+Math.max(0,number(row.hp)),0),dailyXp:students.reduce((sum,row)=>sum+Math.max(0,number(row.dailyXpEarned)),0),goals:goals(input.classData),jobs:jobsModel(students,input.classJobs,input.jobWeeks,date),schedule:scheduleModel(input.classSchedule,input.calendarEvents,date),leaderboard:teacherLeaderboard(input.scores,input.leaderboardRewards,date)});
  }
  window.DWV33Operations=Object.freeze({version:'teacher-operations-1',REQUEST_TYPES,STATUS_TYPES,pendingPasses,activePasses,recognitionRequests,goals,jobsModel,scheduleModel,teacherLeaderboard,teacherOperations});
})();
