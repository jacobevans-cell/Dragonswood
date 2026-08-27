/* ==========================================================================
   DRAGONSWOOD Q1 INTERACTION ENGINE v56.24.2
   Adds a small, aligned interaction layer across Curriculum Quest without
   changing required-video playback, watch tracking, or source lesson content.

   Design rules:
   - Interaction replaces some repetitive MC volume; it does not simply add work.
   - Morphology uses Root Magnet / Word Forge throughout both grades and all Q1 days.
   - Reading, Writing, Math, and Science use short skill/process interactions.
   - Fluency/publish missions keep their existing performance interaction instead.
   - No cold guessing: word-family chips use only current/prior taught Q1 words.
   - Drag has click/tap + keyboard fallback for Chromebooks and accessibility.
   - Previously completed missions are grandfathered and never reopened.
   ========================================================================== */
(function(){
  const D=window.DRAGONSWOOD_DATA;
  if(!D||!Array.isArray(D.items))return;
  if(!/curriculum-quest\.html$/i.test(location.pathname)&&!document.getElementById("curriculumTabs"))return;

  const V="56.24.2";
  const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const norm=v=>String(v||"").trim().toLowerCase().replace(/\s+/g," ");
  const safeId=v=>String(v||"").replace(/[^a-zA-Z0-9_-]/g,"_");
  const textOf=x=>`${x?.resourceName||""} ${x?.requirement||""} ${x?.strand||""}`.toLowerCase();
  const hash=str=>{let h=2166136261>>>0;for(const c of String(str)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
  function shuffleStable(arr,seed){arr=[...arr];let x=hash(seed)||1;for(let i=arr.length-1;i>0;i--){x=(Math.imul(x,1664525)+1013904223)>>>0;const j=x%(i+1);[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
  function parseRequirementWord(x){
    const lines=String(x?.requirement||"").split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    for(let i=0;i<lines.length-1;i++)if(/^word:?$/i.test(lines[i]))return lines[i+1].trim();
    return "";
  }
  function parseRequirementRoot(x){
    const lines=String(x?.requirement||"").split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    for(let i=0;i<lines.length-1;i++)if(/morph|moph/i.test(lines[i]))return lines[i+1].trim();
    return "";
  }
  function rootKey(v){return norm(v).replace(/\s*/g,"").split("/").filter(Boolean).sort().join("/")}
  function rootsOverlap(a,b){
    const A=new Set(norm(a).replace(/\s/g,"").split("/").filter(Boolean)),B=norm(b).replace(/\s/g,"").split("/").filter(Boolean);
    return B.some(v=>A.has(v));
  }
  function morphForItem(x){
    let m=null;
    try{if(typeof window.morphFor==="function")m=window.morphFor(x)}catch(e){}
    if(m)return m;
    const word=parseRequirementWord(x);
    if(word&&Array.isArray(D.morphology)){
      m=D.morphology.find(r=>r.grade===x.grade&&norm(r.word)===norm(word));
      if(m)return m;
    }
    const n=norm(x?.resourceName||"");
    if(n&&Array.isArray(D.morphology)){
      m=D.morphology.find(r=>r.grade===x.grade&&r.word&&n.includes(norm(r.word)));
      if(m)return m;
    }
    return null;
  }
  function itemForMorph(m,dayLimit=99){
    if(!m)return null;
    const word=norm(m.word),grade=m.grade;
    return D.items.filter(i=>i.grade===grade&&Number(i.day)<=Number(dayLimit)&&i.subject==="HUM"&&i.strand==="Foundational Skills")
      .find(i=>norm(parseRequirementWord(i))===word||norm(i.resourceName||"").includes(word))||null;
  }
  function sourceRootForMorph(m,dayLimit=99){
    const item=itemForMorph(m,dayLimit);return parseRequirementRoot(item)||m?.root||"";
  }
  function taughtMorphRows(x){
    if(!Array.isArray(D.morphology))return [];
    return D.morphology.map(m=>({m,item:itemForMorph(m,x.day)})).filter(o=>o.m.grade===x.grade&&o.item&&Number(o.item.day)<=Number(x.day));
  }
  function currentRoot(x,m){return parseRequirementRoot(x)||m?.root||""}
  function taughtFamily(x,m){
    const root=currentRoot(x,m),rows=taughtMorphRows(x);
    return rows.filter(o=>rootsOverlap(root,sourceRootForMorph(o.m,x.day))).sort((a,b)=>Number(a.item.day)-Number(b.item.day));
  }
  function distractorWords(x,m,count=3){
    const root=currentRoot(x,m),rows=taughtMorphRows(x).filter(o=>!rootsOverlap(root,sourceRootForMorph(o.m,x.day)));
    const unique=[];
    for(const o of rows.sort((a,b)=>Number(b.item.day)-Number(a.item.day))){
      if(o.m.word&&!unique.some(u=>norm(u.word)===norm(o.m.word)))unique.push({word:o.m.word,day:Number(o.item.day),root:sourceRootForMorph(o.m,x.day)});
    }
    return shuffleStable(unique,`${x.id}:distractors`).slice(0,count);
  }
  function cleanPartLabel(part){
    part=String(part||"").trim().replace(/[→].*$/g,"").trim();
    const m=part.match(/^([A-Za-z-]+)\s*(?:\(|=|$)/);return m?m[1]:"";
  }
  function wordParts(m){
    const raw=String(m?.morphological||"").replace(/\bn-\s*=/g,"in- =").replace(/\be-\s*=/g,"re- =");
    if(!raw)return [];
    const head=raw.split(/\.|→/)[0];
    const parts=head.split("+").map(cleanPartLabel).filter(Boolean);
    return [...new Set(parts)].slice(0,4);
  }
  function noVideoPerformance(x){
    const t=textOf(x);
    return /fluency|partner read|read aloud|\bpresent(?:ing|ations?)?\b|publish|share their work|ready,\s*set,\s*publish/i.test(t)&&!(morphForItem(x));
  }
  function itemKind(x){
    const t=textOf(x),m=morphForItem(x);
    if(m)return "morph";
    if(/progress monitor|progress monitoring/.test(t)&&x.strand==="Foundational Skills")return "morph-progress";
    if(/fluency|partner read|read aloud/.test(t))return "fluency";
    if(/\bpresent(?:ing|ations?)?\b|publish|share their work|ready,\s*set,\s*publish/.test(t))return "performance";
    if(x.subject==="Math")return "math";
    if(x.subject==="Science")return "science";
    if(x.strand==="Reading")return "reading";
    if(x.strand==="Writing")return "writing";
    if(x.subject==="HUM")return "hum";
    return "generic";
  }
  function orderSpec(x,title,prompt,steps){
    const chips=steps.map((label,i)=>({id:`s${i}`,label,zone:`slot${i}`}));
    return {id:`${x.id}:order:${hash(steps.join("|"))}`,type:"order",title,prompt,chips:shuffleStable(chips,x.id+title),zones:steps.map((_,i)=>({id:`slot${i}`,label:`${i+1}`,single:true})),required:true};
  }
  function sortSpec(x,title,prompt,zones,rows){
    const chips=rows.map((r,i)=>({id:`c${i}`,label:r.label,zone:r.zone,meta:r.meta||null}));
    return {id:`${x.id}:sort:${hash(rows.map(r=>r.label+":"+r.zone).join("|"))}`,type:"sort",title,prompt,chips:shuffleStable(chips,x.id+title),zones:zones.map(z=>({id:z.id,label:z.label,single:false})),required:true};
  }
  function partRole(part,root,index,total){
    const clean=String(part||"").replace(/^-|-$/g,"");
    if(rootsOverlap(clean,root))return "ROOT";
    if(String(part).startsWith("-"))return "SUFFIX / ENDING";
    if(String(part).endsWith("-"))return "PREFIX / BEGINNING";
    if(index===0&&total>1)return "BASE / BEGINNING";
    return index===total-1?"ENDING":"WORD PART";
  }
  function wordBuildSpec(x,m,root,parts){
    const counts={};
    const zones=parts.map((part,i)=>{
      let label=partRole(part,root,i,parts.length);
      counts[label]=(counts[label]||0)+1;
      if(counts[label]>1)label+=` ${counts[label]}`;
      return {id:`slot${i}`,label,single:true};
    });
    const chips=parts.map((label,i)=>({id:`s${i}`,label,zone:`slot${i}`}));
    return {id:`${x.id}:word-build:${hash(parts.join("|"))}`,type:"order",title:"⚒️ Word Forge",prompt:`Build “${m.word}.” Drag each meaningful word part into the correct place: beginning/prefix, root or base, and suffix/ending when the word has one.`,chips:shuffleStable(chips,x.id+"wordforge"),zones,required:true};
  }
  function morphologySpec(x){
    const m=morphForItem(x);
    if(!m)return null;
    const root=currentRoot(x,m)||m.root||"word root";
    const family=taughtFamily(x,m);
    const distract=distractorWords(x,m,Math.max(2,Math.min(3,family.length||2)));
    const lesson=Number(m.lesson||0);
    const parts=wordParts(m);
    if(parts.length>=2&&lesson%2===0){
      return wordBuildSpec(x,m,root,parts);
    }
    const rows=[...family.map(o=>({label:o.m.word,zone:"family",meta:{day:Number(o.item.day)}})),...distract.map(o=>({label:o.word,zone:"other",meta:{day:o.day}}))];
    if(rows.length<3&&parts.length>=2)return wordBuildSpec(x,m,root,parts);
    return sortSpec(x,"🧲 Root Magnet",`Pull every word that belongs to the root family “${root}” into the Root Gate. Move words from other families to Not This Root.`,[
      {id:"family",label:`ROOT GATE • ${root}`},{id:"other",label:"NOT THIS ROOT"}
    ],rows);
  }
  function progressMorphSpec(x){
    const previous=D.items.filter(i=>i.grade===x.grade&&i.subject==="HUM"&&i.strand==="Foundational Skills"&&Number(i.day)<Number(x.day))
      .sort((a,b)=>Number(b.day)-Number(a.day)).find(i=>morphForItem(i));
    if(!previous)return null;
    const m=morphForItem(previous),root=currentRoot(previous,m)||m.root||"word root",family=taughtFamily(x,m).slice(-4),distract=distractorWords(x,m,3);
    const rows=[...family.map(o=>({label:o.m.word,zone:"family",meta:{day:Number(o.item.day)}})),...distract.map(o=>({label:o.word,zone:"other",meta:{day:o.day}}))];
    return sortSpec(x,"🧲 Root Family Review",`Before the progress check, sort the words you already learned. Pull the “${root}” family into the Root Gate.`,[
      {id:"family",label:`ROOT GATE • ${root}`},{id:"other",label:"OTHER ROOTS"}
    ],rows);
  }
  function readingSpec(x){
    const t=textOf(x);
    if(/point of view|first or third person|narrator/.test(t)){
      return sortSpec(x,"👁️ Point-of-View Sort","Sort the pronoun clues by the point of view they usually signal.",[
        {id:"first",label:"FIRST PERSON"},{id:"third",label:"THIRD PERSON"}
      ],[
        {label:"I / me / my",zone:"first"},{label:"we / us / our",zone:"first"},{label:"he / him / his",zone:"third"},{label:"she / her",zone:"third"},{label:"they / them / their",zone:"third"}
      ]);
    }
    if(/infer|inference|between the lines/.test(t))return orderSpec(x,"🔎 Inference Trail","Put the reader's reasoning in a useful order.",[
      "Find a clue in the text","Connect the clue to what you already know","Make an inference","Explain how the clue supports it"
    ]);
    if(/cite|evidence|text clue|details/.test(t))return orderSpec(x,"📚 Evidence Trail","Build a strong evidence-based response in order.",[
      "Answer the question","Find a specific text detail","Quote or paraphrase the detail","Explain what the detail proves"
    ]);
    if(/compare|illustration|graphic novel|poem|format/.test(t))return orderSpec(x,"🗺️ Compare the Sources","Put the comparison process in order.",[
      "Identify what both sources are about","Notice a detail in the first source","Notice a detail in the second source","Explain an important similarity or difference"
    ]);
    return orderSpec(x,"📖 Reader's Evidence Path","Use this path whenever a reading question asks you to prove your thinking.",[
      "Read the question carefully","Return to the text","Find the strongest clue","Explain how the clue supports your answer"
    ]);
  }
  function writingSpec(x){
    const t=textOf(x);
    if(/fanboys|compound sentence|compound sentences|conjunction/.test(t))return orderSpec(x,"🔨 Sentence Forge","Build the structure of a correct compound sentence.",[
      "Complete idea #1",", (comma)","FANBOYS conjunction","Complete idea #2"
    ]);
    if(/opinion/.test(t))return orderSpec(x,"🗣️ Opinion Builder","Arrange the parts of a strong opinion response.",[
      "State the opinion","Give a clear reason","Add evidence or an example","Finish with a conclusion"
    ]);
    if(/comma.*series|commas in a series/.test(t))return orderSpec(x,"✍️ Series Builder","Put the pieces of a clear series in order.",[
      "First item",",","Second item",", and","Final item"
    ]);
    if(/peer review|pqp|revise|revision|editing/.test(t))return orderSpec(x,"🪶 Revision Path","Put the revision process in a useful order.",[
      "Read the draft","Notice a strength or problem","Choose one change","Revise the sentence or idea","Reread the improved version"
    ]);
    return orderSpec(x,"✍️ Writer's Path","Use the writing process instead of submitting the first thing that appears in your head. Revolutionary, apparently.",[
      "Plan the idea","Write a complete draft","Reread for meaning","Revise for clarity","Proofread conventions"
    ]);
  }
  function mathSpec(x){
    const t=textOf(x);
    if(/round/.test(t))return orderSpec(x,"🎯 Rounding Route","Put the rounding steps in order.",[
      "Find the place you are rounding","Look one digit to the right","Decide: 0–4 stay, 5–9 raise","Replace later whole-number digits with zeros","Check whether the result is reasonable"
    ]);
    if(/multi.?step|problem solving/.test(t))return orderSpec(x,"🧭 Multi-Step Map","Arrange the path for a multi-step problem.",[
      "Read and identify what is being asked","Choose the first operation","Solve the first step","Use that result in the next step","Check the final answer"
    ]);
    if(/division|divide/.test(t))return orderSpec(x,"🏰 Division Cycle","Put the long-division cycle in order.",[
      "Divide","Multiply","Subtract","Bring down","Repeat and check"
    ]);
    if(/multiplication|multiply/.test(t))return orderSpec(x,"⚔️ Multiplication Route","Arrange a reliable multi-digit multiplication process.",[
      "Line up place values","Multiply the ones","Regroup when needed","Multiply the next place","Combine and check"
    ]);
    if(/subtraction|subtract/.test(t))return orderSpec(x,"🛡️ Subtraction Route","Arrange the subtraction algorithm.",[
      "Line up place values","Start at the ones","Regroup if a place needs more","Continue from right to left","Estimate or add back to check"
    ]);
    if(/addition|add|computation/.test(t))return orderSpec(x,"🪙 Addition Route","Arrange the addition algorithm.",[
      "Line up place values","Start at the ones","Add each place","Regroup when a place makes 10 or more","Estimate to check"
    ]);
    if(/place value/.test(t))return orderSpec(x,"🔢 Place-Value Decoder","Put the place-value reasoning in order.",[
      "Find the digit","Name its place","Write the value of the digit","Compare with nearby places if needed"
    ]);
    if(/parallel|perpendicular|angle|shape|symmetr|geometry/.test(t))return orderSpec(x,"📐 Geometry Scanner","Use attributes instead of guessing from appearance.",[
      "Inspect sides and lines","Inspect angles","Identify parallel/perpendicular/symmetry clues","Classify using the attributes"
    ]);
    return orderSpec(x,"🧠 Math Strategy Path","Arrange the problem-solving process.",[
      "Understand what is known and asked","Choose a strategy or operation","Show the important work","Check whether the answer is reasonable"
    ]);
  }
  function scienceSpec(x){
    const t=textOf(x);
    if(/food chain|producer|consumer|decomposer/.test(t))return orderSpec(x,"🌞 Energy Path","Put a simple food-chain energy path in order.",[
      "Sun","Producer","Primary consumer","Secondary consumer"
    ]);
    if(/renewable|nonrenewable|resource/.test(t))return sortSpec(x,"🌎 Resource Sort","Sort each energy resource by whether it is renewable on a human timescale.",[
      {id:"renew",label:"RENEWABLE"},{id:"non",label:"NONRENEWABLE"}
    ],[
      {label:"sunlight",zone:"renew"},{label:"wind",zone:"renew"},{label:"flowing water",zone:"renew"},{label:"coal",zone:"non"},{label:"petroleum",zone:"non"},{label:"natural gas",zone:"non"}
    ]);
    if(/engineer|prototype|design|solution|fair test/.test(t))return orderSpec(x,"🛠️ Engineer's Loop","Arrange the design cycle.",[
      "Define the problem and limits","Design or choose a solution","Test fairly","Use evidence from the test","Improve the design"
    ]);
    if(/energy transfer|transfer.*energy|light|heat|sound|electric/.test(t))return orderSpec(x,"⚡ Energy Evidence Path","Trace an energy-transfer explanation.",[
      "Identify the energy source","Identify where the energy moves","Observe the effect","Use the observation as evidence"
    ]);
    if(/ecosystem|plant|growth|matter/.test(t))return orderSpec(x,"🌿 Systems Trail","Trace a change through a living system.",[
      "Identify the part that changed","Find what interacts with that part","Predict an effect","Explain the effect with evidence"
    ]);
    return orderSpec(x,"🔬 Science Evidence Path","Arrange a strong scientific explanation.",[
      "Observe or identify the phenomenon","State a claim","Use a specific piece of evidence","Explain why the evidence supports the claim"
    ]);
  }
  function interactionSpec(x){
    if(!x)return null;
    const kind=itemKind(x);
    if(kind==="fluency"||kind==="performance")return null; // already interactive performance
    if(kind==="morph")return morphologySpec(x);
    if(kind==="morph-progress")return progressMorphSpec(x);
    if(kind==="reading")return readingSpec(x);
    if(kind==="writing")return writingSpec(x);
    if(kind==="math")return mathSpec(x);
    if(kind==="science")return scienceSpec(x);
    if(kind==="hum")return orderSpec(x,"🧭 Evidence Path","Put a strong academic response in order.",[
      "Understand the task","Identify the important idea","Use a specific example or fact","Explain how the evidence supports the answer"
    ]);
    return null;
  }
  function correctPlacement(spec,placement){
    if(!spec)return true;
    return spec.chips.every(ch=>placement[ch.id]===ch.zone);
  }
  function desiredQuestionCount(x,spec){
    if(!spec)return Infinity;
    const kind=itemKind(x);
    if(kind==="morph"||kind==="morph-progress")return 4;
    return 5;
  }
  function injectStyle(){
    if(document.getElementById("dwCurriculumInteractionStyle"))return;
    const s=document.createElement("style");s.id="dwCurriculumInteractionStyle";
    s.textContent=`
.dw-interactive{margin:11px 0;padding:12px;border:1px solid rgba(244,201,93,.34);border-radius:9px;background:linear-gradient(135deg,rgba(21,13,42,.96),rgba(5,11,24,.96))}
.dw-interactive-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:7px}.dw-interactive-title{font-family:Georgia,serif;color:#ffe8a0;font-size:16px;font-weight:900}.dw-interactive-badge{font-size:10px;font-weight:900;color:#8eeeff;border:1px solid #245f78;background:#092a39;border-radius:999px;padding:5px 8px}.dw-interactive-prompt{font-size:12px;line-height:1.45;color:#e7dfef;margin:5px 0 10px}.dw-i-bank{min-height:55px;display:flex;gap:8px;flex-wrap:wrap;padding:9px;border:1px dashed #4c3966;border-radius:8px;background:#080612;margin-bottom:9px}.dw-i-chip{min-height:42px;padding:8px 11px;border-radius:8px;border:1px solid #72519b;background:#25153e;color:#fff;font-weight:900;cursor:grab;touch-action:manipulation;box-shadow:0 2px 0 rgba(0,0,0,.3)}.dw-i-chip:active{cursor:grabbing}.dw-i-chip.selected{outline:3px solid #02ccfe;outline-offset:2px}.dw-i-zones{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}.dw-i-zone{min-height:76px;border:1px dashed #695382;border-radius:9px;padding:8px;background:#0b0819;outline:none}.dw-i-zone:focus,.dw-i-zone.dragover{border-style:solid;border-color:#02ccfe;box-shadow:0 0 0 2px rgba(2,204,254,.18)}.dw-i-zone-label{font-size:10px;font-weight:1000;color:#8eeeff;letter-spacing:.03em;margin-bottom:7px}.dw-i-zone-items{display:flex;gap:7px;flex-wrap:wrap;min-height:39px}.dw-i-zone.single .dw-i-zone-items{justify-content:center}.dw-i-zone.single{min-width:90px}.dw-i-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:9px}.dw-i-feedback{display:none;margin-top:8px;padding:9px;border-radius:7px;font-size:12px;font-weight:800}.dw-i-feedback.show{display:block}.dw-i-feedback.good{background:#103b2b;color:#b9f6d1;border:1px solid #2c7d58}.dw-i-feedback.bad{background:#3a1320;color:#ffd0d9;border:1px solid #8e3d54}.dw-interactive.passed{border-color:#3e916b;background:linear-gradient(135deg,rgba(11,45,31,.88),rgba(5,17,18,.96))}.dw-interactive.passed .dw-i-chip{cursor:default;opacity:.9}.dw-i-help{font-size:10px;color:#bfb5ce}.dw-i-slots{grid-template-columns:repeat(auto-fit,minmax(85px,1fr))}
@media(max-width:620px){.dw-i-zones,.dw-i-slots{grid-template-columns:1fr}.dw-i-chip{width:100%;text-align:left}.dw-i-zone.single{min-width:0}}
`;
    document.head.appendChild(s);
  }

  const selected={itemId:null,chipId:null};
  function specForId(itemId){
    const x=D.items.find(i=>i.id===itemId);return x?interactionSpec(x):null;
  }
  function chipNode(root,chipId){return root?.querySelector(`.dw-i-chip[data-chip-id="${CSS.escape(chipId)}"]`)||null}
  function bankNode(root){return root?.querySelector(".dw-i-bank")||null}
  function zoneNode(root,zoneId){return root?.querySelector(`.dw-i-zone[data-zone-id="${CSS.escape(zoneId)}"]`)||null}
  function moveChip(root,chipId,zoneId){
    const chip=chipNode(root,chipId);if(!chip)return;
    if(zoneId==="bank"){
      bankNode(root)?.appendChild(chip);return;
    }
    const zone=zoneNode(root,zoneId);if(!zone)return;
    const holder=zone.querySelector(".dw-i-zone-items");
    if(zone.classList.contains("single")){
      const existing=holder?.querySelector(".dw-i-chip");if(existing&&existing!==chip)bankNode(root)?.appendChild(existing);
    }
    holder?.appendChild(chip);
  }
  function placementFromDom(root,spec){
    const out={};
    for(const z of spec.zones){
      const zone=zoneNode(root,z.id);zone?.querySelectorAll(".dw-i-chip").forEach(c=>out[c.dataset.chipId]=z.id);
    }
    root?.querySelectorAll(".dw-i-bank .dw-i-chip").forEach(c=>out[c.dataset.chipId]="bank");
    return out;
  }
  function resetInteraction(root,spec){
    for(const ch of spec.chips)moveChip(root,ch.id,"bank");
    root?.querySelectorAll(".dw-i-chip.selected").forEach(n=>n.classList.remove("selected"));selected.itemId=selected.chipId=null;
    const fb=root?.querySelector(".dw-i-feedback");if(fb){fb.className="dw-i-feedback";fb.textContent=""}
  }
  function setSelected(root,itemId,chipId){
    document.querySelectorAll(".dw-i-chip.selected").forEach(n=>n.classList.remove("selected"));
    selected.itemId=itemId;selected.chipId=chipId;chipNode(root,chipId)?.classList.add("selected");
  }
  function clearSelected(){document.querySelectorAll(".dw-i-chip.selected").forEach(n=>n.classList.remove("selected"));selected.itemId=selected.chipId=null}

  window.dwCurriculumInteractionCheck=function(itemId){
    const x=D.items.find(i=>i.id===itemId),spec=x?interactionSpec(x):null,root=document.querySelector(`.dw-interactive[data-item-id="${CSS.escape(itemId)}"]`);if(!x||!spec||!root)return;
    const placement=placementFromDom(root,spec),fb=root.querySelector(".dw-i-feedback"),unplaced=spec.chips.filter(ch=>placement[ch.id]==="bank"||!placement[ch.id]);
    if(unplaced.length){fb.className="dw-i-feedback show bad";fb.textContent=`Move every piece before checking. ${unplaced.length} still ${unplaced.length===1?"needs":"need"} a place.`;return}
    if(!correctPlacement(spec,placement)){fb.className="dw-i-feedback show bad";fb.textContent="Not quite. Recheck the lesson idea and move the pieces that do not fit yet.";return}
    const s=st(itemId);s.dwInteraction={version:V,specId:spec.id,passed:true,completedAt:Date.now()};S.items[itemId]=s;save();
    fb.className="dw-i-feedback show good";fb.textContent="✓ Interactive check complete.";root.classList.add("passed");
    setTimeout(()=>window.DWCurriculumRenderCoordinator.request("interaction-complete"),120);
  };
  window.dwCurriculumInteractionReset=function(itemId){const root=document.querySelector(`.dw-interactive[data-item-id="${CSS.escape(itemId)}"]`),spec=specForId(itemId);if(root&&spec)resetInteraction(root,spec)};

  function bindEvents(){
    if(window.__DW_CURRICULUM_INTERACTION_EVENTS__)return;window.__DW_CURRICULUM_INTERACTION_EVENTS__=true;
    document.addEventListener("click",e=>{
      const chip=e.target.closest?.(".dw-i-chip");if(chip){
        const root=chip.closest(".dw-interactive");if(!root||root.classList.contains("passed"))return;
        setSelected(root,root.dataset.itemId,chip.dataset.chipId);return;
      }
      const zone=e.target.closest?.(".dw-i-zone");if(zone&&selected.itemId){
        const root=zone.closest(".dw-interactive");if(root&&root.dataset.itemId===selected.itemId){moveChip(root,selected.chipId,zone.dataset.zoneId);clearSelected()}
      }
    });
    document.addEventListener("keydown",e=>{
      if(!["Enter"," "].includes(e.key))return;
      const chip=e.target.closest?.(".dw-i-chip"),zone=e.target.closest?.(".dw-i-zone");
      if(chip){e.preventDefault();const root=chip.closest(".dw-interactive");if(root&&!root.classList.contains("passed"))setSelected(root,root.dataset.itemId,chip.dataset.chipId)}
      else if(zone&&selected.itemId){e.preventDefault();const root=zone.closest(".dw-interactive");if(root&&root.dataset.itemId===selected.itemId){moveChip(root,selected.chipId,zone.dataset.zoneId);clearSelected()}}
    });
    document.addEventListener("dragstart",e=>{
      const chip=e.target.closest?.(".dw-i-chip");if(!chip)return;const root=chip.closest(".dw-interactive");if(!root||root.classList.contains("passed")){e.preventDefault();return}
      e.dataTransfer?.setData("text/plain",`${root.dataset.itemId}|${chip.dataset.chipId}`);if(e.dataTransfer)e.dataTransfer.effectAllowed="move";
    });
    document.addEventListener("dragover",e=>{const zone=e.target.closest?.(".dw-i-zone");if(zone){e.preventDefault();zone.classList.add("dragover")}});
    document.addEventListener("dragleave",e=>{e.target.closest?.(".dw-i-zone")?.classList.remove("dragover")});
    document.addEventListener("drop",e=>{
      const zone=e.target.closest?.(".dw-i-zone");if(!zone)return;e.preventDefault();zone.classList.remove("dragover");
      const data=e.dataTransfer?.getData("text/plain")||"",[itemId,chipId]=data.split("|");const root=zone.closest(".dw-interactive");if(root&&itemId===root.dataset.itemId&&chipId)moveChip(root,chipId,zone.dataset.zoneId);
    });
  }
  function renderInteraction(x,spec,grandfathered){
    if(!spec)return "";
    const s=st(x.id),passed=!!(s.dwInteraction&&s.dwInteraction.version===V&&s.dwInteraction.specId===spec.id&&s.dwInteraction.passed),done=passed||grandfathered;
    const chipHtml=spec.chips.map(ch=>`<button type="button" class="dw-i-chip" draggable="true" data-chip-id="${esc(ch.id)}" aria-label="Move ${esc(ch.label)}">${esc(ch.label)}</button>`).join("");
    const zones=spec.zones.map(z=>`<div class="dw-i-zone ${z.single?"single":""}" role="button" tabindex="0" data-zone-id="${esc(z.id)}" aria-label="Place selected piece in ${esc(z.label)}"><div class="dw-i-zone-label">${esc(z.label)}</div><div class="dw-i-zone-items"></div></div>`).join("");
    if(done)return `<div class="dw-interactive passed" data-item-id="${esc(x.id)}"><div class="dw-interactive-head"><div class="dw-interactive-title">${spec.title}</div><span class="dw-interactive-badge">${passed?"✓ COMPLETE":"✓ PRIOR WORK PRESERVED"}</span></div><div class="dw-interactive-prompt">${esc(spec.prompt)}</div><div class="dw-i-feedback show good">${passed?"Interactive check complete.":"This mission was already complete before the interactive upgrade, so Dragonswood will not reopen it."}</div></div>`;
    return `<div class="dw-interactive" data-item-id="${esc(x.id)}"><div class="dw-interactive-head"><div class="dw-interactive-title">${spec.title}</div><span class="dw-interactive-badge">INTERACTIVE WARM-UP</span></div><div class="dw-interactive-prompt">${esc(spec.prompt)}</div><div class="dw-i-bank" aria-label="Moveable pieces">${chipHtml}</div><div class="dw-i-zones ${spec.type==="order"?"dw-i-slots":""}">${zones}</div><div class="dw-i-actions"><button type="button" class="btn" onclick="dwCurriculumInteractionCheck('${esc(x.id)}')">CHECK THE FORGE</button><button type="button" class="stage" onclick="dwCurriculumInteractionReset('${esc(x.id)}')">RESET</button><span class="dw-i-help">Drag with a mouse/trackpad, or tap a piece then tap its destination. Keyboard: Enter/Space selects and places.</span></div><div class="dw-i-feedback" aria-live="polite"></div></div>`;
  }

  let installTries=0;
  function install(){
    const required=["render","st","save","autoQuestionsFor","renderAutoPractice","autoPassed","vid"];
    if(required.some(k=>typeof window[k]!=="function")||!window.DWCurriculumRenderCoordinator){if(++installTries<120)setTimeout(install,25);return}
    const nvScript=document.querySelector?.('script[src*="q1-no-video-lessons.js"]');
    if(nvScript&&!window.__DW_NO_VIDEO_LESSON_ENGINE_V1__&&installTries++<120){setTimeout(install,25);return}
    if(window.__DW_CURRICULUM_INTERACTION_ENGINE_V5624__)return;window.__DW_CURRICULUM_INTERACTION_ENGINE_V5624__=true;
    injectStyle();bindEvents();
    const O=window.__DW_CURRICULUM_INTERACTION_ORIGINALS={autoQuestionsFor:window.autoQuestionsFor,renderAutoPractice:window.renderAutoPractice,autoPassed:window.autoPassed};
    function legacyMissionPassed(x){
      const s=st(x.id),q=O.autoQuestionsFor(x)||[],a=s.autoAnswers||{},review=s.autoOverrideStatus||{};
      const qOk=!q.length||q.every((item,i)=>{
        if(review[i]==="approved")return true;
        const value=a[i]||"";return window.DWGrading?window.DWGrading.questionAnswerEquivalent(item,value):String(value)===String(item.answer);
      });
      let videoOk=true;try{videoOk=!vid(x)||s.watched||(typeof mediaPending==="function"&&mediaPending(x))}catch(e){}
      return videoOk&&qOk&&!!s.practiced;
    }
    function interactionPassed(x){
      const spec=interactionSpec(x);if(!spec)return true;
      const s=st(x.id),v=s.dwInteraction;
      return !!(v&&v.version===V&&v.specId===spec.id&&v.passed)||legacyMissionPassed(x);
    }
    window.autoQuestionsFor=function(x){
      const q=O.autoQuestionsFor(x)||[],spec=interactionSpec(x);if(!spec)return q;
      return q.slice(0,desiredQuestionCount(x,spec));
    };
    window.renderAutoPractice=function(x){
      const spec=interactionSpec(x),grandfathered=spec?legacyMissionPassed(x):false;
      const interaction=spec?renderInteraction(x,spec,grandfathered):"";
      return interaction+O.renderAutoPractice(x);
    };
    window.autoPassed=function(x){return O.autoPassed(x)&&interactionPassed(x)};
    window.__DW_CURRICULUM_INTERACTION_TEST__={interactionSpec,itemKind,morphForItem,taughtFamily,distractorWords,wordParts,correctPlacement,desiredQuestionCount,legacyMissionPassed};
    window.DWCurriculumRenderCoordinator.request("interactions-installed");
  }
  window.__DW_CURRICULUM_INTERACTION_TEST_PREINSTALL__={interactionSpec,itemKind,morphForItem,taughtFamily,distractorWords,wordParts,correctPlacement,desiredQuestionCount};
  setTimeout(install,0);
})();
