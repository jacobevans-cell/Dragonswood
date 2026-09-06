import assert from "node:assert/strict";

import { WILD_ROBOT_2_TESTS } from "../assessment-tests-wild-robot-2.generated.js?v=1";
import { CHAPTER_MAPS, STARTER_TESTS } from "../assessment-data.js?v=20260905-7";
import { BOOKS } from "../catalog.js?v=20260905-7";
import { WILD_ROBOT_2_META } from "../books/wild-robot-2/meta.js?v=1";

const expectedSkills = [
  "Meaningful recall",
  "Sequence",
  "Cause and effect",
  "Motivation or relationship",
  "Inference or evidence",
  "Character development",
  "Central idea, significance, or theme"
];
const expectedPrompt = "Write one paragraph of exactly five complete sentences summarizing what happened in this chapter. Include the most important characters, events, problem or conflict, and outcome. Use your own words and describe events from this chapter only.";
const tests = Object.values(WILD_ROBOT_2_TESTS).sort((a, b) => a.chapterNumber - b.chapterNumber);
const answerTotals = [0, 0, 0, 0];

assert.equal(WILD_ROBOT_2_META.pages, 253, "PDF edition page count changed");
assert.equal(WILD_ROBOT_2_META.storyEndPage, 215, "Story ending page changed");
assert.equal(WILD_ROBOT_2_META.chapters.length, 90, "Book 2 must have 90 chapter gates");
assert.equal(tests.length, 90, "Every chapter needs one assessment");
assert.equal(CHAPTER_MAPS["wild-robot-2"].chapters.length, 90, "Chapter map is not registered");

for (let index = 0; index < WILD_ROBOT_2_META.chapters.length; index += 1) {
  const chapter = WILD_ROBOT_2_META.chapters[index];
  assert.equal(chapter.number, index + 1, "Chapter numbers must be sequential");
  assert.ok(chapter.endPage >= chapter.startPage, `Invalid page range in chapter ${chapter.number}`);
  if (index > 0) {
    assert.equal(chapter.startPage, WILD_ROBOT_2_META.chapters[index - 1].endPage + 1, `Gap before chapter ${chapter.number}`);
  }
}
assert.equal(WILD_ROBOT_2_META.chapters[0].startPage, 12, "Chapter 1 start page changed");
assert.equal(WILD_ROBOT_2_META.chapters.at(-1).endPage, 215, "Final test gate must precede publisher extras");
assert.equal(WILD_ROBOT_2_META.chapters[69].title, "The March Through the City", "Wrapped chapter title is incomplete");

for (const test of tests) {
  const chapter = WILD_ROBOT_2_META.chapters[test.chapterNumber - 1];
  assert.equal(test.chapterTitle, chapter.title, `Title mismatch in chapter ${test.chapterNumber}`);
  assert.equal(test.questions.length, 7, `Chapter ${test.chapterNumber} needs seven questions`);
  assert.deepEqual(test.questions.map((question) => question.skill), expectedSkills, `Question balance failed in chapter ${test.chapterNumber}`);
  assert.equal(test.summaryRequired, true, `Summary must be required in chapter ${test.chapterNumber}`);
  assert.equal(test.summarySentenceCount, 5, `Summary must require five sentences in chapter ${test.chapterNumber}`);
  assert.equal(test.summaryPrompt, expectedPrompt, `Summary prompt changed in chapter ${test.chapterNumber}`);
  assert.ok(test.summaryGuide.trim(), `AI context is missing in chapter ${test.chapterNumber}`);
  assert.deepEqual(test.generation.sourcePages, [chapter.startPage, chapter.endPage], `Source range mismatch in chapter ${test.chapterNumber}`);
  assert.equal(test.passingPercent, 80, `Passing percentage changed in chapter ${test.chapterNumber}`);

  const counts = [0, 0, 0, 0];
  const positions = [];
  for (const question of test.questions) {
    assert.equal(question.type, "multiple-choice", `Wrong question type in chapter ${test.chapterNumber}`);
    assert.equal(question.choices.length, 4, `Question needs four choices in chapter ${test.chapterNumber}`);
    assert.equal(new Set(question.choices).size, 4, `Choices must be unique in chapter ${test.chapterNumber}`);
    assert.ok(Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex <= 3, `Invalid answer index in chapter ${test.chapterNumber}`);
    assert.equal(question.choices[question.correctIndex], question.explanation, `Answer key mismatch in chapter ${test.chapterNumber}`);
    assert.ok(question.prompt.trim() && question.explanation.trim(), `Question text is incomplete in chapter ${test.chapterNumber}`);
    counts[question.correctIndex] += 1;
    answerTotals[question.correctIndex] += 1;
    positions.push(question.correctIndex);
  }
  const rarePosition = (test.chapterNumber - 1) % 4;
  counts.forEach((count, position) => assert.equal(count, position === rarePosition ? 1 : 2, `Position balance failed in chapter ${test.chapterNumber}`));
  for (let index = 2; index < positions.length; index += 1) {
    assert.ok(!(positions[index] === positions[index - 1] && positions[index] === positions[index - 2]), `Three repeated positions in chapter ${test.chapterNumber}`);
  }
  assert.notDeepEqual(positions, [0, 1, 2, 3, 0, 1, 2], `Recognizable answer pattern in chapter ${test.chapterNumber}`);
}

assert.deepEqual(answerTotals, [157, 157, 158, 158], "Book-wide answer positions are not balanced");
assert.ok(Object.keys(STARTER_TESTS).length >= 821, "The Wild Robot Escapes assessments are missing from the full library");

const series = BOOKS.filter((book) => book.seriesId === "wild-robot").sort((a, b) => a.seriesNumber - b.seriesNumber);
assert.deepEqual(series.map((book) => book.id), ["wild-robot-1", "wild-robot-2", "wild-robot-3"], "Wild Robot series order is not registered");
assert.equal(series[1].pages, WILD_ROBOT_2_META.pages, "Catalog and PDF metadata disagree");
assert.equal(series[1].file, "class-library/books/wild-robot-2-escapes.pdf", "Original illustrated PDF is not retained");

console.log(JSON.stringify({
  book: "The Wild Robot Escapes",
  chapters: tests.length,
  questions: tests.reduce((total, test) => total + test.questions.length, 0),
  sourcePages: WILD_ROBOT_2_META.pages,
  storyEndPage: WILD_ROBOT_2_META.storyEndPage,
  answerPositions: { A: answerTotals[0], B: answerTotals[1], C: answerTotals[2], D: answerTotals[3] },
  libraryTests: Object.keys(STARTER_TESTS).length,
  seriesGate: series.map((book) => `${book.seriesNumber}:${book.id}`),
  summary: "required; exactly five sentences; existing AI grading path"
}, null, 2));
