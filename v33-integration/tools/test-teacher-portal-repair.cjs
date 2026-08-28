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

assert.match(teacher,/data-open-passes>Passes/,'top header exposes the Passes command center');
assert.match(teacher,/teacher-pass-chip/,'active pass names, types, and times are visible in the header');
assert.match(teacher,/data-attention-audience="selected"/,'Teacher Attention exposes selected-student delivery');
assert.match(teacher,/data-attention-audience="class"/,'whole-class attention remains an explicit choice');
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
for(const file of ['academic','operations','runtime'])assert.match(host,new RegExp(`js/integration/${file}\\.js\\?v=57\\.1\\.5`));
assert.match(host,/js\/teacher-app\.js\?v=57\.1\.5/);

const book=require('../js/integration/academic.js').gradebook(
 [{id:'s1',name:'Scholar',grade:'5',genderGroup:'girl'}],
 [{id:'d1',studentId:'s1',dateKey:'2026-08-28',status:'complete',score:80}],
 [{id:'c1',studentId:'s1',lessonTitle:'Decimals',accuracy:90}],
 [{id:'r1',studentId:'s1',bookId:'witches',dateKey:'2026-08-28',activeSeconds:1200,targetMinutes:20,firstPage:1,lastPage:8}],
 {daily:30,curriculum:50,reading:20,readingTargetMinutes:20,readingAssignedDateKeys:['2026-08-28']}
);
assert.equal(book.rows[0].total,89);
assert.equal(book.rows[0].assignments.length,3);
assert.equal(book.assignedWork,3);
assert.deepEqual(book.weights,{daily:30,curriculum:50,reading:20});
console.log('V3.3 teacher portal repair contracts: PASS (attention selection + pass header + layout + live gradebook + production labels)');
