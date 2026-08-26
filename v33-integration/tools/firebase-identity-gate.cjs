'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Core=require('../js/integration/core.js');

const PROJECT='demo-dragonswood-v33';
const AUTH='http://127.0.0.1:9099';
const FIRESTORE='http://127.0.0.1:8080';
const DB=`${FIRESTORE}/v1/projects/${PROJECT}/databases/(default)`;
const PASSWORD='V33-Gate-Only-2026!';
const results=[];

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
  const {res,body}=await jsonFetch(url,{method:'POST',body:JSON.stringify({fields:fields({...data,__gateSeed:true})})});
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
    const today=Core.phoenixDateKey(new Date());

    await seed('students',accounts.grade4.uid,{firstName:'Fourth',grade:4,genderGroup:'girls',hp:10,gold:15,xp:450,classId:'warrior',activePet:'pet-emberbean',rpgInventory:['gear_training_sword'],rpgEquipped:{weapon:'gear_training_sword'}});
    await seed('students',accounts.grade5.uid,{firstName:'Fifth',grade:5,genderGroup:'boys',hp:9,gold:22,xp:1520,classId:'mage',activePet:'pet-nyx',rpgInventory:[],rpgEquipped:{}});
    await seed('students',accounts.noClass.uid,{firstName:'NoClass',grade:4,genderGroup:'boys',hp:10,gold:0,xp:0,classId:'',activePet:'',rpgInventory:[],rpgEquipped:{}});
    await seed('students',accounts.noPet.uid,{firstName:'NoPet',grade:5,genderGroup:'girls',hp:10,gold:4,xp:750,classId:'ranger',activePet:'',rpgInventory:[],rpgEquipped:{}});
    await seed('students',accounts.tester.uid,{firstName:'Tester',grade:5,genderGroup:'girls',hp:10,gold:3,xp:200,classId:'healer',activePet:'',rpgInventory:[],rpgEquipped:{}});
    await seed('testerAccounts',accounts.tester.uid,{enabled:true,label:'V3 gate tester'});
    await seed('dailyQuestProgress',`${accounts.grade4.uid}_2026-08-25_v48`,{studentId:accounts.grade4.uid,dateKey:'2026-08-25',session:'morning',status:'complete',score:100});
    await seed('dailyQuestProgress',`${accounts.grade4.uid}_2026-08-24_v48`,{studentId:accounts.grade4.uid,dateKey:'2026-08-24',session:'morning',status:'complete',score:100});
    await seed('dailyQuests',today,{date:today,day:14,chapter:'The Crystal Crossing',chapterIcon:'💎',morningXp:4,exitXp:2,gold:1});
    await seed('classData','dailyAccessOverride',{dateKey:today,all:false,studentIds:[]});
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

    const curriculumId=`${accounts.grade5.uid}_K-D14-MATH`;
    const curriculumBase={studentId:accounts.grade5.uid,itemId:'K-D14-MATH',grade:'K',day:14,subject:'Math',strand:'Core Math',standardCode:'5.NBT',watched:false,videoCoverage:0,videoReflection:'',practiced:false,practiceEvidence:'',questionsCorrect:0,questionsSeen:0,autoAnswers:{},autoAttempts:0,lastActivityAttempt:'',activityAttempts:0,overrideStatus:'',verified:false};
    const curriculumCreate=await writeDoc('curriculumProgress',curriculumId,curriculumBase,accounts.grade5.token);
    assert.equal(curriculumCreate.res.ok,true,JSON.stringify(curriculumCreate.body));
    const curriculumUpdate=await writeDoc('curriculumProgress',curriculumId,{practiced:true,practiceEvidence:'I solved the sample and checked the result.'},accounts.grade5.token,['practiced','practiceEvidence']);
    assert.equal(curriculumUpdate.res.ok,true,JSON.stringify(curriculumUpdate.body));
    const savedCurriculum=await getDoc('curriculumProgress',curriculumId,accounts.grade5.token);
    assert.equal(decodeFields(savedCurriculum.body.fields).practiced,true);
    record('Curriculum canonical progress persistence',true,'owner create + constrained evidence update');

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
    const noPet=await getDoc('students',accounts.noPet.uid,accounts.noPet.token);
    const noPetModel=Core.normalizeStudent(accounts.noPet,decodeFields(noPet.body.fields),[]);
    assert.equal(noPetModel.petName,'No active pet');
    record('Class/pet edge cases',true,'unchosen class + no active pet map safely');

    const teacherList=await listDocs('students',accounts.teacher.token);
    assert.equal(teacherList.res.ok,true,JSON.stringify(teacherList.body));
    const rosterRows=(teacherList.body.documents||[]).map(d=>({id:d.name.split('/').pop(),...decodeFields(d.fields)}));
    const roster=Core.normalizeTeacherRoster(rosterRows);
    assert.equal(roster.length,5);
    assert.equal(new Set(roster.map(x=>x.id)).size,5);
    record('Authorized teacher roster read',true,'stable Firestore document IDs preserved');

    const teacherCurriculum=await listDocs('curriculumProgress',accounts.teacher.token);
    assert.equal(teacherCurriculum.res.ok,true,JSON.stringify(teacherCurriculum.body));
    assert.equal((teacherCurriculum.body.documents||[]).length,1);
    record('Authorized teacher curriculum evidence read',true,'canonical records visible');

    const wrongTeacherList=await listDocs('students',accounts.wrongTeacher.token);
    assert.equal(wrongTeacherList.res.status,403,`Expected 403, got ${wrongTeacherList.res.status}`);
    record('Wrong teacher roster denied',true);

    const deniedWrite=await attemptAuthenticatedWrite(accounts.grade4);
    assert.equal(deniedWrite.res.status,403,`Expected 403 write denial, got ${deniedWrite.res.status}: ${deniedWrite.text}`);
    record('Authenticated candidate-stage write denied',true,'read-only gate rules enforced');

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
