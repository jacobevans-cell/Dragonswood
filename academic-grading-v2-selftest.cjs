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
pass("Daily loads current AI client",daily.includes("dragonswood-academic-ai-client.js?v=56.21.2"));
pass("Daily imports Firebase Functions",daily.includes("firebase-functions.js"));
pass("Daily uses contextual equivalence",daily.includes("questionAnswerEquivalent(q,value)"));
pass("Daily blocks multiword cold typing",daily.includes("minimalAcceptedAnswer?.(q)"));
pass("Daily AI rescue helper",daily.includes("async function gradeTypedAnswerWithRescue"));
pass("Daily free response awaits rescue",daily.includes("await gradeTypedAnswerWithRescue(q,value,t)"));
pass("Daily rune awaits rescue",daily.includes("await gradeTypedAnswerWithRescue(q,value,t)"));
pass("Daily displays response-specific AI advice",daily.includes("Accepted! ${result.reason}")&&daily.includes("Almost there—your answer was saved"));

const curr=fs.readFileSync("curriculum-quest.html","utf8");
pass("Curriculum loads current AI client",curr.includes("dragonswood-academic-ai-client.js?v=56.21.2"));
pass("Curriculum imports Firebase Functions",curr.includes("firebase-functions.js"));
pass("Curriculum checker async",curr.includes("async function checkActivity(id)"));
pass("Curriculum reasoning rescue",curr.includes("async function curriculumAiRescue"));
pass("Curriculum exposes safe item-state saving",curr.includes("function saveCurriculumItemState(id,itemState)"));
pass("Curriculum cache-busts enhancement loader",curr.includes("q1-curriculum-enhancements.js?v=57.1.6"));
pass("Curriculum displays response-specific AI advice",curr.includes("function curriculumAiAdvice")&&curr.includes("Almost there—your answer was saved"));

const aiClient=fs.readFileSync("dragonswood-academic-ai-client.js","utf8"),aiContext={window:{},console};vm.createContext(aiContext);vm.runInContext(aiClient,aiContext);
pass("AI client exposes student-facing advice",aiContext.window.DWAcademicAI?.version==="1.2.0"&&typeof aiContext.window.DWAcademicAI?.studentAdvice==="function");
pass("AI advice uses specific model reason",aiContext.window.DWAcademicAI.studentAdvice({decision:"review",reason:"Name what the word 'this' refers to."},"fallback")==="Name what the word 'this' refers to.");
pass("AI outage uses safe generic fallback",aiContext.window.DWAcademicAI.studentAdvice({decision:"review",reason:"AI rescue is temporarily unavailable. Use teacher review."},"Add a specific detail.")==="Add a specific detail.");

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
pass("Ambiguous retry uses the same configured model",backend.includes('model:cfg.model,instructions:stage==="focused"?FOCUSED_SYSTEM:SYSTEM'));
pass("Focused retry has separate class and student caps",backend.includes("focusedRetryPerStudentDailyCallCap")&&backend.includes("focusedRetryDailyClassCallCap"));
pass("Focused retry cache is stage-specific",backend.includes("cfg.model,stage,p.mode"));
pass("Only high-confidence AI decisions can resolve",backend.includes('if(confidence!=="high")decision="review"'));
pass("Academic grader requests concise student-facing reasons",backend.includes('one short, student-facing sentence')&&backend.includes('specific unclear or missing part'));
try{cp.execFileSync(process.execPath,["--check","functions-academic-ai/index.js"],{stdio:"pipe"});pass("backend JavaScript syntax",true)}
catch(e){pass("backend JavaScript syntax",false,String(e.stderr||e.message))}
if(failures){console.error(`\n❌ ${failures} ACADEMIC HARDENING TEST(S) FAILED`);process.exit(1)}
console.log("\n✅ ALL ACADEMIC HARDENING + AI RESCUE SELF-TESTS PASSED");
