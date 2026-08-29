const fs = require("fs");
const path = require("path");

const root = __dirname;
const retired = [
  "index-v2.html",
  "student-v2.html",
  "teacher-v2.html",
  "Tester1111.html",
  "index-live-welcome-test.html",
  "dragonswood-v2-core.css",
  "dragonswood-v2-student.css",
  "dragonswood-v2-teacher.css",
  "dragonswood-student-redesign-v2.css",
  "dragonswood-subpage-shell-v2.js",
  "dragonswood-teacher-tools.js",
  "dragonswood-request-center.js",
  "dragonswood-academic-ai-teacher.js"
];
const retiredDirectories = ["dragonswood-v33-test"];
const protectedCurrent = [
  "index.html",
  "teacher.html",
  "dragonswood-module-host.css",
  "dragonswood-module-host.js",
  "dragonswood-grading-core.js",
  "academic-grading-v2-selftest.cjs",
  "dragonswood-live-welcome.css"
];
const preservedHistory = [
  "DEPLOY-v56.21-STUDENT-PORTAL-V2.md",
  "QA-STUDENT-PORTAL-v2-INTEGRATION.md",
  "STUDENT-PORTAL-v2-MIGRATION-INVENTORY.md"
];

let failed = 0;
function check(name, condition, detail = "") {
  if (condition) console.log("PASS", name);
  else {
    console.error("FAIL", name, detail);
    failed++;
  }
}

for (const file of retired) {
  check(`${file} is retired`, !fs.existsSync(path.join(root, file)));
}
for (const dir of retiredDirectories) {
  check(`${dir}/ is retired`, !fs.existsSync(path.join(root, dir)));
}
for (const file of protectedCurrent) {
  check(`${file} is preserved`, fs.existsSync(path.join(root, file)));
}
for (const file of preservedHistory) {
  check(`${file} history is preserved`, fs.existsSync(path.join(root, file)));
}

const retiredPattern = new RegExp(retired.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"));
const consumers = [];
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(full);
      continue;
    }
    const relative = path.relative(root, full).replace(/\\/g, "/");
    if (!/\.(html|js|css|json)$/.test(relative) || /(?:^|-)selftest\./.test(relative)) continue;
    if (retiredPattern.test(fs.readFileSync(full, "utf8"))) consumers.push(relative);
  }
}
scan(root);
check("production runtime has no references to retired V2 files", consumers.length === 0, consumers.join(", "));

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const modules = fs.readFileSync(path.join(root, "v33-integration/js/integration/modules.js"), "utf8");
check("current student root loads the V3 module shell", /<base href="v33-integration\/">/.test(index) && /js\/integration\/modules\.js/.test(index));
check("Adventurer Hall stays in the current V3 module shell", /id:'adventurer-hall'[\s\S]*?path:'adventurer-hall\.html'[\s\S]*?morningGate:true/.test(modules));
check("Boss Battle stays in the current V3 module shell", /id:'boss-battle'[\s\S]*?path:'boss-battle\.html'[\s\S]*?morningGate:true/.test(modules));

if (failed) {
  console.error(`\n${failed} V2 retirement self-test(s) failed`);
  process.exit(1);
}
console.log("\n✅ LEGACY PORTAL RUNTIME RETIRED; CURRENT V3 SYSTEMS AND HISTORY PRESERVED");
