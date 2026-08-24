/* Dragonswood teacher AI Answer Rescue controls v1 */
import {getApps,getApp} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {getFirestore,doc,onSnapshot,setDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
const TEACHER="jacobicusjax@gmail.com";
const DEFAULTS={enabled:true,perStudentDailyCallCap:12,dailyClassCallCap:250,model:"gpt-5-nano"};
let cfg={...DEFAULTS},usage={},mounted=false;
const phoenixDateKey=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/Phoenix",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const money=v=>Number(v||0).toLocaleString(undefined,{style:"currency",currency:"USD",minimumFractionDigits:4,maximumFractionDigits:4});
function mount(db){
  if(mounted)return;mounted=true;
  const host=document.getElementById("tools")||document.getElementById("data")||document.getElementById("dash")||document.body;
  const card=document.createElement("section");card.id="dwAcademicAiTeacherCard";card.className="card";
  card.style.cssText="margin:14px 0;padding:15px;border:1px solid rgba(244,201,93,.42);border-radius:12px";
  card.innerHTML=`<h3>🤖 AI ANSWER RESCUE</h3><p>Runs only after free grading rules reject eligible open wording. Exact math, choices, spelling, capitalization, and punctuation stay deterministic and free.</p>
  <div style="display:grid;grid-template-columns:repeat(3,minmax(160px,1fr));gap:8px;align-items:end">
  <label><b>ENABLED</b><select id="dwAiEnabled"><option value="true">ON</option><option value="false">OFF</option></select></label>
  <label><b>MAX / STUDENT / DAY</b><input id="dwAiStudentCap" type="number" min="1" max="50"></label>
  <label><b>MAX CLASS PAID CALLS / DAY</b><input id="dwAiClassCap" type="number" min="1" max="1000"></label></div>
  <div style="margin-top:10px"><button id="dwAiSave">SAVE AI RESCUE SETTINGS</button> <span id="dwAiSaveStatus"></span></div>
  <div id="dwAiUsage" style="margin-top:10px;padding:10px;border-radius:8px;background:#071326;color:#dcecff;font-size:12px"></div>`;
  host.appendChild(card);
  const render=()=>{
    card.querySelector("#dwAiEnabled").value=String(cfg.enabled!==false);
    card.querySelector("#dwAiStudentCap").value=Number(cfg.perStudentDailyCallCap||12);
    card.querySelector("#dwAiClassCap").value=Number(cfg.dailyClassCallCap||250);
    card.querySelector("#dwAiUsage").innerHTML=`<b>Today:</b> ${Number(usage.calls||0)} paid calls • ${Number(usage.cacheHits||0)} cache hits • ${Number(usage.inputTokens||0).toLocaleString()} input tokens • ${Number(usage.outputTokens||0).toLocaleString()} output tokens • estimated API cost ${money(usage.estimatedCostUsd||0)}<br><small>Model: ${cfg.model||"gpt-5-nano"}</small>`;
  };
  onSnapshot(doc(db,"classData","academicAiConfig"),s=>{cfg={...DEFAULTS,...(s.exists()?s.data():{})};render()},e=>console.warn("academic AI config",e));
  onSnapshot(doc(db,"academicAiUsage","global_"+phoenixDateKey()),s=>{usage=s.exists()?s.data():{};render()},e=>{usage={};render();console.warn("academic AI usage",e)});
  card.querySelector("#dwAiSave").onclick=async()=>{
    const status=card.querySelector("#dwAiSaveStatus"),btn=card.querySelector("#dwAiSave");
    btn.disabled=true;status.textContent="Saving…";
    try{
      await setDoc(doc(db,"classData","academicAiConfig"),{
        enabled:card.querySelector("#dwAiEnabled").value==="true",
        perStudentDailyCallCap:Math.max(1,Math.min(50,Number(card.querySelector("#dwAiStudentCap").value)||12)),
        dailyClassCallCap:Math.max(1,Math.min(1000,Number(card.querySelector("#dwAiClassCap").value)||250)),
        model:"gpt-5-nano",updatedAt:serverTimestamp()
      },{merge:true});status.textContent="✅ Saved.";
    }catch(e){status.textContent="❌ "+(e.code||e.message||e)}
    finally{btn.disabled=false}
  };
  render();
}
function boot(attempt=0){
  const apps=getApps();if(!apps.length){if(attempt<20)setTimeout(()=>boot(attempt+1),250);return}
  const app=apps.find(a=>a.name==="DragonswoodTeacherPortal")||getApp(),auth=getAuth(app),db=getFirestore(app);
  onAuthStateChanged(auth,u=>{if(String(u?.email||"").toLowerCase()===TEACHER)mount(db)});
}
boot();