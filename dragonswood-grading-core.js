/* Dragonswood academic grading core v2.0
   Grade academic meaning, not cosmetic typing differences.
   Free deterministic checks always run before AI rescue. */
(function(){
  "use strict";
  const VERSION="2.0.0";
  const TENSE_GROUPS=[
    ["past","past tense","simple past","simple past tense"],
    ["present","present tense","simple present","simple present tense"],
    ["future","future tense","simple future","simple future tense"],
    ["past perfect","past perfect tense"],
    ["present perfect","present perfect tense"],
    ["future perfect","future perfect tense"],
    ["past progressive","past progressive tense","past continuous","past continuous tense"],
    ["present progressive","present progressive tense","present continuous","present continuous tense"],
    ["future progressive","future progressive tense","future continuous","future continuous tense"]
  ];

  function normalizeText(v,opts={}){
    let s=String(v??"").normalize("NFKC")
      .replace(/\u00a0/g," ")
      .replace(/[−–—]/g,"-")
      .replace(/[“”]/g,'"')
      .replace(/[‘’]/g,"'")
      .trim()
      .replace(/\s+/g," ");
    if(!opts.caseSensitive)s=s.toLowerCase();
    if(!opts.punctuationSensitive)s=s.replace(/[.,!?;:]+$/g,"").trim();
    return s;
  }

  function strictProfile(q={}){
    const p=normalizeText(q.prompt||"")+" "+normalizeText(q.assessedSkill||q.skill||q.skillId||"");
    const explicit=q.strictConventions===true;
    const capitalization=explicit||/\b(capitali[sz](?:e|ed|ing|ation)?|capital letter|proper noun capitalization)\b/i.test(p);
    const punctuation=explicit||/\b(punctuat|comma|quotation|quote marks?|apostrophe|semicolon|colon|dialogue)\b/i.test(p);
    const spelling=explicit||/\b(spell|spelling|homophone)\b/i.test(p);
    return {caseSensitive:capitalization,punctuationSensitive:punctuation,spellingSensitive:spelling,strict:explicit||capitalization||punctuation||spelling};
  }

  function stripNumericDecorations(v){
    let s=normalizeText(v).replace(/,/g,"").replace(/^\$/,"").replace(/°$/,"").trim();
    const unicode={"½":"1/2","⅓":"1/3","⅔":"2/3","¼":"1/4","¾":"3/4","⅕":"1/5","⅖":"2/5","⅗":"3/5","⅘":"4/5","⅙":"1/6","⅚":"5/6","⅛":"1/8","⅜":"3/8","⅝":"5/8","⅞":"7/8"};
    if(unicode[s])s=unicode[s];
    return s.replace(/\s+(?:square\s+units?|sq\.?\s*units?|cubic\s+units?|units?|minutes?|seconds?|hours?|days?|inches?|feet|foot|yards?|meters?|centimeters?|millimeters?|kilometers?|grams?|kilograms?|liters?|milliliters?|ounces?|pounds?|quarts?|gallons?|cups?)$/i,"").trim();
  }

  function parseNumeric(v){
    let s=stripNumericDecorations(v); if(!s)return null;
    const percent=s.endsWith("%"); if(percent)s=s.slice(0,-1).trim();
    let m=s.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if(m){
      const w=+m[1],n=+m[2],d=+m[3];if(!d)return null;
      const val=w+(w<0?-1:1)*(n/d);return {value:percent?val/100:val,percent};
    }
    m=s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
    if(m){
      const d=+m[2];if(!d)return null;
      const val=+m[1]/d;return Number.isFinite(val)?{value:percent?val/100:val,percent}:null;
    }
    if(/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)){
      const val=+s;return Number.isFinite(val)?{value:percent?val/100:val,percent}:null;
    }
    return null;
  }

  function numericEquivalent(a,b){
    const A=parseNumeric(a),B=parseNumeric(b);if(!A||!B)return false;
    if(A.percent!==B.percent){
      const P=A.percent?A:B,N=A.percent?B:A;
      if(!(Math.abs(P.value-N.value)<=1e-9&&Math.abs(N.value)<=1))return false;
    }
    return Math.abs(A.value-B.value)<=1e-9;
  }

  function aliasEquivalent(a,b){
    const A=normalizeText(a),B=normalizeText(b);
    return A===B||TENSE_GROUPS.some(g=>g.includes(A)&&g.includes(B));
  }

  function answersEquivalent(expected,actual,opts={}){
    const E=normalizeText(expected,opts),A=normalizeText(actual,opts);
    if(!E||!A)return false;
    if(E===A)return true;
    if(!opts.strict&&aliasEquivalent(E,A))return true;
    if(!opts.strict&&numericEquivalent(expected,actual))return true;
    return false;
  }

  function tenseContext(q={}){
    const p=normalizeText(q.prompt||"");
    const e=normalizeText(q.answer||"").replace(/\s+tense$/,"");
    const m=e.match(/^(past|present|future)\s+(perfect|progressive|continuous)$/);
    if(!m)return null;
    const family=m[2]==="continuous"?"progressive":m[2];
    const named=family==="perfect"
      ?(/\bwhich perfect tense\b|\bwhat perfect tense\b|\bperfect tense is used\b/.test(p))
      :(/\bwhich (?:progressive|continuous) tense\b|\bwhat (?:progressive|continuous) tense\b|\b(?:progressive|continuous) tense is used\b/.test(p));
    if(!named)return null;
    return {time:m[1],family,full:`${m[1]} ${family}`};
  }

  function addWrappedForms(set,forms){
    const prefixes=["","the ","it is ","it's ","this is ","answer is ","the answer is ","tense is ","the tense is "];
    for(const raw of forms){
      const f=normalizeText(raw);if(!f)continue;
      prefixes.forEach(prefix=>set.add(normalizeText(prefix+f)));
    }
  }

  function contextualAcceptedAnswers(q={}){
    const strict=strictProfile(q),set=new Set();
    const add=v=>{const n=normalizeText(v,strict);if(n)set.add(n)};
    add(q.answer);
    (q.acceptedAnswers||[]).forEach(add);
    if(strict.strict)return [...set];

    const p=normalizeText(q.prompt||""),e=normalizeText(q.answer||"");
    const tc=tenseContext(q);
    if(tc){
      addWrappedForms(set,[tc.time,`${tc.time} tense`,tc.full,`${tc.full} tense`,`${tc.time}-${tc.family}`]);
    }
    if(/\bpoint of view\b/.test(p)){
      if(/^first(?: person)?$/.test(e))addWrappedForms(set,["first","first person","1st","1st person"]);
      else if(/^third(?: person)?$/.test(e))addWrappedForms(set,["third","third person","3rd","3rd person"]);
    }
    if((/\bfact\b.*\bopinion\b|\bfact or opinion\b/.test(p))&&/^(fact|opinion)$/.test(e))addWrappedForms(set,[e,`a ${e}`]);
    if(/\bangle\b/.test(p)&&/^(acute|right|obtuse|straight)$/.test(e))addWrappedForms(set,[e,`${e} angle`]);
    if(/\bpart of speech\b/.test(p)&&/^(noun|verb|adjective|adverb|pronoun|preposition|conjunction|interjection)$/.test(e))addWrappedForms(set,[e,`a ${e}`,`an ${e}`]);
    return [...set].filter(Boolean);
  }

  function minimalAcceptedAnswer(q={}){
    const strict=strictProfile(q);if(strict.strict)return "";
    const tc=tenseContext(q);if(tc)return tc.time;
    const p=normalizeText(q.prompt||""),e=normalizeText(q.answer||"");
    if(/\bpoint of view\b/.test(p)){
      if(/^first(?: person)?$/.test(e))return "first";
      if(/^third(?: person)?$/.test(e))return "third";
    }
    if((/\bfact\b.*\bopinion\b|\bfact or opinion\b/.test(p))&&/^(fact|opinion)$/.test(e))return e;
    if(/\bangle\b/.test(p)&&/^(acute|right|obtuse|straight)$/.test(e))return e;
    if(e&&!/\s/.test(e)&&e.length<=24)return e;
    return "";
  }

  function questionAnswerEquivalent(q={},actual){
    const strict=strictProfile(q),accepted=contextualAcceptedAnswers(q);
    if(!accepted.length&&q.answer!=null)accepted.push(normalizeText(q.answer,strict));
    return accepted.some(a=>answersEquivalent(a,actual,strict));
  }

  function shouldUseAiRescue(q={},actual,opts={}){
    const a=normalizeText(actual);
    if(!a||a.length<2||q.aiRescue===false)return false;
    const strict=strictProfile(q);
    if(strict.strict||opts.strictConventions===true||opts.mode==="number"||opts.exactTask===true)return false;
    if(parseNumeric(q.answer)!=null&&parseNumeric(actual)!=null)return false;
    if(String(q.prompt||"").length>1400||String(actual||"").length>800||String(q.answer||"").length>500)return false;
    if(Array.isArray(q.choices)&&q.choices.length){
      const actualN=normalizeText(actual);
      const known=q.choices.some(c=>normalizeText(c)===actualN);
      if(known&&!questionAnswerEquivalent(q,actual))return false;
    }
    return true;
  }

  function localGrade(q={},actual){
    const ok=questionAnswerEquivalent(q,actual);
    return {ok,method:ok?"deterministic":"unresolved",normalizedActual:normalizeText(actual),
      minimalAccepted:minimalAcceptedAnswer(q),acceptedCount:contextualAcceptedAnswers(q).length};
  }

  function auditQuestion(q){
    const errors=[];
    if(!q||typeof q!=="object")return ["question is not an object"];
    if(!String(q.prompt??"").trim())errors.push("missing prompt");
    if(!String(q.answer??"").trim())errors.push("missing answer");
    if(Array.isArray(q.choices)&&q.choices.length){
      const n=q.choices.map(x=>normalizeText(x));
      if(new Set(n).size!==n.length)errors.push("duplicate choices");
      if(!q.choices.some(c=>questionAnswerEquivalent(q,c)))errors.push("answer missing from choices");
      if(q.choices.some(c=>/^(?:nan|undefined|null)$/i.test(String(c).trim())))errors.push("invalid choice");
    }
    return errors;
  }

  function assertQuestion(q,context){
    const e=auditQuestion(q);
    if(e.length){console.error("[DW grading audit]",context||"",e,q);return false}
    return true;
  }

  window.DWGrading={version:VERSION,normalizeText,strictProfile,parseNumeric,numericEquivalent,aliasEquivalent,
    answersEquivalent,contextualAcceptedAnswers,minimalAcceptedAnswer,questionAnswerEquivalent,
    shouldUseAiRescue,localGrade,auditQuestion,assertQuestion};
})();