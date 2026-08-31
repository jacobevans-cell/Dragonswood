/* Dragonswood curriculum response validators v1.0.2
   Free, task-specific checks run before the existing AI rescue. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.DWCurriculumValidation=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const words=value=>(String(value||"").toLowerCase().match(/[a-z']+/g)||[]).filter(word=>word.length>1);
  const fail=(code,msg,extra={})=>({ok:false,code,msg,...extra});
  const pass=(extra={})=>({ok:true,code:"passed",msg:"",...extra});

  function meaningfulText(value,minWords=6){
    const raw=String(value||"").trim(),list=words(raw);
    if(raw.length<20||list.length<minWords)return fail("too_short",raw.length<20?"Write a fuller answer. One complete thought is needed.":`Use at least ${minWords} meaningful words.`);
    const unique=new Set(list);
    if(unique.size<Math.max(4,Math.ceil(list.length*.5)))return fail("too_repetitive","Your answer repeats too much. Explain the idea in your own words.");
    const counts={};for(const word of list)counts[word]=(counts[word]||0)+1;
    if(Math.max(...Object.values(counts))>Math.max(3,Math.ceil(list.length*.35)))return fail("too_repetitive","One word is being repeated too often. Give a real explanation.");
    if(/^(hey|hi|hello|asdf|blah|idk|test|yes|no)([\s.!?,]+\1)*$/i.test(raw)||/(?:\bhey\b[\s.!]*){3,}/i.test(raw)||/(.)\1{5,}/.test(raw))return fail("off_topic","That does not answer the lesson question.");
    return pass();
  }

  function connectedReason(value){
    const raw=String(value||""),match=/\b(because|since|so that|so|which would|that way)\b/i.exec(raw);
    if(!match)return false;
    const before=words(raw.slice(0,match.index)),after=words(raw.slice(match.index+match[0].length));
    return before.length>=3&&after.length>=2;
  }

  function opinion(value){
    const quality=meaningfulText(value,8);if(!quality.ok)return quality;
    const raw=String(value||"");
    if(!/\b(i think|i believe|i would|if i were you|should|you could|my opinion|i recommend)\b/i.test(raw))return fail("missing_stance","State what you think or recommend.");
    if(!connectedReason(raw))return fail("missing_reason","Add a connected reason or result that explains your thinking.");
    return pass();
  }

  function writingCommunity(value){
    const quality=meaningfulText(value,8);if(!quality.ok)return quality;
    const raw=String(value||""),praise=/\b(i like|a strength|you did well|strong part)\b/i.test(raw),question=/\b(i wonder|why did|how could|what if)\b/i.test(raw),suggestion=/\b(if i were you(?:,)?\s+i would|i would|you could|i suggest|consider|try)\b/i.test(raw);
    if(praise||question)return pass({feedbackType:praise?"praise":"question"});
    if(!suggestion)return fail("missing_suggestion","Give a specific, helpful suggestion to the writer.");
    if(!connectedReason(raw))return fail("missing_reason","Explain how or why your suggestion would help.");
    return pass({feedbackType:"suggestion"});
  }

  function inference(value){
    const raw=String(value||"");
    const hasInference=/\b(think|thinks|thinking|feel|feels|felt|sad|happy|angry|afraid|wants?|wanted|probably|maybe|means?|suggests?|telling|shows?|must|might|could|realize|understand)\b/i.test(raw);
    const hasEvidence=/\b(because|when|after|before|said|says|smile|smiles|smiled|look|looks|looked|saw|sees|noticed|picture|wall|action|words?|event|did|does|happened)\b/i.test(raw);
    if(!hasInference)return fail("missing_inference","State what you infer or understand beyond the visible detail.");
    if(!hasEvidence)return fail("missing_evidence","Add a specific action, statement, thought, event, or detail that supports the inference.");
    const quality=meaningfulText(raw,9);if(!quality.ok)return quality;
    return pass();
  }

  function science(value,minWords=8){
    const quality=meaningfulText(value,minWords);if(!quality.ok)return quality;
    if(!/\b(because|evidence|cause|effect|observe|observed|observation|shows?|result|data|fact)\b/i.test(String(value||"")))return fail("missing_evidence","Include an observation or fact and explain what it shows.");
    return pass();
  }

  function morphologyStructure(value,targetWord){
    const quality=meaningfulText(value,6);if(!quality.ok)return quality;
    const escaped=String(targetWord||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    if(!escaped||!new RegExp(`\\b${escaped}\\b`,"i").test(String(value||"")))return fail("missing_example",`Use the word “${targetWord}” in your own sentence.`);
    return fail("needs_meaning_check","Dragonswood is checking whether the target word is used with the correct meaning.",{aiEligible:true});
  }

  function morphologyAdvice(value,targetWord){
    const vague=String(value||"").match(/\b(this|that|it|something|stuff|thing)\b/i)?.[0];
    if(vague)return `The word “${vague}” is too vague. Name exactly what it refers to so your sentence clearly shows what “${targetWord}” means.`;
    return `Name who or what is affected and the specific condition or experience connected to “${targetWord}.”`;
  }

  const frames=Object.freeze({
    inference:"State what you infer, then name an action, statement, thought, event, or detail that supports it.",
    writingCommunity:"Give helpful feedback. Try: “If I were you, I would ___ so/because ___.”",
    opinion:"State what you think, then give a connected reason. Try: “I think ___ because ___.”",
    science:"Name an observation or fact, then explain what it shows.",
    morph:"Use the target word in a sentence with enough context to show what the word means.",
    explain:"Answer directly, include one specific detail, and explain how it supports your answer."
  });
  const hints=Object.freeze({
    too_short:"Add one complete thought with a specific detail.",
    too_repetitive:"Replace repeated words with a clear explanation.",
    missing_stance:"Start with what you think, believe, recommend, or would do.",
    missing_reason:"Add “because,” “so,” or another connected result—and explain both sides of that connector.",
    missing_suggestion:"Give one specific change that could help the writer.",
    missing_inference:"Explain what the detail makes you understand, not only what happened.",
    missing_evidence:"Name something the character did, said, thought, noticed, or experienced that supports your idea.",
    needs_source_check:"Make sure the inference agrees with the passage and that the supporting detail really appears there.",
    needs_meaning_check:"Add context that shows who or what is affected and what is happening. Using the target word by itself is not enough.",
    missing_example:"Add one specific example.",
    missing_equation:"Show the equation you used.",
    missing_math_steps:"Explain an important step and how you checked it.",
    off_topic:"Reread the question and answer it directly with one specific detail.",
    copied_prompt:"Use your own words instead of copying the directions.",
    unknown_open_response:"Answer directly, add one specific detail, and explain how the detail supports your answer."
  });
  const frameFor=kind=>frames[kind]||(kind==="quickwrite"?"":frames.explain);
  const hintFor=(kind,result={})=>hints[result.code]||frames[kind]||hints.unknown_open_response;

  return Object.freeze({version:"1.0.2",meaningfulText,connectedReason,opinion,writingCommunity,inference,science,morphologyStructure,morphologyAdvice,frameFor,hintFor});
});
