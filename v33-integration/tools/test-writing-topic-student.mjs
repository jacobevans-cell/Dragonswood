import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const source=fs.readFileSync(new URL('../../learning-portal/public/app.js',import.meta.url),'utf8');
const handler=source.slice(source.indexOf('async function action(el) {'),source.indexOf('async function load()',source.indexOf('async function action(el) {')));
function student(grade=4,{preview=false,failOnce=false,alreadyLocked=false}={}){
 const calls=[],agreement={checked:true,disabled:false},status={textContent:''},button={dataset:{action:'confirm-topic',id:'teamwork'},disabled:false};
 const dom={'#grade':preview?{disabled:false}:null,'#topic-agreement':agreement,'#topic-lock-status':status,'#main':{focus(){}}};
 const saved={writingProject:{topicId:'teamwork'},drafts:{writing:{data:{topicId:'teamwork',draft:'Preserved essay draft'}}}};
 let attempts=0;
 const context=vm.createContext({loadingProfile:false,switchingProfile:false,lockingTopic:false,grade,day:30,state:{writingProject:null},pendingWritingTopic:'teamwork',content:{writingProject:{id:'opinion-project',topicVersion:'topics-v1'}},work:{writing:{draft:'Preserved essay draft'}},dirty:new Set(),conflicts:new Set(),structuredClone,profileContext:()=>({grade}),profileCurrent:()=>true,$:selector=>dom[selector]||null,window:{scrollTo(){}},toast(){},flush:async()=>{},api:async(path,body)=>{calls.push({path,body});attempts++;if(failOnce&&attempts===1)throw Error('Temporary connection problem');if(alreadyLocked)throw Object.assign(Error('Saved in another tab'),{topicLocked:true,state:saved});return saved;},render(){context.renderCount=(context.renderCount||0)+1;dom['#topic-agreement']=null;dom['#topic-lock-status']=null;}});
 vm.runInContext(handler,context);
 return{context,calls,agreement,status,button,dom,confirm:()=>context.action(button)};
}
for(const grade of [4,5])test(`Grade ${grade} student confirms and opens saved writing without a preview grade selector`,async()=>{
 const h=student(grade);assert.equal(h.dom['#grade'],null);await h.confirm();
 assert.equal(h.calls.length,1);assert.equal(h.calls[0].path,'/api/writing/topic');assert.equal(h.calls[0].body.grade,grade);assert.equal(h.calls[0].body.confirmed,true);
 assert.equal(h.context.state.writingProject.topicId,'teamwork');assert.equal(h.context.work.writing.draft,'Preserved essay draft');assert.equal(h.context.renderCount,1);assert.equal(h.context.lockingTopic,false);
});
test('preview grade controls still lock during confirmation and unlock afterwards',async()=>{
 const h=student(4,{preview:true});await h.confirm();assert.equal(h.dom['#grade'].disabled,false);assert.equal(h.context.renderCount,1);
});
test('failed topic save allows a student retry and retains their existing draft',async()=>{
 const h=student(5,{failOnce:true});await assert.rejects(h.confirm(),/Temporary connection/);assert.equal(h.context.lockingTopic,false);assert.equal(h.button.disabled,false);assert.equal(h.agreement.disabled,false);assert.equal(h.context.work.writing.draft,'Preserved essay draft');await h.confirm();assert.equal(h.context.renderCount,1);
});
test('a topic confirmed in another tab opens the saved project',async()=>{
 const h=student(4,{alreadyLocked:true});await h.confirm();assert.equal(h.context.state.writingProject.topicId,'teamwork');assert.equal(h.context.lockingTopic,false);assert.equal(h.context.renderCount,1);
});
test('students still must acknowledge and confirm their selected topic',async()=>{
 const h=student();h.agreement.checked=false;await h.confirm();assert.equal(h.calls.length,0);assert.equal(h.context.lockingTopic,false);
});
