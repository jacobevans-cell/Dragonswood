(function(){
'use strict';
let allTimeBoard=null,loading=false,lastError='';
const originalLeaderboardsPage=leaderboardsPage;

function installBoard(){
  if(!allTimeBoard||!state.operations)return;
  if(state.operations.leaderboardAllTime===allTimeBoard)return;
  state.operations=Object.freeze({...state.operations,leaderboardAllTime:allTimeBoard});
}
async function loadAllTimeBoard(){
  if(loading||allTimeBoard)return;
  loading=true;lastError='';
  try{
    const [appMod,fsMod]=await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js')
    ]);
    const app=appMod.getApp('DragonswoodV33TeacherIntegration'),db=fsMod.getFirestore(app);
    if(window.DWV33Integration?.environment==='emulator')try{fsMod.connectFirestoreEmulator(db,'127.0.0.1',8080)}catch{}
    const snap=await fsMod.getDocs(fsMod.collection(db,'scores'));
    const scores=snap.docs.map(doc=>({id:doc.id,...doc.data()}));
    allTimeBoard=window.DWV33Operations.teacherLeaderboard(scores,[],new Date(),'all-time');
    installBoard();
  }catch(err){lastError=String(err?.message||err);console.warn('[V57.1.12 All-Time leaderboard]',err)}
  finally{
    loading=false;
    if(state.page==='leaderboards'&&state.leaderRange==='All Time')render();
  }
}

leaderboardsPage=function(){
  if(state.leaderRange!=='All Time')return originalLeaderboardsPage();
  if(allTimeBoard)installBoard();
  else if(!loading)queueMicrotask(loadAllTimeBoard);
  const normal=originalLeaderboardsPage();
  if(allTimeBoard)return normal;
  const note=lastError?`<div class="panel mt-12"><p class="muted">All-Time history could not load: ${escapeHtml(lastError)}</p></div>`:`<div class="panel mt-12"><p class="muted">Loading complete score history…</p></div>`;
  return normal+note;
};
})();
