const fs=require("fs");
const path=require("path");

let failed=0;
function check(name,condition){
  if(condition)console.log("PASS",name);
  else{console.error("FAIL",name);failed++;}
}
function read(file){return fs.readFileSync(path.join(__dirname,file),"utf8");}

const index=read("index.html");
const host=read("v33-integration/js/integration/modules.js");
const studentApp=read("v33-integration/js/student-app.js");
const teacherApp=read("v33-integration/js/teacher-app.js");
const css=read("v33-integration/styles/module-host.css");

check("current portal loads the polished module shell stylesheet",/styles\/module-host\.css/.test(index));
check("current portal loads the polished V3 module host",/js\/integration\/modules\.js/.test(index));
check("module view is part of the signed-in portal",/if\(moduleId\)return moduleHost\.markup\(moduleId\)/.test(studentApp));
check("module frame is created without loading a feature at startup",/<iframe class="v33-module-frame" data-module-frame title="\$\{mod\.title\}"><\/iframe>/.test(host));
check("module frame is destroyed on close",/function closeModule\(\)[\s\S]*location\.hash=mod\?\.returnPage\|\|'adventure'/.test(studentApp));
check("embedded standalone portal links are hidden",host.includes('a[href^="index.html"]'));
check("duplicate standalone headers are force-hidden in the portal",/querySelectorAll\('body>header'\)/.test(host)&&/style\.setProperty\('display','none','important'\)/.test(host));
check("module toolbar has one clear return control",/data-close-module>Back<\/button>/.test(host)&&!host.includes("OPEN SEPARATELY"));
check("academic and mission modules keep their parent navigation highlighted",/returnPage:'games'/.test(host)&&/returnPage:'missions'/.test(host));
check("browser hash routing and close routing are supported",/location\.hash=`module\/\$\{encodeURIComponent\(id\)\}`/.test(studentApp)&&/window\.addEventListener\('hashchange'/.test(studentApp));
check("daily access gate still protects academic games",/function allowed\(id,student=\{\}\)/.test(host)&&/mod\.morningGate&&student\.dailyAccessUnlocked!==true/.test(host));
check("preview-date switching is restricted to localhost and disables production rewards",host.includes("['localhost','127.0.0.1'].includes(pageUrl.hostname)")&&/\(isTeacher\|\|localPreviewMode\)/.test(read("daily-quest.html"))&&/LOCAL PREVIEW COMPLETE/.test(read("daily-quest.html")));
check("active passes still block feature modules",/if\(blockingPass\(\)\)/.test(studentApp));
check("Adventurer Hall uses the V3 module host",/id:'adventurer-hall'[^\n]+path:'adventurer-hall\.html'/.test(host));
check("Boss Battle uses the V3 module host",/id:'boss-battle'[^\n]+path:'boss-battle\.html'/.test(host));
check("core student portal remains directly rendered",["adventure","missions","games","scribe","day","leaderboards"].every(route=>studentApp.includes(`['${route}'`)));
check("teacher seating module remains integrated",/new URL\('\.\.\/seating-command\/index\.html'/.test(teacherApp)&&/Seating Command & Room Builder/.test(teacherApp));

const expected=[
  "adventurer-hall.html","boss-battle.html","daily-quest.html","curriculum-quest.html",
  "decimal-deception.html","math-operations-quest.html","fraction-forge.html",
  "long-division-quest.html","long-division-custom.html","rune-spelling.html",
  "dragon-tongues/index.html","deep-time-lab.html",
  "the_witches_pages_1_15_interactive_test.html","elemental-laboratory.html",
  "cosmic-architect.html","arcane-forge.html","witches-reader.html"
];
for(const file of expected){
  check(`${file} remains a protected standalone module`,fs.existsSync(path.join(__dirname,file))&&host.includes(`path:'${file}'`));
}
check("module host has responsive Chromebook and mobile sizing",/max-width:1050px/.test(css)&&/max-width:620px/.test(css));
check("module host respects reduced motion",/prefers-reduced-motion:reduce/.test(css));
check("production portal module code has no retired V2 destinations",!/(index-v2\.html|teacher-v2\.html)/.test(index+host+css));

if(failed){
  console.error(`\n${failed} portal module self-test(s) failed`);
  process.exit(1);
}
console.log("\n✅ ALL CURRENT-PORTAL MODULE SELF-TESTS PASSED");
