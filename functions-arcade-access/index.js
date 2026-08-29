'use strict';
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const admin=require('firebase-admin');
const {getFirestore,FieldValue,Timestamp}=require('firebase-admin/firestore');
const C=require('./core.js');

if(!admin.apps.length)admin.initializeApp();
const db=getFirestore();
const REGION='us-central1';
const OPTIONS={region:REGION,timeoutSeconds:30,memory:'256MiB',maxInstances:10};
const DAILY_PERIOD='daily';
const accessRef=uid=>db.doc(`arcadeAccess/${uid}`);
const settingsRef=()=>db.doc('arcadeSettings/classAccess');
const sessionRef=id=>db.doc(`arcadeSessions/${id}`);

function requireAuth(request){if(!request.auth)throw new HttpsError('unauthenticated','Sign in to Dragonswood first.');return request.auth}
function requireTeacher(request){const auth=requireAuth(request);if(!C.isTeacherEmail(auth.token?.email))throw new HttpsError('permission-denied','Teacher access required.');return auth}
async function requireStudent(request){
  const auth=requireAuth(request),email=C.normalizedEmail(auth.token?.email);
  if(C.isTeacherEmail(email)||email.endsWith('@explore.academy'))return auth;
  if((await db.doc(`testerAccounts/${auth.uid}`).get()).exists)return auth;
  throw new HttpsError('permission-denied','Authorized Dragonswood students only.');
}
function targetUid(request,teacherOnly=false){
  const auth=requireAuth(request),target=C.text(request.data?.uid||auth.uid);
  if(!target)throw new HttpsError('invalid-argument','A student uid is required.');
  if(target!==auth.uid&&!C.isTeacherEmail(auth.token?.email))throw new HttpsError('permission-denied','Students may access only their own Arcade state.');
  if(teacherOnly&&!C.isTeacherEmail(auth.token?.email))throw new HttpsError('permission-denied','Teacher access required.');
  return target;
}
async function audit(type,actorUid,target,data={}){await db.collection('arcadeAudit').add({type,actorUid,targetUid:target,...data,createdAt:FieldValue.serverTimestamp()})}
async function readPublic(uid){
  const now=Date.now();
  const [aSnap,sSnap]=await Promise.all([accessRef(uid).get(),settingsRef().get()]);
  const access=aSnap.exists?aSnap.data():{},settings=sSnap.exists?sSnap.data():{};
  const id=C.text(access.currentSessionId);let session=null;
  if(id){const snap=await sessionRef(id).get();if(snap.exists)session={id:snap.id,...snap.data()}}
  return C.publicAccess(access,settings,session,now);
}

exports.getArcadeAccess=onCall(OPTIONS,async request=>{await requireStudent(request);return readPublic(targetUid(request))});
exports.getArcadeTeacherState=onCall(OPTIONS,async request=>{
  requireTeacher(request);const uid=targetUid(request,true),dateKey=C.phoenixDateKey(),period=DAILY_PERIOD;
  const result=await readPublic(uid),p=await db.doc(`arcadeTokenPeriods/${dateKey}_${period}_${uid}`).get(),criteria=p.exists?(p.data().criteria||{}):{};
  return {...result,uid,dateKey,periodId:period,criteria};
});
exports.awardArcadeCriterion=onCall(OPTIONS,async request=>{
  const teacher=requireTeacher(request),uid=targetUid(request,true),which=C.criterion(request.data?.criterion),period=DAILY_PERIOD;
  if(!which)throw new HttpsError('invalid-argument','Use Ready, Responsible, or Complete.');
  const dateKey=C.phoenixDateKey(),aRef=accessRef(uid),pRef=db.doc(`arcadeTokenPeriods/${dateKey}_${period}_${uid}`);
  const result=await db.runTransaction(async tx=>{
    const [aSnap,pSnap]=await Promise.all([tx.get(aRef),tx.get(pRef)]),access=aSnap.exists?aSnap.data():{},p=pSnap.exists?pSnap.data():{};
    const tokens=C.clampTokens(access.tokens),criteria={...(p.criteria||{})};
    if(criteria[which]===true)return {awarded:false,reason:'already-awarded',tokens,criteria};
    if(tokens>=C.TOKEN_CAP)return {awarded:false,reason:'wallet-full',tokens,criteria};
    criteria[which]=true;
    tx.set(aRef,{uid,tokens:tokens+1,updatedAt:FieldValue.serverTimestamp()},{merge:true});
    tx.set(pRef,{uid,dateKey,periodId:period,criteria,totalAwarded:Object.values(criteria).filter(Boolean).length,teacherUid:teacher.uid,updatedAt:FieldValue.serverTimestamp()},{merge:true});
    return {awarded:true,reason:'awarded',tokens:tokens+1,criteria};
  });
  await audit('criterion-award',teacher.uid,uid,{dateKey,periodId:period,criterion:which,awarded:result.awarded});return result;
});
exports.startArcadeSession=onCall(OPTIONS,async request=>{
  const auth=await requireStudent(request),uid=auth.uid,aRef=accessRef(uid),sRef=settingsRef(),newRef=db.collection('arcadeSessions').doc(),now=Date.now();
  const result=await db.runTransaction(async tx=>{
    const [aSnap,settingsSnap]=await Promise.all([tx.get(aRef),tx.get(sRef)]),access=aSnap.exists?aSnap.data():{},settings=settingsSnap.exists?settingsSnap.data():{};
    let prior=null,priorRef=null;if(C.text(access.currentSessionId)){priorRef=sessionRef(access.currentSessionId);const snap=await tx.get(priorRef);if(snap.exists)prior={id:snap.id,...snap.data()}}
    if(prior&&C.activeSession(prior,now)&&C.effectiveEnabled(access,settings))return {...C.publicAccess(access,settings,prior,now),reused:true};
    if(!C.effectiveEnabled(access,settings)){if(prior&&prior.status==='active')tx.set(priorRef,{status:'locked',endReason:'teacher-lock',endedAt:FieldValue.serverTimestamp()},{merge:true});throw new HttpsError('failed-precondition','Arcade Time is locked by the teacher.')}
    const tokens=C.clampTokens(access.tokens);if(tokens<C.SESSION_COST)throw new HttpsError('failed-precondition','Three Arcade Tokens are required.');
    if(prior&&prior.status==='active')tx.set(priorRef,{status:'expired',endReason:'expired',endedAt:FieldValue.serverTimestamp()},{merge:true});
    const session={uid,status:'active',cost:C.SESSION_COST,startAt:Timestamp.fromMillis(now),endAt:Timestamp.fromMillis(now+C.SESSION_MS),createdAt:FieldValue.serverTimestamp(),schemaVersion:1};
    tx.create(newRef,session);tx.set(aRef,{uid,tokens:tokens-C.SESSION_COST,currentSessionId:newRef.id,sessionStatus:'active',updatedAt:FieldValue.serverTimestamp()},{merge:true});
    return {...C.publicAccess({...access,tokens:tokens-C.SESSION_COST,currentSessionId:newRef.id},settings,{id:newRef.id,...session},now),reused:false};
  });
  await audit('session-start',auth.uid,uid,{sessionId:result.sessionId,reused:result.reused===true});return result;
});
exports.endArcadeSession=onCall(OPTIONS,async request=>{
  const auth=requireAuth(request),uid=targetUid(request),aRef=accessRef(uid);
  const result=await db.runTransaction(async tx=>{
    const aSnap=await tx.get(aRef),access=aSnap.exists?aSnap.data():{},id=C.text(request.data?.sessionId||access.currentSessionId);if(!id)return {ended:false,reason:'no-session'};
    const ref=sessionRef(id),snap=await tx.get(ref);if(!snap.exists)return {ended:false,reason:'missing-session'};const session=snap.data();if(session.uid!==uid)throw new HttpsError('permission-denied','Session ownership mismatch.');if(session.status!=='active')return {ended:false,reason:session.status||'closed'};
    tx.set(ref,{status:'ended',endReason:C.text(request.data?.reason||'student-exit').slice(0,40),endedAt:FieldValue.serverTimestamp()},{merge:true});if(access.currentSessionId===id)tx.set(aRef,{currentSessionId:'',sessionStatus:'ended',updatedAt:FieldValue.serverTimestamp()},{merge:true});return {ended:true,sessionId:id};
  });
  await audit('session-end',auth.uid,uid,{sessionId:result.sessionId||'',ended:result.ended});return result;
});
exports.setArcadeAvailability=onCall(OPTIONS,async request=>{
  const teacher=requireTeacher(request),enabled=request.data?.enabled===true,uid=C.text(request.data?.uid||'');
  if(uid){
    const aRef=accessRef(uid);await db.runTransaction(async tx=>{const aSnap=await tx.get(aRef),access=aSnap.exists?aSnap.data():{},id=C.text(access.currentSessionId);let active=null,ref=null;if(id){ref=sessionRef(id);const snap=await tx.get(ref);if(snap.exists)active=snap.data()}tx.set(aRef,{uid,individualEnabled:enabled,updatedAt:FieldValue.serverTimestamp()},{merge:true});if(!enabled&&active?.status==='active')tx.set(ref,{status:'locked',endReason:'teacher-lock',endedAt:FieldValue.serverTimestamp()},{merge:true})});
  }else{
    await settingsRef().set({enabled,updatedAt:FieldValue.serverTimestamp(),teacherUid:teacher.uid},{merge:true});
    const accessSnap=await db.collection('arcadeAccess').limit(400).get();
    if(enabled&&!accessSnap.empty){const batch=db.batch();accessSnap.docs.forEach(doc=>batch.set(doc.ref,{individualEnabled:true,updatedAt:FieldValue.serverTimestamp()},{merge:true}));await batch.commit()}
    if(!enabled){const snap=await db.collection('arcadeSessions').where('status','==','active').limit(400).get(),batch=db.batch();snap.docs.forEach(doc=>batch.set(doc.ref,{status:'locked',endReason:'class-lock',endedAt:FieldValue.serverTimestamp()},{merge:true}));if(!snap.empty)await batch.commit()}
  }
  await audit('availability',teacher.uid,uid||'class',{enabled,scope:uid?'individual':'class'});return {ok:true,enabled,scope:uid?'individual':'class',uid};
});
exports.refundArcadeSession=onCall(OPTIONS,async request=>{
  const teacher=requireTeacher(request),uid=targetUid(request,true),id=C.text(request.data?.sessionId);if(!id)throw new HttpsError('invalid-argument','A session id is required.');const aRef=accessRef(uid),ref=sessionRef(id);
  const result=await db.runTransaction(async tx=>{const [aSnap,sSnap]=await Promise.all([tx.get(aRef),tx.get(ref)]);if(!sSnap.exists)throw new HttpsError('not-found','Arcade session not found.');const session=sSnap.data();if(session.uid!==uid)throw new HttpsError('permission-denied','Session ownership mismatch.');if(session.refundedAt)throw new HttpsError('already-exists','This session already received its one technical refund.');const tokens=C.clampTokens(aSnap.data()?.tokens),amount=Math.max(0,Math.min(C.SESSION_COST,Number(session.cost)||C.SESSION_COST,C.TOKEN_CAP-tokens));tx.set(aRef,{uid,tokens:tokens+amount,updatedAt:FieldValue.serverTimestamp()},{merge:true});tx.set(ref,{refundedAt:FieldValue.serverTimestamp(),refundedBy:teacher.uid,refundTokens:amount,refundReason:C.text(request.data?.reason||'technical issue').slice(0,160)},{merge:true});return {refunded:true,tokens:tokens+amount,refundTokens:amount}});
  await audit('technical-refund',teacher.uid,uid,{sessionId:id,refundTokens:result.refundTokens,reason:C.text(request.data?.reason).slice(0,160)});return result;
});
