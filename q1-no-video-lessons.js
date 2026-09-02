/* ==========================================================================
   v56.23.1 — NO-VIDEO LESSON ENGINE
   Scope lock: this engine is forbidden from changing any mission that the
   existing Curriculum Quest classifies as a video mission.

   No-video missions are classified as:
   - self-contained Dragonswood lesson
   - progress monitor / assessment
   - fluency performance
   - writing performance
   - publish/share performance

   The engine derives progress checks from already-taught Q1 lessons instead of
   turning labels such as "Progress Monitor" into fake instruction.
   ========================================================================== */
(function(){
  const D=window.DRAGONSWOOD_DATA;
  if(!D||!Array.isArray(D.items))return;
  if(!/curriculum-quest\.html$/i.test(location.pathname)&&!document.getElementById("curriculumTabs"))return;

  const ROOT_MEANINGS={
    "form":"shape or make",
    "port":"carry",
    "scrib":"write","script":"write","scrib/script":"write",
    "spec":"look or see","spect":"look or see","spec/spect":"look or see",
    "struc":"build","struct":"build","struc/struct":"build",
    "flect":"bend","flex":"bend","flect/flex":"bend",
    "dic":"say or speak","dict":"say or speak","dic/dict":"say or speak",
    "cede":"go, yield, or give way","cess":"go, yield, or give way","ceed":"go, yield, or give way","cede/cess/ceed":"go, yield, or give way",
    "cred":"believe or trust",
    "fer":"carry or bear",
    "ject":"throw",
    "tract":"pull or draw",
    "mit":"send","miss":"send","mit/miss":"send",
    "pend":"hang or weigh","pens":"hang or weigh","pend/pens":"hang or weigh",
    "rupt":"break",
    "pose":"put or place","pon":"put or place","pose/pon":"put or place",
    "leg":"law, choose, or appoint depending on the word","legis":"law",
    "pence":"weigh, think, or consider",
    "ven":"come","vent":"come","ven/vent":"come"
  };

  const FLUENCY_PASSAGES={
    I:[
      "At the edge of Dragonswood, a young mapmaker unfolded a worn chart beside the river. The path ahead looked simple, but the morning rain had covered several trail marks. She slowed down, studied each sign, and compared the map with the land around her. A bent pine pointed toward the bridge, and smooth stones marked the safer crossing. By the time the clouds cleared, she had found the route. She did not rush. She read every clue carefully, paused when she needed to think, and reached the village with the map dry and the message safe.",
      "The class garden looked different after the weekend storm. Small branches covered the walkway, but the new plants were still standing. Mateo and Lena began by observing before they touched anything. They noticed which pots had drained well and which held too much water. Then they made a plan. One student cleared the path while the other moved the wettest pots into the sun. When they finished, they wrote down what they had noticed. Careful observation helped them decide what to change instead of simply guessing what the plants needed.",
      "A messenger arrived at the castle just before sunset with a sealed note. The guard could have hurried to the tower, but one line on the envelope made him stop: Deliver to the west gate first. He reread the direction, checked the symbol beside it, and chose the correct path. Along the way, he passed two staircases and a crowded courtyard. The longer route took a few extra minutes, yet it followed the instructions exactly. When he finally handed over the note, the captain thanked him for reading carefully instead of assuming that the fastest route was the right one.",
      "Nia wanted her model bridge to hold more weight, so she studied what happened during the first test. The center bent before either end moved. Instead of rebuilding everything, she strengthened only the weak section and tested again. This time the bridge held three more books. Nia recorded the result, changed one feature, and ran a third test. Each trial gave her useful evidence. By changing one thing at a time, she could tell which improvement actually helped. Her final bridge was not the prettiest model in the room, but it was strong because every change had a reason.",
      "The old library had one rule that surprised every new visitor: return each book to the exact place where you found it. The shelves were arranged by topic, then by author, so even a small mistake could hide a book for days. Jordan carried a stack carefully and checked every label twice. History belonged upstairs, science stayed near the windows, and stories filled the long wall by the door. At first the system seemed slow. After a few trips, Jordan understood why it worked. Organization made it possible for hundreds of readers to find what they needed without searching every shelf.",
      "During practice, the volleyball team tried a new way to communicate. Before each serve, players called the space they were responsible for covering. At first, everyone talked at once. The coach stopped the drill and asked them to use short, clear calls. On the next attempt, one player called short, another called deep, and a third reminded the group to move forward. The ball still dropped twice, but the team could explain why. Their communication was becoming more useful because each message had a purpose. By the end of practice, the court sounded calmer even though the players were talking more.",
      "A tiny lantern glowed beside the trail, then another appeared farther ahead. The hikers realized that someone had placed the lights to mark a safe path through the dark woods. They moved from one lantern to the next, checking the ground before every step. Some parts of the trail were rocky, and one section curved behind a hill where the next light was hard to see. The group stayed together and waited until everyone found the marker. Moving carefully took longer, but no one wandered off the path. The lanterns helped because the hikers used them as evidence, not as decorations."
    ],
    K:[
      "The archivist opened a wooden case and removed three letters written by travelers who had crossed Dragonswood years apart. Each writer described the same mountain pass, but their details were not identical. One called the route peaceful, another warned about sudden storms, and the third focused on the trading carts that crowded the road. Mara compared the accounts instead of choosing one as the whole truth. She noticed the dates, the purposes of the journeys, and the evidence each traveler included. By reading the sources together, she formed a stronger picture of the pass than any single letter could provide.",
      "When the river wheel stopped turning, the workshop lost power. The apprentices first blamed the old gears, but their teacher asked them to gather evidence before replacing anything. They inspected the wheel, traced the moving parts, and watched the water near the bank. A pile of branches had changed the current, so less water reached the wheel. Once the branches were cleared, the wheel began moving again. The gears had never been the problem. The apprentices learned that a reasonable explanation must connect the observed effect to a cause supported by evidence, not simply to the first possibility that comes to mind.",
      "Elena had two strong ideas for the opening of her speech. The first began with a surprising fact, while the second started with a short story. She read both versions aloud and listened for the effect each one created. The fact sounded direct and serious. The story sounded personal and inviting. Elena chose the story because it matched her audience and purpose, then moved the fact into the next paragraph. Revision did not mean that her first idea was bad. It meant she was deciding where each idea would work best. Strong writers make choices based on what they want the reader or listener to understand.",
      "A group of students studied a model ecosystem after one population suddenly decreased. They resisted the temptation to explain the change with a single guess. Instead, they traced several relationships. Fewer plants meant less food for one consumer, but a change in shelter also affected where animals could hide. The students drew arrows between the parts of the model and labeled each connection. Their explanation became more precise as they added evidence. Systems can be complicated because one change may produce several effects. A useful model helps scientists follow those connections rather than treating each part as if it exists alone.",
      "The debate team practiced disagreeing without losing the point of the discussion. Each speaker had to state a claim, give evidence, and respond to the strongest idea from the other side. At first, several students repeated their own arguments instead of addressing what someone else had said. Their coach asked them to begin each response by accurately summarizing the previous speaker. That small change improved the conversation. Students listened more carefully because they knew they would need to explain another person's reasoning before adding their own. A strong response does more than speak loudly. It shows that the speaker understood the evidence being discussed.",
      "Theo tested three paper gliders that looked almost identical. One had wider wings, one had a heavier nose, and one was the original design. If he threw them from different places, he would not know whether the design or the launch caused the result. So he marked one starting line, used the same throwing motion, and measured each flight. The wider-wing model stayed in the air longest. Theo repeated the trials before making a conclusion. A fair test controls important conditions so that the variable being studied is the most likely reason for a difference in results.",
      "The council received two maps of the same valley. One emphasized roads and settlements, while the other showed elevation and streams. Neither map was wrong. Each had been designed to answer a different kind of question. The council compared both before choosing a location for a new bridge. Roads mattered because travelers needed access, but elevation and water flow mattered because the bridge had to be safe. Using both sources revealed information that either map alone would have missed. Good readers and researchers ask what a source shows clearly, what it leaves out, and why that difference matters."
    ]
  };

  function escHtml(v){
    return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  }
  function textOf(x){return `${x.resourceName||""} ${x.requirement||""} ${x.strand||""}`.toLowerCase()}
  function hasVideo(x){
    try{
      if(typeof window.vid==="function")return !!window.vid(x);
    }catch(e){}
    return !!(x&&x.resourceUrl&&(/google\.com\/videos/i.test(x.resourceUrl)||/video/i.test(x.resourceName||"")));
  }
  function noVideo(x){return !!x&&!hasVideo(x)}
  function classify(x){
    const t=textOf(x),req=String(x.requirement||"").trim();
    if(/flavor assessment|core assessment/i.test(t))return "assessment";
    if(/progress monitor|progress monitoring/i.test(t)&&/foundational skills/i.test(`${x.strand||""} ${req}`))return "word-progress";
    if(/fluency|partner read|read aloud/i.test(t)&&x.subject==="HUM"&&x.strand==="Reading")return "fluency";
    if(/progress monitor|progress monitoring/i.test(t)&&/writing/i.test(x.strand||""))return "writing-progress";
    if(/progress monitor|progress monitoring/i.test(t))return "progress";
    if(/\bpresent(?:ing|ations?)?\b|publish|share their work|ready,\s*set,\s*publish/i.test(t))return "performance";
    if(/^cursive(?:\s+warm\s+up)?\s*$/i.test(req))return "cursive-only";
    if(currentWordStudy(x))return "word-lesson";
    return "lesson";
  }
  function cleanLine(v){return String(v||"").replace(/^[-•]\s*/,"").replace(/\s+/g," ").trim()}
  function extractWordRoot(item){
    const lines=String(item.requirement||"").split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    let root="",word="";
    for(let i=0;i<lines.length;i++){
      if(/moph|morph/i.test(lines[i])&&lines[i+1])root=cleanLine(lines[i+1]);
      if(/^word:?$/i.test(lines[i])&&lines[i+1])word=cleanLine(lines[i+1]);
    }
    if(!word&&typeof window.morphFor==="function"){
      const m=window.morphFor(item);if(m){word=m.word||"";root=root||m.root||""}
    }
    return {root,word};
  }
  function rootMeaning(root){
    const r=String(root||"").toLowerCase().replace(/\s+/g,"");
    if(ROOT_MEANINGS[r])return ROOT_MEANINGS[r];
    for(const part of r.split("/"))if(ROOT_MEANINGS[part])return ROOT_MEANINGS[part];
    return "a meaning you have practiced in this word family";
  }
  function recentItems(x,strand,count=4){
    return D.items.filter(i=>i.grade===x.grade&&i.subject===x.subject&&String(i.strand||"")===String(strand||x.strand||"")&&Number(i.day)<Number(x.day))
      .sort((a,b)=>Number(a.day)-Number(b.day)).slice(-count);
  }
  function recentWordStudy(x){
    return D.items.filter(i=>i.grade===x.grade&&i.subject==="HUM"&&i.strand==="Foundational Skills"&&Number(i.day)<Number(x.day)&&(
      /morphology/i.test(i.resourceName||"")||/moph|morph/i.test(i.requirement||"")
    )).sort((a,b)=>Number(a.day)-Number(b.day)).slice(-4).map(item=>{
      const wr=extractWordRoot(item),m=typeof window.morphFor==="function"?window.morphFor(item):null;
      return {item,word:wr.word||m?.word||"",root:wr.root||m?.root||"",detail:m?.morphological||""};
    }).filter(v=>v.word||v.root);
  }
  function skillLines(item){
    const raw=String(item.requirement||"");
    const lines=raw.split(/\r?\n/).map(cleanLine).filter(Boolean);
    const preferred=lines.filter(v=>/^[-•]/.test(v)||false);
    const candidates=(preferred.length?preferred:lines).filter(v=>
      !/^(video|in class|cursive warm up|journal journeys|would you rather|foundational skills)$/i.test(v)&&
      !/^https?:/i.test(v)&&v.length>3&&v.length<95
    );
    return candidates.slice(0,5);
  }
  function writingReview(x){
    const items=recentItems(x,"Writing",4),preferred=[],fallback=[];
    const reject=/^(video:?|in class:?|cursive(?: warm up)?:?|journal journeys|would you rather.*|ready, set, publish!?|build it, expand it, prove it!?|opinion writing graphic organizer)$/i;
    const logistics=/students? will need|provide time|allow students?|teacher conferencing|make an anchor chart|graphic organizer|practice as needed|extra time/i;
    for(const item of items){
      const rawLines=String(item.requirement||"").split(/\r?\n/).map(v=>String(v||"").trim()).filter(Boolean);
      for(const raw of rawLines){
        const wasBullet=/^[-•]/.test(raw),v=cleanLine(raw);
        if(!v||reject.test(v)||logistics.test(v)||/day\s*\d+|q1|language and writing/i.test(v)||v.length>=90)continue;
        const target=wasBullet?preferred:fallback;
        if(!target.some(x=>x.toLowerCase()===v.toLowerCase()))target.push(v);
      }
    }
    const out=[...preferred,...fallback.filter(v=>!preferred.some(p=>p.toLowerCase()===v.toLowerCase()))];
    return out.slice(0,7);
  }
  function currentWordStudy(x){
    const wr=extractWordRoot(x);
    if(!wr.word)return null;
    const word=wr.word.trim();
    const m=(D.morphology||[]).find(row=>row.grade===x.grade&&String(row.word||"").trim().toLowerCase()===word.toLowerCase())||null;
    if(!m)return null;
    return {item:x,row:m,word,root:wr.root||m.root||""};
  }
  function normalizeMorphText(v){
    let text=String(v||"").trim();
    // Correct obvious source-extraction prefix typos without altering the stored curriculum.
    text=text.replace(/^n-\s*=/i,"in- =").replace(/^e-\s*=/i,"re- =");
    return text;
  }
  function wordLessonHtml(x){
    const w=currentWordStudy(x);
    if(!w)return richLessonHtml(x,window.__DW_NO_VIDEO_ORIGINALS.renderMiniLesson);
    const m=w.row,root=w.root||"word root";
    const layers=[
      ["Say It",m.phonological],
      ["Spell It",m.orthographic],
      ["Build It",normalizeMorphText(m.morphological)],
      ["Use It",m.syntactic],
      ["Word History",m.etymological]
    ].filter(([,v])=>String(v||"").trim());
    return `<div class="self-lesson">
      <div class="lesson-banner">📖 WORD LAB • ${escHtml(w.word)}</div>
      <div class="key-idea"><strong>Today you will learn:</strong> how the word <b>${escHtml(w.word)}</b> is built and how its parts help explain its meaning.</div>
      <div style="margin-top:8px" class="key-idea"><strong>Root to watch:</strong> ${escHtml(root)}. Use the word's Build It explanation below as the source of truth for this word.</div>
      ${layers.map(([label,value])=>`<div style="margin-top:8px" class="key-idea"><strong>${escHtml(label)}:</strong> ${escHtml(value)}</div>`).join("")}
      <div class="example-box"><strong>Watch the thinking:</strong> Locate the root first, connect its meaning to the prefix or suffix, then check whether that meaning fits the example sentence.</div>
      <div style="margin-top:10px;padding:10px;border:1px solid #3d2a59;border-radius:8px;background:#0b0819;color:#eee8f8"><strong style="color:#ffe8a0">Try one with me:</strong> Point to the root in <b>${escHtml(w.word)}</b>. What meaning does that root contribute before the other word parts are added?</div>
      ${m.application?`<div class="remember"><strong>Apply it:</strong> ${escHtml(m.application)}</div>`:""}
      <span class="mission-note">No video today • Learn → Model → Try → Apply</span>
    </div>`;
  }
  function fluencyPassage(x){
    const bank=FLUENCY_PASSAGES[x.grade]||FLUENCY_PASSAGES.I;
    const checkpoint=Math.max(0,Math.floor((Number(x.day)-7)/5));
    return bank[checkpoint%bank.length];
  }
  function rotateChoices(answer,decoys,seedText=""){
    const all=[String(answer),...decoys.map(String).filter(v=>String(v)!==String(answer))].slice(0,4);
    while(all.length<4)all.push(`choice ${all.length+1}`);
    const seed=[...String(seedText)].reduce((n,ch)=>n+ch.charCodeAt(0),0)%all.length;
    return all.slice(seed).concat(all.slice(0,seed));
  }
  function wordLessonQuestions(x){
    const w=currentWordStudy(x);if(!w)return [];
    const m=w.row,build=normalizeMorphText(m.morphological),word=w.word,root=w.root||m.root||"root";
    const others=(D.morphology||[]).filter(r=>r.grade===x.grade&&String(r.word||"").trim()&&String(r.word||"").toLowerCase()!==word.toLowerCase()).map(r=>String(r.word).trim());
    const q=[];
    if(build){
      const decoys=[
        `The word “${word}” has no meaningful parts and must only be memorized.`,
        `The root makes “${word}” mean the opposite of its actual meaning.`,
        `The spelling of “${word}” is unrelated to its meaning.`
      ];
      q.push({source:"no-video-word-lesson",sourceItemId:x.id,skillId:"morph.word-parts",prompt:`Which explanation best shows how “${word}” is built and what it means?`,answer:build,choices:rotateChoices(build,decoys,word+"build")});
    }
    const syntactic=String(m.syntactic||"").split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
    const example=syntactic.find(v=>new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\b`,"i").test(v));
    if(example){
      const blanked=example.replace(new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\b`,"i"),"_____");
      q.push({source:"no-video-word-lesson",sourceItemId:x.id,skillId:"morph.context",prompt:`Which target word correctly completes the sentence? ${blanked}`,answer:word,choices:rotateChoices(word,others.slice(0,3),word+"context")});
    }
    const rootAnswer=`the root ${root}`;
    q.push({source:"no-video-word-lesson",sourceItemId:x.id,skillId:"morph.strategy",prompt:`When you analyze “${word},” what should you identify first before combining word parts and checking the sentence context?`,answer:rootAnswer,choices:rotateChoices(rootAnswer,["only the first letter","the number of words in the sentence","punctuation by itself"],word+"root")});
    return q;
  }
  function validPriorQuestion(row){
    return !!row&&String(row.prompt||"").trim()&&Array.isArray(row.choices)&&row.choices.length>=2&&row.answer!==undefined&&row.answer!==null;
  }
  function questionsForSourceItem(item){
    let rows=[];
    if(window.__DW_NO_VIDEO_ORIGINALS?.autoQuestionsFor){
      try{rows=(window.__DW_NO_VIDEO_ORIGINALS.autoQuestionsFor(item)||[]).filter(validPriorQuestion)}catch(e){rows=[]}
    }
    if(noVideo(item)&&currentWordStudy(item)){
      const supplemental=wordLessonQuestions(item).filter(validPriorQuestion);
      const seen=new Set(rows.map(r=>String(r.prompt||"").trim().toLowerCase()));
      for(const row of supplemental){
        const key=String(row.prompt||"").trim().toLowerCase();
        if(key&&!seen.has(key)){seen.add(key);rows.push(row)}
      }
    }
    return rows;
  }
  function spreadSources(items,maxSources){
    if(items.length<=maxSources)return items;
    const out=[],used=new Set();
    for(let i=0;i<maxSources;i++){
      const idx=Math.round(i*(items.length-1)/(maxSources-1));
      if(!used.has(idx)){used.add(idx);out.push(items[idx])}
    }
    return out;
  }
  function balancedQuestions(items,limit=6){
    const banks=items.map(item=>({item,rows:questionsForSourceItem(item)})).filter(b=>b.rows.length);
    const out=[],seen=new Set();
    let round=0,progress=true;
    while(out.length<limit&&progress){
      progress=false;
      for(const bank of banks){
        const row=bank.rows[round];
        if(!row)continue;
        progress=true;
        const key=String(row.prompt||"").trim().toLowerCase();
        if(key&& !seen.has(key)){seen.add(key);out.push(row)}
        if(out.length>=limit)break;
      }
      round++;
    }
    return out;
  }
  function priorQuestions(x,limit=6,wide=false,specificItems=null){
    let pool=specificItems||D.items.filter(i=>i.grade===x.grade&&i.subject===x.subject&&String(i.strand||"")===String(x.strand||"")&&Number(i.day)<Number(x.day)&&(
      wide||Number(i.day)>=Number(x.day)-6
    )).sort((a,b)=>Number(a.day)-Number(b.day));
    if(wide&&!specificItems)pool=spreadSources(pool,Math.min(limit,8));
    return balancedQuestions(pool,limit);
  }
  function objectiveFor(x,type){
    if(type==="word-progress")return "Show what you remember from the word-study lessons you have already completed.";
    if(type==="fluency")return "Use witness statements, times, actions, and contradictions to solve a mystery and support a theory with evidence.";
    if(type==="writing-progress")return "Show that you can independently use the writing skills from your recent lessons.";
    if(type==="assessment")return "Show what you know from the lessons that came before this assessment.";
    if(type==="performance")return "Use, present, or share work you have already prepared.";
    if(type==="word-lesson"){const w=currentWordStudy(x);return w?`Learn how “${w.word}” is built, what it means, and how to use it correctly.`:"Learn today’s word-study target.";}
    const req=cleanLine(String(x.requirement||"").split(/\r?\n/).find(Boolean)||"");
    return req&&req.length<140?req:"Learn today's assigned skill, study a worked example, and apply it independently.";
  }
  function wordProgressHtml(x){
    const review=recentWordStudy(x);
    const cards=review.length?review.map(v=>`<div style="padding:10px;border:1px solid #46345f;border-radius:8px;background:#0c0918"><b style="color:#ffe8a0">${escHtml(v.word||"Word family")}</b><div style="margin-top:4px;color:#d9d0e7"><strong>Root:</strong> ${escHtml(v.root||"review")} = ${escHtml(rootMeaning(v.root))}</div>${v.detail?`<div style="margin-top:5px;color:#bfb5ce">${escHtml(v.detail)}</div>`:""}</div>`).join(""):`<div class="teacher-note">Dragonswood could not identify the preceding word-study set. This check will use only questions already attached to earlier lessons.</div>`;
    return `<div class="self-lesson">
      <div class="lesson-banner">🛡️ PROGRESS CHECK • WORD STUDY</div>
      <div class="key-idea"><strong>No new lesson today.</strong> This is a check of skills you have already practiced. Review the targets below, then work independently.</div>
      <div style="margin-top:12px"><strong style="color:#ffe8a0">What this check covers</strong><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin-top:7px">${cards}</div></div>
      <div class="example-box"><strong>How to reason:</strong> Find the root first. Recall its meaning. Then use the other word parts and the sentence context to decide what the whole word means.</div>
      <div class="remember"><strong>Progress-check rule:</strong> Try independently first. If you get stuck, review the word family above and try again.</div>
      <span class="mission-note">No video today • Review → Check → Apply</span>
    </div>`;
  }
  const CHARACTER_CASE={
    id:"golden-eagle-v1",
    report:[
      "The Golden Eagle Trophy disappeared from the gym display case between 3:00 and 4:00 p.m. last Friday.",
      "The case was locked, but a spare key hangs in the equipment closet—a key almost everyone knows about.",
      "Three people were in the building that afternoon. Read their answers carefully."
    ],
    characters:[
      {id:"coach",name:"Coach Reyes",role:"P.E. Teacher",color:"#7fb3d5",image:"assets/character-case/coach-reyes.png",questions:[
        {q:"Where were you between 3:00 and 4:00 p.m.?",a:"In my office grading papers. I stepped out once, around 3:40, for coffee."},
        {q:"Did you notice anything near the trophy case?",a:"The case was already open a crack when I passed by at 3:40."},
        {q:"Who knew about the spare key?",a:"Pretty much every staff member—and some student aides too."}
      ]},
      {id:"janitor",name:"Mr. Okafor",role:"Custodian",color:"#e0a83a",image:"assets/character-case/mr-okafor.png",questions:[
        {q:"What were you doing this afternoon?",a:"Mopping the cafeteria, except for one trip to get supplies around 3:30."},
        {q:"Did you see anyone near the gym?",a:"Around 3:30, someone in a red hoodie slipped into the gym hallway."},
        {q:"Do you know whose hoodie that was?",a:"Half the debate team wears those red hoodies. It could have been anybody."}
      ]},
      {id:"priya",name:"Priya N.",role:"Class President",color:"#c9789a",image:"assets/character-case/priya.png",questions:[
        {q:"Where were you this afternoon?",a:"Practicing my speech in the gym until 3:15, then straight to the library."},
        {q:"Were you near the trophy case?",a:"The podium is right next to it, so yes."},
        {q:"Anything you have not mentioned?",a:"I wore my red debate hoodie because it was cold, and I moved the trophy off the podium to make room. I meant to put it back!"}
      ]}
    ],
    quiz:[
      {q:"What time did Coach Reyes notice the case looked different?",choices:["3:00","3:15","3:40","4:15"],correct:2,explain:"Coach Reyes said the case was already open a crack when she passed it at 3:40."},
      {q:"Who saw a person in a red hoodie near the gym?",choices:["Coach Reyes","Mr. Okafor","Priya","No one"],correct:1,explain:"Mr. Okafor saw someone in a red hoodie near the gym around 3:30."},
      {q:"Which clue connects Priya to the red-hoodie sighting?",choices:["She wore her red debate hoodie in the gym","She was outside the building all afternoon","She said that she did not own a hoodie","She stayed in the library for the entire day"],correct:0,explain:"Priya admitted that she wore her red debate hoodie while she practiced in the gym."}
    ]
  };
  function characterCaseFor(id){return D.items.find(item=>item.id===id)?.characterCase||CHARACTER_CASE}
  const mysteryActive={};
  const mysteryTimers={};
  const mysteryRecords={};
  function mysteryState(id){
    const s=window.st(id),caseData=characterCaseFor(id);let record=mysteryRecords[id]||s.dwMystery;
    if(!record||record.caseId!==caseData.id)record={caseId:caseData.id,interviewed:[],answers:{},notebook:""};
    mysteryRecords[id]=record;s.dwMystery=record;return {s,record};
  }
  function mysteryInitials(name){return String(name).split(/\s+/).map(word=>word[0]||"").join("").replace(/[^A-Z]/gi,"").slice(0,2).toUpperCase()}
  function fluencyHtml(x){
    const id=escHtml(x.id),caseData=characterCaseFor(x.id),{record}=mysteryState(x.id),interviewed=new Set(record.interviewed||[]),active=mysteryActive[x.id]||"",activeCharacter=caseData.characters.find(c=>c.id===active);
    const tiles=caseData.characters.map(c=>{
      const closed=interviewed.has(c.id),open=active===c.id,disabled=!!active&&!open;
      return `<div class="dw-case-witness${closed?" closed":""}${open?" open":""}${disabled?" disabled":""}">
        <div class="dw-case-avatar" style="background:${escHtml(c.color)}"><img src="${escHtml(c.image)}" alt="Cartoon portrait of ${escHtml(c.name)}"></div>
        <div class="dw-case-name">${escHtml(c.name)}</div><div class="dw-case-role">${escHtml(c.role)}</div>
        ${closed?`<div class="dw-case-status">🔒 Statement closed</div>`:open?`<div class="dw-case-status" id="dwCaseTimer-${id}">⏱ 1:00 remaining</div><div class="dw-case-statement">${c.questions.map(row=>`<div class="dw-case-q">${escHtml(row.q)}</div><div class="dw-case-a">${escHtml(row.a)}</div>`).join("")}<div class="dw-case-actions"><button type="button" class="resource" onclick="dwNvReadWitness('${id}','${escHtml(c.id)}')">🔊 READ ALOUD</button><button type="button" class="stage" onclick="dwNvFinishInterview('${id}','${escHtml(c.id)}')">END INTERVIEW</button></div></div>`:`<button type="button" class="resource dw-case-open" ${disabled?"disabled":""} onclick="dwNvStartInterview('${id}','${escHtml(c.id)}')">INTERVIEW</button>`}
      </div>`;
    }).join("");
    return `<div class="self-lesson dw-case-file">
      <div class="lesson-banner">🕵️ THE CHARACTER CASE FILES • ${escHtml(caseData.title||'NEW CASE')}</div>
      <div class="key-idea"><strong>Your mission:</strong> Read the case report, interview every witness, record useful clues, and decide what happened. Each statement closes after 60 seconds, so read for meaning and evidence.</div>
      <div class="dw-case-report">${caseData.report.map(line=>`<p>${escHtml(line)}</p>`).join("")}</div>
      <div class="dw-case-heading">Interview the witnesses</div>
      <div class="dw-case-witnesses">${tiles}</div>
      <div class="dw-case-progress">${interviewed.size} of ${caseData.characters.length} interviews complete</div>
      <label class="dw-case-notebook"><strong>Detective Notebook</strong><span>Record names, times, locations, actions, and statements that may matter.</span><textarea oninput="dwNvMysteryNotebook('${id}',this.value)" placeholder="Write your clues here…">${escHtml(record.notebook||"")}</textarea></label>
      <span class="mission-note">No video today • Read → Interview → Compare clues → Solve the case</span>
    </div>`;
  }
  function mysteryQuizHtml(x){
    const id=escHtml(x.id),caseData=characterCaseFor(x.id),{record}=mysteryState(x.id),ready=(record.interviewed||[]).length===caseData.characters.length,answers=record.answers||{};
    if(!ready)return `<div class="activity-feedback show">🔒 Interview all witnesses to unlock the case questions.</div>`;
    const questions=caseData.quiz.map((item,index)=>{
      const answer=answers[index],locked=answer===item.correct,answered=Number.isInteger(answer),correct=item.choices[item.correct];
      return `<div class="dw-case-quiz"><div class="dw-case-qnum">Question ${index+1} of ${caseData.quiz.length}</div><div class="dw-case-quizprompt">${escHtml(item.q)}</div><div class="dw-case-choices">${item.choices.map((choice,choiceIndex)=>{const picked=answer===choiceIndex,good=locked&&choiceIndex===item.correct,bad=answered&&picked&&!locked;return `<button type="button" class="dw-case-choice${good?" correct":""}${bad?" wrong":""}" ${locked?"disabled":""} onclick="dwNvMysteryAnswer('${id}',${index},${choiceIndex})">${escHtml(choice)}</button>`}).join("")}</div>${answered?`<div class="dw-case-explain"><strong>${locked?"✓ Correct":"Review the evidence"}:</strong> ${escHtml(item.explain)} <span class="dw-case-answer">Answer: ${escHtml(correct)}</span></div>`:""}</div>`;
    }).join("");
    const complete=caseData.quiz.every((item,index)=>answers[index]===item.correct);
    return `<div class="dw-case-check"><div class="dw-interactive-head"><div class="dw-interactive-title">Case Evidence Check</div><span class="dw-interactive-badge">${complete?"✓ COMPLETE":"3 QUESTIONS"}</span></div>${questions}</div>`;
  }
  function writingProgressHtml(x){
    const skills=writingReview(x);
    const chips=(skills.length?skills:["Use complete sentences","Reread and revise for clarity"]).map(v=>`<span style="display:inline-block;margin:3px;padding:6px 8px;border-radius:999px;background:#1d1533;border:1px solid #5d4477;color:#f0e7fb">${escHtml(v)}</span>`).join("");
    return `<div class="self-lesson">
      <div class="lesson-banner">✍️ PROGRESS CHECK • WRITING</div>
      <div class="key-idea"><strong>No new writing lesson today.</strong> Use the skills from your recent lessons independently. The list below is your review map, not an answer key.</div>
      <div style="margin-top:10px"><strong style="color:#ffe8a0">Recent skills</strong><div style="margin-top:6px">${chips}</div></div>
      <div class="example-box"><strong>Before you submit:</strong> Reread every sentence. Check that the sentence is complete, the punctuation matches the structure, and the writing does what the prompt asks.</div>
      <div class="remember"><strong>Progress-check rule:</strong> Show what you can do on your own first. Teacher review remains available if Dragonswood rejects a response you believe is correct.</div>
      <span class="mission-note">No video today • Review → Write → Revise</span>
    </div>`;
  }
  function assessmentHtml(x){
    return `<div class="self-lesson">
      <div class="lesson-banner">🛡️ QUARTER CHECK • PREVIOUSLY TAUGHT SKILLS</div>
      <div class="key-idea"><strong>This is an assessment, not a new lesson.</strong> Dragonswood will build the check only from questions attached to lessons you have already completed in this strand.</div>
      <div class="example-box"><strong>How to work:</strong> Read each question carefully, solve or reason independently, and use the lesson method you practiced. Questions are not generated from unrelated skills.</div>
      <div class="remember"><strong>Important:</strong> If Dragonswood cannot find enough verified prior questions, it will show fewer questions rather than inventing unrelated work.</div>
      <span class="mission-note">No video today • Prior lessons only</span>
    </div>`;
  }
  function performanceHtml(x){
    if(Array.isArray(x.quickWriteOptions)){
      const range=Array.isArray(x.quickWriteSentenceRange)?x.quickWriteSentenceRange:(x.grade==="I"?[3,5]:[5,7]);
      return `<div class="self-lesson">
        <div class="lesson-banner">✍️ QUICKWRITE ADVENTURE</div>
        <div class="key-idea"><strong>No video today.</strong> Choose one imaginative story starter below and continue the scene in your own words.</div>
        <div class="example-box"><strong>Your task:</strong> Write ${range[0]}–${range[1]} complete sentences that introduce action, show what happens next, and stay connected to your chosen starter.</div>
        <div class="remember"><strong>Before you finish:</strong> Reread for complete sentences, clear sequence, capitalization, and punctuation.</div>
        <span class="mission-note">No video today • Imagine → Draft → Reread</span>
      </div>`;
    }
    const req=String(x.requirement||"").replace(/\n+/g," ").replace(/\s+/g," ").trim();
    return `<div class="self-lesson">
      <div class="lesson-banner">🏰 PERFORMANCE MISSION</div>
      <div class="key-idea"><strong>No new lesson today.</strong> This mission is for using, presenting, or sharing work you have already prepared.</div>
      <div class="example-box"><strong>Your task:</strong> ${escHtml(req||"Present or share your completed work clearly, then reflect on one choice you made.")}</div>
      <div class="remember"><strong>Before you finish:</strong> Make sure your work is complete, understandable to your audience, and reflects the revisions you already made.</div>
      <span class="mission-note">No video today • Prepare → Share → Reflect</span>
    </div>`;
  }
  function richLessonHtml(x,originalRender){
    let base=null;
    try{base=window.__DW_NO_VIDEO_ORIGINALS.miniLessonFor(x)}catch(e){}
    if(!base)return originalRender(x);
    const generic=/briefing/i.test(base.title||"");
    const teach=base.idea||"Study the assigned concept and connect it to the task.";
    const example=base.example||"Work through one example and explain why each step or piece of evidence matters.";
    const remember=base.remember||"Explain how you know, not only what answer you chose.";
    const source=String(x.requirement||"").replace(/\n+/g," ").replace(/\s+/g," ").trim();
    return `<div class="self-lesson">
      <div class="lesson-banner">📖 LEARN IT HERE • ${escHtml(base.title||"Dragonswood Lesson")}</div>
      <div class="key-idea"><strong>Today you will learn:</strong> ${escHtml(objectiveFor(x,"lesson"))}</div>
      <div style="margin-top:10px" class="key-idea"><strong>Teach It:</strong> ${escHtml(teach)}</div>
      <div class="example-box"><strong>Watch the thinking:</strong> ${escHtml(example)}</div>
      <div style="margin-top:10px;padding:10px;border:1px solid #3d2a59;border-radius:8px;background:#0b0819;color:#eee8f8"><strong style="color:#ffe8a0">Try one with me:</strong> Before you move on, explain what rule, clue, model, or evidence you would use first and why.</div>
      ${generic&&source?`<div style="margin-top:10px;color:#c9bee0"><strong>Mission context:</strong> ${escHtml(source)}</div>`:""}
      <div class="remember"><strong>Remember:</strong> ${escHtml(remember)}</div>
      <span class="mission-note">No video today • Teach → Model → Try → Apply</span>
    </div>`;
  }

  const timerStarts={};
  window.dwNvStartFluency=function(id){
    timerStarts[id]=performance.now();
    const el=document.getElementById("nvFluency-"+id);if(el)el.textContent="Reading…";
  };
  window.dwNvStopFluency=function(id){
    const start=timerStarts[id],el=document.getElementById("nvFluency-"+id);
    if(!start){if(el)el.textContent="Press START first";return}
    const secs=Math.max(1,Math.round((performance.now()-start)/1000));delete timerStarts[id];
    if(el)el.textContent=`Reading time: ${Math.floor(secs/60)}:${String(secs%60).padStart(2,"0")}`;
  };

  function saveMystery(id,record,reason){
    mysteryRecords[id]=record;
    const s=window.st(id);s.dwMystery=record;
    if(window.S&&window.S.items)window.S.items[id]=s;
    else if(typeof window.saveCurriculumItemState==="function")window.saveCurriculumItemState(id,s);
    window.save();
    if(reason)window.DWCurriculumRenderCoordinator?.request(reason);
  }
  window.dwNvStartInterview=function(id,characterId){
    const {record}=mysteryState(id);
    if(mysteryActive[id]||(record.interviewed||[]).includes(characterId))return;
    const character=characterCaseFor(id).characters.find(c=>c.id===characterId);if(!character)return;
    mysteryActive[id]=characterId;
    clearInterval(mysteryTimers[id]);
    let remaining=60;
    window.DWCurriculumRenderCoordinator?.request("character-interview-open");
    mysteryTimers[id]=setInterval(()=>{
      remaining--;
      const el=document.getElementById(`dwCaseTimer-${id}`);
      if(el){el.textContent=`⏱ 0:${String(Math.max(0,remaining)).padStart(2,"0")} remaining`;if(remaining<=10)el.classList.add("urgent")}
      if(remaining<=0)window.dwNvFinishInterview(id,characterId);
    },1000);
  };
  window.dwNvFinishInterview=function(id,characterId){
    if(!characterCaseFor(id).characters.some(character=>character.id===characterId))return;
    clearInterval(mysteryTimers[id]);delete mysteryTimers[id];delete mysteryActive[id];
    if("speechSynthesis" in window)window.speechSynthesis.cancel();
    const {record}=mysteryState(id);
    record.interviewed=Array.from(new Set([...(record.interviewed||[]),characterId]));
    saveMystery(id,record);
    if(typeof window.render==="function")window.render();
    else window.DWCurriculumRenderCoordinator?.request("character-interview-finished");
  };
  window.dwNvReadWitness=function(id,characterId){
    const character=characterCaseFor(id).characters.find(c=>c.id===characterId);if(!character||!("speechSynthesis" in window))return;
    window.speechSynthesis.cancel();
    const speech=new SpeechSynthesisUtterance(character.questions.map(row=>`${row.q} ${row.a}`).join(" "));
    speech.rate=.92;window.speechSynthesis.speak(speech);
  };
  window.dwNvMysteryNotebook=function(id,value){
    const {record}=mysteryState(id);record.notebook=String(value||"").slice(0,3000);saveMystery(id,record);
  };
  window.dwNvMysteryAnswer=function(id,index,choice){
    const {record}=mysteryState(id);
    const caseData=characterCaseFor(id);if((record.interviewed||[]).length!==caseData.characters.length||record.answers?.[index]===caseData.quiz[index]?.correct)return;
    record.answers={...(record.answers||{}),[index]:choice};saveMystery(id,record,"character-case-answer");
  };

  let tries=0;
  function install(){
    const required=["render","vid","friendlyTitle","miniLessonFor","renderMiniLesson","activityFor","kidIntro","card","grouped","autoQuestionsFor","autoPassed","renderAutoPractice","activitySpec","validateActivity","checkActivity","supportMetadataRow"];
    if(required.some(k=>typeof window[k]!=="function")||!window.DWCurriculumRenderCoordinator){
      if(++tries<80)setTimeout(install,25);
      return;
    }
    if(window.__DW_NO_VIDEO_LESSON_ENGINE_V2__)return;
    window.__DW_NO_VIDEO_LESSON_ENGINE_V2__=true;

    const O=window.__DW_NO_VIDEO_ORIGINALS={
      friendlyTitle:window.friendlyTitle,
      miniLessonFor:window.miniLessonFor,
      renderMiniLesson:window.renderMiniLesson,
      activityFor:window.activityFor,
      kidIntro:window.kidIntro,
      card:window.card,
      grouped:window.grouped,
      autoQuestionsFor:window.autoQuestionsFor,
      autoPassed:window.autoPassed,
      renderAutoPractice:window.renderAutoPractice,
      activitySpec:window.activitySpec,
      validateActivity:window.validateActivity,
      checkActivity:window.checkActivity,
      supportMetadataRow:window.supportMetadataRow
    };

    window.checkActivity=async function(id){
      const x=D.items.find(item=>item.id===id);
      if(!x||!noVideo(x)||classify(x)!=="fluency")return O.checkActivity(id);
      const written=String(document.getElementById("actText-"+id)?.value||"").trim();
      const {record}=mysteryState(id);
      const caseData=characterCaseFor(id),allInterviews=(record.interviewed||[]).length>=caseData.characters.length;
      const allCaseQuestions=caseData.quiz.every((item,index)=>Object.prototype.hasOwnProperty.call(record.answers||{},index)&&String(record.answers[index]??"").trim()!=="");
      const finished=allInterviews&&allCaseQuestions&&written.length>0;
      let outcome;
      try{outcome=await O.checkActivity(id)}
      finally{
        if(finished){
          const s=window.st(id);
          s.caseCompletionLocked=true;
          s.caseCompletedAt=s.caseCompletedAt||new Date().toISOString();
          s.practiced=true;
          s.practiceEvidence=written;
          s.lastSubmittedCaseTheory=written;
          delete s.activityDraftResponse;delete s.activityDraftChoice;
          if(typeof window.saveCurriculumItemState==="function")window.saveCurriculumItemState(id,s);
          else window.save();
          window.clearCurriculumDraft?.(id);
          window.DWCurriculumRenderCoordinator?.request("character-case-completion-locked");
        }
      }
      return outcome;
    };

    if(!document.getElementById("dwNoVideoLayoutV56231")){
      const style=document.createElement("style");
      style.id="dwNoVideoLayoutV56231";
      style.textContent=`
        .grid > .quest.dw-no-video{align-self:start;height:auto;min-height:0}
        .quest.dw-no-video{align-self:start}
        .dw-case-avatar{width:82px;height:82px;overflow:hidden}.dw-case-avatar img{width:100%;height:100%;object-fit:cover;display:block}
        .dw-case-file{--case-gold:#ffd75f;--case-cyan:#62e7ff}.dw-case-report{margin:12px 0;padding:12px 14px;border:1px solid #67518a;border-left:4px solid var(--case-gold);border-radius:9px;background:#0b0a18}.dw-case-report p{margin:5px 0;line-height:1.5}.dw-case-heading{margin:14px 0 8px;color:#ffe8a0;font-weight:900;font-size:1.08rem}.dw-case-witnesses{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}.dw-case-witness{padding:12px;border:1px solid #5a4777;border-radius:12px;background:#120d21;text-align:center;transition:.2s}.dw-case-witness.open{grid-column:1/-1;text-align:left;border-color:var(--case-cyan);box-shadow:0 0 0 1px #62e7ff44}.dw-case-witness.closed{opacity:.72}.dw-case-witness.disabled{opacity:.45}.dw-case-avatar{display:grid;place-items:center;width:48px;height:48px;margin:0 auto 7px;border:2px solid #fff8;border-radius:50%;color:#090714;font-weight:1000}.dw-case-witness.open .dw-case-avatar{margin-left:0}.dw-case-name{font-weight:1000;color:#fff0b4}.dw-case-role,.dw-case-status{margin-top:3px;color:#c9bddc;font-size:.88rem}.dw-case-status{color:var(--case-cyan);font-weight:800}.dw-case-status.urgent{color:#ff7b8d}.dw-case-open{margin-top:10px}.dw-case-statement{margin-top:10px}.dw-case-q{margin-top:10px;color:#ffe8a0;font-weight:900}.dw-case-a{margin-top:3px;padding:8px 10px;border-radius:7px;background:#090716;line-height:1.45}.dw-case-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.dw-case-progress{margin:10px 0;color:var(--case-cyan);font-weight:900}.dw-case-notebook{display:grid;gap:5px;margin-top:12px}.dw-case-notebook span{color:#c9bddc;font-size:.9rem}.dw-case-notebook textarea{min-height:90px;padding:10px;border:1px solid #60447f;border-radius:8px;background:#090716;color:#fff;font:inherit}.dw-case-check{display:grid;gap:12px}.dw-case-quiz{padding:13px;border:1px solid #55416f;border-radius:10px;background:#0e0a1b}.dw-case-qnum{color:#61e8ff;font-size:.78rem;font-weight:900;text-transform:uppercase}.dw-case-quizprompt{margin:5px 0 10px;color:#fff0b4;font-weight:900}.dw-case-choices{display:grid;gap:7px}.dw-case-choice{text-align:left;padding:10px;border:1px solid #604d78;border-radius:8px;background:#181029;color:#fff;font:inherit}.dw-case-choice:not(:disabled):hover{border-color:#62e7ff}.dw-case-choice.correct{border-color:#2ed89c;background:#0b493a}.dw-case-choice.wrong{border-color:#ff6f8d;background:#4b1527}.dw-case-explain{margin-top:9px;color:#dcd3e8}.dw-case-answer{color:#ffe37f;font-weight:900}
      `;
      document.head.appendChild(style);
    }

    window.supportMetadataRow=function(x){
      if(noVideo(x)&&classify(x)==="cursive-only")return true;
      return O.supportMetadataRow(x);
    };

    window.friendlyTitle=function(x){
      if(!noVideo(x))return O.friendlyTitle(x);
      if(x.quickWriteDirect===true)return "Quickwrite";
      const type=classify(x);
      if(type==="word-progress")return "Word Study Progress Check";
      if(type==="fluency")return "The Character Case Files";
      if(type==="writing-progress")return "Writing Progress Check";
      if(type==="assessment")return /core assessment/i.test(textOf(x))?"Core Assessment":"Quarter Assessment";
      if(type==="performance")return "Publish & Share";
      if(type==="word-lesson"){const w=currentWordStudy(x);return w?`Word Mission: ${w.word}`:"Word Study Mission";}
      return O.friendlyTitle(x);
    };

    window.kidIntro=function(x){
      if(!noVideo(x))return O.kidIntro(x);
      if(x.quickWriteDirect===true)return "";
      const type=classify(x);
      if(type==="word-progress")return "No new lesson today. Review the word-study targets below, then show what you can do independently.";
      if(type==="fluency")return "No video today. Read the case report, interview all three witnesses before their statements close, then use the evidence to solve the case.";
      if(type==="writing-progress")return "No new writing lesson today. Review the recent skills below, then complete the writing check independently.";
      if(type==="assessment")return "This is a check of previously taught skills. Dragonswood will use only verified questions from earlier lessons in this strand.";
      if(type==="performance")return Array.isArray(x.quickWriteOptions)?"No video today. Choose one story starter, imagine what happens next, and continue the scene in your own words.":"No new lesson today. Use the mission brief below to prepare, share your work, and reflect.";
      if(type==="word-lesson"){const w=currentWordStudy(x);return w?`No video today. Learn the word “${w.word}” here in Dragonswood, then prove what its parts mean and use it correctly.`:"No video today. Complete the word-study lesson below.";}
      return "Learn today's skill here in Dragonswood. Study the model, try the guided thinking step, then complete the mission.";
    };

    window.renderMiniLesson=function(x){
      if(!noVideo(x))return O.renderMiniLesson(x);
      if(x.quickWriteDirect===true)return "";
      const type=classify(x);
      if(type==="word-progress")return wordProgressHtml(x);
      if(type==="fluency")return fluencyHtml(x);
      if(type==="writing-progress")return writingProgressHtml(x);
      if(type==="assessment")return assessmentHtml(x);
      if(type==="performance")return performanceHtml(x);
      if(type==="word-lesson")return wordLessonHtml(x);
      return richLessonHtml(x,O.renderMiniLesson);
    };

    window.activityFor=function(x){
      if(!noVideo(x))return O.activityFor(x);
      const type=classify(x);
      if(type==="word-progress"){
        const words=recentWordStudy(x).map(v=>v.word).filter(Boolean);
        return `Choose one reviewed word${words.length?` (${words.join(", ")})`:""} and explain how its root helps you understand its meaning. Then use the word correctly in a complete sentence.`;
      }
      if(type==="fluency")return x.characterCase?.applicationPrompt||"Who moved the Golden Eagle Trophy, and which two clues from the witness interviews prove what happened? Explain your case theory in complete sentences.";
      if(type==="writing-progress"){
        const review=writingReview(x).join(" ").toLowerCase();
        if(/fanboys|compound sentence|compound sentences|conjunction/.test(review))return "Write one correct compound sentence using a comma plus a FANBOYS conjunction. Then add a second sentence that works as a clear conclusion or wrap-up.";
        if(/comma.*series|commas in a series/.test(review))return "Write one sentence with a series of at least three items and use commas correctly. Then reread and correct any capitalization or ending punctuation.";
        if(/opinion/.test(review))return "Write a clear opinion and support it with at least one specific reason. Then add a concluding sentence.";
        return "Write a short example that demonstrates at least two skills from the recent-skills review above. Then reread and revise one part for clarity.";
      }
      if(type==="assessment")return "After you finish the check questions, explain one answer you were confident about and name the rule, evidence, or strategy that helped you answer it.";
      if(type==="performance")return Array.isArray(x.quickWriteOptions)?"Choose one story starter below and continue the story in the required number of complete sentences.":"After you present or share your work, write 2 sentences: what you shared and one revision, speaking choice, or detail that made the final work stronger.";
      if(type==="word-lesson"){
        const w=currentWordStudy(x);
        if(w)return `${w.row.application?`${w.row.application} `:""}Then explain how the root or another word part helps with the meaning of “${w.word},” and use “${w.word}” correctly in your own complete sentence.`;
      }
      return O.activityFor(x);
    };

    window.autoQuestionsFor=function(x){
      if(!noVideo(x))return O.autoQuestionsFor(x);
      const type=classify(x);
      if(type==="fluency"||type==="writing-progress"||type==="performance")return [];
      if(type==="word-progress"){
        const sources=recentWordStudy(x).map(v=>v.item);
        const q=priorQuestions(x,6,false,sources);
        return q.length?q:[];
      }
      if(type==="progress"){
        const q=priorQuestions(x,6,false);
        return q.length?q:[];
      }
      if(type==="assessment"){
        const q=priorQuestions(x,8,true);
        return q.length?q:[];
      }
      if(type==="word-lesson"){
        let q=[];
        try{q=(O.autoQuestionsFor(x)||[]).filter(validPriorQuestion)}catch(e){q=[]}
        return q.length?q:wordLessonQuestions(x);
      }
      return O.autoQuestionsFor(x);
    };

    window.renderAutoPractice=function(x){
      if(!noVideo(x))return O.renderAutoPractice(x);
      if(x.quickWriteDirect===true)return "";
      const type=classify(x);
      if(type==="performance"&&Array.isArray(x.quickWriteOptions))return O.renderAutoPractice(x);
      if(type==="fluency")return mysteryQuizHtml(x);
      if(type==="writing-progress")return `<div class="activity-feedback show good">This is a writing performance check. Your evidence is the writing you produce below, not a fake multiple-choice quiz.</div>`;
      if(type==="performance")return `<div class="activity-feedback show good">This mission is based on presenting or sharing your work. Complete the reflection below after the performance.</div>`;
      let html=O.renderAutoPractice(x);
      if(type==="word-progress"||type==="progress")html=html.replace(/Practice •/g,"Progress Check •").replace(/Prove the lesson skill with fresh examples\./g,"Use only skills from the lessons you already completed.");
      if(type==="assessment")html=html.replace(/Practice •/g,"Assessment •").replace(/Prove the lesson skill with fresh examples\./g,"These questions come from earlier verified lessons in this strand.");
      return html;
    };

    window.activitySpec=function(x){
      if(!noVideo(x))return O.activitySpec(x);
      if(Array.isArray(x.quickWriteOptions))return O.activitySpec(x);
      const type=classify(x),prompt=window.activityFor(x);
      if(type==="fluency")return {kind:"explain",title:"Your Case Theory",prompt,minWords:x.grade==="K"?16:12,
        expectedAnswer:"Priya moved the trophy off the podium to make room and forgot to put it back.",
        sourceExcerpt:"Coach Reyes saw the trophy case open at 3:40. Mr. Okafor saw someone in a red hoodie enter the gym hallway around 3:30. Priya practiced beside the trophy case, wore her red debate hoodie, and admitted that she moved the trophy off the podium to make room and meant to put it back."};
      if(type==="word-progress")return {kind:"explain",title:"Word Meaning Proof",prompt,minWords:8};
      if(type==="writing-progress"){
        const review=writingReview(x).join(" ").toLowerCase();
        if(/fanboys|compound sentence|compound sentences|conjunction/.test(review))return {kind:"fanboys",title:"Writing Progress Check",prompt};
        if(/comma.*series|commas in a series/.test(review))return {kind:"commas",title:"Writing Progress Check",prompt};
        if(/opinion/.test(review))return {kind:"opinion",title:"Writing Progress Check",prompt};
        return {kind:"explain",title:"Writing Progress Check",prompt,minWords:12};
      }
      if(type==="assessment")return {kind:"explain",title:"Assessment Reflection",prompt,minWords:8};
      if(type==="performance")return {kind:"explain",title:"Performance Reflection",prompt,minWords:10};
      if(type==="word-lesson")return {kind:"explain",title:"Word Meaning & Use",prompt,minWords:10};
      return O.activitySpec(x);
    };

    window.validateActivity=function(x){
      if(!noVideo(x))return O.validateActivity(x);
      if(Array.isArray(x.quickWriteOptions))return O.validateActivity(x);
      const type=classify(x),id=x.id,written=(document.getElementById("actText-"+id)?.value||"").trim();
      if(window.systemAuthoredResponse?.(x,written))return {ok:false,reviewable:false,msg:"Answer in your own words instead of copying Dragonswood's directions or question."};
      const words=written.split(/\s+/).filter(Boolean);
      if(type==="fluency"){
        const {record}=mysteryState(id);
        const caseData=characterCaseFor(id);if((record.interviewed||[]).length<caseData.characters.length)return {ok:false,reviewable:false,msg:"Interview all witnesses before submitting your case theory."};
        if(!caseData.quiz.every((item,index)=>record.answers?.[index]===item.correct))return {ok:false,code:"case_questions_incomplete",aiEligible:false,reviewable:false,msg:"Correct all three Case Evidence Check questions first."};
        const min=x.grade==="K"?16:12;
        if(words.length<min)return {ok:false,msg:`Explain your theory with at least ${min} words.`};
        if(!/\bpriya\b/i.test(written))return {ok:false,msg:"Name the person your evidence identifies."};
        const clues=[/red\s+(?:debate\s+)?hoodie/i,/mov(?:e|ed|ing)\s+(?:the\s+)?trophy|trophy.{0,30}podium|make room/i,/\b(?:gym|podium|trophy case)\b/i,/\bforgot\b|put (?:it|the trophy) back|\blibrary\b/i];
        if(clues.filter(pattern=>pattern.test(written)).length<2)return {ok:false,msg:"Use at least two different interview clues, such as a time, clothing, location, or action, to prove your theory."};
        return {ok:false,code:"needs_case_evidence_grade",aiEligible:true,msg:"Dragonswood is checking whether your theory matches the witness evidence."};
      }
      if(type==="word-progress"){
        const review=recentWordStudy(x);
        if(/\bwhich (?:previously learned )?target word correctly completes the sentence\b|_{3,}|\bchoose (?:one|the) (?:reviewed |lesson'?s )?target word\b/i.test(written)){
          return {ok:false,reviewable:false,msg:"Answer in your own words instead of copying the question. Explain the root connection, then write your own complete sentence using one reviewed word."};
        }
        if(words.length<10)return {ok:false,msg:"Explain the root connection and use one reviewed word in a complete sentence."};
        const match=review.find(v=>v.word&&new RegExp(`\\b${String(v.word).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\b`,"i").test(written));
        if(!match)return {ok:false,msg:"Use one of the reviewed target words in your explanation and sentence."};
        const roots=String(match.root||"").split("/").map(v=>v.trim()).filter(Boolean);
        const meaning=rootMeaning(match.root).toLowerCase().split(/[^a-z]+/).filter(v=>v.length>3);
        const hasRoot=roots.some(r=>new RegExp(`\\b${r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\b`,"i").test(written));
        const hasMeaning=meaning.some(v=>new RegExp(`\\b${v.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\b`,"i").test(written));
        if(!hasRoot&&!hasMeaning)return {ok:false,msg:"Explain what the reviewed root contributes to the word's meaning."};
        return {ok:true};
      }
      if(type==="word-lesson"){
        const w=currentWordStudy(x);
        if(words.length<10)return {ok:false,msg:"Explain the word parts and use the target word in a complete sentence."};
        if(w&&!new RegExp(`\\b${String(w.word).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\b`,"i").test(written))return {ok:false,msg:`Use the target word “${w.word}” in your response.`};
        return {ok:true};
      }
      if(type==="assessment"||type==="performance"){
        const min=type==="assessment"?8:10;
        if(words.length<min)return {ok:false,msg:`Give a complete reflection of at least ${min} words.`};
        return {ok:true};
      }
      return O.validateActivity(x);
    };

    window.autoPassed=function(x,s=window.st(x.id)){
      if(!noVideo(x)||classify(x)!=="fluency")return O.autoPassed(x,s);
      const answers=s.dwMystery?.answers||{};
      return characterCaseFor(x.id).quiz.every((item,index)=>answers[index]===item.correct);
    };

    window.card=function(x){
      let html=O.card(x);
      if(!noVideo(x))return html;
      const type=classify(x);
      const timingLabel=x.quickWriteDirect===true?"Quickwrite":{
        "word-progress":"Review included",
        "progress":"Review included",
        "writing-progress":"Review included",
        "fluency":"Mystery case + witness interviews included",
        "assessment":"Prior-skill assessment included",
        "performance":"Performance brief included"
      }[type];
      html=html.replace('class="frame quest ',`class="frame quest dw-no-video dw-nv-${type} `);
      if(timingLabel)html=html.replace(/Dragonswood lesson included/g,timingLabel);
      if(x.quickWriteDirect===true){
        const bodyMarker='<div class="mission-body">',quickMarker='<div class="step"><strong>2. Standard Check + Application</strong>';
        const bodyStart=html.indexOf(bodyMarker),quickStart=html.indexOf(quickMarker,bodyStart+bodyMarker.length);
        if(bodyStart>=0&&quickStart>=0)html=html.slice(0,bodyStart+bodyMarker.length)+html.slice(quickStart);
        return html.replace(quickMarker,'<div class="step dw-quickwrite-only"><strong>Quickwrite</strong>');
      }
      if(type==="word-progress"||type==="progress"||type==="writing-progress"||type==="assessment"){
        return html.replace("1. Learn It in Dragonswood","1. Review What You Know").replace("Everything needed for this lesson is here.","Everything needed for this check is here.");
      }
      if(type==="fluency")return html.replace("1. Learn It in Dragonswood","1. Open the Case File").replace("Everything needed for this lesson is here.","The case report and witness interviews are below.");
      if(type==="performance")return Array.isArray(x.quickWriteOptions)?html.replace("1. Learn It in Dragonswood","1. Quickwrite Mission").replace("Everything needed for this lesson is here.","Choose a story starter below and continue the adventure."):html.replace("1. Learn It in Dragonswood","1. Mission Brief").replace("Everything needed for this lesson is here.","Your performance directions are below.");
      if(type==="word-lesson")return html.replace("1. Learn It in Dragonswood","1. Learn the Word in Dragonswood").replace("Everything needed for this lesson is here.","Your complete word lesson is below.");
      return html;
    };

    window.grouped=function(title,desc,a,byDay=false){
      if(Array.isArray(a)&&a.length&&/Current Quest/i.test(title)&&a.some(noVideo)){
        desc=a.every(noVideo)
          ?String(desc||"").replace("Watch the lesson, pass the standard check, then apply what you learned.","Complete today's Dragonswood lesson or progress check, then apply what you know.")
          :String(desc||"").replace("Watch the lesson, pass the standard check, then apply what you learned.","Complete each mission using the lesson format shown. Some missions use a required video; others teach or check the skill directly in Dragonswood.");
      }
      return O.grouped(title,desc,a,byDay);
    };

    window.DWCurriculumRenderCoordinator.request("no-video-installed");
  }
  setTimeout(install,0);
})();
