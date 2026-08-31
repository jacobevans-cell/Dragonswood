const fs=require("fs"),vm=require("vm"),cp=require("child_process");
let failures=0;
function pass(name,ok,detail=""){if(ok)console.log("PASS",name);else{console.error("FAIL",name,detail);failures++}}
const code=fs.readFileSync("dragonswood-grading-core.js","utf8");
const context={window:{},console};vm.createContext(context);vm.runInContext(code,context);
const G=context.window.DWGrading;
pass("grading core v2 loaded",G?.version==="2.0.0",G?.version);
const pastQ={prompt:"Which perfect tense is used here?",answer:"past perfect"};
const futQ={prompt:"Which perfect tense is used here?",answer:"future perfect"};
const presQ={prompt:"Which perfect tense is used here?",answer:"present perfect"};
pass("caps ignored",G.questionAnswerEquivalent(pastQ,"PAST"));
pass("leading/trailing spaces ignored",G.questionAnswerEquivalent(pastQ,"   past   "));
pass("repeated spaces ignored",G.questionAnswerEquivalent(pastQ,"past   perfect"));
pass("past one-word accepted in perfect context",G.questionAnswerEquivalent(pastQ,"past"));
pass("future one-word accepted in perfect context",G.questionAnswerEquivalent(futQ,"future"));
pass("present one-word accepted in perfect context",G.questionAnswerEquivalent(presQ,"present"));
pass("past is not globally equal to past perfect",!G.answersEquivalent("past perfect","past"));
pass("20+ safe tense forms",G.contextualAcceptedAnswers(pastQ).length>=20,String(G.contextualAcceptedAnswers(pastQ).length));
const constructQ={prompt:"Choose the PERFECT tense verb form: By noon, the scouts ___ the ridge.",answer:"had reached",choices:["had reached","reached","reach","were reaching"]};
pass("multiword construction has no one-word shortcut",G.minimalAcceptedAnswer(constructQ)==="");
pass("perfect identification has one-word shortcut",G.minimalAcceptedAnswer(pastQ)==="past");
pass("whole/fraction equivalence",G.answersEquivalent("1","2/2"));
pass("fraction/decimal equivalence",G.answersEquivalent("1/2","0.5"));
pass("percent/decimal equivalence",G.answersEquivalent("50%","0.5"));
pass("decimal pattern 2.7 accepted",G.answersEquivalent("2.7","2.7"));
pass("decimal pattern 3.2 accepted",G.answersEquivalent("3.2","3.2"));
pass("wrong known choice does not use AI",!G.shouldUseAiRescue({prompt:"Pick one",answer:"past",choices:["past","future"]},"future"));
pass("numeric answer does not use AI",!G.shouldUseAiRescue({prompt:"Solve",answer:"1"},"2/2",{mode:"number"}));
pass("capitalization task stays deterministic",!G.shouldUseAiRescue({prompt:"Which sentence is capitalized correctly?",answer:"Arizona"},"arizona"));
pass("unusual open wording may use AI rescue",G.shouldUseAiRescue({prompt:"Explain why erosion changes land.",answer:"erosion"},"water carries dirt away"));

const daily=fs.readFileSync("daily-quest.html","utf8");
pass("Daily loads current AI client",daily.includes("dragonswood-academic-ai-client.js?v=56.21.5"));
pass("Daily imports Firebase Functions",daily.includes("firebase-functions.js"));
pass("Daily uses contextual equivalence",daily.includes("questionAnswerEquivalent(q,value)"));
pass("Daily blocks multiword cold typing",daily.includes("minimalAcceptedAnswer?.(q)"));
pass("Daily AI rescue helper",daily.includes("async function gradeTypedAnswerWithRescue"));
pass("Daily free response awaits rescue",daily.includes("await gradeTypedAnswerWithRescue(q,value,t)"));
pass("Daily rune awaits rescue",daily.includes("await gradeTypedAnswerWithRescue(q,value,t)"));
pass("Daily displays response-specific AI advice",daily.includes("Accepted! ${result.reason}")&&daily.includes("Almost there—your answer was saved"));
pass("Daily AI fallback remains question-specific",daily.includes("function dailyAiFallbackAdvice")&&daily.includes("more precise synonym")&&daily.includes("more precise antonym"));
pass("Daily review waits for three changed answers",daily.includes("dwRegisterDailyReviewAttempt")&&daily.includes("REVISE ${gate.count}/${gate.required} BEFORE REVIEW"));

const curr=fs.readFileSync("curriculum-quest.html","utf8");
pass("Curriculum loads current AI client",curr.includes("dragonswood-academic-ai-client.js?v=56.21.5"));
pass("Curriculum imports Firebase Functions",curr.includes("firebase-functions.js"));
pass("Curriculum checker async",curr.includes("async function checkActivity(id)"));
pass("Curriculum reasoning rescue",curr.includes("async function curriculumAiRescue"));
pass("Curriculum exposes safe item-state saving",curr.includes("function saveCurriculumItemState(id,itemState)"));
pass("Curriculum cache-busts enhancement loader",curr.includes("q1-curriculum-enhancements.js?v=57.1.6"));
pass("Curriculum displays response-specific AI advice",curr.includes("function curriculumAiAdvice")&&curr.includes("Almost there—your answer was saved"));
pass("Curriculum always has response-aware AI fallback",curr.includes("function curriculumFallbackAdvice")&&curr.includes("morphologyAdvice?.(structured.response,spec.word)"));
pass("Curriculum review waits for three changed answers",curr.includes("registerRevisionAttempt(s,answer,priorAnswer)")&&curr.includes("REVISE ${reviewGate.count}/${reviewGate.required} BEFORE REVIEW"));

const aiClient=fs.readFileSync("dragonswood-academic-ai-client.js","utf8"),aiContext={window:{},console};vm.createContext(aiContext);vm.runInContext(aiClient,aiContext);
pass("AI client exposes student-facing advice",aiContext.window.DWAcademicAI?.version==="1.3.0"&&typeof aiContext.window.DWAcademicAI?.studentAdvice==="function");
pass("AI advice uses specific model reason",aiContext.window.DWAcademicAI.studentAdvice({decision:"review",reason:"Name what the word 'this' refers to."},"fallback")==="Name what the word 'this' refers to.");
pass("AI outage uses safe generic fallback",aiContext.window.DWAcademicAI.studentAdvice({decision:"review",reason:"AI rescue is temporarily unavailable. Use teacher review."},"Add a specific detail.")==="Add a specific detail.");
pass("AI retry-cap falls back to useful first-pass advice",aiContext.window.DWAcademicAI.studentAdvice({decision:"review",reason:"Your daily focused-check cap reached.",strongRetryReason:"Your daily focused-check cap reached.",primaryReason:"The word 'this' is too vague; name what you were subjecting yourself to."},"generic")==="The word 'this' is too vague; name what you were subjecting yourself to.");
const revisionState={};
const initialRevision=aiContext.window.DWAcademicAI.registerRevisionAttempt(revisionState,"I was subjecting myself to this again.");
pass("Original response establishes the revision baseline",initialRevision.count===0&&!initialRevision.unlocked);
const repeatedRevision=aiContext.window.DWAcademicAI.registerRevisionAttempt(revisionState,"  i WAS subjecting myself to this again.  ");
pass("Same answer does not count as a revision",repeatedRevision.repeated&&repeatedRevision.count===0);
aiContext.window.DWAcademicAI.registerRevisionAttempt(revisionState,"I was subjecting myself to loud noise again.");
aiContext.window.DWAcademicAI.registerRevisionAttempt(revisionState,"The coach was subjecting the team to extra drills.");
const thirdRevision=aiContext.window.DWAcademicAI.registerRevisionAttempt(revisionState,"The storm was subjecting the hikers to freezing rain.");
pass("Teacher review unlocks after three genuine revisions",thirdRevision.count===3&&thirdRevision.unlocked);
pass("Client cache normalizes repeated student answers",aiClient.includes("answerFingerprint(p.studentAnswer)")&&aiClient.indexOf("if(sessionCache.has(k))")<aiClient.indexOf("await transport(p)"));

const mathAuto=fs.readFileSync("dragonswood-math-autograding.js","utf8");
pass("Daily loads current Math policy",daily.includes("dragonswood-math-autograding.js?v=57.1.3"));
pass("Math policy reports current version",mathAuto.includes('const VERSION="57.1.3"'));
pass(
  "Exact Math delegates to original deterministic grader",
  mathAuto.includes('if(spec.kind!=="explain")return O.checkActivity(id);')
);
pass(
  "Math wrapper no longer accesses lexical state through window.S",
  !mathAuto.includes("window.S.items")
);

const curriculumEnhancements=fs.readFileSync("q1-curriculum-enhancements.js","utf8");
pass(
  "Repaired Math runtime is cache-busted",
  curriculumEnhancements.includes("dragonswood-math-autograding.js?v=57.1.3")
);

const teacherRoot=fs.readFileSync("teacher.html","utf8"),teacherApp=fs.readFileSync("v33-integration/js/teacher-app.js","utf8");
pass("current Teacher Command loads the hardened academic contract",teacherRoot.includes("js/integration/academic.js?v=58.0.2"));
pass("current Teacher Command keeps V4 evidence-gated grade export",teacherApp.includes("gradeIntegrityVersion!==4||gradebook.reportCardPercentageReady!==true"));
const rules=fs.readFileSync("firestore.rules","utf8");
pass("AI usage teacher-readable",rules.includes("match /academicAiUsage/{docId}"));
pass("AI cache client-denied",rules.includes("match /academicAnswerAiCache/{docId}"));
pass("Override triage metadata is update-safe",rules.includes("'strongRetryUsed','strongRetryDecision','strongRetryConfidence','escalationReason'"));
const backend=fs.readFileSync("functions-academic-ai/index.js","utf8");
pass("Academic rescue keeps the existing nano model",backend.includes('DEFAULT_MODEL="gpt-5-nano"')&&!/gpt-5(?:\.4)?-mini/.test(backend));
pass("Academic rescue uses the raised AI guardrails",backend.includes("perStudentDailyCallCap:40")&&backend.includes("dailyClassCallCap:1000")&&backend.includes("focusedRetryPerStudentDailyCallCap:10")&&backend.includes("focusedRetryDailyClassCallCap:100"));
pass("Server answer cache is checked before paid usage",backend.includes("normalizedAnswer(p.studentAnswer)")&&backend.indexOf("const cacheRef=")<backend.indexOf("try{await reservePaidCall"));
pass("Ambiguous retry uses the same configured model",backend.includes('model:cfg.model,instructions:stage==="focused"?FOCUSED_SYSTEM:SYSTEM'));
pass("Focused retry has separate class and student caps",backend.includes("focusedRetryPerStudentDailyCallCap")&&backend.includes("focusedRetryDailyClassCallCap"));
pass("Focused retry cache is stage-specific",backend.includes("cfg.model,stage,p.mode"));
pass("Only high-confidence AI decisions can resolve",backend.includes('if(confidence!=="high")decision="review"'));
pass("Academic grader requests concise student-facing reasons",backend.includes('one short, student-facing sentence')&&backend.includes('specific unclear or missing part'));
try{cp.execFileSync(process.execPath,["--check","functions-academic-ai/index.js"],{stdio:"pipe"});pass("backend JavaScript syntax",true)}
catch(e){pass("backend JavaScript syntax",false,String(e.stderr||e.message))}
function classicInlineScriptsCompile(file){
  const html=fs.readFileSync(file,"utf8");let count=0;
  for(const match of html.matchAll(/<script\b(?![^>]*\btype=["']module["'])[^>]*>([\s\S]*?)<\/script>/gi)){
    if(!match[1].trim())continue;new vm.Script(match[1],{filename:file});count++;
  }
  return count>0;
}
try{pass("Curriculum classic inline scripts compile",classicInlineScriptsCompile("curriculum-quest.html"))}catch(e){pass("Curriculum classic inline scripts compile",false,e.message)}
try{pass("Daily classic inline scripts compile",classicInlineScriptsCompile("daily-quest.html"))}catch(e){pass("Daily classic inline scripts compile",false,e.message)}
if(failures){console.error(`\n❌ ${failures} ACADEMIC HARDENING TEST(S) FAILED`);process.exit(1)}
console.log("\n✅ ALL ACADEMIC HARDENING + AI RESCUE SELF-TESTS PASSED");
