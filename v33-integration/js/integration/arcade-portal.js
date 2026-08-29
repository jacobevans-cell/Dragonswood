(function(){
  'use strict';
  let clientPromise=null;
  function client(){return clientPromise||(clientPromise=import('../../../arcade/js/access-client.js'))}
  async function getAccess(){return (await client()).getArcadeAccess()}
  function href(){
    const url=new URL('../arcade/index.html',document.baseURI);
    const env=window.DWV33Integration?.environment;
    url.searchParams.set('dwEmbed','1');
    if(env==='emulator')url.searchParams.set('dw-env','emulator');
    if(env==='production'){
      url.searchParams.set('dw-env','production');
      url.searchParams.set('dw-arcade-live','I_UNDERSTAND');
    }
    return url.href;
  }
  window.DWV33ArcadePortal=Object.freeze({getAccess,href});

  // V57.1.12: Arcade and Kingdom Wars remain secure standalone engines, but
  // when the Student Portal hosts them they should look like native routes,
  // not a second website nested inside Dragonswood.
  function normalizeEmbeddedFrame(frame){
    if(!frame||frame.dataset.dwNativeBound==='1')return;
    const title=String(frame.title||'');
    if(!/Dragonswood Arcade|Kingdom Wars/i.test(title))return;
    frame.dataset.dwNativeBound='1';
    const apply=()=>{
      let doc;try{doc=frame.contentDocument}catch{return}
      if(!doc)return;
      const isArcade=/Dragonswood Arcade/i.test(title);
      doc.documentElement.classList.add('dw-native-portal-embed');
      const style=doc.createElement('style');
      style.dataset.dwNativePortal='57.1.12';
      style.textContent=isArcade
        ? `header.arcade-header{display:none!important}body{padding-top:0!important}.hero{margin-top:0!important}#cloudBadge{transition:opacity .2s}`
        : `header.topbar{display:none!important}main.shell{padding-top:12px!important}a[href="index.html"]{display:none!important}`;
      doc.head?.appendChild(style);
      const badge=isArcade?doc.querySelector('#cloudBadge'):null;
      if(badge&&badge.textContent.trim()==='LOCAL MODE')badge.textContent='CONNECTING…';
    };
    frame.addEventListener('load',apply);
    if(frame.contentDocument?.readyState==='complete')apply();
  }
  function scan(){document.querySelectorAll('iframe').forEach(normalizeEmbeddedFrame)}
  const observer=new MutationObserver(scan);
  observer.observe(document.documentElement,{subtree:true,childList:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});
  else scan();
})();
