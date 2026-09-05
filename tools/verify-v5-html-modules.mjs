import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/,value=>value.slice(1))),'..');
const files=['adventurer-hall.html','boss-battle.html'];
const failures=[];
for(const file of files){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const modules=[...html.matchAll(/<script\s+type=["']module["'][^>]*>([\s\S]*?)<\/script>/gi)].map(match=>match[1]);
  if(!modules.length){failures.push(`${file}: no module script found`);continue}
  for(const [index,source] of modules.entries()){
    try{new vm.SourceTextModule(source,{identifier:`${file}#${index+1}`})}
    catch(error){failures.push(`${file}#${index+1}: ${error.message}`)}
  }
}
console.log(JSON.stringify({passed:failures.length===0,files,failures},null,2));
if(failures.length)process.exitCode=1;
