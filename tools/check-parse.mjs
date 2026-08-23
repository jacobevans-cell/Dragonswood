#!/usr/bin/env node
/* Parse every inline <script> in every page, plus every external .js/.mjs.
   Catches the "I edited HTML and broke a script tag" class of mistake.

   Each fragment is written to a temp file and handed to `node --check`, so the
   verdict comes from the real parser rather than a hand-rolled one. Module
   fragments get a .mjs extension so import/export and import.meta are legal.

     node tools/check-parse.mjs        exit 0 = every script parses
*/
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dwparse-'));
let bad = 0, checked = 0;

function parse(code, label, isModule) {
  checked++;
  const file = path.join(tmp, `f${checked}.${isModule ? 'mjs' : 'js'}`);
  fs.writeFileSync(file, code);
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    console.log(`  ok   ${label}`);
  } catch (e) {
    bad++;
    const msg = String(e.stderr || e.message)
      .split('\n').find(l => /SyntaxError|Error:/.test(l)) || 'parse error';
    console.log(`  FAIL ${label}\n        ${msg.trim()}`);
  }
}

for (const f of fs.readdirSync(root).filter(f => /\.m?js$/.test(f)))
  parse(fs.readFileSync(path.join(root, f), 'utf8'), f, f.endsWith('.mjs'));

for (const f of fs.readdirSync(root).filter(f => f.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(root, f), 'utf8');
  let n = 0;
  for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc\s*=/.test(m[1])) continue;
    if (!m[2].trim()) continue;
    parse(m[2], `${f} <script #${++n}>`, /type\s*=\s*["']module["']/.test(m[1]));
  }
}

const toolsDir = path.join(root, 'tools');
if (fs.existsSync(toolsDir))
  for (const f of fs.readdirSync(toolsDir).filter(f => /\.m?js$/.test(f)))
    parse(fs.readFileSync(path.join(toolsDir, f), 'utf8'), `tools/${f}`, true);

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${checked} scripts checked, ${bad} failed`);
process.exit(bad ? 1 : 0);
