(function(){
  'use strict';
  const Core=window.DWV33Core;
  const Academic=window.DWV33Academic;
  const World=window.DWV33World;
  if(!Core||!Academic||!World)throw new Error('DWV33Core, DWV33Academic, and DWV33World must load before integration runtime.');

  const PRODUCTION_FIREBASE_CONFIG=Object.freeze({apiKey:'AIzaSyC918WJoGQgxRKsqcz-3bXI7iZWv_1bwYE',authDomain:'dragonswood-9289e.firebaseapp.com',projectId:'dragonswood-9289e',storageBucket:'dragonswood-9289e.firebasestorage.app',messagingSenderId:'1064477064695',appId:'1:1064477064695:web:283e1016ee2303d39042f2',measurementId:'G-LPRLDGVBD2'});
  const EMULATOR_FIREBASE_CONFIG=Object.freeze({apiKey:'demo-key',authDomain:'demo-dragonswood-v33.localhost',projectId:'demo-dragonswood-v33',storageBucket:'demo-dragonswood-v33.appspot.com',messagingSenderId:'000000000000',appId:'1:000000000000:web:demo-v33'});
  const DOMAIN=Core.STUDENT_DOMAIN;
  const TEACHER=Core.TEACHER_EMAIL;
  const VERSION='v33-student-world-1';
  const params=new URLSearchParams(location.search);
  const requestedEnv=params.get('dw-env')||'emulator';
  const prodReadOnly=requestedEnv==='production-readonly'&&params.get('dw-readonly')==='I_UNDERSTAND';
  const environment=prodReadOnly?'production-readonly':'emulator';
  const controllers=[];
  let sdkPromise=null;

  function emit(cb,payload){try{cb?.(Object.freeze({...payload,environment,version:VERSION}))}catch(err){console.error('[V3.3 integration callback]',err)}}
  async function sdk(){
    if(sdkPromise)return sdkPromise;
    sdkPromise=Promise.all([
      import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js')
    ]).then(([app,auth,firestore])=>({app,auth,firestore}));
    return sdkPromise;
  }

  async function createFirebase(role){
    const S=await sdk();
    const appName=role==='teacher'?'DragonswoodV33TeacherIntegration':'';
    const firebaseConfig=environment==='emulator'?EMULATOR_FIREBASE_CONFIG:PRODUCTION_FIREBASE_CONFIG;
    let firebaseApp;
    try{firebaseApp=appName?S.app.getApp(appName):S.app.getApp()}catch{firebaseApp=appName?S.app.initializeApp(firebaseConfig,appName):S.app.initializeApp(firebaseConfig)}
    const auth=S.auth.getAuth(firebaseApp),db=S.firestore.getFirestore(firebaseApp);
    if(environment==='emulator'){
      try{S.auth.connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true})}catch{}
      try{S.firestore.connectFirestoreEmulator(db,'127.0.0.1',8080)}catch{}
    }
    return {S,auth,db};
  }

  function blockedMessage(){
    return requestedEnv==='production-readonly'&&!prodReadOnly
      ?'Production reads are locked. Use the explicit read-only confirmation parameter from the integration guide.'
      :'Integration runtime is unavailable.';
  }



  async function startStudent(onUpdate){
    if(requestedEnv==='production-readonly'&&!prodReadOnly){emit(onUpdate,{status:'blocked',message:blockedMessage()});return {environment,signIn:async()=>{},signOut:async()=>{},dispose(){}}}
    emit(onUpdate,{status:'loading',message:'Loading secure student sign-in…'});
    let F;
    try{F=await createFirebase('student')}catch(err){emit(onUpdate,{status:'error',message:`Firebase could not load: ${err?.message||err}`});return {environment,signIn:async()=>{},signOut:async()=>{},dispose(){}}}
    const {S,auth,db}=F;
    let profileUnsub=null,dailyUnsub=null,overrideUnsub=null,scribeUnsub=null,responsesUnsub=null,gamesUnsub=null,scheduleUnsub=null,jobsUnsub=null,eventsUnsub=null,jobWeekUnsub=null,scoresUnsub=null,rewardsUnsub=null,lootUnsub=null,prizesUnsub=null;
    let lastProfile=null,lastDaily=[],lastOverride={},lastScribe={},lastResponses=[],lastGames=[],lastSchedule={},lastJobs={},lastEvents=[],lastJobWeek=null,lastScores=[],lastRewards=[],lastLoot=[],lastPrizes=[],currentUser=null,testerAuthorized=false;
    const ready={profile:false,daily:false,override:false,scribe:false,responses:false,games:false,schedule:false,jobs:false,events:false,jobWeek:false,scores:false,rewards:false,loot:false,prizes:false};
    const clear=()=>{
      for(const fn of [profileUnsub,dailyUnsub,overrideUnsub,scribeUnsub,responsesUnsub,gamesUnsub,scheduleUnsub,jobsUnsub,eventsUnsub,jobWeekUnsub,scoresUnsub,rewardsUnsub,lootUnsub,prizesUnsub])try{fn?.()}catch{}
      profileUnsub=dailyUnsub=overrideUnsub=scribeUnsub=responsesUnsub=gamesUnsub=scheduleUnsub=jobsUnsub=eventsUnsub=jobWeekUnsub=scoresUnsub=rewardsUnsub=lootUnsub=prizesUnsub=null;
      lastProfile=null;lastDaily=[];lastOverride={};lastScribe={};lastResponses=[];lastGames=[];lastSchedule={};lastJobs={};lastEvents=[];lastJobWeek=null;lastScores=[];lastRewards=[];lastLoot=[];lastPrizes=[];
      for(const key of Object.keys(ready))ready[key]=false;testerAuthorized=false;
    };
    const push=()=>{
      if(!currentUser||!Object.values(ready).every(Boolean))return;
      emit(onUpdate,{status:'authorized',user:currentUser,
        student:Core.normalizeStudent(currentUser,lastProfile,lastDaily,lastOverride,testerAuthorized),
        academic:Academic.studentAcademic(lastScribe,lastResponses,lastGames),
        world:World.studentWorld(currentUser.uid,lastProfile,lastSchedule,lastJobs,lastEvents,lastJobWeek,lastScores,lastRewards,lastLoot,lastPrizes)});
    };
    const authUnsub=S.auth.onAuthStateChanged(auth,async user=>{
      clear();currentUser=user||null;
      if(!user){emit(onUpdate,{status:'signed-out',message:'Sign in with your school Google account.'});return}
      emit(onUpdate,{status:'checking',user,message:'Checking Dragonswood access…'});
      const email=Core.normalizedEmail(user.email);
      let tester=false;
      if(!Core.isExploreEmail(email)&&!Core.isTeacherEmail(email)){
        try{tester=(await S.firestore.getDoc(S.firestore.doc(db,'testerAccounts',user.uid))).exists()}catch{tester=false}
      }
      if(!Core.isStudentEligibleEmail(email,tester)){
        emit(onUpdate,{status:'unauthorized',user,message:'This account is not authorized for Dragonswood.'});return;
      }
      testerAuthorized=tester;
      const watchDoc=(path,key,setter,label)=>S.firestore.onSnapshot(S.firestore.doc(db,...path),snap=>{setter(snap.exists()?{id:snap.id,...snap.data()}:{});ready[key]=true;push()},err=>emit(onUpdate,{status:'error',user,message:`${label} read failed: ${err?.code||err?.message||err}`}));
      const watchQuery=(query,key,setter,label)=>S.firestore.onSnapshot(query,snap=>{setter(snap.docs.map(d=>({id:d.id,...d.data()})));ready[key]=true;push()},err=>emit(onUpdate,{status:'error',user,message:`${label} read failed: ${err?.code||err?.message||err}`}));
      profileUnsub=watchDoc(['students',user.uid],'profile',value=>{lastProfile=value},'Student profile');
      dailyUnsub=watchQuery(S.firestore.query(S.firestore.collection(db,'dailyQuestProgress'),S.firestore.where('studentId','==',user.uid)),'daily',value=>{lastDaily=value},'Daily progress');
      overrideUnsub=watchDoc(['classData','dailyAccessOverride'],'override',value=>{lastOverride=value},'Daily access override');
      scribeUnsub=watchDoc(['classData','activeWritingSession'],'scribe',value=>{lastScribe=value},'Writing mission');
      responsesUnsub=watchQuery(S.firestore.query(S.firestore.collection(db,'writingResponses'),S.firestore.where('studentId','==',user.uid)),'responses',value=>{lastResponses=value},'Writing portfolio');
      gamesUnsub=watchQuery(S.firestore.query(S.firestore.collection(db,'gameResults'),S.firestore.where('studentId','==',user.uid)),'games',value=>{lastGames=value},'Academic game history');
      scheduleUnsub=watchDoc(['classData','classSchedule'],'schedule',value=>{lastSchedule=value},'Class schedule');
      jobsUnsub=watchDoc(['classData','classJobs'],'jobs',value=>{lastJobs=value},'Class jobs');
      eventsUnsub=watchQuery(S.firestore.collection(db,'classCalendarEvents'),'events',value=>{lastEvents=value},'Class calendar');
      const wk=World.weekKey();
      jobWeekUnsub=watchDoc(['studentJobWeeks',`${user.uid}_${wk}`],'jobWeek',value=>{lastJobWeek=Object.keys(value).length?value:null},'Guild job week');
      scoresUnsub=watchQuery(S.firestore.collection(db,'scores'),'scores',value=>{lastScores=value},'Leaderboard scores');
      rewardsUnsub=watchQuery(S.firestore.collection(db,'leaderboardRewards'),'rewards',value=>{lastRewards=value},'Leaderboard rewards');
      lootUnsub=watchQuery(S.firestore.query(S.firestore.collection(db,'bossLoot'),S.firestore.where('studentId','==',user.uid)),'loot',value=>{lastLoot=value},'Boss loot');
      prizesUnsub=watchQuery(S.firestore.query(S.firestore.collection(db,'physicalPrizeDrops'),S.firestore.where('studentId','==',user.uid)),'prizes',value=>{lastPrizes=value},'Prize drops');
    });
    const requireEmulator=()=>{if(environment!=='emulator')throw new Error('Academic writes are locked outside the fictional Firebase emulator.');if(!currentUser)throw new Error('Sign in before saving academic work.')};
    const writingPayload=(session,responseText,status)=>{const metrics=Academic.writingMetrics(responseText);return {studentId:currentUser.uid,studentName:lastProfile?.firstName||currentUser.displayName||currentUser.email||'Scholar',sessionId:session.id,status,...metrics,sessionTitle:session.title,writingType:session.writingType,targetSkill:session.targetSkill,prompt:session.prompt,updatedAt:S.firestore.serverTimestamp(),...(status==='submitted'?{submittedAt:S.firestore.serverTimestamp()}:{})}};
    const controller={environment,
      async signIn(){const provider=new S.auth.GoogleAuthProvider();return S.auth.signInWithPopup(auth,provider)},async signOut(){return S.auth.signOut(auth)},
      async saveWriting(responseText){requireEmulator();const session=Academic.normalizeSession(lastScribe);if(!session)throw new Error('No active writing mission.');const id=Academic.sessionResponseId(session.id,currentUser.uid);await S.firestore.setDoc(S.firestore.doc(db,'writingResponses',id),writingPayload(session,responseText,'draft'),{merge:true});return id},
      async submitWriting(responseText){requireEmulator();const session=Academic.normalizeSession(lastScribe);if(!session)throw new Error('No active writing mission.');const metrics=Academic.writingMetrics(responseText);if(metrics.wordCount<session.minWords)throw new Error(`Write at least ${session.minWords} words before submitting.`);const id=Academic.sessionResponseId(session.id,currentUser.uid);const existing=lastResponses.find(row=>row.id===id);if(existing?.status==='submitted')throw new Error('This writing mission was already submitted.');await S.firestore.setDoc(S.firestore.doc(db,'writingResponses',id),writingPayload(session,responseText,'submitted'),{merge:true});return id},
      async checkOffJob(dayIndex){requireEmulator();const day=Math.max(0,Math.min(4,Number(dayIndex)));const wk=World.weekKey(),id=`${currentUser.uid}_${wk}`,job=World.assignedJob(currentUser.uid,lastJobs,lastJobWeek);if(!job)throw new Error('No class job is assigned this week.');await S.firestore.runTransaction(db,async tx=>{const ref=S.firestore.doc(db,'studentJobWeeks',id),snap=await tx.get(ref),data=snap.exists()?snap.data():{},checked=[...new Set([...(Array.isArray(data.checkedDays)?data.checkedDays:[]),day])].sort((a,b)=>a-b),payload={studentId:currentUser.uid,studentName:lastProfile?.firstName||'Scholar',weekKey:wk,jobId:job.id,jobName:job.name,jobIcon:job.icon,pay:job.pay,checkedDays:checked,completedCount:checked.length,paid:data.paid===true,updatedAt:S.firestore.serverTimestamp()};snap.exists()?tx.update(ref,{checkedDays:checked,completedCount:checked.length,updatedAt:S.firestore.serverTimestamp()}):tx.set(ref,payload)});return id},
      dispose(){clear();try{authUnsub()}catch{}}
    };
    controllers.push(controller);return controller;
  }

  async function startTeacher(onUpdate){
    if(requestedEnv==='production-readonly'&&!prodReadOnly){emit(onUpdate,{status:'blocked',message:blockedMessage()});return {environment,signIn:async()=>{},signOut:async()=>{},dispose(){}}}
    emit(onUpdate,{status:'loading',message:'Loading secure teacher sign-in…'});
    let F;
    try{F=await createFirebase('teacher')}catch(err){emit(onUpdate,{status:'error',message:`Firebase could not load: ${err?.message||err}`});return {environment,signIn:async()=>{},signOut:async()=>{},dispose(){}}}
    const {S,auth,db}=F;
    let rosterUnsub=null,dailyUnsub=null,curriculumUnsub=null,scribeUnsub=null,responsesUnsub=null,gamesUnsub=null,currentUser=null;
    let roster=[],daily=[],curriculum=[],scribe={},responses=[],games=[];
    const ready={roster:false,daily:false,curriculum:false,scribe:false,responses:false,games:false};
    try{await S.auth.setPersistence(auth,S.auth.browserSessionPersistence)}catch{}
    const clear=()=>{for(const fn of [rosterUnsub,dailyUnsub,curriculumUnsub,scribeUnsub,responsesUnsub,gamesUnsub])try{fn?.()}catch{} rosterUnsub=dailyUnsub=curriculumUnsub=scribeUnsub=responsesUnsub=gamesUnsub=null;for(const key of Object.keys(ready))ready[key]=false};
    const push=()=>{if(!currentUser||!Object.values(ready).every(Boolean))return;const students=Core.normalizeTeacherRoster(roster);emit(onUpdate,{status:'authorized',user:currentUser,teacherName:currentUser.displayName||'Mr. Evans',students,academic:Academic.teacherAcademic(students,scribe,responses,daily,curriculum,games)})};
    const authUnsub=S.auth.onAuthStateChanged(auth,user=>{
      clear();currentUser=user||null;
      if(!user){emit(onUpdate,{status:'signed-out',message:'Sign in with the authorized teacher Google account.'});return}
      const email=Core.normalizedEmail(user.email);
      if(!Core.isTeacherEmail(email)){emit(onUpdate,{status:'unauthorized',user,message:'This account does not have Teacher Command access.'});return}
      emit(onUpdate,{status:'checking',user,message:'Loading the live academic command view…'});
      const watch=(collection,key,setter)=>S.firestore.onSnapshot(S.firestore.collection(db,collection),snap=>{setter(snap.docs.map(d=>({id:d.id,...d.data()})));ready[key]=true;push()},err=>emit(onUpdate,{status:'error',user,message:`${collection} read failed: ${err?.code||err?.message||err}`}));
      rosterUnsub=watch('students','roster',value=>{roster=value});dailyUnsub=watch('dailyQuestProgress','daily',value=>{daily=value});curriculumUnsub=watch('curriculumAttempts','curriculum',value=>{curriculum=value});responsesUnsub=watch('writingResponses','responses',value=>{responses=value});gamesUnsub=watch('gameResults','games',value=>{games=value});
      scribeUnsub=S.firestore.onSnapshot(S.firestore.doc(db,'classData','activeWritingSession'),snap=>{scribe=snap.exists()?{id:snap.id,...snap.data()}:{};ready.scribe=true;push()},err=>emit(onUpdate,{status:'error',user,message:`Writing mission read failed: ${err?.code||err?.message||err}`}));
    });
    const requireEmulator=()=>{if(environment!=='emulator')throw new Error('Teacher academic writes are locked outside the fictional Firebase emulator.');if(!currentUser)throw new Error('Teacher sign-in required.')};
    const controller={environment,async signIn(){const provider=new S.auth.GoogleAuthProvider();return S.auth.signInWithPopup(auth,provider)},async signOut(){return S.auth.signOut(auth)},
      async launchWritingSession(input){requireEmulator();const ref=S.firestore.doc(S.firestore.collection(db,'writingSessions'));const payload={title:String(input.title||'Morning Quickwrite').slice(0,120),mode:String(input.mode||'Quickwrite').slice(0,40),writingType:String(input.writingType||'Narrative').slice(0,40),targetSkill:String(input.targetSkill||'Sensory Details').slice(0,80),prompt:String(input.prompt||'').slice(0,2000),timeMinutes:Math.max(1,Math.min(90,Number(input.timeMinutes)||5)),minWords:Math.max(1,Math.min(2000,Number(input.minWords)||75)),status:'active',createdBy:currentUser.uid,createdAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()};await S.firestore.setDoc(ref,payload);await S.firestore.setDoc(S.firestore.doc(db,'classData','activeWritingSession'),{...payload,sessionId:ref.id});return ref.id},
      async closeWritingSession(){requireEmulator();const session=Academic.normalizeSession(scribe);if(session)await S.firestore.setDoc(S.firestore.doc(db,'writingSessions',session.id),{status:'closed',closedAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()},{merge:true});await S.firestore.setDoc(S.firestore.doc(db,'classData','activeWritingSession'),{status:'closed',sessionId:'',closedAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()})},
      async reviewWriting(responseId,score,feedback){requireEmulator();const value=Math.max(0,Math.min(20,Number(score)));await S.firestore.setDoc(S.firestore.doc(db,'writingResponses',responseId),{teacherScore:value,teacherFeedback:String(feedback||'').slice(0,2000),teacherReviewedAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()},{merge:true})},
      dispose(){clear();try{authUnsub()}catch{}}};
    controllers.push(controller);return controller;
  }

  window.addEventListener('pagehide',()=>controllers.splice(0).forEach(c=>{try{c.dispose()}catch{}}),{once:true});
  window.DWV33Integration=Object.freeze({version:VERSION,environment,startStudent,startTeacher,core:Core,academic:Academic,world:World});
})();
