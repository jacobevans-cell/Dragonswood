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
  const PASS_OVERDUE_MS=5*60*1000;
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
        const requestKey=`${studentId}|${item.type}`;
        const prior=byStudent.get(requestKey);
        if(!prior||item.createdMs>=prior.createdMs)byStudent.set(requestKey,item);
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
        const startedMs=number(row.startedMs||row.leftMs||timestamp(row.startedAt||row.leftAt));
        const elapsedMs=startedMs?Math.max(0,date.getTime()-startedMs):0;
        rows.push(Object.freeze({id:text(row.id),collection,studentId:text(row.studentId||row.id),name:text(row.studentName||row.displayName,'Student'),kind,type,time:text(row.startedAtText||row.leftAtText)||elapsed({createdAt:startedMs?new Date(startedMs).toISOString():null},date),startedMs,elapsedMinutes:Math.floor(elapsedMs/60000),overdue:!!startedMs&&elapsedMs>=PASS_OVERDUE_MS}));
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
    const history=row=>Object.freeze((Array.isArray(row?.history)?row.history:[]).slice(-100).reverse().map(item=>Object.freeze({...item})));
    const goal=(id,title,icon,fallbackGoal)=>{const row=data[id]||{},points=Math.max(0,number(row.points)),target=Math.max(1,number(row.goal)||fallbackGoal);return Object.freeze({id,title,icon,points,goal:target,pct:Math.min(100,Math.round(points/target*100)),history:history(row)})};
    return Object.freeze({shared:Math.max(0,number(data.main?.points)),sharedHistory:history(data.main),universal:Math.max(0,number(data.universalPoints?.points)),universalHistory:history(data.universalPoints),rows:Object.freeze([goal('secondRecess','Second Recess','🌤️',10),goal('classPet','Class Pet','🐾',250),goal('fieldTrip','Field Trip','🚌',750)])});
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
    return Object.freeze({today:Object.freeze(today),tomorrow:Object.freeze(World.scheduleRows(config,tomorrow)),events:World.upcomingEvents(events,date),calendarEvents:World.calendarEvents(events)});
  }
  function teacherLeaderboard(scores,rewards,date=new Date(),period='weekly'){
    const board=World.leaderboard(scores,rewards,'',date,period),source=Array.isArray(scores)?scores:[];
    const rows=board.rows.map(row=>{const match=source.find(score=>text(score.studentId||score.uid||score.studentEmail).toLowerCase()===row.studentId);return Object.freeze({...row,studentId:text(match?.studentId||match?.uid||row.studentId)})});
    return Object.freeze({...board,rows:Object.freeze(rows)});
  }
  function pollModel(activePoll={},votes=[],students=[]){
    const active=activePoll?.active===true&&text(activePoll.id),choices=Array.isArray(activePoll?.choices)?activePoll.choices.map(choice=>text(choice)).filter(Boolean).slice(0,6):[],matching=(Array.isArray(votes)?votes:[]).filter(row=>text(row.pollId)===text(activePoll.id));
    const studentNames=new Map((Array.isArray(students)?students:[]).map(student=>[text(student.id||student.studentId),text(student.name||student.firstName,'Scholar')]));
    const voteRows=choices.map((_,index)=>matching.filter(row=>number(row.choiceIndex)===index)),counts=voteRows.map(rows=>rows.length),voters=voteRows.map(rows=>Object.freeze(rows.map(row=>text(row.studentName)||studentNames.get(text(row.studentId))||'Unknown scholar').sort((a,b)=>a.localeCompare(b)))),total=counts.reduce((sum,value)=>sum+value,0);
    return Object.freeze({id:text(activePoll.id),active:!!active,question:text(activePoll.question),choices:Object.freeze(choices),counts:Object.freeze(counts),voters:Object.freeze(voters),total});
  }
  function datedFeatureAccess(config={},date=new Date()){
    const dateKey=Core.phoenixDateKey(date),studentIds=Array.isArray(config?.studentIds)?config.studentIds.map(text).filter(Boolean):[];
    return Object.freeze({dateKey,active:text(config?.dateKey)===dateKey,all:text(config?.dateKey)===dateKey&&config?.all===true,studentIds:Object.freeze(studentIds)});
  }
  function datedSubstituteMode(config={},date=new Date()){
    const dateKey=Core.phoenixDateKey(date),expiresAtMs=timestamp(config?.expiresAt),sameDay=text(config?.dateKey)===dateKey,notExpired=!expiresAtMs||expiresAtMs>date.getTime();
    const active=config?.active===true&&sameDay&&notExpired,rawMode=text(config?.mode),mode=rawMode==='afternoon'||rawMode==='arcade-free'?rawMode:'full-day';
    return Object.freeze({dateKey,active,mode,afternoon:active&&mode==='afternoon',arcadeFree:active&&mode==='arcade-free',reason:text(config?.reason,'Ask your substitute teacher if you need help or need to leave the room.'),expiresAtMs,remainingMs:active&&expiresAtMs?Math.max(0,expiresAtMs-date.getTime()):0});
  }
  function attentionModel(activeAttention={},events=[],students=[],date=new Date()){
    const dateKey=Core.phoenixDateKey(date),id=text(activeAttention?.id),active=activeAttention?.active===true&&text(activeAttention?.dateKey)===dateKey&&!!id;
    const rows=(Array.isArray(events)?events:[]).filter(row=>!row.dateKey||text(row.dateKey)===dateKey).slice().sort((a,b)=>timestamp(b.createdAt||b.updatedAt)-timestamp(a.createdAt||a.updatedAt)).slice(0,100);
    const acknowledged=new Set(rows.filter(row=>text(row.attentionId)===id&&text(row.type)==='acknowledged').map(row=>text(row.studentId)));
    const all=activeAttention?.all!==false,allowedIds=new Set(Array.isArray(activeAttention?.studentIds)?activeAttention.studentIds.map(text).filter(Boolean):[]),audience=all?(students||[]):(students||[]).filter(row=>allowedIds.has(text(row.id))),audienceActive=active&&(all||audience.length>0);
    return Object.freeze({
      id,active:audienceActive,title:text(activeAttention?.title,'Teacher Direction'),message:text(activeAttention?.message),destination:text(activeAttention?.destination,'missions'),
      all,studentIds:Object.freeze([...allowedIds]),
      requireAcknowledgment:activeAttention?.requireAcknowledgment!==false,createdAtMs:number(activeAttention?.createdAtMs),
      acknowledged:audience.filter(row=>acknowledged.has(text(row.id))).length,total:audience.length,
      waiting:Object.freeze(audience.filter(row=>!acknowledged.has(text(row.id))).map(row=>Object.freeze({id:text(row.id),name:text(row.name,'Scholar')}))),
      events:Object.freeze(rows.map(row=>Object.freeze({...row})))
    });
  }
  function teacherOperations(input={},date=new Date()){
    const pending=pendingPasses(input.requests,date),active=activePasses(input.statuses,date),recognition=recognitionRequests(input.pointRequests,date),overrides=(input.curriculumOverrides||[]).filter(row=>row.status==='pending');
    const students=Array.isArray(input.students)?input.students:[];
    const history=Object.freeze((Array.isArray(input.passHistory)?input.passHistory:[]).slice().sort((a,b)=>timestamp(b.returnedAt||b.updatedAt||b.createdAt)-timestamp(a.returnedAt||a.updatedAt||a.createdAt)).slice(0,100).map(row=>Object.freeze({...row})));
    const slots=Object.freeze((Array.isArray(input.bathroomSlots)?input.bathroomSlots:[]).map(row=>Object.freeze({...row})));
    const needsAttention=active.filter(row=>row.overdue).length+slots.filter(row=>row.occupied===true&&!active.some(pass=>pass.type==='bathroom'&&pass.studentId===text(row.studentId))).length;
    const transactions=Object.freeze((Array.isArray(input.transactions)?input.transactions:[]).slice().sort((a,b)=>timestamp(b.createdAt)-timestamp(a.createdAt)).slice(0,100).map(row=>Object.freeze({...row})));
    return Object.freeze({dateKey:Core.phoenixDateKey(date),pending,active,returned:returnedToday(input.passHistory,date),passHistory:history,bathroomSlots:slots,passBlackout:Object.freeze({...input.passBlackout}),substituteMode:datedSubstituteMode(input.substituteMode,date),needsAttention,recognition,curriculumOverrides:Object.freeze(overrides.map(row=>Object.freeze({...row}))),dailyUnlocked:input.dailyOverride?.all===true,classHp:students.reduce((sum,row)=>sum+Math.max(0,number(row.hp)),0),dailyXp:students.reduce((sum,row)=>sum+Math.max(0,number(row.dailyXpEarned)),0),transactions,goals:goals(input.classData),jobs:jobsModel(students,input.classJobs,input.jobWeeks,date),schedule:scheduleModel(input.classSchedule,input.calendarEvents,date),leaderboard:teacherLeaderboard(input.scores,input.leaderboardRewards,date,'weekly'),leaderboardAllTime:teacherLeaderboard(input.scores,input.leaderboardRewards,date,'all-time'),poll:pollModel(input.activePoll,input.pollVotes,students),kingdomAccess:datedFeatureAccess(input.kingdomAccess,date),attention:attentionModel(input.activeAttention,input.attentionEvents,students,date)});
  }
  window.DWV33Operations=Object.freeze({version:'teacher-operations-4',PASS_OVERDUE_MS,REQUEST_TYPES,STATUS_TYPES,pendingPasses,activePasses,recognitionRequests,goals,jobsModel,scheduleModel,teacherLeaderboard,pollModel,datedFeatureAccess,datedSubstituteMode,attentionModel,teacherOperations});
})();
