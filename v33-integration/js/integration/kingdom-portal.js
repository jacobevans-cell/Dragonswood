(function(){
  'use strict';
  function href(){
    const url=new URL('../kingdom-test.html',location.href);
    if(window.DWV33Integration?.environment==='emulator')url.searchParams.set('dw-env','emulator');
    return url.href;
  }
  window.DWV33KingdomPortal=Object.freeze({href});
})();
