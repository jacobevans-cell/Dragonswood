/* Deep Time Lab v3 production loader. Public, identity-safe. */
(function(){
'use strict';
const qs=new URLSearchParams(location.search);
function script(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Could not load '+src));document.head.appendChild(s)})}
async function boot(){
  const mount=document.querySelector('#app');
  try{
    let caseId=(qs.get('case')||'').toUpperCase().replace(/^SP-?/,'SP');
    let day=Number(qs.get('day')||0);
    const adapter=window.DRAGONSWOOD_DEEP_TIME_ADAPTER||null;
    if(adapter?.getLaunchContext){const ctx=await adapter.getLaunchContext();caseId=ctx.caseId||caseId;day=Number(ctx.day||day)}
    if(!/^SP\d{3}$/.test(caseId)||!Number.isInteger(day)||day<1)throw new Error('No active Deep Time research assignment was found.');
    await script(`paleo/data/cases/${caseId}/day${day}.js`);
    const config=window.DEEP_TIME_CASE_DAY;if(!config)throw new Error('The assigned research day could not be loaded.');
    const opts={strict:true};
    if(adapter){for(const k of ['objectiveCheck','aiCheck','finalCaseCheck','tileResolver','visualResolver','onEvent'])if(typeof adapter[k]==='function')opts[k]=adapter[k].bind(adapter)}
    new DeepTimeEngine('#app',config,opts).mount();
  }catch(err){mount.innerHTML=`<main style="max-width:760px;margin:60px auto;padding:24px;font-family:system-ui;color:#eef6f2;background:#0b2029;border-radius:18px"><h1>Deep Time Lab</h1><p>${String(err.message||err)}</p><p>Return to Dragonswood and ask your teacher to check your research permit.</p></main>`}
}
window.addEventListener('DOMContentLoaded',boot);
})();
