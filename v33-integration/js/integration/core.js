(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.DWV33Core=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const XP_THRESHOLDS=Object.freeze([0,200,450,750,1100,1500,1950,2450,3000,3600,4250,4950,5700,6500,7350,8250,9200,10200,11100,12000]);
  const CLASS_LABELS=Object.freeze({warrior:'Warrior',ranger:'Ranger',mage:'Mage',healer:'Healer'});
  const STUDENT_DOMAIN='explore.academy';
  const TEACHER_EMAIL='jacobicusjax@gmail.com';
  const TITLE_RULES=Object.freeze({
    princess:['Princess','before'],prince:['Prince','before'],queen:['Queen','before'],king:['King','before'],witch:['Witch','before'],
    wizard:['Wizard','before'],knight:['Knight','before'],ranger:['Ranger','before'],captain:['Captain','before'],
    dragonslayer:['Dragonslayer','afterThe'],brave:['Brave','afterThe'],fearless:['Fearless','afterThe'],dragonkeeper:['Dragon Keeper','afterThe'],
    stormcaller:['Stormcaller','afterThe'],phoenixrider:['Phoenix Rider','afterThe'],shadowwalker:['Shadow Walker','afterThe'],dragonwood:['of Dragonswood','afterDirect']
  });

  const text=v=>String(v??'').trim();
  const finite=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
  const firstNameFromUser=user=>text(user?.displayName||user?.email?.split('@')[0]||'').split(/\s+/)[0]||'Adventurer';


  function normalizedEmail(value){return text(value).toLowerCase()}
  function isTeacherEmail(email){return normalizedEmail(email)===TEACHER_EMAIL}
  function isExploreEmail(email){const e=normalizedEmail(email);return !!e&&e.endsWith('@'+STUDENT_DOMAIN)}
  function isStudentEligibleEmail(email,testerExists=false){return isExploreEmail(email)||isTeacherEmail(email)||testerExists===true}

  function levelInfo(xp){
    xp=Math.max(0,finite(xp));
    let level=1;
    for(let i=0;i<XP_THRESHOLDS.length;i++)if(xp>=XP_THRESHOLDS[i])level=i+1;
    level=Math.min(20,level);
    const cur=XP_THRESHOLDS[level-1]||0;
    const next=level>=20?cur:XP_THRESHOLDS[level];
    const pct=level>=20?100:Math.max(0,Math.min(100,(xp-cur)/(next-cur)*100));
    return {level,cur,next,pct};
  }

  function formatDisplayName(profile={},user={}){
    const first=text(profile.firstName)||firstNameFromUser(user);
    const rule=TITLE_RULES[text(profile.title).toLowerCase()];
    if(!rule)return first;
    const [label,position]=rule;
    if(position==='before')return `${label} ${first}`;
    if(position==='afterThe')return `${first} the ${label}`;
    return `${first} ${label}`;
  }

  function humanizeId(value){
    let s=text(value).replace(/^pet[-_]/i,'').replace(/[-_]+/g,' ').trim();
    return s?s.replace(/\b\w/g,c=>c.toUpperCase()):'No active pet';
  }

  function phoenixDateKey(date=new Date()){
    return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Phoenix',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
  }

  function shiftDateKey(key,delta){
    const m=String(key).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!m)return '';
    const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3]+delta));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
  }
  function weekday(key){
    const m=String(key).match(/^(\d{4})-(\d{2})-(\d{2})$/); if(!m)return -1;
    return new Date(Date.UTC(+m[1],+m[2]-1,+m[3])).getUTCDay();
  }
  function previousSchoolDayKey(key){
    let k=shiftDateKey(key,-1);
    while(k&&(weekday(k)===0||weekday(k)===6))k=shiftDateKey(k,-1);
    return k;
  }
  function schoolAnchor(key){
    let k=key;
    while(k&&(weekday(k)===0||weekday(k)===6))k=shiftDateKey(k,-1);
    return k;
  }

  // Production does not persist a dedicated "streak" field. V3.3 therefore
  // derives its visual streak from production's authoritative completed Morning
  // Quest dates. This is display-only and never creates a new write contract.
  function completedMorningDates(rows=[]){
    const out=new Set();
    for(const row of rows){
      if(!String(row?.id||'').endsWith('_v48'))continue;
      if(row?.status==='complete'&&row?.session==='morning'&&row?.dateKey)out.add(String(row.dateKey));
    }
    return out;
  }
  function schoolDayStreak(rows=[],now=new Date()){
    const completed=completedMorningDates(rows);
    if(!completed.size)return 0;
    let key=schoolAnchor(phoenixDateKey(now));
    // Do not erase yesterday's streak before today's Morning Quest is finished.
    if(key&&!completed.has(key))key=previousSchoolDayKey(key);
    let count=0;
    while(key&&completed.has(key)&&count<180){count++;key=previousSchoolDayKey(key)}
    return count;
  }

  function dailyAccessState(rows=[],override={},uid='',tester=false,now=new Date()){
    const dateKey=phoenixDateKey(now);
    const morningComplete=completedMorningDates(rows).has(dateKey);
    const overrideToday=text(override?.dateKey)===dateKey&&(
      override?.all===true||(Array.isArray(override?.studentIds)&&override.studentIds.map(text).includes(text(uid)))
    );
    return {dateKey,morningComplete,overrideToday,unlocked:morningComplete||overrideToday||tester===true};
  }

  function normalizeStudent(user,profile,dailyRows=[],dailyOverride={},tester=false,now=new Date()){
    const p=profile||{};
    const xp=Math.max(0,finite(p.xp));
    const li=levelInfo(xp);
    const first=text(p.firstName)||firstNameFromUser(user);
    const classId=text(p.classId).toLowerCase();
    const activePet=text(p.activePet);
    const access=dailyAccessState(dailyRows,dailyOverride,user?.uid,tester,now);
    return {
      uid:text(user?.uid),email:text(user?.email),firstName:first,initial:(first[0]||'A').toUpperCase(),displayName:formatDisplayName(p,user),
      grade:text(p.grade)||'—',genderGroup:text(p.genderGroup),
      hp:Math.max(0,finite(p.hp)),gold:Math.max(0,finite(p.gold)),xp,
      level:li.level,xpFloor:li.cur,xpNext:li.next,xpPct:Math.round(li.pct),
      streak:schoolDayStreak(dailyRows),classId,classLabel:CLASS_LABELS[classId]||'Unchosen',
      activePet,petName:humanizeId(activePet),
      inventory:Array.isArray(p.rpgInventory)?[...p.rpgInventory]:[],equipped:p.rpgEquipped&&typeof p.rpgEquipped==='object'?{...p.rpgEquipped}:{},
      title:text(p.title),narrationVoice:text(p.narrationVoice),profileMissing:!profile,
      morningWorkComplete:access.morningComplete,dailyAccessOverride:access.overrideToday,dailyAccessUnlocked:access.unlocked
    };
  }

  function normalizeTeacherRoster(rows=[]){
    return rows.map(row=>{
      const name=text(row.firstName||row.displayName)||`Scholar ${text(row.id).slice(0,5)}`;
      const grade=text(row.grade)||'—';
      const group=text(row.genderGroup);
      const groupLabel=group?`${group[0].toUpperCase()}${group.slice(1)}`:'Unassigned';
      return {id:text(row.id),name,grade,genderGroup:group,meta:`Grade ${grade} • ${groupLabel}`};
    }).filter(x=>x.id).sort((a,b)=>a.name.localeCompare(b.name));
  }



  return Object.freeze({XP_THRESHOLDS,CLASS_LABELS,TITLE_RULES,STUDENT_DOMAIN,TEACHER_EMAIL,normalizedEmail,isTeacherEmail,isExploreEmail,isStudentEligibleEmail,levelInfo,formatDisplayName,humanizeId,phoenixDateKey,previousSchoolDayKey,completedMorningDates,schoolDayStreak,dailyAccessState,normalizeStudent,normalizeTeacherRoster});
});
