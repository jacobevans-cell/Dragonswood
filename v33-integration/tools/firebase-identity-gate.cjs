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

    await seed('students',accounts.grade4.uid,{firstName:'Fourth',grade:4,genderGroup:'girls',hp:10,gold:15,xp:450,classId:'warrior',activePet:'pet-emberbean',rpgInventory:['gear_training_sword'],rpgEquipped:{weapon:'gear_training_sword'}});
    await seed('students',accounts.grade5.uid,{firstName:'Fifth',grade:5,genderGroup:'boys',hp:9,gold:22,xp:1520,classId:'mage',activePet:'pet-nyx',rpgInventory:[],rpgEquipped:{}});
    await seed('students',accounts.noClass.uid,{firstName:'NoClass',grade:4,genderGroup:'boys',hp:10,gold:0,xp:0,classId:'',activePet:'',rpgInventory:[],rpgEquipped:{}});
    await seed('students',accounts.noPet.uid,{firstName:'NoPet',grade:5,genderGroup:'girls',hp:10,gold:4,xp:750,classId:'ranger',activePet:'',rpgInventory:[],rpgEquipped:{}});
    await seed('students',accounts.tester.uid,{firstName:'Tester',grade:5,genderGroup:'girls',hp:10,gold:3,xp:200,classId:'healer',activePet:'',rpgInventory:[],rpgEquipped:{}});
    await seed('testerAccounts',accounts.tester.uid,{enabled:true,label:'V3 gate tester'});
    await seed('dailyQuestProgress',`${accounts.grade4.uid}_2026-08-25_v48`,{studentId:accounts.grade4.uid,dateKey:'2026-08-25',session:'morning',status:'complete',score:100});
    await seed('dailyQuestProgress',`${accounts.grade4.uid}_2026-08-24_v48`,{studentId:accounts.grade4.uid,dateKey:'2026-08-24',session:'morning',status:'complete',score:100});
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
