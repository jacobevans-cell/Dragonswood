(function(root){
  'use strict';

  if(!root||root.DWImmersiveUI)return;

  const script=document.currentScript;
  const VERSION='1.0.0';
  const assetBase=script
    ? new URL('v33-integration/assets/icons/v2/web/64/',script.src)
    : new URL('v33-integration/assets/icons/v2/web/64/',location.href);
  const iconNames=Object.freeze({
    portal:'castle-gate.png',
    archive:'enchanted-spellbook.png',
    waiting:'compass.png',
    warning:'ornate-shield.png',
    error:'storm.png',
    success:'victory-trophy.png',
    confirm:'message-scroll.png',
    quest:'quest-map.png',
    reward:'crown.png'
  });
  let active=null;

  function escapeHtml(value){
    return String(value??'').replace(/[&<>'"]/g,char=>({
      '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
    })[char]);
  }

  function iconUrl(name){
    const file=iconNames[name]||iconNames.portal;
    return new URL(file,assetBase).href;
  }

  function installStyle(){
    if(document.querySelector('style[data-dw-immersive-ui]'))return;
    const style=document.createElement('style');
    style.dataset.dwImmersiveUi=VERSION;
    style.textContent=`
      :root{--dw-ui-ink:#080b1d;--dw-ui-panel:#11152f;--dw-ui-panel-2:#19183b;--dw-ui-gold:#f4cf6a;--dw-ui-cream:#fff5da;--dw-ui-muted:#c8c1d8;--dw-ui-violet:#8f79d8;--dw-ui-danger:#ee6d79;--dw-ui-success:#57d9a0}
      .dw-ui-backdrop{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:18px;background:rgba(2,4,15,.82);backdrop-filter:blur(8px);animation:dwUiFade .16s ease-out}
      .dw-ui-dialog{position:relative;width:min(510px,100%);max-height:min(720px,calc(100dvh - 36px));overflow:auto;border:1px solid rgba(244,207,106,.58);border-radius:22px;padding:26px;background:radial-gradient(circle at 50% 0,rgba(113,74,171,.24),transparent 44%),linear-gradient(160deg,var(--dw-ui-panel-2),var(--dw-ui-panel));color:var(--dw-ui-cream);box-shadow:0 30px 90px rgba(0,0,0,.62),inset 0 1px rgba(255,255,255,.08);text-align:center;animation:dwUiRise .2s ease-out}
      .dw-ui-dialog::before{content:'';position:absolute;inset:7px;border:1px solid rgba(244,207,106,.16);border-radius:16px;pointer-events:none}
      .dw-ui-icon{display:block;width:72px;height:72px;margin:0 auto 12px;object-fit:contain;filter:drop-shadow(0 8px 14px rgba(0,0,0,.38))}
      .dw-ui-eyebrow{margin:0 0 6px;color:var(--dw-ui-gold);font:800 11px/1.2 system-ui,sans-serif;letter-spacing:1.7px;text-transform:uppercase}
      .dw-ui-title{margin:0;color:var(--dw-ui-cream);font:800 clamp(24px,5vw,34px)/1.08 Georgia,serif;text-wrap:balance}
      .dw-ui-message{margin:14px auto 0;max-width:43ch;color:var(--dw-ui-muted);font:600 15px/1.58 system-ui,sans-serif;white-space:pre-line}
      .dw-ui-field{width:100%;margin-top:18px;border:1px solid rgba(244,207,106,.42);border-radius:11px;padding:12px 13px;background:#090c21;color:#fff;font:600 16px system-ui,sans-serif;outline:none}
      .dw-ui-field:focus{border-color:var(--dw-ui-gold);box-shadow:0 0 0 3px rgba(244,207,106,.16)}
      .dw-ui-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:22px}
      .dw-ui-button{min-width:132px;border:1px solid rgba(244,207,106,.58);border-radius:11px;padding:11px 16px;background:linear-gradient(#6c4bac,#493279);color:#fff;font:800 14px/1.2 system-ui,sans-serif;cursor:pointer;box-shadow:0 7px 18px rgba(0,0,0,.24)}
      .dw-ui-button:hover{transform:translateY(-1px);filter:brightness(1.08)}
      .dw-ui-button:focus-visible{outline:3px solid var(--dw-ui-gold);outline-offset:3px}
      .dw-ui-button--secondary{border-color:rgba(255,255,255,.2);background:#242644;color:var(--dw-ui-cream)}
      .dw-ui-button--danger{border-color:#ff9ca5;background:linear-gradient(#a83d4b,#772c3b)}
      .dw-ui-details{margin:18px 0 0;text-align:left;color:#aaa3bd;font:500 12px/1.45 ui-monospace,Consolas,monospace}
      .dw-ui-details summary{cursor:pointer;color:#c8c1d8;font-family:system-ui,sans-serif;font-weight:700}
      .dw-ui-details code{display:block;margin-top:8px;padding:9px;border-radius:8px;background:#080a18;overflow-wrap:anywhere}
      .dw-state-card{position:relative;overflow:hidden;border:1px solid rgba(244,207,106,.3);border-radius:18px;padding:20px;background:linear-gradient(145deg,rgba(31,27,66,.96),rgba(10,13,34,.96));color:var(--dw-ui-cream);box-shadow:0 16px 42px rgba(0,0,0,.28)}
      .dw-state-card__head{display:flex;align-items:center;gap:14px}.dw-state-card__icon{width:52px;height:52px;object-fit:contain;flex:0 0 auto}.dw-state-card h2,.dw-state-card h3{margin:0;font-family:Georgia,serif;color:var(--dw-ui-gold)}.dw-state-card p{margin:7px 0 0;color:var(--dw-ui-muted);line-height:1.5}
      .dw-skeleton{display:grid;gap:12px;margin-top:18px}.dw-skeleton__line,.dw-skeleton__block,.dw-skeleton__avatar{position:relative;overflow:hidden;background:#302e52;border:1px solid rgba(255,255,255,.04)}
      .dw-skeleton__line::after,.dw-skeleton__block::after,.dw-skeleton__avatar::after{content:'';position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,240,190,.12),transparent);animation:dwUiShimmer 1.35s infinite}
      .dw-skeleton__line{height:13px;border-radius:999px}.dw-skeleton__line--short{width:46%}.dw-skeleton__line--mid{width:72%}.dw-skeleton__block{height:82px;border-radius:12px}.dw-skeleton__avatar{width:58px;height:58px;border-radius:50%}.dw-skeleton__row{display:grid;grid-template-columns:58px 1fr;gap:12px;align-items:center}.dw-skeleton__cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.dw-skeleton__answers{display:grid;gap:8px}.dw-skeleton__answers .dw-skeleton__block{height:48px}
      .dw-ui-visually-hidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
      @keyframes dwUiFade{from{opacity:0}}@keyframes dwUiRise{from{opacity:0;transform:translateY(10px) scale(.985)}}@keyframes dwUiShimmer{to{transform:translateX(100%)}}
      @media(max-width:560px){.dw-ui-dialog{padding:22px 16px}.dw-ui-button{width:100%}.dw-skeleton__cards{grid-template-columns:1fr}}
      @media(prefers-reduced-motion:reduce){.dw-ui-backdrop,.dw-ui-dialog,.dw-skeleton__line::after,.dw-skeleton__block::after,.dw-skeleton__avatar::after{animation:none}.dw-ui-button:hover{transform:none}}
    `;
    document.head.append(style);
  }

  function skeletonMarkup(shape='cards'){
    const line='<span class="dw-skeleton__line"></span>';
    if(shape==='portal')return `<div class="dw-skeleton" aria-hidden="true"><div class="dw-skeleton__row"><span class="dw-skeleton__avatar"></span><span>${line}<span class="dw-skeleton__line dw-skeleton__line--mid" style="margin-top:10px"></span></span></div><div class="dw-skeleton__cards"><span class="dw-skeleton__block"></span><span class="dw-skeleton__block"></span><span class="dw-skeleton__block"></span></div></div>`;
    if(shape==='quest')return `<div class="dw-skeleton" aria-hidden="true"><span class="dw-skeleton__line dw-skeleton__line--short"></span>${line}<span class="dw-skeleton__line dw-skeleton__line--mid"></span><div class="dw-skeleton__answers"><span class="dw-skeleton__block"></span><span class="dw-skeleton__block"></span><span class="dw-skeleton__block"></span><span class="dw-skeleton__block"></span></div></div>`;
    if(shape==='leaderboard')return `<div class="dw-skeleton" aria-hidden="true"><span class="dw-skeleton__line dw-skeleton__line--short"></span><span class="dw-skeleton__block" style="height:42px"></span><span class="dw-skeleton__block" style="height:42px"></span><span class="dw-skeleton__block" style="height:42px"></span></div>`;
    return `<div class="dw-skeleton dw-skeleton__cards" aria-hidden="true"><span class="dw-skeleton__block"></span><span class="dw-skeleton__block"></span><span class="dw-skeleton__block"></span></div>`;
  }

  function stateMarkup(options={}){
    const icon=escapeHtml(options.icon||'portal');
    const title=escapeHtml(options.title||'Opening the portal…');
    const message=escapeHtml(options.message||'Preparing your Dragonswood page.');
    const skeleton=options.skeleton?skeletonMarkup(options.skeleton):'';
    return `<section class="dw-state-card" role="status" aria-live="polite"><div class="dw-state-card__head"><img class="dw-state-card__icon" src="${iconUrl(icon)}" alt=""><div><h2>${title}</h2><p>${message}</p></div></div>${skeleton}<span class="dw-ui-visually-hidden">${title} ${message}</span></section>`;
  }

  function renderState(host,options={}){
    installStyle();
    const target=typeof host==='string'?document.querySelector(host):host;
    if(!target)return null;
    target.innerHTML=stateMarkup(options);
    return target.firstElementChild;
  }

  function closeActive(value){
    if(!active)return;
    const current=active;
    active=null;
    current.backdrop.remove();
    document.removeEventListener('keydown',current.onKeydown,true);
    if(current.previousFocus?.isConnected)current.previousFocus.focus();
    current.resolve(value);
  }

  function open(options={}){
    installStyle();
    if(active)closeActive(active.cancelValue);
    const kind=options.kind||'alert';
    const cancelValue=kind==='confirm'?false:kind==='prompt'?null:undefined;
    const title=options.title||({confirm:'Confirm your choice',prompt:'Enter a response'}[kind]||'A message from Dragonswood');
    const message=options.message||'';
    const confirmLabel=options.confirmLabel||({confirm:'Continue',prompt:'Continue'}[kind]||'Close');
    const cancelLabel=options.cancelLabel||'Cancel';
    const icon=options.icon||(options.danger?'warning':kind==='alert'?'portal':'confirm');
    const details=options.details?`<details class="dw-ui-details"><summary>Details for a teacher</summary><code>${escapeHtml(options.details)}</code></details>`:'';
    const field=kind==='prompt'?`<label class="dw-ui-visually-hidden" for="dw-ui-prompt">${escapeHtml(options.fieldLabel||title)}</label><input class="dw-ui-field" id="dw-ui-prompt" value="${escapeHtml(options.defaultValue||'')}" autocomplete="off">`:'';
    const cancel=kind==='alert'?'':`<button class="dw-ui-button dw-ui-button--secondary" type="button" data-dw-ui-cancel>${escapeHtml(cancelLabel)}</button>`;
    const danger=options.danger?' dw-ui-button--danger':'';
    const backdrop=document.createElement('div');
    backdrop.className='dw-ui-backdrop';
    backdrop.innerHTML=`<section class="dw-ui-dialog" role="${options.danger?'alertdialog':'dialog'}" aria-modal="true" aria-labelledby="dw-ui-title" aria-describedby="dw-ui-message"><img class="dw-ui-icon" src="${iconUrl(icon)}" alt=""><p class="dw-ui-eyebrow">${escapeHtml(options.eyebrow||'Dragonswood')}</p><h2 class="dw-ui-title" id="dw-ui-title">${escapeHtml(title)}</h2><p class="dw-ui-message" id="dw-ui-message">${escapeHtml(message)}</p>${field}${details}<div class="dw-ui-actions">${cancel}<button class="dw-ui-button${danger}" type="button" data-dw-ui-confirm>${escapeHtml(confirmLabel)}</button></div></section>`;
    document.body.append(backdrop);
    const previousFocus=document.activeElement;
    return new Promise(resolve=>{
      const finish=confirmed=>{
        if(kind==='prompt'&&confirmed)closeActive(backdrop.querySelector('#dw-ui-prompt')?.value??'');
        else closeActive(kind==='alert'?undefined:confirmed);
      };
      const onKeydown=event=>{
        if(event.key==='Escape'&&kind!=='alert'){event.preventDefault();finish(cancelValue);return}
        if(event.key!=='Tab')return;
        const focusable=[...backdrop.querySelectorAll('button:not([disabled]),input:not([disabled])')];
        if(!focusable.length)return;
        const first=focusable[0],last=focusable[focusable.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
      };
      active={backdrop,resolve,onKeydown,previousFocus,cancelValue};
      document.addEventListener('keydown',onKeydown,true);
      backdrop.querySelector('[data-dw-ui-confirm]').addEventListener('click',()=>finish(true));
      backdrop.querySelector('[data-dw-ui-cancel]')?.addEventListener('click',()=>finish(cancelValue));
      backdrop.addEventListener('click',event=>{if(event.target===backdrop&&kind!=='alert')finish(cancelValue)});
      queueMicrotask(()=>backdrop.querySelector(kind==='prompt'?'#dw-ui-prompt':'[data-dw-ui-confirm]')?.focus());
    });
  }

  function alert(options){return open(typeof options==='string'?{kind:'alert',message:options}:{...options,kind:'alert'})}
  function confirm(options){return open(typeof options==='string'?{kind:'confirm',message:options}:{...options,kind:'confirm'})}
  function prompt(options,defaultValue=''){return open(typeof options==='string'?{kind:'prompt',message:options,defaultValue}:{...options,kind:'prompt'})}

  installStyle();
  root.DWImmersiveUI=Object.freeze({version:VERSION,alert,confirm,prompt,renderState,stateMarkup,skeletonMarkup,iconUrl});
  if(/\/daily-quest\.html$/.test(location.pathname)&&!root.DWMorningMathCoach?.install){
    const coach=document.createElement('script');
    coach.src=new URL('v33-integration/js/integration/morning-math-coach.js?v=1.0.1',script?.src||location.href).href;
    coach.dataset.dwMorningMathCoachDirect='1';
    coach.onload=()=>root.DWMorningMathCoach?.install({contentDocument:document});
    document.head.append(coach);
  }else if(/\/daily-quest\.html$/.test(location.pathname))root.DWMorningMathCoach.install({contentDocument:document});
  document.dispatchEvent(new CustomEvent('dragonswood:immersive-ui-ready',{detail:{version:VERSION}}));
})(window);
