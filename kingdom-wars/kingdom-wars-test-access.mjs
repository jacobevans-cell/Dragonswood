const SDK='12.1.0';
const PROD_CFG={
  apiKey:'AIzaSyC918WJoGQgxRKsqcz-3bXI7iZWv_1bwYE',
  authDomain:'dragonswood-9289e.firebaseapp.com',
  projectId:'dragonswood-9289e',
  storageBucket:'dragonswood-9289e.firebasestorage.app',
  messagingSenderId:'1064477064695',
  appId:'1:1064477064695:web:283e1016ee2303d39042f2'
};
const DEMO_CFG={apiKey:'demo-key',authDomain:'demo-dragonswood-v33.localhost',projectId:'demo-dragonswood-v33',storageBucket:'demo-dragonswood-v33.appspot.com',messagingSenderId:'000000000000',appId:'1:000000000000:web:demo-v33'};
const params=typeof location==='undefined'?new URLSearchParams():new URLSearchParams(location.search);
const requested=params.get('dw-env')||'emulator';
const production=requested==='production'&&params.get('dw-kingdom-live')==='I_UNDERSTAND';
export const environment=production?'production':'emulator';

const ADMIN_EMAILS=new Set(['jacobicusjax@gmail.com']);
const AUTH_TIMEOUT=Symbol('auth-timeout');

async function modules(){
  const [appMod,authMod,fsMod]=await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${SDK}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${SDK}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${SDK}/firebase-firestore.js`)
  ]);
  const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(environment==='emulator'?DEMO_CFG:PROD_CFG);
  const auth=authMod.getAuth(app),db=fsMod.getFirestore(app);
  if(environment==='emulator'){
    try{authMod.connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true})}catch{}
    try{fsMod.connectFirestoreEmulator(db,'127.0.0.1',8080)}catch{}
  }
  return {app,auth,db,authMod,fsMod};
}

async function waitForUser(auth,authMod,timeoutMs=12000){
  if(auth.currentUser)return auth.currentUser;
  return new Promise(resolve=>{
    let done=false;
    const timer=setTimeout(()=>{if(done)return;done=true;off();resolve(AUTH_TIMEOUT)},timeoutMs);
    const off=authMod.onAuthStateChanged(auth,u=>{
      if(done)return;done=true;clearTimeout(timer);off();resolve(u||null);
    });
  });
}

function roleFromStudent(d={}){
  const role=String(d.role||d.accountRole||d.accountType||'').toLowerCase();
  return d.tester===true||d.isTester===true||d.admin===true||d.isAdmin===true||
    ['tester','admin','teacher','developer'].includes(role);
}

function phoenixDateKey(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Phoenix',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
async function morningWorkAccess(db,fsMod,uid){
  const dateKey=phoenixDateKey();
  const [progress,override]=await Promise.all([
    fsMod.getDocs(fsMod.query(fsMod.collection(db,'dailyQuestProgress'),fsMod.where('studentId','==',uid))),
    fsMod.getDoc(fsMod.doc(db,'classData','dailyAccessOverride'))
  ]);
  const morningComplete=progress.docs.some(d=>{const row=d.data()||{};return row.dateKey===dateKey&&row.session==='morning'&&row.status==='complete'&&d.id.endsWith('_v48')});
  const o=override.exists()?override.data()||{}:{};
  const teacherOverride=o.dateKey===dateKey&&(o.all===true||(Array.isArray(o.studentIds)&&o.studentIds.map(String).includes(String(uid))));
  return {dateKey,morningComplete,teacherOverride,unlocked:morningComplete||teacherOverride};
}

export function authorizeKingdomTester({email='',student=null,testerAccountExists=false}={}){
  const normalizedEmail=String(email||'').trim().toLowerCase();
  if(ADMIN_EMAILS.has(normalizedEmail))return {allowed:true,reason:'admin'};
  if(environment==='production'&&normalizedEmail.endsWith('@explore.academy'))return {allowed:true,reason:'student-beta'};
  if(testerAccountExists)return {allowed:true,reason:'tester-account'};
  if(roleFromStudent(student||{}))return {allowed:true,reason:'student-role'};
  return {allowed:false,reason:'not-authorized'};
}

export async function getKingdomTesterSession({silent=false}={}){
  try{
    const {auth,db,authMod,fsMod}=await modules();
    const user=await waitForUser(auth,authMod);
    if(user===AUTH_TIMEOUT)return {allowed:false,reason:'auth-timeout',user:null,student:null};
    if(!user)return {allowed:false,reason:'not-signed-in',user:null,student:null};

    const email=String(user.email||'').toLowerCase();
    const adminDecision=authorizeKingdomTester({email});
    if(adminDecision.allowed)return {...adminDecision,user,student:null,dailyAccessUnlocked:true,environment};

    let student=null;
    try{
      const s=await fsMod.getDoc(fsMod.doc(db,'students',user.uid));
      if(s.exists())student=s.data()||{};
    }catch{}

    let testerAccountExists=false;
    try{
      const t=await fsMod.getDoc(fsMod.doc(db,'testerAccounts',user.uid));
      testerAccountExists=t.exists();
    }catch{}

    const decision=authorizeKingdomTester({email,student,testerAccountExists});
    if(!decision.allowed)return {...decision,user,student,dailyAccessUnlocked:false,environment};
    let access;
    try{access=await morningWorkAccess(db,fsMod,user.uid)}catch(error){return {allowed:false,reason:'morning-work-check-failed',user,student,dailyAccessUnlocked:false,environment,error}}
    if(!access.unlocked)return {allowed:false,reason:'morning-work',user,student,dailyAccessUnlocked:false,environment,...access};
    return {...decision,user,student,dailyAccessUnlocked:true,environment,...access};
  }catch(e){
    if(!silent)console.error('Kingdom tester access check failed',e);
    return {allowed:false,reason:'access-check-failed',user:null,student:null,error:e};
  }
}

export async function requireKingdomTester(){
  const session=await getKingdomTesterSession();
  if(session.allowed)return session;

  document.body.innerHTML=`
    <main style="min-height:100vh;display:grid;place-items:center;background:#050518;color:white;font-family:Arial;padding:24px">
      <section style="max-width:520px;padding:28px;border:1px solid #8d6cc7;border-radius:18px;background:#100d31;text-align:center">
        <div style="font-size:52px">🔒</div>
        <h1 style="font-family:Georgia;color:#ffe08a">${environment==='production'?'Kingdom Wars Locked':'Tester Realm Locked'}</h1>
        <p>${session.reason==='auth-timeout'?'Your sign-in is still loading. Check your connection, then try again.':session.reason==='morning-work'?'Finish Morning Work before entering Kingdom Wars. Your teacher can also grant today’s access override.':session.reason==='morning-work-check-failed'?'Morning Work access could not be verified, so Kingdom Wars stayed safely locked.':environment==='production'?'Sign in with your Explore Academy student account to enter Kingdom Wars.':'This Kingdom Wars build is currently available only to Dragonswood tester and admin accounts.'}</p>
        <a href="${environment==='production'?'index.html':'v33-integration/student-test.html'}" style="display:inline-block;margin-top:12px;padding:11px 16px;border-radius:10px;background:#7130c7;color:#fff;text-decoration:none;font-weight:800">← Return to Dragonswood</a>
      </section>
    </main>`;
  throw new Error(`Kingdom Wars tester access denied: ${session.reason}`);
}
