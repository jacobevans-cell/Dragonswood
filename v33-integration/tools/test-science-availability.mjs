import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../../learning-portal/public/science-strategy.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/,'').replaceAll('export function','function');
function harness(locked){
 const next={reserved:1,total:27,extrasRemaining:2,categories:[],choice:locked?{strategyId:'cushioning',strategy:{name:'Cushioning'}}:null};
 const nodes={'[data-strategy-confirm]':{dataset:{},querySelector:()=>null},'[data-strategy-update]':{},'[data-strategy-total]':{}},listeners={},calls=[];
 const root={querySelector:s=>nodes[s],contains:()=>true,addEventListener:(name,fn)=>{listeners[name]=fn;},removeEventListener:name=>{delete listeners[name];}};
 let timer,cleared=false;
 const context=vm.createContext({document:{querySelector:()=>root,visibilityState:'visible'},setInterval:fn=>{timer=fn;return 1;},clearInterval:()=>{cleared=true;}});
 vm.runInContext(source,context);
 const cleanup=context.bindScienceStrategy({grade:4,initial:next,root,onChange(){},api:async url=>{calls.push(url);return next;}});
 return{calls,tick:()=>timer(),cleanup,cleared:()=>cleared,manual:()=>listeners.click({target:{closest:()=>({dataset:{strategyAction:'refresh'},disabled:false})}})};
}
test('a locked strategy stops automatic availability requests but manual refresh still works',async()=>{
 const h=harness(true);assert.equal(h.calls.length,0);h.tick();h.tick();assert.equal(h.calls.length,0);await h.manual();assert.equal(h.calls.length,1);h.cleanup();assert.equal(h.cleared(),true);h.tick();assert.equal(h.calls.length,1);
});
test('students still choosing get availability updates without overlapping requests',async()=>{
 const h=harness(false);assert.equal(h.calls.length,1);h.tick();assert.equal(h.calls.length,1);await new Promise(r=>setImmediate(r));h.tick();assert.equal(h.calls.length,2);h.cleanup();
});
