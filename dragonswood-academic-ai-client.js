/* Dragonswood cost-controlled academic AI rescue client v1.2.1 */
(function(){
  "use strict";
  if(window.DWAcademicAI)return;
  let transport=null;
  const sessionCache=new Map();
  const clip=(v,n)=>String(v??"").slice(0,n);
  function cleanPayload(p={}){
    return {source:clip(p.source||"unknown",40),mode:p.mode==="reasoning"?"reasoning":"equivalence",
      questionId:clip(p.questionId||"",180),skillId:clip(p.skillId||"",180),gradeBand:clip(p.gradeBand||"4-5",20),
      prompt:clip(p.prompt||"",1400),expectedAnswer:clip(p.expectedAnswer||"",500),studentAnswer:clip(p.studentAnswer||"",800),
      rubric:clip(p.rubric||"",1200),strictConventions:!!p.strictConventions};
  }
  const key=p=>JSON.stringify([p.mode,p.questionId,p.skillId,p.prompt,p.expectedAnswer,p.studentAnswer,p.rubric,p.strictConventions]);
  function configure(fn){transport=typeof fn==="function"?fn:null}
  function studentAdvice(result,fallback="Add one specific detail that shows your thinking."){
    const administrative=/temporarily unavailable|not connected|daily .*cap|unreadable result|disabled by the teacher|use teacher review|numeric equivalence|convention-specific work/i;
    const candidates=[result?.reason,result?.strongRetryReason,result?.primaryReason,result?.escalationReason];
    for(const value of candidates){
      const reason=String(value||"").replace(/\s+/g," ").trim().slice(0,240);
      if(reason&&!administrative.test(reason))return reason;
    }
    return String(fallback||"").trim();
  }
  async function judge(payload){
    const p=cleanPayload(payload),k=key(p);
    if(sessionCache.has(k))return {...sessionCache.get(k),clientCached:true};
    if(!transport)return {decision:"unavailable",confidence:"low",reason:"AI rescue is not connected.",paidCall:false};
    try{
      const raw=await transport(p),decision=["approve","not_approved","review"].includes(raw?.decision)?raw.decision:"review";
      const result={decision,confidence:["high","medium","low"].includes(raw?.confidence)?raw.confidence:"low",
        reason:clip(raw?.reason||"",240),cached:!!raw?.cached,paidCall:!!raw?.paidCall,
        model:clip(raw?.model||"",80),policyVersion:clip(raw?.policyVersion||"",80),
        primaryDecision:clip(raw?.primaryDecision||"",40),primaryConfidence:clip(raw?.primaryConfidence||"",20),
        primaryReason:clip(raw?.primaryReason||"",240),strongRetryUsed:!!raw?.strongRetryUsed,
        strongRetryDecision:clip(raw?.strongRetryDecision||"",40),strongRetryConfidence:clip(raw?.strongRetryConfidence||"",20),
        strongRetryReason:clip(raw?.strongRetryReason||"",240),escalationReason:clip(raw?.escalationReason||"",240)};
      sessionCache.set(k,result);return result;
    }catch(err){
      console.warn("Academic AI rescue unavailable",err);
      return {decision:"unavailable",confidence:"low",reason:"AI rescue is temporarily unavailable.",paidCall:false};
    }
  }
  window.DWAcademicAI={version:"1.2.1",configure,judge,studentAdvice,clear:()=>sessionCache.clear()};
})();
