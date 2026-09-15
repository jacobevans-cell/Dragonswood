(function(){'use strict';
 const allowed=new Set(['home','morning','math','reading','writing','science','morphology','ccf','adventurer','schedule','teacher']);
 let activeFrame=null;
 function portalUrl(hash){const url=new URL('../',document.baseURI);url.hash=hash;return url.href;}
 function route(hash=location.hash){const value=String(hash).replace(/^#/,'');if(!value||['missions','home'].includes(value))return 'home';if(value==='adventure')return null;if(value==='character')return 'adventurer';if(value==='day')return 'schedule';if(value.startsWith('missions/')&&allowed.has(value.slice(9)))return value.slice(9);if(allowed.has(value))return value;return null;}
 function markup(){const url=new URL('../learning-portal/public/embedded.html',document.baseURI);url.searchParams.set('embedded','1');url.searchParams.set('v','dragon-path-17');url.searchParams.set('video','progress-20260915');url.searchParams.set('auth','single-parent-v2');url.hash=route()||'home';return `<section class="unified-dragon-path"><iframe data-dragon-path-frame src="${url.href}" title="Dragon’s Path — daily lessons and adventurer" style="width:100%;min-height:640px;border:0;display:block" scrolling="no"></iframe></section>`;}
 function mount(){activeFrame=document.querySelector('[data-dragon-path-frame]');if(activeFrame){activeFrame.dataset.parentHash=location.hash||'#missions';activeFrame.addEventListener('load',sync);}}
 function sync(){const frame=document.querySelector('[data-dragon-path-frame]'),next=route();if(!frame||!next)return false;activeFrame=frame;try{if(frame.contentWindow.DWLearningNavigation&&frame.contentWindow.location.hash!=='#'+next)frame.contentWindow.location.hash=next;}catch{}frame.dataset.parentHash=location.hash||'#missions';return true;}
 async function beforeLeave(){const frame=document.querySelector('[data-dragon-path-frame]');if(frame)await frame.contentWindow?.DWLearningNavigation?.beforeLeave?.();}
 window.addEventListener('message',event=>{const frame=document.querySelector('[data-dragon-path-frame]');if(!frame||event.source!==frame.contentWindow||event.origin!==location.origin)return;const data=event.data;if(!data||typeof data!=='object')return;
  if(data.type==='dragonswood-path-view'&&allowed.has(data.route)){if(Number.isFinite(data.height))frame.style.height=Math.min(30000,Math.max(420,data.height+4))+'px';const current=route();if(current&&current!==data.route){const hash=data.route==='home'?'#missions':data.route==='adventurer'?'#character':data.route==='schedule'?'#day':'#missions/'+data.route;history.replaceState(null,'',portalUrl(hash));frame.dataset.parentHash=hash;}}
  if(data.type==='dragonswood-path-scroll')frame.scrollIntoView({block:'start',behavior:'instant'});
  if(data.type==='dragonswood-path-open-school'&&['module/rune-spelling','module/class-reader'].includes(data.route))window.dispatchEvent(new CustomEvent('dragonswood:open-school',{detail:data.route}));
 });
 window.DWDragonPath=Object.freeze({route,markup,mount,sync,beforeLeave});
})();
