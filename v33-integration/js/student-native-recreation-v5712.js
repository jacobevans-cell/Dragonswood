(function(){
'use strict';
function embeddedHref(raw){const url=new URL(raw,document.baseURI);url.searchParams.set('dwEmbed','1');return url.href}
function prepareRecreationFrame(frame,kind){
  let doc;try{doc=frame.contentDocument}catch{return}
  if(!doc)return;
  doc.documentElement.classList.add('dw-v33-embedded-recreation');
  const id=`dw-v33-${kind}-embedded-style`;if(doc.getElementById(id))return;
  const style=doc.createElement('style');style.id=id;
  style.textContent=kind==='arcade'?`
    html,body{min-height:100%!important}
    .arcade-header{display:none!important}
    .arcade-access-actions a[href*="index.html"]{display:none!important}
    main{padding-top:0!important}
  `:`
    html,body{min-height:100%!important}
    header.topbar{display:none!important}
    main.shell{width:min(1500px,98%)!important;max-width:none!important;padding-top:10px!important}
  `;
  doc.head?.append(style);
}
function recreationShell(kind,title,subtitle,src){
  return `<section class="v33-module-shell" data-v33-recreation-shell="${kind}"><div class="v33-module-toolbar"><div class="v33-module-heading"><span>${kind==='arcade'?'🕹️':'🏰'}</span><div><small>${escapeHtml(subtitle)}</small><h2>${escapeHtml(title)}</h2></div></div><button class="btn btn-secondary btn-sm" type="button" ${kind==='arcade'?'data-arcade-close':'data-page="adventure"'}>Back</button></div><div class="v33-module-stage"><iframe class="v33-module-frame" data-dw-recreation-frame="${kind}" title="${escapeHtml(title)}" src="${escapeHtml(embeddedHref(src))}"></iframe></div></section>`;
}
arcadePage=function(){
  if(state.arcadeOpen&&state.arcadeAccess?.teacherEnabled){return recreationShell('arcade','Dragonswood Arcade','FREE-TIME ADVENTURE',arcadePortal.href())}
  const a=state.arcadeAccess||{},count=Math.max(0,Math.min(3,Number(a.tokens)||0));
  const ready=a.teacherEnabled===true&&(count===3||a.active===true),loading=state.arcadeStatus==='loading';
  return `${studentTitle('🕹️','Free-time currency','Arcade Time','Earn Ready, Responsible, and Complete Tokens. Three Tokens unlock one teacher-approved 30-minute session.')}<section class="adventure-grid"><article class="panel adventurer-card"><div class="adventurer-info"><span class="rarity-chip">ARCADE TOKEN WALLET</span><h2>${count} / 3 Tokens</h2><p>Your wallet cannot hold more than three.</p><div class="stat-row">${[1,2,3].map(i=>`<div class="stat-box"><strong>${i<=count?'🪙':'○'}</strong><small>${i<=count?'Earned':'Empty'}</small></div>`).join('')}</div><button class="btn btn-secondary w-full" type="button" data-arcade-refresh ${loading?'disabled':''}>${loading?'Checking…':'Refresh access'}</button></div></article><article class="panel next-step"><div class="eyebrow">${a.teacherEnabled?'ARCADE TIME OPEN':'TEACHER LOCK'}</div><div class="next-icon">${a.teacherEnabled?'🕹️':'🔒'}</div><h2>${a.active?'Session in progress':a.teacherEnabled?'Ready when you have 3 Tokens':'Arcade is closed right now'}</h2><p>${a.active?'Your authoritative timer follows you across refreshes, tabs, and devices.':a.teacherEnabled?'Spend all 3 Tokens inside the Arcade to start exactly 30 minutes.':'Arcade opens only when your teacher manually turns it on.'}</p><button class="btn btn-primary w-full" type="button" data-arcade-enter ${ready?'':'disabled'}>${a.active?'Return to Arcade':'Open Arcade Time'}</button><p class="center muted mt-12 text-11">Games record scores only • No Gold, XP, or Tokens from gameplay</p></article></section>`;
};
kingdomPage=function(){return recreationShell('kingdom','Kingdom Wars','TEACHER UNLOCK REQUIRED',kingdomPortal.href())};

const originalBind=bind;
bind=function(){
  originalBind();
  app.querySelectorAll('[data-dw-recreation-frame]').forEach(frame=>{
    const kind=frame.dataset.dwRecreationFrame;
    const prepare=()=>prepareRecreationFrame(frame,kind);
    frame.addEventListener('load',prepare,{once:false});
    if(frame.contentDocument?.readyState==='complete')prepare();
  });
};
})();
