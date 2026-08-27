'use strict';
const fs=require('fs');
const vm=require('vm');
const path=require('path');
const sourcePath=path.resolve(__dirname,'../js/math-operations-quest.js');
const src=fs.readFileSync(sourcePath,'utf8');
const digitsMatch=src.match(/const digits=\(n,w\)=>[^;]+;/);
const start=src.indexOf('function buildAddition');
const end=src.indexOf('\n\n  function loadProblem',start);
if(!digitsMatch||start<0||end<0)throw new Error('Could not extract actual math engine from app source');
const sandbox={Math,String,Number,Error};
vm.createContext(sandbox);
vm.runInContext(`${digitsMatch[0]}\n${src.slice(start,end)}\nthis.buildEngine=buildEngine;`,sandbox);
const buildEngine=sandbox.buildEngine;

function reconstruct(p,built){
  if(p.operation==='division'){
    const q=Array(built.board.width).fill('');
    for(const t of built.tasks)if(t.target==='quotient')q[t.col]=t.expected;
    return {answer:Number(q.join('')||0),remainder:built.remainder||0};
  }
  if(p.operation==='multiplication'){
    const finalTasks=built.tasks.filter(t=>t.target==='result');
    if(finalTasks.length){const out=Array(built.board.width).fill('');for(const t of finalTasks)out[t.col]=t.expected;return {answer:Number(out.join('')||0)};}
    const out=Array(built.board.width).fill('');for(const t of built.tasks)if(t.target==='partial'&&t.row===0)out[t.col]=t.expected;return {answer:Number(out.join('')||0)};
  }
  const out=Array(built.board.width).fill('');
  for(const t of built.tasks)if(t.target==='result')out[t.col]=t.expected;
  return {answer:Number(out.join('')||0)};
}

const cases=[
  [{operation:'addition',a:587,b:468},1055],
  [{operation:'addition',a:99999,b:1},100000],
  [{operation:'subtraction',a:742,b:389},353],
  [{operation:'subtraction',a:1000,b:1},999],
  [{operation:'subtraction',a:7824,b:2356},5468],
  [{operation:'multiplication',a:347,b:6},2082],
  [{operation:'multiplication',a:347,b:26},9022],
  [{operation:'multiplication',a:999,b:99},98901],
  [{operation:'division',a:864,b:8},108,0],
  [{operation:'division',a:42875,b:125},343,0],
  [{operation:'division',a:1000,b:64},15,40]
];
let failures=0;
for(const [p,answer,remainder=0] of cases){
  const built=buildEngine(p),got=reconstruct(p,built);
  const ok=built.answer===answer&&got.answer===answer&&(p.operation!=='division'||(built.remainder||0)===remainder&&got.remainder===remainder);
  console.log(`${ok?'PASS':'FAIL'} ${p.a} ${p.operation} ${p.b} => ${answer}${remainder?` R${remainder}`:''}`);
  if(!ok){console.log({builtAnswer:built.answer,builtRemainder:built.remainder,got});failures++;}
}
const regroup=buildEngine({operation:'subtraction',a:1000,b:1});
const hasCrossingData=regroup.tasks.some(t=>Array.isArray(t.borrowNotes)&&t.borrowNotes.filter(Boolean).length>=4);
console.log(`${hasCrossingData?'PASS':'FAIL'} subtraction emits persistent changed-value/regroup data for 1000 − 1`);
if(!hasCrossingData)failures++;
if(failures)process.exit(1);

const source=fs.readFileSync(sourcePath,'utf8');
const difficultyChecks=[
  ['easy multiplier is zero',/easy:\{label:'Easy',multiplier:0,rewardEligible:false\}/.test(source)],
  ['normal multiplier is one',/normal:\{label:'Normal',multiplier:1,rewardEligible:true\}/.test(source)],
  ['hard multiplier is two',/hard:\{label:'Hard',multiplier:2,rewardEligible:true\}/.test(source)],
  ['hard hint guard exists',/if\(!task\|\|state\.difficulty==='hard'\)return/.test(source)],
  ['normal uses non-answer walkthrough',/renderNormalWalkthrough\(task\)/.test(source)],
  ['easy uses visual hint renderer',/renderEasyHint\(task\)/.test(source)]
];
for(const [name,ok] of difficultyChecks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failures++;}
if(failures)process.exit(1);
