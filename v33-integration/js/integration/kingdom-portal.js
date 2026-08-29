(function(){
  'use strict';
  function href(){
    const env=window.DWV33Integration?.environment;
    const url=new URL(env==='production'?'../kingdom.html':'../kingdom-test.html',document.baseURI);
    url.searchParams.set('v','57.1.16');
    url.searchParams.set('dwEmbed','1');
    if(env==='emulator')url.searchParams.set('dw-env','emulator');
    if(env==='production'){
      url.searchParams.set('dw-env','production');
      url.searchParams.set('dw-kingdom-live','I_UNDERSTAND');
    }
    return url.href;
  }
  window.DWV33KingdomPortal=Object.freeze({href});
})();
