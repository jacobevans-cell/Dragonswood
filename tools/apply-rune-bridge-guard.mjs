import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const file=resolve(root,'rune-spelling.html');
let text=readFileSync(file,'utf8');
const replacements=[
  [
    'const sounds=Array.isArray(record?.sounds)&&record.sounds.length?record.sounds:String(record?.pronunciation||"").split(/[-·]/).map(part=>part.trim()).filter(Boolean).map(part=>[part,part]);',
    'const sounds=Array.isArray(record?.sounds)?record.sounds.filter(pair=>Array.isArray(pair)&&pair.length===2&&String(pair[0]||"").trim()&&String(pair[1]||"").trim()).map(pair=>[String(pair[0]).trim(),String(pair[1]).trim()]):[];'
  ],
  [
    'function reviewedWordReady(word){return !!word&&word.reviewStatus==="PASS"&&word.auditLedger?.status==="PASS"&&word.auditLedger?.correctionCheck==="PASS"&&word.auditLedger?.dictionary&&word.auditLedger?.sourceScope&&word.auditLedger?.correctionMethod&&word.auditLedger?.correctionEvidence&&word.auditLedger?.reviewedAt&&word.auditLedger?.reviewedBy&&word.syllables&&word.pronunciation&&word.phonograms&&word.definition&&word.example&&word.watch?.length&&normalizeLetters(word.syllables)===normalizeLetters(word.word)&&normalizeLetters(word.phonograms)===normalizeLetters(word.word)}',
    'function soundBridgeIssues(word){const issues=[],pairs=Array.isArray(word?.sounds)?word.sounds:[];if(!pairs.length)issues.push("missing spelling-to-sound bridge");if(pairs.some(pair=>!Array.isArray(pair)||pair.length!==2||!String(pair[0]||"").trim()||!String(pair[1]||"").trim()))issues.push("malformed spelling-to-sound pair");const written=pairs.map(pair=>String(pair?.[0]||"")).join("");if(pairs.length&&normalizeLetters(written)!==normalizeLetters(word?.word))issues.push("bridge chunks do not reconstruct the spelling");if(pairs.length===1&&normalizeLetters(pairs[0][0])===normalizeLetters(word?.word)&&normalizeLetters(pairs[0][1])===normalizeLetters(word?.word))issues.push("unreviewed whole-word echo is not an instructional bridge");return issues}\nfunction reviewedWordReady(word){return !!word&&word.reviewStatus==="PASS"&&word.auditLedger?.status==="PASS"&&word.auditLedger?.correctionCheck==="PASS"&&word.auditLedger?.dictionary&&word.auditLedger?.sourceScope&&word.auditLedger?.correctionMethod&&word.auditLedger?.correctionEvidence&&word.auditLedger?.reviewedAt&&word.auditLedger?.reviewedBy&&word.syllables&&word.pronunciation&&word.phonograms&&word.definition&&word.example&&word.watch?.length&&!soundBridgeIssues(word).length&&normalizeLetters(word.syllables)===normalizeLetters(word.word)&&normalizeLetters(word.phonograms)===normalizeLetters(word.word)}'
  ],
  [
    'if(normalized.status==="approved"&&!reviewedWordReady(word))errors.push(`Row ${row}: academic review, source scope, and independent correction evidence must all PASS before approval.`);',
    'const bridgeIssues=soundBridgeIssues(word);if(bridgeIssues.length)errors.push(`Row ${row} (${word.word||"unnamed"}): ${bridgeIssues.join("; ")}. Supply a human-reviewed V6.4.1 bridge; automatic whole-word fallback is forbidden.`);\n    if(normalized.status==="approved"&&!reviewedWordReady(word))errors.push(`Row ${row}: academic review, source scope, independent correction evidence, and the spelling-to-sound bridge must all PASS before approval.`);'
  ]
];
for(const [before,after] of replacements){
  const count=text.split(before).length-1;
  if(count!==1)throw new Error(`Expected exactly one Rune guard target, found ${count}: ${before.slice(0,70)}`);
  text=text.replace(before,after);
}
writeFileSync(file,text);

