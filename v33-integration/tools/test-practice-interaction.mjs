import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {bindLessonPractice,renderLessonPractice,validatePracticeData} from '../../learning-portal/public/lesson-practice.js';

function fixture(saved={}) {
  const fieldset={disabled:false},work=structuredClone(saved),elements=new Map();
  const element=(selector,dataset={})=>{
    if(!elements.has(selector))elements.set(selector,{dataset,value:'0',textContent:'',innerHTML:'',attributes:{},handlers:{},addEventListener(type,fn){this.handlers[type]=fn;},setAttribute(k,v){this.attributes[k]=v;},fire(type='click'){this.handlers[type]?.({target:this});}});
    return elements.get(selector);
  };
  const points=['2,2','6,2','3,3','3,7'].map(p=>element('[data-practice-point="'+p+'"]',{practicePoint:p}));
  const task={dataset:{practiceTask:'g4-d31-ray-design'},closest:()=>fieldset,querySelector:element,querySelectorAll:s=>s==='[data-practice-point]'?points:[]};
  const panel={dataset:{lessonPractice:'math'},querySelectorAll:()=>[task]};
  bindLessonPractice({querySelectorAll:()=>[panel]},{grade:4,day:31,getWork:()=>work,patch:(_,practice)=>{work.practice=practice;}});
  return {fieldset,work,element,point:p=>element('[data-practice-point="'+p+'"]'),model:()=>work.practice.tasks['g4-d31-ray-design'].model};
}

test('ray clicks retain their endpoint, reject duplicate points and draw the direction',()=>{
  const h=fixture();h.point('2,2').fire();
  assert.deepEqual(h.model().pending,[[2,2]]);
  assert.match(h.element('[data-practice-step]').textContent,/Endpoint selected/);
  assert.equal(h.point('2,2').attributes['aria-pressed'],'true');
  h.point('2,2').fire();assert.deepEqual(h.model().pending,[[2,2]]);assert.match(h.element('[data-practice-step]').textContent,/different/);
  h.point('6,2').fire();assert.deepEqual(h.model().shapes,[{tool:'ray',points:[[2,2],[6,2]]}]);
  assert.match(h.element('.practice-drawing').innerHTML,/marker-end=/);
  assert.equal(h.element('.practice-model-status').textContent,'1 figure in your model.');
  validatePracticeData(4,31,'math',h.work.practice);
  const reopened=fixture(h.work);reopened.point('3,3').fire();reopened.point('3,7').fire();assert.equal(reopened.model().shapes.length,2);
});

test('coordinate controls, undo and reset update the same recoverable notebook',()=>{
  const h=fixture();h.element('[data-practice-column]').value='2';h.element('[data-practice-row]').value='2';h.element('[data-practice-add-point]').fire();
  h.element('[data-practice-column]').value='6';h.element('[data-practice-add-point]').fire();assert.equal(h.model().shapes.length,1);
  h.point('3,3').fire();h.element('[data-practice-undo]').fire();assert.equal(h.model().shapes.length,1);assert.deepEqual(h.model().pending,[]);
  h.element('[data-practice-undo]').fire();assert.deepEqual(h.model().shapes,[]);
  h.point('2,2').fire();h.element('[data-practice-clear]').fire();assert.deepEqual(h.model(),{tool:'ray',shapes:[],pending:[]});
});

test('conflict recovery disables drawing without changing saved work',()=>{
  const h=fixture();h.point('2,2').fire();const before=structuredClone(h.work);h.fieldset.disabled=true;h.point('6,2').fire();assert.deepEqual(h.work,before);
});

test('video gates keep graded activities locked while unscored math practice works',()=>{
  const source=fs.readFileSync(new URL('../../learning-portal/public/app.js',import.meta.url),'utf8');
  const update=source.slice(source.indexOf('function updateVideoLocks()'),source.indexOf('\nfunction ',source.indexOf('function updateVideoLocks()')+1));
  const practice={disabled:false,hasAttribute:()=>false},graded={disabled:false,hasAttribute:()=>true},notice={},conflicts=new Set();
  const main={querySelectorAll:s=>s==='[data-video-activity], [data-practice-activity]'?[practice,graded]:[],querySelector:s=>s==='[data-practice-activity]'?practice:notice};
  const state={videoProgress:{}},context=vm.createContext({document:{querySelector:()=>main},videos:[{id:'math',assignment:'math'}],state,route:'math',resolvingConflicts:conflicts});
  vm.runInContext(update,context);vm.runInContext('updateVideoLocks()',context);assert.equal(practice.disabled,false);assert.equal(graded.disabled,true);
  assert.match(notice.textContent,/save the practice workshop/);
  conflicts.add('math');vm.runInContext('updateVideoLocks()',context);assert.equal(practice.disabled,true);
  conflicts.clear();state.videoProgress.math={complete:true};vm.runInContext('updateVideoLocks()',context);assert.equal(graded.disabled,false);assert.equal(practice.disabled,false);
  const html=renderLessonPractice(4,31,'math');assert.match(html,/data-practice-activity="math"/);assert.doesNotMatch(html,/data-video-activity/);
});
