const fs=require("fs"),vm=require("vm");
global.window=global;
vm.runInThisContext(fs.readFileSync("dragonswood-grading-core.js","utf8"));

const cases=[
["1","2/2",true,"whole/fraction equivalence"],
["1","1.0",true,"whole/decimal equivalence"],
["1/2","0.5",true,"fraction/decimal equivalence"],
["2 1/2","5/2",true,"mixed/improper equivalence"],
["$2.50","2.5",true,"currency formatting"],
["12 square units","12",true,"optional unit formatting"],
["45°","45",true,"degree formatting"],
["past tense","past",true,"tense alias"],
["past perfect tense","past perfect",true,"perfect tense alias"],
["4","1",false,"non-equivalent numbers remain wrong"],
["50%","0.5",true,"percent/decimal ratio"],
["50%","50",false,"percent/raw number not equivalent"]
];
let failed=0;
for(const [e,a,w,label] of cases){
 const got=DWGrading.answersEquivalent(e,a);
 if(got!==w){failed++;console.error("FAIL",label,{e,a,w,got})}
 else console.log("PASS",label);
}
const fileChecks={
 "daily-quest.html":["requestDailyQuestionReview",'overrideType:"daily-question"',"DWGrading.answersEquivalent",'"past perfect"'],
 "curriculum-quest.html":["requestAutoQuestionOverride",'overrideType:"auto-question"',"DWGrading.answersEquivalent"],
 "teacher.html":["GRADER EXPECTED","DAILY WORK QUESTION"]
};
for(const [file,needles] of Object.entries(fileChecks)){
 if(!fs.existsSync(file)){failed++;console.error("FAIL missing",file);continue}
 const text=fs.readFileSync(file,"utf8");
 for(const n of needles)if(!text.includes(n)){failed++;console.error("FAIL",file,"missing",n)}
}
if(failed){console.error(`\n❌ ${failed} grading hardening self-test(s) failed.`);process.exit(1)}
console.log("\n✅ ALL GRADING HARDENING SELF-TESTS PASSED");
