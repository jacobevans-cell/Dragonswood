'use strict';
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const admin=require('firebase-admin');
if(!admin.apps.length)admin.initializeApp();
const db=admin.firestore(),COLLECTION='factFluencyAttempts',TEACHER='jacobicusjax@gmail.com';
const authorized=async request=>{if(!request.auth)return false;const email=String(request.auth.token.email||'').toLowerCase();if(email===TEACHER||email.endsWith('@explore.academy'))return true;const tester=await db.doc('testerAccounts/'+request.auth.uid).get();return tester.exists&&tester.data()?.active===true};
const fail=message=>{throw new HttpsError('invalid-argument',message)};
exports.submitFactFluency=onCall({region:'us-central1',maxInstances:10},async request=>{
  if(!await authorized(request)||request.auth.token.email_verified!==true)throw new HttpsError('permission-denied','Sign in with your school account.');
  const x=request.data||{},kind=x.kind,uid=request.auth.uid,count=Number(x.count),id=String(x.id||'');
  if(!['multiplication','division'].includes(kind)||![36,144].includes(count)||!(/^[A-Za-z0-9-]{8,80}$/.test(id)))fail('Invalid test attempt.');
  if(!['4','5'].includes(String(x.grade))||typeof x.student!=='string'||!x.student.trim()||x.student.length>80)fail('Invalid student or grade.');
  if(!Array.isArray(x.responses)||x.responses.length!==count||!Number.isInteger(x.totalMs)||x.totalMs<0||x.totalMs>7200000)fail('Incomplete test attempt.');
  let correct=0,fastCorrect=0,correctTime=0;const responses=x.responses.map((row,i)=>{
    const a=Number(row?.a),b=Number(row?.b),timeMs=Number(row?.timeMs),answer=row?.answer;
    if(!Number.isInteger(a)||a<1||a>12||!Number.isInteger(b)||b<1||b>12||!Number.isInteger(timeMs)||timeMs<0||timeMs>7200000||!(answer===''||Number.isInteger(answer)&&answer>=0&&answer<=144))fail('Invalid answer at question '+(i+1)+'.');
    const expected=kind==='multiplication'?a*b:a,yes=answer!==''&&answer===expected;
    if(yes){correct++;correctTime+=timeMs;if(timeMs<=3000)fastCorrect++}
    return {a,b,answer,timeMs,correct:yes};
  });
  const ref=db.collection(COLLECTION).doc(uid+'_'+id),payload={studentId:uid,studentEmail:String(request.auth.token.email||''),studentName:x.student.trim(),grade:String(x.grade),kind,questionCount:count,correct,accuracy:Math.round(correct/count*1000)/10,totalMs:x.totalMs,averageCorrectMs:correct?Math.round(correctTime/correct):null,fastCorrect,responses,startedAt:String(x.startedAt||'').slice(0,40),savedAt:admin.firestore.FieldValue.serverTimestamp(),schemaVersion:1};
  if(!/^\d{4}-\d\d-\d\dT/.test(payload.startedAt))fail('Invalid test time.');
  try{await ref.create(payload)}catch(error){if(error.code!==6&&error.code!=='already-exists')throw error}
  return {saved:true,id:ref.id,correct,questionCount:count};
});
exports.listFactFluency=onCall({region:'us-central1',maxInstances:5},async request=>{
  if(!request.auth||String(request.auth.token.email||'').toLowerCase()!==TEACHER||request.auth.token.email_verified!==true)throw new HttpsError('permission-denied','Teacher account required.');
  const kind=String(request.data?.kind||'');if(!['multiplication','division'].includes(kind))fail('Invalid test.');
  const snap=await db.collection(COLLECTION).where('kind','==',kind).limit(1000).get();
  return {attempts:snap.docs.map(d=>{const x=d.data();return {id:d.id,studentId:x.studentId,studentEmail:x.studentEmail,studentName:x.studentName,grade:x.grade,kind:x.kind,questionCount:x.questionCount,correct:x.correct,accuracy:x.accuracy,totalMs:x.totalMs,averageCorrectMs:x.averageCorrectMs,fastCorrect:x.fastCorrect,startedAt:x.startedAt}})};
});
