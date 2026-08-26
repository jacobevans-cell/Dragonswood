'use strict';
const fs=require('node:fs');
const vm=require('node:vm');

function element(){
  return {
    innerHTML:'',textContent:'',hidden:false,value:'',dataset:{},
    classList:{add(){},remove(){},toggle(){}},
    querySelectorAll(){return[]},querySelector(){return null},
    addEventListener(){},removeEventListener(){},focus(){},append(){},appendChild(){},remove(){},
    setAttribute(){},getAttribute(){return null},closest(){return null}
  };
}
function makeContext(firstRoute){
  const app=element(),toast=element(),dialog=element();
  const document={
    title:'',body:element(),
    querySelector(sel){if(sel==='#app')return app;if(sel==='#toast')return toast;if(sel==='#dialog-root')return dialog;return null},
    querySelectorAll(){return[]},createElement(){return element()},addEventListener(){}
  };
  const store=new Map();
  const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))};
  const location={hash:'#'+firstRoute,search:''};
  const window={addEventListener(){},removeEventListener(){}};
  const ctx={console,document,localStorage,location,window,URLSearchParams,setTimeout,clearTimeout,setInterval,clearInterval,queueMicrotask,Promise,speechSynthesis:{},SpeechSynthesisUtterance:function(){}};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync('tools/visual-fixture-runtime.js','utf8'),ctx,{filename:'visual-fixture-runtime.js'});
  return {ctx,app,location};
}
async function smoke(file,routes,kind){
  const {ctx,app,location}=makeContext(routes[0]);
  vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
  await new Promise(resolve=>setImmediate(resolve));
  const failures=[];
  for(const route of routes){
    location.hash='#'+route;
    try{ctx.render()}catch(e){failures.push(`${route}: ${e.stack||e}`);continue}
    if(!app.innerHTML||app.innerHTML.includes('undefined'))failures.push(`${route}: empty or undefined markup`);
    if(!app.innerHTML.includes(`page-${route}`))failures.push(`${route}: page class missing`);
  }
  if(failures.length){throw new Error(`${kind} FAIL\n${failures.join('\n')}`)}
  console.log(`${kind} PASS: ${routes.length} authenticated fixture routes rendered without exceptions`);
}
(async()=>{
  await smoke('js/student-app.js',['adventure','missions','games','scribe','day','hall','boss','leaderboards'],'student');
  await smoke('js/teacher-app.js',['student-command','gradebook','scribe','rewards','passes','jobs','schedule','tools','leaderboards'],'teacher');
})().catch(err=>{console.error(err.stack||err);process.exit(1)});
