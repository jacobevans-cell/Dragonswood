'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const read=file=>fs.readFileSync(file,'utf8');
function pass(name,fn){try{fn();console.log('PASS',name)}catch(error){console.error('FAIL',name,'\n ',error.message);process.exitCode=1}}

const boss=read('boss-battle.html');
const hall=read('adventurer-hall.html');
const rules=read('firestore.rules');
const studentTools=read('dragonswood-student-tools.js');
const requestCenter=read('dragonswood-request-center.js');
const grayson=read('dragonswood-grayson-mode.js');
const curriculum=read('curriculum-quest.html');
const noVideo=read('q1-no-video-lessons.js');
const modules=read('v33-integration/js/integration/modules.js');
const passes=read('v33-integration/js/integration/passes.js');
const operations=read('v33-integration/js/integration/operations.js');
const runtime=read('v33-integration/js/integration/runtime.js');
const teacherApp=read('v33-integration/js/teacher-app.js');
const studentApp=read('v33-integration/js/student-app.js');

pass('boss no longer loops by resetting qi to zero',()=>assert(!boss.includes('if(qi>=qs.length)qi=0')));
pass('boss varies each run',()=>assert(boss.includes('dwBossRun:')&&boss.includes('battleRun')));
pass('boss regenerates exhausted question pools',()=>assert(boss.includes('questionCycle++;qs=makeQuestions(questionCycle)')));
pass('daily chest document remains idempotent',()=>assert(boss.includes('lootId=`${user.uid}_${key}`')&&rules.includes("lootId == request.auth.uid + '_' + request.resource.data.dateKey")));
pass('food reward is wired through battle and rules',()=>assert(boss.includes('"snack"')&&rules.includes("'recess','snack','lunch','icecream'")));
pass('clipboard guard covers required learning surfaces',()=>assert(studentTools.includes('path==="daily-quest.html"||path==="curriculum-quest.html"')&&studentTools.includes('#scribeResponse')&&studentTools.includes('["copy","cut","paste","drop"]')));
pass('admin and tester clipboard exemptions remain',()=>assert(studentTools.includes('adminEmails')&&studentTools.includes('tester|admin|teacher')));
pass('student suggestions retain secure history and teacher notes',()=>assert(studentTools.includes('studentSuggestions')&&requestCenter.includes('studentSuggestions')&&requestCenter.includes('studentSuggestionNotes')&&rules.includes('match /studentSuggestions/')&&rules.includes('match /studentSuggestionNotes/')));
pass('focus events remain logging-only evidence',()=>assert(studentTools.includes('focusEvents')&&rules.includes('match /focusEvents/')));

const mathPages=['decimal-deception.html','fraction-forge.html','math-operations-quest.html'];
pass('V3 module registry mounts every current Grayson math game',()=>mathPages.forEach(page=>assert(modules.includes(`path:'${page}'`),page)));
pass('Grayson Mode is loaded by every current math game',()=>mathPages.forEach(page=>assert(read(page).includes('dragonswood-grayson-mode.js'),page)));
pass('Grayson Mode is visibly mounted in every current math game',()=>{for(const [page,target] of [['decimal-deception.html','.controls'],['fraction-forge.html','.difficulty-toggle'],['math-operations-quest.html','.difficulty-row']]){assert(grayson.includes(`page==='${page}'`),page);assert(grayson.includes(`querySelector('${target}')`),target)}});
pass('Grayson Mode teaches before asking',()=>assert(grayson.includes('YOU NEED THIS FIRST')&&grayson.includes('lesson:')));
pass('Grayson Mode is reward-free',()=>assert(grayson.includes('rewardFree:true')&&/no gameplay rewards/i.test(grayson)));

pass('copied curriculum prompts cannot trigger uncertain AI review',()=>assert(curriculum.includes('result.reviewable===false')&&noVideo.includes('reviewable:false,msg:"Answer in your own words')));
pass('system-authored curriculum text is removed from answer boxes',()=>assert(curriculum.includes('function systemAuthoredResponse')&&curriculum.includes('answer=systemAuthoredResponse(x,savedAnswer)?"":savedAnswer')&&noVideo.includes('window.systemAuthoredResponse?.(x,written)')));
pass('system-authored answers are cleared and cannot request review',()=>assert(curriculum.includes('if(result.reviewable===false)')&&curriculum.includes('field.value=""')&&curriculum.includes('before requesting teacher review')));

pass('V3 pass state binds profile before gender-specific bathroom slots',()=>{const profileAt=runtime.indexOf("profileUnsub=watchDoc(['students',user.uid]");const slotsAt=runtime.indexOf("boySlotUnsub=watchDoc(['bathroomSlots','boy']");assert(profileAt>=0&&slotsAt>profileAt);assert(runtime.includes('Passes.bathroomGroup(lastProfile||{})'));assert(passes.includes("profile.genderGroup==='girl'||profile.genderGroup==='girls'"))});
pass('V3 student requests use stable idempotent document IDs',()=>{assert(passes.includes('function requestId(type,uid,dateKey)'));assert(passes.includes('`${uid}_${dateKey}`'));assert(passes.includes('`${uid}_${type}_${dateKey}`'));assert(runtime.includes('Passes.requestId(type,currentUser.uid,dateKey)'));assert(rules.includes("requestId == request.auth.uid + '_' + request.resource.data.type + '_' + request.resource.data.dateKey"))});
pass('pending request rewrites remain limited and idempotent',()=>assert(rules.includes(".hasOnly(['status','createdAt','updatedAt'])")&&rules.includes(".hasOnly(['studentAnswer','attempts','status','requestedAt','updatedAt'])")));
pass('V3 teacher queues collapse legacy pass and Curriculum duplicates',()=>assert(operations.includes('function pendingPasses')&&operations.includes('byStudent=new Map()')&&operations.includes('function curriculumOverrideRequests')&&operations.includes('duplicateIds')));
pass('V3 teacher approvals are atomic and award only once',()=>{assert(runtime.includes('async reviewRecognition(requestId,approve)'));assert(runtime.includes("snap.data().status!=='pending'"));assert(runtime.includes('`recognition_${requestId}`'));assert(runtime.includes('async reviewPass(collection,requestId,approve)'));assert(runtime.includes("requestSnap.data().status!=='pending'"));assert(runtime.includes('S.firestore.runTransaction'))});
pass('one pending extra pass locks every extra-pass type per student',()=>{assert(passes.includes("const pending=Object.entries(requests).find(([,row])=>row?.status==='pending')"));assert(passes.includes("else if(pending){action='pending'"));assert(passes.includes('pendingType:pending?.[0]'));assert(rules.includes('function hasNoOtherPendingExtraPass'));assert(rules.includes("requestId == request.auth.uid + '_' + request.resource.data.type + '_' + request.resource.data.dateKey"))});
pass('V3 teacher and student surfaces expose the current pass workflow',()=>assert(teacherApp.includes('Pending Requests')&&teacherApp.includes('data-pass-approve')&&studentApp.includes('data-active-pass-overlay')));

pass('student-facing production pages do not link retired V2 portals',()=>{
  const pages=['index.html','adventurer-hall.html','boss-battle.html','daily-quest.html','curriculum-quest.html','decimal-deception.html','math-operations-quest.html','fraction-forge.html','spelling-practice.html','the_witches_pages_1_15_interactive_test.html','elemental-laboratory.html','cosmic-architect.html','arcane-forge.html','witches-reader.html','long-division-custom.html','long-division-quest.html'];
  for(const file of pages)assert(!/index-v2\.html|student-v2\.html|teacher-v2\.html|dragonswood-subpage-shell-v2\.js|dragonswood-student-redesign-v2\.css/i.test(read(file)),file);
});
pass('Adventurer Hall and Boss Battle return to the current portal',()=>{for(const [file,page] of [['adventurer-hall.html',hall],['boss-battle.html',boss]]){assert(page.includes('href="index.html"'),file);assert(!page.includes('subpage-shell-v2'),file)}});

if(process.exitCode)process.exit(process.exitCode);
console.log('\n✅ ALL CURRENT V3 IMPROVEMENT SELF-TESTS PASSED');
