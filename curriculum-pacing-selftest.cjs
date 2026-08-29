const fs=require("fs"),vm=require("vm");
let failed=0;
const pass=x=>console.log("PASS",x);
const fail=(x,detail="")=>{failed++;console.error("FAIL",x,detail)};

const engine=fs.readFileSync("curriculum-question-engine.js","utf8")+
  "\n;globalThis.__pacingTest={DW_CURRIC_ITEMS,DW_SKILLS,dwTopicSkills,dwCurricPractice,dwValidQuestion};";
const context={console,window:{}};vm.createContext(context);vm.runInContext(engine,context,{timeout:30000});
const T=context.__pacingTest;

let generated=0;
for(const item of T.DW_CURRIC_ITEMS.filter(x=>Number(x.day)<=40&&(
  (x.subject==="Math"&&/Core Math/i.test(x.strand||""))||
  (x.subject==="HUM"&&/-L\d+$/.test(x.id))
))){
  const questions=T.dwCurricPractice(item,6);
  for(const q of questions){
    generated++;
    if(q.source!=="registry"||!T.dwValidQuestion(q))fail(`${item.id} generated an ungradable question`);
  }
}
if(generated>=400)pass(`${generated} Q1 sample questions are registry-generated and gradable`);
else fail("Q1 sample coverage",`only ${generated} questions generated`);

const day16=T.DW_CURRIC_ITEMS.find(x=>x.id==="I-Math-D16-C3-L1");
const day17=T.DW_CURRIC_ITEMS.find(x=>x.id==="I-Math-D17-C3-L1");
const d16=T.dwCurricPractice(day16,12),d17=T.dwCurricPractice(day17,12);
if(d16.length&&d16.every(q=>q.skillId==="math.add.multi"))pass("4th-grade Day 16 is locked to multi-digit addition");
else fail("4th-grade Day 16 addition lock",[...new Set(d16.map(q=>q.skillId))]);
if(d17.length&&d17.every(q=>q.skillId==="math.sub.multi"))pass("4th-grade Day 17 is locked to multi-digit subtraction");
else fail("4th-grade Day 17 subtraction lock",[...new Set(d17.map(q=>q.skillId))]);

const daily=fs.readFileSync("daily-quest.html","utf8"),teacher=fs.readFileSync("v33-integration/js/teacher-app.js","utf8"),operations=fs.readFileSync("v33-integration/js/integration/operations.js","utf8"),runtime=fs.readFileSync("v33-integration/js/integration/runtime.js","utf8");
for(const [label,needle] of [
  ["daily pacing contract","function dwBuildPacingLesson"],
  ["fail-closed daily generator","if(task?.pacingLocked) throw new Error"],
  ["pacing metadata in teacher review","pacingItemId:String(t.pacingItemId"],
  ["AI rescue preserved","gradeTypedAnswerWithRescue"],
  ["all approved game engines preserved","DW_PACING_ENGINES"],
])daily.includes(needle)?pass(label):fail(label);
if(!daily.includes("const grade4Spiral=")&&!daily.includes("const sourcePool=L.track"))pass("unrelated spiral injection removed");
else fail("unrelated spiral injection still present");
if(teacher.includes("Curriculum Review Queue")&&teacher.includes("Return question")&&operations.includes("curriculumOverrideKey")&&runtime.includes("ids.forEach(id=>batch.set"))pass("teacher queue deduplicates and explains returns");
else fail("teacher queue review safeguards");

if(failed){console.error(`\n❌ ${failed} CURRICULUM PACING SELF-TEST(S) FAILED`);process.exit(1)}
console.log("\n✅ ALL CURRICULUM PACING SELF-TESTS PASSED");
