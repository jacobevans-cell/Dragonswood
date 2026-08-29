const PROD_CONFIG={apiKey:'AIzaSyC918WJoGQgxRKsqcz-3bXI7iZWv_1bwYE',authDomain:'dragonswood-9289e.firebaseapp.com',projectId:'dragonswood-9289e',storageBucket:'dragonswood-9289e.firebasestorage.app',messagingSenderId:'1064477064695',appId:'1:1064477064695:web:283e1016ee2303d39042f2'};
const DEMO_CONFIG={apiKey:'demo-key',authDomain:'demo-dragonswood-v33.localhost',projectId:'demo-dragonswood-v33',storageBucket:'demo-dragonswood-v33.appspot.com',messagingSenderId:'000000000000',appId:'1:000000000000:web:demo-v33'};
const cfg=window.DRAGONSWOOD_ARCADE_CONFIG||{};
const params=new URLSearchParams(location.search);

// V57.1.10 Arcade wallet live-read repair.
// The production student shell already declares data-dw-environment="production".
// Honor that declaration when this module is imported by the student portal instead
// of silently falling back to the localhost emulator and displaying a fake 0/3 wallet.
const declaredEnvironment=String(document.documentElement?.dataset?.dwEnvironment||'').toLowerCase();
const requested=params.get('dw-env')||(declaredEnvironment==='production'?'production':cfg.environment||'emulator');
const production=declaredEnvironment==='production'||(requested==='production'&&params.get('dw-arcade-live')==='I_UNDERSTAND');
export const environment=production?'production':'emulator';
let contextPromise=null,currentAccess=null;

function waitForUser(auth,authMod,timeoutMs=4500){
  if(auth.currentUser)return Promise.resolve(auth.currentUser);
  return new Promise(resolve=>{let done=false;const finish=user=>{if(done)return;done=true;clearTimeout(timer);try{unsub()}catch{}resolve(user||null)};const unsub=authMod.onAuthStateChanged(auth,finish);const timer=setTimeout(()=>finish(null),timeoutMs)});
}
export async function getFirebaseContext(){
  if(contextPromise)return contextPromise;
  contextPromise=Promise.all([
    import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js'),
    import('https://www.gstatic.com/firebasejs/12.1.0/firebase-functions.js')
  ]).then(async([appMod,authMod,fsMod,fnMod])=>{
    const config=environment==='emulator'?DEMO_CONFIG:PROD_CONFIG;
    let app;try{app=appMod.getApp()}catch{app=appMod.initializeApp(config)}
    const auth=authMod.getAuth(app),db=fsMod.getFirestore(app),functions=fnMod.getFunctions(app,'us-central1');
    if(environment==='emulator'){
      try{authMod.connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true})}catch{}
      try{fsMod.connectFirestoreEmulator(db,'127.0.0.1',8080)}catch{}
      try{fnMod.connectFunctionsEmulator(functions,'127.0.0.1',5001)}catch{}
    }
    const user=await waitForUser(auth,authMod);
    if(!user)throw new Error('Sign in through the Dragonswood portal before opening Arcade.');
    return {app,auth,db,functions,user,appMod,authMod,fsMod,fnMod};
  });
  return contextPromise;
}
async function callable(name,data={}){const C=await getFirebaseContext();return (await C.fnMod.httpsCallable(C.functions,name)(data)).data}
export async function getArcadeAccess(){currentAccess=await callable('getArcadeAccess');return currentAccess}
export async function startArcadeSession(){currentAccess=await callable('startArcadeSession');return currentAccess}
export async function endArcadeSession(reason='student-exit'){const result=await callable('endArcadeSession',{sessionId:currentAccess?.sessionId||'',reason});currentAccess=null;return result}
export function getCurrentAccess(){return currentAccess}
export function setCurrentAccess(value){currentAccess=value||null;return currentAccess}
export function remainingMs(access=currentAccess){
  if(!access?.active)return 0;
  const offset=Date.now()-Number(access.serverNowMillis||Date.now());
  return Math.max(0,Number(access.endAtMillis||0)-(Date.now()-offset));
}
