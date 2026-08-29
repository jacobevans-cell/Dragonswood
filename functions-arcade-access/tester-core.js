(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.DWTesterAccess=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const CAPABILITIES=Object.freeze([
    'selfUnlockMorning','selfUnlockCurriculum','selfUnlockArcade',
    'selfUnlockKingdom','selfAwardPoints'
  ]);
  const UNLOCK_CAPABILITIES=Object.freeze({
    unlockMorning:'selfUnlockMorning',
    unlockCurriculum:'selfUnlockCurriculum',
    unlockArcade:'selfUnlockArcade',
    unlockKingdom:'selfUnlockKingdom'
  });

  const text=value=>String(value??'').trim();
  function capabilityMap(data={}){
    const source=data?.capabilities&&typeof data.capabilities==='object'?data.capabilities:{};
    return Object.freeze(Object.fromEntries(CAPABILITIES.map(name=>[name,source[name]===true])));
  }
  function normalizeTester(uid,data=null){
    const authenticated=!!text(uid),exists=!!data&&typeof data==='object',active=authenticated&&exists&&data.active===true;
    return Object.freeze({
      uid:text(uid),authenticated,exists,active,isTester:active,
      email:text(data?.email).toLowerCase(),label:text(data?.label),
      capabilities:capabilityMap(active?data:{})
    });
  }
  async function resolveTester(uid,readRecord){
    if(!text(uid)||typeof readRecord!=='function')return normalizeTester(uid,null);
    try{return normalizeTester(uid,await readRecord(text(uid)))}catch{return normalizeTester(uid,null)}
  }
  function hasCapability(session,name){
    return session?.isTester===true&&CAPABILITIES.includes(String(name||''))&&session.capabilities?.[name]===true;
  }
  function normalizeControls(session,data={}){
    const out={};
    for(const [field,capability] of Object.entries(UNLOCK_CAPABILITIES))out[field]=hasCapability(session,capability)&&data?.[field]===true;
    return Object.freeze(out);
  }
  function unlockEnabled(session,controls,field){
    const capability=UNLOCK_CAPABILITIES[field];
    return !!capability&&hasCapability(session,capability)&&controls?.[field]===true;
  }
  function unlockPatch(session,value=true){
    return Object.freeze(Object.fromEntries(Object.entries(UNLOCK_CAPABILITIES).map(([field,capability])=>[field,value===true&&hasCapability(session,capability)])));
  }

  return Object.freeze({CAPABILITIES,UNLOCK_CAPABILITIES,normalizeTester,resolveTester,hasCapability,normalizeControls,unlockEnabled,unlockPatch});
});
