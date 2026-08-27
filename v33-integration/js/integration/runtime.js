(function(){
  'use strict';
  const Core=window.DWV33Core;
  const Academic=window.DWV33Academic;
  const World=window.DWV33World;
  const Operations=window.DWV33Operations;
  if(!Core||!Academic||!World||!Operations)throw new Error('DWV33Core, DWV33Academic, DWV33World, and DWV33Operations must load before integration runtime.');

  const PRODUCTION_FIREBASE_CONFIG=Object.freeze({apiKey:'AIzaSyC918WJoGQgxRKsqcz-3bXI7iZWv_1bwYE',authDomain:'dragonswood-9289e.firebaseapp.com',projectId:'dragonswood-9289e',storageBucket:'dragonswood-9289e.firebasestorage.app',messagingSenderId:'1064477064695',appId:'1:1064477064695:web:283e1016ee2303d39042f2',measurementId:'G-LPRLDGVBD2'});
  const EMULATOR_FIREBASE_CONFIG=Object.freeze({apiKey:'demo-key',authDomain:'demo-dragonswood-v33.localhost',projectId:'demo-dragonswood-v33',storageBucket:'demo-dragonswood-v33.appspot.com',messagingSenderId:'000000000000',appId:'1:000000000000:web:demo-v33'});
  const DOMAIN=Core.STUDENT_DOMAIN;
  const TEACHER=Core.TEACHER_EMAIL;
  const VERSION='v33-teacher-operations-1';
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
    let currentUser=null,lastOperations=null;
    const unsubs=[];
    const data={roster:[],daily:[],curriculum:[],scribe:{},responses:[],games:[],bathroomRequests:[],snackRequests:[],passRequests:[],pointRequests:[],bathroomStatus:[],snackStatus:[],passStatus:[],passHistory:[],curriculumOverrides:[],dailyOverride:{},classMain:{},secondRecess:{},classPet:{},fieldTrip:{},universalPoints:{},classJobs:{},jobWeeks:[],classSchedule:{},calendarEvents:[],scores:[],leaderboardRewards:[]};
    const ready=Object.fromEntries(Object.keys(data).map(key=>[key,false]));
    try{await S.auth.setPersistence(auth,S.auth.browserSessionPersistence)}catch{}
    const clear=()=>{while(unsubs.length)try{unsubs.pop()?.()}catch{}for(const key of Object.keys(ready))ready[key]=false;lastOperations=null};
    const push=()=>{if(!currentUser||!Object.values(ready).every(Boolean))return;const rawById=new Map(data.roster.map(row=>[row.id,row])),students=Core.normalizeTeacherRoster(data.roster).map(row=>({...row,hp:Number(rawById.get(row.id)?.hp)||0,dailyXpEarned:Number(rawById.get(row.id)?.dailyXpEarned)||0}));lastOperations=Operations.teacherOperations({students,requests:{bathroomRequests:data.bathroomRequests,snackRequests:data.snackRequests,passRequests:data.passRequests},statuses:{bathroomStatus:data.bathroomStatus,snackStatus:data.snackStatus,passStatus:data.passStatus},pointRequests:data.pointRequests,passHistory:data.passHistory,curriculumOverrides:data.curriculumOverrides,dailyOverride:data.dailyOverride,classData:{main:data.classMain,secondRecess:data.secondRecess,classPet:data.classPet,fieldTrip:data.fieldTrip,universalPoints:data.universalPoints},classJobs:data.classJobs,jobWeeks:data.jobWeeks,classSchedule:data.classSchedule,calendarEvents:data.calendarEvents,scores:data.scores,leaderboardRewards:data.leaderboardRewards});emit(onUpdate,{status:'authorized',user:currentUser,teacherName:currentUser.displayName||'Mr. Evans',students,academic:Academic.teacherAcademic(students,data.scribe,data.responses,data.daily,data.curriculum,data.games),operations:lastOperations})};
    const authUnsub=S.auth.onAuthStateChanged(auth,user=>{
      clear();currentUser=user||null;
      if(!user){emit(onUpdate,{status:'signed-out',message:'Sign in with the authorized teacher Google account.'});return}
      const email=Core.normalizedEmail(user.email);
      if(!Core.isTeacherEmail(email)){emit(onUpdate,{status:'unauthorized',user,message:'This account does not have Teacher Command access.'});return}
      emit(onUpdate,{status:'checking',user,message:'Loading Teacher Command operations…'});
      const watchCollection=(collection,key=collection)=>unsubs.push(S.firestore.onSnapshot(S.firestore.collection(db,collection),snap=>{data[key]=snap.docs.map(d=>({id:d.id,...d.data()}));ready[key]=true;push()},err=>emit(onUpdate,{status:'error',user,message:`${collection} read failed: ${err?.code||err?.message||err}`})));
      const watchDoc=(id,key)=>unsubs.push(S.firestore.onSnapshot(S.firestore.doc(db,'classData',id),snap=>{data[key]=snap.exists()?{id:snap.id,...snap.data()}:{};ready[key]=true;push()},err=>emit(onUpdate,{status:'error',user,message:`classData/${id} read failed: ${err?.code||err?.message||err}`})));
      [['students','roster'],['dailyQuestProgress','daily'],['curriculumAttempts','curriculum'],['writingResponses','responses'],['gameResults','games'],['bathroomRequests','bathroomRequests'],['snackRequests','snackRequests'],['passRequests','passRequests'],['pointRequests','pointRequests'],['bathroomStatus','bathroomStatus'],['snackStatus','snackStatus'],['passStatus','passStatus'],['passHistory','passHistory'],['curriculumOverrideRequests','curriculumOverrides'],['studentJobWeeks','jobWeeks'],['classCalendarEvents','calendarEvents'],['scores','scores'],['leaderboardRewards','leaderboardRewards']].forEach(([collection,key])=>watchCollection(collection,key));
      [['activeWritingSession','scribe'],['dailyAccessOverride','dailyOverride'],['main','classMain'],['secondRecess','secondRecess'],['classPet','classPet'],['fieldTrip','fieldTrip'],['universalPoints','universalPoints'],['classJobs','classJobs'],['classSchedule','classSchedule']].forEach(([id,key])=>watchDoc(id,key));
    });
    const requireEmulator=()=>{if(environment!=='emulator')throw new Error('Teacher writes are locked outside the fictional Firebase emulator.');if(!currentUser)throw new Error('Teacher sign-in required.')};
    const today=()=>Core.phoenixDateKey();
    const requestRows=collection=>data[collection]||[];
    async function closePassDuplicates(keep){
      const duplicateWrites=[];
      for(const collection of Object.keys(Operations.REQUEST_TYPES))for(const row of requestRows(collection))if(row.id!==keep.id&&row.status==='pending'&&row.studentId===keep.studentId&&row.dateKey===keep.dateKey)duplicateWrites.push(S.firestore.setDoc(S.firestore.doc(db,collection,row.id),{status:'duplicate',duplicateOf:keep.id,reviewedAt:S.firestore.serverTimestamp()},{merge:true}));
      await Promise.all(duplicateWrites);
    }
    const controller={environment,async signIn(){const provider=new S.auth.GoogleAuthProvider();return S.auth.signInWithPopup(auth,provider)},async signOut(){return S.auth.signOut(auth)},
      async launchWritingSession(input){requireEmulator();const ref=S.firestore.doc(S.firestore.collection(db,'writingSessions'));const payload={title:String(input.title||'Morning Quickwrite').slice(0,120),mode:String(input.mode||'Quickwrite').slice(0,40),writingType:String(input.writingType||'Narrative').slice(0,40),targetSkill:String(input.targetSkill||'Sensory Details').slice(0,80),prompt:String(input.prompt||'').slice(0,2000),timeMinutes:Math.max(1,Math.min(90,Number(input.timeMinutes)||5)),minWords:Math.max(1,Math.min(2000,Number(input.minWords)||75)),status:'active',createdBy:currentUser.uid,createdAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()};await S.firestore.setDoc(ref,payload);await S.firestore.setDoc(S.firestore.doc(db,'classData','activeWritingSession'),{...payload,sessionId:ref.id});return ref.id},
      async closeWritingSession(){requireEmulator();const session=Academic.normalizeSession(data.scribe);if(session)await S.firestore.setDoc(S.firestore.doc(db,'writingSessions',session.id),{status:'closed',closedAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()},{merge:true});await S.firestore.setDoc(S.firestore.doc(db,'classData','activeWritingSession'),{status:'closed',sessionId:'',closedAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()})},
      async reviewWriting(responseId,score,feedback){requireEmulator();const value=Math.max(0,Math.min(20,Number(score)));await S.firestore.setDoc(S.firestore.doc(db,'writingResponses',responseId),{teacherScore:value,teacherFeedback:String(feedback||'').slice(0,2000),teacherReviewedAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()},{merge:true})},
      async reviewRecognition(requestId,approve){requireEmulator();return S.firestore.runTransaction(db,async tx=>{const requestRef=S.firestore.doc(db,'pointRequests',requestId),snap=await tx.get(requestRef);if(!snap.exists()||snap.data().status!=='pending')return false;const row=snap.data();if(approve){const studentRef=S.firestore.doc(db,'students',row.studentId),student=await tx.get(studentRef);if(!student.exists())throw new Error('Student profile is missing.');tx.update(studentRef,{xp:(Number(student.data().xp)||0)+1,updatedAt:S.firestore.serverTimestamp()});tx.set(S.firestore.doc(db,'studentTransactions',`recognition_${requestId}`),{studentId:row.studentId,studentName:row.studentName||'Student',stat:'xp',amount:1,reason:`Student recognition request: ${String(row.reason||'Positive choice').slice(0,240)}`,createdAt:S.firestore.serverTimestamp()})}tx.update(requestRef,{status:approve?'approved':'dismissed',reviewedAt:S.firestore.serverTimestamp()});return true})},
      async reviewPass(collection,requestId,approve){requireEmulator();const def=Operations.REQUEST_TYPES[collection];if(!def)throw new Error('Unknown pass request type.');const keep=requestRows(collection).find(row=>row.id===requestId);const result=await S.firestore.runTransaction(db,async tx=>{const requestRef=S.firestore.doc(db,collection,requestId),requestSnap=await tx.get(requestRef);if(!requestSnap.exists()||requestSnap.data().status!=='pending')return false;const row=requestSnap.data(),type=String(row.type||def.type),statusId=def.statusCollection==='passStatus'?`${row.studentId}_${type}`:row.studentId;if(approve){const statusRef=S.firestore.doc(db,def.statusCollection,statusId),statusSnap=await tx.get(statusRef),prior=statusSnap.exists()?statusSnap.data():{},base=type==='bathroom'?3:type==='snack'?2:1;tx.set(statusRef,{studentId:row.studentId,studentName:row.studentName||'Student',type,dateKey:today(),passesUsed:prior.dateKey===today()?(Number(prior.passesUsed)||base):base,approvalCredits:(prior.dateKey===today()?(Number(prior.approvalCredits)||0):0)+1,active:prior.dateKey===today()&&prior.active===true,updatedAt:S.firestore.serverTimestamp()},{merge:true})}tx.update(requestRef,{status:approve?'approved':'denied',reviewedAt:S.firestore.serverTimestamp()});return true});if(result&&keep)await closePassDuplicates(keep);return result},
      async returnPass(collection,statusId){requireEmulator();if(!Operations.STATUS_TYPES[collection])throw new Error('Unknown active pass type.');return S.firestore.runTransaction(db,async tx=>{const ref=S.firestore.doc(db,collection,statusId),snap=await tx.get(ref);if(!snap.exists()||snap.data().active!==true)return false;const row=snap.data(),activeId=String(row.activeVisitId||''),now=new Date(),visits=(Array.isArray(row.visits)?row.visits:[]).map(visit=>String(visit?.id||'')!==activeId?visit:{...visit,status:collection==='bathroomStatus'?'returned':'done',returnedAt:now.toISOString(),returnedText:now.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}),endedAt:now.toISOString(),endedText:now.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})});tx.set(ref,{active:false,activeVisitId:'',visits,returnedAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()},{merge:true});const archived=visits.find(visit=>String(visit?.id||'')===activeId);if(activeId&&archived)tx.set(S.firestore.doc(db,'passHistory',activeId),{...archived,studentId:row.studentId,studentName:row.studentName||'Student',dateKey:row.dateKey,type:row.type||Operations.STATUS_TYPES[collection].type,label:Operations.STATUS_TYPES[collection].kind,updatedAt:S.firestore.serverTimestamp()},{merge:true});return true})},
      async adjustClassPoints(delta,reason='Teacher adjustment'){requireEmulator();const amount=Math.max(-100,Math.min(100,Number(delta)||0));return S.firestore.runTransaction(db,async tx=>{const ref=S.firestore.doc(db,'classData','main'),snap=await tx.get(ref),row=snap.exists()?snap.data():{},next=Math.max(0,(Number(row.points)||0)+amount),history=[...(Array.isArray(row.history)?row.history:[]),{amount,reason:String(reason||'Teacher adjustment').slice(0,240),at:new Date().toISOString()}].slice(-100);tx.set(ref,{points:next,history,updatedAt:S.firestore.serverTimestamp()},{merge:true});return next})},
      async assignUniversal(goalId,amount){requireEmulator();if(!['secondRecess','classPet','fieldTrip'].includes(goalId))throw new Error('Unknown class goal.');const value=Math.max(1,Math.min(1000,Number(amount)||0));return S.firestore.runTransaction(db,async tx=>{const bankRef=S.firestore.doc(db,'classData','universalPoints'),goalRef=S.firestore.doc(db,'classData',goalId),bankSnap=await tx.get(bankRef),goalSnap=await tx.get(goalRef),available=Number(bankSnap.data()?.points)||0;if(value>available)throw new Error('Not enough universal points.');tx.set(bankRef,{points:available-value,updatedAt:S.firestore.serverTimestamp()},{merge:true});tx.set(goalRef,{points:(Number(goalSnap.data()?.points)||0)+value,updatedAt:S.firestore.serverTimestamp()},{merge:true});return value})},
      async assignJob(jobId,studentId){requireEmulator();const ref=S.firestore.doc(db,'classData','classJobs');return S.firestore.runTransaction(db,async tx=>{const snap=await tx.get(ref),config=snap.exists()?snap.data():{},jobs=Array.isArray(config.jobs)?config.jobs:[],job=jobs.find(row=>String(row.id)===String(jobId));if(!job)throw new Error('Guild job was not found.');const assignments={...(config.assignments||{})};for(const [uid,raw] of Object.entries(assignments))if(String(typeof raw==='string'?raw:raw?.id||raw?.jobId)===String(jobId))delete assignments[uid];if(studentId)assignments[studentId]=job;tx.set(ref,{jobs,assignments,updatedAt:S.firestore.serverTimestamp()},{merge:true});return true})},
      async runPayroll(){requireEmulator();const rows=lastOperations?.jobs?.payroll||[];let paid=0,total=0;for(const row of rows){const didPay=await S.firestore.runTransaction(db,async tx=>{const marker=S.firestore.doc(db,'studentTransactions',`payroll_${lastOperations.jobs.weekKey}_${row.studentId}`),existing=await tx.get(marker);if(existing.exists())return false;const studentRef=S.firestore.doc(db,'students',row.studentId),weekRef=S.firestore.doc(db,'studentJobWeeks',row.weekId),student=await tx.get(studentRef),week=await tx.get(weekRef);if(!student.exists()||!week.exists()||week.data().paid===true||Number(week.data().completedCount)<4)return false;tx.update(studentRef,{gold:(Number(student.data().gold)||0)+row.pay,updatedAt:S.firestore.serverTimestamp()});tx.update(weekRef,{paid:true,paidAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()});tx.set(marker,{studentId:row.studentId,studentName:row.studentName,stat:'gold',amount:row.pay,reason:`Guild job payroll ${lastOperations.jobs.weekKey}`,createdAt:S.firestore.serverTimestamp()});return true});if(didPay){paid++;total+=row.pay}}return {paid,total}},
      async saveSchedule(dayName,blocks){requireEmulator();const day=String(dayName||'Monday');if(!['Monday','Tuesday','Wednesday','Thursday','Friday'].includes(day))throw new Error('Invalid schedule day.');const rows=(Array.isArray(blocks)?blocks:[]).slice(0,30).map((row,index)=>({id:String(row.id||`${day}-${index}`).slice(0,80),time:String(row.time||'').slice(0,20),end:String(row.end||'').slice(0,20),title:String(row.title||'Class block').slice(0,120),detail:String(row.detail||'').slice(0,240),icon:String(row.icon||'✦').slice(0,8)}));return S.firestore.runTransaction(db,async tx=>{const ref=S.firestore.doc(db,'classData','classSchedule'),snap=await tx.get(ref),days={...(snap.data()?.days||{}),[day]:rows};tx.set(ref,{days,updatedAt:S.firestore.serverTimestamp()},{merge:true});return rows.length})},
      async rewardLeaders(){requireEmulator();const leaders=(lastOperations?.leaderboard?.rows||[]).slice(0,3),awards=[20,10,10];let issued=0;for(let index=0;index<leaders.length;index++){const row=leaders[index];if(row.rewarded)continue;const id=`${lastOperations.leaderboard.weekKey}_${row.studentId}`,amount=awards[index],done=await S.firestore.runTransaction(db,async tx=>{const rewardRef=S.firestore.doc(db,'leaderboardRewards',id),reward=await tx.get(rewardRef);if(reward.exists())return false;const studentRef=S.firestore.doc(db,'students',row.studentId),student=await tx.get(studentRef);if(!student.exists())return false;tx.update(studentRef,{xp:(Number(student.data().xp)||0)+amount,updatedAt:S.firestore.serverTimestamp()});tx.set(rewardRef,{studentId:row.studentId,studentName:row.name,dateKey:today(),weekKey:lastOperations.leaderboard.weekKey,rank:index+1,xpAward:amount,status:'issued',createdAt:S.firestore.serverTimestamp()});return true});if(done)issued++}return issued},
      dispose(){clear();try{authUnsub()}catch{}}};
    controllers.push(controller);return controller;
  }

  window.addEventListener('pagehide',()=>controllers.splice(0).forEach(c=>{try{c.dispose()}catch{}}),{once:true});
  window.DWV33Integration=Object.freeze({version:VERSION,environment,startStudent,startTeacher,core:Core,academic:Academic,world:World,operations:Operations});
})();
