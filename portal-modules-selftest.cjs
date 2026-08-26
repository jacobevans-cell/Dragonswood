const fs=require("fs");
const path=require("path");

let failed=0;
function check(name,condition){
  if(condition)console.log("PASS",name);
  else{console.error("FAIL",name);failed++;}
}
function read(file){return fs.readFileSync(path.join(__dirname,file),"utf8");}

const index=read("index.html");
const host=read("dragonswood-module-host.js");
const css=read("dragonswood-module-host.css");

check("current portal loads the polished module shell stylesheet",/dragonswood-module-host\.css\?v=57\.2/.test(index));
check("current portal loads the polished module host",/dragonswood-module-host\.js\?v=57\.2/.test(index));
check("module view is part of the signed-in portal",/id="view-module"[^>]*data-page="module"/.test(index));
check("module frame is created without loading a feature at startup",/id="dwModuleFrame"[^>]*><\/iframe>/.test(index));
check("module frame is destroyed on close",/frame\.src="about:blank"/.test(host));
check("embedded standalone portal links are hidden",host.includes('a[href^="index.html"]'));
check("duplicate standalone headers are force-hidden in the portal",/querySelectorAll\("body>header"\)/.test(host)&&/style\.setProperty\("display","none","important"\)/.test(host));
check("technical module toolbar buttons are removed",!index.includes("OPEN SEPARATELY")&&!index.includes("BACK TO PORTAL")&&!index.includes("data-close-module"));
check("academic and mission modules keep their parent navigation highlighted",/tab\.dataset\.view===mod\.returnView/.test(host));
check("browser history and close routing are supported",/history\.pushState/.test(host)&&/history\.back\(\)/.test(host)&&/popstate/.test(index));
check("daily access gate still protects academic games",/dailyGate&&window\.DWDailyAccessUnlocked!==true/.test(host));
check("active passes still block feature modules",/window\.DWBlockingPassType/.test(host));
check("Adventurer Hall uses the module host",/data-module="adventurer-hall"/.test(index)&&!/onclick="location\.href='adventurer-hall\.html'"/.test(index));
check("Boss Battle uses the module host",/data-module="boss-battle"/.test(index)&&!/onclick="location\.href='boss-battle\.html'"/.test(index));
check("core student portal remains directly rendered",["view-home","view-quests","view-games","view-scribe","view-planner","view-leaderboard","studentPassHub"].every(id=>index.includes(`id="${id}"`)));
check("teacher seating module remains integrated",/id="seatingCommandFrame"[^>]+seating-command\/index\.html/.test(read("teacher.html")));

const expected=[
  "adventurer-hall.html","boss-battle.html","daily-quest.html","curriculum-quest.html",
  "decimal-deception.html","math-operations-quest.html","fraction-forge.html",
  "long-division-quest.html","long-division-custom.html","spelling-practice.html",
  "the_witches_pages_1_15_interactive_test.html","elemental-laboratory.html",
  "cosmic-architect.html","arcane-forge.html","witches-reader.html"
];
for(const file of expected){
  check(`${file} remains a protected standalone module`,fs.existsSync(path.join(__dirname,file))&&host.includes(`path:"${file}"`));
}
check("module host has responsive Chromebook and mobile sizing",/max-width:1050px/.test(css)&&/max-width:620px/.test(css));
check("module host respects reduced motion",/prefers-reduced-motion:reduce/.test(css));
check("production portal module code has no retired V2 destinations",!/(index-v2\.html|teacher-v2\.html)/.test(index+host+css));

if(failed){
  console.error(`\n${failed} portal module self-test(s) failed`);
  process.exit(1);
}
console.log("\n✅ ALL CURRENT-PORTAL MODULE SELF-TESTS PASSED");
