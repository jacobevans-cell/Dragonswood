'use strict';

const assert=require('node:assert/strict');
const admin=require('firebase-admin');
const {getFirestore}=require('firebase-admin/firestore');
const {RECORDS}=require('./seed-true-testers.cjs');

const PROJECT='demo-dragonswood-v33';
const AUTH='http://127.0.0.1:9099';
const FIRESTORE='http://127.0.0.1:8080';
const FUNCTIONS=`http://127.0.0.1:5001/${PROJECT}/us-central1`;
const DB=`${FIRESTORE}/v1/projects/${PROJECT}/databases/(default)`;
const DOC_ROOT=`projects/${PROJECT}/databases/(default)`;
const PASSWORD='True-Tester-Emulator-Only-2026!';
const CAPABILITIES={selfUnlockMorning:true,selfUnlockCurriculum:true,selfUnlockArcade:true,selfUnlockKingdom:true,selfUnlockBoss:true,selfAwardPoints:true};
const FALSE_CONTROLS={unlockMorning:false,unlockCurriculum:false,unlockArcade:false,unlockKingdom:false};
const TRUE_CONTROLS={unlockMorning:true,unlockCurriculum:true,unlockArcade:true,unlockKingdom:true};

if(!String(process.env.FIRESTORE_EMULATOR_HOST||'').includes('127.0.0.1'))throw new Error('Refusing to run without the local Firestore emulator.');
if(!String(process.env.FIREBASE_AUTH_EMULATOR_HOST||'').includes('127.0.0.1'))throw new Error('Refusing to run without the local Auth emulator.');

const users={
  explore:{uid:RECORDS[0].uid,email:RECORDS[0].email},
  teacher:{uid:RECORDS[1].uid,email:RECORDS[1].email},
  normal:{uid:'normalExploreStudentUid',email:'normal.student@explore.academy'},
  tech:{uid:'techPeoNotTesterUid',email:'tech-peo@explore.academy'},
  legacy:{uid:'eF1pnptN9qfsXxiqjZI6RMBNMO63',email:'dragontester@dragonswood.test'},
  inactive:{uid:'inactiveTesterUid',email:'inactive.tester@example.com'}
};

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
const fields=obj=>Object.fromEntries(Object.entries(obj).map(([key,v])=>[key,value(v)]));
function decode(v){
  if(!v)return undefined;
  if('stringValue' in v)return v.stringValue;
  if('integerValue' in v)return Number(v.integerValue);
  if('doubleValue' in v)return v.doubleValue;
  if('booleanValue' in v)return v.booleanValue;
  if('timestampValue' in v)return v.timestampValue;
  if('nullValue' in v)return null;
  if('arrayValue' in v)return (v.arrayValue.values||[]).map(decode);
  if('mapValue' in v)return decodeFields(v.mapValue.fields||{});
  return undefined;
}
const decodeFields=obj=>Object.fromEntries(Object.entries(obj||{}).map(([key,v])=>[key,decode(v)]));
const bearer=token=>token?{authorization:`Bearer ${token}`}:{ };
async function jsonFetch(url,options={}){
  const response=await fetch(url,{...options,headers:{'content-type':'application/json',...(options.headers||{})}});
  const text=await response.text();let body=null;
  try{body=text?JSON.parse(text):null}catch{body=text}
  return {response,body,text};
}
async function signIn(email){
  const result=await jsonFetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key`,{method:'POST',body:JSON.stringify({email,password:PASSWORD,returnSecureToken:true})});
  assert.equal(result.response.ok,true,`Auth sign-in failed for ${email}: ${result.text}`);
  return result.body.idToken;
}
async function getDoc(collection,id,token){return jsonFetch(`${DB}/documents/${collection}/${encodeURIComponent(id)}`,{headers:bearer(token)})}
async function patchDoc(collection,id,data,token,mask=[]){
  const query=mask.map(field=>`updateMask.fieldPaths=${encodeURIComponent(field)}`).join('&');
  return jsonFetch(`${DB}/documents/${collection}/${encodeURIComponent(id)}${query?`?${query}`:''}`,{method:'PATCH',headers:bearer(token),body:JSON.stringify({fields:fields(data)})});
}
async function writeControls(targetUid,token,controls,{create=true}={}){
  const write={
    update:{name:`${DOC_ROOT}/documents/testerSelfControls/${targetUid}`,fields:fields({uid:targetUid,...controls})},
    currentDocument:{exists:!create},
    updateTransforms:[{fieldPath:'updatedAt',setToServerValue:'REQUEST_TIME'}]
  };
  return jsonFetch(`${DB}/documents:commit`,{method:'POST',headers:bearer(token),body:JSON.stringify({writes:[write]})});
}
async function call(name,token,data={}){
  return jsonFetch(`${FUNCTIONS}/${name}`,{method:'POST',headers:bearer(token),body:JSON.stringify({data})});
}
function callableResult(result){return result.body?.result??result.body?.data}
function expectDenied(result,label){assert.equal(result.response.ok,false,`${label} unexpectedly succeeded: ${result.text}`);assert.ok(result.body?.error,`${label} did not return a callable/API error: ${result.text}`)}
function log(label,detail=''){console.log(`PASS ${label}${detail?` — ${detail}`:''}`)}

(async()=>{
  try{
    const clear=await fetch(`${FIRESTORE}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`,{method:'DELETE'});
    assert.equal(clear.ok,true,'Could not clear the Firestore emulator');
    const clearAuth=await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/accounts`,{method:'DELETE'});
    assert.equal(clearAuth.ok,true,'Could not clear the Authentication emulator');
    if(!admin.apps.length)admin.initializeApp({projectId:PROJECT});
    for(const account of Object.values(users))await admin.auth().createUser({...account,password:PASSWORD,emailVerified:true});
    const tokens={};for(const [key,account] of Object.entries(users))tokens[key]=await signIn(account.email);
    const db=getFirestore();
    const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Phoenix',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());

    const batch=db.batch();
    for(const [key,account] of Object.entries(users))batch.set(db.doc(`students/${account.uid}`),{
      firstName:key[0].toUpperCase()+key.slice(1),grade:key==='teacher'?4:5,hp:10,xp:key==='explore'?100:key==='teacher'?200:25,gold:key==='explore'?12:key==='teacher'?20:3,
      ...(key==='legacy'?{tester:true,isTester:true,role:'tester',accountRole:'tester',accountType:'tester'}:{})
    });
    for(const record of RECORDS)batch.set(db.doc(`testerAccounts/${record.uid}`),{email:record.email,active:true,label:record.label,capabilities:{...CAPABILITIES}});
    batch.set(db.doc(`testerAccounts/${users.inactive.uid}`),{email:users.inactive.email,active:false,label:'Inactive Test Fixture',capabilities:{...CAPABILITIES}});
    batch.set(db.doc('arcadeSettings/classAccess'),{enabled:false});
    for(const account of Object.values(users))batch.set(db.doc(`arcadeAccess/${account.uid}`),{uid:account.uid,tokens:account.uid===users.normal.uid?3:0,individualEnabled:false});
    batch.set(db.doc('classData/dailyAccessOverride'),{dateKey:'2099-01-01',all:false,studentIds:[]});
    batch.set(db.doc('classData/kingdomAccess'),{dateKey:'2099-01-01',all:false,studentIds:[]});
    batch.set(db.doc(`dailyQuests/${today}`),{date:today,day:14,chapter:'The Locked Tester Gate',chapterIcon:'🧪',unlockAt:new Date(Date.now()-172800000),lockAt:new Date(Date.now()-86400000)});
    await batch.commit();
    log('Emulator fixtures use the two locked UIDs and emails');

    for(const key of ['explore','teacher']){
      const own=await getDoc('testerAccounts',users[key].uid,tokens[key]);
      assert.equal(own.response.ok,true,own.text);
      const record=decodeFields(own.body.fields);
      assert.equal(record.active,true);assert.deepEqual(record.capabilities,CAPABILITIES);
      const controls=await writeControls(users[key].uid,tokens[key],TRUE_CONTROLS,{create:true});
      assert.equal(controls.response.ok,true,`${key} self-controls failed: ${controls.text}`);
    }
    log('Both approved accounts read their own authorization and unlock only themselves');

    const expiredTesterQuest=await getDoc('dailyQuests',today,tokens.explore);
    assert.equal(expiredTesterQuest.response.ok,true,expiredTesterQuest.text);
    const expiredNormalQuest=await getDoc('dailyQuests',today,tokens.normal);
    assert.equal(expiredNormalQuest.response.status,403,expiredNormalQuest.text);
    log('Morning Work tester override bypasses the server-time read gate only for the approved tester');

    const otherRead=await getDoc('testerAccounts',users.explore.uid,tokens.normal);
    assert.equal(otherRead.response.status,403,otherRead.text);
    const cross=await writeControls(users.teacher.uid,tokens.explore,FALSE_CONTROLS,{create:false});
    assert.equal(cross.response.status,403,cross.text);
    const reverseCross=await writeControls(users.explore.uid,tokens.teacher,FALSE_CONTROLS,{create:false});
    assert.equal(reverseCross.response.status,403,reverseCross.text);
    log('Each tester is denied when targeting the other tester UID');

    for(const key of ['normal','tech','legacy','inactive']){
      const denied=await writeControls(users[key].uid,tokens[key],TRUE_CONTROLS,{create:true});
      assert.equal(denied.response.status,403,`${key} unexpectedly wrote tester controls: ${denied.text}`);
    }
    const anonymous=await writeControls(users.normal.uid,'',TRUE_CONTROLS,{create:true});
    assert.ok([401,403].includes(anonymous.response.status),anonymous.text);
    log('Normal, tech-peo, legacy-profile, inactive, and anonymous identities have no tester powers');

    const directPoints=await patchDoc('students',users.explore.uid,{xp:999999},tokens.explore,['xp']);
    assert.equal(directPoints.response.status,403,directPoints.text);
    const grantSelf=await patchDoc('testerAccounts',users.explore.uid,{active:false},tokens.explore,['active']);
    assert.equal(grantSelf.response.status,403,grantSelf.text);
    log('Tester browser writes cannot edit balances or tester authorization directly');

    for(const [key,currency,amount] of [['explore','xp',10],['teacher','gold',5]]){
      const adjusted=await call('adjustTesterSelfPoints',tokens[key],{currency,amount});
      assert.equal(adjusted.response.ok,true,`${key} self-points failed: ${adjusted.text}`);
      const result=callableResult(adjusted);assert.equal(result.uid,users[key].uid);assert.equal(result.currency,currency);assert.equal(result.amount,amount);
      const saved=(await db.doc(`students/${users[key].uid}`).get()).data();
      assert.equal(saved[currency],key==='explore'?110:25);
    }
    const targetAttack=await call('adjustTesterSelfPoints',tokens.explore,{currency:'xp',amount:10,uid:users.teacher.uid});
    expectDenied(targetAttack,'Cross-UID self-points');
    for(const key of ['normal','tech','legacy','inactive'])expectDenied(await call('adjustTesterSelfPoints',tokens[key],{currency:'xp',amount:10}),`${key} self-points`);
    expectDenied(await call('adjustTesterSelfPoints','',{currency:'xp',amount:10}),'anonymous self-points');
    const transactions=await db.collection('studentTransactions').get();
    const audits=await db.collection('testerAudit').get();
    assert.equal(transactions.size,2);assert.equal(audits.size,2);
    for(const row of transactions.docs.map(doc=>doc.data())){assert.equal(row.source,'tester-self-control');assert.equal(row.actorUid,row.studentId);assert.ok(['xp','gold'].includes(row.currency));assert.ok(row.createdAt)}
    log('Self-points are atomic, self-only, timestamped, and written to the real ledger and audit');

    for(const key of ['explore','teacher']){
      const before=(await db.doc(`arcadeAccess/${users[key].uid}`).get()).data();
      const access=await call('getArcadeAccess',tokens[key],{});assert.equal(access.response.ok,true,access.text);assert.equal(callableResult(access).testerOverride,true);assert.equal(callableResult(access).teacherEnabled,true);
      const started=await call('startArcadeSession',tokens[key],{});assert.equal(started.response.ok,true,started.text);const result=callableResult(started);assert.equal(result.testerOverride,true);assert.equal(result.active,true);
      const session=(await db.doc(`arcadeSessions/${result.sessionId}`).get()).data();const after=(await db.doc(`arcadeAccess/${users[key].uid}`).get()).data();
      assert.equal(session.cost,0);assert.equal(session.source,'tester-self-control');assert.equal(after.tokens,before.tokens);
    }
    const normalLocked=await call('startArcadeSession',tokens.normal,{});expectDenied(normalLocked,'normal student locked Arcade');
    await db.doc('arcadeSettings/classAccess').set({enabled:true});await db.doc(`arcadeAccess/${users.normal.uid}`).set({individualEnabled:true},{merge:true});
    const normalStarted=await call('startArcadeSession',tokens.normal,{});assert.equal(normalStarted.response.ok,true,normalStarted.text);const normalResult=callableResult(normalStarted);const normalSession=(await db.doc(`arcadeSessions/${normalResult.sessionId}`).get()).data();const normalWallet=(await db.doc(`arcadeAccess/${users.normal.uid}`).get()).data();
    assert.equal(normalSession.cost,3);assert.equal(normalSession.source,'arcade-token-wallet');assert.equal(normalWallet.tokens,0);
    log('Arcade tester bypass costs zero while the unchanged normal path still costs three tokens');

    assert.equal((await db.collection('dailyQuestProgress').get()).empty,true);
    assert.equal((await db.collection('curriculumProgress').get()).empty,true);
    assert.equal((await db.doc('classData/dailyAccessOverride').get()).data().all,false);
    assert.equal((await db.doc('classData/kingdomAccess').get()).data().all,false);
    log('Unlocks create no grades, completion evidence, or classwide changes');

    await db.doc(`testerAccounts/${users.explore.uid}`).delete();
    const removed=await writeControls(users.explore.uid,tokens.explore,FALSE_CONTROLS,{create:false});
    assert.equal(removed.response.status,403,removed.text);
    expectDenied(await call('adjustTesterSelfPoints',tokens.explore,{currency:'xp',amount:10}),'removed tester self-points');
    const removedArcade=await call('getArcadeAccess',tokens.explore,{});assert.equal(removedArcade.response.ok,true,removedArcade.text);assert.equal(callableResult(removedArcade).testerOverride,false);assert.equal(callableResult(removedArcade).active,false);
    expectDenied(await call('startArcadeSession',tokens.explore,{}),'removed tester Arcade session');
    const revokedSessions=await db.collection('arcadeSessions').where('uid','==',users.explore.uid).get();assert.ok(revokedSessions.docs.some(doc=>doc.data().status==='revoked'));
    await db.doc(`testerAccounts/${users.explore.uid}`).set({email:RECORDS[0].email,active:true,label:RECORDS[0].label,capabilities:{...CAPABILITIES}});
    log('Removing an authorization document immediately removes tester powers');

    const teacherOwn=await getDoc('students',users.teacher.uid,tokens.teacher);assert.equal(teacherOwn.response.ok,true,teacherOwn.text);
    const teacherList=await jsonFetch(`${DB}/documents/testerAccounts?pageSize=20`,{headers:bearer(tokens.teacher)});assert.equal(teacherList.response.ok,true,teacherList.text);
    log('Teacher/Admin access remains available alongside tester powers');

    console.log('TRUE TESTER Firebase emulator security and callable gates: PASS');
  }finally{
    await Promise.all(admin.apps.map(app=>app.delete()));
  }
})().catch(error=>{console.error(error?.stack||error);process.exitCode=1});
