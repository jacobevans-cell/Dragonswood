/* Dragonswood teacher request workflow and permanent request history. */
import {getApps} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {getFirestore,collection,onSnapshot,doc,setDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const app=getApps().find(a=>a.options?.projectId==="dragonswood-9289e")||getApps()[0];
if(!app)throw new Error("Teacher request center requires Dragonswood Firebase first.");
const auth=getAuth(app),db=getFirestore(app),TEACHER="jacobicusjax@gmail.com";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const statuses=["new","planned","completed","declined"];
const labels={new:"New",planned:"Planned",completed:"Completed",declined:"Declined"};
const responses={new:"Your request is waiting for teacher review.",planned:"Your idea is being considered.",completed:"This update has been completed.",declined:"This request will not be added right now."};
let requests=[],notes={},filter="new",search="",suggestionUnsub=null,noteUnsub=null,enhanceQueued=false;

function statusOptions(selected){return statuses.map(s=>`<option value="${s}" ${s===selected?"selected":""}>${labels[s]}</option>`).join("")}
function timeText(value){try{return value?.toDate?.().toLocaleString([], {month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})||"—"}catch(e){return "—"}}
async function routeRequest(id,status,response){
  if(!statuses.includes(status))return;
  await setDoc(doc(db,"studentSuggestions",id),{status,teacherResponse:String(response||responses[status]),statusChangedAt:serverTimestamp(),updatedAt:serverTimestamp()},{merge:true});
}
async function saveRequest(id){
  const status=document.querySelector(`[data-request-status="${CSS.escape(id)}"]`)?.value||"new";
  const response=document.querySelector(`[data-request-response="${CSS.escape(id)}"]`)?.value.trim()||responses[status];
  const internalNote=document.querySelector(`[data-request-note="${CSS.escape(id)}"]`)?.value.trim()||"";
  await Promise.all([
    routeRequest(id,status,response),
    setDoc(doc(db,"studentSuggestionNotes",id),{suggestionId:id,note:internalNote,updatedAt:serverTimestamp()},{merge:true})
  ]);
}

function mount(){
  if(document.getElementById("dwRequestCenter"))return;
  const style=document.createElement("style");style.textContent=`
  #dwOpenRequestCenter{width:100%;margin-top:8px;padding:9px;border:1px solid #ffd766;border-radius:8px;background:#172b51;color:#fff;font-weight:900}
  .dw-quick-route{max-width:112px;padding:6px;border:1px solid #ffd766;border-radius:7px;background:#132a4d;color:#fff;font-size:10px;font-weight:900}
  #dwRequestCenter{border:1px solid #ffd766;border-radius:16px;background:#07091f;color:#fff;width:min(1050px,94vw);height:min(820px,88vh);padding:0;box-shadow:0 24px 80px #000}
  #dwRequestCenter::backdrop{background:#000b}.dw-rc-shell{padding:20px;height:100%;overflow:auto}.dw-rc-head{display:flex;justify-content:space-between;gap:14px;align-items:start}.dw-rc-head h2{margin:0;color:#ffe58b}.dw-rc-close{padding:8px 13px}
  .dw-rc-filters{display:flex;gap:7px;flex-wrap:wrap;margin:16px 0}.dw-rc-filter{padding:8px 11px;border:1px solid #56477b;border-radius:8px;background:#111534;color:#fff}.dw-rc-filter.active{border-color:#ffd766;background:#243c65}.dw-rc-search{flex:1;min-width:220px;padding:9px;border:1px solid #56477b;border-radius:8px;background:#080b24;color:#fff}
  .dw-rc-card{margin:10px 0;padding:14px;border:1px solid #413764;border-radius:11px;background:#10132f}.dw-rc-meta{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}.dw-rc-text{font-size:15px;line-height:1.45;margin:10px 0;padding:10px;border-radius:8px;background:#080a20}.dw-rc-grid{display:grid;grid-template-columns:180px 1fr 1fr auto;gap:8px;align-items:end}.dw-rc-grid label{font-size:10px;font-weight:900;color:#cfc6dc}.dw-rc-grid select,.dw-rc-grid textarea{width:100%;margin-top:4px;padding:8px;border:1px solid #594b7c;border-radius:7px;background:#07091d;color:#fff}.dw-rc-grid textarea{min-height:66px;resize:vertical}.dw-rc-save{padding:10px 14px;background:#176b49;color:#fff;border:1px solid #45d795;border-radius:8px;font-weight:900}.dw-rc-empty{padding:35px;text-align:center;color:#bdb4cc}@media(max-width:760px){.dw-rc-grid{grid-template-columns:1fr}.dw-rc-save{width:100%}}
  `;document.head.append(style);
  document.body.insertAdjacentHTML("beforeend",`<dialog id="dwRequestCenter"><div class="dw-rc-shell"><div class="dw-rc-head"><div><h2>💡 Student Requests Center</h2><p>Route new ideas, keep plans visible, record outcomes, and reopen requests whenever needed.</p></div><button class="dw-rc-close" type="button">CLOSE</button></div><div class="dw-rc-filters" id="dwRequestFilters"></div><div id="dwRequestRows"></div></div></dialog>`);
  document.querySelector("#dwRequestCenter .dw-rc-close").onclick=()=>document.getElementById("dwRequestCenter").close();
  renderCenter();enhanceAttention();
}

function renderCenter(){
  const filters=document.getElementById("dwRequestFilters"),rows=document.getElementById("dwRequestRows");if(!filters||!rows)return;
  const counts=Object.fromEntries(statuses.map(s=>[s,requests.filter(x=>(x.status||"new")===s).length]));
  filters.innerHTML=["all",...statuses].map(s=>`<button type="button" class="dw-rc-filter ${filter===s?"active":""}" data-rc-filter="${s}">${s==="all"?`All (${requests.length})`:`${labels[s]} (${counts[s]})`}</button>`).join("")+`<input class="dw-rc-search" id="dwRequestSearch" value="${esc(search)}" placeholder="Search student, type, or request…">`;
  filters.querySelectorAll("[data-rc-filter]").forEach(b=>b.onclick=()=>{filter=b.dataset.rcFilter;renderCenter()});
  document.getElementById("dwRequestSearch").oninput=e=>{search=e.target.value;renderRows()};
  renderRows();
}
function renderRows(){
  const rows=document.getElementById("dwRequestRows");if(!rows)return;const needle=search.trim().toLowerCase();
  const visible=requests.filter(x=>(filter==="all"||(x.status||"new")===filter)&&(!needle||`${x.studentName} ${x.studentEmail} ${x.type} ${x.text}`.toLowerCase().includes(needle))).sort((a,b)=>(b.updatedAt?.seconds||b.createdAt?.seconds||0)-(a.updatedAt?.seconds||a.createdAt?.seconds||0));
  rows.innerHTML=visible.length?visible.map(x=>`<article class="dw-rc-card"><div class="dw-rc-meta"><b>💡 ${esc(x.studentName||"Student")} • ${esc(x.type||"idea")}</b><small>Submitted ${esc(timeText(x.createdAt))} • Updated ${esc(timeText(x.updatedAt))}</small></div><div class="dw-rc-text">${esc(x.text||"")}</div><div class="dw-rc-grid"><label>ROUTE TO<select data-request-status="${esc(x.id)}">${statusOptions(x.status||"new")}</select></label><label>MESSAGE SHOWN TO STUDENT<textarea data-request-response="${esc(x.id)}">${esc(x.teacherResponse||responses[x.status||"new"])}</textarea></label><label>PRIVATE TEACHER NOTE<textarea data-request-note="${esc(x.id)}">${esc(notes[x.id]?.note||"")}</textarea></label><button class="dw-rc-save" data-request-save="${esc(x.id)}">SAVE</button></div></article>`).join(""):'<div class="dw-rc-empty">No requests match this view.</div>';
  rows.querySelectorAll("[data-request-save]").forEach(b=>b.onclick=async()=>{b.disabled=true;b.textContent="SAVING…";try{await saveRequest(b.dataset.requestSave);b.textContent="SAVED ✓"}catch(e){console.warn("save request",e);b.textContent="TRY AGAIN"}finally{setTimeout(()=>{b.disabled=false;b.textContent="SAVE"},900)}});
}

function enhanceAttention(){
  const body=document.getElementById("dwAttentionBody");if(!body)return;
  const buttons=[...body.querySelectorAll("[data-suggestion-status]")];
  const ids=[...new Set(buttons.map(b=>b.dataset.suggestionStatus).filter(Boolean))];
  ids.forEach(id=>{const first=buttons.find(b=>b.dataset.suggestionStatus===id),wrap=first?.parentElement;if(!wrap||wrap.querySelector(".dw-quick-route"))return;wrap.innerHTML=`<select class="dw-quick-route" data-quick-request="${esc(id)}" aria-label="Route student request">${statusOptions("new")}</select>`;wrap.querySelector("select").onchange=async e=>{e.target.disabled=true;try{await routeRequest(id,e.target.value)}catch(err){console.warn("route request",err);e.target.value="new"}finally{e.target.disabled=false}}});
  if(!document.getElementById("dwOpenRequestCenter")){const button=document.createElement("button");button.id="dwOpenRequestCenter";button.type="button";button.textContent="OPEN STUDENT REQUESTS CENTER";button.onclick=()=>{renderCenter();document.getElementById("dwRequestCenter").showModal()};body.append(button)}
}
function queueEnhance(){if(enhanceQueued)return;enhanceQueued=true;requestAnimationFrame(()=>{enhanceQueued=false;enhanceAttention()})}

onAuthStateChanged(auth,u=>{
  if(String(u?.email||"").toLowerCase()!==TEACHER)return;
  mount();
  suggestionUnsub?.();noteUnsub?.();
  suggestionUnsub=onSnapshot(collection(db,"studentSuggestions"),snap=>{requests=snap.docs.map(d=>({id:d.id,...d.data()}));renderCenter();queueEnhance()},e=>console.warn("student requests",e));
  noteUnsub=onSnapshot(collection(db,"studentSuggestionNotes"),snap=>{notes=Object.fromEntries(snap.docs.map(d=>[d.id,d.data()]));renderCenter()},e=>console.warn("student request notes",e));
  new MutationObserver(queueEnhance).observe(document.body,{childList:true,subtree:true});
});
