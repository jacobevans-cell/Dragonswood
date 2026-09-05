import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { WONDER_TESTS } from "../assessment-tests-wonder.generated.js?v=1";
import { CHAPTER_MAPS, STARTER_TESTS } from "../assessment-data.js?v=20260905-4";
import { BOOKS } from "../catalog.js?v=20260905-4";
import { WONDER_META } from "../books/wonder/meta.js?v=1";

const here = dirname(fileURLToPath(import.meta.url));
const book = JSON.parse(await readFile(resolve(here, "../books/wonder/book.json"), "utf8"));
const tests = Object.values(WONDER_TESTS).sort((a, b) => a.chapterNumber - b.chapterNumber);
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
const answerTotals = [0, 0, 0, 0];

assert.equal(WONDER_META.chapters.length, 123, "Wonder must have 123 chapter gates");
assert.equal(WONDER_META.pages, 496, "Wonder reflow page count changed unexpectedly");
assert.equal(book.pages.length, WONDER_META.pages, "book.json and metadata page totals differ");
assert.equal(book.chapters.length, WONDER_META.chapters.length, "book.json and metadata chapter totals differ");
assert.equal(tests.length, WONDER_META.chapters.length, "Every Wonder chapter needs one test");
assert.equal(CHAPTER_MAPS.wonder.chapters.length, 123, "Wonder chapter map is not registered");

let nextPage = 1;
for (const chapter of WONDER_META.chapters) {
  assert.equal(chapter.number, WONDER_META.chapters.indexOf(chapter) + 1, "Chapter numbers must be sequential");
  assert.equal(chapter.startPage, nextPage, `Gap before chapter ${chapter.number}`);
  assert.ok(chapter.endPage >= chapter.startPage, `Invalid range for chapter ${chapter.number}`);
  const pages = book.pages.filter((page) => page.chapterNumber === chapter.number);
  assert.equal(pages.length, chapter.endPage - chapter.startPage + 1, `Page range mismatch in chapter ${chapter.number}`);
  assert.ok(pages.every((page) => page.chapterTitle === chapter.title), `Title mismatch in chapter ${chapter.number}`);
  nextPage = chapter.endPage + 1;
}
assert.equal(nextPage - 1, WONDER_META.pages, "Final chapter does not end on the final reflow page");
book.pages.forEach((page, index) => assert.equal(page.number, index + 1, "Reflow page numbers must be sequential"));

for (const test of tests) {
  const chapter = WONDER_META.chapters[test.chapterNumber - 1];
  assert.equal(test.chapterTitle, chapter.title, `Test title mismatch in chapter ${test.chapterNumber}`);
  assert.equal(test.questions.length, 7, `Chapter ${test.chapterNumber} needs exactly seven questions`);
  assert.deepEqual(test.questions.map((question) => question.skill), expectedSkills, `Question balance failed in chapter ${test.chapterNumber}`);
  assert.equal(test.summaryRequired, true, `Summary must be required in chapter ${test.chapterNumber}`);
  assert.equal(test.summarySentenceCount, 5, `Summary sentence count must be five in chapter ${test.chapterNumber}`);
  assert.equal(test.summaryPrompt, expectedPrompt, `Summary prompt changed in chapter ${test.chapterNumber}`);
  assert.ok(test.summaryGuide.startsWith(`Narrated by ${chapter.pov}.`), `Summary context is missing POV in chapter ${test.chapterNumber}`);
  assert.deepEqual(test.generation.sourcePages, [chapter.startPage, chapter.endPage], `Source range mismatch in chapter ${test.chapterNumber}`);
  assert.equal(test.passingPercent, 80, `Passing score changed in chapter ${test.chapterNumber}`);

  const counts = [0, 0, 0, 0];
  const positions = [];
  for (const question of test.questions) {
    assert.equal(question.type, "multiple-choice", `Wrong question type in chapter ${test.chapterNumber}`);
    assert.equal(question.choices.length, 4, `Question must have four choices in chapter ${test.chapterNumber}`);
    assert.equal(new Set(question.choices).size, 4, `Choices must be unique in chapter ${test.chapterNumber}`);
    assert.ok(Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex <= 3, `Invalid answer index in chapter ${test.chapterNumber}`);
    assert.equal(question.choices[question.correctIndex], question.explanation, `Answer key mismatch in chapter ${test.chapterNumber}`);
    assert.ok(question.prompt.trim() && question.explanation.trim(), `Question text is incomplete in chapter ${test.chapterNumber}`);
    counts[question.correctIndex] += 1;
    answerTotals[question.correctIndex] += 1;
    positions.push(question.correctIndex);
  }
  const rarePosition = (test.chapterNumber - 1) % 4;
  assert.equal(counts[rarePosition], 1, `Rare answer position did not rotate in chapter ${test.chapterNumber}`);
  counts.forEach((count, index) => assert.equal(count, index === rarePosition ? 1 : 2, `Answer balance failed in chapter ${test.chapterNumber}`));
  for (let index = 2; index < positions.length; index += 1) {
    assert.ok(!(positions[index] === positions[index - 1] && positions[index] === positions[index - 2]), `Three repeated answer positions in chapter ${test.chapterNumber}`);
  }
  assert.notDeepEqual(positions, [0, 1, 2, 3, 0, 1, 2], `Recognizable answer pattern in chapter ${test.chapterNumber}`);
}

assert.deepEqual(answerTotals, [215, 215, 215, 216], "Collection-wide answer positions are not balanced");
assert.ok(Object.keys(STARTER_TESTS).length >= 651, "Wonder assessments are missing from the full library");

const catalogBook = BOOKS.find((candidate) => candidate.id === "wonder");
assert.equal(catalogBook.kind, "reflow", "Wonder is not using the reflow reader");
assert.equal(catalogBook.pages, 496, "Wonder catalog page count is stale");
assert.equal(catalogBook.contentFile, "class-library/books/wonder/book.json?v=1", "Wonder content file is not registered");

console.log(JSON.stringify({
  book: "Wonder",
  chapters: tests.length,
  readingPages: book.pages.length,
  questions: tests.reduce((total, test) => total + test.questions.length, 0),
  answerPositions: { A: answerTotals[0], B: answerTotals[1], C: answerTotals[2], D: answerTotals[3] },
  libraryTests: Object.keys(STARTER_TESTS).length,
  summary: "required; exactly five sentences; existing AI grading path"
}, null, 2));
