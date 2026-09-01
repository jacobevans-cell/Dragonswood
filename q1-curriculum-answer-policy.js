/* ==========================================================================
   DRAGONSWOOD CURRICULUM ANSWER INTEGRITY v56.25.3
   Separates selecting an answer from submitting it and applies attempt rules
   by academic purpose.

   Philosophy:
   - interactive / guided warm-ups: keep their existing retry-friendly behavior
   - normal independent practice + video checks: two submitted tries per question
   - progress monitors: one locked submission per question per check
   - assessments: one locked submission per question; correctness is hidden until
     the whole assessment question set is submitted
   - failed checks can be retried only as a fresh round after review
   - first-round evidence is retained in history
   - completed prior work is grandfathered and never reopened

   This file does NOT alter required-video playback, watch tracking, R2 media,
   video reflection, lesson rendering, AI rescue, or teacher-review transport.
   ========================================================================== */
(function(){
  const D=window.DRAGONSWOOD_DATA;
  if(!D||!Array.isArray(D.items))return;
  if(!/curriculum-quest\.html$/i.test(location.pathname)&&!document.getElementById("curriculumTabs"))return;

  const VERSION="56.25.3";
  const norm=v=>String(v||"").trim().toLowerCase().replace(/\s+/g," ");
  const textOf=x=>`${x?.resourceName||""} ${x?.requirement||""} ${x?.strand||""}`.toLowerCase();
  const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const questionKey=q=>norm(q?.prompt||"");
  const POLICY_KEY="dwAnswerPolicy";

  function policyKind(x){
    const t=textOf(x),req=norm(x?.requirement||""),strand=norm(x?.strand||"");
    const teacherMeta=/teacher created|anecdotal|assessment\s*\/?\s*check point/.test(strand);
    if(!teacherMeta&&(
      /\bflavor assessment\b|\bcore assessment\b|\bquarter assessment\b/.test(t)||
      /^(assessment|benchmark assessment|unit assessment)$/.test(req)
    ))return "assessment";
    if(/\bprogress monitor(?:ing)?\b/.test(t))return "progress";
    return "practice";
  }
  function policySettings(x){
    const kind=policyKind(x);
    if(kind==="assessment")return {kind,maxAttempts:1,deferFeedback:true,button:"LOCK IN ANSWER",freshLabel:"START FRESH RETAKE"};
    if(kind==="progress")return {kind,maxAttempts:1,deferFeedback:false,button:"LOCK IN ANSWER",freshLabel:"START FRESH CHECK"};
    return {kind,maxAttempts:2,deferFeedback:false,button:"CHECK ANSWER",freshLabel:"START FRESH PRACTICE"};
  }
  function submissionOutcome(settings,attemptNumber,correct){
    if(correct)return {locked:true,correct:true,feedback:"correct"};
    const locked=attemptNumber>=settings.maxAttempts;
    return {locked,correct:false,feedback:settings.deferFeedback?"deferred":locked?"needs-review":"retry"};
  }
  function gradingEqual(q,value){
    if(!q)return false;
    try{
      if(window.DWGrading?.questionAnswerEquivalent)return !!window.DWGrading.questionAnswerEquivalent(q,value);
      if(window.DWGrading?.answersEquivalent)return !!window.DWGrading.answersEquivalent(q.answer,value);
    }catch(e){}
    return String(q.answer)===String(value);
  }
  function hintFor(x){
    const kind=window.__DW_CURRICULUM_INTERACTION_TEST__?.itemKind?.(x)||"";
    if(kind==="morph"||kind==="morph-progress"||x?.strand==="Foundational Skills")return "Review the root or word-family card above. Use the root meaning before the other word parts.";
    if(x?.subject==="Math")return "Return to the worked method. Recheck the operation, place value, or step where your reasoning changed.";
    if(x?.subject==="Science")return "Return to the model or evidence. Trace the cause, effect, observation, or system connection before choosing again.";
    if(x?.strand==="Reading")return "Return to the text clue. Decide what the detail actually proves before choosing again.";
    if(x?.strand==="Writing")return "Return to the writing rule or model. Check the sentence structure and punctuation before choosing again.";
    return "Review the lesson model above, then use the rule or evidence instead of guessing.";
  }
  function validQuestion(q){
    return !!(q&&q.prompt&&Array.isArray(q.choices)&&q.choices.length>=2&&q.answer!==undefined&&q.answer!==null);
  }
  function uniqueQuestions(rows){
    const out=[],seen=new Set();
    for(const q of rows||[]){
      if(!validQuestion(q))continue;
      const key=questionKey(q);if(!key||seen.has(key))continue;
      seen.add(key);out.push(q);
    }
    return out;
  }
  function generatorQuestions(x,count){
    try{
      if(typeof window.dwCurricPractice==="function")return uniqueQuestions(window.dwCurricPractice(x,count)||[]);
    }catch(e){}
    return [];
  }
  function requirementWordRoot(item){
    const lines=String(item?.requirement||"").split(/\r?\n/).map(v=>String(v||"").trim()).filter(Boolean);
    let word="",root="";
    for(let i=0;i<lines.length-1;i++){
      if(/^word:?$/i.test(lines[i]))word=lines[i+1].trim();
      if(/morph|moph/i.test(lines[i]))root=lines[i+1].trim();
    }
    return {word,root};
  }
  function morphRowForItem(item){
    const wr=requirementWordRoot(item);if(!wr.word)return null;
    const row=(D.morphology||[]).find(m=>m.grade===item.grade&&norm(m.word)===norm(wr.word))||null;
    return row?{item,row,word:wr.word,root:wr.root||row.root||""}:null;
  }
  function cleanMorphText(v){
    return String(v||"").trim().replace(/^n-\s*=/i,"in- =").replace(/^e-\s*=/i,"re- =");
  }
  function taughtWordChoices(checkItem,currentWord){
    const words=[];
    const items=D.items.filter(i=>i.grade===checkItem.grade&&i.subject==="HUM"&&i.strand==="Foundational Skills"&&Number(i.day)<Number(checkItem.day))
      .sort((a,b)=>Number(b.day)-Number(a.day));
    for(const item of items){
      const wr=requirementWordRoot(item),w=String(wr.word||"").trim();
      if(!w||norm(w)===norm(currentWord)||words.some(v=>norm(v)===norm(w)))continue;
      words.push(w);if(words.length>=8)break;
    }
    return words;
  }
  function rotateChoices(answer,decoys,seedText=""){
    const all=[String(answer),...decoys.map(String).filter(v=>String(v)!==String(answer))].filter(Boolean).slice(0,4);
    while(all.length<4)all.push(`choice ${all.length+1}`);
    const seed=[...String(seedText)].reduce((n,ch)=>n+ch.charCodeAt(0),0)%all.length;
    return all.slice(seed).concat(all.slice(0,seed));
  }
  function derivedMorphQuestions(sourceItem,checkItem){
    const m=morphRowForItem(sourceItem);if(!m)return [];
    const word=m.word,row=m.row,build=cleanMorphText(row.morphological),others=taughtWordChoices(checkItem,word),out=[];
    if(build){
      const decoys=[
        `The word “${word}” has no meaningful parts and must only be memorized.`,
        `The ending makes “${word}” mean the opposite of its actual meaning.`,
        `The spelling of “${word}” is unrelated to its meaning.`
      ];
      out.push({source:"answer-integrity-derived",sourceItemId:sourceItem.id,skillId:"morph.word-parts",
        prompt:`Which explanation best shows how “${word}” is built and what it means?`,
        answer:build,choices:rotateChoices(build,decoys,sourceItem.id+"build")});
      out.push({source:"answer-integrity-derived",sourceItemId:sourceItem.id,skillId:"morph.identify-word",
        prompt:`Which previously learned word matches this word-parts explanation? ${build}`,
        answer:word,choices:rotateChoices(word,others.slice(0,3),sourceItem.id+"identify")});
    }
    const syn=String(row.syntactic||"").split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
    const escaped=String(word).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    const wordRe=new RegExp(`\\b${escaped}\\b`,"i");
    const example=syn.find(v=>wordRe.test(v));
    if(example){
      const blanked=example.replace(wordRe,"_____");
      out.push({source:"answer-integrity-derived",sourceItemId:sourceItem.id,skillId:"morph.context",
        prompt:`Which previously learned target word correctly completes the sentence? ${blanked}`,
        answer:word,choices:rotateChoices(word,others.slice(0,3),sourceItem.id+"context")});
    }
    const roleRaw=syn.find(v=>/^(noun|verb|adjective|adverb)(?:\b|\s|\()/i.test(v));
    if(roleRaw){
      const match=roleRaw.match(/^(noun|verb|adjective|adverb)/i),role=match&&match[1];
      if(role){
        const answer=role.charAt(0).toUpperCase()+role.slice(1).toLowerCase();
        out.push({source:"answer-integrity-derived",sourceItemId:sourceItem.id,skillId:"morph.syntax",
          prompt:`In the lesson for “${word},” what part of speech is the target word used as?`,
          answer,choices:rotateChoices(answer,["Noun","Verb","Adjective","Adverb"].filter(v=>v.toLowerCase()!==role.toLowerCase()),sourceItem.id+"syntax")});
      }
    }
    return uniqueQuestions(out);
  }
  function priorQuestionBank(x,wide){
    const minDay=wide?0:Math.max(0,Number(x.day)-7);
    const prior=D.items.filter(i=>
      i.grade===x.grade&&i.subject===x.subject&&String(i.strand||"")===String(x.strand||"")&&
      Number(i.day)<Number(x.day)&&Number(i.day)>=minDay
    ).sort((a,b)=>Number(b.day)-Number(a.day));
    const out=[],seen=new Set();
    for(const item of prior){
      const rows=[...generatorQuestions(item,8)];
      if(x.subject==="HUM"&&x.strand==="Foundational Skills")rows.push(...derivedMorphQuestions(item,x));
      for(const q of uniqueQuestions(rows)){
        const key=questionKey(q);if(seen.has(key))continue;
        seen.add(key);out.push(q);
      }
    }
    return out;
  }
  let ORIGINALS=null;
  function baseQuestions(x){
    try{return uniqueQuestions(ORIGINALS?.autoQuestionsFor?.(x)||[])}catch(e){return []}
  }
  function freshQuestionBank(x){
    const settings=policySettings(x),base=baseQuestions(x);
    let extra=[];
    if(settings.kind==="progress")extra=priorQuestionBank(x,false);
    else if(settings.kind==="assessment")extra=priorQuestionBank(x,true);
    else extra=generatorQuestions(x,Math.max(16,base.length*4));
    return uniqueQuestions([...base,...extra]);
  }
  function usedPrompts(p){
    const used=new Set();
    for(const h of p?.history||[])for(const prompt of h.prompts||[])used.add(norm(prompt));
    return used;
  }
  function pickRoundQuestions(x,p){
    const base=baseQuestions(x),count=base.length;
    if(!count)return [];
    if(!p||Number(p.round||0)===0)return base;
    const bank=freshQuestionBank(x),used=usedPrompts(p);
    const unseen=bank.filter(q=>!used.has(questionKey(q)));
    const seen=bank.filter(q=>used.has(questionKey(q)));
    const pool=[...unseen,...seen];
    if(!pool.length)return base;
    const start=((Number(p.round||0)-1)*count)%pool.length;
    const picked=[];
    for(let n=0;n<pool.length&&picked.length<count;n++){
      const q=pool[(start+n)%pool.length];
      if(!picked.some(v=>questionKey(v)===questionKey(q)))picked.push(q);
    }
    for(const q of base){
      if(picked.length>=count)break;
      if(!picked.some(v=>questionKey(v)===questionKey(q)))picked.push(q);
    }
    return picked.slice(0,count);
  }
  function stateFor(x,create=true){
    const s=st(x.id);
    let p=s[POLICY_KEY];
    if(!p&&create){
      p={
        version:VERSION,round:0,attempts:{},locked:{},submitted:{},drafts:{},
        results:{},revealed:false,history:[],grandfathered:false,migrated:false
      };
      s[POLICY_KEY]=p;S.items[x.id]=s;
    }
    if(p&&p.version!==VERSION){
      p.version=VERSION;
      p.attempts=p.attempts||{};p.locked=p.locked||{};p.submitted=p.submitted||{};
      p.drafts=p.drafts||{};p.results=p.results||{};p.history=p.history||[];
      if(p.revealed===undefined)p.revealed=false;
    }
    return p;
  }
  function roundResolved(x,p,q){
    if(!q.length)return true;
    return q.every((_,i)=>!!p.locked?.[i]);
  }
  function currentScore(x,p,q){
    const s=st(x.id),a=s.autoAnswers||{};
    let score=0;
    q.forEach((item,i)=>{if(p.submitted?.[i]&&gradingEqual(item,a[i]||""))score++});
    return {score,total:q.length};
  }
  function recordRound(x,p,q,reason){
    p.history=p.history||[];
    if(p.history.some(h=>Number(h.round)===Number(p.round)))return;
    const s=st(x.id),answers=s.autoAnswers||{},sc=currentScore(x,p,q);
    p.history.push({
      round:Number(p.round||0),kind:policyKind(x),reason:reason||"completed",
      score:sc.score,total:sc.total,submittedAt:Date.now(),
      prompts:q.map(v=>String(v.prompt||"")),
      answers:q.map((_,i)=>String(answers[i]||"")),
      correct:q.map((item,i)=>gradingEqual(item,answers[i]||""))
    });
  }
  function migrateInFlight(x,p,q,preComplete){
    if(p.migrated)return false;
    const s=st(x.id),answers=s.autoAnswers||{};
    p.grandfathered=!!preComplete;
    if(!p.grandfathered){
      for(let i=0;i<q.length;i++){
        const value=String(answers[i]||"");
        if(!value)continue;
        p.drafts[i]=value;
        if(gradingEqual(q[i],value)){
          p.submitted[i]=true;p.locked[i]=true;p.results[i]="correct";p.attempts[i]=1;
        }else{
          delete answers[i];
        }
      }
      s.autoAnswers=answers;
    }
    p.migrated=true;S.items[x.id]=s;
    return true;
  }
  function injectStyle(){
    if(document.getElementById("dw-answer-integrity-style"))return;
    const stl=document.createElement("style");stl.id="dw-answer-integrity-style";
    stl.textContent=`
      .dw-answer-policy{margin:10px 0;padding:10px 12px;border:1px solid rgba(244,201,93,.3);border-radius:8px;background:#0d0a1d;color:#ddd5e8;font-size:12px;line-height:1.45}
      .dw-answer-policy b{color:#ffe8a0}.dw-answer-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:9px}
      .dw-answer-attempt{font-size:11px;color:#bdb4c9}.dw-answer-summary{margin:12px 0;padding:12px;border-radius:8px;border:1px solid #4c376b;background:#0a0818;color:#eee8f8}
      .dw-answer-summary.good{border-color:#397b5b;background:#0c251b}.dw-answer-summary.bad{border-color:#8a5260;background:#241019}
      .dw-answer-locked .activity-options{opacity:.76}.dw-answer-locked input{cursor:not-allowed}
    `;
    document.head.appendChild(stl);
  }
  function policyIntro(settings){
    if(settings.kind==="assessment")return `<div class="dw-answer-policy"><b>Assessment rules:</b> Choose carefully, then lock each answer. You may change your choice until you lock it. Dragonswood will not show which answers are correct until the whole assessment question set is submitted.</div>`;
    if(settings.kind==="progress")return `<div class="dw-answer-policy"><b>Progress-check rules:</b> Choose carefully, then lock your answer. Each question gets one submission in this check. A missed question stays recorded, then you can review and take a fresh check.</div>`;
    return `<div class="dw-answer-policy"><b>Practice rules:</b> Choose an answer first, then check it. A wrong answer gets one more submitted try with a hint. After two misses, review the lesson and use a fresh practice set.</div>`;
  }
  function fieldIndex(field,x){
    const input=field.querySelector('input[type="radio"][name^="auto-"]');
    if(!input)return -1;
    const name=String(input.name||""),prefix=`auto-${x.id}-`;
    if(!name.startsWith(prefix))return -1;
    const n=Number(name.slice(prefix.length));return Number.isInteger(n)?n:-1;
  }
  function feedbackFor(x,settings,p,index,correct){
    if(settings.kind==="assessment"&&!p.revealed){
      return p.submitted?.[index]?{cls:"",text:"Answer locked. Results will appear after you submit the assessment."}:null;
    }
    if(!p.submitted?.[index])return null;
    if(correct)return {cls:"good",text:"✓ Correct. Answer locked."};
    if(settings.kind==="progress")return {cls:"bad",text:"Recorded for this progress check. This answer cannot be changed in this check. Finish the check, then review and use a fresh check."};
    const attempts=Number(p.attempts?.[index]||0);
    if(attempts<settings.maxAttempts)return {cls:"bad",text:`Not yet. ${hintFor(x)} You have one submitted try left.`};
    return {cls:"bad",text:`Needs review. ${hintFor(x)} This question is closed for this practice round; finish the set, then use fresh practice.`};
  }
  function summaryHtml(x,settings,p,q){
    if(p.grandfathered)return `<div class="dw-answer-summary good"><b>✓ Prior work preserved.</b> This mission was already complete before the answer-lock update, so Dragonswood will not reopen it.</div>`;
    if(!q.length)return "";
    const resolved=roundResolved(x,p,q),sc=currentScore(x,p,q);
    if(settings.kind==="assessment"){
      if(!resolved)return `<div class="dw-answer-summary">Assessment progress: ${Object.keys(p.locked||{}).filter(k=>p.locked[k]).length}/${q.length} answers locked.</div>`;
      if(!p.revealed)return `<div class="dw-answer-summary"><b>All answers are locked.</b> Submit the assessment to see your result.<div class="dw-answer-actions"><button type="button" class="btn" onclick="dwCurriculumAssessmentSubmit('${esc(x.id)}')">SUBMIT ASSESSMENT</button></div></div>`;
      if(sc.score===sc.total)return `<div class="dw-answer-summary good"><b>✓ Assessment complete: ${sc.score}/${sc.total}.</b> Your submitted answers show mastery of this check.</div>`;
      return `<div class="dw-answer-summary bad"><b>Assessment recorded: ${sc.score}/${sc.total}.</b> Review the missed skills before retaking. Your first-round evidence remains saved.<div class="dw-answer-actions"><button type="button" class="btn" onclick="dwCurriculumFreshRound('${esc(x.id)}')">${settings.freshLabel}</button></div></div>`;
    }
    if(!resolved)return "";
    if(sc.score===sc.total)return `<div class="dw-answer-summary good"><b>✓ ${settings.kind==="progress"?"Progress check":"Practice"} complete: ${sc.score}/${sc.total}.</b></div>`;
    return `<div class="dw-answer-summary bad"><b>${settings.kind==="progress"?"Progress check":"Practice round"} recorded: ${sc.score}/${sc.total}.</b> Review the lesson before another attempt. The next round uses fresh equivalent questions whenever the curriculum bank provides them.<div class="dw-answer-actions"><button type="button" class="btn" onclick="dwCurriculumFreshRound('${esc(x.id)}')">${settings.freshLabel}</button></div></div>`;
  }
  function transformPracticeHtml(x,html,preComplete){
    if(!html||!html.includes('name="auto-'))return html;
    const q=window.autoQuestionsFor(x),p=stateFor(x,true),settings=policySettings(x);
    const changed=migrateInFlight(x,p,q,preComplete);
    if(changed)save();
    const wrap=document.createElement("div");wrap.innerHTML=html;
    const fields=[...wrap.querySelectorAll("fieldset.activity-shell")].filter(f=>fieldIndex(f,x)>=0);
    if(fields.length){
      const intro=document.createElement("div");intro.innerHTML=policyIntro(settings);
      fields[0].parentNode.insertBefore(intro.firstElementChild,fields[0]);
    }
    const s=st(x.id),answers=s.autoAnswers||{};
    for(const field of fields){
      const i=fieldIndex(field,x);if(i<0||!q[i])continue;
      const locked=!!p.locked?.[i]||!!p.grandfathered,submitted=!!p.submitted?.[i];
      const draft=String(p.drafts?.[i]??answers[i]??"");
      const correct=submitted&&gradingEqual(q[i],answers[i]||"");
      field.classList.toggle("dw-answer-locked",locked);
      const radios=[...field.querySelectorAll(`input[type="radio"][name="auto-${CSS.escape(x.id)}-${i}"]`)];
      for(const input of radios){
        input.removeAttribute("onchange");
        input.checked=String(input.value)===draft;
        input.disabled=locked;
        if(!locked)input.setAttribute("onchange",`dwCurriculumAnswerSelect('${String(x.id).replace(/'/g,"\\'")}',${i},this.value)`);
      }
      let fb=field.querySelector(".activity-feedback");
      if(!fb){fb=document.createElement("div");fb.className="activity-feedback";field.appendChild(fb)}
      const f=feedbackFor(x,settings,p,i,correct);
      if(f){fb.className=`activity-feedback show ${f.cls}`.trim();fb.textContent=f.text}
      else{fb.className="activity-feedback";fb.textContent=""}
      const oldActions=field.querySelector(".dw-answer-actions");if(oldActions)oldActions.remove();
      if(!locked&&!p.grandfathered){
        const actions=document.createElement("div");actions.className="dw-answer-actions";
        const attempt=Number(p.attempts?.[i]||0),buttonLabel=settings.kind==="practice"&&attempt===1?"CHECK FINAL TRY":settings.button;
        actions.innerHTML=`<button type="button" class="btn" ${draft?"":"disabled"} onclick="dwCurriculumAnswerSubmit('${esc(x.id)}',${i})">${buttonLabel}</button><span class="dw-answer-attempt">${settings.kind==="practice"?`Submitted tries: ${attempt}/${settings.maxAttempts}`:"Not submitted until you lock it."}</span>`;
        field.appendChild(actions);
      }
      const reviewBtn=field.querySelector(".override-btn");
      if(reviewBtn){
        const allowReview=submitted&&(!settings.deferFeedback||p.revealed)&&!correct;
        if(!allowReview&&!["pending","approved"].includes(String(s.autoOverrideStatus?.[i]||"")))reviewBtn.disabled=true;
      }
    }
    const summary=document.createElement("div");summary.innerHTML=summaryHtml(x,settings,p,q);
    if(summary.firstElementChild)wrap.appendChild(summary.firstElementChild);
    return wrap.innerHTML;
  }

  const PRE_COMPLETE=new Set();
  let installTries=0;
  function install(){
    const required=["render","st","save","autoQuestionsFor","renderAutoPractice","autoPassed","findItem","vid"];
    if(required.some(k=>typeof window[k]!=="function")||!window.DWCurriculumRenderCoordinator){if(++installTries<160)setTimeout(install,25);return}
    if(!window.__DW_CURRICULUM_INTERACTION_ENGINE_V5624__){if(++installTries<160)setTimeout(install,25);return}
    if(window.__DW_CURRICULUM_ANSWER_INTEGRITY_V56253__)return;
    window.__DW_CURRICULUM_ANSWER_INTEGRITY_V56253__=true;
    injectStyle();

    if(typeof window.missionComplete==="function"){
      for(const x of D.items){try{if(window.missionComplete(x))PRE_COMPLETE.add(x.id)}catch(e){}}
    }

    ORIGINALS=window.__DW_CURRICULUM_ANSWER_POLICY_ORIGINALS={
      autoQuestionsFor:window.autoQuestionsFor,
      renderAutoPractice:window.renderAutoPractice,
      autoPassed:window.autoPassed,
      checkAutoQuestion:window.checkAutoQuestion
    };

    window.autoQuestionsFor=function(x){
      const p=stateFor(x,false);
      return pickRoundQuestions(x,p);
    };

    window.dwCurriculumAnswerSelect=function(itemId,index,value){
      const x=findItem(itemId);if(!x)return;
      const p=stateFor(x,true);if(p.grandfathered||p.locked?.[index])return;
      p.drafts=p.drafts||{};p.drafts[index]=String(value||"");
      S.items[itemId][POLICY_KEY]=p;save();
      const field=document.querySelector(`input[name="auto-${CSS.escape(itemId)}-${index}"]`)?.closest("fieldset");
      const btn=field?.querySelector(".dw-answer-actions .btn");if(btn)btn.disabled=!String(value||"");
    };

    window.dwCurriculumAnswerSubmit=function(itemId,index){
      const x=findItem(itemId);if(!x)return;
      const q=window.autoQuestionsFor(x),item=q[index],p=stateFor(x,true),settings=policySettings(x);
      if(!item||p.grandfathered||p.locked?.[index])return;
      const selected=String(p.drafts?.[index]||"");if(!selected){void window.DWImmersiveUI?.alert({title:"Choose an answer first",message:"Select the answer you want to submit."});return}
      const s=st(itemId);s.autoAnswers=s.autoAnswers||{};s.autoAttempts=(s.autoAttempts||0)+1;
      p.attempts=p.attempts||{};p.submitted=p.submitted||{};p.locked=p.locked||{};p.results=p.results||{};
      p.attempts[index]=Number(p.attempts[index]||0)+1;p.submitted[index]=true;s.autoAnswers[index]=selected;
      const correct=gradingEqual(item,selected),outcome=submissionOutcome(settings,p.attempts[index],correct);
      p.results[index]=outcome.feedback;if(outcome.locked)p.locked[index]=true;
      if(correct&&s.autoOverrideStatus)delete s.autoOverrideStatus[index];
      s[POLICY_KEY]=p;S.items[itemId]=s;
      if(settings.kind==="progress"&&roundResolved(x,p,q))recordRound(x,p,q,"progress-check");
      save();window.DWCurriculumRenderCoordinator.request("answer-submitted");
    };

    window.dwCurriculumAssessmentSubmit=function(itemId){
      const x=findItem(itemId);if(!x)return;
      const p=stateFor(x,true),q=window.autoQuestionsFor(x),settings=policySettings(x);
      if(settings.kind!=="assessment"||!roundResolved(x,p,q))return;
      p.revealed=true;recordRound(x,p,q,"assessment-submit");
      S.items[itemId][POLICY_KEY]=p;save();window.DWCurriculumRenderCoordinator.request("assessment-submitted");
    };

    window.dwCurriculumFreshRound=function(itemId){
      const x=findItem(itemId);if(!x)return;
      const p=stateFor(x,true),q=window.autoQuestionsFor(x),settings=policySettings(x);
      if(!roundResolved(x,p,q))return;
      if(settings.kind==="assessment"&&!p.revealed)return;
      recordRound(x,p,q,"fresh-round");
      p.round=Number(p.round||0)+1;p.attempts={};p.locked={};p.submitted={};p.drafts={};p.results={};p.revealed=false;
      const s=st(itemId);s.autoAnswers={};s.autoOverrideStatus={};s.autoOverrideNotes={};s[POLICY_KEY]=p;S.items[itemId]=s;
      save();window.DWCurriculumRenderCoordinator.request("fresh-answer-round");
    };

    window.checkAutoQuestion=function(id,index,value){window.dwCurriculumAnswerSelect(id,index,value)};

    window.renderAutoPractice=function(x){
      const html=ORIGINALS.renderAutoPractice(x);
      return transformPracticeHtml(x,html,PRE_COMPLETE.has(x.id));
    };

    window.autoPassed=function(x){
      const p=stateFor(x,false);
      if(p?.grandfathered)return true;
      const base=ORIGINALS.autoPassed(x);
      if(!base)return false;
      if(policyKind(x)==="assessment")return !!p?.revealed;
      return true;
    };

    window.__DW_CURRICULUM_ANSWER_POLICY_TEST__={
      policyKind,policySettings,submissionOutcome,freshQuestionBank,pickRoundQuestions,hintFor
    };
    window.DWCurriculumRenderCoordinator.request("answer-policy-installed");
  }

  window.__DW_CURRICULUM_ANSWER_POLICY_TEST_PREINSTALL__={
    policyKind,policySettings,submissionOutcome,priorQuestionBank,generatorQuestions,derivedMorphQuestions,hintFor
  };
  setTimeout(install,0);
})();
