import {initializeApp, getApps, getApp} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import {getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, setPersistence, browserSessionPersistence} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import {getFirestore, connectFirestoreEmulator, doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, Timestamp} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import {drawRecipients, secureRandomInt, recipientLabel} from './gift-exchange-core.mjs';

const config = {apiKey:'AIzaSyC918WJoGQgxRKsqcz-3bXI7iZWv_1bwYE',authDomain:'dragonswood-9289e.firebaseapp.com',projectId:'dragonswood-9289e',storageBucket:'dragonswood-9289e.firebasestorage.app',messagingSenderId:'1064477064695',appId:'1:1064477064695:web:283e1016ee2303d39042f2'};
const app = getApps().length ? getApp() : initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);
const root = document.querySelector('#exchange-root');
const eventRef = doc(db,'giftExchanges','current');
const participants = collection(eventRef,'participants');
const wishlists = collection(eventRef,'wishlists');
const assignments = collection(eventRef,'assignments');
const teacherEmail = 'jacobicusjax@gmail.com';
const localPreview = ['localhost','127.0.0.1'].includes(location.hostname) && new URLSearchParams(location.search).get('dw-env') === 'emulator';
if (localPreview) {
  try { connectFirestoreEmulator(db,'127.0.0.1',8080); } catch {}
  try { const {connectAuthEmulator} = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js'); connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true}); } catch {}
}
await setPersistence(auth,browserSessionPersistence);

let currentUser = null;
let model = null;
let busy = false;
let notice = '';
let noticeError = false;
const h = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateOnly = value => String(value || '').slice(0,10);
const phoenixEnd = value => Timestamp.fromDate(new Date(`${value}T23:59:59-07:00`));
const before = value => value?.toMillis?.() > Date.now();
const money = cents => `$${(Number(cents || 0)/100).toFixed(2)}`;
const teacher = () => currentUser?.email?.toLowerCase() === teacherEmail;
const backUrl = () => teacher() ? './teacher.html' : './index.html#day';
const status = (message,isError=false) => {notice=message;noticeError=isError;render();};

function header(event) {
  return `<div class="gift-top"><a class="gift-back" href="${backUrl()}">← Back to Dragonswood</a><button class="gift-button secondary" id="gift-refresh" type="button">Refresh</button></div>
    <header class="gift-hero"><div class="gift-eyebrow">🐉 Dragonswood classroom celebration</div><h1>${h(event?.title || 'Secret Gift Exchange')}</h1><p>A private classroom gift draw. Joining is optional. Your teacher controls the budget and dates, and only you can see whom you draw.</p></header>
    ${notice ? `<p class="gift-status ${noticeError?'error':''}" role="status">${h(notice)}</p>` : ''}`;
}

function eventFacts(event) {
  return `<article class="gift-card"><h2>Exchange details</h2><p><b>Gift budget:</b> ${money(event.budgetCents)} maximum</p><p><b>Join by:</b> ${h(event.signupDeadline)}</p><p><b>Wishlist by:</b> ${h(event.wishlistDeadline)}</p><p><b>Gift exchange:</b> ${h(event.giftDate)}</p><p class="gift-muted">Share gifts at school. Do not put an address, phone number, or other contact details in your wishlist.</p></article>`;
}

function studentView(m) {
  const e=m.event;
  if (!e) return `${header(null)}<div class="gift-card gift-empty"><h2>No exchange is open yet</h2><p>Your teacher will post the details here.</p></div>`;
  const canJoin=e.status==='open' && before(e.signupClosesAt);
  const canWish=!!m.participant && (e.status==='open'||e.status==='closed'||e.status==='drawn') && before(e.wishlistClosesAt);
  const revealed=e.status==='drawn' && m.assignment?.drawVersion===e.drawVersion;
  return `${header(e)}<div class="gift-grid">${eventFacts(e)}
    <article class="gift-card"><h2>My place in the exchange</h2><p>${m.participant?'<span class="gift-pill">You’re in</span>':'You have not joined.'}</p>
      <p class="gift-muted">${revealed?'The draw is complete. Keep your recipient a surprise!':e.status==='drawn'?'The draw is being updated. Refresh in a moment.':canJoin?'You can opt in until the join deadline.':'Signups are closed.'}</p>
      <div class="gift-actions">${!m.participant&&canJoin?'<button class="gift-button" id="gift-join">Join exchange</button>':''}${m.participant&&e.status!=='drawn'?'<button class="gift-button secondary" id="gift-leave">Leave exchange</button>':''}</div></article>
    ${m.participant?`<article class="gift-card"><h2>My wishlist</h2><p class="gift-muted">Write a few ideas within the budget. Your teacher and the student who draws you can see them.</p><label for="gift-wishes">Gift ideas</label><textarea id="gift-wishes" maxlength="600" ${canWish?'':'disabled'} placeholder="Books, art supplies, colors I like…">${h(m.wishlist?.text || '')}</textarea><div class="gift-actions">${canWish?'<button class="gift-button" id="gift-save-wishes">Save wishlist</button>':''}</div></article>`:''}
    ${revealed?`<article class="gift-card"><h2>Your secret recipient</h2><p class="gift-reveal">🎁 ${h(m.assignment.recipientName)}</p><p>Keep this name private until gift day.</p><h3>Their wishlist</h3><p>${m.recipientWishlist?.text?h(m.recipientWishlist.text).replace(/\n/g,'<br>'):'No wishlist yet. Check back before gift day.'}</p></article>`:''}
    </div>`;
}

function teacherView(m) {
  const e=m.event;
  const editable=!e||e.status==='open';
  const rows=m.participants.map(p=>{
    const label=recipientLabel(m.roster.find(s=>s.id===p.id));
    const assignment=m.assignments.find(a=>a.id===p.id);
    return `<li><span>${h(label)} ${m.wishlistIds.has(p.id)?'· wishlist saved':''}</span><span>${e?.status==='drawn'?`→ ${h(assignment?.recipientName||'Pending')}`:''}</span></li>`;
  }).join('')||'<li>No students have opted in yet.</li>';
  return `${header(e)}<div class="gift-grid"><article class="gift-card"><h2>${e?'Exchange settings':'Create an exchange'}</h2>
    <label for="gift-title">Title</label><input id="gift-title" maxlength="80" value="${h(e?.title||'Dragonswood Secret Gift Exchange')}" ${editable?'':'disabled'}>
    <label for="gift-budget">Maximum gift budget ($)</label><input id="gift-budget" type="number" min="1" max="100" step="0.01" value="${e?(e.budgetCents/100).toFixed(2):'15.00'}" ${editable?'':'disabled'}>
    <label for="gift-signup">Join deadline</label><input id="gift-signup" type="date" value="${h(e?.signupDeadline||'')}" ${editable?'':'disabled'}>
    <label for="gift-wishlist-deadline">Wishlist deadline</label><input id="gift-wishlist-deadline" type="date" value="${h(e?.wishlistDeadline||'')}" ${editable?'':'disabled'}>
    <label for="gift-date">Gift exchange date</label><input id="gift-date" type="date" value="${h(e?.giftDate||'')}" ${editable?'':'disabled'}>
    <div class="gift-actions">${editable?'<button class="gift-button" id="gift-save-event">Save details</button>':''}${e?.status==='closed'?'<button class="gift-button secondary" id="gift-reopen">Reopen signups</button>':''}</div>
    <p class="gift-muted">Only the teacher sees the roster and complete draw. Settings lock after the draw.</p></article>
    ${e?`<article class="gift-card"><h2>Opt-in roster · ${m.participants.length}</h2><ul class="gift-list">${rows}</ul><div class="gift-actions">${e.status==='open'||e.status==='closed'?'<button class="gift-button" id="gift-draw">Close signups & draw</button>':''}${e.status==='drawn'?'<button class="gift-button danger" id="gift-redraw">Redraw assignments</button>':''}</div><p class="gift-muted">${e.status==='drawn'?'Students can see only their own recipient. A redraw immediately replaces every assignment.':e.status==='closed'?'Signups are closed. Reopen them or complete the draw.':'The draw closes signups first, then assigns every opted-in student.'}</p></article>`:''}</div>`;
}

function render() {
  if (!currentUser) {root.innerHTML=`<div class="gift-card gift-empty"><h1>Secret Gift Exchange</h1><p>Sign in with your Dragonswood account to continue.</p><button class="gift-button" id="gift-signin">Sign in with Google</button></div>`;bind();return;}
  if (!model) {root.innerHTML='<p class="gift-loading">Loading your exchange…</p>';return;}
  root.innerHTML=teacher()?teacherView(model):studentView(model);
  bind();
}

async function load() {
  if (!currentUser) return;
  model=null;render();
  try {
    const snap=await getDoc(eventRef),event=snap.exists()?snap.data():null;
    if (teacher()) {
      const [p,w,a,r]=await Promise.all([getDocs(participants),getDocs(wishlists),getDocs(assignments),getDocs(collection(db,'students'))]);
      model={event,participants:p.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.joined===true),wishlistIds:new Set(w.docs.map(d=>d.id)),assignments:a.docs.map(d=>({id:d.id,...d.data()})),roster:r.docs.map(d=>({id:d.id,...d.data()}))};
    } else {
      const uid=currentUser.uid;
      const [profile,p,w]=await Promise.all([getDoc(doc(db,'students',uid)),getDoc(doc(participants,uid)),getDoc(doc(wishlists,uid))]);
      if (!profile.exists()) throw new Error('Your student profile is not ready. Ask your teacher for help.');
      let assignment=null,recipientWishlist=null;
      if (event?.status==='drawn' && p.exists()) {
        const a=await getDoc(doc(assignments,uid));
        if (a.exists() && a.data().drawVersion===event.drawVersion) {
          assignment=a.data();
          const rw=await getDoc(doc(wishlists,assignment.recipientId));
          recipientWishlist=rw.exists()?rw.data():null;
        }
      }
      model={event,participant:p.exists()?p.data():null,wishlist:w.exists()?w.data():null,assignment,recipientWishlist};
    }
    notice='';render();
  } catch (error) {model={event:null,participants:[],wishlistIds:new Set(),assignments:[],roster:[]};status(error?.message||'Could not load the exchange.',true);}
}

async function action(task,success) {
  if (busy) return;
  busy=true;root.querySelectorAll('button').forEach(b=>b.disabled=true);
  try {if(await task()===false){await load();return;}await load();status(success);} catch(error) {status(error?.message||'The change did not save. Please try again.',true);} finally {busy=false;}
}

function bind() {
  root.querySelector('#gift-signin')?.addEventListener('click',()=>signInWithPopup(auth,new GoogleAuthProvider()).catch(e=>status(e?.message||'Sign-in failed.',true)));
  root.querySelector('#gift-refresh')?.addEventListener('click',load);
  root.querySelector('#gift-join')?.addEventListener('click',()=>action(async()=>{
    const e=(await getDoc(eventRef)).data();
    if(e?.status!=='open'||!before(e.signupClosesAt))throw new Error('Signups have closed.');
    await setDoc(doc(participants,currentUser.uid),{joined:true,updatedAt:serverTimestamp()});
  },'You joined the gift exchange.'));
  root.querySelector('#gift-leave')?.addEventListener('click',()=>action(async()=>{
    if(!confirm('Leave the gift exchange?'))return false;
    await deleteDoc(doc(participants,currentUser.uid));
  },'You left the exchange.'));
  root.querySelector('#gift-save-wishes')?.addEventListener('click',()=>{
    const value=root.querySelector('#gift-wishes')?.value.trim()||'';
    action(()=>setDoc(doc(wishlists,currentUser.uid),{text:value,updatedAt:serverTimestamp()}),'Your wishlist was saved.');
  });
  root.querySelector('#gift-save-event')?.addEventListener('click',()=>action(async()=>{
    const title=root.querySelector('#gift-title').value.trim();
    const budgetCents=Math.round(Number(root.querySelector('#gift-budget').value)*100);
    const signupDeadline=dateOnly(root.querySelector('#gift-signup').value);
    const wishlistDeadline=dateOnly(root.querySelector('#gift-wishlist-deadline').value);
    const giftDate=dateOnly(root.querySelector('#gift-date').value);
    if(!title||title.length>80)throw new Error('Enter a title under 80 characters.');
    if(!Number.isInteger(budgetCents)||budgetCents<100||budgetCents>10000)throw new Error('Choose a budget from $1 to $100.');
    if(!signupDeadline||!wishlistDeadline||!giftDate||signupDeadline>wishlistDeadline||wishlistDeadline>giftDate||signupDeadline<new Date().toLocaleDateString('sv-SE',{timeZone:'America/Phoenix'}))throw new Error('Choose future dates in order: join, wishlist, gift day.');
    const latest=await getDoc(eventRef);
    if(latest.exists()&&latest.data().status!=='open')throw new Error('Settings are locked after signups close.');
    await setDoc(eventRef,{title,budgetCents,signupDeadline,wishlistDeadline,giftDate,signupClosesAt:phoenixEnd(signupDeadline),wishlistClosesAt:phoenixEnd(wishlistDeadline),status:'open',drawVersion:0,updatedAt:serverTimestamp()},{merge:true});
  },'Exchange details saved.'));
  root.querySelector('#gift-reopen')?.addEventListener('click',()=>action(()=>updateDoc(eventRef,{status:'open',updatedAt:serverTimestamp()}),'Signups reopened.'));
  root.querySelector('#gift-draw')?.addEventListener('click',()=>action(async()=>{
    if(!confirm('Close signups and privately draw recipients for every student who opted in?'))return false;
    const e=(await getDoc(eventRef)).data();
    if(!['open','closed'].includes(e?.status))throw new Error('The draw is unavailable.');
    if(e.status==='open')await updateDoc(eventRef,{status:'closed',updatedAt:serverTimestamp()});
    await makeDraw();
  },'The private draw is complete.'));
  root.querySelector('#gift-redraw')?.addEventListener('click',()=>action(async()=>{
    if(!confirm('Redraw every assignment? Students may already have seen their previous recipient.'))return false;
    await makeDraw();
  },'Every assignment was redrawn.'));
}

async function makeDraw() {
  const e=(await getDoc(eventRef)).data();
  if(!['closed','drawn'].includes(e?.status))throw new Error('Close signups before drawing.');
  const [p,r,a]=await Promise.all([getDocs(participants),getDocs(collection(db,'students')),getDocs(assignments)]);
  const ids=p.docs.filter(d=>d.data().joined===true).map(d=>d.id).sort();
  if(ids.length<2)throw new Error('At least two students must opt in. Reopen signups to invite more.');
  if(ids.length>498)throw new Error('This exchange exceeds the safe draw size.');
  const roster=new Map(r.docs.map(d=>[d.id,d.data()]));
  if(ids.some(id=>!roster.has(id)))throw new Error('A participant is missing a student profile. Check the roster.');
  const labels=new Map(ids.map(id=>[id,recipientLabel(roster.get(id))]));
  if(new Set(labels.values()).size!==ids.length)throw new Error('Two participants have the same displayed name. Add a distinguishing last initial to their student profiles before drawing.');
  const previous=Object.fromEntries(a.docs.map(d=>[d.id,d.data().recipientId]));
  const result=drawRecipients(ids,secureRandomInt,previous);
  const version=Number(e.drawVersion||0)+1;
  const batch=writeBatch(db);
  for(const id of ids)batch.set(doc(assignments,id),{recipientId:result[id],recipientName:labels.get(result[id]),drawVersion:version,updatedAt:serverTimestamp()});
  batch.update(eventRef,{status:'drawn',drawVersion:version,updatedAt:serverTimestamp()});
  await batch.commit();
}

onAuthStateChanged(auth,async user=>{
  currentUser=user;
  if(!user){model=null;render();return;}
  const email=String(user.email||'').toLowerCase();
  if(email!==teacherEmail&&!email.endsWith('@explore.academy')){
    model=null;root.innerHTML='<div class="gift-card gift-empty"><h1>Account unavailable</h1><p>Use your Dragonswood school account.</p><a class="gift-back" href="./index.html">Back to portal</a></div>';return;
  }
  await load();
});

