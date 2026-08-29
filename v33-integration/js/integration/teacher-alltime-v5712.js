(function(){
'use strict';
const base=window.DWV33Integration;
if(!base?.startTeacher)return;
let allTimeBoard=null,allTimePromise=null;

function decodeValue(value={}){
  if('stringValue' in value)return value.stringValue;
  if('integerValue' in value)return Number(value.integerValue);
  if('doubleValue' in value)return Number(value.doubleValue);
  if('booleanValue' in value)return value.booleanValue;
  if('timestampValue' in value)return value.timestampValue;
  if('nullValue' in value)return null;
  if('arrayValue' in value)return (value.arrayValue.values||[]).map(decodeValue);
  if('mapValue' in value)return decodeFields(value.mapValue.fields||{});
  return undefined;
}
function decodeFields(fields={}){return Object.fromEntries(Object.entries(fields).map(([key,value])=>[key,decodeValue(value)]))}
async function loadAllTime(){
  if(allTimeBoard)return allTimeBoard;
  if(allTimePromise)return allTimePromise;
  allTimePromise=(async()=>{
    const [appMod,authMod]=await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js')
    ]);
    const app=appMod.getApp('DragonswoodV33TeacherIntegration'),auth=authMod.getAuth(app),user=auth.currentUser;
    if(!user)throw new Error('Teacher identity is not ready for lifetime leaderboard history.');
    const token=await user.getIdToken();
    const emulator=base.environment==='emulator';
    const project=emulator?'demo-dragonswood-v33':'dragonswood-9289e';
    const host=emulator?'http://127.0.0.1:8080':'https://firestore.googleapis.com';
    const endpoint=`${host}/v1/projects/${project}/databases/(default)/documents/scores?pageSize=1000`;
    const response=await fetch(endpoint,{headers:{authorization:`Bearer ${token}`}});
    if(!response.ok)throw new Error(`Lifetime leaderboard read failed (${response.status}).`);
    const body=await response.json();
    const scores=(body.documents||[]).map(doc=>({id:String(doc.name||'').split('/').pop(),...decodeFields(doc.fields||{})}));
    allTimeBoard=window.DWV33Operations.teacherLeaderboard(scores,[],new Date(),'all-time');
    return allTimeBoard;
  })().catch(err=>{allTimePromise=null;console.warn('[V57.1.12 lifetime leaderboard]',err);return null});
  return allTimePromise;
}
function augment(payload){
  if(payload?.status!=='authorized'||!payload.operations||!allTimeBoard)return payload;
  return Object.freeze({...payload,operations:Object.freeze({...payload.operations,leaderboardAllTime:allTimeBoard})});
}
async function startTeacher(onUpdate){
  let latest=null;
  const controller=await base.startTeacher(payload=>{
    latest=payload;
    onUpdate?.(augment(payload));
    if(payload?.status==='authorized'&&!allTimeBoard){
      loadAllTime().then(board=>{if(board&&latest?.status==='authorized')onUpdate?.(augment(latest))});
    }
  });
  return controller;
}
window.DWV33Integration=Object.freeze({...base,startTeacher});
})();
