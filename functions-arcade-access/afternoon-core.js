'use strict';

const manifest=require('./curriculum-manifest.js');

function text(value){return String(value??'').trim()}
function toMillis(value){
  if(value&&typeof value.toMillis==='function')return value.toMillis();
  if(value instanceof Date)return value.getTime();
  const n=Number(value);return Number.isFinite(n)?n:0;
}
function gradeCode(profile={}){
  const grade=Number(profile.grade);
  return grade===4?'I':grade===5?'K':'';
}
function modeName(config={}){
  const mode=text(config.mode);
  return mode==='afternoon'||mode==='arcade-free'?mode:'';
}
function activeMode(config={},dateKey='',now=Date.now()){
  return config.active===true&&Boolean(modeName(config))&&text(config.dateKey)===dateKey&&toMillis(config.expiresAt)>now;
}
function morningRow(rows=[],dateKey=''){
  return rows.find(row=>text(row.dateKey)===dateKey&&text(row.session)==='morning'&&text(row.status)==='complete'&&Number(row.day)>=3&&Number(row.day)<=40)||null;
}
function curriculumEvidenceComplete(requirement,row={}){
  if(!row||row.practiced!==true)return false;
  const seen=Number(row.questionsSeen),correct=Number(row.questionsCorrect);
  if(!Number.isFinite(seen)||!Number.isFinite(correct)||seen<0||correct!==seen)return false;
  if(requirement.videoRequired&&(row.watched!==true||seen<1))return false;
  return true;
}
function assess({mode={},profile={},dailyRows=[],curriculumRows=[],dateKey='',now=Date.now()}={}){
  const active=activeMode(mode,dateKey,now),currentMode=modeName(mode),arcadeForAll=active&&currentMode==='arcade-free',grade=gradeCode(profile),morning=morningRow(dailyRows,dateKey),day=Number(morning?.day)||0;
  const expected=grade&&day?manifest[grade]?.[day]||[]:[];
  const evidence=new Map(curriculumRows.map(row=>[text(row.itemId),row]));
  const completedIds=expected.filter(item=>curriculumEvidenceComplete(item,evidence.get(item.id))).map(item=>item.id);
  const morningComplete=Boolean(morning),curriculumComplete=expected.length>0&&completedIds.length===expected.length;
  return Object.freeze({
    active,eligible:arcadeForAll||(active&&morningComplete&&curriculumComplete),mode:currentMode,arcadeForAll,dateKey,grade,day,
    morningComplete,curriculumComplete,expectedCount:expected.length,completedCount:completedIds.length,
    missingIds:Object.freeze(expected.filter(item=>!completedIds.includes(item.id)).map(item=>item.id)),
    expiresAtMs:active?toMillis(mode.expiresAt):0
  });
}

module.exports=Object.freeze({text,toMillis,gradeCode,modeName,activeMode,morningRow,curriculumEvidenceComplete,assess});
