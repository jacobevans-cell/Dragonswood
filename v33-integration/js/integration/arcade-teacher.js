(function(){
  'use strict';
  const params=new URLSearchParams(location.search);
  const environment=window.DWV33Integration?.environment||'emulator';
  const enabled=environment==='production'
    || (environment==='emulator'&&params.get('dw-arcade-writes')==='EMULATOR_ONLY');
  let contextPromise=null;

  async function context(){
    if(!enabled)throw new Error('Arcade teacher controls are unavailable in this read-only environment.');
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
      if(environment==='emulator')try{fnMod.connectFunctionsEmulator(functions,'127.0.0.1',5001)}catch{}
      return {auth,functions,fnMod};
    });
    return contextPromise;
  }

  async function call(name,data={}){
    const C=await context();
    return (await C.fnMod.httpsCallable(C.functions,name)(data)).data;
  }

  const API=Object.freeze({
    enabled,
    getState:(uid,periodId)=>call('getArcadeTeacherState',{uid,periodId}),
    award:(uid,criterion,periodId)=>call('awardArcadeCriterion',{uid,criterion,periodId}),
    setAvailability:(enabled,uid='')=>call('setArcadeAvailability',{enabled,uid}),
    refund:(uid,sessionId,reason)=>call('refundArcadeSession',{uid,sessionId,reason})
  });
  window.DWV33ArcadeTeacher=API;

  // V57.1.13 Teacher UX normalization + mutation-loop crash repair.
  // Token criteria are DAILY classroom choices. They are deliberately not tied
  // to the current schedule, current clock time, or a scheduled class period.
  const DAILY_AWARD_SET='daily_tokens';
  const esc=value=>String(value??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  function showToast(message){
    const toast=document.querySelector('#toast');
    if(!toast)return;
    toast.textContent=message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer=setTimeout(()=>toast.classList.remove('show'),3600);
  }

  function normalizeTokenAwardSet(){
    const select=document.querySelector('#arcade-period');
    if(!select)return;
    if(select.dataset.dwDailyAwards!=='1'){
      select.innerHTML='<option value="daily_tokens">Today • Ready / Responsible / Complete</option>';
      select.value=DAILY_AWARD_SET;
      select.dataset.dwDailyAwards='1';
      const label=select.closest('.field')?.querySelector('label');
      if(label)label.textContent='Token award set';
    }else if(select.value!==DAILY_AWARD_SET){
      select.value=DAILY_AWARD_SET;
    }
    const panel=select.closest('.panel')||select.closest('section');
    const note=panel?.querySelector('.prototype-note');
    const noteText='Today • Ready, Responsible, and Complete can each be awarded once per Phoenix school day • not tied to a class time • wallet maximum 3.';
    // V57.1.13: only mutate the DOM when the copy actually changed.
    // Unconditionally assigning textContent inside the MutationObserver caused
    // an endless childList mutation loop when Arcade Time was opened.
    if(note&&note.textContent!==noteText)note.textContent=noteText;
  }

  function seatingUrl(){
    const url=new URL('../seating-command/index.html',document.baseURI);
    url.searchParams.set('v','57.1.12');
    if(environment!=='production')url.searchParams.set('dw-env','emulator');
    url.searchParams.set('dwEmbed','1');
    return url.href;
  }

  function ensureSeatingNav(){
    const nav=document.querySelector('.teacher-nav');
    if(!nav||nav.querySelector('[data-native-seating]'))return;
    const button=document.createElement('button');
    button.className='nav-link';
    button.type='button';
    button.dataset.nativeSeating='1';
    button.innerHTML='<span class="nav-icon">🪑</span><span class="nav-main">Seating Command</span>';
    nav.appendChild(button);
  }

  function renderSeatingRoute(){
    if(location.hash!=='#seating-command')return;
    const content=document.querySelector('.teacher-content');
    const nav=document.querySelector('.teacher-nav');
    if(!content||!nav)return;
    nav.querySelectorAll('.nav-link').forEach(el=>el.classList.toggle('active',el.hasAttribute('data-native-seating')));
    const current=content.querySelector('[data-native-seating-page]');
    if(current)return;
    content.innerHTML=`
      <section data-native-seating-page>
        <section class="teacher-page-banner">
          <div class="teacher-page-title">
            <div class="teacher-page-icon">🪑</div>
            <div><div class="eyebrow">CLASSROOM LAYOUT</div><h2>Seating Command</h2><p>Build, optimize, and manage the room without leaving Dragonswood Command.</p></div>
          </div>
          <button class="btn btn-secondary btn-sm" type="button" data-native-seating-back>← Classroom Tools</button>
        </section>
        <section class="panel" style="padding:0;overflow:hidden;min-height:calc(100vh - 190px)">
          <iframe data-native-seating-frame title="Seating Command and Room Builder" src="${esc(seatingUrl())}"
            style="display:block;width:100%;height:calc(100vh - 195px);min-height:690px;border:0;background:#07101f"></iframe>
        </section>
      </section>`;
  }

  async function setWholeClassAvailability(on,button){
    if(!API.enabled){showToast('Arcade controls are unavailable in this environment.');return}
    const ids=[...new Set([...document.querySelectorAll('[data-arcade-student]')].map(el=>el.dataset.arcadeStudent).filter(Boolean))];
    if(button){button.disabled=true;button.dataset.oldText=button.textContent;button.textContent=on?'Opening class…':'Locking class…'}
    try{
      // Authoritative class switch first.
      await API.setAvailability(on);
      // Clear stale per-student overrides in small batches. "Open class" therefore
      // means OPEN THE CLASS; "Lock class" means LOCK THE CLASS.
      for(let i=0;i<ids.length;i+=6){
        await Promise.all(ids.slice(i,i+6).map(uid=>API.setAvailability(on,uid)));
      }
      showToast(`Arcade Time ${on?'OPEN for the class':'LOCKED for the class'}.`);
      setTimeout(()=>document.querySelector('[data-arcade-refresh]')?.click(),250);
    }catch(err){
      showToast(err?.message||'Arcade class availability could not update.');
    }finally{
      if(button){button.disabled=false;button.textContent=button.dataset.oldText||button.textContent}
    }
  }

  // Capture before teacher-app's legacy popup handlers.
  document.addEventListener('click',event=>{
    const seatingTool=event.target.closest?.('[data-tool="Seating Command"]');
    if(seatingTool){
      event.preventDefault();event.stopImmediatePropagation();
      location.hash='seating-command';
      queueMicrotask(renderSeatingRoute);
      return;
    }
    const seatingNav=event.target.closest?.('[data-native-seating]');
    if(seatingNav){
      event.preventDefault();event.stopImmediatePropagation();
      location.hash='seating-command';
      queueMicrotask(renderSeatingRoute);
      return;
    }
    const back=event.target.closest?.('[data-native-seating-back]');
    if(back){
      event.preventDefault();event.stopImmediatePropagation();
      location.hash='tools';
      return;
    }
    const classButton=event.target.closest?.('[data-arcade-class]');
    if(classButton){
      event.preventDefault();event.stopImmediatePropagation();
      const on=classButton.dataset.arcadeClass==='true';
      setWholeClassAvailability(on,classButton);
    }
  },true);

  function normalize(){
    ensureSeatingNav();
    normalizeTokenAwardSet();
    renderSeatingRoute();
  }
  const observer=new MutationObserver(()=>normalize());
  observer.observe(document.documentElement,{subtree:true,childList:true});
  window.addEventListener('hashchange',()=>queueMicrotask(normalize));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',normalize,{once:true});
  else normalize();
})();
