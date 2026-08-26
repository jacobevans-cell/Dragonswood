'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../..');
const deps=name=>require(path.join(ROOT,'functions-arcade-access','node_modules',name));
const admin=deps('firebase-admin');
const {initializeApp}=deps('firebase/app');
const {getAuth,connectAuthEmulator,signInWithEmailAndPassword}=deps('firebase/auth');
const {getFirestore,connectFirestoreEmulator,doc,setDoc,serverTimestamp}=deps('firebase/firestore');

const PROJECT='demo-dragonswood-v33';
const AUTH='http://127.0.0.1:9099';
const FN=`http://127.0.0.1:5001/${PROJECT}/us-central1`;
const PASSWORD='Arcade-Gate-Only-2026!';
const checks=[];
function pass(name,detail=''){checks.push({name,detail});console.log(`PASS ${name}${detail?` — ${detail}`:''}`)}
async function json(url,options={}){const res=await fetch(url,{...options,headers:{'content-type':'application/json',...(options.headers||{})}});const text=await res.text();let body;try{body=text?JSON.parse(text):null}catch{body=text}return{res,body,text}}
async function signUp(email){const x=await json(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`,{method:'POST',body:JSON.stringify({email,password:PASSWORD,returnSecureToken:true})});assert.equal(x.res.ok,true,`${email}: ${x.text}`);return{uid:x.body.localId,email,token:x.body.idToken}}
async function call(account,name,data={}){const x=await json(`${FN}/${name}`,{method:'POST',headers:{authorization:`Bearer ${account.token}`},body:JSON.stringify({data})});if(!x.res.ok||x.body?.error){const err=new Error(`${name}: ${x.text}`);err.response=x;throw err}return x.body.result}
async function denied(account,name,data={}){let error;try{await call(account,name,data)}catch(err){error=err}assert.ok(error,`${name} should have been denied`);return error}

(async()=>{
  process.env.GCLOUD_PROJECT=PROJECT;
  process.env.FIREBASE_CONFIG=JSON.stringify({projectId:PROJECT});
  if(!admin.apps.length)admin.initializeApp({projectId:PROJECT});
  const adb=admin.firestore();
  const [student,student2,teacher,wrongTeacher,outsider]=await Promise.all([
    signUp('arcade.student@explore.academy'),signUp('arcade.student2@explore.academy'),
    signUp('jacobicusjax@gmail.com'),signUp('wrong.teacher@example.com'),signUp('arcade.outsider@example.com')
  ]);
  pass('Fictional Auth identities',`${PROJECT} only`);

  await denied(outsider,'getArcadeAccess');
  await denied(wrongTeacher,'setArcadeAvailability',{enabled:true});
  pass('Role enforcement','outsider and wrong teacher denied');

  let access=await call(student,'getArcadeAccess');
  assert.equal(access.tokens,0);assert.equal(access.teacherEnabled,false);assert.equal(access.active,false);
  await call(teacher,'setArcadeAvailability',{enabled:true});
  for(const criterion of ['ready','responsible','complete']){
    const award=await call(teacher,'awardArcadeCriterion',{uid:student.uid,criterion,periodId:'reading-p1'});
    assert.equal(award.awarded,true);
  }
  const duplicate=await call(teacher,'awardArcadeCriterion',{uid:student.uid,criterion:'ready',periodId:'reading-p1'});
  assert.equal(duplicate.awarded,false);assert.equal(duplicate.reason,'already-awarded');
  const full=await call(teacher,'awardArcadeCriterion',{uid:student.uid,criterion:'ready',periodId:'math-p2'});
  assert.equal(full.awarded,false);assert.equal(full.reason,'wallet-full');
  access=await call(student,'getArcadeAccess');assert.equal(access.tokens,3);
  pass('Token earning contract','three criteria, no duplicates, cap 3');

  for(const criterion of ['ready','responsible','complete'])await call(teacher,'awardArcadeCriterion',{uid:student2.uid,criterion,periodId:'reading-p1'});
  const [startedA,startedB]=await Promise.all([call(student2,'startArcadeSession'),call(student2,'startArcadeSession')]);
  assert.equal(startedA.sessionId,startedB.sessionId);assert.equal(startedA.active,true);assert.equal(startedB.active,true);
  assert.ok(startedA.remainingMs>29*60*1000&&startedA.remainingMs<=30*60*1000);
  assert.equal((await call(student2,'getArcadeAccess')).tokens,0);
  pass('Atomic session start','concurrent starts share one 30-minute session and one debit');

  await denied(student,'setArcadeAvailability',{enabled:false});
  const studentClient=initializeApp({apiKey:'demo-key',projectId:PROJECT,authDomain:`${PROJECT}.localhost`},'arcade-rules-student');
  const auth=getAuth(studentClient);connectAuthEmulator(auth,AUTH,{disableWarnings:true});await signInWithEmailAndPassword(auth,student2.email,PASSWORD);
  const db=getFirestore(studentClient);connectFirestoreEmulator(db,'127.0.0.1',8080);
  await assert.rejects(setDoc(doc(db,'arcadeAccess',student2.uid),{tokens:3},{merge:true}));
  pass('Server-owned wallet','direct client mutation denied');

  const scoreId=`${student2.uid}__daily__2099-01-01__dragon-dash`;
  await setDoc(doc(db,'arcadeScores',scoreId),{uid:student2.uid,studentKey:student2.uid,displayName:'Fictional Student',gameId:'dragon-dash',boardId:'dragon-dash',periodType:'daily',periodKey:'2099-01-01',score:100,metric:'100',details:{level:'gate'},schemaVersion:2,sessionId:startedA.sessionId,updatedAt:serverTimestamp()});
  await assert.rejects(setDoc(doc(db,'arcadeScores',scoreId),{uid:student2.uid,studentKey:student2.uid,displayName:'Fictional Student',gameId:'dragon-dash',boardId:'dragon-dash',periodType:'daily',periodKey:'2099-01-01',score:101,metric:'101',details:{level:'gate'},schemaVersion:2,sessionId:startedA.sessionId,unexpectedReward:999,updatedAt:serverTimestamp()}));
  pass('Session-bound score rules','valid record accepted; extra field denied');

  await setDoc(doc(db,'voidRunnerPlayers',student2.uid),{cells:1,unlocked:1,completed:[],runner:'runner-scout',achievements:[],challenges:{},storySeen:[],schemaVersion:2,arcadeSessionId:startedA.sessionId,updatedAt:serverTimestamp()});
  await call(teacher,'setArcadeAvailability',{enabled:false});
  access=await call(student2,'getArcadeAccess');assert.equal(access.active,false);assert.equal(access.teacherEnabled,false);
  const session=(await adb.doc(`arcadeSessions/${startedA.sessionId}`).get()).data();assert.equal(session.status,'locked');
  await assert.rejects(setDoc(doc(db,'arcadeScores',scoreId),{uid:student2.uid,studentKey:student2.uid,displayName:'Fictional Student',gameId:'dragon-dash',boardId:'dragon-dash',periodType:'daily',periodKey:'2099-01-01',score:102,metric:'102',details:{level:'gate'},schemaVersion:2,sessionId:startedA.sessionId,updatedAt:serverTimestamp()}));
  pass('Immediate teacher lock','active session terminated and later score denied');

  const ended=await adb.doc(`arcadeSessions/${startedA.sessionId}`).get();assert.equal(ended.exists,true);
  const refund=await call(teacher,'refundArcadeSession',{uid:student2.uid,sessionId:startedA.sessionId,reason:'fictional emulator technical test'});
  assert.equal(refund.refundTokens,3);assert.equal(refund.tokens,3);
  await denied(teacher,'refundArcadeSession',{uid:student2.uid,sessionId:startedA.sessionId,reason:'duplicate'});
  pass('Audited technical refund','one time, capped at wallet maximum');

  const audits=await adb.collection('arcadeAudit').get();assert.ok(audits.size>=6);
  pass('Audit trail',`${audits.size} server audit records`);
  console.log(`\nARCADE FUNCTIONS EMULATOR GATE: PASS (${checks.length} checks)`);
})().catch(err=>{console.error('\nARCADE FUNCTIONS EMULATOR GATE: FAIL');console.error(err.stack||err);process.exit(1)});
