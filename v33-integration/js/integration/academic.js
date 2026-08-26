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

  function gradebook(roster=[],dailyRows=[],curriculumRows=[],gameRows=[]){
    const games=normalizeGameResults(gameRows);
    const rows=roster.map(student=>{
      const ownDaily=dailyRows.filter(row=>text(row.studentId)===student.id&&text(row.status)==='complete').map(row=>clamp(row.score,0,100));
      const ownCurriculum=curriculumRows.filter(row=>text(row.studentId)===student.id).map(row=>row.accuracy??(number(row.questionsSeen)>0?number(row.questionsCorrect)/number(row.questionsSeen)*100:null)).filter(value=>value!==null);
      const ownReading=games.filter(row=>row.studentId===student.id&&row.subject==='ELA').map(row=>row.score);
      const daily=round(mean(ownDaily)),curriculum=round(mean(ownCurriculum)),reading=round(mean(ownReading));
      const categories=[daily,curriculum,reading],missing=categories.filter(value=>value===null).length;
      const available=[[daily,.4],[curriculum,.4],[reading,.2]].filter(([value])=>value!==null);
      const total=available.length?Math.round(available.reduce((sum,[value,weight])=>sum+value*weight,0)/available.reduce((sum,[,weight])=>sum+weight,0)):0;
      return Object.freeze({id:student.id,name:student.name,grade:student.grade,genderGroup:student.genderGroup,initial:(student.name[0]||'?').toUpperCase(),total,daily:daily??0,curriculum:curriculum??0,reading:reading??0,missing});
    });
    const totals=rows.filter(row=>row.total>0).map(row=>row.total);
    return Object.freeze({rows,classAverage:round(mean(totals))??0,missing:rows.reduce((sum,row)=>sum+row.missing,0),studentsWithMissing:rows.filter(row=>row.missing>0).length});
  }

  function teacherAcademic(roster,activeSession,writingRows,dailyRows,curriculumRows,gameRows){
    const session=normalizeSession(activeSession||{});
    const responses=writingRows.map(normalizeResponse).filter(row=>!session||row.sessionId===session.id);
    const submitted=responses.filter(row=>row.status==='submitted').length;
    const drafting=responses.filter(row=>row.status==='draft').length;
    const aiScored=responses.filter(row=>row.aiStatus==='complete'||row.aiFeedback).length;
    const avgWords=round(mean(responses.map(row=>row.wordCount)))??0;
    return Object.freeze({gradebook:gradebook(roster,dailyRows,curriculumRows,gameRows),scribe:Object.freeze({session,responses,submitted,drafting,aiScored,avgWords})});
  }

  return Object.freeze({GAME_CATALOG,writingMetrics,sessionResponseId,normalizeSession,normalizeResponse,writingPortfolio,normalizeGameResults,studentAcademic,gradebook,teacherAcademic});
});
