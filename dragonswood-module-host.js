(function(){
  "use strict";

  /* Add future systems here. No feature code is copied into index.html. */
  const modules=[
    {id:"adventurer-hall",title:"Adventurer Hall & Pet Sanctuary",icon:"⚔️",path:"adventurer-hall.html",returnView:"home"},
    {id:"boss-battle",title:"Daily Boss Battle",icon:"👹",path:"boss-battle.html",returnView:"home"},
    {id:"daily-quest",title:"Today's Daily Quest",icon:"📜",path:"daily-quest.html",returnView:"quests"},
    {id:"level-up-challenge",title:"Level-Up Challenge",icon:"⭐",path:"daily-quest.html",query:"levelup=1",returnView:"quests"},
    {id:"curriculum-quest",title:"Curriculum & Recovery Quest",icon:"🐉",path:"curriculum-quest.html",returnView:"quests"},
    {id:"decimal-deception",title:"Decimal Deception",icon:"💎",path:"decimal-deception.html",returnView:"games",dailyGate:true},
    {id:"math-operations",title:"Math Operations Quest",icon:"➗",path:"math-operations-quest.html",returnView:"games",dailyGate:true},
    {id:"fraction-forge",title:"Fraction Forge",icon:"🔥",path:"fraction-forge.html",returnView:"games",dailyGate:true},
    {id:"long-division",title:"Long Division Quest",icon:"➗",path:"long-division-quest.html",returnView:"games",dailyGate:true},
    {id:"long-division-custom",title:"Custom Long Division",icon:"🧮",path:"long-division-custom.html",returnView:"games",dailyGate:true},
    {id:"spelling-practice",title:"Spelling Practice",icon:"📚",path:"spelling-practice.html",returnView:"games",dailyGate:true},
    {id:"witches-test",title:"The Witches Reading Test",icon:"🧙‍♀️",path:"the_witches_pages_1_15_interactive_test.html",returnView:"games",dailyGate:true},
    {id:"elemental-laboratory",title:"Elemental Laboratory",icon:"⚗️",path:"elemental-laboratory.html",returnView:"games",dailyGate:true},
    {id:"cosmic-architect",title:"Cosmic Architect",icon:"🌌",path:"cosmic-architect.html",returnView:"games",dailyGate:true},
    {id:"arcane-forge",title:"Arcane Forge",icon:"🔮",path:"arcane-forge.html",returnView:"games",dailyGate:true},
    {id:"class-reader",title:"The Witches Class Reader",icon:"📖",path:"witches-reader.html",returnView:"quests"}
  ];
  const byId=new Map(modules.map(x=>[x.id,x]));
  const currentPath=()=>location.pathname.replace(/.*\//,"");
  let mountedId="";
  let mountedHref="";
  let fallbackReturnView="home";
  let pendingOverride="";

  function cleanPath(value){
    try{return new URL(value,location.href).pathname.replace(/.*\//,"");}
    catch(e){return "";}
  }
  function matchHref(value){
    let url;
    try{url=new URL(value,location.href);}catch(e){return null;}
    if(url.origin!==location.origin)return null;
    const path=cleanPath(url.href);
    if(path===currentPath()||path==="index.html"||path==="")return null;
    if(path==="daily-quest.html"&&url.searchParams.get("levelup")==="1")return byId.get("level-up-challenge");
    return modules.find(x=>x.path===path)||null;
  }
  function requestedHref(mod,override){
    const url=new URL(override||mod.path,location.href);
    if(mod.query&&!override){
      new URLSearchParams(mod.query).forEach((v,k)=>url.searchParams.set(k,v));
    }
    url.searchParams.set("dwEmbed","1");
    return url.pathname.replace(/^.*\//,"")+url.search+url.hash;
  }
  function activePortalView(){
    const active=document.querySelector('.portal-view.active[data-page]');
    const page=active&&active.dataset.page;
    return page&&page!=="module"?page:fallbackReturnView;
  }
  function routeTo(view){
    if(typeof window.DragonswoodNav==="function")window.DragonswoodNav(view||"home");
    else location.hash=view||"home";
  }
  function gate(mod){
    if(window.DWBlockingPassType){routeTo("home");return false;}
    if(mod.dailyGate&&window.DWDailyAccessUnlocked!==true){
      routeTo("quests");
      window.setTimeout(function(){
        const note=document.getElementById("dailyAccessNotice");
        if(note)note.scrollIntoView({behavior:"smooth",block:"center"});
      },40);
      return false;
    }
    return true;
  }
  function setModuleTab(id){
    const mod=byId.get(id);
    const hasDedicated=!!document.querySelector(`.portal-tab[data-module="${id}"]`);
    document.querySelectorAll(".portal-tab[data-module]").forEach(function(tab){
      const active=tab.dataset.module===id;
      tab.classList.toggle("active",active);
      tab.setAttribute("aria-current",active?"page":"false");
    });
    document.querySelectorAll(".portal-tab[data-view]").forEach(function(tab){
      const active=!hasDedicated&&!!mod&&tab.dataset.view===mod.returnView;
      tab.classList.toggle("active",active);
      tab.setAttribute("aria-current",active?"page":"false");
    });
  }
  function unload(){
    const frame=document.getElementById("dwModuleFrame");
    if(frame){frame.onload=null;frame.onerror=null;frame.src="about:blank";}
    mountedId="";
    mountedHref="";
    document.body.classList.remove("dw-module-open");
    setModuleTab("");
  }
  function prepareChild(frame,mod){
    let doc;
    try{doc=frame.contentDocument;}catch(e){return;}
    if(!doc)return;
    doc.documentElement.classList.add("dw-portal-embedded");
    if(doc.body)doc.body.classList.add("dw-portal-embedded");
    const style=doc.createElement("style");
    style.dataset.dwPortalEmbed="1";
    style.textContent='html.dw-portal-embedded{scrollbar-color:#7051a3 #07091f}html.dw-portal-embedded body{background-attachment:scroll!important}html.dw-portal-embedded a[href^="index.html"],html.dw-portal-embedded a[href^="./index.html"]{display:none!important}';
    doc.head.append(style);
    doc.querySelectorAll("body>header").forEach(function(header){
      if(header.querySelector('a[href^="index.html"],a[href^="./index.html"]')){
        header.hidden=true;
        header.setAttribute("aria-hidden","true");
        header.style.setProperty("display","none","important");
      }
    });
    doc.addEventListener("click",function(event){
      const link=event.target.closest&&event.target.closest("a[href]");
      if(!link)return;
      if(link.target==="_blank")return;
      const url=new URL(link.href,frame.contentWindow.location.href);
      const path=cleanPath(url.href);
      if(path==="index.html"||path===""){
        event.preventDefault();
        close();
        return;
      }
      const next=matchHref(url.href);
      if(next){event.preventDefault();open(next.id,url.href);}
    },true);
    const actual=matchHref(frame.contentWindow.location.href)||mod;
    updateToolbar(actual);
  }
  function updateToolbar(mod){
    const icon=document.getElementById("dwModuleIcon");
    const title=document.getElementById("dwModuleTitle");
    if(icon)icon.textContent=mod.icon;
    if(title)title.textContent=mod.title;
    const frame=document.getElementById("dwModuleFrame");
    if(frame)frame.title=mod.title;
    setModuleTab(mod.id);
  }
  function mount(id,override){
    const mod=byId.get(id);
    if(!mod||!gate(mod)){unload();return false;}
    const frame=document.getElementById("dwModuleFrame");
    const loading=document.getElementById("dwModuleLoading");
    const error=document.getElementById("dwModuleError");
    if(!frame)return false;
    const href=requestedHref(mod,override);
    fallbackReturnView=mod.returnView||fallbackReturnView;
    document.body.classList.add("dw-module-open");
    updateToolbar(mod);
    if(mountedId===id&&mountedHref===href&&frame.getAttribute("src"))return true;
    mountedId=id;mountedHref=href;
    if(loading)loading.hidden=false;
    if(error)error.hidden=true;
    frame.onload=function(){
      if(loading)loading.hidden=true;
      try{prepareChild(frame,mod);}catch(e){console.warn("Module shell preparation skipped",e);}
    };
    frame.onerror=function(){
      if(loading)loading.hidden=true;
      if(error)error.hidden=false;
    };
    frame.src=href;
    return true;
  }
  function open(id,override){
    const mod=byId.get(id);
    if(!mod||!gate(mod))return false;
    const returnView=activePortalView()||mod.returnView||"home";
    fallbackReturnView=returnView;
    pendingOverride=override||"";
    const hash="#module/"+encodeURIComponent(id);
    const alreadyOpen=!!document.querySelector('.portal-view.active[data-page="module"]');
    try{
      if(alreadyOpen&&history.state&&history.state.dwModuleEntry)
        history.replaceState({dwModuleEntry:true,returnView:history.state.returnView||returnView},"",hash);
      else history.pushState({dwModuleEntry:true,returnView:returnView},"",hash);
    }
    catch(e){location.hash=hash.slice(1);return true;}
    if(typeof window.DragonswoodNav==="function")window.DragonswoodNav("module/"+id,false);
    else mount(id,pendingOverride);
    return true;
  }
  function openHref(value){
    const mod=matchHref(value);
    return mod?open(mod.id,value):false;
  }
  function close(){
    const state=history.state||{};
    const returnView=state.returnView||fallbackReturnView||"home";
    unload();
    if(state.dwModuleEntry&&history.length>1)history.back();
    else routeTo(returnView);
  }
  function syncFromRoute(id){
    const mod=byId.get(id);
    if(!mod){routeTo("home");return false;}
    const override=pendingOverride;
    pendingOverride="";
    return mount(id,override);
  }

  document.addEventListener("click",function(event){
    const trigger=event.target.closest&&event.target.closest("[data-module],a[href]");
    if(!trigger)return;
    if(trigger.dataset&&trigger.dataset.module){
      event.preventDefault();
      open(trigger.dataset.module,trigger.dataset.moduleHref||"");
      return;
    }
    if(trigger.tagName==="A"&&matchHref(trigger.href)){
      event.preventDefault();
      openHref(trigger.href);
    }
  },true);
  document.addEventListener("click",function(event){
    if(event.target.closest&&event.target.closest("[data-retry-module]")){event.preventDefault();mount(mountedId,mountedHref);}
  });

  window.DragonswoodModules={modules,open,openHref,close,unload,syncFromRoute,matchHref};
})();
