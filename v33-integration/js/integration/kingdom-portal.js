(function(){
  'use strict';
  function href(){
    const env=window.DWV33Integration?.environment;
    const url=new URL(env==='production'?'../kingdom.html':'../kingdom-test.html',document.baseURI);
    if(env==='emulator')url.searchParams.set('dw-env','emulator');
    if(env==='production'){
      url.searchParams.set('dw-env','production');
      url.searchParams.set('dw-kingdom-live','I_UNDERSTAND');
    }
    return url.href;
  }
  window.DWV33KingdomPortal=Object.freeze({href});
})();
