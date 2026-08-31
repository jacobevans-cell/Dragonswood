const assert=require('assert');
const Academic=require('./v33-integration/js/integration/academic.js');

const roster=[{id:'student-a',name:'Aster',grade:4,spellingGrade:4}];
const dailyRows=[
  {id:'old-morning',studentId:'student-a',grade:4,dateKey:'2026-08-29',day:20,session:'morning',status:'complete',accuracy:100,score:999},
  {id:'current-morning',studentId:'student-a',grade:4,dateKey:'2026-08-31',day:21,session:'morning',status:'complete',accuracy:50,score:500}
];
const curriculumRows=[
  {id:'old-curriculum',studentId:'student-a',itemId:'I-Math-D20-C1-A',grade:4,day:20,dateKey:'2026-08-29',questionsSeen:5,autoQuestionsSeen:5,questionsCorrect:5,accuracy:100,writtenPassed:true,applicationScore:100},
  {id:'current-curriculum',studentId:'student-a',itemId:'I-Math-D21-C1-A',grade:4,day:21,dateKey:'2026-08-31',questionsSeen:5,autoQuestionsSeen:5,questionsCorrect:4,accuracy:80,writtenPassed:false,applicationScore:0}
];
const spellingRows=[
  {id:'old-spelling',studentId:'student-a',levelKey:'grade4',week:3,dateKey:'2026-08-29',schoolWeekId:'2026-08-24',mode:'daily-mission',missionId:'monday-discover-1',status:'complete',accuracy:100,correctedAccuracy:100,attempts:10},
  {id:'current-spelling-daily',studentId:'student-a',levelKey:'grade4',week:4,dateKey:'2026-08-31',schoolWeekId:'2026-08-31',mode:'daily-mission',missionId:'monday-discover-1',status:'complete',accuracy:75,correctedAccuracy:100,attempts:10},
  {id:'current-spelling-mastery',studentId:'student-a',levelKey:'grade4',week:4,dateKey:'2026-08-31',schoolWeekId:'2026-08-31',mode:'weekly-mastery',missionId:'thursday-mastery',status:'complete',accuracy:70,score:70,officialAttempt:true}
];
const readingRows=[
  {id:'student-a_2026-08-29_witches',studentId:'student-a',bookId:'witches',dateKey:'2026-08-29',activeSeconds:1200,targetMinutes:20},
  {id:'student-a_2026-08-31_witches',studentId:'student-a',bookId:'witches',dateKey:'2026-08-31',activeSeconds:600,targetMinutes:20}
];
const settings={
  gradeIntegrityVersion:4,
  minimumAcademicDay:21,
  currentGradeStartDate:'2026-08-31',
  readingAssignedDateKeys:['2026-08-29','2026-08-31'],
  readingTargetsByDate:{'2026-08-29':20,'2026-08-31':20}
};

const gradebook=Academic.gradebook(roster,dailyRows,curriculumRows,readingRows,spellingRows,settings);
const row=gradebook.rows[0];

assert.deepStrictEqual({...gradebook.weights},{daily:20,curriculum:40,spelling:20,reading:20},'Older settings migrate to the V6 completed-evidence weights');
assert.deepStrictEqual({...gradebook.policy},{minimumAcademicDay:21,currentGradeStartDate:'2026-08-31',recoveryIncludedInCurrent:true});
assert.strictEqual(Academic.dailyAcademicScore(dailyRows[1]),60,'Morning Work uses academic accuracy plus completion, not game score');
assert.strictEqual(Academic.curriculumAcademicScore(curriculumRows[1]),56,'Curriculum combines 70% auto mastery and 30% application');
assert.strictEqual(Academic.curriculumAcademicScore({autoQuestionsSeen:0,questionsSeen:1,accuracy:0,writtenPassed:true,applicationScore:100}),100,'Writing-only curriculum uses the application score');
assert.strictEqual(row.daily,80);
assert.strictEqual(row.curriculum,78);
assert.strictEqual(row.spellingDaily,90);
assert.strictEqual(row.spellingMastery,70);
assert.strictEqual(row.spelling,78);
assert.strictEqual(row.reading,75);
assert.strictEqual(row.total,78);
assert.strictEqual(row.dailyGrades.length,2);
assert.strictEqual(row.dailyGrades[0].dateKey,'2026-08-29');
assert.strictEqual(row.dailyGrades[1].dateKey,'2026-08-31');
assert.strictEqual(row.recovery.total,100,'Historical evidence keeps its own audit subtotal');
assert.strictEqual(row.recovery.includedInCurrent,true);
assert.strictEqual(row.recovery.count,4);
assert.strictEqual(gradebook.gradeIntegrityVersion,6);
assert.strictEqual(gradebook.reportCardPercentageReady,true);

const dayTwentyAfterCutoff=Academic.evidencePeriod({day:20,dateKey:'2026-09-01'},gradebook.policy);
const dayTwentyOneBeforeCutoff=Academic.evidencePeriod({day:21,dateKey:'2026-08-30'},gradebook.policy);
assert.strictEqual(dayTwentyAfterCutoff,'recovery','Day 1–20 never enters the current grade');
assert.strictEqual(dayTwentyOneBeforeCutoff,'recovery','Pre-adoption evidence stays in recovery');

const emptySecondStudent=Academic.gradebook([...roster,{id:'student-b',name:'Bramble',grade:4,spellingGrade:4}],dailyRows,curriculumRows,readingRows,spellingRows,settings);
const missingRow=emptySecondStudent.rows[1];
assert.strictEqual(missingRow.total,null,'A scholar with no completed evidence has no artificial zero grade');
assert.ok(missingRow.missing>0&&missingRow.provisional,'Missing work remains visible and keeps the grade provisional');
assert.ok(missingRow.assignments.filter(item=>item.status==='missing').every(item=>item.score===null),'Every missing assignment is unscored instead of zero');
assert.strictEqual(emptySecondStudent.classAverage,78,'The class average excludes scholars with no completed graded evidence');

console.log('PASS daily grading weights and academic scoring');
console.log('PASS Day 21 / 2026-08-31 current-grade boundary');
console.log('PASS completed historical grades included in overall averages');
console.log('PASS missing work is provisional, unscored, and excluded from averages');
console.log('\n✅ DAILY GRADEBOOK V6 SELF-TESTS PASSED');
