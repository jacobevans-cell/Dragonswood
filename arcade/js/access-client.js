const PROD_CONFIG={apiKey:'AIzaSyC918WJoGQgxRKsqcz-3bXI7iZWv_1bwYE',authDomain:'dragonswood-9289e.firebaseapp.com',projectId:'dragonswood-9289e',storageBucket:'dragonswood-9289e.firebasestorage.app',messagingSenderId:'1064477064695',appId:'1:1064477064695:web:283e1016ee2303d39042f2'};
const DEMO_CONFIG={apiKey:'demo-key',authDomain:'demo-dragonswood-v33.localhost',projectId:'demo-dragonswood-v33',storageBucket:'demo-dragonswood-v33.appspot.com',messagingSenderId:'000000000000',appId:'1:000000000000:web:demo-v33'};
const cfg=window.DRAGONSWOOD_ARCADE_CONFIG||{};
const params=new URLSearchParams(location.search);
const declaredEnvironment=String(document.documentElement?.dataset?.dwEnvironment||'').toLowerCase();
const requested=params.get('dw-env')||(declaredEnvironment==='production'?'production':cfg.environment||'emulator');
const trustedProductionHost=location.protocol==='https:'&&location.hostname==='jacobevans-cell.github.io';
const production=declaredEnvironment==='production'||trustedProductionHost||(requested==='production'&&params.get('dw-arcade-live')==='I_UNDERSTAND');
export const environment=production?'production':'emulator';
let contextPromise=null;
let currentAccess=null;

function waitForUser(auth,authMod,timeoutMs=8000){
  if(auth.currentUser)return Promise.resolve(auth.currentUser);
  return new Promise(resolve=>{
    let settled=false;
    let timer=null;
    let unsubscribe=()=>{};
    const finish=user=>{
      if(settled)return;
      settled=true;
      if(timer)clearTimeout(timer);
      try{unsubscribe()}catch{}
      resolve(user||null);
    };
    unsubscribe=authMod.onAuthStateChanged(auth,finish);
    timer=setTimeout(()=>finish(null),timeoutMs);
  });
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
    let app;
    try{app=appMod.getApp()}catch{app=appMod.initializeApp(config)}
    const auth=authMod.getAuth(app);
    const db=fsMod.getFirestore(app);
    const functions=fnMod.getFunctions(app,'us-central1');
    if(environment==='emulator'){
      try{authMod.connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true})}catch{}
      try{fsMod.connectFirestoreEmulator(db,'127.0.0.1',8080)}catch{}
      try{fnMod.connectFunctionsEmulator(functions,'127.0.0.1',5001)}catch{}
    }
    const user=await waitForUser(auth,authMod);
    if(!user)throw new Error('Sign in through the Dragonswood portal before opening Arcade.');
    return {app,auth,db,functions,user,appMod,authMod,fsMod,fnMod};
  }).catch(err=>{contextPromise=null;throw err});
  return contextPromise;
}

async function callable(name,data={}){
  const C=await getFirebaseContext();
  return (await C.fnMod.httpsCallable(C.functions,name)(data)).data;
}

export async function getArcadeAccess(){currentAccess=await callable('getArcadeAccess');return currentAccess}
export async function startArcadeSession(){currentAccess=await callable('startArcadeSession');return currentAccess}
export async function recordArcadeGameResult(result){return callable('recordArcadeGameResult',{sessionId:currentAccess?.sessionId||'',result})}
export async function endArcadeSession(reason='student-exit'){
  const result=await callable('endArcadeSession',{sessionId:currentAccess?.sessionId||'',reason});
  currentAccess=null;
  return result;
}
export function getCurrentAccess(){return currentAccess}
export function setCurrentAccess(value){currentAccess=value||null;return currentAccess}
export function remainingMs(access=currentAccess){
  if(!access?.active)return 0;
  const offset=Date.now()-Number(access.serverNowMillis||Date.now());
  return Math.max(0,Number(access.endAtMillis||0)-(Date.now()-offset));
}
