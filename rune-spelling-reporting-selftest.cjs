const fs=require('fs');

let failures=0;
function check(name,ok){if(ok)console.log('PASS',name);else{console.error('FAIL',name);failures++}}

const rune=fs.readFileSync('rune-spelling.html','utf8');
const portal=fs.readFileSync('v33-integration/js/student-app.js','utf8');
const modules=fs.readFileSync('v33-integration/js/integration/modules.js','utf8');
const shell=fs.readFileSync('index.html','utf8');

check('Rune reports the exact case-sensitive portal UID',rune.includes('const studentId=String(dwContext.studentId||"").trim()||storageStudentId;'));
check('Rune preserves the legacy local-storage namespace',rune.includes('const ENGINE_PREFIX=`dw-spelling-v5:${storageStudentId}:${assignmentId}`;'));
check('Rune repairs queued payload IDs before retry',rune.includes('record.payload.studentId=studentId'));
check('Portal scans only the signed-in student legacy outbox',portal.includes('const prefix=`dw-spelling-v5:${legacySpellingStorageId(uid)}:`'));
check('Portal repairs queued records with the exact UID',portal.includes('record.payload.studentId=uid'));
check('Portal retries through the existing authenticated reporter',portal.includes('integrationController.reportSpellingMission({...record.payload})'));
check('Portal removes delivered records and retains pending records',portal.includes("pending.length?localStorage.setItem(key,JSON.stringify(pending)):localStorage.removeItem(key)"));
check('Portal retries after authorization and when back online',portal.includes('queueMicrotask(()=>recoverLegacySpellingOutbox())')&&portal.includes("window.addEventListener('online',()=>recoverLegacySpellingOutbox())"));
check('Rune iframe cache version is current',modules.includes("if(mod.id==='rune-spelling')url.searchParams.set('v','58.1.6')"));
check('Production portal cache version is current',shell.includes('js/student-app.js?v=58.1.6')&&shell.includes('js/integration/modules.js?v=58.1.0'));

if(failures){console.error(`\n${failures} Rune Spelling reporting check(s) failed.`);process.exit(1)}
console.log('\n✅ RUNE SPELLING REPORTING TESTS PASSED');
