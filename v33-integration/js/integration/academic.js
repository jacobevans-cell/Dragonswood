(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.DWV33Academic=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const GAME_CATALOG=Object.freeze([
    ['decimal-deception','Math'],['math-operations','Math'],['fraction-forge','Math'],
    ['long-division','Math'],['long-division-custom','Math'],['spelling-practice','ELA'],
    ['witches-test','ELA'],['elemental-laboratory','Science'],['cosmic-architect','Science'],
    ['arcane-forge','Science'],['class-reader','ELA']
  ].map(([id,subject])=>Object.freeze({id,subject})));
  const GAME_IDS=new Set(GAME_CATALOG.map(game=>game.id));
  const text=value=>String(value??'').trim();
  const number=value=>Number.isFinite(Number(value))?Number(value):0;
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,number(value)));
  const mean=values=>values.length?values.reduce((sum,value)=>sum+number(value),0)/values.length:null;
  const round=value=>value===null?null:Math.round(value);
  const studentId=row=>text(row?.studentId||row?.uid||row?.studentUid);
  const dateKey=row=>text(row?.dateKey||row?.sessionDate);
  const validDateKey=value=>/^\d{4}-\d{2}-\d{2}$/.test(text(value));
  function normalizeReading(rows=[]){
    return rows.filter(row=>text(row?.bookId)==='witches'&&studentId(row)).map(row=>Object.freeze({
      id:text(row.id),studentId:studentId(row),dateKey:dateKey(row),
      activeSeconds:clamp(row.activeSeconds,0,8*60*60),legacyTargetMinutes:clamp(row.targetMinutes||20,1,180),
      firstPage:clamp(row.firstPage,1,999),lastPage:clamp(row.lastPage,1,999),
      pages:Array.isArray(row.pages)?row.pages.map(Number).filter(Number.isFinite).slice(0,120):[],
      updatedAt:row.updatedAt||null,
      integrityValid:text(row.id)===`${studentId(row)}_${dateKey(row)}_witches`&&validDateKey(dateKey(row))
    }));
  }
  function normalizeWeights(value={}){
    const daily=clamp(value.daily??value.dailyQuest??40,0,100);
    const curriculum=clamp(value.curriculum??value.curriculumQuest??40,0,100);
    const reading=clamp(value.reading??value.readingTests??20,0,100);
    return daily+curriculum+reading===100
      ?Object.freeze({daily,curriculum,reading})
      :Object.freeze({daily:40,curriculum:40,reading:20});
  }
  function normalizeReadingAssignments(value={}){
    const defaultTarget=clamp(value.readingTargetMinutes||20,1,180),targets={};
    if(value.readingTargetsByDate&&typeof value.readingTargetsByDate==='object'&&!Array.isArray(value.readingTargetsByDate)){
      for(const [day,target] of Object.entries(value.readingTargetsByDate))if(validDateKey(day))targets[day]=clamp(target||defaultTarget,1,180);
    }
    if(Array.isArray(value.readingAssignedDateKeys))for(const day of value.readingAssignedDateKeys.map(text))if(validDateKey(day)&&targets[day]===undefined)targets[day]=defaultTarget;
    const dateKeys=Object.keys(targets).sort();
    return Object.freeze({defaultTarget,dateKeys:Object.freeze(dateKeys),targetsByDate:Object.freeze({...targets})});
  }

  function writingMetrics(value){
    const responseText=String(value??'').slice(0,12000);
    const trimmed=responseText.trim();
    const sentences=trimmed?trimmed.split(/[.!?]+/).map(text).filter(Boolean):[];
    const paragraphs=trimmed?trimmed.split(/\n\s*\n/).map(text).filter(Boolean):[];
    return Object.freeze({
      responseText,
      wordCount:trimmed?trimmed.split(/\s+/).length:0,
      sentenceCount:sentences.length,
      paragraphCount:paragraphs.length,
      capitalizedSentenceStarts:sentences.filter(sentence=>/^[A-Z]/.test(sentence)).length,
      hasEndingPunctuation:/[.!?][\s"')\]]*$/.test(trimmed)
    });
  }

  function sessionResponseId(sessionId,uid){
    return `${text(sessionId).replace(/[^A-Za-z0-9_-]/g,'_')}_${text(uid).replace(/[^A-Za-z0-9_-]/g,'_')}`.slice(0,1400);
  }

  function normalizeSession(value={}){
    const status=text(value.status).toLowerCase();
    const id=text(value.sessionId||value.id);
    if(!id||status==='closed')return null;
    return Object.freeze({
      id,status:status||'active',title:text(value.title)||'Morning Quickwrite',
      mode:text(value.mode)||'Quickwrite',writingType:text(value.writingType)||'Narrative',
      targetSkill:text(value.targetSkill)||'Sensory Details',
      prompt:text(value.prompt)||'Describe a place that feels mysterious. Use at least three sensory details.',
      hints:Array.isArray(value.hints)?value.hints.map(text).filter(Boolean).slice(0,3):[],
      timeMinutes:clamp(value.timeMinutes||5,1,90),minWords:clamp(value.minWords||5,1,2000)
    });
  }

  function normalizeResponse(row={}){
    const metrics=writingMetrics(row.responseText);
    return Object.freeze({
      id:text(row.id),sessionId:text(row.sessionId),studentId:text(row.studentId),
      studentName:text(row.studentName)||'Scholar',status:text(row.status)||'draft',
      ...metrics,wordCount:Math.max(metrics.wordCount,number(row.wordCount)),
      aiStatus:text(row.aiStatus),aiFeedback:row.aiFeedback&&typeof row.aiFeedback==='object'?{...row.aiFeedback}:null,
      teacherScore:row.teacherScore===null||row.teacherScore===undefined?null:clamp(row.teacherScore,0,20),
      teacherFeedback:text(row.teacherFeedback),sessionTitle:text(row.sessionTitle),
      writingType:text(row.writingType),targetSkill:text(row.targetSkill),prompt:text(row.prompt)
    });
  }

  function writingPortfolio(rows=[]){
    const normalized=rows.map(normalizeResponse);
    const submitted=normalized.filter(row=>row.status==='submitted');
    const scores=submitted.map(row=>row.teacherScore??number(row.aiFeedback?.score)).filter(score=>score>0);
    const chronological=scores.slice(-2);
    return Object.freeze({count:submitted.length,average:round(mean(scores)),growth:chronological.length===2?chronological[1]-chronological[0]:0,responses:normalized});
  }

  function normalizeGameResults(rows=[]){
    return rows.filter(row=>GAME_IDS.has(text(row.gameId))&&text(row.status)==='complete').map(row=>Object.freeze({
      id:text(row.id),gameId:text(row.gameId),studentId:text(row.studentId),score:clamp(row.score,0,100),
      subject:text(row.subject)||GAME_CATALOG.find(game=>game.id===text(row.gameId))?.subject||'',
      xpAward:clamp(row.xpAward,0,12),goldAward:clamp(row.goldAward,0,3)
    }));
  }

  function studentAcademic(activeSession,responses=[],gameResults=[]){
    const session=normalizeSession(activeSession||{});
    const portfolio=writingPortfolio(responses);
    const current=session?portfolio.responses.find(row=>row.sessionId===session.id)||null:null;
    return Object.freeze({scribe:Object.freeze({session,current,portfolio}),games:normalizeGameResults(gameResults)});
  }

  function gradebook(roster=[],dailyRows=[],curriculumRows=[],readingRows=[],weightSettings={}){
    const weights=normalizeWeights(weightSettings);
    const readingRecords=normalizeReading(readingRows);
    const readingAssignments=normalizeReadingAssignments(weightSettings),assignedDates=readingAssignments.dateKeys,defaultTarget=readingAssignments.defaultTarget,targetsByDate=readingAssignments.targetsByDate;
    const rows=roster.map(student=>{
      const dailyRecords=dailyRows.filter(row=>studentId(row)===student.id);
      const curriculumRecords=curriculumRows.filter(row=>studentId(row)===student.id);
      const ownDaily=dailyRecords.filter(row=>text(row.status)==='complete').map(row=>clamp(row.score,0,100));
      const ownCurriculum=curriculumRecords.map(row=>row.accuracy??(number(row.questionsSeen)>0?number(row.questionsCorrect)/number(row.questionsSeen)*100:null)).filter(value=>value!==null);
      const readingAssigned=assignedDates.length>0;
      const allOwnReadingRows=readingRecords.filter(row=>row.studentId===student.id);
      const ownReadingRows=allOwnReadingRows.filter(row=>row.integrityValid&&assignedDates.includes(row.dateKey));
      const readingByDate=new Map(ownReadingRows.map(row=>[row.dateKey,row]));
      const readingScores=readingAssigned?assignedDates.map(day=>{const row=readingByDate.get(day),target=targetsByDate[day];return row?clamp(row.activeSeconds/(target*60)*100,0,100):0}):[];
      const daily=round(mean(ownDaily)),curriculum=round(mean(ownCurriculum)),reading=readingAssigned?round(mean(readingScores)):null;
      const dailyIncomplete=dailyRecords.filter(row=>text(row.status)!=='complete').length;
      const curriculumIncomplete=curriculumRecords.filter(row=>(row.accuracy===undefined&&number(row.questionsSeen)<=0)||text(row.status)==='in-progress').length;
      const readingIncomplete=readingAssigned?assignedDates.filter(day=>{const row=readingByDate.get(day);return !row||row.activeSeconds<targetsByDate[day]*60}).length:0;
      const readingEvidenceIssue=allOwnReadingRows.some(row=>assignedDates.includes(row.dateKey)&&!row.integrityValid);
      const missing=dailyIncomplete+curriculumIncomplete+readingIncomplete;
      const categories=[[daily,weights.daily],[curriculum,weights.curriculum],...(readingAssigned?[[reading,weights.reading]]:[])],activeWeight=categories.reduce((sum,[,weight])=>sum+weight,0);
      const total=activeWeight?Math.round(categories.reduce((sum,[value,weight])=>sum+(value??0)*weight,0)/activeWeight):0;
      const provisional=missing>0||readingEvidenceIssue||categories.some(([value])=>value===null),totalStatus=readingEvidenceIssue?'Evidence review required':provisional?'Provisional':'Complete evidence';
      const assignments=[
        ...dailyRecords.map(row=>({id:text(row.id||row.dateKey),category:'Daily Quest',title:text(row.title||row.missionTitle||row.dateKey,'Daily Quest'),score:text(row.status)==='complete'?clamp(row.score,0,100):null,status:text(row.status,'in-progress')})),
        ...curriculumRecords.map(row=>({id:text(row.id||row.lessonId),category:'Curriculum Quest',title:text(row.lessonTitle||row.title||row.lessonId,'Curriculum Quest'),score:row.accuracy===undefined&&number(row.questionsSeen)===0?null:clamp(row.accuracy??number(row.questionsCorrect)/Math.max(1,number(row.questionsSeen))*100,0,100),status:text(row.status,'recorded')})),
        ...(readingAssigned?assignedDates.map(day=>{const row=readingByDate.get(day),minutes=row?Math.round(row.activeSeconds/6)/10:0,target=targetsByDate[day],first=row?.firstPage||0,last=row?.lastPage||0;return {id:`witches:${day}`,category:'Witches Time',title:`The Witches • ${day}`,score:row?clamp(row.activeSeconds/(target*60)*100,0,100):0,status:row&&row.activeSeconds>=target*60?'complete':'incomplete',evidence:`${minutes}/${target} verified min${first?` • pages ${first}${last&&last!==first?`–${last}`:''}`:''}`}}):allOwnReadingRows.filter(row=>row.integrityValid).map(row=>({id:row.id,category:'Witches Time',title:`The Witches • ${row.dateKey}`,score:null,status:'recorded',evidence:`${Math.round(row.activeSeconds/6)/10} verified min${row.firstPage?` • pages ${row.firstPage}${row.lastPage!==row.firstPage?`–${row.lastPage}`:''}`:''} • not assigned`})))
      ];
      const readingMinutes=Math.round(ownReadingRows.reduce((sum,row)=>sum+row.activeSeconds,0)/6)/10;
      return Object.freeze({id:student.id,name:student.name,grade:student.grade,genderGroup:student.genderGroup,initial:(student.name[0]||'?').toUpperCase(),total,totalStatus,daily:daily??0,curriculum:curriculum??0,reading,readingMinutes,readingAssigned,readingStatus:readingAssigned?(readingIncomplete?'Incomplete':'Complete'):(allOwnReadingRows.length?'Recorded':'Not assigned'),readingEvidenceIssue,provisional,missing,assignments:Object.freeze(assignments.map(Object.freeze))});
    });
    const totals=rows.filter(row=>row.total>0).map(row=>row.total);
    const assignedWork=new Set([...dailyRows.map(row=>`daily:${text(row.id||row.dateKey)}`),...curriculumRows.map(row=>`curriculum:${text(row.id||row.lessonId)}`),...assignedDates.map(day=>`witches:${day}`)]).size;
    return Object.freeze({rows,classAverage:round(mean(totals))??0,missing:rows.reduce((sum,row)=>sum+row.missing,0),studentsWithMissing:rows.filter(row=>row.missing>0).length,assignedWork,weights,readingTargetMinutes:defaultTarget,readingAssignedDateKeys:Object.freeze(assignedDates),readingTargetsByDate:targetsByDate,gradeIntegrityVersion:2,reportCardPercentageReady:rows.every(row=>!row.readingEvidenceIssue),readingSource:'Verified active time in The Witches reader'});
  }

  function teacherAcademic(roster,activeSession,writingRows,dailyRows,curriculumRows,gameRows,readingRows=[],weightSettings={}){
    const session=normalizeSession(activeSession||{});
    const responses=writingRows.map(normalizeResponse).filter(row=>!session||row.sessionId===session.id);
    const submitted=responses.filter(row=>row.status==='submitted').length;
    const drafting=responses.filter(row=>row.status==='draft').length;
    const aiScored=responses.filter(row=>row.aiStatus==='complete'||row.aiFeedback).length;
    const avgWords=round(mean(responses.map(row=>row.wordCount)))??0;
    return Object.freeze({gradebook:gradebook(roster,dailyRows,curriculumRows,readingRows,weightSettings),scribe:Object.freeze({session,responses,submitted,drafting,aiScored,avgWords})});
  }

  return Object.freeze({GAME_CATALOG,writingMetrics,sessionResponseId,normalizeSession,normalizeResponse,normalizeReadingAssignments,writingPortfolio,normalizeGameResults,normalizeReading,normalizeWeights,studentAcademic,gradebook,teacherAcademic});
});
