const fs=require("fs"),vm=require("vm");
let failed=0;
const fail=(label,detail="")=>{failed++;console.error("FAIL",label,detail)};
const pass=label=>console.log("PASS",label);
const context={window:{},console};
vm.createContext(context);
for(const file of ["q1-curriculum-data.js","q1-curriculum-day24-plus-videos.js","q1-curriculum-day24-overrides.js"]){
  vm.runInContext(fs.readFileSync(file,"utf8"),context,{filename:file});
}
vm.runInContext(fs.readFileSync("dragonswood-grading-core.js","utf8"),context,{filename:"dragonswood-grading-core.js"});
const items=context.window.DRAGONSWOOD_DATA.items;
const expected={
  "I-HUM-D24-C1-A":{title:"Morphology I Q1 lesson 5.2",url:"1t-C4HcPgljNDVtA8qulE0tnnrMs9_iZOLI4tN1341Zs"},
  "K-HUM-D24-C1-A":{title:"Morphology K Q1 lesson 5.1",url:"1CmGQWq9AuZgB5rywl_GEkhYseaFR0YJnF41b2ejSOAk"}
};
for(const [id,want] of Object.entries(expected)){
  const item=items.find(row=>row.id===id);
  item&&item.resourceName===want.title&&item.resourceUrl.includes(want.url)?pass(`${id} morphology preserved`):fail(`${id} morphology changed`,item);
}
for(const grade of ["I","K"]){
  const reading=items.find(row=>row.id===`${grade}-HUM-D24-PACING-VIDEO`);
  const writing=items.find(row=>row.id===`${grade}-HUM-D24-C3-A`);
  reading?.resourceUrl.endsWith("D24%20-%20Characters%20-%20Character%20Traits%20and%20Analysis.mp4")?pass(`${grade} Characters R2 video`):fail(`${grade} Characters video`,reading?.resourceUrl);
  writing?.resourceUrl.endsWith("D24%20-%20Conjunctions.mp4")?pass(`${grade} Conjunctions R2 video`):fail(`${grade} Conjunctions video`,writing?.resourceUrl);
  reading?.lessonQuestions?.length===8&&reading.lessonQuestions.every(q=>q.choices.includes(q.answer))?pass(`${grade} Characters questions`):fail(`${grade} Characters questions`);
  writing?.lessonQuestions?.length===12&&writing.lessonQuestions.every(q=>q.choices.includes(q.answer))?pass(`${grade} Conjunctions and sentence-structure questions`):fail(`${grade} Conjunctions and sentence-structure questions`);
  const second=writing?.additionalVideos?.find(video=>video.id==="sentence-structures");
  second?.url.endsWith("D24%20-%20Simple%20Compound%20and%20Complex%20Sentences.mp4")&&second.durationSeconds===272?pass(`${grade} sentence-structures R2 video`):fail(`${grade} sentence-structures video`,second);
  [...(reading?.lessonQuestions||[]),...(writing?.lessonQuestions||[])].every(q=>context.window.DWGrading.auditQuestion(q).length===0)?pass(`${grade} question fairness audit`):fail(`${grade} question fairness audit`);
  reading?.applicationPrompt&&writing?.applicationPrompt?pass(`${grade} written applications`):fail(`${grade} written applications`);
}
const html=fs.readFileSync("curriculum-quest.html","utf8");
html.includes('q1-curriculum-day24-overrides.js?v=1')?pass("Day 24 overrides loaded"):fail("Day 24 overrides not loaded");
html.includes('function allRequiredVideosWatched')&&html.includes('videoParts:state.videoParts')&&html.includes('part.videoReflection=answer')?pass("separate required-video tracking"):fail("separate required-video tracking");
if(failed){console.error(`\n${failed} DAY 24 SELF-TEST(S) FAILED`);process.exit(1)}
console.log("\nALL DAY 24 CURRICULUM SELF-TESTS PASSED");
