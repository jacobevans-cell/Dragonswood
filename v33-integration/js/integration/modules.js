(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.DWV33Modules=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const MODULES=Object.freeze([
    {id:'adventurer-hall',title:'Adventurer Hall & Pet Sanctuary',icon:'⚔️',path:'adventurer-hall.html',returnPage:'hall',morningGate:true},
    {id:'boss-battle',title:'Daily Boss Battle',icon:'👹',path:'boss-battle.html',returnPage:'boss',morningGate:true},
    {id:'daily-quest',title:"Today's Daily Quest",icon:'📜',path:'daily-quest.html',returnPage:'missions'},
    {id:'level-up-challenge',title:'Level-Up Challenge',icon:'⭐',path:'daily-quest.html',query:'levelup=1',returnPage:'missions'},
    {id:'rune-spelling',title:'Rune Spelling',icon:'🔤',path:'rune-spelling.html',returnPage:'missions'},
    {id:'curriculum-quest',title:'Curriculum & Recovery Quest',icon:'🐉',path:'curriculum-quest.html',returnPage:'missions'},
    {id:'dragon-tongues',title:'Dragon Tongues',icon:'🗣️',path:'dragon-tongues/index.html',returnPage:'missions'},
    {id:'decimal-deception',title:'Decimal Deception',icon:'💎',path:'decimal-deception.html',returnPage:'games',morningGate:true},
    {id:'math-operations',title:'Math Operations Quest',icon:'➗',path:'math-operations-quest.html',returnPage:'games',morningGate:true},
    {id:'fraction-forge',title:'Fraction Forge',icon:'🔥',path:'fraction-forge.html',returnPage:'games',morningGate:true},
    {id:'long-division',title:'Long Division Quest',icon:'➗',path:'long-division-quest.html',returnPage:'games',morningGate:true},
    {id:'long-division-custom',title:'Custom Long Division',icon:'🧮',path:'long-division-custom.html',returnPage:'games',morningGate:true},
    {id:'witches-test',title:'The Witches Reading Test',icon:'🧙‍♀️',path:'the_witches_pages_1_15_interactive_test.html',returnPage:'games',morningGate:true},
    {id:'elemental-laboratory',title:'Elemental Laboratory',icon:'⚗️',path:'elemental-laboratory.html',returnPage:'games',morningGate:true},
    {id:'cosmic-architect',title:'Cosmic Architect',icon:'🌌',path:'cosmic-architect.html',returnPage:'games',morningGate:true},
    {id:'arcane-forge',title:'Arcane Forge',icon:'🔮',path:'arcane-forge.html',returnPage:'games',morningGate:true},
    {id:'deep-time-lab',title:'Deep Time Lab',icon:'🦴',path:'deep-time-lab.html',returnPage:'games',morningGate:true},
    {id:'class-reader',title:'The Witches Class Reader',icon:'📖',path:'witches-reader.html',returnPage:'missions'}
  ].map(Object.freeze));
  const byId=new Map(MODULES.map(mod=>[mod.id,mod]));

  function definition(id){return byId.get(String(id||''))||null}
  function routeId(hash){
    const match=String(hash||'').replace(/^#/,'').match(/^module\/([^/?#]+)/);
    if(!match)return '';
    const id=decodeURIComponent(match[1]);
    return definition(id)?id:'';
  }
  function allowed(id,student={}){
    const mod=definition(id);
    if(!mod)return {ok:false,reason:'unknown'};
    if(mod.morningGate&&student.dailyAccessUnlocked!==true)return {ok:false,reason:'morning-work'};
    return {ok:true,reason:''};
  }
  function href(id,baseHref,requestedEnvironment){
    const mod=definition(id);if(!mod)return '';
    const url=new URL(`../${mod.path}`,baseHref||globalThis.document?.baseURI||globalThis.location?.href);
    if(mod.query)new URLSearchParams(mod.query).forEach((value,key)=>url.searchParams.set(key,value));
    if(mod.id==='daily-quest'||mod.id==='curriculum-quest')url.searchParams.set('v','58.0.6');
    if(mod.id==='rune-spelling'||mod.id==='dragon-tongues'||mod.id==='deep-time-lab')url.searchParams.set('v','58.0.0');
    if(mod.id==='class-reader')url.searchParams.set('v','57.1.5');
    const pageUrl=new URL(globalThis.location?.href||baseHref||url.href),previewDate=pageUrl.searchParams.get('previewDate'),testerDate=globalThis.DWV33TesterDateContext?.();
    if(mod.path==='daily-quest.html'&&['localhost','127.0.0.1'].includes(pageUrl.hostname)&&/^\d{4}-\d{2}-\d{2}$/.test(String(previewDate||'')))url.searchParams.set('date',previewDate);
    if(testerDate?.simulated===true&&/^\d{4}-\d{2}-\d{2}$/.test(String(testerDate.dateKey||''))){url.searchParams.set('date',testerDate.dateKey);url.searchParams.set('dw-safe-preview','1')}
    if(mod.id==='boss-battle'&&testerDate?.isTester===true&&testerDate?.testerUnlocks?.unlockBoss===true&&['localhost','127.0.0.1'].includes(pageUrl.hostname))url.searchParams.set('dw-local-boss-preview','1');
    url.searchParams.set('dwEmbed','1');
    const environment=requestedEnvironment||globalThis.DWV33Integration?.environment||'';
    if(environment==='emulator'||environment==='production-readonly'||environment==='production')url.searchParams.set('dw-env',environment);
    return url.href;
  }
  function markup(id){
    const mod=definition(id);if(!mod)return '';
    return `<section class="v33-module-shell" data-v33-module-shell="${mod.id}"><div class="v33-module-toolbar"><div class="v33-module-heading"><span>${mod.icon}</span><div><small>DRAGONSWOOD ADVENTURE</small><h2>${mod.title}</h2></div></div><button class="btn btn-secondary btn-sm" type="button" data-close-module>Back</button></div><div class="v33-module-stage"><div class="v33-module-loading" data-module-loading><span>✦</span><b>Opening ${mod.title}…</b></div><div class="v33-module-error" data-module-error hidden><b>This adventure could not load.</b><button class="btn btn-secondary btn-sm" type="button" data-retry-module>Try again</button></div><iframe class="v33-module-frame" data-module-frame title="${mod.title}"></iframe></div></section>`;
  }
  function prepareChild(frame){
    let doc;try{doc=frame.contentDocument}catch{return}
    if(!doc)return;
    doc.documentElement.classList.add('dw-v33-embedded');
    doc.body?.classList.add('dw-v33-embedded');
    if(!doc.querySelector('link[data-dw-v11-visual]')){
      const link=doc.createElement('link');
      link.rel='stylesheet';
      link.href=new URL('css/module-visual-v11.css',document.baseURI).href;
      link.dataset.dwV11Visual='1';
      doc.head?.append(link);
    }
    const style=doc.createElement('style');
    style.dataset.dwV33Embed='1';
    style.textContent='html.dw-v33-embedded{scrollbar-color:#7051a3 #07091f}html.dw-v33-embedded body{background-attachment:scroll!important}html.dw-v33-embedded a[href^="index.html"],html.dw-v33-embedded a[href^="./index.html"]{display:none!important}';
    doc.head?.append(style);
    doc.querySelectorAll('body>header').forEach(header=>{
      if(header.querySelector('a[href^="index.html"],a[href^="./index.html"]')){
        header.hidden=true;header.setAttribute('aria-hidden','true');header.style.setProperty('display','none','important');
      }
    });
  }
  function mount(root,id,baseHref){
    const frame=root?.querySelector?.('[data-module-frame]');
    const loading=root?.querySelector?.('[data-module-loading]');
    const error=root?.querySelector?.('[data-module-error]');
    if(!frame)return false;
    const environment=globalThis.DWV33Integration?.environment;
    if(environment==='manual-preview'||environment==='production-readonly'){
      // The manual acceptance build may display current production module markup,
      // and production-readonly may inspect markup, but neither may execute a
      // production module script or submit a form.
      frame.setAttribute('sandbox','allow-same-origin');
      frame.setAttribute('data-v33-read-only','true');
      if(environment==='manual-preview')frame.setAttribute('data-manual-preview-read-only','true');
    }
    frame.onload=()=>{if(loading)loading.hidden=true;if(error)error.hidden=true;prepareChild(frame)};
    frame.onerror=()=>{if(loading)loading.hidden=true;if(error)error.hidden=false};
    frame.src=href(id,baseHref);
    return true;
  }

  return Object.freeze({modules:MODULES,definition,routeId,allowed,href,markup,mount});
});
