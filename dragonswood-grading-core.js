/* Dragonswood grading hardening v1 */
(function(){
  "use strict";
  if (window.DWGrading) return;
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
  function normalizeText(v){
    return String(v??"").normalize("NFKC").replace(/[−–—]/g,"-").replace(/[“”]/g,'"').replace(/[‘’]/g,"'")
      .trim().toLowerCase().replace(/\s+/g," ").replace(/[.,!?;:]+$/g,"").trim();
  }
  function stripNumericDecorations(v){
    let s=normalizeText(v).replace(/,/g,"").replace(/^\$/,"").replace(/°$/,"").trim();
    return s.replace(/\s+(?:square\s+units?|sq\.?\s*units?|cubic\s+units?|units?|minutes?|seconds?|hours?|days?|inches?|feet|foot|yards?|meters?|centimeters?|millimeters?|kilometers?|grams?|kilograms?|liters?|milliliters?|ounces?|pounds?|quarts?|gallons?|cups?)$/i,"").trim();
  }
  function parseNumeric(v){
    let s=stripNumericDecorations(v); if(!s)return null;
    const percent=s.endsWith("%"); if(percent)s=s.slice(0,-1).trim();
    let m=s.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if(m){const w=+m[1],n=+m[2],d=+m[3];if(!d)return null;const val=w+(w<0?-1:1)*(n/d);return {value:percent?val/100:val,percent}}
    m=s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
    if(m){const d=+m[2];if(!d)return null;const val=+m[1]/d;return Number.isFinite(val)?{value:percent?val/100:val,percent}:null}
    if(/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)){const val=+s;return Number.isFinite(val)?{value:percent?val/100:val,percent}:null}
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
  function answersEquivalent(expected,actual){
    const E=normalizeText(expected),A=normalizeText(actual);
    if(!E||!A)return false;
    return E===A||aliasEquivalent(E,A)||numericEquivalent(expected,actual);
  }
  function auditQuestion(q){
    const errors=[];
    if(!q||typeof q!=="object")return ["question is not an object"];
    if(!String(q.prompt??"").trim())errors.push("missing prompt");
    if(!String(q.answer??"").trim())errors.push("missing answer");
    if(Array.isArray(q.choices)&&q.choices.length){
      const n=q.choices.map(normalizeText);
      if(new Set(n).size!==n.length)errors.push("duplicate choices");
      if(!q.choices.some(c=>answersEquivalent(q.answer,c)))errors.push("answer missing from choices");
      if(q.choices.some(c=>/^(?:nan|undefined|null)$/i.test(String(c).trim())))errors.push("invalid choice");
    }
    return errors;
  }
  function assertQuestion(q,context){
    const e=auditQuestion(q);if(e.length){console.error("[DW grading audit]",context||"",e,q);return false}return true;
  }
  window.DWGrading={version:"1.0.0",normalizeText,parseNumeric,numericEquivalent,aliasEquivalent,answersEquivalent,auditQuestion,assertQuestion};
})();
