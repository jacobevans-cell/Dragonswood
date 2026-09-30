import {auth,functions,httpsCallable,onAuthStateChanged,connect,escape,localKey} from './cloud-core.js';
const kind=document.body.dataset.factKind,status=document.getElementById('cloud-status'),button=document.getElementById('cloud-connect'),count=document.getElementById('cloud-count'),rows=document.getElementById('cloud-rows'),list=httpsCallable(functions,'listFactFluency'),submit=httpsCallable(functions,'submitFactFluency');let loading=false;
async function uploadLocal(){let local=[];try{local=JSON.parse(localStorage.getItem(localKey(kind))||'[]')}catch{}if(!Array.isArray(local))return;
  for(const x of local){if(!x?.id||!Array.isArray(x.responses)||!((kind==='decimal'||kind==='pemdas')?x.count===20:kind==='fraction'?x.count===12:[36,144].includes(x.count)))continue;
    await submit({id:x.id,student:x.student,grade:x.grade,kind,...(kind==='pemdas'?{mode:x.mode}:{}),count:x.count,totalMs:x.totalMs,responses:x.responses,startedAt:x.startedAt});
  }
}
async function refresh(){if(!auth.currentUser||loading)return;loading=true;status.textContent=`Loading class results for ${auth.currentUser.email}…`;
  try{await uploadLocal();const response=await list({kind}),data=response.data.attempts.sort((a,b)=>String(b.startedAt).localeCompare(String(a.startedAt)));
    status.textContent=`Cloud results · ${auth.currentUser.email}`;count.textContent=`${data.length} uploaded attempt${data.length===1?'':'s'} · ${new Set(data.map(x=>x.studentId)).size} signed-in account${new Set(data.map(x=>x.studentId)).size===1?'':'s'}`;
    rows.innerHTML=data.map(x=>`<tr><td>${escape(new Date(x.startedAt).toLocaleString())}</td><td>${escape(x.studentName)}${kind==='pemdas'?'<br>'+escape(x.mode==='with-exponents'?'With exponents':'No exponents'):''}<br><small>${escape(x.studentEmail)}</small></td><td>${escape(x.grade)}</td><td>${x.questionCount}</td><td>${x.correct}/${x.questionCount}</td><td>${x.accuracy}%</td><td>${(x.totalMs/1000).toFixed(1)}s</td><td>${x.averageCorrectMs==null?'—':(x.averageCorrectMs/1000).toFixed(1)+'s'}</td><td>${x.fastCorrect}/${x.questionCount}</td></tr>`).join('')||'<tr><td colspan="9">No cloud results for this test yet.</td></tr>';
  }catch(error){status.textContent=`Could not sync or load class results: ${error.message}. Check the signed-in teacher account.`}finally{loading=false}}
button.onclick=async()=>{if(auth.currentUser){await refresh();return}try{await connect()}catch(error){status.textContent=`Sign-in did not finish: ${error.message}`}};
onAuthStateChanged(auth,user=>{rows.innerHTML='';count.textContent='';if(!user){status.textContent='Sign in with your teacher Google account to load class results.';return}button.textContent='Refresh class results';refresh()});
