(function(){
  'use strict';
  const Core=window.DWV33Core;
  const Academic=window.DWV33Academic;
  const World=window.DWV33World;
  const Operations=window.DWV33Operations;
  const Passes=window.DWV33Passes;
  if(!Core||!Academic||!World||!Operations||!Passes)throw new Error('The V3.3 integration contracts must load before the runtime.');

  const PRODUCTION_FIREBASE_CONFIG=Object.freeze({apiKey:'AIzaSyC918WJoGQgxRKsqcz-3bXI7iZWv_1bwYE',authDomain:'dragonswood-9289e.firebaseapp.com',projectId:'dragonswood-9289e',storageBucket:'dragonswood-9289e.firebasestorage.app',messagingSenderId:'1064477064695',appId:'1:1064477064695:web:283e1016ee2303d39042f2',measurementId:'G-LPRLDGVBD2'});
  const EMULATOR_FIREBASE_CONFIG=Object.freeze({apiKey:'demo-key',authDomain:'demo-dragonswood-v33.localhost',projectId:'demo-dragonswood-v33',storageBucket:'demo-dragonswood-v33.appspot.com',messagingSenderId:'000000000000',appId:'1:000000000000:web:demo-v33'});
  const DOMAIN=Core.STUDENT_DOMAIN;
  const TEACHER=Core.TEACHER_EMAIL;
  const VERSION='v33-student-beta-1';
  const params=new URLSearchParams(location.search);
  const declaredEnvironment=String(document.documentElement?.dataset?.dwEnvironment||'').toLowerCase();
  const requestedEnv=declaredEnvironment==='production'?'production':(params.get('dw-env')||'emulator');
  const prodReadOnly=requestedEnv==='production-readonly'&&params.get('dw-readonly')==='I_UNDERSTAND';
  const environment=declaredEnvironment==='production'?'production':(prodReadOnly?'production-readonly':'emulator');
  const readOnlyRequestBlocked=requestedEnv==='production-readonly'&&!prodReadOnly;
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
    return readOnlyRequestBlocked
      ?'Production reads are locked. Use the explicit read-only confirmation parameter from the integration guide.'
      :'Integration runtime is unavailable.';
  }



  async function startStudent(onUpdate){
    if(readOnlyRequestBlocked){emit(onUpdate,{status:'blocked',message:blockedMessage()});return {environment,signIn:async()=>{},signOut:async()=>{},dispose(){}}}
    emit(onUpdate,{status:'loading',message:'Loading secure student sign-in…'});
    let F;
    try{F=await createFirebase('student')}catch(err){emit(onUpdate,{status:'error',message:`Firebase could not load: ${err?.message||err}`});return {environment,signIn:async()=>{},signOut:async()=>{},dispose(){}}}
    const {S,auth,db}=F;
    let profileUnsub=null,dailyUnsub=null,overrideUnsub=null,scribeUnsub=null,responsesUnsub=null,gamesUnsub=null,scheduleUnsub=null,jobsUnsub=null,eventsUnsub=null,jobWeekUnsub=null,scoresUnsub=null,rewardsUnsub=null,lootUnsub=null,prizesUnsub=null;
    let bathroomStatusUnsub=null,snackStatusUnsub=null,outOfSeatStatusUnsub=null,officeStatusUnsub=null,bathroomRequestUnsub=null,snackRequestUnsub=null,outOfSeatRequestUnsub=null,officeRequestUnsub=null,boySlotUnsub=null,girlSlotUnsub=null,blackoutUnsub=null;
    let lastProfile=null,lastDaily=[],lastOverride={},lastScribe={},lastResponses=[],lastGames=[],lastSchedule={},lastJobs={},lastEvents=[],lastJobWeek=null,lastScores=[],lastRewards=[],lastLoot=[],lastPrizes=[],currentUser=null,testerAuthorized=false;
    let lastPassStatuses={},lastPassRequests={},lastBathroomSlots={},lastPassBlackout={};
    const ready={profile:false,daily:false,override:false,scribe:false,responses:false,games:false,schedule:false,jobs:false,events:false,jobWeek:false,scores:false,rewards:false,loot:false,prizes:false,bathroomStatus:false,snackStatus:false,outOfSeatStatus:false,officeStatus:false,bathroomRequest:false,snackRequest:false,outOfSeatRequest:false,officeRequest:false,boySlot:false,girlSlot:false,passBlackout:false};
    const clear=()=>{
      for(const fn of [profileUnsub,dailyUnsub,overrideUnsub,scribeUnsub,responsesUnsub,gamesUnsub,scheduleUnsub,jobsUnsub,eventsUnsub,jobWeekUnsub,scoresUnsub,rewardsUnsub,lootUnsub,prizesUnsub,bathroomStatusUnsub,snackStatusUnsub,outOfSeatStatusUnsub,officeStatusUnsub,bathroomRequestUnsub,snackRequestUnsub,outOfSeatRequestUnsub,officeRequestUnsub,boySlotUnsub,girlSlotUnsub,blackoutUnsub])try{fn?.()}catch{}
      profileUnsub=dailyUnsub=overrideUnsub=scribeUnsub=responsesUnsub=gamesUnsub=scheduleUnsub=jobsUnsub=eventsUnsub=jobWeekUnsub=scoresUnsub=rewardsUnsub=lootUnsub=prizesUnsub=null;
      bathroomStatusUnsub=snackStatusUnsub=outOfSeatStatusUnsub=officeStatusUnsub=bathroomRequestUnsub=snackRequestUnsub=outOfSeatRequestUnsub=officeRequestUnsub=boySlotUnsub=girlSlotUnsub=blackoutUnsub=null;
      lastProfile=null;lastDaily=[];lastOverride={};lastScribe={};lastResponses=[];lastGames=[];lastSchedule={};lastJobs={};lastEvents=[];lastJobWeek=null;lastScores=[];lastRewards=[];lastLoot=[];lastPrizes=[];
      lastPassStatuses={};lastPassRequests={};lastBathroomSlots={};lastPassBlackout={};
      for(const key of Object.keys(ready))ready[key]=false;testerAuthorized=false;
    };
    const push=()=>{
      if(!currentUser||!Object.values(ready).every(Boolean))return;
      emit(onUpdate,{status:'authorized',user:currentUser,
        student:Core.normalizeStudent(currentUser,lastProfile,lastDaily,lastOverride,testerAuthorized),
        academic:Academic.studentAcademic(lastScribe,lastResponses,lastGames),
        world:World.studentWorld(currentUser.uid,lastProfile,lastSchedule,lastJobs,lastEvents,lastJobWeek,lastScores,lastRewards,lastLoot,lastPrizes),
        passes:Passes.studentPasses(currentUser.uid,Core.phoenixDateKey(),{profile:lastProfile,statuses:lastPassStatuses,requests:lastPassRequests,slots:lastBathroomSlots,blackout:lastPassBlackout})});
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
      const dateKey=Core.phoenixDateKey();
      const passStatus=(type,path,key)=>watchDoc(path,key,value=>{lastPassStatuses={...lastPassStatuses,[type]:value}},`${Passes.definition(type).label} status`);
      const passRequest=(type,path,key)=>watchDoc(path,key,value=>{lastPassRequests={...lastPassRequests,[type]:value}},`${Passes.definition(type).label} request`);
      bathroomStatusUnsub=passStatus('bathroom',['bathroomStatus',user.uid],'bathroomStatus');
      snackStatusUnsub=passStatus('snack',['snackStatus',user.uid],'snackStatus');
      outOfSeatStatusUnsub=passStatus('outOfSeat',['passStatus',Passes.statusId('outOfSeat',user.uid)],'outOfSeatStatus');
      officeStatusUnsub=passStatus('office',['passStatus',Passes.statusId('office',user.uid)],'officeStatus');
      bathroomRequestUnsub=passRequest('bathroom',['bathroomRequests',Passes.requestId('bathroom',user.uid,dateKey)],'bathroomRequest');
      snackRequestUnsub=passRequest('snack',['snackRequests',Passes.requestId('snack',user.uid,dateKey)],'snackRequest');
      outOfSeatRequestUnsub=passRequest('outOfSeat',['passRequests',Passes.requestId('outOfSeat',user.uid,dateKey)],'outOfSeatRequest');
      officeRequestUnsub=passRequest('office',['passRequests',Passes.requestId('office',user.uid,dateKey)],'officeRequest');
      boySlotUnsub=watchDoc(['bathroomSlots','boy'],'boySlot',value=>{lastBathroomSlots={...lastBathroomSlots,boy:value}},'Boys bathroom slot');
      girlSlotUnsub=watchDoc(['bathroomSlots','girl'],'girlSlot',value=>{lastBathroomSlots={...lastBathroomSlots,girl:value}},'Girls bathroom slot');
      blackoutUnsub=watchDoc(['classData','passBlackout'],'passBlackout',value=>{lastPassBlackout=value},'Pass blackout');
    });
    const requireWrite=()=>{if(environment!=='emulator'&&environment!=='production')throw new Error('Writes are disabled in this read-only environment.');if(!currentUser)throw new Error('Sign in before saving.')};
    const writingPayload=(session,responseText,status)=>{const metrics=Academic.writingMetrics(responseText);return {studentId:currentUser.uid,studentName:lastProfile?.firstName||currentUser.displayName||currentUser.email||'Scholar',sessionId:session.id,status,...metrics,sessionTitle:session.title,writingType:session.writingType,targetSkill:session.targetSkill,prompt:session.prompt,updatedAt:S.firestore.serverTimestamp(),...(status==='submitted'?{submittedAt:S.firestore.serverTimestamp()}:{})}};
    const studentName=()=>lastProfile?.firstName||currentUser?.displayName||currentUser?.email||'Scholar';
    const displayTime=date=>new Intl.DateTimeFormat('en-US',{timeZone:'America/Phoenix',hour:'numeric',minute:'2-digit'}).format(date);
    const currentPasses=()=>Passes.studentPasses(currentUser.uid,Core.phoenixDateKey(),{profile:lastProfile,statuses:lastPassStatuses,requests:lastPassRequests,slots:lastBathroomSlots,blackout:lastPassBlackout});
    async function requestPass(type){
      requireWrite();const def=Passes.definition(type);if(!def)throw new Error('Unknown pass type.');
      const model=currentPasses();if(model.pendingType)throw new Error(`Your ${Passes.definition(model.pendingType)?.label||'extra pass'} request is still waiting for teacher review.`);
      const dateKey=Core.phoenixDateKey(),id=Passes.requestId(type,currentUser.uid,dateKey),payload={studentId:currentUser.uid,studentName:studentName(),dateKey,status:'pending',createdAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()};
      if(type==='bathroom')payload.genderGroup=model.group;
      if(type==='outOfSeat'||type==='office'){payload.type=type;payload.label=def.label}
      await S.firestore.setDoc(S.firestore.doc(db,def.requestCollection,id),payload,{merge:true});return id;
    }
    async function startPass(type){
      requireWrite();const def=Passes.definition(type);if(!def)throw new Error('Unknown pass type.');
      const dateKey=Core.phoenixDateKey(),now=new Date(),startedText=displayTime(now),visitId=`${currentUser.uid}_${type}_${Date.now()}`;
      const statusRef=S.firestore.doc(db,def.statusCollection,Passes.statusId(type,currentUser.uid)),historyRef=S.firestore.doc(db,'passHistory',visitId),blackoutRef=S.firestore.doc(db,'classData','passBlackout');
      const group=Passes.bathroomGroup(lastProfile||{}),slotRef=type==='bathroom'?S.firestore.doc(db,'bathroomSlots',group):null;
      await S.firestore.runTransaction(db,async tx=>{
        const statusSnap=await tx.get(statusRef),blackoutSnap=await tx.get(blackoutRef),slotSnap=slotRef?await tx.get(slotRef):null;
        if(blackoutSnap.exists()&&blackoutSnap.data()?.active===true)throw new Error('Passes are paused by your teacher right now.');
        const raw=statusSnap.exists()?statusSnap.data():{},same=raw.dateKey===dateKey,used=same?(Number(raw.passesUsed)||0):0,credits=same?(Number(raw.approvalCredits)||0):0;
        if(same&&raw.active===true)throw new Error('That pass is already active.');
        if(used>=def.automatic&&credits<=0)throw new Error('An extra pass needs teacher approval.');
        if(slotSnap?.exists()){const slot=slotSnap.data();if(slot.dateKey===dateKey&&slot.occupied===true&&slot.studentId!==currentUser.uid)throw new Error(`${slot.studentName||'Another scholar'} is already using this bathroom pass.`)}
        const automatic=used<def.automatic,nextUsed=automatic?used+1:used,nextCredits=automatic?credits:Math.max(0,credits-1),prior=same&&Array.isArray(raw.visits)?raw.visits:[];
        const visit={id:visitId,studentId:currentUser.uid,studentName:studentName(),type,label:def.label,dateKey,passType:automatic?'automatic':'approved-extra',passNumber:nextUsed,startedAt:now.toISOString(),startedAtText:startedText,startedMs:now.getTime(),status:'active'};
        tx.set(historyRef,{...visit,createdAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()});
        tx.set(statusRef,{studentId:currentUser.uid,studentName:studentName(),type,label:def.label,dateKey,passesUsed:nextUsed,approvalCredits:nextCredits,active:true,activeVisitId:visitId,startedAt:S.firestore.serverTimestamp(),startedAtText:startedText,startedMs:now.getTime(),visits:[...prior,visit].slice(-30),updatedAt:S.firestore.serverTimestamp()},{merge:true});
        if(slotRef)tx.set(slotRef,{group,dateKey,occupied:true,studentId:currentUser.uid,studentName:studentName(),activeVisitId:visitId,claimedAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()},{merge:true});
      });return visitId;
    }
    async function endPass(type){
      requireWrite();const def=Passes.definition(type);if(!def)throw new Error('Unknown pass type.');
      const statusRef=S.firestore.doc(db,def.statusCollection,Passes.statusId(type,currentUser.uid)),group=Passes.bathroomGroup(lastProfile||{}),slotRef=type==='bathroom'?S.firestore.doc(db,'bathroomSlots',group):null,now=new Date(),endedText=displayTime(now);
      return S.firestore.runTransaction(db,async tx=>{
        const statusSnap=await tx.get(statusRef),slotSnap=slotRef?await tx.get(slotRef):null;if(!statusSnap.exists()||statusSnap.data()?.active!==true)return false;
        const raw=statusSnap.data(),activeVisitId=String(raw.activeVisitId||''),visits=(Array.isArray(raw.visits)?raw.visits:[]).map(visit=>String(visit?.id||'')!==activeVisitId?visit:{...visit,status:'returned',endedAt:now.toISOString(),endedText,durationMinutes:visit.startedMs?Math.max(0,Math.round((now.getTime()-Number(visit.startedMs))/60000)):null});
        tx.set(statusRef,{active:false,activeVisitId:'',endedAt:S.firestore.serverTimestamp(),endedAtText:endedText,visits,updatedAt:S.firestore.serverTimestamp()},{merge:true});
        const archived=visits.find(visit=>String(visit?.id||'')===activeVisitId);if(activeVisitId&&archived)tx.set(S.firestore.doc(db,'passHistory',activeVisitId),{...archived,type,label:def.label,updatedAt:S.firestore.serverTimestamp()},{merge:true});
        if(slotRef&&slotSnap?.exists()&&slotSnap.data()?.studentId===currentUser.uid)tx.set(slotRef,{group,occupied:false,studentId:'',studentName:'',activeVisitId:'',releasedAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()},{merge:true});
        return true;
      });
    }
    const controller={environment,
      async signIn(){const provider=new S.auth.GoogleAuthProvider();return S.auth.signInWithPopup(auth,provider)},async signOut(){return S.auth.signOut(auth)},
      async saveWriting(responseText){requireWrite();const session=Academic.normalizeSession(lastScribe);if(!session)throw new Error('No active writing mission.');const id=Academic.sessionResponseId(session.id,currentUser.uid);await S.firestore.setDoc(S.firestore.doc(db,'writingResponses',id),writingPayload(session,responseText,'draft'),{merge:true});return id},
      async submitWriting(responseText){requireWrite();const session=Academic.normalizeSession(lastScribe);if(!session)throw new Error('No active writing mission.');const metrics=Academic.writingMetrics(responseText);if(metrics.wordCount<session.minWords)throw new Error(`Write at least ${session.minWords} words before submitting.`);const id=Academic.sessionResponseId(session.id,currentUser.uid);const existing=lastResponses.find(row=>row.id===id);if(existing?.status==='submitted')throw new Error('This writing mission was already submitted.');await S.firestore.setDoc(S.firestore.doc(db,'writingResponses',id),writingPayload(session,responseText,'submitted'),{merge:true});return id},
      async checkOffJob(dayIndex){requireWrite();const day=Math.max(0,Math.min(4,Number(dayIndex)));const wk=World.weekKey(),id=`${currentUser.uid}_${wk}`,job=World.assignedJob(currentUser.uid,lastJobs,lastJobWeek);if(!job)throw new Error('No class job is assigned this week.');await S.firestore.runTransaction(db,async tx=>{const ref=S.firestore.doc(db,'studentJobWeeks',id),snap=await tx.get(ref),data=snap.exists()?snap.data():{},checked=[...new Set([...(Array.isArray(data.checkedDays)?data.checkedDays:[]),day])].sort((a,b)=>a-b),payload={studentId:currentUser.uid,studentName:lastProfile?.firstName||'Scholar',weekKey:wk,jobId:job.id,jobName:job.name,jobIcon:job.icon,pay:job.pay,checkedDays:checked,completedCount:checked.length,paid:data.paid===true,updatedAt:S.firestore.serverTimestamp()};snap.exists()?tx.update(ref,{checkedDays:checked,completedCount:checked.length,updatedAt:S.firestore.serverTimestamp()}):tx.set(ref,payload)});return id},
      async usePass(type){requireWrite();const row=currentPasses().rows[type];if(!row)throw new Error('Unknown pass type.');if(row.action==='return')return endPass(type);if(row.action==='start')return startPass(type);if(row.action==='request')return requestPass(type);throw new Error(row.message)},
      dispose(){clear();try{authUnsub()}catch{}}
    };
    controllers.push(controller);return controller;
  }

  async function startTeacher(onUpdate){
    if(readOnlyRequestBlocked){emit(onUpdate,{status:'blocked',message:blockedMessage()});return {environment,signIn:async()=>{},signOut:async()=>{},dispose(){}}}
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
    const requireWrite=()=>{if(environment!=='emulator'&&environment!=='production')throw new Error('Teacher writes are disabled in this read-only environment.');if(!currentUser)throw new Error('Teacher sign-in required.')};
    const today=()=>Core.phoenixDateKey();
    const requestRows=collection=>data[collection]||[];
    async function closePassDuplicates(keep){
      const duplicateWrites=[];
      for(const collection of Object.keys(Operations.REQUEST_TYPES))for(const row of requestRows(collection))if(row.id!==keep.id&&row.status==='pending'&&row.studentId===keep.studentId&&row.dateKey===keep.dateKey)duplicateWrites.push(S.firestore.setDoc(S.firestore.doc(db,collection,row.id),{status:'duplicate',duplicateOf:keep.id,reviewedAt:S.firestore.serverTimestamp()},{merge:true}));
      await Promise.all(duplicateWrites);
    }
    const controller={environment,async signIn(){const provider=new S.auth.GoogleAuthProvider();return S.auth.signInWithPopup(auth,provider)},async signOut(){return S.auth.signOut(auth)},
      async launchWritingSession(input){requireWrite();const ref=S.firestore.doc(S.firestore.collection(db,'writingSessions'));const payload={title:String(input.title||'Morning Quickwrite').slice(0,120),mode:String(input.mode||'Quickwrite').slice(0,40),writingType:String(input.writingType||'Narrative').slice(0,40),targetSkill:String(input.targetSkill||'Sensory Details').slice(0,80),prompt:String(input.prompt||'').slice(0,2000),timeMinutes:Math.max(1,Math.min(90,Number(input.timeMinutes)||5)),minWords:Math.max(1,Math.min(2000,Number(input.minWords)||75)),status:'active',createdBy:currentUser.uid,createdAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()};await S.firestore.setDoc(ref,payload);await S.firestore.setDoc(S.firestore.doc(db,'classData','activeWritingSession'),{...payload,sessionId:ref.id});return ref.id},
      async closeWritingSession(){requireWrite();const session=Academic.normalizeSession(data.scribe);if(session)await S.firestore.setDoc(S.firestore.doc(db,'writingSessions',session.id),{status:'closed',closedAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()},{merge:true});await S.firestore.setDoc(S.firestore.doc(db,'classData','activeWritingSession'),{status:'closed',sessionId:'',closedAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()})},
      async reviewWriting(responseId,score,feedback){requireWrite();const value=Math.max(0,Math.min(20,Number(score)));await S.firestore.setDoc(S.firestore.doc(db,'writingResponses',responseId),{teacherScore:value,teacherFeedback:String(feedback||'').slice(0,2000),teacherReviewedAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()},{merge:true})},
      async reviewRecognition(requestId,approve){requireWrite();return S.firestore.runTransaction(db,async tx=>{const requestRef=S.firestore.doc(db,'pointRequests',requestId),snap=await tx.get(requestRef);if(!snap.exists()||snap.data().status!=='pending')return false;const row=snap.data();if(approve){const studentRef=S.firestore.doc(db,'students',row.studentId),student=await tx.get(studentRef);if(!student.exists())throw new Error('Student profile is missing.');tx.update(studentRef,{xp:(Number(student.data().xp)||0)+1,updatedAt:S.firestore.serverTimestamp()});tx.set(S.firestore.doc(db,'studentTransactions',`recognition_${requestId}`),{studentId:row.studentId,studentName:row.studentName||'Student',stat:'xp',amount:1,reason:`Student recognition request: ${String(row.reason||'Positive choice').slice(0,240)}`,createdAt:S.firestore.serverTimestamp()})}tx.update(requestRef,{status:approve?'approved':'dismissed',reviewedAt:S.firestore.serverTimestamp()});return true})},
      async reviewPass(collection,requestId,approve){requireWrite();const def=Operations.REQUEST_TYPES[collection];if(!def)throw new Error('Unknown pass request type.');const keep=requestRows(collection).find(row=>row.id===requestId);const result=await S.firestore.runTransaction(db,async tx=>{const requestRef=S.firestore.doc(db,collection,requestId),requestSnap=await tx.get(requestRef);if(!requestSnap.exists()||requestSnap.data().status!=='pending')return false;const row=requestSnap.data(),type=String(row.type||def.type),statusId=def.statusCollection==='passStatus'?`${row.studentId}_${type}`:row.studentId;if(approve){const statusRef=S.firestore.doc(db,def.statusCollection,statusId),statusSnap=await tx.get(statusRef),prior=statusSnap.exists()?statusSnap.data():{},base=type==='bathroom'?3:type==='snack'?2:1;tx.set(statusRef,{studentId:row.studentId,studentName:row.studentName||'Student',type,dateKey:today(),passesUsed:prior.dateKey===today()?(Number(prior.passesUsed)||base):base,approvalCredits:(prior.dateKey===today()?(Number(prior.approvalCredits)||0):0)+1,active:prior.dateKey===today()&&prior.active===true,updatedAt:S.firestore.serverTimestamp()},{merge:true})}tx.update(requestRef,{status:approve?'approved':'denied',reviewedAt:S.firestore.serverTimestamp()});return true});if(result&&keep)await closePassDuplicates(keep);return result},
      async returnPass(collection,statusId){requireWrite();if(!Operations.STATUS_TYPES[collection])throw new Error('Unknown active pass type.');return S.firestore.runTransaction(db,async tx=>{const ref=S.firestore.doc(db,collection,statusId),snap=await tx.get(ref);if(!snap.exists()||snap.data().active!==true)return false;const row=snap.data(),activeId=String(row.activeVisitId||''),now=new Date(),visits=(Array.isArray(row.visits)?row.visits:[]).map(visit=>String(visit?.id||'')!==activeId?visit:{...visit,status:collection==='bathroomStatus'?'returned':'done',returnedAt:now.toISOString(),returnedText:now.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}),endedAt:now.toISOString(),endedText:now.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})});tx.set(ref,{active:false,activeVisitId:'',visits,returnedAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()},{merge:true});const archived=visits.find(visit=>String(visit?.id||'')===activeId);if(activeId&&archived)tx.set(S.firestore.doc(db,'passHistory',activeId),{...archived,studentId:row.studentId,studentName:row.studentName||'Student',dateKey:row.dateKey,type:row.type||Operations.STATUS_TYPES[collection].type,label:Operations.STATUS_TYPES[collection].kind,updatedAt:S.firestore.serverTimestamp()},{merge:true});return true})},
      async adjustClassPoints(delta,reason='Teacher adjustment'){requireWrite();const amount=Math.max(-100,Math.min(100,Number(delta)||0));return S.firestore.runTransaction(db,async tx=>{const ref=S.firestore.doc(db,'classData','main'),snap=await tx.get(ref),row=snap.exists()?snap.data():{},next=Math.max(0,(Number(row.points)||0)+amount),history=[...(Array.isArray(row.history)?row.history:[]),{amount,reason:String(reason||'Teacher adjustment').slice(0,240),at:new Date().toISOString()}].slice(-100);tx.set(ref,{points:next,history,updatedAt:S.firestore.serverTimestamp()},{merge:true});return next})},
      async assignUniversal(goalId,amount){requireWrite();if(!['secondRecess','classPet','fieldTrip'].includes(goalId))throw new Error('Unknown class goal.');const value=Math.max(1,Math.min(1000,Number(amount)||0));return S.firestore.runTransaction(db,async tx=>{const bankRef=S.firestore.doc(db,'classData','universalPoints'),goalRef=S.firestore.doc(db,'classData',goalId),bankSnap=await tx.get(bankRef),goalSnap=await tx.get(goalRef),available=Number(bankSnap.data()?.points)||0;if(value>available)throw new Error('Not enough universal points.');tx.set(bankRef,{points:available-value,updatedAt:S.firestore.serverTimestamp()},{merge:true});tx.set(goalRef,{points:(Number(goalSnap.data()?.points)||0)+value,updatedAt:S.firestore.serverTimestamp()},{merge:true});return value})},
      async assignJob(jobId,studentId){requireWrite();const ref=S.firestore.doc(db,'classData','classJobs');return S.firestore.runTransaction(db,async tx=>{const snap=await tx.get(ref),config=snap.exists()?snap.data():{},jobs=Array.isArray(config.jobs)?config.jobs:[],job=jobs.find(row=>String(row.id)===String(jobId));if(!job)throw new Error('Guild job was not found.');const assignments={...(config.assignments||{})};for(const [uid,raw] of Object.entries(assignments))if(String(typeof raw==='string'?raw:raw?.id||raw?.jobId)===String(jobId))delete assignments[uid];if(studentId)assignments[studentId]=job;tx.set(ref,{jobs,assignments,updatedAt:S.firestore.serverTimestamp()},{merge:true});return true})},
      async runPayroll(){requireWrite();const rows=lastOperations?.jobs?.payroll||[];let paid=0,total=0;for(const row of rows){const didPay=await S.firestore.runTransaction(db,async tx=>{const marker=S.firestore.doc(db,'studentTransactions',`payroll_${lastOperations.jobs.weekKey}_${row.studentId}`),existing=await tx.get(marker);if(existing.exists())return false;const studentRef=S.firestore.doc(db,'students',row.studentId),weekRef=S.firestore.doc(db,'studentJobWeeks',row.weekId),student=await tx.get(studentRef),week=await tx.get(weekRef);if(!student.exists()||!week.exists()||week.data().paid===true||Number(week.data().completedCount)<4)return false;tx.update(studentRef,{gold:(Number(student.data().gold)||0)+row.pay,updatedAt:S.firestore.serverTimestamp()});tx.update(weekRef,{paid:true,paidAt:S.firestore.serverTimestamp(),updatedAt:S.firestore.serverTimestamp()});tx.set(marker,{studentId:row.studentId,studentName:row.studentName,stat:'gold',amount:row.pay,reason:`Guild job payroll ${lastOperations.jobs.weekKey}`,createdAt:S.firestore.serverTimestamp()});return true});if(didPay){paid++;total+=row.pay}}return {paid,total}},
      async saveSchedule(dayName,blocks){requireWrite();const day=String(dayName||'Monday');if(!['Monday','Tuesday','Wednesday','Thursday','Friday'].includes(day))throw new Error('Invalid schedule day.');const rows=(Array.isArray(blocks)?blocks:[]).slice(0,30).map((row,index)=>({id:String(row.id||`${day}-${index}`).slice(0,80),time:String(row.time||'').slice(0,20),end:String(row.end||'').slice(0,20),title:String(row.title||'Class block').slice(0,120),detail:String(row.detail||'').slice(0,240),icon:String(row.icon||'✦').slice(0,8)}));return S.firestore.runTransaction(db,async tx=>{const ref=S.firestore.doc(db,'classData','classSchedule'),snap=await tx.get(ref),days={...(snap.data()?.days||{}),[day]:rows};tx.set(ref,{days,updatedAt:S.firestore.serverTimestamp()},{merge:true});return rows.length})},
      async rewardLeaders(){requireWrite();const leaders=(lastOperations?.leaderboard?.rows||[]).slice(0,3),awards=[20,10,10];let issued=0;for(let index=0;index<leaders.length;index++){const row=leaders[index];if(row.rewarded)continue;const id=`${lastOperations.leaderboard.weekKey}_${row.studentId}`,amount=awards[index],done=await S.firestore.runTransaction(db,async tx=>{const rewardRef=S.firestore.doc(db,'leaderboardRewards',id),reward=await tx.get(rewardRef);if(reward.exists())return false;const studentRef=S.firestore.doc(db,'students',row.studentId),student=await tx.get(studentRef);if(!student.exists())return false;tx.update(studentRef,{xp:(Number(student.data().xp)||0)+amount,updatedAt:S.firestore.serverTimestamp()});tx.set(rewardRef,{studentId:row.studentId,studentName:row.name,dateKey:today(),weekKey:lastOperations.leaderboard.weekKey,rank:index+1,xpAward:amount,status:'issued',createdAt:S.firestore.serverTimestamp()});return true});if(done)issued++}return issued},
      dispose(){clear();try{authUnsub()}catch{}}};
    controllers.push(controller);return controller;
  }

  window.addEventListener('pagehide',()=>controllers.splice(0).forEach(c=>{try{c.dispose()}catch{}}),{once:true});
  window.DWV33Integration=Object.freeze({version:VERSION,environment,startStudent,startTeacher,core:Core,academic:Academic,world:World,operations:Operations});
})();
