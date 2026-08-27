const G=require('./dragonswood-grayson-mode.js');
let pass=0,fail=0;
function ok(cond,msg){if(cond){console.log('PASS',msg);pass++;}else{console.error('FAIL',msg);fail++;}}
const contexts=[
 {subject:'math',topic:'operations',label:'Math • Operations',page:'math-operations-quest.html'},
 {subject:'math',topic:'division',label:'Math • Division',page:'long-division-quest.html'},
 {subject:'math',topic:'fraction',label:'Math • Fractions',page:'fraction-forge.html'},
 {subject:'math',topic:'decimal',label:'Math • Decimals',page:'decimal-deception.html'},
 {subject:'science',topic:'chemistry',label:'Science • Chemistry',page:'elemental-laboratory.html'},
 {subject:'science',topic:'astronomy',label:'Science • Space',page:'cosmic-architect.html'},
 {subject:'ela',topic:'language',label:'ELA • Language',page:'spelling-practice.html'},
 {subject:'ela',topic:'reading',label:'ELA • Reading',page:'witches-reader.html'},
 {subject:'ela',topic:'writing',label:'ELA • Writing',page:'curriculum-quest.html'},
 {subject:'history',topic:'history',label:'History',page:'curriculum-quest.html'}
];
for(const ctx of contexts){
  for(let grade=7;grade<=10;grade++){
    for(const lane of ['primary','cross']){
      const p=G.generate(ctx,grade,lane,12345+grade*31+ctx.page.length);
      ok(p.grade>=7&&p.grade<=10,`${ctx.label} ${lane} grade remains 7-10`);
      ok(Array.isArray(p.choices)&&p.choices.length===4,`${ctx.label} ${lane} has four choices`);
      ok(p.choices.map(String).includes(String(p.answer)),`${ctx.label} ${lane} contains correct answer`);
      ok(Boolean(p.lesson&&p.prompt&&p.why),`${ctx.label} ${lane} has lesson/prompt/explanation`);
      if(lane==='cross') ok(['math','science'].includes(p.context.subject),`${ctx.label} cross lane is Math/Science`);
    }
  }
}
const detectionCases=[
  [{page:'daily-quest.html',title:'Daily Quest',visible:'SCIENCE atoms molecules periodic table'},'science','chemistry'],
  [{page:'curriculum-quest.html',title:'Curriculum Quest',visible:'READING infer theme and cite text evidence'},'ela','reading'],
  [{page:'curriculum-quest.html',title:'Curriculum Quest',visible:'SOCIAL STUDIES government constitution civics'},'history','history'],
  [{page:'math-operations-quest.html',title:'Math Operations Quest',visible:'DIVISION quotient remainder'},'math','division'],
  [{page:'cosmic-architect.html',title:'Cosmic Architect',visible:''},'science','astronomy']
];
for(const [input,subject,topic] of detectionCases){const c=G.detectContext(input);ok(c.subject===subject&&c.topic===topic,`detects ${subject}/${topic} from current page context`);}
const mathCross=G.crossContext({subject:'math',topic:'operations'},44);
const sciCross=G.crossContext({subject:'science',topic:'chemistry'},44);
ok(mathCross.subject==='science','Math current subject crosses to Science');
ok(sciCross.subject==='math','Science current subject crosses to Math');
ok(G.gradeForRound(1)===7&&G.gradeForRound(2)===8&&G.gradeForRound(3)===9&&G.gradeForRound(4)===10&&G.gradeForRound(5)===7,'grade band cycles 7→8→9→10');
const src=require('fs').readFileSync(__dirname+'/dragonswood-grayson-mode.js','utf8');
ok(src.includes('GIVE UP / SKIP → NEXT'),'Give Up / Skip → Next button exists');
ok(src.includes("round%3===0?'cross':'primary'"),'Every third challenge is cross-subject');
ok(src.includes('rewardFree:true'),'Mode remains reward-free');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);process.exit(fail?1:0);
