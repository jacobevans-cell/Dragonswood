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
    <header class="gift-hero"><div class="gift-eyebrow">🐉 Dragonswood classroom celebration</div><h1>${h(event?.title || 'Secret Gift Exchange')}</h1><p>Make your wishlist here. Your teacher chooses the exchange partners, and only you can see whom you draw.</p></header>
    ${notice ? `<p class="gift-status ${noticeError?'error':''}" role="status">${h(notice)}</p>` : ''}`;
}

function eventFacts(event) {
  return `<article class="gift-card"><h2>Exchange details</h2><p><b>Gift budget:</b> ${money(event.budgetCents)} maximum</p><p><b>Wishlist by:</b> ${h(event.wishlistDeadline)}</p><p><b>Gift exchange:</b> ${h(event.giftDate)}</p><p class="gift-muted">Share gifts at school. Do not put an address, phone number, or other contact details in your wishlist.</p></article>`;
}

function studentView(m) {
  const e=m.event;
  if (!e) return `${header(null)}<div class="gift-card gift-empty"><h2>No exchange is open yet</h2><p>Your teacher will post the details here.</p></div>`;
  const canWish=before(e.wishlistClosesAt);
  const revealed=e.status==='drawn' && m.assignment?.drawVersion===e.drawVersion;
  return `${header(e)}<div class="gift-grid">${eventFacts(e)}
    <article class="gift-card"><h2>My wishlist</h2><p class="gift-muted">Write a few ideas within the budget. Your teacher and the student who draws you can see them.</p><label for="gift-wishes">Gift ideas</label><textarea id="gift-wishes" maxlength="600" ${canWish?'':'disabled'} placeholder="Books, art supplies, colors I like…">${h(m.wishlist?.text || '')}</textarea><div class="gift-actions">${canWish?'<button class="gift-button" id="gift-save-wishes">Save wishlist</button>':''}</div></article>
    ${!revealed?`<article class="gift-card"><h2>Partner draw</h2><p class="gift-muted">${e.status==='drawn'?(m.participant?'Your partner is being prepared. Refresh in a moment.':'Your teacher can tell you if you are participating.'): 'Your teacher will choose participants and draw partners. Check back here afterward.'}</p></article>`:''}
    ${revealed?`<article class="gift-card"><h2>Your secret recipient</h2><p class="gift-reveal">🎁 ${h(m.assignment.recipientName)}</p><p>Keep this name private until gift day.</p><h3>Their wishlist</h3><p>${m.recipientWishlist?.text?h(m.recipientWishlist.text).replace(/\n/g,'<br>'):'No wishlist yet. Check back before gift day.'}</p></article>`:''}
    </div>`;
}

function teacherView(m) {
  const e=m.event;
  const editable=!e||e.status==='open';
  const chosen=new Set(m.participants.map(p=>p.id));
  const rows=m.roster.slice().sort((a,b)=>recipientLabel(a).localeCompare(recipientLabel(b))).map(student=>{
    const selected=chosen.has(student.id),assignment=m.assignments.find(a=>a.id===student.id);
    return `<li><span>${h(recipientLabel(student))} ${m.wishlistIds.has(student.id)?'· wishlist saved':''}</span><span>${selected?(e?.status==='drawn'?`→ ${h(assignment?.recipientName||'Pending')}`:'Included'):'—'}</span>${e?.status==='open'?`<button class="gift-button secondary" type="button" data-roster-id="${h(student.id)}">${selected?'Remove':'Include'}</button>`:''}</li>`;
  }).join('')||'<li>No student profiles are available.</li>';
  return `${header(e)}<div class="gift-grid"><article class="gift-card"><h2>${e?'Exchange settings':'Create an exchange'}</h2>
    <label for="gift-title">Title</label><input id="gift-title" maxlength="80" value="${h(e?.title||'Dragonswood Secret Gift Exchange')}" ${editable?'':'disabled'}>
    <label for="gift-budget">Maximum gift budget ($)</label><input id="gift-budget" type="number" min="1" max="100" step="0.01" value="${e?(e.budgetCents/100).toFixed(2):'15.00'}" ${editable?'':'disabled'}>
    <label for="gift-wishlist-deadline">Wishlist deadline</label><input id="gift-wishlist-deadline" type="date" value="${h(e?.wishlistDeadline||'')}" ${editable?'':'disabled'}>
    <label for="gift-date">Gift exchange date</label><input id="gift-date" type="date" value="${h(e?.giftDate||'')}" ${editable?'':'disabled'}>
    <div class="gift-actions">${editable?'<button class="gift-button" id="gift-save-event">Save details</button>':''}${e?.status==='closed'?'<button class="gift-button secondary" id="gift-reopen">Reopen roster</button>':''}</div>
    <p class="gift-muted">Only the teacher sees the roster and complete draw. Settings lock after the draw.</p></article>
    ${e?`<article class="gift-card"><h2>Choose participants · ${m.participants.length}</h2><p class="gift-muted">Include only students who are taking part. Students only write a wishlist.</p><ul class="gift-list">${rows}</ul><div class="gift-actions">${e.status==='open'||e.status==='closed'?'<button class="gift-button" id="gift-draw">Lock roster & draw partners</button>':''}${e.status==='drawn'?'<button class="gift-button danger" id="gift-redraw">Redraw partners</button>':''}</div><p class="gift-muted">${e.status==='drawn'?'Each student gives once and receives once, with no self-draws. A redraw replaces every assignment.':e.status==='closed'?'The roster is locked. Reopen it or complete the draw.':'The draw locks the roster, then gives each student one different partner.'}</p></article>`:''}</div>`;
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
  root.querySelectorAll('[data-roster-id]').forEach(button=>button.addEventListener('click',()=>action(async()=>{
    if(!teacher())throw new Error('Teacher access required.');
    const e=(await getDoc(eventRef)).data();
    if(e?.status!=='open')throw new Error('The roster is locked.');
    const uid=button.dataset.rosterId;
    if(!model.roster.some(student=>student.id===uid))throw new Error('Student profile not found.');
    if(model.participants.some(participant=>participant.id===uid))await deleteDoc(doc(participants,uid));
    else await setDoc(doc(participants,uid),{joined:true,updatedAt:serverTimestamp()});
  },'Participant roster updated.')));
  root.querySelector('#gift-save-wishes')?.addEventListener('click',()=>{
    const value=root.querySelector('#gift-wishes')?.value.trim()||'';
    action(()=>setDoc(doc(wishlists,currentUser.uid),{text:value,updatedAt:serverTimestamp()}),'Your wishlist was saved.');
  });
  root.querySelector('#gift-save-event')?.addEventListener('click',()=>action(async()=>{
    const title=root.querySelector('#gift-title').value.trim();
    const budgetCents=Math.round(Number(root.querySelector('#gift-budget').value)*100);
    const wishlistDeadline=dateOnly(root.querySelector('#gift-wishlist-deadline').value);
    const giftDate=dateOnly(root.querySelector('#gift-date').value);
    if(!title||title.length>80)throw new Error('Enter a title under 80 characters.');
    if(!Number.isInteger(budgetCents)||budgetCents<100||budgetCents>10000)throw new Error('Choose a budget from $1 to $100.');
    if(!wishlistDeadline||!giftDate||wishlistDeadline>giftDate||wishlistDeadline<new Date().toLocaleDateString('sv-SE',{timeZone:'America/Phoenix'}))throw new Error('Choose a future wishlist deadline and gift day, in that order.');
    const latest=await getDoc(eventRef);
    if(latest.exists()&&latest.data().status!=='open')throw new Error('Settings are locked after signups close.');
    await setDoc(eventRef,{title,budgetCents,wishlistDeadline,giftDate,wishlistClosesAt:phoenixEnd(wishlistDeadline),status:'open',drawVersion:0,updatedAt:serverTimestamp()},{merge:true});
  },'Exchange details saved.'));
  root.querySelector('#gift-reopen')?.addEventListener('click',()=>action(()=>updateDoc(eventRef,{status:'open',updatedAt:serverTimestamp()}),'Roster reopened.'));
  root.querySelector('#gift-draw')?.addEventListener('click',()=>action(async()=>{
    if(!confirm('Lock the selected roster and privately draw one partner for each student?'))return false;
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
  if(!['closed','drawn'].includes(e?.status))throw new Error('Lock the roster before drawing.');
  const [p,r,a]=await Promise.all([getDocs(participants),getDocs(collection(db,'students')),getDocs(assignments)]);
  const ids=p.docs.filter(d=>d.data().joined===true).map(d=>d.id).sort();
  if(ids.length<2)throw new Error('Choose at least two students. Reopen the roster to add more.');
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

