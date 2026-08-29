const fs = require('fs');
const path = require('path');

const root = __dirname;
const retired = [
  'index-v2.html',
  'student-v2.html',
  'teacher-v2.html',
  'Tester1111.html',
  'index-live-welcome-test.html',
  'leaderboard-name-repair.html',
  'dragonswood-v33-test',
  'staged-systems',
  'v33-integration/master-package-reference',
  'dragonswood-v2-core.css',
  'dragonswood-v2-student.css',
  'dragonswood-v2-teacher.css',
  'dragonswood-student-redesign-v2.css',
  'dragonswood-subpage-shell-v2.js',
  'download',
  'download (1)'
];
const current = [
  'index.html',
  'teacher.html',
  'v33-integration/js/student-app.js',
  'v33-integration/js/teacher-app.js',
  'v33-integration/js/integration/academic.js',
  'v33-integration/styles/gradebook-v57.1.8.css',
  'academic-grading-selftest.cjs',
  'dragonswood-grading-core.js',
  'witches-reader.html',
  'the_witches_pages_1_15_interactive_test.html'
];

let failed = 0;
function check(name, condition, detail = '') {
  if (condition) console.log('PASS', name);
  else {
    console.error('FAIL', name, detail);
    failed++;
  }
}

for (const entry of retired) check(`${entry} is retired`, !fs.existsSync(path.join(root, entry)));
for (const entry of current) check(`${entry} is current`, fs.existsSync(path.join(root, entry)));

const retiredFiles = retired.filter(name => /[.](?:html|css|js)$/.test(name));
const retiredPattern = new RegExp(retiredFiles.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'));
const consumers = [];
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(full);
      continue;
    }
    const relative = path.relative(root, full).replace(/\\/g, '/');
    if (!/[.](?:html|js|css|json)$/.test(relative) || /(?:^|-)selftest[.]/.test(relative)) continue;
    if (retiredPattern.test(fs.readFileSync(full, 'utf8'))) consumers.push(relative);
  }
}
scan(root);
check('production runtime has no references to retired portal files', consumers.length === 0, consumers.join(', '));

const student = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const teacher = fs.readFileSync(path.join(root, 'teacher.html'), 'utf8');
check('current student portal is the V3 shell', /<base href="v33-integration\//.test(student));
check('current teacher portal is the V3 shell', /<base href="v33-integration\//.test(teacher));
check('V3 teacher loads the migrated Gradebook design', /gradebook-v57[.]1[.]8[.]css/.test(teacher));

if (failed) {
  console.error(`\n${failed} legacy retirement self-test(s) failed`);
  process.exit(1);
}
console.log('\n✅ LEGACY RUNTIME RETIRED; V3 IS THE ONLY PORTAL');
