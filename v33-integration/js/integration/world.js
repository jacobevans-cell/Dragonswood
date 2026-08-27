(function(){
  'use strict';
  const Core=window.DWV33Core;
  if(!Core)throw new Error('DWV33Core must load before Student World.');

  const DEFAULT_SCHEDULE=Object.freeze({
    Monday:[['8:00','Morning Meeting'],['8:25','Math'],['9:30','ELA'],['10:15','Science'],['11:00','Lunch & Recess'],['12:00','Social Studies'],['1:30','Specials']],
    Tuesday:[['8:00','Morning Meeting'],['8:25','Math'],['9:30','ELA'],['10:15','Science'],['11:00','Lunch & Recess'],['12:00','Social Studies'],['1:30','Specials']],
    Wednesday:[['8:00','Morning Meeting'],['8:25','Math'],['9:30','ELA'],['10:15','Science'],['11:00','Lunch & Recess'],['12:00','Social Studies'],['1:30','Specials']],
    Thursday:[['8:00','Morning Meeting'],['8:25','Math'],['9:30','ELA'],['10:15','Science'],['11:00','Lunch & Recess'],['12:00','Social Studies'],['1:30','Specials']],
    Friday:[['8:00','Morning Meeting'],['8:25','Math'],['9:30','ELA'],['10:15','Science'],['11:00','Lunch & Recess'],['12:00','Social Studies'],['1:30','Specials']]
  });
  const ICONS=Object.freeze({meeting:'✓',math:'➗',ela:'📚',reading:'📚',science:'🔬',lunch:'🍎',recess:'🍎',social:'🏛️',specials:'🎨'});
  const number=value=>Number.isFinite(Number(value))?Number(value):0;
  const text=(value,fallback='')=>String(value??fallback).trim();
  const phoenixParts=(date=new Date())=>new Intl.DateTimeFormat('en-US',{timeZone:'America/Phoenix',weekday:'long',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).reduce((out,part)=>(out[part.type]=part.value,out),{});
  function weekKey(date=new Date()){const key=Core.phoenixDateKey(date),cursor=new Date(`${key}T12:00:00-07:00`),day=(cursor.getDay()+6)%7;cursor.setDate(cursor.getDate()-day);return Core.phoenixDateKey(cursor)}
  function iconFor(label){const key=text(label).toLowerCase();return Object.entries(ICONS).find(([term])=>key.includes(term))?.[1]||'✦'}
  function scheduleRows(config,date=new Date()){
    const day=phoenixParts(date).weekday||'Monday';
    const source=config?.days?.[day]||DEFAULT_SCHEDULE[day]||[];
    return source.map((row,index)=>{
      const item=Array.isArray(row)?{time:row[0],title:row[1],detail:row[2]}:row||{};
      const title=text(item.title||item.name||item.label,'Class block');
      return Object.freeze({id:text(item.id,`${day}-${index}`),time:text(item.time||item.start,'—'),end:text(item.end),title,detail:text(item.detail||item.subtitle||item.activity),icon:text(item.icon,iconFor(title))});
    });
  }
  function assignedJob(uid,config,jobWeek){
    const raw=config?.assignments?.[uid];
    const jobs=Array.isArray(config?.jobs)?config.jobs:[];
    const assignment=typeof raw==='string'?jobs.find(job=>job.id===raw):raw;
    if(!assignment&&!jobWeek)return null;
    const row=assignment||jobWeek||{};
    const checked=[...new Set((Array.isArray(jobWeek?.checkedDays)?jobWeek.checkedDays:[]).map(Number).filter(day=>day>=0&&day<=4))].sort((a,b)=>a-b);
    return Object.freeze({id:text(row.id||row.jobId),name:text(row.name||row.jobName,'Class Job'),icon:text(row.icon||row.jobIcon,'🧹'),description:text(row.description||row.instructions,'Help your class guild today.'),pay:number(row.pay),checkedDays:Object.freeze(checked),completedCount:checked.length,paid:jobWeek?.paid===true});
  }
  function upcomingEvents(rows,date=new Date()){
    const today=Core.phoenixDateKey(date);
    return Object.freeze((Array.isArray(rows)?rows:[]).map(row=>({id:text(row.id),title:text(row.title||row.name,'Class event'),icon:text(row.icon,'📅'),dateKey:text(row.dateKey||row.date),time:text(row.time||row.startTime),detail:text(row.detail||row.description)})).filter(row=>!row.dateKey||row.dateKey>=today).sort((a,b)=>`${a.dateKey} ${a.time}`.localeCompare(`${b.dateKey} ${b.time}`)).slice(0,3).map(Object.freeze));
  }
  function scoreDate(row){if(row?.dateKey)return text(row.dateKey);if(row?.createdAt?.seconds)return Core.phoenixDateKey(new Date(row.createdAt.seconds*1000));return ''}
  function scoreName(row){return text(row?.displayName||row?.playerName||row?.firstName||row?.studentName||(row?.studentEmail||'').split('@')[0].replace(/[._-]+/g,' '),'Player')}
  function leaderboard(scores,rewards,uid,date=new Date()){
    const monday=weekKey(date),players=new Map();
    for(const score of Array.isArray(scores)?scores:[]){
      if(scoreDate(score)<monday)continue;
      const studentId=text(score.uid||score.studentId||score.studentEmail||scoreName(score)).toLowerCase();
      const assignment=text(score.assignmentId||`${score.gameName||score.game||'Game'}:${score.day||''}:${score.session||score.activityName||''}`);
      const current=players.get(studentId)||{studentId,record:score,best:new Map()};
      const old=current.best.get(assignment);if(!old||number(score.score)>number(old.score))current.best.set(assignment,score);players.set(studentId,current);
    }
    const today=Core.phoenixDateKey(date);
    const rows=[...players.values()].map(player=>({studentId:player.studentId,name:scoreName(player.record),avatar:text(player.record.avatarEmoji,'🐉'),score:[...player.best.values()].reduce((sum,row)=>sum+number(row.score),0),activities:player.best.size,rewarded:(Array.isArray(rewards)?rewards:[]).some(reward=>text(reward.studentId).toLowerCase()===player.studentId&&reward.dateKey===today)})).sort((a,b)=>b.score-a.score||b.activities-a.activities||a.name.localeCompare(b.name)).slice(0,10).map((row,index)=>Object.freeze({...row,rank:index+1,isYou:row.studentId===text(uid).toLowerCase()}));
    const you=rows.find(row=>row.isYou)||null;
    return Object.freeze({period:'weekly',weekKey:monday,rows:Object.freeze(rows),you});
  }
  function studentWorld(uid,profile,schedule,jobs,events,jobWeek,scores,rewards,bossLoot,prizes,date=new Date()){
    const parts=phoenixParts(date),dayIndex=['Monday','Tuesday','Wednesday','Thursday','Friday'].indexOf(parts.weekday);
    const ownedPets=Object.freeze(Array.isArray(profile?.ownedPets)?profile.ownedPets.map(String):[]);
    return Object.freeze({
      dateKey:Core.phoenixDateKey(date),weekKey:weekKey(date),dayName:parts.weekday||'Today',dayIndex,
      schedule:Object.freeze(scheduleRows(schedule,date)),job:assignedJob(uid,jobs,jobWeek),events:upcomingEvents(events,date),
      hall:Object.freeze({classId:text(profile?.classId),activePet:text(profile?.activePet),ownedPets,equipped:Object.freeze({...profile?.rpgEquipped}),inventory:Object.freeze(Array.isArray(profile?.rpgInventory)?profile.rpgInventory.map(String):[]),eggs:number(profile?.eggInventory),petTokens:number(profile?.petTokens)}),
      boss:Object.freeze({lastLoot:(Array.isArray(bossLoot)?bossLoot:[]).slice().sort((a,b)=>text(b.dateKey).localeCompare(text(a.dateKey)))[0]||null,prizes:Object.freeze(Array.isArray(prizes)?prizes.map(row=>Object.freeze({...row})):[])}),
      leaderboard:leaderboard(scores,rewards,uid,date)
    });
  }
  window.DWV33World=Object.freeze({version:'student-world-1',weekKey,scheduleRows,assignedJob,upcomingEvents,leaderboard,studentWorld});
})();
