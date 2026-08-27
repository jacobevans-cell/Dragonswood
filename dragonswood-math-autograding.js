/* ==========================================================================
   DRAGONSWOOD MATH AUTO-GRADING POLICY v57.1.2

   System rule:
   - Math never requires teacher approval.
   - Deterministic math stays deterministic.
   - Open math reasoning is checked automatically with a math-specific AI judge.
   - If AI cannot make a confident judgment, the student revises; no teacher
     override request is created.
   - Daily Quest Math also suppresses teacher-review requests.
   - This file does not change video playback, watch tracking, pacing, rewards,
     answer-lock policy, or non-Math teacher-review behavior.
   ========================================================================== */
(function(){
  const VERSION="57.1.2";
  const page=(location.pathname.split("/").pop()||"").toLowerCase();

  const norm=v=>String(v||"").trim().toLowerCase().replace(/,/g,"").replace(/\s+/g," ");
  const isMathItem=x=>String(x?.subject||"").trim().toUpperCase()==="MATH";

  function stripMathReviewUi(html){
    if(!html)return html;
    const wrap=document.createElement("div");
    wrap.innerHTML=html;
    wrap.querySelectorAll(".override-row").forEach(n=>n.remove());
    wrap.querySelectorAll(".teacher-note").forEach(n=>{
      if(/teacher feedback|teacher review|override/i.test(n.textContent||""))n.remove();
    });
    return wrap.innerHTML;
  }

  function mathReferenceRows(x){
    try{
      return (typeof window.autoQuestionsFor==="function"?window.autoQuestionsFor(x):[])
        .filter(q=>q&&q.prompt&&q.answer!==undefined&&q.answer!==null)
        .slice(0,6);
    }catch(e){return []}
  }
  function answerAppears(text,expected){
    const a=norm(text),e=norm(expected);
    if(!a||!e)return false;
    if(/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(e)){
      return a.split(/[^0-9.\-]+/).filter(Boolean).some(token=>{
        try{return window.DWGrading?.answersEquivalent?window.DWGrading.answersEquivalent(e,token):Number(token)===Number(e)}
        catch{return token===e}
      });
    }
    return new RegExp(`\\b${e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\b`,"i").test(a);
  }
  function strongMathFallback(x,answer,freeResult){
    if(!freeResult?.ok)return false;
    const words=String(answer||"").trim().split(/\s+/).filter(Boolean);
    if(words.length<8)return false;
    const hasReason=/\b(because|estimate|check|regroup|place value|digit|round|add|subtract|multiply|divide|quotient|product|sum|difference|remainder|equation|step|first|then|reasonable)\b|[=+×÷*/]/i.test(answer);
    if(!hasReason)return false;
    const refs=mathReferenceRows(x);
    return !refs.length||refs.some(q=>answerAppears(answer,q.answer));
  }
  async function mathAiJudge(x,spec,answer,freeResult){
    if(!window.DWAcademicAI?.judge)return {decision:"unavailable",confidence:"low",reason:"Automatic math reasoning check is temporarily unavailable."};
    const refs=mathReferenceRows(x);
    const referenceText=refs.map((q,i)=>`${i+1}) ${String(q.prompt||"").slice(0,150)} => ${String(q.answer||"").slice(0,80)}`).join(" | ");
    const rubric=[
      "This is a grade 4-5 mathematics reasoning check.",
      "Judge mathematical correctness, not exact wording.",
      "Accept alternate valid methods and equivalent numerical forms.",
      "The student should show an equation, useful steps, or a mathematically valid explanation of how the answer was checked.",
      "Do not approve a response whose arithmetic, operation, place-value reasoning, or conclusion is clearly wrong.",
      "Do not require a specific vocabulary word when the mathematics is clear.",
      referenceText?`Reference problems already used in this mission: ${referenceText}`:"",
      freeResult?.msg?`Free-check concern: ${freeResult.msg}`:""
    ].filter(Boolean).join(" ");
    try{
      return await window.DWAcademicAI.judge({
        source:"curriculum-math",
        mode:"reasoning",
        questionId:`math-application:${String(x.id||"")}`,
        skillId:`math:${String(x.strand||x.id||"")}`,
        gradeBand:"4-5",
        prompt:String(spec?.prompt||window.activityFor?.(x)||"Explain your math reasoning.").slice(0,1400),
        expectedAnswer:referenceText.slice(0,500),
        studentAnswer:String(answer||"").slice(0,800),
        rubric:rubric.slice(0,1200),
        strictConventions:false
      });
    }catch(e){
      console.warn("Math AI grading unavailable",e);
      return {decision:"unavailable",confidence:"low",reason:"Automatic math reasoning check is temporarily unavailable."};
    }
  }

  function installCurriculum(){
    let tries=0;
    const start=()=>{
      const required=["renderActivity","renderAutoPractice","checkActivity","requestOverride","requestAutoQuestionOverride",
        "activitySpec","validateActivity","activityAnswerText","findItem","st","save","saveCurriculumItemState","render","autoQuestionsFor"];
      if(required.some(k=>typeof window[k]!=="function")||!window.DWCurriculumRenderCoordinator){if(++tries<180)setTimeout(start,25);return}
      if(document.querySelector?.('script[src*="q1-curriculum-answer-policy.js"]')&&!window.dwCurriculumAnswerSubmit){
        if(++tries<180)setTimeout(start,25);return;
      }
      if(window.__DW_MATH_AUTO_GRADING_CURRICULUM__)return;
      window.__DW_MATH_AUTO_GRADING_CURRICULUM__=VERSION;

      const O=window.__DW_MATH_AUTO_ORIGINALS__={
        renderAutoPractice:window.renderAutoPractice,
        renderActivity:window.renderActivity,
        checkActivity:window.checkActivity,
        requestOverride:window.requestOverride,
        requestAutoQuestionOverride:window.requestAutoQuestionOverride
      };

      window.renderAutoPractice=function(x){
        const html=O.renderAutoPractice(x);
        return isMathItem(x)?stripMathReviewUi(html):html;
      };

      window.renderActivity=function(x){
        const html=O.renderActivity(x);
        if(!isMathItem(x))return html;
        const wrap=document.createElement("div");wrap.innerHTML=stripMathReviewUi(html);
        const shells=[...wrap.querySelectorAll(".activity-shell")];
        const finalShell=shells[shells.length-1];
        if(finalShell&&!finalShell.querySelector(".dw-math-auto-note")){
          const note=document.createElement("div");
          note.className="dw-math-auto-note";
          note.style.cssText="margin:9px 0;padding:9px 10px;border:1px solid #276a80;border-radius:7px;background:#081c29;color:#bdefff;font-size:11px;font-weight:800";
          note.textContent="Math is checked automatically. Exact answers use the deterministic grader; open reasoning can use Dragonswood AI. Teacher approval is not required.";
          finalShell.insertBefore(note,finalShell.querySelector(".actions")||null);
        }
        return wrap.innerHTML;
      };

      window.requestAutoQuestionOverride=async function(id,index){
        const x=window.findItem(id);
        if(isMathItem(x)){
          alert("Math questions are graded automatically. Review the lesson or use the next attempt instead of requesting teacher approval.");
          return;
        }
        return O.requestAutoQuestionOverride(id,index);
      };
      window.requestOverride=async function(id){
        const x=window.findItem(id);
        if(isMathItem(x)){
          alert("Math does not require teacher approval. Revise your equation, steps, or explanation and check it again.");
          return;
        }
        return O.requestOverride(id);
      };

      window.checkActivity=async function(id){
        const x=window.findItem(id);
        if(!isMathItem(x))return O.checkActivity(id);

        const f=document.getElementById("actFeedback-"+id),spec=window.activitySpec(x),answer=window.activityAnswerText(x),s=window.st(id);
        if(!f)return;

        // Exact-answer Math already has a proven deterministic grader.
        // This wrapper is needed only for open mathematical reasoning.
        if(spec.kind!=="explain")return O.checkActivity(id);

        let result=window.validateActivity(x),aiResult=null;
        s.lastActivityAttempt=answer;s.activityAttempts=(s.activityAttempts||0)+1;window.saveCurriculumItemState(id,s);

        if(result.reviewable===false){
          const field=document.getElementById("actText-"+id);if(field)field.value="";
          s.lastActivityAttempt="";
          if(typeof window.systemAuthoredResponse==="function"&&window.systemAuthoredResponse(x,s.practiceEvidence)){s.practiceEvidence="";s.practiced=false}
          s.overrideStatus="";window.saveCurriculumItemState(id,s);
          f.className="activity-feedback show bad";
          f.textContent="Not yet: "+result.msg+" Dragonswood cleared the copied text. Write your own math response, then check it again.";
          return;
        }

        if(spec.kind==="explain"&&String(answer||"").trim()){
          f.className="activity-feedback show";
          f.textContent="Checking the mathematical reasoning automatically…";
          aiResult=await mathAiJudge(x,spec,answer,result);
          if(aiResult?.decision==="approve"){
            result={ok:true,aiApproved:true,msg:""};
          }else if(aiResult?.decision==="not_approved"){
            result={ok:false,msg:aiResult.reason||"The explanation does not yet show correct mathematical reasoning."};
          }else if(strongMathFallback(x,answer,result)){
            result={ok:true,autoFallback:true,msg:""};
          }else{
            f.className="activity-feedback show bad";
            f.textContent="Dragonswood could not verify this reasoning yet. Add the equation, important steps, and how you checked the answer, then try again. No teacher approval is needed.";
            return;
          }
        }

        window.recordCurriculumAttempt?.(x,s,!!result.ok);
        f.className="activity-feedback show "+(result.ok?"good":"bad");
        if(result.ok){
          s.practiced=true;s.practiceEvidence=answer;s.overrideStatus="";window.saveCurriculumItemState(id,s);
          f.textContent=aiResult?.decision==="approve"
            ?"✓ Math complete. Dragonswood AI verified the reasoning."
            :spec.kind==="explain"&&result.autoFallback
              ?"✓ Math complete. Your equation, reasoning, and checked result passed the automatic fallback."
              :"✓ Math complete. The deterministic grader accepted the answer.";
          window.clearCurriculumDraft?.(id);window.DWCurriculumRenderCoordinator.request("math-reasoning-accepted");
        }else{
          s.overrideStatus="";window.saveCurriculumItemState(id,s);
          f.textContent="Not yet: "+(result.msg||"Check the mathematics and try again.")+" Revise and check it again. Math never waits for teacher approval.";
        }
      };

      window.__DW_MATH_AUTO_TEST__={isMathItem,strongMathFallback,mathAiJudge,stripMathReviewUi};
      window.DWCurriculumRenderCoordinator.request("math-autograding-installed");
    };
    start();
  }

  function dailyIsMath(t,q){
    if(String(t?.subject||"").trim().toUpperCase()==="MATH")return true;
    try{if(/^math\./i.test(String(q?.skillId||window.currentSkillId?.()||"")))return true}catch(e){}
    return /^MATH\b/i.test(String(document.getElementById("taskMeta")?.textContent||""));
  }
  function installDaily(){
    let tries=0;
    const start=()=>{
      const required=["gradeTypedAnswerWithRescue","dwRefreshDailyReviewFooter","requestDailyQuestionReview"];
      if(required.some(k=>typeof window[k]!=="function")){if(++tries<180)setTimeout(start,25);return}
      if(window.__DW_MATH_AUTO_GRADING_DAILY__)return;
      window.__DW_MATH_AUTO_GRADING_DAILY__=VERSION;
      const O={
        gradeTypedAnswerWithRescue:window.gradeTypedAnswerWithRescue,
        dwRefreshDailyReviewFooter:window.dwRefreshDailyReviewFooter,
        requestDailyQuestionReview:window.requestDailyQuestionReview
      };

      window.gradeTypedAnswerWithRescue=async function(q,value,t){
        const r=await O.gradeTypedAnswerWithRescue(q,value,t);
        if(dailyIsMath(t,q)&&r?.review){
          return {ok:false,review:false,method:"math-auto-retry",reason:r.reason||"Automatic Math check could not verify the response."};
        }
        return r;
      };
      window.dwRefreshDailyReviewFooter=function(){
        if(dailyIsMath()){
          document.querySelector(".dw-question-review")?.remove();
          return;
        }
        return O.dwRefreshDailyReviewFooter();
      };
      window.requestDailyQuestionReview=async function(){
        if(dailyIsMath()){
          window.feedback?.("Math is graded automatically. Review the skill and try the Math question again.","");
          document.querySelector(".dw-question-review")?.remove();
          return;
        }
        return O.requestDailyQuestionReview();
      };

      const arena=document.getElementById("arena");
      if(arena)new MutationObserver(()=>{if(dailyIsMath())arena.querySelector(".dw-question-review")?.remove()}).observe(arena,{childList:true,subtree:true});
      window.__DW_MATH_AUTO_DAILY_TEST__={dailyIsMath};
      window.dwRefreshDailyReviewFooter();
    };
    start();
  }

  if(page==="curriculum-quest.html")installCurriculum();
  if(page==="daily-quest.html")installDaily();

  window.__DW_MATH_AUTO_POLICY_PREINSTALL__={isMathItem,dailyIsMath};
})();