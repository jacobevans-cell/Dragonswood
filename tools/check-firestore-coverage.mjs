#!/usr/bin/env node
/**
 * Static coverage check for firestore.rules.
 *
 * This catches the class of bug that shipped in v56.1: code writing to a
 * collection, or writing a FIELD on students, that no rule permits — so the
 * write silently fails in front of a student.
 *
 * It is not a substitute for emulator tests. It is the cheap check that runs
 * on every build and would have caught bossLoot, rpgPurchases, classId,
 * rpgInventory, ownedPets and bossWins before deployment.
 *
 *   node tools/check-firestore-coverage.mjs
 *   exit 0 = clean, exit 1 = something is written but not permitted
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const rules = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');

const sources = fs.readdirSync(root)
  .filter(f => /\.(html|js|mjs)$/.test(f))
  .map(f => ({ file: f, text: fs.readFileSync(path.join(root, f), 'utf8') }));

let failed = false;
const fail = (...a) => { failed = true; console.log('  FAIL ', ...a); };
const ok   = (...a) => console.log('  ok   ', ...a);

/* ---------------------------------------------------- 1. collections ---- */
const ruled = new Set(
  [...rules.matchAll(/match\s+\/([A-Za-z][A-Za-z0-9_]*)\s*\/\s*\{/g)].map(m => m[1])
);

const used = new Map();               // collection -> Set(file)
for (const { file, text } of sources) {
  for (const m of text.matchAll(/(?:collection|doc)\(\s*db\s*,\s*["'`]([A-Za-z][A-Za-z0-9_]*)["'`]/g)) {
    if (!used.has(m[1])) used.set(m[1], new Set());
    used.get(m[1]).add(file);
  }
}

console.log('COLLECTIONS');
for (const [name, files] of [...used].sort()) {
  if (ruled.has(name)) ok(`${name}  (${[...files].join(', ')})`);
  else fail(`${name} is written by ${[...files].join(', ')} but has no "match /${name}/" rule — every write is denied by the catch-all.`);
}

/* --------------------------------------------- 2. students doc fields --- */
// Which field names may a student ever change? Union of every hasOnly list
// inside the students block, plus anything a teacher-only path covers.
const studentsBlock = (() => {
  // NOTE: the path itself contains braces ({studentId}), so start scanning
  // from the brace that opens the body, not the first brace after 'match'.
  const m = /match\s+\/students\/\{[^}]*\}\s*\{/.exec(rules);
  if (!m) return '';
  const start = m.index + m[0].length - 1;      // the body's opening brace
  let depth = 0;
  for (let k = start; k < rules.length; k++) {
    if (rules[k] === '{') depth++;
    else if (rules[k] === '}') { depth--; if (!depth) return rules.slice(m.index, k + 1); }
  }
  return rules.slice(m.index);
})();

const allowedFields = new Set();
for (const m of studentsBlock.matchAll(/hasOnly\(\[([^\]]*)\]\)/g))
  for (const f of m[1].matchAll(/'([^']+)'/g)) allowedFields.add(f[1]);

// Fields the client actually writes onto students/{uid}
const CLIENT_WRITE = /(?:tx\.update|updateDoc|batch\.update|batch\.set|setDoc)\s*\([^;]{0,600}?students[^;]{0,600}/g;
const written = new Map();
for (const { file, text } of sources) {
  // collect object literals assigned as update payloads near a students ref
  for (const m of text.matchAll(/\b(?:update|loot|payload)\s*=\s*\{([^{}]{0,900})\}/g))
    for (const f of m[1].matchAll(/([A-Za-z_][A-Za-z0-9_]*)\s*:/g)) {
      if (!written.has(f[1])) written.set(f[1], new Set());
      written.get(f[1]).add(file);
    }
  for (const m of text.matchAll(/update\.([A-Za-z_][A-Za-z0-9_]*)\s*=/g)) {
    if (!written.has(m[1])) written.set(m[1], new Set());
    written.get(m[1]).add(file);
  }
}

// Field names that belong to other collections' payloads; ignore them here.
const NOT_STUDENT = new Set(['studentId','dateKey','status','enemyId','goldAward','xpAward',
  'rareGoal','goalPoints','itemId','eggAward','createdAt','purchasedAt','cost','points','goal',
  'lastLootId','sessionId','responseText','merge','gameId','score','correct','attempts','day',
  'session','skills','startedAt','finishedAt','activeSeconds','idleEvents']);

console.log('\nSTUDENT DOC FIELDS');
const RPG = ['classId','classChosenAt','rpgInventory','eggInventory','ownedPets',
             'lastHatchedPet','rpgEquipped','activePet','bossWins','lastBossWinDate'];
for (const f of RPG) {
  if (allowedFields.has(f)) ok(`students.${f} is covered by a student-writable path`);
  else fail(`students.${f} is written by the RPG pages but appears in no hasOnly() list — students cannot write it.`);
}
for (const [f, files] of [...written].sort()) {
  if (NOT_STUDENT.has(f) || RPG.includes(f) || allowedFields.has(f)) continue;
  console.log(`  note  ${f} written in ${[...files].join(', ')} — confirm which collection it targets`);
}

/* ------------------------------------------------ 3. structural sanity -- */
console.log('\nSTRUCTURE');
const open = (rules.match(/\{/g) || []).length, close = (rules.match(/\}/g) || []).length;
open === close ? ok(`braces balanced (${open})`) : fail(`brace mismatch: ${open} { vs ${close} }`);

const catchAll = rules.lastIndexOf('match /{document=**}');
const lastNamed = [...rules.matchAll(/match\s+\/[A-Za-z]/g)].pop()?.index ?? -1;
catchAll > lastNamed
  ? ok('catch-all deny sits after every named rule')
  : fail('the catch-all appears before named rules — misleading, move it to the end');

console.log('\n' + (failed ? 'COVERAGE CHECK FAILED' : 'COVERAGE CHECK PASSED'));
process.exit(failed ? 1 : 0);
