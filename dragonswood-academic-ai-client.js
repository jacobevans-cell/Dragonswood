/* Dragonswood cost-controlled academic AI rescue client v1.3.0 */
(function(){
  "use strict";
  if(window.DWAcademicAI)return;
  let transport=null;
  const sessionCache=new Map();
  const REQUIRED_REVISIONS=3;
  const clip=(v,n)=>String(v??"").slice(0,n);
  const normalizedAnswer=v=>String(v??"").trim().replace(/\s+/g," ").toLowerCase();
  function answerFingerprint(value){
    const text=normalizedAnswer(value);if(!text)return "";
    let h=2166136261;for(const ch of text){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}
    return `${text.length}:${(h>>>0).toString(36)}`;
  }
  function revisionGate(state={}){
    const count=Math.max(0,Math.min(REQUIRED_REVISIONS,Number(state.reviewRevisionAttempts)||0));
    return {required:REQUIRED_REVISIONS,count,remaining:REQUIRED_REVISIONS-count,unlocked:count>=REQUIRED_REVISIONS};
  }
  function registerRevisionAttempt(state={},value,priorValue=""){
    const fingerprint=answerFingerprint(value),priorFingerprint=answerFingerprint(priorValue);
    if(!fingerprint)return {...revisionGate(state),repeated:false,initial:false};
    const seen=Array.isArray(state.reviewAttemptFingerprints)?state.reviewAttemptFingerprints.filter(Boolean).slice(-11):[];
    const hadBaseline=!!state.reviewBaselineFingerprint||seen.length>0;
    let baseline=String(state.reviewBaselineFingerprint||"");
    if(!baseline&&priorFingerprint&&priorFingerprint!==fingerprint){baseline=priorFingerprint;if(!seen.includes(priorFingerprint))seen.push(priorFingerprint)}
    if(!baseline)baseline=fingerprint;
    if(!seen.includes(baseline))seen.push(baseline);
    const repeated=seen.includes(fingerprint),initial=!hadBaseline&&(!priorFingerprint||priorFingerprint===fingerprint);
    if(!repeated){seen.push(fingerprint);if(fingerprint!==baseline)state.reviewRevisionAttempts=Math.min(REQUIRED_REVISIONS,(Number(state.reviewRevisionAttempts)||0)+1)}
    state.reviewBaselineFingerprint=baseline;state.reviewAttemptFingerprints=seen.slice(-12);
    return {...revisionGate(state),repeated:repeated&&!initial,initial};
  }
  function clearRevisionGate(state={}){
    delete state.reviewBaselineFingerprint;delete state.reviewAttemptFingerprints;delete state.reviewRevisionAttempts;
  }
  function cleanPayload(p={}){
    return {source:clip(p.source||"unknown",40),mode:p.mode==="reasoning"?"reasoning":"equivalence",
      questionId:clip(p.questionId||"",180),skillId:clip(p.skillId||"",180),gradeBand:clip(p.gradeBand||"4-5",20),
      prompt:clip(p.prompt||"",1400),expectedAnswer:clip(p.expectedAnswer||"",500),studentAnswer:clip(p.studentAnswer||"",800),
      rubric:clip(p.rubric||"",1200),strictConventions:!!p.strictConventions};
  }
  const key=p=>JSON.stringify([p.mode,p.questionId,p.skillId,p.prompt,p.expectedAnswer,answerFingerprint(p.studentAnswer),p.rubric,p.strictConventions]);
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
  window.DWAcademicAI={version:"1.3.0",configure,judge,studentAdvice,answerFingerprint,revisionGate,registerRevisionAttempt,clearRevisionGate,clear:()=>sessionCache.clear()};
})();
