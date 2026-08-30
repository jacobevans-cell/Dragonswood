(function(){
  'use strict';
  let loader=null;
  const normalize=text=>String(text||'').trim().replace(/\s+/g,' ');
  function loadScript(src){
    return new Promise((resolve,reject)=>{
      const existing=[...document.scripts].find(script=>script.src===new URL(src,location.href).href);
      if(existing){if(existing.dataset.ready==='true')resolve();else{existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true})}return}
      const script=document.createElement('script');script.src=src;script.defer=true;
      script.addEventListener('load',()=>{script.dataset.ready='true';resolve()},{once:true});
      script.addEventListener('error',()=>reject(new Error(`Narration asset failed to load: ${src}`)),{once:true});
      document.head.append(script);
    });
  }
  function ready(){
    if(window.DWNarrator)return Promise.resolve(window.DWNarrator);
    if(!loader)loader=loadScript('../narration-manifest.js').then(()=>loadScript('../dragonswood-narrator.js?v=57.1.10')).then(()=>{
      if(!window.DWNarrator)throw new Error('Dragonswood narrator did not initialize.');
      return window.DWNarrator;
    });
    return loader;
  }
  function readableText(root='#page-content'){
    const source=document.querySelector(root);if(!source)return '';
    const clone=source.cloneNode(true);
    clone.querySelectorAll("script,style,noscript,nav,header,footer,button,input,select,textarea,label,[hidden],[aria-hidden='true'],.answer,.answers,.choices,.choice,.teacher-only").forEach(node=>node.remove());
    return normalize(clone.innerText).slice(0,24000);
  }
  async function readPage(options={}){
    const text=normalize(options.text||readableText(options.root));
    if(!text)throw new Error('No readable page text was found.');
    const narrator=await ready();
    const voiceId=['gb-lewis','us-liam','us-bella','es-alex'].includes(String(options.voiceId||''))?String(options.voiceId):'';
    narrator.play({id:String(options.id||`v33/${location.hash||'page'}`),text,voiceId,contentType:String(options.contentType||'general')});
    return {text,voiceId:voiceId||'automatic'};
  }
  window.DWV33Narration=Object.freeze({version:'cedar-bridge-1',ready,readableText,readPage});
})();
