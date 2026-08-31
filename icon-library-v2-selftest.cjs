const fs=require('fs');
const path=require('path');

const root=__dirname;
const assetRoot=path.join(root,'v33-integration','assets','icons','v2');
const registry=JSON.parse(fs.readFileSync(path.join(assetRoot,'emoji-registry.json'),'utf8'));
const summary=JSON.parse(fs.readFileSync(path.join(assetRoot,'library-summary.json'),'utf8'));
const runtime=fs.readFileSync(path.join(root,'v33-integration','js','dragonswood-icons.js'),'utf8');
const portal=fs.readFileSync(path.join(root,'index.html'),'utf8');
const modules=fs.readFileSync(path.join(root,'v33-integration','js','integration','modules.js'),'utf8');

let failures=0;
function check(condition,message){
  if(condition)console.log(`PASS ${message}`);
  else{console.error(`FAIL ${message}`);failures++;}
}

const rows=Object.entries(registry);
const iconRows=rows.filter(([,entry])=>entry.action==='icon');
const cssRows=rows.filter(([,entry])=>entry.action==='css');
const textRows=rows.filter(([,entry])=>entry.action==='text');
check(rows.length===summary.sequences,`registry has all ${summary.sequences} audited sequences`);
check(iconRows.length===summary.sequenceDecisions.icon,`registry has ${summary.sequenceDecisions.icon} icon decisions`);
check(cssRows.length===summary.sequenceDecisions.css,`registry has ${summary.sequenceDecisions.css} CSS swatch decisions`);
check(textRows.length===summary.sequenceDecisions.text,`registry preserves ${summary.sequenceDecisions.text} contextual text decisions`);

const missing=[];
for(const [symbol,entry] of iconRows){
  const relative=entry.assetPath.startsWith('illustrated/')
    ?path.join('web','64',entry.assetPath.slice('illustrated/'.length))
    :entry.assetPath;
  if(!fs.existsSync(path.join(assetRoot,relative)))missing.push(`${symbol} -> ${relative}`);
}
check(missing.length===0,`every mapped icon has a production asset${missing.length?`: ${missing.join(', ')}`:''}`);
check(portal.includes('js/dragonswood-icons.js?v=2.0.0'), 'student portal loads the icon runtime');
check(modules.includes("icons.dataset.dwIconRuntime='2'"), 'same-origin lesson and game frames receive the icon runtime');
check(runtime.includes("script,style,textarea,input,select,option,code,pre"), 'runtime excludes interactive entry and code content');
check(runtime.includes("image.addEventListener('error'"), 'missing images fall back to the original symbol');
check(runtime.includes("['icon','css'].includes(entry.action)"), 'runtime leaves contextual text decisions unchanged for safety');
check(runtime.includes('MutationObserver'), 'dynamically rendered portal content is enhanced');

if(failures){
  console.error(`\n${failures} ICON LIBRARY SELF-TEST(S) FAILED`);
  process.exit(1);
}
console.log('\nALL ICON LIBRARY V2 SELF-TESTS PASSED');
