const fs=require("fs"),path=require("path");
let failures=0;
function check(name,ok){if(ok)console.log("PASS",name);else{console.error("FAIL",name);failures++}}
const app=fs.readFileSync("v33-integration/js/student-app.js","utf8");
const css=fs.readFileSync("v33-integration/css/dragonswood.css","utf8");
const shell=fs.readFileSync("index.html","utf8");
const cards=[
  "dragonswood-card-decimal-deception-1200x660.webp",
  "dragonswood-card-math-operations-quest-1200x660.webp",
  "dragonswood-card-elemental-laboratory-1200x660.webp",
  "dragonswood-card-cosmic-architect-1200x660.webp",
  "dragonswood-card-arcane-forge-1200x660.webp",
  "dragonswood-card-deep-time-lab-1200x660.webp"
];
for(const name of cards){
  const relative=`assets/art/quest-game-cards/${name}`,file=path.join("v33-integration",relative),data=fs.readFileSync(file);
  check(`${name} is mapped`,app.includes(relative));
  check(`${name} is a production WebP`,data.length>50000&&data.toString("ascii",0,4)==="RIFF"&&data.toString("ascii",8,12)==="WEBP");
}
check("Quest cards use the recommended crop",/\.game-visual img\s*\{[^}]*object-position:center 11%/s.test(css));
check("Quest cards lazy-load with useful alt text",app.includes('alt="${g[3]} game artwork" loading="lazy" decoding="async"'));
check("Production shell cache-busts the card CSS",shell.includes("css/dragonswood.css?v=58.0.14"));
check("Production shell cache-busts the game registry",shell.includes("js/student-app.js?v=58.1.6"));
if(failures){console.error(`\n${failures} Quest Game card check(s) failed.`);process.exit(1)}
console.log("\n✅ QUEST GAME CARD TESTS PASSED");
