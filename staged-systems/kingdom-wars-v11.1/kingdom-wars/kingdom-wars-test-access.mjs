const SDK='12.1.0';
const CFG={
  apiKey:'AIzaSyC918WJoGQgxRKsqcz-3bXI7iZWv_1bwYE',
  authDomain:'dragonswood-9289e.firebaseapp.com',
  projectId:'dragonswood-9289e',
  storageBucket:'dragonswood-9289e.firebasestorage.app',
  messagingSenderId:'1064477064695',
  appId:'1:1064477064695:web:283e1016ee2303d39042f2'
};

const ADMIN_EMAILS=new Set(['jacobicusjax@gmail.com']);
const AUTH_TIMEOUT=Symbol('auth-timeout');

async function modules(){
  const [appMod,authMod,fsMod]=await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${SDK}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${SDK}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${SDK}/firebase-firestore.js`)
  ]);
  const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(CFG);
  return {app,auth:authMod.getAuth(app),db:fsMod.getFirestore(app),authMod,fsMod};
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

export function authorizeKingdomTester({email='',student=null,testerAccountExists=false}={}){
  const normalizedEmail=String(email||'').trim().toLowerCase();
  if(ADMIN_EMAILS.has(normalizedEmail))return {allowed:true,reason:'admin'};
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
    if(adminDecision.allowed)return {...adminDecision,user,student:null};

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
    return {...decision,user,student};
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
        <h1 style="font-family:Georgia;color:#ffe08a">Tester Realm Locked</h1>
        <p>${session.reason==='auth-timeout'?'Your sign-in is still loading. Check your connection, then try again.':'This Kingdom Wars build is currently available only to Dragonswood tester and admin accounts.'}</p>
        <a href="index.html" style="display:inline-block;margin-top:12px;padding:11px 16px;border-radius:10px;background:#7130c7;color:#fff;text-decoration:none;font-weight:800">← Return to Dragonswood</a>
      </section>
    </main>`;
  throw new Error(`Kingdom Wars tester access denied: ${session.reason}`);
}
