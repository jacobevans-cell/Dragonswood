'use strict';
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const admin=require('firebase-admin');
const {getFirestore,FieldValue,Timestamp}=require('firebase-admin/firestore');
const crypto=require('node:crypto');
const C=require('./core.js');
const T=require('./tester-core.js');
const A=require('./afternoon-core.js');

if(!admin.apps.length)admin.initializeApp();
const db=getFirestore();
const REGION='us-central1';
const OPTIONS={region:REGION,timeoutSeconds:30,memory:'256MiB',maxInstances:10};
const accessRef=uid=>db.doc(`arcadeAccess/${uid}`);
const settingsRef=()=>db.doc('arcadeSettings/classAccess');
const sessionRef=id=>db.doc(`arcadeSessions/${id}`);
const testerRef=uid=>db.doc(`testerAccounts/${uid}`);
const testerControlsRef=uid=>db.doc(`testerSelfControls/${uid}`);
const substituteRef=()=>db.doc('classData/substituteMode');
const freeArcadeRef=id=>db.doc(`arcadeFreeAccess/${id}`);
const studentRef=uid=>db.doc(`students/${uid}`);
const dailyQuery=uid=>db.collection('dailyQuestProgress').where('studentId','==',uid);
const curriculumQuery=uid=>db.collection('curriculumProgress').where('studentId','==',uid);

function requireAuth(request){if(!request.auth)throw new HttpsError('unauthenticated','Sign in to Dragonswood first.');return request.auth}
function requireTeacher(request){const auth=requireAuth(request);if(!C.isTeacherEmail(auth.token?.email))throw new HttpsError('permission-denied','Teacher access required.');return auth}
async function requireStudent(request){
  const auth=requireAuth(request),email=C.normalizedEmail(auth.token?.email);
  if(C.isTeacherEmail(email)||email.endsWith('@explore.academy'))return auth;
  const tester=await readTester(auth.uid);
  if(tester.session.isTester)return auth;
  throw new HttpsError('permission-denied','Authorized Dragonswood students only.');
}
function targetUid(request,teacherOnly=false){
  const auth=requireAuth(request),target=C.text(request.data?.uid||auth.uid);
  if(!target)throw new HttpsError('invalid-argument','A student uid is required.');
  if(target!==auth.uid&&!C.isTeacherEmail(auth.token?.email))throw new HttpsError('permission-denied','Students may access only their own Arcade state.');
  if(teacherOnly&&!C.isTeacherEmail(auth.token?.email))throw new HttpsError('permission-denied','Teacher access required.');
  return target;
}
async function audit(type,actorUid,target,data={}){
  await db.collection('arcadeAudit').add({type,actorUid,targetUid:target,...data,createdAt:FieldValue.serverTimestamp()});
}
function testerState(uid,accountSnap,controlsSnap){
  const session=T.normalizeTester(uid,accountSnap?.exists?accountSnap.data():null);
  return {session,controls:T.normalizeControls(session,controlsSnap?.exists?controlsSnap.data():{})};
}
async function readTester(uid){
  const [accountSnap,controlsSnap]=await Promise.all([testerRef(uid).get(),testerControlsRef(uid).get()]);
  return testerState(uid,accountSnap,controlsSnap);
}
function rows(snapshot){return snapshot?.docs?.map(doc=>({id:doc.id,...doc.data()}))||[]}
async function readAfternoon(uid,now=Date.now(),get=ref=>ref.get()){
  const [modeSnap,profileSnap,dailySnap,curriculumSnap]=await Promise.all([get(substituteRef()),get(studentRef(uid)),get(dailyQuery(uid)),get(curriculumQuery(uid))]);
  return A.assess({
    mode:modeSnap.exists?modeSnap.data():{},profile:profileSnap.exists?profileSnap.data():{},
    dailyRows:rows(dailySnap),curriculumRows:rows(curriculumSnap),dateKey:C.phoenixDateKey(new Date(now)),now
  });
}
async function readTeacherFreeArcade(uid,now=Date.now(),get=ref=>ref.get()){
  const [classSnap,studentSnap]=await Promise.all([get(freeArcadeRef('class')),get(freeArcadeRef(uid))]);
  const classExpiresAt=classSnap.exists?A.toMillis(classSnap.data()?.expiresAt):0,studentExpiresAt=studentSnap.exists?A.toMillis(studentSnap.data()?.expiresAt):0;
  const classActive=classExpiresAt>now,studentActive=studentExpiresAt>now,expiresAtMs=Math.max(classActive?classExpiresAt:0,studentActive?studentExpiresAt:0);
  return {active:classActive||studentActive,scope:studentActive?'individual':classActive?'class':'',expiresAtMs};
}
async function readActiveAfternoonSession(now=Date.now()){
  const snapshot=await substituteRef().get(),mode=snapshot.exists?snapshot.data():{},dateKey=C.phoenixDateKey(new Date(now)),active=A.activeMode(mode,dateKey,now);
  const currentMode=A.modeName(mode),arcadeForAll=active&&currentMode==='arcade-free';
  return {active,eligible:active,mode:currentMode,arcadeForAll,morningComplete:active,curriculumComplete:active,completedCount:0,expectedCount:0,expiresAtMs:active?A.toMillis(mode.expiresAt):0};
}
function accessView(access,settings,session,now,testerOverride,afternoon,teacherFree={}){
  const afternoonAccess=afternoon?.eligible===true,afternoonActive=afternoon?.active===true,teacherFreeAccess=teacherFree?.active===true,freeAccess=testerOverride||afternoonAccess||teacherFreeAccess;
  const effectiveSettings=freeAccess?{...settings,enabled:true}:afternoonActive?{...settings,enabled:false}:settings;
  const effectiveAccess=freeAccess?{...access,individualEnabled:true}:access;
  const testerRevoked=session?.testerSelfControl===true&&!testerOverride,afternoonRevoked=session?.afternoonSubstitute===true&&!afternoonAccess,effectiveSession=testerRevoked||afternoonRevoked?null:session;
  return {
    ...C.publicAccess(effectiveAccess,effectiveSettings,effectiveSession,now),testerOverride,
    freeAccess,teacherFreeAccess,teacherFreeScope:C.text(teacherFree?.scope),teacherFreeExpiresAtMillis:Number(teacherFree?.expiresAtMs)||0,afternoonSubstituteActive:afternoonActive,afternoonSubstituteAccess:afternoonAccess,substituteArcadeForAll:afternoon?.arcadeForAll===true,substituteArcadeMode:C.text(afternoon?.mode),
    afternoonRequirements:{morningComplete:afternoon?.morningComplete===true,curriculumComplete:afternoon?.curriculumComplete===true,completedCount:Number(afternoon?.completedCount)||0,expectedCount:Number(afternoon?.expectedCount)||0},
    afternoonExpiresAtMillis:Number(afternoon?.expiresAtMs)||0
  };
}
async function readPublic(uid,tester=undefined){
  const now=Date.now();
  const [aSnap,sSnap,teacherFree]=await Promise.all([accessRef(uid).get(),settingsRef().get(),readTeacherFreeArcade(uid,now)]);
  const access=aSnap.exists?aSnap.data():{},settings=sSnap.exists?sSnap.data():{};
  const id=C.text(access.currentSessionId);let session=null;
  if(id){const snap=await sessionRef(id).get();if(snap.exists)session={id:snap.id,...snap.data()}}
  const afternoon=session?.afternoonSubstitute===true&&C.activeSession(session,now)?await readActiveAfternoonSession(now):await readAfternoon(uid,now);
  const resolved=tester||await readTester(uid),testerOverride=T.unlockEnabled(resolved.session,resolved.controls,'unlockArcade');
  return accessView(access,settings,session,now,testerOverride,afternoon,teacherFree);
}

exports.getArcadeAccess=onCall(OPTIONS,async request=>{const auth=await requireStudent(request),tester=await readTester(auth.uid);return readPublic(targetUid(request),tester);});

exports.getArcadeTeacherState=onCall(OPTIONS,async request=>{
  requireTeacher(request);const uid=targetUid(request,true),dateKey=C.phoenixDateKey(),period=C.DAILY_PERIOD_ID;
  const result=await readPublic(uid),p=await db.doc(`arcadeTokenPeriods/${dateKey}_${period}_${uid}`).get();
  return {...result,uid,dateKey,periodId:period,awardSet:'phoenix-school-day',criteria:p.exists?(p.data().criteria||{}):{}};
});

exports.awardArcadeCriterion=onCall(OPTIONS,async request=>{
  const teacher=requireTeacher(request),uid=targetUid(request,true),which=C.criterion(request.data?.criterion),period=C.DAILY_PERIOD_ID;
  if(!which)throw new HttpsError('invalid-argument','Use Ready, Responsible, or Complete.');
  const dateKey=C.phoenixDateKey(),aRef=accessRef(uid),pRef=db.doc(`arcadeTokenPeriods/${dateKey}_${period}_${uid}`);
  const result=await db.runTransaction(async tx=>{
    const [aSnap,pSnap]=await Promise.all([tx.get(aRef),tx.get(pRef)]),access=aSnap.exists?aSnap.data():{},p=pSnap.exists?pSnap.data():{};
    const tokens=C.clampTokens(access.tokens),criteria={...(p.criteria||{})};
    if(criteria[which]===true)return {awarded:false,reason:'already-awarded',tokens,criteria};
    if(tokens>=C.TOKEN_CAP)return {awarded:false,reason:'wallet-full',tokens,criteria};
    criteria[which]=true;
    tx.set(aRef,{uid,tokens:tokens+1,updatedAt:FieldValue.serverTimestamp()},{merge:true});
    tx.set(pRef,{uid,dateKey,periodId:period,awardSet:'phoenix-school-day',criteria,totalAwarded:Object.values(criteria).filter(Boolean).length,teacherUid:teacher.uid,updatedAt:FieldValue.serverTimestamp()},{merge:true});
    return {awarded:true,reason:'awarded',tokens:tokens+1,criteria};
  });
  await audit('criterion-award',teacher.uid,uid,{dateKey,periodId:period,criterion:which,awarded:result.awarded});
  return result;
});

exports.startArcadeSession=onCall(OPTIONS,async request=>{
  const auth=await requireStudent(request),uid=auth.uid,aRef=accessRef(uid),sRef=settingsRef(),newRef=db.collection('arcadeSessions').doc(),now=Date.now();
  const result=await db.runTransaction(async tx=>{
    const [aSnap,settingsSnap,accountSnap,controlsSnap,afternoon,teacherFree]=await Promise.all([tx.get(aRef),tx.get(sRef),tx.get(testerRef(uid)),tx.get(testerControlsRef(uid)),readAfternoon(uid,now,ref=>tx.get(ref)),readTeacherFreeArcade(uid,now,ref=>tx.get(ref))]),access=aSnap.exists?aSnap.data():{},settings=settingsSnap.exists?settingsSnap.data():{};
    const tester=testerState(uid,accountSnap,controlsSnap),email=C.normalizedEmail(auth.token?.email),ordinaryStudent=C.isTeacherEmail(email)||email.endsWith('@explore.academy');
    if(!ordinaryStudent&&!tester.session.isTester)throw new HttpsError('permission-denied','Authorized Dragonswood students only.');
    const testerOverride=T.unlockEnabled(tester.session,tester.controls,'unlockArcade'),afternoonOverride=afternoon.eligible===true,teacherFreeOverride=teacherFree.active===true,freeAccess=testerOverride||afternoonOverride||teacherFreeOverride,effectiveSettings=freeAccess?{...settings,enabled:true}:afternoon.active?{...settings,enabled:false}:settings,effectiveAccess=freeAccess?{...access,individualEnabled:true}:access;
    let prior=null,priorRef=null;
    if(C.text(access.currentSessionId)){priorRef=sessionRef(access.currentSessionId);const snap=await tx.get(priorRef);if(snap.exists)prior={id:snap.id,...snap.data()}}
    const revokedTesterSession=prior?.testerSelfControl===true&&!testerOverride,revokedAfternoonSession=prior?.afternoonSubstitute===true&&!afternoonOverride;
    const revokedTeacherFreeSession=prior?.teacherFreeAccess===true&&!teacherFreeOverride;
    if(prior&&C.activeSession(prior,now)&&C.effectiveEnabled(effectiveAccess,effectiveSettings)&&!revokedTesterSession&&!revokedAfternoonSession&&!revokedTeacherFreeSession)return {...accessView(access,settings,prior,now,testerOverride,afternoon,teacherFree),accessSource:C.text(prior.source),reused:true};
    if(revokedTesterSession){tx.set(priorRef,{status:'revoked',endReason:'tester-authorization-removed',endedAt:FieldValue.serverTimestamp()},{merge:true});tx.set(aRef,{currentSessionId:'',sessionStatus:'revoked',updatedAt:FieldValue.serverTimestamp()},{merge:true});return {revokedTesterSession:true}}
    if(!C.effectiveEnabled(effectiveAccess,effectiveSettings)){
      if(prior&&prior.status==='active')tx.set(priorRef,{status:'locked',endReason:'teacher-lock',endedAt:FieldValue.serverTimestamp()},{merge:true});
      throw new HttpsError('failed-precondition',afternoon.active?'Finish today’s Morning Work and every Curriculum Quest lesson to unlock free Afternoon Arcade Time.':'Arcade Time is locked by the teacher.');
    }
    const tokens=C.clampTokens(access.tokens),cost=freeAccess?0:C.SESSION_COST;
    if(tokens<cost)throw new HttpsError('failed-precondition','Three Arcade Tokens are required.');
    if(prior&&prior.status==='active')tx.set(priorRef,{status:'expired',endReason:'expired',endedAt:FieldValue.serverTimestamp()},{merge:true});
    const source=teacherFreeOverride?`teacher-free-${teacherFree.scope}`:afternoonOverride?(afternoon.arcadeForAll?'substitute-arcade-free':'afternoon-substitute'):testerOverride?'tester-self-control':'arcade-token-wallet',endAt=teacherFreeOverride?teacherFree.expiresAtMs:afternoonOverride?afternoon.expiresAtMs:now+C.SESSION_MS;
    const session={uid,status:'active',cost,source,testerSelfControl:testerOverride,afternoonSubstitute:afternoonOverride,teacherFreeAccess:teacherFreeOverride,startAt:Timestamp.fromMillis(now),endAt:Timestamp.fromMillis(endAt),createdAt:FieldValue.serverTimestamp(),schemaVersion:1};
    tx.create(newRef,session);
    tx.set(aRef,{uid,tokens:tokens-cost,currentSessionId:newRef.id,sessionStatus:'active',updatedAt:FieldValue.serverTimestamp()},{merge:true});
    return {...accessView({...access,tokens:tokens-cost,currentSessionId:newRef.id},settings,{id:newRef.id,...session},now,testerOverride,afternoon,teacherFree),accessSource:source,reused:false};
  });
  if(result.revokedTesterSession)throw new HttpsError('failed-precondition','Tester Arcade authorization was removed. Start again only if ordinary Arcade access is available.');
  await audit('session-start',auth.uid,uid,{sessionId:result.sessionId,reused:result.reused===true,source:result.accessSource||'arcade-token-wallet'});
  return result;
});

exports.setArcadeFreeAccess=onCall(OPTIONS,async request=>{
  const teacher=requireTeacher(request),scope=C.text(request.data?.scope),uid=C.text(request.data?.uid),enabled=request.data?.enabled!==false;
  if(!['class','individual'].includes(scope))throw new HttpsError('invalid-argument','Scope must be class or individual.');
  if(scope==='individual'&&!uid)throw new HttpsError('invalid-argument','Choose a student first.');
  const target=scope==='class'?'class':uid,expiresAt=enabled?Timestamp.fromMillis(Date.now()+60*60*1000):Timestamp.fromMillis(0);
  await freeArcadeRef(target).set({scope,uid:scope==='individual'?uid:'',enabled,expiresAt,teacherUid:teacher.uid,updatedAt:FieldValue.serverTimestamp()},{merge:false});
  await audit('free-access',teacher.uid,target,{enabled,scope,durationMinutes:enabled?60:0});
  return {ok:true,enabled,scope,uid:scope==='individual'?uid:'',expiresAtMillis:enabled?expiresAt.toMillis():0};
});

exports.endArcadeSession=onCall(OPTIONS,async request=>{
  const auth=requireAuth(request),uid=targetUid(request),aRef=accessRef(uid);
  const result=await db.runTransaction(async tx=>{
    const aSnap=await tx.get(aRef),access=aSnap.exists?aSnap.data():{},id=C.text(request.data?.sessionId||access.currentSessionId);
    if(!id)return {ended:false,reason:'no-session'};
    const ref=sessionRef(id),snap=await tx.get(ref);if(!snap.exists)return {ended:false,reason:'missing-session'};
    const session=snap.data();if(session.uid!==uid)throw new HttpsError('permission-denied','Session ownership mismatch.');
    if(session.status!=='active')return {ended:false,reason:session.status||'closed'};
    tx.set(ref,{status:'ended',endReason:C.text(request.data?.reason||'student-exit').slice(0,40),endedAt:FieldValue.serverTimestamp()},{merge:true});
    if(access.currentSessionId===id)tx.set(aRef,{currentSessionId:'',sessionStatus:'ended',updatedAt:FieldValue.serverTimestamp()},{merge:true});
    return {ended:true,sessionId:id};
  });
  await audit('session-end',auth.uid,uid,{sessionId:result.sessionId||'',ended:result.ended});return result;
});

exports.recordArcadeGameResult=onCall(OPTIONS,async request=>{
  const auth=await requireStudent(request),uid=auth.uid,envelope=request.data?.result||{},sessionId=C.text(request.data?.sessionId);
  const allowedGames=new Set(['runeball-arena','runewheel-rally','dragons-gambit-hall','starfall-squadron','defenders-of-dragonswood']);
  if(Number(envelope.schemaVersion)!==1||envelope.completed!==true||!allowedGames.has(C.text(envelope.gameId)))throw new HttpsError('invalid-argument','Unknown Arcade result contract.');
  const resultId=C.text(envelope.resultId).slice(0,180);if(!resultId)throw new HttpsError('invalid-argument','A result id is required.');
  const encoded=JSON.stringify(envelope.result||{});if(encoded.length>30000)throw new HttpsError('invalid-argument','Arcade result is too large.');
  const ref=db.doc(`arcadeGameResults/${crypto.createHash('sha256').update(`${uid}:${envelope.gameId}:${resultId}`).digest('hex')}`),activeRef=sessionRef(sessionId);
  let created=false;
  await db.runTransaction(async tx=>{const [existing,sessionSnap]=await Promise.all([tx.get(ref),tx.get(activeRef)]);if(!sessionSnap.exists)throw new HttpsError('failed-precondition','The Arcade session is missing.');const session=sessionSnap.data();if(session.uid!==uid||session.status!=='active'||session.endAt.toMillis()<=Date.now())throw new HttpsError('failed-precondition','The Arcade session is not active.');if(existing.exists)return;created=true;tx.create(ref,{uid,studentId:uid,sessionId,gameId:C.text(envelope.gameId),gameVersion:Math.max(1,Math.min(10000,Number(envelope.gameVersion)||1)),resultId,result:JSON.parse(encoded),completed:true,dateKey:C.phoenixDateKey(),source:'arcade-result-contract',schemaVersion:1,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()})});
  if(created)await audit('game-result',uid,uid,{sessionId,gameId:C.text(envelope.gameId),resultId});
  return {acknowledged:true,idempotent:!created,gameId:C.text(envelope.gameId),resultId};
});

exports.setArcadeAvailability=onCall(OPTIONS,async request=>{
  const teacher=requireTeacher(request),enabled=request.data?.enabled===true,uid=C.text(request.data?.uid||'');
  if(uid){
    const aRef=accessRef(uid);
    await db.runTransaction(async tx=>{
      const aSnap=await tx.get(aRef),access=aSnap.exists?aSnap.data():{},id=C.text(access.currentSessionId);let active=null,ref=null;
      if(id){ref=sessionRef(id);const snap=await tx.get(ref);if(snap.exists)active=snap.data()}
      tx.set(aRef,{uid,individualEnabled:enabled,updatedAt:FieldValue.serverTimestamp()},{merge:true});
      if(!enabled&&active?.status==='active')tx.set(ref,{status:'locked',endReason:'teacher-lock',endedAt:FieldValue.serverTimestamp()},{merge:true});
    });
  }else{
    await settingsRef().set({enabled,updatedAt:FieldValue.serverTimestamp(),teacherUid:teacher.uid},{merge:true});
    const accessSnap=await db.collection('arcadeAccess').limit(400).get(),accessBatch=db.batch();
    accessSnap.docs.forEach(doc=>accessBatch.set(doc.ref,{individualEnabled:FieldValue.delete(),updatedAt:FieldValue.serverTimestamp()},{merge:true}));
    if(!accessSnap.empty)await accessBatch.commit();
    if(!enabled){
      const snap=await db.collection('arcadeSessions').where('status','==','active').limit(400).get(),batch=db.batch();
      snap.docs.forEach(doc=>batch.set(doc.ref,{status:'locked',endReason:'class-lock',endedAt:FieldValue.serverTimestamp()},{merge:true}));
      if(!snap.empty)await batch.commit();
    }
  }
  await audit('availability',teacher.uid,uid||'class',{enabled,scope:uid?'individual':'class'});return {ok:true,enabled,scope:uid?'individual':'class',uid};
});

exports.refundArcadeSession=onCall(OPTIONS,async request=>{
  const teacher=requireTeacher(request),uid=targetUid(request,true),id=C.text(request.data?.sessionId);
  if(!id)throw new HttpsError('invalid-argument','A session id is required.');
  const aRef=accessRef(uid),ref=sessionRef(id);
  const result=await db.runTransaction(async tx=>{
    const [aSnap,sSnap]=await Promise.all([tx.get(aRef),tx.get(ref)]);
    if(!sSnap.exists)throw new HttpsError('not-found','Arcade session not found.');
    const session=sSnap.data();if(session.uid!==uid)throw new HttpsError('permission-denied','Session ownership mismatch.');
    if(session.refundedAt)throw new HttpsError('already-exists','This session already received its one technical refund.');
    const tokens=C.clampTokens(aSnap.data()?.tokens),amount=Math.max(0,Math.min(C.SESSION_COST,Number(session.cost)||C.SESSION_COST,C.TOKEN_CAP-tokens));
    tx.set(aRef,{uid,tokens:tokens+amount,updatedAt:FieldValue.serverTimestamp()},{merge:true});
    tx.set(ref,{refundedAt:FieldValue.serverTimestamp(),refundedBy:teacher.uid,refundTokens:amount,refundReason:C.text(request.data?.reason||'technical issue').slice(0,160)},{merge:true});
    return {refunded:true,tokens:tokens+amount,refundTokens:amount};
  });
  await audit('technical-refund',teacher.uid,uid,{sessionId:id,refundTokens:result.refundTokens,reason:C.text(request.data?.reason).slice(0,160)});return result;
});

exports.adjustTesterSelfPoints=onCall(OPTIONS,async request=>{
  const auth=requireAuth(request),payload=request.data||{};
  if(payload.uid!==undefined||payload.studentId!==undefined||payload.targetUid!==undefined)throw new HttpsError('permission-denied','Tester points are self-only; target identifiers are not accepted.');
  const currency=C.text(payload.currency).toLowerCase(),amount=Number(payload.amount);
  if(!['xp','gold'].includes(currency))throw new HttpsError('invalid-argument','Currency must be XP or Gold.');
  if(!Number.isInteger(amount)||amount<1||amount>1000)throw new HttpsError('invalid-argument','Amount must be a whole number from 1 to 1000.');
  const uid=auth.uid,studentRef=db.doc(`students/${uid}`),transactionRef=db.collection('studentTransactions').doc(),auditRef=db.collection('testerAudit').doc();
  return db.runTransaction(async tx=>{
    const [accountSnap,studentSnap]=await Promise.all([tx.get(testerRef(uid)),tx.get(studentRef)]),session=T.normalizeTester(uid,accountSnap.exists?accountSnap.data():null);
    if(!T.hasCapability(session,'selfAwardPoints'))throw new HttpsError('permission-denied','Active tester self-points capability required.');
    if(!studentSnap.exists)throw new HttpsError('failed-precondition','Your student profile is missing.');
    const student=studentSnap.data()||{},before=Math.max(0,Number(student[currency])||0),after=before+amount;
    if(!Number.isSafeInteger(after)||after>1000000000)throw new HttpsError('failed-precondition','The resulting balance is outside the supported range.');
    const common={studentId:uid,actorUid:uid,currency,stat:currency,amount,source:'tester-self-control',createdAt:FieldValue.serverTimestamp()};
    tx.update(studentRef,{[currency]:after,updatedAt:FieldValue.serverTimestamp()});
    tx.create(transactionRef,{...common,studentName:C.text(student.firstName||student.displayName||auth.token?.name||auth.token?.email||'Tester'),reason:'Authorized tester self-award',category:'tester-self-control',before,after});
    tx.create(auditRef,{...common,type:'self-points',before,after});
    return {ok:true,uid,currency,amount,before,after,transactionId:transactionRef.id};
  });
});
