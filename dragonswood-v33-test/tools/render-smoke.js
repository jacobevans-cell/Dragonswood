const fs=require('fs');
const vm=require('vm');
function element(){return {innerHTML:'',textContent:'',classList:{add(){},remove(){}},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},focus(){}}}
function smoke(file,routes,kind){
  const app=element(),toast=element(),dialog=element();
  const document={title:'',body:element(),querySelector(sel){if(sel==='#app')return app;if(sel==='#toast')return toast;if(sel==='#dialog-root')return dialog;return null},createElement(){return element()}};
  const store=new Map();
  const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))};
  const location={hash:'#'+routes[0],search:''};
  const window={addEventListener(){}};
  const ctx={console,document,localStorage,location,window,URLSearchParams,setTimeout,clearTimeout,speechSynthesis:{},SpeechSynthesisUtterance:function(){}};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
  const failures=[];
  for(const route of routes){
    location.hash='#'+route;
    try{ctx.render()}catch(e){failures.push(`${route}: ${e.stack||e}`);continue}
    if(!app.innerHTML||app.innerHTML.includes('undefined'))failures.push(`${route}: empty or undefined markup`);
    if(!app.innerHTML.includes(`page-${route}`))failures.push(`${route}: page class missing`);
  }
  if(failures.length){console.error(`${kind} FAIL\n${failures.join('\n')}`);process.exitCode=1}else console.log(`${kind} PASS: ${routes.length} routes rendered without exceptions`);
}
smoke('js/student-app.js',['adventure','missions','games','scribe','day','hall','boss','leaderboards'],'student');
smoke('js/teacher-app.js',['student-command','gradebook','scribe','rewards','passes','jobs','schedule','tools','leaderboards'],'teacher');
