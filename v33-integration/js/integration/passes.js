(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.DWV33Passes=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const TYPES=Object.freeze({
    bathroom:Object.freeze({type:'bathroom',label:'Bathroom',icon:'🚻',statusCollection:'bathroomStatus',requestCollection:'bathroomRequests',automatic:3}),
    snack:Object.freeze({type:'snack',label:'Snack',icon:'🍎',statusCollection:'snackStatus',requestCollection:'snackRequests',automatic:2}),
    outOfSeat:Object.freeze({type:'outOfSeat',label:'Out of Seat',icon:'🚶',statusCollection:'passStatus',requestCollection:'passRequests',automatic:1}),
    office:Object.freeze({type:'office',label:'Emergency Office',icon:'🏥',statusCollection:'passStatus',requestCollection:'passRequests',automatic:1})
  });
  const PASS_LIMIT_MS=5*60*1000;
  const OVERDUE_REPEAT_MS=2*60*1000;

  function definition(type){return TYPES[String(type||'')]||null}
  function statusId(type,uid){return type==='bathroom'||type==='snack'?uid:`${uid}_${type}`}
  function requestId(type,uid,dateKey){return type==='bathroom'||type==='snack'?`${uid}_${dateKey}`:`${uid}_${type}_${dateKey}`}
  function bathroomGroup(profile={}){return profile.genderGroup==='girl'||profile.genderGroup==='girls'?'girl':'boy'}
  function sameDay(row,dateKey){return row&&row.dateKey===dateKey}
  function timestampMs(value){
    if(Number.isFinite(Number(value)))return Number(value);
    if(typeof value?.toMillis==='function')return Number(value.toMillis())||0;
    const parsed=Date.parse(String(value||''));return Number.isFinite(parsed)?parsed:0;
  }
  function activeVisit(row={}){
    const id=String(row.activeVisitId||'');
    return (Array.isArray(row.visits)?row.visits:[]).find(visit=>String(visit?.id||'')===id)||{};
  }
  function passStartMs(row={}){
    const visit=activeVisit(row);
    return timestampMs(visit.startedMs||visit.leftMs||visit.startedAt||visit.leftAt||row.startedMs||row.leftMs||row.startedAt||row.leftAt);
  }
  function passTiming(startMs,nowMs=Date.now()){
    const start=timestampMs(startMs),now=Number(nowMs)||Date.now(),elapsedMs=start?Math.max(0,now-start):0,remainingMs=Math.max(0,PASS_LIMIT_MS-elapsedMs),overdueMs=Math.max(0,elapsedMs-PASS_LIMIT_MS),overdue=elapsedMs>=PASS_LIMIT_MS;
    return Object.freeze({startMs:start,elapsedMs,remainingMs,overdueMs,overdue,alertBucket:overdue?Math.floor(overdueMs/OVERDUE_REPEAT_MS):-1});
  }

  function studentPasses(uid,dateKey,input={}){
    const statuses=input.statuses||{},requests=input.requests||{},slots=input.slots||{};
    const pending=Object.entries(requests).find(([,row])=>row?.status==='pending')||null;
    const group=bathroomGroup(input.profile||{}),slot=slots[group]||{};
    const blackout=input.blackout?.active===true;
    const rows={};
    for(const [type,def] of Object.entries(TYPES)){
      const row=sameDay(statuses[type],dateKey)?statuses[type]:{};
      const used=Math.max(0,Number(row.passesUsed)||0),credits=Math.max(0,Number(row.approvalCredits)||0);
      const active=row.active===true;
      const slotBlocked=type==='bathroom'&&sameDay(slot,dateKey)&&slot.occupied===true&&slot.studentId!==uid;
      let action='request',message=`Your ${def.automatic} automatic ${def.label.toLowerCase()} pass${def.automatic===1?'':'es'} have been used today.`;
      if(active){action='return';message=`${def.label} pass active. Tap when you are back.`}
      else if(blackout){action='blocked';message=`${def.label} passes are paused by your teacher right now.`}
      else if(slotBlocked){action='blocked';message=`${slot.studentName||'Another scholar'} is using the ${group==='girl'?'Girls':'Boys'} bathroom pass. Your pass will not be used.`}
      else if(pending){action='pending';message=`Your ${definition(pending[0])?.label||'extra pass'} request is waiting for teacher review.`}
      else if(used<def.automatic||credits>0){action='start';message=credits>0&&used>=def.automatic?`${credits} teacher-approved extra pass${credits===1?'':'es'} available.`:`${Math.max(0,def.automatic-used)} of ${def.automatic} automatic pass${def.automatic===1?'':'es'} remaining today.`}
      rows[type]=Object.freeze({type,label:def.label,icon:def.icon,automatic:def.automatic,used,credits,active,action,message,requestPending:requests[type]?.status==='pending',blocking:type==='bathroom'||type==='office',startedMs:active?passStartMs(row):0});
    }
    return Object.freeze({dateKey,group,blackout,pendingType:pending?.[0]||'',rows:Object.freeze(rows)});
  }

  return Object.freeze({TYPES,PASS_LIMIT_MS,OVERDUE_REPEAT_MS,definition,statusId,requestId,bathroomGroup,timestampMs,passStartMs,passTiming,studentPasses});
});
