'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const teacher=read('v33-integration/js/teacher-app.js');
const runtime=read('v33-integration/js/integration/runtime.js');
const operations=read('v33-integration/js/integration/operations.js');
const academic=read('v33-integration/js/integration/academic.js');
const host=read('teacher.html');
const dailyQuest=read('daily-quest.html');
const manualPreview=read('v33-integration/tools/manual-preview-runtime.js');

assert.match(teacher,/data-open-passes[^>]*>Pass Control/,'top header exposes the Pass Control command center');
assert.match(teacher,/pending-pass-badge/,'top Pass Control exposes the live pending count');
assert.match(teacher,/teacher-pass-chip/,'active pass names, types, and times are visible in the header');
assert.match(teacher,/data-attention-audience="selected"/,'Teacher Attention exposes selected-student delivery');
assert.match(teacher,/data-attention-audience="class"/,'whole-class attention remains an explicit choice');
assert.match(teacher,/attentionOpen:false/,'Teacher Attention starts collapsed');
assert.match(teacher,/data-edit-selected-students/,'Student Management exposes a direct edit control');
assert.match(teacher,/Foundation — Grade 3/,'spelling assignment exposes the Foundation path');
assert.match(teacher,/Middle School/,'spelling assignment exposes the Middle School path');
assert.match(teacher,/Full Student Profile Editor/,'the full profile editor is restored');
for(const field of ['firstName','grade','genderGroup','classId','spellingGrade','dailyQuestTrack','hp','gold','xp','eggInventory','ownedPets','rpgInventory'])assert.match(teacher,new RegExp(`data-profile-field="${field}"`),`full profile editor exposes ${field}`);
assert.match(runtime,/async updateStudentProfile/,'the teacher runtime saves complete profile edits');
assert.match(runtime,/teacher-profile-edit/,'profile stat changes are audited');
assert.match(manualPreview,/async updateStudentProfile/,'the manual preview supports safe profile-edit testing');
assert.match(dailyQuest,/grade<=3\)return"foundation"/,'automatic Morning Work maps Grade 3 to Foundation');
assert.match(dailyQuest,/grade>=6\)return"challenge"/,'automatic Morning Work maps Grade 6+ to Challenge');
assert.match(runtime,/studentIds,requireAcknowledgment/,'attention payload persists its selected audience');
assert.match(operations,/audienceActive/,'non-targeted students do not receive selected attention');
assert.match(runtime,/gradebookSettings/,'live category settings are subscribed');
assert.match(runtime,/saveGradebookWeights/,'category settings persist through the teacher controller');
assert.match(academic,/normalizeWeights/);
assert.match(academic,/assignedWork/,'gradebook is built from live academic records');
assert.match(teacher,/data-edit-gradebook-weights/);
assert.match(teacher,/data-export-gradebook/);
assert.match(teacher,/grade-assignment-list/);
assert.doesNotMatch(teacher,/Assignment list opened in tester mode|CSV export remains locked|V3\.3 STUDENT BETA/);
assert.doesNotMatch(teacher,/Open in V2/i);
assert.match(teacher,/\.teacher-content,\.teacher-header-inner\{width:100%;max-width:none/,'teacher content no longer wastes the center gutter');
assert.match(teacher,/font-size:12px/,'production readability floor is installed');
assert.match(host,/js\/integration\/academic\.js\?v=58\.1\.4/);
assert.match(host,/js\/integration\/world\.js\?v=57\.1\.6/);
assert.match(host,/js\/integration\/operations\.js\?v=58\.1\.2/);
assert.match(host,/js\/integration\/runtime\.js\?v=58\.1\.8/);
assert.match(host,/js\/teacher-app\.js\?v=58\.1\.9/);

const book=require('../js/integration/academic.js').gradebook(
 [{id:'s1',name:'Scholar',grade:'5',genderGroup:'girl'}],
 [{id:'d1',studentId:'s1',dateKey:'2026-08-31',day:21,session:'morning',status:'complete',accuracy:80,score:999}],
 [{id:'c1',studentId:'s1',itemId:'K-Math-D21-C1-A',dateKey:'2026-08-31',day:21,lessonTitle:'Decimals',questionsSeen:5,autoQuestionsSeen:5,accuracy:90}],
 [{id:'s1_2026-08-31_witches',studentId:'s1',bookId:'witches',dateKey:'2026-08-31',activeSeconds:1200,targetMinutes:20,firstPage:1,lastPage:8}],
 {daily:20,curriculum:40,spelling:20,reading:20,readingTargetMinutes:20,readingAssignedDateKeys:['2026-08-31'],readingTargetsByDate:{'2026-08-31':20}}
);
assert.equal(book.rows[0].total,91);
assert.equal(book.rows[0].assignments.length,3);
assert.equal(book.assignedWork,3);
assert.deepEqual(book.weights,{daily:20,curriculum:40,spelling:20,reading:20});
console.log('V5 teacher portal repair contracts: PASS (attention selection + pass header + layout + live daily gradebook + production labels)');
