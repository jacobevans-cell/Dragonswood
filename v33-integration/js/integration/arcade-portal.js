(function(){
  'use strict';

  const RELEASE='57.1.14';
  let clientPromise=null;
  let entering=false;

  function client(){
    return clientPromise||(clientPromise=import(`../../../arcade/js/access-client.js?v=${RELEASE}`));
  }

  async function getAccess(){return (await client()).getArcadeAccess()}
  async function startSession(){return (await client()).startArcadeSession()}

  function href(){
    const url=new URL('../arcade/index.html',document.baseURI);
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

  function toast(message){
    const el=document.querySelector('#toast');
    if(!el)return;
    el.textContent=message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer=setTimeout(()=>el.classList.remove('show'),4800);
  }

  function setBusy(trigger,busy){
    if(!trigger)return;
    if(busy){
      if(!trigger.dataset.dwOldHtml)trigger.dataset.dwOldHtml=trigger.innerHTML;
      trigger.disabled=true;
      trigger.setAttribute('aria-busy','true');
      trigger.innerHTML='<span class="nav-icon">🕹️</span><span><span class="nav-main">Opening Arcade…</span><span class="nav-sub">Checking Tokens</span></span>';
    }else{
      trigger.disabled=false;
      trigger.removeAttribute('aria-busy');
      if(trigger.dataset.dwOldHtml){trigger.innerHTML=trigger.dataset.dwOldHtml;delete trigger.dataset.dwOldHtml}
    }
  }

  async function clearOldArcadeRuntime(){
    // The old Arcade service worker was cache-first and could permanently serve
    // repaired JavaScript from its stale cache. Clear only Arcade-scoped workers
    // and caches before entering; the new network-first worker registers again.
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

  function friendlyError(access){
    if(access?.teacherEnabled!==true)return 'Arcade Time is still locked by your teacher.';
    const tokens=Math.max(0,Math.min(3,Number(access?.tokens)||0));
    if(tokens<3){const missing=3-tokens;return `You need ${missing} more Arcade Token${missing===1?'':'s'} before entering.`}
    return '';
  }

  async function enter({trigger=null,returnHash='#adventure'}={}){
    if(entering)return;
    entering=true;
    setBusy(trigger,true);
    toast('Checking Arcade Tokens…');
    try{
      let access=await getAccess();
      if(access?.active!==true){
        const blocked=friendlyError(access);
        if(blocked)throw new Error(blocked);
        toast('Using 3 Tokens and starting 30 minutes…');
        access=await startSession();
      }
      if(access?.active!==true)throw new Error('Arcade session did not start. Your Tokens were not intentionally spent by this page.');
      await clearOldArcadeRuntime();
      location.assign(href());
    }catch(err){
      setBusy(trigger,false);
      entering=false;
      toast(err?.message||'Arcade Time could not open.');
      if(location.hash==='#arcade')location.hash=String(returnHash||'#adventure').replace(/^#/,'')||'adventure';
    }
  }

  window.DWV33ArcadePortal=Object.freeze({getAccess,startSession,href,enter});

  // Use the Student Portal's own openPage() first so Morning Work, Recovery,
  // and active-pass gates remain authoritative. If it permits #arcade, restore
  // the current portal route immediately and launch Arcade directly in this tab.
  document.addEventListener('click',event=>{
    const oldEnter=event.target.closest?.('[data-arcade-enter]');
    if(oldEnter){
      event.preventDefault();
      event.stopImmediatePropagation();
      enter({trigger:oldEnter,returnHash:'#adventure'});
      return;
    }

    const trigger=event.target.closest?.('[data-page="arcade"]');
    if(!trigger)return;

    if(typeof window.openPage!=='function'){
      const prior=location.hash||'#adventure';
      setTimeout(()=>{if(location.hash==='#arcade')enter({trigger,returnHash:prior})},0);
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    const prior=location.hash&&location.hash!=='#arcade'?location.hash:'#adventure';
    window.openPage('arcade');
    if(location.hash!=='#arcade')return; // Existing portal gate blocked entry.
    history.replaceState(null,'',prior);
    enter({trigger,returnHash:prior});
  },true);
})();
