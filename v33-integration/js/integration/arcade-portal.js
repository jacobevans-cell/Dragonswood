(function(){
  'use strict';
  let clientPromise=null;
  function client(){return clientPromise||(clientPromise=import('../../../arcade/js/access-client.js'))}
  async function getAccess(){return (await client()).getArcadeAccess()}
  function href(){
    const url=new URL('../arcade/index.html',document.baseURI);
    const env=window.DWV33Integration?.environment;
    if(env==='emulator')url.searchParams.set('dw-env','emulator');
    if(env==='production'){
      url.searchParams.set('dw-env','production');
      url.searchParams.set('dw-arcade-live','I_UNDERSTAND');
    }
    return url.href;
  }
  window.DWV33ArcadePortal=Object.freeze({getAccess,href});
})();
