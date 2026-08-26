(function(){
  'use strict';
  const params=new URLSearchParams(location.search);
  const enabled=window.DWV33Integration?.environment==='emulator'
    && params.get('dw-arcade-writes')==='EMULATOR_ONLY';
  let contextPromise=null;

  async function context(){
    if(!enabled)throw new Error('Arcade teacher writes require the fictional emulator and the exact EMULATOR_ONLY opt-in.');
    if(contextPromise)return contextPromise;
    contextPromise=Promise.all([
      import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.1.0/firebase-functions.js')
    ]).then(([appMod,authMod,fnMod])=>{
      const app=appMod.getApp('DragonswoodV33TeacherIntegration');
      const auth=authMod.getAuth(app);
      if(!auth.currentUser)throw new Error('Sign in as the authorized teacher before using Arcade controls.');
      const functions=fnMod.getFunctions(app,'us-central1');
      try{fnMod.connectFunctionsEmulator(functions,'127.0.0.1',5001)}catch{}
      return {auth,functions,fnMod};
    });
    return contextPromise;
  }

  async function call(name,data={}){
    const C=await context();
    return (await C.fnMod.httpsCallable(C.functions,name)(data)).data;
  }

  window.DWV33ArcadeTeacher=Object.freeze({
    enabled,
    getState:(uid,periodId)=>call('getArcadeTeacherState',{uid,periodId}),
    award:(uid,criterion,periodId)=>call('awardArcadeCriterion',{uid,criterion,periodId}),
    setAvailability:(enabled,uid='')=>call('setArcadeAvailability',{enabled,uid}),
    refund:(uid,sessionId,reason)=>call('refundArcadeSession',{uid,sessionId,reason})
  });
})();
