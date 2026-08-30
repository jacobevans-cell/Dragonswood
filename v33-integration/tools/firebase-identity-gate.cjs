'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Core=require('../js/integration/core.js');
const Academic=require('../js/integration/academic.js');

const PROJECT='demo-dragonswood-v33';
const AUTH='http://127.0.0.1:9099';
const FIRESTORE='http://127.0.0.1:8080';
const DB=`${FIRESTORE}/v1/projects/${PROJECT}/databases/(default)`;
const DOC_ROOT=`projects/${PROJECT}/databases/(default)`;
const PASSWORD='V33-Gate-Only-2026!';
const results=[];
function weekKey(dateKey){const cursor=new Date(`${dateKey}T12:00:00-07:00`),day=(cursor.getDay()+6)%7;cursor.setDate(cursor.getDate()-day);return Core.phoenixDateKey(cursor)}

function record(name,ok,detail=''){
  results.push({name,ok,detail});
  if(!ok)throw new Error(`${name}: ${detail||'failed'}`);
  console.log(`PASS ${name}${detail?` — ${detail}`:''}`);
}
async function jsonFetch(url,options={}){
  const res=await fetch(url,{...options,headers:{'content-type':'application/json',...(options.headers||{})}});
  const text=await res.text();
  let body=null;
  try{body=text?JSON.parse(text):null}catch{body=text}
  return {res,body,text};
}
async function signUp(email){
  const {res,body}=await jsonFetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`,{
    method:'POST',body:JSON.stringify({email,password:PASSWORD,returnSecureToken:true})
  });
  assert.equal(res.ok,true,`Auth emulator sign-up failed for ${email}: ${JSON.stringify(body)}`);
  return {email,uid:body.localId,token:body.idToken};
}
function value(v){
  if(v===null||v===undefined)return {nullValue:null};
  if(v instanceof Date)return {timestampValue:v.toISOString()};
  if(typeof v==='string')return {stringValue:v};
  if(typeof v==='boolean')return {booleanValue:v};
  if(typeof v==='number')return Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v};
  if(Array.isArray(v))return {arrayValue:{values:v.map(value)}};
  if(typeof v==='object')return {mapValue:{fields:fields(v)}};
  throw new TypeError(`Unsupported Firestore value: ${typeof v}`);
}
function fields(obj){return Object.fromEntries(Object.entries(obj).map(([k,v])=>[k,value(v)]))}
function decode(v){
  if(!v)return undefined;
  if('stringValue'in v)return v.stringValue;
  if('integerValue'in v)return Number(v.integerValue);
  if('doubleValue'in v)return Number(v.doubleValue);
  if('booleanValue'in v)return v.booleanValue;
  if('nullValue'in v)return null;
  if('arrayValue'in v)return (v.arrayValue.values||[]).map(decode);
  if('mapValue'in v)return decodeFields(v.mapValue.fields||{});
  return undefined;
}
function decodeFields(obj){return Object.fromEntries(Object.entries(obj||{}).map(([k,v])=>[k,decode(v)]))}
async function seed(collection,id,data){
  const url=`${DB}/documents/${collection}?documentId=${encodeURIComponent(id)}`;
  const productionRulesGate=process.env.DW_PRODUCTION_RULES_GATE==='1';
  const payload=productionRulesGate?data:{...data,__gateSeed:true};
  const {res,body}=await jsonFetch(url,{method:'POST',headers:productionRulesGate?bearer('owner'):{},body:JSON.stringify({fields:fields(payload)})});
  assert.equal(res.ok,true,`Seed failed ${collection}/${id}: ${JSON.stringify(body)}`);
}
function bearer(token){return {authorization:`Bearer ${token}`}}
async function getDoc(collection,id,token){
  return jsonFetch(`${DB}/documents/${collection}/${encodeURIComponent(id)}`,{headers:bearer(token)});
}
async function writeDoc(collection,id,data,token,mask=[]){
  const query=mask.map(field=>`updateMask.fieldPaths=${encodeURIComponent(field)}`).join('&');
  const suffix=query?`?${query}`:'';
  return jsonFetch(`${DB}/documents/${collection}/${encodeURIComponent(id)}${suffix}`,{
    method:'PATCH',headers:bearer(token),body:JSON.stringify({fields:fields(data)})
  });
}
async function commitDoc(collection,id,data,token,{create=false,mask=[],serverFields=[]}={}){
  const write={
    update:{name:`${DOC_ROOT}/documents/${collection}/${id}`,fields:fields(data)},
    currentDocument:{exists:!create}
  };
  if(mask.length)write.updateMask={fieldPaths:mask};
  if(serverFields.length)write.updateTransforms=serverFields.map(fieldPath=>({fieldPath,setToServerValue:'REQUEST_TIME'}));
  return jsonFetch(`${DB}/documents:commit`,{method:'POST',headers:bearer(token),body:JSON.stringify({writes:[write]})});
}
async function replaceDoc(collection,id,data){
  return jsonFetch(`${DB}/documents/${collection}/${encodeURIComponent(id)}`,{method:'PATCH',headers:bearer('owner'),body:JSON.stringify({fields:fields(data)})});
}
async function listDocs(collection,token){
  return jsonFetch(`${DB}/documents/${collection}?pageSize=100`,{headers:bearer(token)});
}
async function runStudentQuery(uid,token){
  const structuredQuery={
    from:[{collectionId:'dailyQuestProgress'}],
    where:{fieldFilter:{field:{fieldPath:'studentId'},op:'EQUAL',value:{stringValue:uid}}}
  };
  return jsonFetch(`${DB}/documents:runQuery`,{method:'POST',headers:bearer(token),body:JSON.stringify({structuredQuery})});
}
async function runOwnerQuery(collection,uid,token){
  const structuredQuery={from:[{collectionId:collection}],where:{fieldFilter:{field:{fieldPath:'studentId'},op:'EQUAL',value:{stringValue:uid}}}};
  return jsonFetch(`${DB}/documents:runQuery`,{method:'POST',headers:bearer(token),body:JSON.stringify({structuredQuery})});
}
async function attemptAuthenticatedWrite(account){
  const url=`${DB}/documents/students/${encodeURIComponent(account.uid)}?updateMask.fieldPaths=gold`;
  return jsonFetch(url,{method:'PATCH',headers:bearer(account.token),body:JSON.stringify({fields:{gold:{integerValue:'999999'}}})});
}

(async()=>{
  try{
    const accounts={};
    for(const [key,email] of Object.entries({
      grade4:'grade4@explore.academy',grade5:'grade5@explore.academy',noClass:'noclass@explore.academy',
      noPet:'nopet@explore.academy',missing:'missing@explore.academy',tester:'tester@example.com',
      unauthorized:'outsider@example.com',teacher:'jacobicusjax@gmail.com',wrongTeacher:'wrongteacher@example.com'
    }))accounts[key]=await signUp(email);
    record('Auth emulator issued fictional identities',true,`${Object.keys(accounts).length} accounts`);
    const gateNow=new Date();
    const today=Core.phoenixDateKey(gateNow);
    const previousDay=Core.phoenixDateKey(new Date(gateNow.getTime()-86400000));
    const dailyUnlockAt=new Date(gateNow.getTime()-86400000);
    const dailyLockAt=new Date(gateNow.getTime()+86400000);

    await seed('students',accounts.grade4.uid,{firstName:'Fourth',grade:4,genderGroup:'girls',hp:10,gold:15,xp:450,classId:'warrior',activePet:'pet-emberbean',rpgInventory:['gear_training_sword'],rpgEquipped:{weapon:'gear_training_sword'}});
    await seed('students',accounts.grade5.uid,{firstName:'Fifth',grade:5,genderGroup:'boys',hp:9,gold:22,xp:1520,classId:'mage',activePet:'dragon',ownedPets:['dragon'],rpgInventory:['gear_mage_wand'],rpgEquipped:{weapon:'gear_mage_wand'},eggInventory:1,petTokens:0,bossWins:0});
    await seed('students',accounts.noClass.uid,{firstName:'NoClass',grade:4,genderGroup:'boys',hp:10,gold:0,xp:0,classId:'',activePet:'',rpgInventory:[],rpgEquipped:{}});
    await seed('students',accounts.noPet.uid,{firstName:'NoPet',grade:5,genderGroup:'girls',hp:10,gold:4,xp:750,classId:'ranger',activePet:'',ownedPets:['pet-emberbean'],eggInventory:2,petTokens:0,rpgInventory:[],rpgEquipped:{}});
    await seed('students',accounts.tester.uid,{firstName:'Tester',grade:5,genderGroup:'girls',hp:10,gold:3,xp:200,classId:'healer',activePet:'',rpgInventory:[],rpgEquipped:{}});
    await seed('testerAccounts',accounts.tester.uid,{active:true,label:'V3 gate tester',capabilities:{selfUnlockMorning:true,selfUnlockCurriculum:true,selfUnlockArcade:true,selfUnlockKingdom:true,selfUnlockBoss:true,selfAwardPoints:true}});
    await seed('dailyQuestProgress',`${accounts.grade4.uid}_2026-08-25_v48`,{studentId:accounts.grade4.uid,dateKey:'2026-08-25',session:'morning',status:'complete',score:100});
    await seed('dailyQuestProgress',`${accounts.grade4.uid}_2026-08-24_v48`,{studentId:accounts.grade4.uid,dateKey:'2026-08-24',session:'morning',status:'complete',score:100});
    await seed('dailyQuests',today,{date:today,day:14,chapter:'The Crystal Crossing',chapterIcon:'💎',morningXp:4,exitXp:2,gold:1,unlockAt:dailyUnlockAt,lockAt:dailyLockAt});
    await seed('classData','dailyAccessOverride',{dateKey:today,all:false,studentIds:[]});
    await seed('classData','kingdomAccess',{dateKey:today,all:true,studentIds:[]});
    await seed('classData','activeWritingSession',{sessionId:'scribe-gate-1',status:'active',title:'Emulator Quickwrite',mode:'Quickwrite',writingType:'Narrative',targetSkill:'Sensory Details',prompt:'Describe the hidden gate using three sensory details.',hints:['Use a strong verb'],timeMinutes:5,minWords:5});
    const liveSchedule=Object.fromEntries(['Monday','Tuesday','Wednesday','Thursday','Friday'].map(day=>[day,[{id:'math',time:'8:25',title:'Live Emulator Math',detail:'Student World schedule'}]]));
    await seed('classData','classSchedule',{days:liveSchedule});
    await seed('classData','classJobs',{jobs:[{id:'floor-captain',name:'Floor Captain',icon:'🧹',description:'Check the reading corner before dismissal.',pay:50}],assignments:{[accounts.grade5.uid]:{id:'floor-captain',name:'Floor Captain',icon:'🧹',description:'Check the reading corner before dismissal.',pay:50}}});
    await seed('classData','main',{points:64,history:[]});
    await seed('classData','secondRecess',{points:8,goal:10,dateKey:today});
    await seed('classData','classPet',{points:172,goal:250});
    await seed('classData','fieldTrip',{points:418,goal:750});
    await seed('classData','universalPoints',{points:24});
    await seed('classData','gradebookSettings',{daily:40,curriculum:40,reading:20,readingTargetMinutes:20,readingAssignedDateKeys:[today,previousDay],readingTargetsByDate:{[today]:20,[previousDay]:20},gradeIntegrityVersion:2});
    await seed('classCalendarEvents','science-showcase',{title:'Science Showcase',icon:'🧪',dateKey:'2099-08-29',time:'1:30 PM'});
    await seed('scores','grade5-math',{studentId:accounts.grade5.uid,displayName:'Fifth',avatarEmoji:'🧙',assignmentId:'math-1',gameName:'Decimal Deception',subject:'Math',dateKey:today,score:92});
    await seed('scores','grade4-math',{studentId:accounts.grade4.uid,displayName:'Fourth',avatarEmoji:'🛡️',assignmentId:'math-1',gameName:'Decimal Deception',subject:'Math',dateKey:today,score:80});
    await seed('scores','historic-browser-score',{studentId:'historic-browser',displayName:'Historic Scholar',assignmentId:'old-game',gameName:'Legacy Game',subject:'Math',dateKey:'2020-01-01',score:999});
    await seed('leaderboardRewards',`${today}_${accounts.grade5.uid}`,{studentId:accounts.grade5.uid,studentName:'Fifth',dateKey:today,weekKey:today,rank:1,goldAward:5,status:'issued'});
    await seed('dailyQuestProgress',`${accounts.grade5.uid}_${today}_exit_seed`,{studentId:accounts.grade5.uid,dateKey:today,day:14,session:'exit',status:'complete',score:100,correct:1,attempts:1});
    await seed('writingSessions','scribe-gate-1',{status:'active',title:'Emulator Quickwrite',prompt:'Describe the hidden gate using three sensory details.',minWords:5});
    await seed('curriculumAttempts','attempt-grade4-1',{studentId:accounts.grade4.uid,itemId:'I-D14-MATH',attemptNumber:1,questionsCorrect:8,questionsSeen:10,accuracy:80});
    await seed('curriculumOverrideRequests','override-grade4',{studentId:accounts.grade4.uid,studentName:'Fourth',lessonId:'I-D14-MATH',studentAnswer:'I used place value evidence.',status:'pending'});
    await seed('bathroomRequests',`${accounts.grade4.uid}_${today}`,{studentId:accounts.grade4.uid,studentName:'Fourth',dateKey:today,status:'pending',createdAt:new Date().toISOString()});
    await seed('bathroomRequests',`${accounts.noClass.uid}_${today}`,{studentId:accounts.noClass.uid,studentName:'NoClass',dateKey:today,status:'pending',createdAt:new Date().toISOString()});
    await seed('pointRequests',`recognition_${accounts.grade5.uid}_${today}`,{studentId:accounts.grade5.uid,studentName:'Fifth',dateKey:today,status:'pending',reason:'Helped another scholar',createdAt:new Date().toISOString()});
    await seed('bathroomStatus',accounts.grade5.uid,{studentId:accounts.grade5.uid,studentName:'Fifth',dateKey:today,passesUsed:1,approvalCredits:0,active:true,activeVisitId:'visit-grade5-live',leftMs:Date.now()-60000,leftAtText:'1 min ago',visits:[{id:'visit-grade5-live',studentId:accounts.grade5.uid,studentName:'Fifth',dateKey:today,status:'out',leftMs:Date.now()-60000,leftAtText:'1 min ago'}]});
    await seed('bathroomSlots','boy',{group:'boy',dateKey:today,occupied:true,studentId:accounts.grade5.uid,studentName:'Fifth',activeVisitId:'visit-grade5-live',claimedAt:new Date().toISOString()});
    await seed('passHistory','visit-returned',{studentId:accounts.grade4.uid,studentName:'Fourth',dateKey:today,status:'returned',type:'bathroom'});
    await seed('studentJobWeeks',`${accounts.grade5.uid}_${weekKey(today)}`,{studentId:accounts.grade5.uid,studentName:'Fifth',weekKey:weekKey(today),jobId:'floor-captain',jobName:'Floor Captain',pay:50,checkedDays:[0,1,2,3],completedCount:4,paid:false});
    record('Demo Firestore seeded without production access',true,PROJECT);

    assert.equal(Core.isStudentEligibleEmail(accounts.grade4.email,false),true);
    assert.equal(Core.isStudentEligibleEmail(accounts.tester.email,true),true);
    assert.equal(Core.isStudentEligibleEmail(accounts.unauthorized.email,false),false);
    assert.equal(Core.isTeacherEmail(accounts.teacher.email),true);
    assert.equal(Core.isTeacherEmail(accounts.wrongTeacher.email),false);
    record('Application eligibility policy',true,'Explore + tester allowed; outsider/wrong teacher rejected');

    const own=await getDoc('students',accounts.grade4.uid,accounts.grade4.token);
    assert.equal(own.res.ok,true,JSON.stringify(own.body));
    const ownProfile=decodeFields(own.body.fields);
    const grade4Model=Core.normalizeStudent(accounts.grade4,ownProfile,[]);
    assert.equal(grade4Model.grade,'4');
    assert.equal(grade4Model.level,3);
    assert.equal(grade4Model.classLabel,'Warrior');
    assert.equal(grade4Model.petName,'Emberbean');
    record('Grade 4 own-profile read + mapping',true,`${grade4Model.displayName} L${grade4Model.level}`);

    const grade5=await getDoc('students',accounts.grade5.uid,accounts.grade5.token);
    assert.equal(grade5.res.ok,true,JSON.stringify(grade5.body));
    const grade5Model=Core.normalizeStudent(accounts.grade5,decodeFields(grade5.body.fields),[]);
    assert.equal(grade5Model.grade,'5');
    assert.equal(grade5Model.level,6);
    assert.equal(grade5Model.classLabel,'Mage');
    record('Grade 5 own-profile read + mapping',true,`L${grade5Model.level} Mage`);

    const cross=await getDoc('students',accounts.grade5.uid,accounts.grade4.token);
    assert.equal(cross.res.status,403,`Expected 403, got ${cross.res.status}: ${cross.text}`);
    record('Student cross-profile isolation',true,'other student denied');

    const q=await runStudentQuery(accounts.grade4.uid,accounts.grade4.token);
    assert.equal(q.res.ok,true,JSON.stringify(q.body));
    const queryDocs=(q.body||[]).filter(x=>x.document).map(x=>decodeFields(x.document.fields));
    assert.equal(queryDocs.length,2);
    assert.ok(queryDocs.every(x=>x.studentId===accounts.grade4.uid));
    record('Student daily progress query isolation',true,`${queryDocs.length} own rows`);

    const assignment=await getDoc('dailyQuests',today,accounts.grade4.token);
    assert.equal(assignment.res.ok,true,JSON.stringify(assignment.body));
    assert.equal(decodeFields(assignment.body.fields).day,14);
    record('Current Daily Quest assignment read',true,`${today} • day 14`);

    const dailyId=`${accounts.grade5.uid}_${today}_5_morning_v48`;
    const dailyCreate=await writeDoc('dailyQuestProgress',dailyId,{studentId:accounts.grade5.uid,dateKey:today,day:14,session:'morning',status:'in_progress',score:0,correct:0,attempts:0},accounts.grade5.token);
    assert.equal(dailyCreate.res.ok,true,JSON.stringify(dailyCreate.body));
    const dailyUpdate=await writeDoc('dailyQuestProgress',dailyId,{status:'complete',score:100,correct:1,attempts:1},accounts.grade5.token,['status','score','correct','attempts']);
    assert.equal(dailyUpdate.res.ok,true,JSON.stringify(dailyUpdate.body));
    const dailyRows=await runStudentQuery(accounts.grade5.uid,accounts.grade5.token);
    const ownDaily=(dailyRows.body||[]).filter(x=>x.document).map(x=>({id:x.document.name.split('/').pop(),...decodeFields(x.document.fields)}));
    assert.equal(Core.dailyMissionState(ownDaily,new Date(`${today}T18:00:00Z`)).morning,'complete');
    record('Daily Quest progress persistence',true,'in-progress → complete → V3.3 mission state');

    const crossPass=await writeDoc('snackRequests',`${accounts.noClass.uid}_${today}`,{studentId:accounts.noClass.uid,studentName:'NoClass',dateKey:today,status:'pending',createdAt:new Date().toISOString()},accounts.noClass.token);
    assert.equal(crossPass.res.status,403,`Expected one-pending-pass denial, got ${crossPass.res.status}: ${crossPass.text}`);
    record('One pending extra pass across all types',true,'Bathroom pending blocks Snack request for the same scholar');

    const curriculumId=`${accounts.grade5.uid}_K-D14-MATH`;
    const curriculumBase={studentId:accounts.grade5.uid,itemId:'K-D14-MATH',grade:'K',day:14,subject:'Math',strand:'Core Math',standardCode:'5.NBT',watched:false,videoCoverage:0,videoReflection:'',practiced:false,practiceEvidence:'',questionsCorrect:0,questionsSeen:0,autoAnswers:{},autoAttempts:0,lastActivityAttempt:'',activityAttempts:0,overrideStatus:'',verified:false};
    const curriculumCreate=await writeDoc('curriculumProgress',curriculumId,curriculumBase,accounts.grade5.token);
    assert.equal(curriculumCreate.res.ok,true,JSON.stringify(curriculumCreate.body));
    const curriculumUpdate=await writeDoc('curriculumProgress',curriculumId,{practiced:true,practiceEvidence:'I solved the sample and checked the result.'},accounts.grade5.token,['practiced','practiceEvidence']);
    assert.equal(curriculumUpdate.res.ok,true,JSON.stringify(curriculumUpdate.body));
    const savedCurriculum=await getDoc('curriculumProgress',curriculumId,accounts.grade5.token);
    assert.equal(decodeFields(savedCurriculum.body.fields).practiced,true);
    record('Curriculum canonical progress persistence',true,'owner create + constrained evidence update');

    const writingId=Academic.sessionResponseId('scribe-gate-1',accounts.grade5.uid);
    const writingDraft={studentId:accounts.grade5.uid,studentName:'Fifth',sessionId:'scribe-gate-1',status:'draft',responseText:'The silver gate hummed under my hand.',wordCount:8,sentenceCount:1,paragraphCount:1,capitalizedSentenceStarts:1,hasEndingPunctuation:true,sessionTitle:'Emulator Quickwrite',writingType:'Narrative',targetSkill:'Sensory Details',prompt:'Describe the hidden gate using three sensory details.',updatedAt:new Date().toISOString()};
    const draftCreate=await writeDoc('writingResponses',writingId,writingDraft,accounts.grade5.token);
    assert.equal(draftCreate.res.ok,true,JSON.stringify(draftCreate.body));
    const writingSubmit=await writeDoc('writingResponses',writingId,{status:'submitted',submittedAt:new Date().toISOString()},accounts.grade5.token,['status','submittedAt']);
    assert.equal(writingSubmit.res.ok,true,JSON.stringify(writingSubmit.body));
    const ownWriting=await runOwnerQuery('writingResponses',accounts.grade5.uid,accounts.grade5.token);
    assert.equal(ownWriting.res.ok,true,JSON.stringify(ownWriting.body));
    assert.equal((ownWriting.body||[]).filter(row=>row.document).length,1);
    record('Scribe draft and one-time submission persistence',true,'deterministic owner record');

    const crossWriting=await getDoc('writingResponses',writingId,accounts.grade4.token);
    assert.equal(crossWriting.res.status,403,`Expected 403, got ${crossWriting.res.status}: ${crossWriting.text}`);
    record('Scribe cross-student isolation',true,'other student denied');

    const teacherReview=await writeDoc('writingResponses',writingId,{teacherScore:17,teacherFeedback:'Strong sensory verb.'},accounts.teacher.token,['teacherScore','teacherFeedback']);
    assert.equal(teacherReview.res.ok,true,JSON.stringify(teacherReview.body));
    record('Teacher Scribe review write',true,'score + feedback constrained to emulator');

    const gameId=`decimal-${accounts.grade5.uid}`;
    const gameCreate=await writeDoc('gameResults',gameId,{studentId:accounts.grade5.uid,gameId:'decimal-deception',subject:'Math',status:'complete',score:92,xpAward:12,goldAward:3},accounts.grade5.token);
    assert.equal(gameCreate.res.ok,true,JSON.stringify(gameCreate.body));
    const badReward=await writeDoc('gameResults',`bad-${accounts.grade4.uid}`,{studentId:accounts.grade4.uid,gameId:'decimal-deception',subject:'Math',status:'complete',score:100,xpAward:99,goldAward:99},accounts.grade4.token);
    assert.equal(badReward.res.status,403,`Expected 403 reward cap, got ${badReward.res.status}: ${badReward.text}`);
    record('Academic game result and reward caps',true,'valid result saved; oversized reward denied');

    const readingBase=(account,name,date=today)=>({studentId:account.uid,studentName:name,bookId:'witches',bookTitle:'The Witches',dateKey:date,activeSeconds:15,firstPage:24,lastPage:24,pages:[24],status:'in-progress'});
    const readingId=`${accounts.grade5.uid}_${today}_witches`;
    const missingReading=await getDoc('readingSessions',readingId,accounts.grade5.token);
    assert.equal(missingReading.res.status,404,`Expected authorized missing-document read before first heartbeat, got ${missingReading.res.status}: ${missingReading.text}`);
    const readingCreate=await commitDoc('readingSessions',readingId,readingBase(accounts.grade5,'Fifth'),accounts.grade5.token,{create:true,serverFields:['createdAt','updatedAt']});
    assert.equal(readingCreate.res.ok,true,JSON.stringify(readingCreate.body));

    const rapidUpdate=await commitDoc('readingSessions',readingId,{activeSeconds:30,firstPage:24,lastPage:25,pages:[24,25],status:'in-progress'},accounts.grade5.token,{mask:['activeSeconds','firstPage','lastPage','pages','status'],serverFields:['updatedAt']});
    assert.equal(rapidUpdate.res.status,403,`Expected 403 rapid heartbeat, got ${rapidUpdate.res.status}: ${rapidUpdate.text}`);
    const readingJump=await commitDoc('readingSessions',readingId,{activeSeconds:90,firstPage:24,lastPage:25,pages:[24,25],status:'in-progress'},accounts.grade5.token,{mask:['activeSeconds','firstPage','lastPage','pages','status'],serverFields:['updatedAt']});
    assert.equal(readingJump.res.status,403,`Expected 403 oversized heartbeat, got ${readingJump.res.status}: ${readingJump.text}`);

    const denialBase=readingBase(accounts.grade4,'Fourth');
    const deniedCreates=[
      ['duplicate/non-deterministic ID',`duplicate_${accounts.grade4.uid}_${today}_witches`,denialBase,{serverFields:['createdAt','updatedAt']}],
      ['unassigned date',`${accounts.grade4.uid}_1999-01-01_witches`,{...denialBase,dateKey:'1999-01-01'},{serverFields:['createdAt','updatedAt']}],
      ['extra field',`${accounts.grade4.uid}_${today}_witches`,{...denialBase,extra:'forged'},{serverFields:['createdAt','updatedAt']}],
      ['invalid page bounds',`${accounts.grade4.uid}_${today}_witches`,{...denialBase,firstPage:0,pages:[0,24]},{serverFields:['createdAt','updatedAt']}],
      ['invalid page list',`${accounts.grade4.uid}_${today}_witches`,{...denialBase,pages:[24,25,26]},{serverFields:['createdAt','updatedAt']}],
      ['spoofed student name',`${accounts.grade4.uid}_${today}_witches`,{...denialBase,studentName:'Not Fourth'},{serverFields:['createdAt','updatedAt']}],
      ['student-controlled target',`${accounts.grade4.uid}_${today}_witches`,{...denialBase,targetMinutes:1},{serverFields:['createdAt','updatedAt']}],
      ['client-controlled timestamps',`${accounts.grade4.uid}_${today}_witches`,{...denialBase,createdAt:new Date(0),updatedAt:new Date(0)},{serverFields:[]}]
    ];
    for(const [label,id,data,options] of deniedCreates){const attempt=await commitDoc('readingSessions',id,data,accounts.grade4.token,{create:true,...options});assert.equal(attempt.res.status,403,`Expected 403 ${label}, got ${attempt.res.status}: ${attempt.text}`)}

    const oldTime=new Date(Date.now()-15000),updateId=`${accounts.noPet.uid}_${previousDay}_witches`,updateBase={...readingBase(accounts.noPet,'NoPet',previousDay),targetMinutes:20,lastHeartbeatMs:Date.now()-15000,createdAt:oldTime,updatedAt:oldTime};
    const seededUpdate=await replaceDoc('readingSessions',updateId,updateBase);assert.equal(seededUpdate.res.ok,true,JSON.stringify(seededUpdate.body));
    const readingUpdate=await commitDoc('readingSessions',updateId,{activeSeconds:30,firstPage:24,lastPage:25,pages:[24,25],status:'in-progress'},accounts.noPet.token,{mask:['activeSeconds','firstPage','lastPage','pages','status','targetMinutes','lastHeartbeatMs'],serverFields:['updatedAt']});
    assert.equal(readingUpdate.res.ok,true,JSON.stringify(readingUpdate.body));
    const resetUpdate=await replaceDoc('readingSessions',updateId,updateBase);assert.equal(resetUpdate.res.ok,true,JSON.stringify(resetUpdate.body));
    const immutableChange=await commitDoc('readingSessions',updateId,{studentName:'Forged',bookTitle:'Another Book',dateKey:today,createdAt:new Date(),activeSeconds:30,firstPage:24,lastPage:25,pages:[24,25],status:'in-progress'},accounts.noPet.token,{mask:['studentName','bookTitle','dateKey','createdAt','activeSeconds','firstPage','lastPage','pages','status'],serverFields:['updatedAt']});
    assert.equal(immutableChange.res.status,403,`Expected 403 immutable identity/date/book/create fields, got ${immutableChange.res.status}: ${immutableChange.text}`);
    const crossReading=await getDoc('readingSessions',readingId,accounts.grade4.token);
    assert.equal(crossReading.res.status,403,`Expected 403 cross-reading read, got ${crossReading.res.status}: ${crossReading.text}`);
    record('Witches assignment-bound reading evidence',true,'first transaction read + valid server-time heartbeat accepted; rapid/duplicate/arbitrary/forged writes and cross-student reads denied');

    const lootId=`${accounts.grade5.uid}_${today}`;
    const validLoot=await writeDoc('bossLoot',lootId,{studentId:accounts.grade5.uid,dateKey:today,status:'complete',goldAward:3,xpAward:12,goalPoints:0,rareGoal:'none',itemId:'crafting-materials'},accounts.grade5.token);
    assert.equal(validLoot.res.ok,true,JSON.stringify(validLoot.body));
    const oversizedLoot=await writeDoc('bossLoot',`${accounts.grade4.uid}_${today}`,{studentId:accounts.grade4.uid,dateKey:today,status:'complete',goldAward:30,xpAward:120,goalPoints:250,rareGoal:'fieldTrip',itemId:'forbidden'},accounts.grade4.token);
    assert.equal(oversizedLoot.res.status,403,`Expected 403 boss cap, got ${oversizedLoot.res.status}: ${oversizedLoot.text}`);
    const crossLoot=await getDoc('bossLoot',lootId,accounts.grade4.token);
    assert.equal(crossLoot.res.status,403,`Expected 403 cross-loot read, got ${crossLoot.res.status}: ${crossLoot.text}`);
    record('Daily Boss chest caps and isolation',true,'one owner chest accepted; oversized/cross-student access denied');

    const noPetBeforeHatch=await getDoc('students',accounts.noPet.uid,accounts.noPet.token);
    const noPetBeforeHatchModel=Core.normalizeStudent(accounts.noPet,decodeFields(noPetBeforeHatch.body.fields),[]);
    assert.equal(noPetBeforeHatchModel.petName,'No active pet');

    const hatchFields=['eggInventory','ownedPets','petTokens','activePet','lastHatchedPet','updatedAt'];
    const newHatch=await writeDoc('students',accounts.noPet.uid,{eggInventory:1,ownedPets:['pet-emberbean','pet-nyx'],petTokens:0,activePet:'pet-nyx',lastHatchedPet:'pet-nyx',updatedAt:new Date()},accounts.noPet.token,hatchFields);
    assert.equal(newHatch.res.ok,true,`New companion hatch failed: ${newHatch.text}`);
    const duplicateHatch=await writeDoc('students',accounts.noPet.uid,{eggInventory:0,ownedPets:['pet-emberbean','pet-nyx'],petTokens:1,activePet:'pet-nyx',lastHatchedPet:'pet-emberbean',updatedAt:new Date()},accounts.noPet.token,hatchFields);
    assert.equal(duplicateHatch.res.ok,true,`Duplicate companion hatch failed: ${duplicateHatch.text}`);
    record('Egg hatch transaction rules',true,'new companion + duplicate Pet Token paths both accepted');

    const scoreRows=await listDocs('scores',accounts.grade5.token);
    assert.equal(scoreRows.res.ok,true,JSON.stringify(scoreRows.body));
    assert.equal((scoreRows.body.documents||[]).length,3);
    const rewardRows=await listDocs('leaderboardRewards',accounts.grade5.token);
    assert.equal(rewardRows.res.ok,true,JSON.stringify(rewardRows.body));
    record('Student leaderboard read path',true,'weekly + historic scores and issued rewards visible');

    const crossCurriculum=await getDoc('curriculumProgress',curriculumId,accounts.grade4.token);
    assert.equal(crossCurriculum.res.status,403,`Expected 403, got ${crossCurriculum.res.status}: ${crossCurriculum.text}`);
    record('Curriculum cross-student isolation',true,'other student denied');

    const outsiderCurriculum=await writeDoc('curriculumProgress',`${accounts.unauthorized.uid}_outside`,{...curriculumBase,studentId:accounts.unauthorized.uid,itemId:'outside'},accounts.unauthorized.token);
    assert.equal(outsiderCurriculum.res.status,403,`Expected 403, got ${outsiderCurriculum.res.status}: ${outsiderCurriculum.text}`);
    record('Unauthorized curriculum write denied',true);

    const testerMarker=await getDoc('testerAccounts',accounts.tester.uid,accounts.tester.token);
    assert.equal(testerMarker.res.ok,true,JSON.stringify(testerMarker.body));
    const testerProfile=await getDoc('students',accounts.tester.uid,accounts.tester.token);
    assert.equal(testerProfile.res.ok,true,JSON.stringify(testerProfile.body));
    record('Tester account eligibility read path',true,'own marker + profile readable');

    const missing=await getDoc('students',accounts.missing.uid,accounts.missing.token);
    assert.equal(missing.res.status,404,`Expected 404 missing profile, got ${missing.res.status}`);
    const missingModel=Core.normalizeStudent(accounts.missing,null,[]);
    assert.equal(missingModel.profileMissing,true);
    record('Missing-profile neutral state',true,'authorized identity does not auto-create profile');

    const noClass=await getDoc('students',accounts.noClass.uid,accounts.noClass.token);
    const noClassModel=Core.normalizeStudent(accounts.noClass,decodeFields(noClass.body.fields),[]);
    assert.equal(noClassModel.classLabel,'Unchosen');
    record('Class/pet edge cases',true,'unchosen class + no active pet map safely');

    const teacherList=await listDocs('students',accounts.teacher.token);
    assert.equal(teacherList.res.ok,true,JSON.stringify(teacherList.body));
    const rosterRows=(teacherList.body.documents||[]).map(d=>({id:d.name.split('/').pop(),...decodeFields(d.fields)}));
    const roster=Core.normalizeTeacherRoster(rosterRows);
    assert.equal(roster.length,5);
    assert.equal(new Set(roster.map(x=>x.id)).size,5);
    record('Authorized teacher roster read',true,'stable Firestore document IDs preserved');

    const teacherPasses=await listDocs('bathroomRequests',accounts.teacher.token),teacherRecognition=await listDocs('pointRequests',accounts.teacher.token),teacherActive=await listDocs('bathroomStatus',accounts.teacher.token);
    assert.equal(teacherPasses.res.ok,true,JSON.stringify(teacherPasses.body));assert.equal(teacherRecognition.res.ok,true,JSON.stringify(teacherRecognition.body));assert.equal(teacherActive.res.ok,true,JSON.stringify(teacherActive.body));
    record('Teacher Operations queue reads',true,'pending passes + recognition + active movement visible');

    const classPointWrite=await writeDoc('classData','main',{points:65,history:[{amount:1,reason:'Gate check'}]},accounts.teacher.token,['points','history']);
    assert.equal(classPointWrite.res.ok,true,JSON.stringify(classPointWrite.body));
    record('Teacher class reward write',true,'shared points updated only by authorized teacher');

    const teacherDaily=await listDocs('dailyQuestProgress',accounts.teacher.token),teacherAttempts=await listDocs('curriculumAttempts',accounts.teacher.token),teacherReading=await listDocs('readingSessions',accounts.teacher.token);
    const decodeList=result=>(result.body.documents||[]).map(d=>({id:d.name.split('/').pop(),...decodeFields(d.fields)}));
    const book=Academic.gradebook(roster,decodeList(teacherDaily),decodeList(teacherAttempts),decodeList(teacherReading));
    assert.equal(book.rows.length,roster.length);assert.ok(book.rows.some(row=>row.total>0));
    record('Teacher gradebook aggregation',true,'Daily + Curriculum + verified Witches time');

    const replacement={sessionId:'scribe-gate-2',status:'active',title:'Teacher Mission',mode:'Quickwrite',writingType:'Opinion',targetSkill:'Strong Evidence',prompt:'Explain which realm rule is fairest.',timeMinutes:8,minWords:20};
    const teacherSession=await writeDoc('classData','activeWritingSession',replacement,accounts.teacher.token);
    assert.equal(teacherSession.res.ok,true,JSON.stringify(teacherSession.body));
    const sessionRead=await getDoc('classData','activeWritingSession',accounts.grade4.token);
    assert.equal(decodeFields(sessionRead.body.fields).sessionId,'scribe-gate-2');
    record('Teacher launch → student Scribe visibility',true,'active session updated in emulator');

    const attentionId='attention-gate-1';
    const attentionWrite=await writeDoc('classData','activeTeacherAttention',{id:attentionId,active:true,dateKey:today,title:'Return to Morning Work',message:'Pause and return now.',destination:'module/daily-quest',requireAcknowledgment:true,createdAtMs:Date.now(),createdBy:accounts.teacher.uid,createdAt:new Date(),updatedAt:new Date()},accounts.teacher.token);
    assert.equal(attentionWrite.res.ok,true,JSON.stringify(attentionWrite.body));
    const sentEvent=await writeDoc('teacherAttentionEvents',`${attentionId}_sent`,{attentionId,type:'sent',studentId:'',studentName:'Whole class',dateKey:today,title:'Return to Morning Work',message:'Pause and return now.',destination:'module/daily-quest',createdBy:accounts.teacher.uid,createdAt:new Date(),updatedAt:new Date()},accounts.teacher.token);
    assert.equal(sentEvent.res.ok,true,JSON.stringify(sentEvent.body));
    const ackId=`${attentionId}_${accounts.grade5.uid}`;
    const ack=await writeDoc('teacherAttentionEvents',ackId,{attentionId,type:'acknowledged',studentId:accounts.grade5.uid,studentName:'Fifth',dateKey:today,destination:'module/daily-quest',createdAt:new Date(),updatedAt:new Date()},accounts.grade5.token);
    assert.equal(ack.res.ok,true,JSON.stringify(ack.body));
    const ownAck=await getDoc('teacherAttentionEvents',ackId,accounts.grade5.token),crossAck=await getDoc('teacherAttentionEvents',ackId,accounts.grade4.token);
    assert.equal(ownAck.res.ok,true,JSON.stringify(ownAck.body));assert.equal(crossAck.res.status,403,`Expected cross-student attention denial, got ${crossAck.res.status}`);
    const attentionClose=await writeDoc('classData','activeTeacherAttention',{active:false,closedBy:accounts.teacher.uid,closedAt:new Date(),updatedAt:new Date()},accounts.teacher.token,['active','closedBy','closedAt','updatedAt']);
    assert.equal(attentionClose.res.ok,true,JSON.stringify(attentionClose.body));
    record('Teacher Attention acknowledgment and isolation',true,'teacher send + student acknowledgment + cross-student denial');

    const teacherCurriculum=await listDocs('curriculumProgress',accounts.teacher.token);
    assert.equal(teacherCurriculum.res.ok,true,JSON.stringify(teacherCurriculum.body));
    assert.equal((teacherCurriculum.body.documents||[]).length,1);
    record('Authorized teacher curriculum evidence read',true,'canonical records visible');

    const wrongTeacherList=await listDocs('students',accounts.wrongTeacher.token);
    assert.equal(wrongTeacherList.res.status,403,`Expected 403, got ${wrongTeacherList.res.status}`);
    record('Wrong teacher roster denied',true);

    const deniedWrite=await attemptAuthenticatedWrite(accounts.grade4);
    assert.equal(deniedWrite.res.status,403,`Expected 403 write denial, got ${deniedWrite.res.status}: ${deniedWrite.text}`);
    record('Unauthorized student profile write denied',true,'academic writes do not unlock profile mutation');

    const output={project:PROJECT,passed:true,generatedAt:new Date().toISOString(),results};
    const out=path.resolve(__dirname,'../test-results/firebase-identity-gate.json');
    fs.mkdirSync(path.dirname(out),{recursive:true});
    fs.writeFileSync(out,JSON.stringify(output,null,2)+'\n');
    console.log(`\nFIREBASE IDENTITY GATE: PASS (${results.length} checks)`);
  }catch(error){
    const output={project:PROJECT,passed:false,generatedAt:new Date().toISOString(),results,error:String(error?.stack||error)};
    const out=path.resolve(__dirname,'../test-results/firebase-identity-gate.json');
    fs.mkdirSync(path.dirname(out),{recursive:true});
    fs.writeFileSync(out,JSON.stringify(output,null,2)+'\n');
    console.error('\nFIREBASE IDENTITY GATE: FAIL');
    console.error(error?.stack||error);
    process.exit(1);
  }
})();
