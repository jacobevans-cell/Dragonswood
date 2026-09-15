import test from 'node:test';
import assert from 'node:assert/strict';
import {bindLessonVideos} from '../../learning-portal/public/lesson-video.js';

class Element {
 constructor(){this.listeners=new Map();this.value='1.5';this.hidden=true;this.disabled=false;this.textContent='';}
 addEventListener(name,fn){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn);}
 removeEventListener(name,fn){this.listeners.get(name)?.delete(fn);}
 async emit(name){for(const fn of this.listeners.get(name)||[])await fn({currentTarget:this});}
 setAttribute(){}
}
const drain=async()=>{for(let i=0;i<15;i++)await Promise.resolve();};
async function fixture(run){
 const old={document:globalThis.document,window:globalThis.window,setInterval,clearInterval};
 const video=Object.assign(new Element(),{paused:true,currentTime:0,duration:600,readyState:1,error:null,playbackRate:1.5,getAttribute:()=> 'copy',pause(){this.paused=true;},async play(){this.paused=false;}});
 const elements=new Map([['video',video]]);const get=s=>{if(!elements.has(s))elements.set(s,new Element());return elements.get(s);};
 const box={dataset:{videoId:'fixture-video',videoSources:'["copy"]'},querySelector:get};
 const document=Object.assign(new Element(),{hidden:false});globalThis.document=document;globalThis.window=new Element();
 let tick,interval,held=null,delay=false,failOnce=false;const packets=[],progress={seconds:0,position:0,frontier:0,requiredSeconds:540,durationSeconds:600,complete:false};
 globalThis.setInterval=(fn,ms)=>{tick=fn;interval=ms;return 1;};globalThis.clearInterval=()=>{};
 const api=async(path,payload)=>{
  if(path.endsWith('/start'))return {token:'fixture-token',sequence:0,progress:{...progress}};
  packets.push({...payload});if(failOnce){failOnce=false;throw new Error('Temporary disconnect');}
  const result={progress:{...progress,position:payload.position,frontier:Math.max(progress.frontier,payload.position),seconds:Math.max(progress.seconds,payload.position)}};
  if(delay){await new Promise(resolve=>held=resolve);delay=false;held=null;}Object.assign(progress,result.progress);return result;
 };
 const stop=bindLessonVideos({root:{querySelectorAll:()=>[box]},grade:4,api,onProgress:()=>{}});
 try{await get('[data-video-play]').emit('click');assert.equal(video.paused,false);await run({video,get,packets,document,tick:async()=>{tick();await drain();},interval,delayNext:()=>delay=true,failNext:()=>failOnce=true,release:async()=>{held?.();await drain();}});}
 finally{stop();await drain();Object.assign(globalThis,old);}
}
test('slow progress acknowledgements never queue stale heartbeats; next sample catches up',()=>fixture(async h=>{
 assert.equal(h.interval,5000);h.delayNext();h.video.currentTime=7.5;await h.tick();
 for(const position of [10,12,15,18]){h.video.currentTime=position;await h.tick();}
 assert.equal(h.packets.filter(p=>p.event==='tick').length,1);assert.equal(h.video.paused,false);
 await h.release();assert.equal(h.packets.filter(p=>p.event==='tick').length,1);
 h.video.currentTime=22.5;await h.tick();assert.equal(h.packets.at(-1).position,22.5);assert.equal(h.packets.at(-1).sequence,3);
 assert.equal(h.get('[data-video-error]').hidden,true);assert.equal(h.get('[data-video-forward]').disabled,true);
}));
test('pause and speed change stay ordered after a slow save',()=>fixture(async h=>{
 h.delayNext();h.video.currentTime=7.5;await h.tick();h.video.currentTime=12;
 h.get('[data-video-rate]').value='1';const changing=h.get('[data-video-rate]').emit('change');await drain();assert.equal(h.video.paused,true);
 await h.release();await changing;
 assert.deepEqual(h.packets.map(p=>p.event),['play','tick','pause','rate','play']);
 assert.deepEqual(h.packets.map(p=>p.sequence),[1,2,3,4,5]);assert.equal(h.packets[2].position,12);assert.equal(h.video.playbackRate,1);assert.equal(h.video.paused,false);
}));
test('uncertain delivery retries exactly the same receipt without inventing extra progress',()=>fixture(async h=>{
 h.failNext();h.video.currentTime=7.5;await h.tick();assert.deepEqual(h.packets[1],h.packets[2]);assert.equal(h.video.paused,false);assert.equal(h.get('[data-video-error]').hidden,true);
}));
test('hidden tab pauses and sends final position even behind a pending heartbeat',()=>fixture(async h=>{
 h.delayNext();h.video.currentTime=7.5;await h.tick();h.video.currentTime=10;h.document.hidden=true;
 await h.document.emit('visibilitychange');await drain();assert.equal(h.video.paused,true);await h.release();
 assert.equal(h.packets.at(-1).event,'pause');assert.equal(h.packets.at(-1).position,10);assert.equal(h.packets.at(-1).playing,false);
}));
