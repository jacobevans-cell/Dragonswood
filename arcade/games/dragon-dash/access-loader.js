import {getArcadeAccess,remainingMs} from '../../js/access-client.js';
let loaded=false;
function gate(message){let host=document.querySelector('.arcade-access-gate');if(!host){host=document.createElement('section');host.className='arcade-access-gate';document.body.append(host)}host.innerHTML=`<div class="arcade-access-card"><h1>Dragon Dash Locked</h1><p>${message}</p><div class="arcade-access-actions"><a href="../../index.html">Return to Arcade</a></div></div>`;host.hidden=false}
async function check(){try{const access=await getArcadeAccess();if(!access.active||remainingMs(access)<=0)throw new Error('Start a 30-minute session from the Arcade first.');if(!loaded){loaded=true;document.querySelector('.arcade-access-gate')?.remove();const script=document.createElement('script');script.src='game.js';document.body.append(script)}}catch(err){if(loaded)location.replace('../../index.html?arcadeExpired=1');else gate(err?.message||'Arcade authorization failed.')}}
window.addEventListener('offline',()=>location.replace('../../index.html?arcadeOffline=1'));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});setInterval(check,15000);check();
