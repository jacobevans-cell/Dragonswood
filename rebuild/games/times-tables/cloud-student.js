import {auth,functions,httpsCallable,onAuthStateChanged,connect,localKey} from './cloud-core.js';
const kind=document.body.dataset.factKind,status=document.getElementById('cloud-status'),button=document.getElementById('cloud-connect');let syncing=false;
const submit=httpsCallable(functions,'submitFactFluency');
function attempts(){try{const rows=JSON.parse(localStorage.getItem(localKey(kind))||'[]');return Array.isArray(rows)?rows:[]}catch{return []}}
async function sync(){if(syncing||!auth.currentUser)return;syncing=true;button.disabled=true;const user=auth.currentUser,rows=attempts();let saved=0;
  status.textContent=`Signed in as ${user.email}. Checking ${rows.length} attempt${rows.length===1?'':'s'}…`;
  try{for(const x of rows){if(!x?.id||!Array.isArray(x.responses)||!(kind==='decimal'?x.count===20:kind==='fraction'?x.count===12:[36,144].includes(x.count)))continue;
      await submit({id:x.id,student:x.student,grade:x.grade,kind,count:x.count,totalMs:x.totalMs,responses:x.responses,startedAt:x.startedAt});saved++;
    }status.textContent=rows.length?`Saved to the teacher dashboard. ${saved} attempt${saved===1?'':'s'} confirmed; ${rows.length} on this device.`:`Connected as ${user.email}. Finish a test to save its result to the teacher dashboard.`;
  }catch(error){status.textContent=`Cloud save failed: ${error.message}. Attempts remain on this device. Download the CSV as a backup.`}
  finally{syncing=false;button.disabled=false}}
button.onclick=async()=>{if(auth.currentUser){await sync();return}try{await connect()}catch(error){status.textContent=`Sign-in did not finish: ${error.message}`}};
onAuthStateChanged(auth,user=>{button.textContent=user?'Sync saved attempts':'Sign in to save to teacher';status.textContent=user?`Connected as ${user.email}. Saving attempts…`:'Not connected to the teacher dashboard. Attempts stay on this device.';if(user)sync()});
window.addEventListener('dw-fact-finished',sync);
