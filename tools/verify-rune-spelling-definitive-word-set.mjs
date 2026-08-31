import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const docs = path.join(root, "docs", "rune-spelling-definitive");
const canonical = JSON.parse(fs.readFileSync(path.join(docs, "definitive-word-set.json"), "utf8"));
const lessons = JSON.parse(fs.readFileSync(path.join(docs, "definitive-lessons.json"), "utf8"));
const sourcePath = path.join(docs, "source", canonical.source.file);
const normalize = value => String(value ?? "").toLowerCase().replace(/[^a-z]/g, "");
const sha256 = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").toUpperCase();
const errors = [];
const assertions = (condition, message) => { if (!condition) errors.push(message); };

assertions(fs.existsSync(sourcePath), "Canonical source workbook is missing.");
assertions(sha256(sourcePath) === canonical.source.sha256, "Canonical workbook SHA-256 does not match the manifest.");
assertions(canonical.words.length === 1683, `Expected 1683 canonical words, found ${canonical.words.length}.`);
assertions(new Set(canonical.words.map(item => item.word.toLowerCase())).size === 1683, "Canonical words are not unique.");
assertions(lessons.length === 150, `Expected 150 lessons, found ${lessons.length}.`);

let clipRoutes = 0;
let silentRoutes = 0;
let wholeWordExceptions = 0;
const isolatedAudioExceptions = [];
const checkedAudio = new Map();
for (const word of canonical.words) {
  assertions(word.ownerApproved === true && word.reviewStatus === "PASS", `${word.word}: owner approval is missing.`);
  assertions(word.phonogramChunks.length === word.phonogramSounds.length, `${word.word}: phonogram/sound counts differ.`);
  assertions(word.soundAudio.length === word.phonogramChunks.length, `${word.word}: sound/audio counts differ.`);
  assertions(normalize(word.phonogramChunks.join("")) === normalize(word.word), `${word.word}: phonograms do not reconstruct the word.`);
  for (const [index, route] of word.soundAudio.entries()) {
    if (route.mode === "clip") {
      clipRoutes += 1;
      const fullPath = path.join(root, route.source.replaceAll("/", path.sep));
      assertions(fs.existsSync(fullPath), `${word.word}: audio file is missing for ${word.phonogramChunks[index]}.`);
      if (fs.existsSync(fullPath) && !checkedAudio.has(fullPath)) checkedAudio.set(fullPath, sha256(fullPath));
      if (fs.existsSync(fullPath)) assertions(checkedAudio.get(fullPath).toLowerCase() === route.sha256.toLowerCase(), `${word.word}: audio checksum differs for ${route.source}.`);
    } else if (route.mode === "silent") silentRoutes += 1;
    else if (route.mode === "whole-word-exception") wholeWordExceptions += 1;
    else if (route.mode === "no-isolated-spalding-clip") isolatedAudioExceptions.push({ word: word.word, workbookRow: word.sourceWorkbookRow, phonogram: word.phonogramChunks[index], selectedSound: word.phonogramSounds[index] });
    else errors.push(`${word.word}: unsupported sound route ${route.mode}.`);
  }
}
assertions(isolatedAudioExceptions.length === 1, `Expected one documented isolated-audio exception, found ${isolatedAudioExceptions.length}.`);
assertions(isolatedAudioExceptions[0]?.word === "disappear" && isolatedAudioExceptions[0]?.phonogram === "ear", "The isolated-audio exception is not disappear/ear.");

const lessonWords = lessons.flatMap(lesson => lesson.words);
assertions(lessonWords.length === 1683, `Runtime lessons contain ${lessonWords.length} words instead of 1683.`);
assertions(lessons.every(lesson => lesson.words.length === 11 || lesson.words.length === 12), "A lesson is not 11 or 12 words.");
assertions(new Set(lessons.map(lesson => `${lesson.levelName}|${lesson.week}`)).size === 150, "Lesson level/week identities are not unique.");
assertions(lessonWords.every(word => word.sounds.length === word.phonogramChunks.length && word.soundAudio.length === word.sounds.length), "A runtime word lost sound or audio routing data.");

const bankToken = "const PREBUILT_LESSON_BANK=/*__DRAGONSWOOD_150_LESSON_BANK__*/";
const definitiveDigest = crypto.createHash("sha256").update(JSON.stringify(lessons)).digest("hex");
const htmlReports = [];
for (const name of ["rune-spelling.html", "rune-spelling-rebuild-preview.html"]) {
  const file = path.join(root, name);
  const text = fs.readFileSync(file, "utf8");
  const start = text.indexOf(bankToken);
  const bankBodyStart = start + bankToken.length;
  const separator = text.slice(bankBodyStart).match(/;\r?\nlet lessonBank=/);
  const end = separator ? bankBodyStart + separator.index : -1;
  assertions(start >= 0 && end > start, `${name}: embedded lesson bank marker is missing.`);
  let embedded = [];
  if (start >= 0 && end > start) embedded = JSON.parse(text.slice(start + bankToken.length, end));
  const digest = crypto.createHash("sha256").update(JSON.stringify(embedded)).digest("hex");
  assertions(digest === definitiveDigest, `${name}: embedded bank differs from definitive-lessons.json.`);
  assertions(text.includes("function testRuneMilestones()"), `${name}: dynamic test milestones are missing.`);
  assertions(text.includes("function tuesdayIds(){return words.slice(10)"), `${name}: Tuesday does not use the actual remaining lesson words.`);
  assertions(!text.includes("wordCount:20,meaningEvidence"), `${name}: Wednesday still reports a hardcoded 20-word count.`);
  assertions(!text.includes("contentIds:state.order,wordCount:20"), `${name}: Thursday still reports a hardcoded 20-word count.`);
  const inlineScripts = [...text.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]).filter(code => code.trim());
  for (const [index, code] of inlineScripts.entries()) {
    try { new Function(code); } catch (error) { errors.push(`${name}: inline script ${index + 1} has a syntax error: ${error.message}`); }
  }
  htmlReports.push({ file: name, embeddedLessons: embedded.length, embeddedWords: embedded.flatMap(lesson => lesson.words).length, inlineScriptsChecked: inlineScripts.length, bankSha256: digest });
}

const report = {
  schemaVersion: 1,
  status: errors.length ? "FAIL" : "PASS",
  verifiedAt: new Date().toISOString(),
  sourceWorkbookSha256: canonical.source.sha256,
  counts: {
    canonicalWords: canonical.words.length,
    lessons: lessons.length,
    runtimeWords: lessonWords.length,
    uniqueApprovedAudioFilesUsed: checkedAudio.size,
    phonogramClipRoutes: clipRoutes,
    silentRoutes,
    wholeWordExceptionRoutes: wholeWordExceptions,
    isolatedAudioExceptions: isolatedAudioExceptions.length
  },
  isolatedAudioExceptions,
  htmlReports,
  errors
};
fs.writeFileSync(path.join(docs, "runtime-verification-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
