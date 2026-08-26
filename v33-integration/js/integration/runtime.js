(function(){
  'use strict';
  const Core=window.DWV33Core;
  if(!Core)throw new Error('DWV33Core must load before integration runtime.');

  const PRODUCTION_FIREBASE_CONFIG=Object.freeze({apiKey:'AIzaSyC918WJoGQgxRKsqcz-3bXI7iZWv_1bwYE',authDomain:'dragonswood-9289e.firebaseapp.com',projectId:'dragonswood-9289e',storageBucket:'dragonswood-9289e.firebasestorage.app',messagingSenderId:'1064477064695',appId:'1:1064477064695:web:283e1016ee2303d39042f2',measurementId:'G-LPRLDGVBD2'});
  const EMULATOR_FIREBASE_CONFIG=Object.freeze({apiKey:'demo-key',authDomain:'demo-dragonswood-v33.localhost',projectId:'demo-dragonswood-v33',storageBucket:'demo-dragonswood-v33.appspot.com',messagingSenderId:'000000000000',appId:'1:000000000000:web:demo-v33'});
  const DOMAIN=Core.STUDENT_DOMAIN;
  const TEACHER=Core.TEACHER_EMAIL;
  const VERSION='v33-stage-identity-2';
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
    const appName=role==='teacher'?'DragonswoodV33TeacherIntegration':'DragonswoodV33StudentIntegration';
    const firebaseConfig=environment==='emulator'?EMULATOR_FIREBASE_CONFIG:PRODUCTION_FIREBASE_CONFIG;
    let firebaseApp;
    try{firebaseApp=S.app.getApp(appName)}catch{firebaseApp=S.app.initializeApp(firebaseConfig,appName)}
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
    const {S,auth,db}=F; let profileUnsub=null,dailyUnsub=null,overrideUnsub=null,lastProfile=null,lastDaily=[],lastOverride={},currentUser=null,dailyReady=false,profileReady=false,overrideReady=false,testerAuthorized=false;
    const clear=()=>{for(const fn of [profileUnsub,dailyUnsub,overrideUnsub])try{fn?.()}catch{} profileUnsub=dailyUnsub=overrideUnsub=null;lastProfile=null;lastDaily=[];lastOverride={};dailyReady=profileReady=overrideReady=false;testerAuthorized=false};
    const push=()=>{if(!currentUser||!profileReady||!dailyReady||!overrideReady)return;emit(onUpdate,{status:'authorized',user:currentUser,student:Core.normalizeStudent(currentUser,lastProfile,lastDaily,lastOverride,testerAuthorized)})};
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
      profileUnsub=S.firestore.onSnapshot(S.firestore.doc(db,'students',user.uid),snap=>{lastProfile=snap.exists()?{id:snap.id,...snap.data()}:null;profileReady=true;push()},err=>emit(onUpdate,{status:'error',user,message:`Student profile read failed: ${err?.code||err?.message||err}`}));
      dailyUnsub=S.firestore.onSnapshot(S.firestore.query(S.firestore.collection(db,'dailyQuestProgress'),S.firestore.where('studentId','==',user.uid)),snap=>{lastDaily=snap.docs.map(d=>({id:d.id,...d.data()}));dailyReady=true;push()},err=>emit(onUpdate,{status:'error',user,message:`Daily progress read failed: ${err?.code||err?.message||err}`}));
      overrideUnsub=S.firestore.onSnapshot(S.firestore.doc(db,'classData','dailyAccessOverride'),snap=>{lastOverride=snap.exists()?snap.data():{};overrideReady=true;push()},err=>{console.warn('[V3.3 daily access override]',err);lastOverride={};overrideReady=true;push()});
    });
    const controller={environment,async signIn(){const provider=new S.auth.GoogleAuthProvider();return S.auth.signInWithPopup(auth,provider)},async signOut(){return S.auth.signOut(auth)},dispose(){clear();try{authUnsub()}catch{}}};
    controllers.push(controller);return controller;
  }

  async function startTeacher(onUpdate){
    if(requestedEnv==='production-readonly'&&!prodReadOnly){emit(onUpdate,{status:'blocked',message:blockedMessage()});return {environment,signIn:async()=>{},signOut:async()=>{},dispose(){}}}
    emit(onUpdate,{status:'loading',message:'Loading secure teacher sign-in…'});
    let F;
    try{F=await createFirebase('teacher')}catch(err){emit(onUpdate,{status:'error',message:`Firebase could not load: ${err?.message||err}`});return {environment,signIn:async()=>{},signOut:async()=>{},dispose(){}}}
    const {S,auth,db}=F; let rosterUnsub=null;
    try{await S.auth.setPersistence(auth,S.auth.browserSessionPersistence)}catch{}
    const clear=()=>{try{rosterUnsub?.()}catch{} rosterUnsub=null};
    const authUnsub=S.auth.onAuthStateChanged(auth,user=>{
      clear();
      if(!user){emit(onUpdate,{status:'signed-out',message:'Sign in with the authorized teacher Google account.'});return}
      const email=Core.normalizedEmail(user.email);
      if(!Core.isTeacherEmail(email)){emit(onUpdate,{status:'unauthorized',user,message:'This account does not have Teacher Command access.'});return}
      emit(onUpdate,{status:'checking',user,message:'Loading the live roster read-only…'});
      rosterUnsub=S.firestore.onSnapshot(S.firestore.collection(db,'students'),snap=>{
        const rows=snap.docs.map(d=>({id:d.id,...d.data()}));
        emit(onUpdate,{status:'authorized',user,teacherName:user.displayName||'Mr. Evans',students:Core.normalizeTeacherRoster(rows)});
      },err=>emit(onUpdate,{status:'error',user,message:`Teacher roster read failed: ${err?.code||err?.message||err}`}));
    });
    const controller={environment,async signIn(){const provider=new S.auth.GoogleAuthProvider();return S.auth.signInWithPopup(auth,provider)},async signOut(){return S.auth.signOut(auth)},dispose(){clear();try{authUnsub()}catch{}}};
    controllers.push(controller);return controller;
  }

  window.addEventListener('pagehide',()=>controllers.splice(0).forEach(c=>{try{c.dispose()}catch{}}),{once:true});
  window.DWV33Integration=Object.freeze({version:VERSION,environment,startStudent,startTeacher,core:Core});
})();
