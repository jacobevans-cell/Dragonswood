(function(root){
  'use strict';
  function install(frame){
    let doc;try{doc=frame?.contentDocument}catch{return false}
    if(!doc?.body||doc.querySelector('[data-dw-morning-math-coach]'))return false;
    const style=doc.createElement('style');
    style.dataset.dwMorningMathCoach='1';
    style.textContent='.dw-morning-coach-launch{position:fixed;right:18px;bottom:18px;z-index:10020;display:none;padding:11px 15px;border:2px solid #ffe071;border-radius:999px;background:linear-gradient(135deg,#612aa8,#087c9e);color:#fff;font:900 15px Arial,sans-serif;box-shadow:0 8px 28px #0009;cursor:pointer}body[data-dw-morning-active="1"] .dw-morning-coach-launch{display:block}.dw-morning-coach-backdrop{position:fixed;inset:0;z-index:10030;display:none;grid-template-rows:auto 1fr;padding:10px;background:#020516ed}.dw-morning-coach-backdrop.show{display:grid}.dw-morning-coach-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;color:#fff;font:900 14px Arial,sans-serif}.dw-morning-coach-head span{color:#ffe58a}.dw-morning-coach-close{padding:8px 12px;border:1px solid #8ce9ff;border-radius:9px;background:#17204b;color:#fff;font-weight:900}.dw-morning-coach-frame{width:100%;height:100%;border:1px solid #6edfff;border-radius:13px;background:#07102c}@media(max-width:520px){.dw-morning-coach-launch{right:10px;bottom:10px}.dw-morning-coach-backdrop{padding:4px}}';
    doc.head.append(style);
    const launch=doc.createElement('button');launch.type='button';launch.className='dw-morning-coach-launch';launch.dataset.dwMorningMathCoach='1';launch.textContent='🧮 Math Coach';
    const backdrop=doc.createElement('div');backdrop.className='dw-morning-coach-backdrop';backdrop.innerHTML='<div class="dw-morning-coach-head"><span>Choose an operation • enter your problem • solve one coached step at a time</span><button class="dw-morning-coach-close" type="button">Close</button></div><iframe class="dw-morning-coach-frame" title="Math Operations Coach"></iframe>';
    doc.body.append(launch,backdrop);
    const coachFrame=backdrop.querySelector('iframe'),closeButton=backdrop.querySelector('button');
    const close=()=>{backdrop.classList.remove('show');launch.focus()};
    launch.addEventListener('click',()=>{backdrop.classList.add('show');if(!coachFrame.src)coachFrame.src=new URL('math-operations-quest.html?dw-morning-coach=1',doc.baseURI).href});
    closeButton.addEventListener('click',close);
    coachFrame.addEventListener('load',()=>{let child;try{child=coachFrame.contentDocument}catch{return}if(!child)return;child.getElementById('customModeBtn')?.click();child.querySelector('[data-difficulty="normal"]')?.click();const compact=child.createElement('style');compact.dataset.dwMorningCoachCompact='1';compact.textContent='.dw-account,.dw-status,.round-banner,.game-hero,.difficulty-row,.difficulty-note,.top,.mission-dashboard,.mission-complete,.mode-row:first-child{display:none!important}.mode-shell{margin-top:8px!important}.mode-row-spaced{margin-top:0!important}.layout{margin-top:10px!important}main{padding-top:4px!important}.op-btn[data-operation="mixed"]{display:none!important}';child.head?.append(compact)});
    doc.getElementById('morningBtn')?.addEventListener('click',()=>{doc.body.dataset.dwMorningActive='1'});
    doc.getElementById('exitBtn')?.addEventListener('click',()=>{delete doc.body.dataset.dwMorningActive;close()});
    doc.getElementById('closePlay')?.addEventListener('click',()=>{delete doc.body.dataset.dwMorningActive;close()});
    return true;
  }
  root.DWMorningMathCoach=Object.freeze({install});
})(globalThis);
