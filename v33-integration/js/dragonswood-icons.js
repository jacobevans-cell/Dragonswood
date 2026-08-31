(function(root){
  'use strict';

  if(!root||root.DragonswoodIcons)return;

  const script=document.currentScript;
  if(!script)return;

  const VERSION='2.0.0';
  const assetRoot=new URL(script.dataset.dwIconBase||'../assets/icons/v2/',script.src);
  const registryUrl=new URL(`emoji-registry.json?v=${VERSION}`,assetRoot);
  const skipSelector='script,style,textarea,input,select,option,code,pre,noscript,template,svg,[contenteditable="true"],[data-dw-no-icons],.dw-semantic-icon';
  const colorTokens=Object.freeze({
    ink:'#111427',
    gold:'#f4c95d',
    danger:'#ef5d68',
    cream:'#fff4d6',
    cyan:'#48d8ef',
    brown:'#8a5a3c',
    amber:'#f4a340',
    success:'#49d39b'
  });

  let state=null;
  let observer=null;
  let scheduled=false;
  const pendingRoots=new Set();

  function escapePattern(value){
    return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  }

  function labelFor(entry){
    return String(entry.replacement||'icon').replace(/[-_]+/g,' ').trim();
  }

  function sourceFor(entry){
    const path=String(entry.assetPath||'');
    if(path.startsWith('illustrated/'))return new URL(`web/64/${path.slice('illustrated/'.length)}`,assetRoot).href;
    return new URL(path,assetRoot).href;
  }

  function shouldSkip(node){
    const parent=node&&node.parentElement;
    return !parent||!!parent.closest(skipSelector);
  }

  function stripMapped(value){
    if(!state)return String(value||'');
    state.stripper.lastIndex=0;
    return String(value||'').replace(state.stripper,'');
  }

  function hasAdjacentLabel(node,value){
    if(stripMapped(value).trim())return true;
    const parent=node.parentElement;
    if(!parent)return false;
    if(parent.getAttribute('aria-label')||parent.getAttribute('title'))return true;
    return Array.from(parent.childNodes).some(sibling=>{
      if(sibling===node||sibling.nodeType===Node.COMMENT_NODE)return false;
      return stripMapped(sibling.textContent||'').trim().length>0;
    });
  }

  function makeIcon(doc,symbol,entry,decorative){
    if(entry.action==='css'){
      const swatch=doc.createElement('span');
      swatch.className='dw-semantic-icon dw-semantic-icon--swatch';
      swatch.dataset.dwIcon=entry.replacement;
      swatch.dataset.dwOriginal=symbol;
      swatch.style.setProperty('--dw-icon-color',colorTokens[entry.variant]||colorTokens.cream);
      if(decorative)swatch.setAttribute('aria-hidden','true');
      else{
        swatch.setAttribute('role','img');
        swatch.setAttribute('aria-label',`${entry.variant||'selected'} color`);
      }
      return swatch;
    }

    const image=doc.createElement('img');
    image.className=`dw-semantic-icon${String(entry.assetPath||'').startsWith('illustrated/')?' dw-semantic-icon--illustrated':''}`;
    image.dataset.dwIcon=entry.replacement;
    image.dataset.dwOriginal=symbol;
    image.src=sourceFor(entry);
    image.draggable=false;
    image.decoding='async';
    if(decorative){
      image.alt='';
      image.setAttribute('aria-hidden','true');
    }else image.alt=labelFor(entry);
    image.addEventListener('error',()=>image.replaceWith(doc.createTextNode(symbol)),{once:true});
    return image;
  }

  function decorateText(node){
    if(!state||shouldSkip(node))return;
    const value=node.nodeValue||'';
    state.matcher.lastIndex=0;
    if(!state.matcher.test(value))return;
    state.matcher.lastIndex=0;

    const decorative=hasAdjacentLabel(node,value);
    const fragment=node.ownerDocument.createDocumentFragment();
    let cursor=0;
    let match;
    while((match=state.matcher.exec(value))){
      if(match.index>cursor)fragment.append(node.ownerDocument.createTextNode(value.slice(cursor,match.index)));
      const entry=state.entries.get(match[0]);
      fragment.append(makeIcon(node.ownerDocument,match[0],entry,decorative));
      cursor=match.index+match[0].length;
    }
    if(cursor<value.length)fragment.append(node.ownerDocument.createTextNode(value.slice(cursor)));
    node.replaceWith(fragment);
  }

  function processRoot(rootNode){
    if(!rootNode)return;
    if(rootNode.nodeType===Node.TEXT_NODE){decorateText(rootNode);return;}
    if(rootNode.nodeType!==Node.ELEMENT_NODE&&rootNode.nodeType!==Node.DOCUMENT_FRAGMENT_NODE&&rootNode.nodeType!==Node.DOCUMENT_NODE)return;
    if(rootNode.nodeType===Node.ELEMENT_NODE&&rootNode.closest(skipSelector))return;
    const walker=rootNode.ownerDocument.createTreeWalker(rootNode,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(decorateText);
  }

  function flush(){
    scheduled=false;
    const roots=Array.from(pendingRoots);
    pendingRoots.clear();
    roots.forEach(processRoot);
  }

  function queue(rootNode){
    if(!rootNode)return;
    pendingRoots.add(rootNode);
    if(!scheduled){
      scheduled=true;
      queueMicrotask(flush);
    }
  }

  function installStyle(){
    if(document.querySelector('style[data-dw-icon-style]'))return;
    const style=document.createElement('style');
    style.dataset.dwIconStyle='2';
    style.textContent=`
      .dw-semantic-icon{display:inline-block;width:1.12em;height:1.12em;object-fit:contain;vertical-align:-.18em;margin-inline:.04em;pointer-events:none;user-select:none;flex:0 0 auto}
      .dw-semantic-icon--illustrated{width:1.24em;height:1.24em;vertical-align:-.24em}
      .dw-semantic-icon--swatch{width:.88em;height:.88em;border-radius:50%;background:var(--dw-icon-color);border:1px solid rgba(255,255,255,.46);box-shadow:0 0 0 1px rgba(5,9,27,.5);vertical-align:-.05em}
      .dw-semantic-icon--swatch[data-dw-original="⬛"],.dw-semantic-icon--swatch[data-dw-original="⬜"],.dw-semantic-icon--swatch[data-dw-original="🟫"],.dw-semantic-icon--swatch[data-dw-original="🟥"]{border-radius:.14em}
      @media (prefers-reduced-motion:reduce){.dw-semantic-icon{animation:none!important;transition:none!important}}
    `;
    document.head.append(style);
  }

  function watch(){
    if(observer||!document.documentElement)return;
    observer=new MutationObserver(records=>{
      records.forEach(record=>{
        if(record.type==='characterData')queue(record.target);
        else record.addedNodes.forEach(queue);
      });
    });
    observer.observe(document.documentElement,{childList:true,characterData:true,subtree:true});
  }

  function activate(registry){
    const entries=new Map(Object.entries(registry).filter(([,entry])=>entry&&(['icon','css'].includes(entry.action))));
    const symbols=Array.from(entries.keys()).sort((a,b)=>b.length-a.length);
    if(!symbols.length)return;
    const source=symbols.map(escapePattern).join('|');
    state={entries,matcher:new RegExp(source,'gu'),stripper:new RegExp(source,'gu')};
    installStyle();
    watch();
    queue(document.body||document.documentElement);
    document.dispatchEvent(new CustomEvent('dragonswood:icons-ready',{detail:{version:VERSION,count:entries.size}}));
  }

  const api={
    version:VERSION,
    assetRoot:assetRoot.href,
    refresh(){
      if(state)queue(document.body||document.documentElement);
      return api.ready;
    },
    ready:null
  };
  api.ready=fetch(registryUrl.href,{cache:'force-cache'})
    .then(response=>{
      if(!response.ok)throw new Error(`Icon registry HTTP ${response.status}`);
      return response.json();
    })
    .then(activate)
    .catch(error=>console.warn('Dragonswood icon enhancement skipped; original symbols remain.',error));
  root.DragonswoodIcons=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:window);
