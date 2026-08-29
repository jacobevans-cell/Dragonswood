(function(){
'use strict';
const base=window.DWV33Integration;
if(!base?.startTeacher)return;
let allTimeBoard=null,allTimePromise=null;

async function loadAllTime(){
  if(allTimeBoard)return allTimeBoard;
  if(allTimePromise)return allTimePromise;
  allTimePromise=(async()=>{
    const [appMod,fsMod]=await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js')
    ]);
    const app=appMod.getApp('DragonswoodV33TeacherIntegration'),db=fsMod.getFirestore(app);
    const snap=await fsMod.getDocs(fsMod.collection(db,'scores'));
    const scores=snap.docs.map(doc=>({id:doc.id,...doc.data()}));
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
