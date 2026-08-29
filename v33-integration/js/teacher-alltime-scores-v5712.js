(function(){
'use strict';
let allTimeBoard=null,loading=false,lastError='';
const originalLeaderboardsPage=leaderboardsPage;

async function loadAllTimeBoard(){
  if(loading||allTimeBoard)return;
  loading=true;lastError='';
  try{
    const [appMod,fsMod]=await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js')
    ]);
    const app=appMod.getApp('DragonswoodV33TeacherIntegration'),db=fsMod.getFirestore(app);
    const snap=await fsMod.getDocs(fsMod.collection(db,'scores'));
    const scores=snap.docs.map(doc=>({id:doc.id,...doc.data()}));
    allTimeBoard=window.DWV33Operations.teacherLeaderboard(scores,[],new Date(),'all-time');
  }catch(err){lastError=String(err?.message||err)}
  finally{
    loading=false;
    if(state.page==='leaderboards'&&state.leaderRange==='All Time')render();
  }
}

leaderboardsPage=function(){
  if(state.leaderRange!=='All Time')return originalLeaderboardsPage();
  if(!allTimeBoard&&!loading)queueMicrotask(loadAllTimeBoard);
  if(!allTimeBoard){
    const normal=originalLeaderboardsPage();
    const note=lastError?`<div class="panel mt-12"><p class="muted">All-Time history could not load: ${escapeHtml(lastError)}</p></div>`:`<div class="panel mt-12"><p class="muted">Loading complete score history…</p></div>`;
    return normal+note;
  }
  const prior=state.operations;
  state.operations=Object.freeze({...prior,leaderboardAllTime:allTimeBoard});
  try{return originalLeaderboardsPage()}
  finally{state.operations=prior}
};
})();
