#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const jobs=JSON.parse(await fs.readFile(path.join(root,"narration-jobs.json"),"utf8"));
const files=(await fs.readdir(root)).filter(x=>/\.(html|js)$/.test(x));
const affected=[];
for(const file of files){const content=await fs.readFile(path.join(root,file),"utf8");const speech=(content.match(/speechSynthesis|SpeechSynthesisUtterance|DWNarrator|DWCedar|read.?aloud/gi)||[]).length;if(speech)affected.push({file,speechReferences:speech})}
const ids=jobs.clips.map(x=>x.id),duplicateIds=ids.filter((x,i)=>ids.indexOf(x)!==i);
const voiceClips=jobs.clips.reduce((n,x)=>n+(x.voices||[]).length,0);
console.log(JSON.stringify({affectedFiles:affected,sections:jobs.clips.length,voiceClips,duplicateIds:[...new Set(duplicateIds)],voices:Object.keys(jobs.voices),productionModelFiles:files.filter(x=>/\.onnx(?:_data)?$/i.test(x))},null,2));
if(duplicateIds.length)process.exit(1);
