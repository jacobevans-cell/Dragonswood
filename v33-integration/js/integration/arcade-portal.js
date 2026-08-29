(function(){
  'use strict';

  const RELEASE='57.1.15';
  let clientPromise=null;
  let preflightPromise=null;

  function rootUrl(path=''){
    return new URL(path,new URL('../',document.baseURI));
  }
  function client(){
    return clientPromise||(clientPromise=import(`../../../arcade/js/access-client.js?v=${RELEASE}`));
  }
  async function getAccess(){return (await client()).getArcadeAccess()}
  async function startSession(){return (await client()).startArcadeSession()}

  function href(){
    const url=rootUrl('arcade/index.html');
    const env=window.DWV33Integration?.environment;
    url.searchParams.set('dwDirect','1');
    url.searchParams.set('v',RELEASE);
    if(env==='emulator')url.searchParams.set('dw-env','emulator');
    if(env==='production'){
      url.searchParams.set('dw-env','production');
      url.searchParams.set('dw-arcade-live','I_UNDERSTAND');
    }
    return url.href;
  }

  async function clearOldArcadeRuntime(){
    try{
      if('serviceWorker' in navigator){
        const regs=await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.filter(reg=>{
          try{return new URL(reg.scope).pathname.includes('/arcade/')}catch{return false}
        }).map(reg=>reg.unregister()));
      }
    }catch(err){console.warn('[Arcade cache reset: service worker]',err)}
    try{
      if('caches' in window){
        const keys=await caches.keys();
        await Promise.all(keys.filter(key=>key.startsWith('dragonswood-arcade-')).map(key=>caches.delete(key)));
      }
    }catch(err){console.warn('[Arcade cache reset: cache storage]',err)}
  }

  async function verifyAsset(path){
    const url=rootUrl(path);
    url.searchParams.set('dwPreflight',RELEASE);
    const response=await fetch(url.href,{cache:'no-store',credentials:'same-origin'});
    if(!response.ok)throw new Error(`Arcade runtime is unavailable (${path}: ${response.status}).`);
    await response.arrayBuffer();
  }

  function preflight(){
    if(preflightPromise)return preflightPromise;
    preflightPromise=(async()=>{
      await clearOldArcadeRuntime();
      await Promise.all([
        'arcade/index.html','arcade/style.css','arcade/access.css',
        'arcade/js/access-client.js','arcade/js/access-bootstrap.js','arcade/js/arcade.js',
        'arcade/js/arcade-config.js','arcade/js/game-registry.js','arcade/js/leaderboard-service.js'
      ].map(verifyAsset));
      return true;
    })().catch(err=>{preflightPromise=null;throw err});
    return preflightPromise;
  }

  function navigate(){location.assign(href())}

  window.DWV33ArcadePortal=Object.freeze({release:RELEASE,getAccess,startSession,preflight,href,navigate});
})();
