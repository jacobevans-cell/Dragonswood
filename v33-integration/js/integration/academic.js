(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.DWV33Academic=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const GAME_CATALOG=Object.freeze([
    ['decimal-deception','Math'],['math-operations','Math'],['fraction-forge','Math'],
    ['long-division','Math'],['long-division-custom','Math'],
    ['witches-test','ELA'],['elemental-laboratory','Science'],['cosmic-architect','Science'],
    ['arcane-forge','Science'],['deep-time-lab','Science'],['class-reader','ELA']
  ].map(([id,subject])=>Object.freeze({id,subject})));
  const GAME_IDS=new Set(GAME_CATALOG.map(game=>game.id));
  const GRADE_INTEGRITY_VERSION=5;
  const DEFAULT_MINIMUM_ACADEMIC_DAY=21;
  const DEFAULT_CURRENT_GRADE_START_DATE='2026-08-31';
  const text=value=>String(value??'').trim();
  const number=value=>Number.isFinite(Number(value))?Number(value):0;
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,number(value)));
  const mean=values=>values.length?values.reduce((sum,value)=>sum+number(value),0)/values.length:null;
  const round=value=>value===null?null:Math.round(value);
  const studentId=row=>text(row?.studentId||row?.uid||row?.studentUid);
  const dateKey=row=>text(row?.dateKey||row?.sessionDate);
  const validDateKey=value=>/^\d{4}-\d{2}-\d{2}$/.test(text(value));
  const hasNumber=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value));
  function timestampMs(value){
    if(!value)return 0;
    if(typeof value?.toMillis==='function')return Number(value.toMillis())||0;
    if(hasNumber(value?.seconds))return Number(value.seconds)*1000;
    if(value instanceof Date)return value.getTime();
    const parsed=Date.parse(String(value));return Number.isFinite(parsed)?parsed:0;
  }
  function phoenixDateFrom(value){
    const ms=timestampMs(value);if(!ms)return '';
    try{return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Phoenix',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(ms))}
    catch{return new Date(ms).toISOString().slice(0,10)}
  }
  function evidenceDateKey(row={}){
    const explicit=dateKey(row);if(validDateKey(explicit))return explicit;
    return phoenixDateFrom(row.completedAt||row.createdAt||row.updatedAt||row.firstPassLockedAt);
  }
  function academicDay(row={}){
    if(hasNumber(row.day))return Math.max(0,Math.floor(Number(row.day)));
    const source=text(row.itemId||row.lessonId||row.missionId||row.pacingItemId||row.id),match=source.match(/(?:^|[-_])D(\d+)(?:[-_]|$)/i);
    return match?Number(match[1]):0;
  }
  function normalizeGradePolicy(value={}){
    const minimumAcademicDay=Math.max(1,Math.min(365,Math.floor(Number(value.minimumAcademicDay)||DEFAULT_MINIMUM_ACADEMIC_DAY)));
    const requestedStart=text(value.currentGradeStartDate),currentGradeStartDate=validDateKey(requestedStart)?requestedStart:DEFAULT_CURRENT_GRADE_START_DATE;
    return Object.freeze({minimumAcademicDay,currentGradeStartDate,recoveryIncludedInCurrent:false});
  }
  function evidencePeriod(row,policy){
    const day=academicDay(row),dayKey=evidenceDateKey(row);
    if(day>0&&day<policy.minimumAcademicDay)return 'recovery';
    if(dayKey&&dayKey<policy.currentGradeStartDate)return 'recovery';
    if(!dayKey&&day===0)return 'recovery';
    return 'current';
  }
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
    if(Number(value.gradeIntegrityVersion)>0&&Number(value.gradeIntegrityVersion)<GRADE_INTEGRITY_VERSION)return Object.freeze({daily:20,curriculum:40,spelling:20,reading:20});
    const daily=clamp(value.daily??value.dailyQuest??20,0,100);
    const curriculum=clamp(value.curriculum??value.curriculumQuest??40,0,100);
    const spelling=clamp(value.spelling??value.runeSpelling??20,0,100);
    const reading=clamp(value.reading??value.readingTests??20,0,100);
    return daily+curriculum+spelling+reading===100
      ?Object.freeze({daily,curriculum,spelling,reading})
      :Object.freeze({daily:20,curriculum:40,spelling:20,reading:20});
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

  function dailyAcademicScore(row){
    if(!row||text(row.status)!=='complete')return null;
    const accuracy=hasNumber(row.accuracy)?clamp(row.accuracy,0,100):clamp(row.score,0,100);
    return clamp(accuracy*.8+20,0,100);
  }
  function curriculumAcademicScore(row){
    if(!row)return null;
    const seen=hasNumber(row.autoQuestionsSeen)?Math.max(0,Number(row.autoQuestionsSeen)):Math.max(0,number(row.questionsSeen));
    const auto=hasNumber(row.accuracy)?clamp(row.accuracy,0,100):(seen>0?clamp(number(row.questionsCorrect)/seen*100,0,100):null);
    const hasApplication=row.writtenPassed!==undefined||row.applicationScore!==undefined;
    const application=hasNumber(row.applicationScore)?clamp(row.applicationScore,0,100):(row.writtenPassed===true?100:0);
    if(seen===0)return hasApplication?application:auto;
    if(auto===null)return hasApplication?application:null;
    return hasApplication?clamp(auto*.7+application*.3,0,100):auto;
  }
  function spellingActivityScore(row){
    if(!row)return null;
    const mode=text(row.mode),complete=text(row.status)==='complete'||text(row.completionStatus).includes('complete');
    if(mode==='weekly-mastery')return row.officialAttempt===false?null:clamp(row.score??row.accuracy,0,100);
    if(mode!=='daily-mission'||!complete)return null;
    const hasFirstTryEvidence=number(row.attempts)>0||number(row.accuracy)>0||number(row.correctedAccuracy)>0;
    return hasFirstTryEvidence?clamp(clamp(row.accuracy,0,100)*.8+20,0,100):100;
  }
  function weightedAvailable(pairs=[]){
    const active=pairs.filter(([value,weight])=>value!==null&&value!==undefined&&weight>0),weight=active.reduce((sum,[,part])=>sum+part,0);
    return weight?active.reduce((sum,[value,part])=>sum+number(value)*part,0)/weight:null;
  }

  function gradebook(roster=[],dailyRows=[],curriculumRows=[],readingRows=[],spellingRows=[],weightSettings={}){
    if(!Array.isArray(spellingRows)){weightSettings=spellingRows||{};spellingRows=[]}
    const weights=normalizeWeights(weightSettings);
    const policy=normalizeGradePolicy(weightSettings);
    const readingRecords=normalizeReading(readingRows);
    const validSpellingLevels=new Set(['foundation','grade4','grade5','challenge','master']);
    const spellingRecords=spellingRows.filter(row=>studentId(row)&&validSpellingLevels.has(text(row.levelKey))&&['daily-mission','weekly-mastery'].includes(text(row.mode))&&(text(row.mode)!=='weekly-mastery'||row.officialAttempt!==false));
    const readingAssignments=normalizeReadingAssignments(weightSettings),assignedDates=readingAssignments.dateKeys,defaultTarget=readingAssignments.defaultTarget,targetsByDate=readingAssignments.targetsByDate;
    const gradeByStudent=new Map(roster.map(student=>[student.id,text(student.grade)]));
    const rowGrade=row=>gradeByStudent.get(studentId(row))||'';
    const assignedDaily=row=>text(row.mode)!=='levelup'&&!text(row.id).includes('_levelup_');
    const dailyKey=row=>{const date=text(row.dateKey),session=text(row.session);return date&&session?`${date}|${session}`:''};
    const curriculumKey=row=>text(row.itemId||row.lessonId||row.missionId||row.pacingItemId)||(row.dateKey||row.day?`${text(row.dateKey||row.day)}|${text(row.subject)}|${text(row.lessonTitle||row.title)}`:'');
    const spellingKey=row=>text(row.mode)==='weekly-mastery'?`mastery|${text(row.schoolWeekId)||number(row.week)}`:`daily|${evidenceDateKey(row)}|${text(row.missionId)||text(row.id)}`;
    const expected=(source,grade,keyFn,predicate=()=>true)=>[...new Set(source.filter(row=>predicate(row)&&rowGrade(row)===grade).map(keyFn).filter(Boolean))];
    const expectedSpelling=(source,level)=>[...new Set(source.filter(row=>text(row.levelKey)===level).map(spellingKey).filter(Boolean))];
    const latestByKey=(source,keyFn)=>{const map=new Map(),times=new Map();for(const row of source){const key=keyFn(row);if(!key)continue;const time=timestampMs(row.updatedAt||row.completedAt||row.createdAt||row.firstPassLockedAt);if(!map.has(key)||time>=times.get(key)){map.set(key,row);times.set(key,time)}}return map};
    const exemplar=(source,grade,keyFn,key)=>source.find(row=>rowGrade(row)===grade&&keyFn(row)===key)||{};
    const spellingExemplar=(source,level,key)=>source.find(row=>text(row.levelKey)===level&&spellingKey(row)===key)||{};
    const currentDailyRows=dailyRows.filter(row=>assignedDaily(row)&&evidencePeriod(row,policy)==='current');
    const recoveryDailyRows=dailyRows.filter(row=>assignedDaily(row)&&evidencePeriod(row,policy)==='recovery');
    const currentCurriculumRows=curriculumRows.filter(row=>evidencePeriod(row,policy)==='current');
    const recoveryCurriculumRows=curriculumRows.filter(row=>evidencePeriod(row,policy)==='recovery');
    const currentSpellingRows=spellingRecords.filter(row=>evidencePeriod(row,policy)==='current');
    const recoverySpellingRows=spellingRecords.filter(row=>evidencePeriod(row,policy)==='recovery');
    const currentAssignedDates=assignedDates.filter(day=>day>=policy.currentGradeStartDate),recoveryAssignedDates=assignedDates.filter(day=>day<policy.currentGradeStartDate);
    const currentSpellingWeeks=[...new Set(currentSpellingRows.filter(row=>text(row.mode)==='weekly-mastery').map(row=>number(row.week)).filter(week=>week>=1&&week<=30))].sort((a,b)=>a-b);

    function makeDailyGrades(assignments){
      const byDate=new Map();
      for(const item of assignments){if(!validDateKey(item.dateKey)||!['daily','curriculum','spelling','reading'].includes(item.weightKey))continue;if(!byDate.has(item.dateKey))byDate.set(item.dateKey,[]);byDate.get(item.dateKey).push(item)}
      return [...byDate.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([day,items])=>{
        const values={};
        for(const key of ['daily','curriculum','spelling','reading']){
          const found=items.filter(item=>item.weightKey===key),scores=found.map(item=>item.score===null?0:item.score);
          values[key]=found.length?round(mean(scores)):null;
        }
        const total=round(weightedAvailable([[values.daily,weights.daily],[values.curriculum,weights.curriculum],[values.spelling,weights.spelling],[values.reading,weights.reading]]))??0;
        const incomplete=items.filter(item=>!['complete','recorded'].includes(text(item.status))).length;
        return Object.freeze({dateKey:day,total,status:incomplete?'Provisional':'Complete evidence',incomplete,...values});
      });
    }

    const rows=roster.map(student=>{
      const grade=text(student.grade);
      const spellingLevel=({3:'foundation',4:'grade4',5:'grade5',6:'challenge',7:'master',8:'master'})[Number(student.spellingGrade)]||'grade5';
      const dailyRecords=currentDailyRows.filter(row=>studentId(row)===student.id),curriculumRecords=currentCurriculumRows.filter(row=>studentId(row)===student.id),ownSpellingRecords=currentSpellingRows.filter(row=>studentId(row)===student.id&&text(row.levelKey)===spellingLevel);
      const expectedDaily=expected(currentDailyRows,grade,dailyKey),expectedCurriculum=expected(currentCurriculumRows,grade,curriculumKey),expectedSpellingKeys=expectedSpelling(currentSpellingRows,spellingLevel);
      const dailyByKey=latestByKey(dailyRecords,dailyKey),curriculumByKey=latestByKey(curriculumRecords,curriculumKey);
      const spellingByKey=latestByKey(ownSpellingRecords,spellingKey);
      const ownDaily=expectedDaily.length
        ? expectedDaily.map(key=>dailyAcademicScore(dailyByKey.get(key))??0)
        : dailyRecords.map(dailyAcademicScore).filter(value=>value!==null);
      const ownCurriculum=expectedCurriculum.length
        ? expectedCurriculum.map(key=>curriculumAcademicScore(curriculumByKey.get(key))??0)
        : curriculumRecords.map(curriculumAcademicScore).filter(value=>value!==null);
      const spellingDailyKeys=expectedSpellingKeys.filter(key=>key.startsWith('daily|')),spellingMasteryKeys=expectedSpellingKeys.filter(key=>key.startsWith('mastery|'));
      const spellingDailyScores=spellingDailyKeys.map(key=>spellingActivityScore(spellingByKey.get(key))??0),spellingMasteryScores=spellingMasteryKeys.map(key=>spellingActivityScore(spellingByKey.get(key))??0);
      const spellingDaily=round(mean(spellingDailyScores)),spellingMastery=round(mean(spellingMasteryScores)),spelling=round(weightedAvailable([[spellingDaily,40],[spellingMastery,60]]));
      const readingAssigned=currentAssignedDates.length>0;
      const allOwnReadingRows=readingRecords.filter(row=>row.studentId===student.id);
      const ownReadingRows=allOwnReadingRows.filter(row=>row.integrityValid&&currentAssignedDates.includes(row.dateKey));
      const currentUnassignedReadingRows=allOwnReadingRows.filter(row=>row.integrityValid&&evidencePeriod(row,policy)==='current'&&!currentAssignedDates.includes(row.dateKey));
      const readingByDate=new Map(ownReadingRows.map(row=>[row.dateKey,row]));
      const readingScores=readingAssigned?currentAssignedDates.map(day=>{const row=readingByDate.get(day),target=targetsByDate[day];return row?clamp(row.activeSeconds/(target*60)*100,0,100):0}):[];
      const daily=round(mean(ownDaily)),curriculum=round(mean(ownCurriculum)),reading=readingAssigned?round(mean(readingScores)):null;
      const dailyIncomplete=expectedDaily.length?expectedDaily.filter(key=>text(dailyByKey.get(key)?.status)!=='complete').length:dailyRecords.filter(row=>text(row.status)!=='complete').length;
      const curriculumIncomplete=expectedCurriculum.length?expectedCurriculum.filter(key=>curriculumAcademicScore(curriculumByKey.get(key))===null).length:curriculumRecords.filter(row=>curriculumAcademicScore(row)===null).length;
      const spellingIncomplete=expectedSpellingKeys.filter(key=>!spellingByKey.has(key)||spellingActivityScore(spellingByKey.get(key))===null).length;
      const readingIncomplete=readingAssigned?currentAssignedDates.filter(day=>{const row=readingByDate.get(day);return !row||row.activeSeconds<targetsByDate[day]*60}).length:0;
      const readingEvidenceIssue=allOwnReadingRows.some(row=>currentAssignedDates.includes(row.dateKey)&&!row.integrityValid);
      const missing=dailyIncomplete+curriculumIncomplete+spellingIncomplete+readingIncomplete;
      const categories=[[daily,weights.daily],[curriculum,weights.curriculum],...(expectedSpellingKeys.length?[[spelling,weights.spelling]]:[]),...(readingAssigned?[[reading,weights.reading]]:[])],activeWeight=categories.reduce((sum,[,weight])=>sum+weight,0);
      const total=activeWeight?Math.round(categories.reduce((sum,[value,weight])=>sum+(value??0)*weight,0)/activeWeight):0;
      const provisional=missing>0||readingEvidenceIssue||categories.some(([value])=>value===null),totalStatus=readingEvidenceIssue?'Evidence review required':provisional?'Provisional':'Complete evidence';
      const assignments=[
        ...(expectedDaily.length?expectedDaily.map(key=>{const row=dailyByKey.get(key),sample=exemplar(currentDailyRows,grade,dailyKey,key),day=evidenceDateKey(row||sample);return {id:`daily:${key}`,dateKey:day,weightKey:'daily',category:'Morning Work',title:text(row?.title||row?.missionTitle||sample.title||sample.missionTitle||key,'Morning Work'),score:dailyAcademicScore(row)??0,status:row?text(row.status,'in-progress'):'missing'}}):dailyRecords.map(row=>({id:text(row.id||row.dateKey),dateKey:evidenceDateKey(row),weightKey:'daily',category:'Morning Work',title:text(row.title||row.missionTitle||row.dateKey,'Morning Work'),score:dailyAcademicScore(row),status:text(row.status,'in-progress')}))),
        ...(expectedCurriculum.length?expectedCurriculum.map(key=>{const row=curriculumByKey.get(key),sample=exemplar(currentCurriculumRows,grade,curriculumKey,key),raw=curriculumAcademicScore(row);return {id:`curriculum:${key}`,dateKey:evidenceDateKey(row||sample),weightKey:'curriculum',category:'Curriculum Quest',title:text(row?.lessonTitle||row?.title||sample.lessonTitle||sample.title||key,'Curriculum Quest'),score:raw===null?0:raw,status:row&&raw!==null?'complete':'missing'}}):curriculumRecords.map(row=>({id:text(row.id||row.itemId||row.lessonId),dateKey:evidenceDateKey(row),weightKey:'curriculum',category:'Curriculum Quest',title:text(row.lessonTitle||row.title||row.itemId||row.lessonId,'Curriculum Quest'),score:curriculumAcademicScore(row),status:curriculumAcademicScore(row)===null?'in-progress':'complete'}))),
        ...expectedSpellingKeys.map(key=>{const row=spellingByKey.get(key),sample=spellingExemplar(currentSpellingRows,spellingLevel,key),mastery=key.startsWith('mastery|');return {id:`spelling:${spellingLevel}:${key}`,dateKey:evidenceDateKey(row||sample),weightKey:'spelling',category:'Rune Spelling',title:mastery?`Rune Spelling • Week ${number(row?.week||sample.week)} Mastery`:`Rune Spelling • ${text(row?.missionId||sample.missionId||'Daily Mission')}`,score:spellingActivityScore(row)??0,status:row?'complete':'missing'}}),
        ...(readingAssigned?currentAssignedDates.map(day=>{const row=readingByDate.get(day),minutes=row?Math.round(row.activeSeconds/6)/10:0,target=targetsByDate[day],first=row?.firstPage||0,last=row?.lastPage||0;return {id:`witches:${day}`,dateKey:day,weightKey:'reading',category:'Witches Reading',title:`The Witches • ${day}`,score:row?clamp(row.activeSeconds/(target*60)*100,0,100):0,status:row&&row.activeSeconds>=target*60?'complete':'incomplete',evidence:`${minutes}/${target} verified min${first?` • pages ${first}${last&&last!==first?`–${last}`:''}`:''}`}}):currentUnassignedReadingRows.map(row=>({id:row.id,dateKey:row.dateKey,weightKey:'',category:'Witches Reading',title:`The Witches • ${row.dateKey}`,score:null,status:'recorded',evidence:`${Math.round(row.activeSeconds/6)/10} verified min • not assigned`})))
      ];
      const readingMinutes=Math.round(ownReadingRows.reduce((sum,row)=>sum+row.activeSeconds,0)/6)/10;

      const recoveryOwnDaily=recoveryDailyRows.filter(row=>studentId(row)===student.id).map(row=>({row,score:dailyAcademicScore(row)})).filter(item=>item.score!==null);
      const recoveryOwnCurriculum=recoveryCurriculumRows.filter(row=>studentId(row)===student.id).map(row=>({row,score:curriculumAcademicScore(row)})).filter(item=>item.score!==null);
      const recoveryOwnSpelling=recoverySpellingRows.filter(row=>studentId(row)===student.id&&text(row.levelKey)===spellingLevel).map(row=>({row,score:spellingActivityScore(row)})).filter(item=>item.score!==null);
      const recoverySpellingDaily=round(mean(recoveryOwnSpelling.filter(item=>text(item.row.mode)==='daily-mission').map(item=>item.score))),recoverySpellingMastery=round(mean(recoveryOwnSpelling.filter(item=>text(item.row.mode)==='weekly-mastery').map(item=>item.score)));
      const recoveryReadingRows=allOwnReadingRows.filter(row=>row.integrityValid&&evidencePeriod(row,policy)==='recovery'&&(recoveryAssignedDates.includes(row.dateKey)||row.dateKey<policy.currentGradeStartDate));
      const recoveryReadingScores=recoveryReadingRows.map(row=>clamp(row.activeSeconds/((targetsByDate[row.dateKey]||row.legacyTargetMinutes||defaultTarget)*60)*100,0,100));
      const recoveryDaily=round(mean(recoveryOwnDaily.map(item=>item.score))),recoveryCurriculum=round(mean(recoveryOwnCurriculum.map(item=>item.score))),recoverySpelling=round(weightedAvailable([[recoverySpellingDaily,40],[recoverySpellingMastery,60]])),recoveryReading=round(mean(recoveryReadingScores));
      const recoveryTotal=round(weightedAvailable([[recoveryDaily,weights.daily],[recoveryCurriculum,weights.curriculum],[recoverySpelling,weights.spelling],[recoveryReading,weights.reading]]));
      const recoveryAssignments=[
        ...recoveryOwnDaily.map(({row,score})=>({id:`recovery-daily:${text(row.id)||dailyKey(row)}`,dateKey:evidenceDateKey(row),category:'Morning Work',title:text(row.title||row.missionTitle||dailyKey(row),'Morning Work'),score,status:'recorded'})),
        ...recoveryOwnCurriculum.map(({row,score})=>({id:`recovery-curriculum:${text(row.id)||curriculumKey(row)}`,dateKey:evidenceDateKey(row),category:'Curriculum Quest',title:text(row.lessonTitle||row.title||row.itemId,'Curriculum Quest'),score,status:'recorded'})),
        ...recoveryOwnSpelling.map(({row,score})=>({id:`recovery-spelling:${text(row.id)||spellingKey(row)}`,dateKey:evidenceDateKey(row),category:'Rune Spelling',title:text(row.mode)==='weekly-mastery'?`Rune Spelling • Week ${number(row.week)} Mastery`:`Rune Spelling • ${text(row.missionId)||'Daily Mission'}`,score,status:'recorded'})),
        ...recoveryReadingRows.map((row,index)=>({id:`recovery-reading:${row.id||index}`,dateKey:row.dateKey,category:'Witches Reading',title:`The Witches • ${row.dateKey}`,score:recoveryReadingScores[index],status:'recorded'}))
      ].sort((a,b)=>text(a.dateKey).localeCompare(text(b.dateKey)));
      const recovery=Object.freeze({total:recoveryTotal,daily:recoveryDaily,curriculum:recoveryCurriculum,spelling:recoverySpelling,reading:recoveryReading,count:recoveryAssignments.length,assignments:Object.freeze(recoveryAssignments.map(Object.freeze)),includedInCurrent:false});
      return Object.freeze({id:student.id,name:student.name,grade:student.grade,spellingGrade:student.spellingGrade||5,genderGroup:student.genderGroup,initial:(student.name[0]||'?').toUpperCase(),total,totalStatus,daily:daily??0,curriculum:curriculum??0,spelling,spellingDaily,spellingMastery,reading,readingMinutes,readingAssigned,readingStatus:readingAssigned?(readingIncomplete?'Incomplete':'Complete'):(currentUnassignedReadingRows.length?'Recorded':allOwnReadingRows.length?'Recovery only':'Not assigned'),readingEvidenceIssue,provisional,missing,assignments:Object.freeze(assignments.map(Object.freeze)),dailyGrades:Object.freeze(makeDailyGrades(assignments)),recovery});
    });
    const totals=rows.map(row=>row.total),recoveryTotals=rows.map(row=>row.recovery.total).filter(value=>value!==null);
    const assignedWork=new Set([
      ...currentDailyRows.map(row=>`daily:${rowGrade(row)}:${dailyKey(row)}`).filter(key=>!key.endsWith(':')),
      ...currentCurriculumRows.map(row=>`curriculum:${rowGrade(row)}:${curriculumKey(row)}`).filter(key=>!key.endsWith(':')),
      ...currentSpellingRows.map(row=>`spelling:${text(row.levelKey)}:${spellingKey(row)}`),
      ...currentAssignedDates.map(day=>`witches:${day}`)
    ]).size;
    return Object.freeze({rows,classAverage:round(mean(totals))??0,recoveryAverage:round(mean(recoveryTotals)),recoveryEvidence:rows.reduce((sum,row)=>sum+row.recovery.count,0),missing:rows.reduce((sum,row)=>sum+row.missing,0),studentsWithMissing:rows.filter(row=>row.missing>0).length,assignedWork,weights,policy,spellingAssignedWeeks:Object.freeze(currentSpellingWeeks),readingTargetMinutes:defaultTarget,readingAssignedDateKeys:Object.freeze(currentAssignedDates),recoveryReadingAssignedDateKeys:Object.freeze(recoveryAssignedDates),readingTargetsByDate:targetsByDate,gradeIntegrityVersion:GRADE_INTEGRITY_VERSION,reportCardPercentageReady:rows.every(row=>!row.readingEvidenceIssue),readingSource:'Verified active time in The Witches reader'});
  }

  function teacherAcademic(roster,activeSession,writingRows,dailyRows,curriculumRows,gameRows,readingRows=[],spellingRows=[],weightSettings={}){
    const session=normalizeSession(activeSession||{});
    const responses=writingRows.map(normalizeResponse).filter(row=>!session||row.sessionId===session.id);
    const submitted=responses.filter(row=>row.status==='submitted').length;
    const drafting=responses.filter(row=>row.status==='draft').length;
    const aiScored=responses.filter(row=>row.aiStatus==='complete'||row.aiFeedback).length;
    const avgWords=round(mean(responses.map(row=>row.wordCount)))??0;
    return Object.freeze({gradebook:gradebook(roster,dailyRows,curriculumRows,readingRows,spellingRows,weightSettings),scribe:Object.freeze({session,responses,submitted,drafting,aiScored,avgWords})});
  }

  return Object.freeze({GRADE_INTEGRITY_VERSION,DEFAULT_MINIMUM_ACADEMIC_DAY,DEFAULT_CURRENT_GRADE_START_DATE,GAME_CATALOG,writingMetrics,sessionResponseId,normalizeSession,normalizeResponse,normalizeReadingAssignments,normalizeGradePolicy,evidenceDateKey,academicDay,evidencePeriod,dailyAcademicScore,curriculumAcademicScore,spellingActivityScore,writingPortfolio,normalizeGameResults,normalizeReading,normalizeWeights,studentAcademic,gradebook,teacherAcademic});
});
