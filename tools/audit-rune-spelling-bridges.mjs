import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'rune-spelling.html'),'utf8');
const marker='const PREBUILT_LESSON_BANK=/*__DRAGONSWOOD_150_LESSON_BANK__*/';
const start=html.indexOf(marker);
const end=html.indexOf('];\nlet lessonBank=',start);
if(start<0||end<0)throw new Error('Rune lesson bank markers were not found.');
const lessons=JSON.parse(html.slice(start+marker.length,end+1));
const letters=value=>String(value??'').toLowerCase().replace(/[^a-z]/g,'');
const defects=[];
for(const lesson of lessons){
  for(const word of lesson.words||[]){
    const pairs=Array.isArray(word.sounds)?word.sounds:[],reasons=[];
    if(!pairs.length)reasons.push('missing-bridge');
    if(pairs.some(pair=>!Array.isArray(pair)||pair.length!==2||!String(pair[0]||'').trim()||!String(pair[1]||'').trim()))reasons.push('malformed-pair');
    if(pairs.length&&letters(pairs.map(pair=>pair?.[0]).join(''))!==letters(word.word))reasons.push('spelling-reconstruction-failed');
    if(pairs.length===1&&letters(pairs[0]?.[0])===letters(word.word)&&letters(pairs[0]?.[1])===letters(word.word))reasons.push('whole-word-echo');
    if(reasons.length)defects.push({lessonId:lesson.lessonId,levelKey:lesson.levelKey,week:lesson.week,contentId:word.contentId,word:word.word,reasons,status:'BLOCKED',requiredAction:'human-reviewed-v6.4.1-bridge'});
  }
}
const report={schemaVersion:1,audit:'rune-spelling-bridge-release-gate',generatedAt:new Date().toISOString(),lessonCount:lessons.length,wordCount:lessons.reduce((n,l)=>n+(l.words?.length||0),0),defectCount:defects.length,releaseReady:defects.length===0,defects};
mkdirSync(resolve(root,'docs'),{recursive:true});
writeFileSync(resolve(root,'docs','rune-spelling-bridge-defects.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({lessonCount:report.lessonCount,wordCount:report.wordCount,defectCount:report.defectCount,releaseReady:report.releaseReady}));
