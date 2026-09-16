import test from 'node:test';import assert from 'node:assert/strict';
import {bindLessonVideos} from '../../learning-portal/public/lesson-video.js';
class Element extends EventTarget {
 constructor(){super();this.value='1';this.hidden=true;this.disabled=false;this.textContent='';this.dataset={};}
 emit(name){this.dispatchEvent(new Event(name));} setAttribute(){}
}
class Video extends Element {
 constructor(stall){super();Object.assign(this,{paused:true,duration:600,readyState:stall?0:1,error:null,seeking:false,position:0,rate:1});}
 get currentTime(){return this.position;}
 set currentTime(n){this.position=n;this.seeking=true;queueMicrotask(()=>{this.emit('seeking');queueMicrotask(()=>{this.seeking=false;this.emit('seeked');});});}
 get playbackRate(){return this.rate;}
 set playbackRate(n){if(this.rate===n)return;this.rate=n;queueMicrotask(()=>this.emit('ratechange'));}
 getAttribute(){return 'copy';} load(){}
 pause(){if(this.paused)return;this.paused=true;queueMicrotask(()=>this.emit('pause'));}
 async play(){if(!this.paused)return;this.paused=false;queueMicrotask(()=>this.emit('play'));}
}
const drain=async()=>{for(let i=0;i<160;i++)await Promise.resolve();};
async function fixture(run,{stallMedia=false,count=1,holdStart=false}={}){
 const old={document:globalThis.document,window:globalThis.window,setInterval,clearInterval};
 const document=Object.assign(new Element(),{hidden:false});globalThis.document=document;globalThis.window=new Element();
 const timers=[];globalThis.setInterval=fn=>{timers.push(fn);return fn;};globalThis.clearInterval=()=>{};
 let startCount=0,holdEvent=null,held=null,heldStart=null,failStatus,failOnce=false;const packets=[];
 const boxes=Array.from({length:count},(_,i)=>{const video=new Video(stallMedia),elements=new Map([['video',video]]),get=s=>{if(!elements.has(s))elements.set(s,new Element());return elements.get(s);};return{dataset:{videoId:'video-'+i,videoSources:'["copy"]'},querySelector:get,video,get};});
 const progress={seconds:0,position:0,frontier:0,requiredSeconds:540,durationSeconds:600,complete:false};
 const api=async(path,payload)=>{
  if(path.endsWith('/start')){startCount++;if(holdStart){holdStart=false;await new Promise(r=>heldStart=r);}return{token:'session-'+startCount,sequence:0,progress:{...progress}};}
  packets.push({...payload});if(failOnce){failOnce=false;throw Object.assign(Error('Temporary disconnect'),{status:failStatus});}
  const result={progress:{...progress,position:payload.position,frontier:Math.max(progress.frontier,payload.position),seconds:Math.max(progress.seconds,payload.position)}};
  if(payload.event===holdEvent){holdEvent=null;await new Promise(r=>held=r);held=null;}Object.assign(progress,result.progress);return result;
 };
 const stop=bindLessonVideos({root:{querySelectorAll:()=>boxes},grade:4,api,onProgress:()=>{}});
 try{
  await drain();if(stallMedia){assert.equal(startCount,0);boxes[0].video.readyState=1;boxes[0].video.emit('loadedmetadata');await drain();}
  assert.equal(startCount,1);assert.equal(boxes[0].video.paused,true);
  await run({video:boxes[0].video,get:boxes[0].get,boxes,document,packets,startCount:()=>startCount,advance:async n=>{boxes[0].video.position=n;boxes[0].video.emit('timeupdate');await drain();},tick:async()=>{timers.forEach(fn=>fn());await drain();},hold:event=>holdEvent=event,releaseStart:async()=>{heldStart?.();await drain();},release:async()=>{held?.();await drain();},failNext:status=>{failOnce=true;failStatus=status;},play:async()=>{await boxes[0].video.play();await drain();},pause:async()=>{boxes[0].video.pause();await drain();}});
 }finally{stop();await drain();Object.assign(globalThis,old);}
}
test('metadata and the first paused session prepare before Play without recording viewing time',()=>fixture(async h=>{assert.equal(h.packets.length,0);assert.equal(h.video.paused,true);},{stallMedia:true}));
test('speed chosen during initial connection is verified after the session arrives',()=>fixture(async h=>{
 h.get('[data-video-rate]').value='1.5';h.get('[data-video-rate]').emit('change');await drain();assert.equal(h.get('[data-video-rate]').disabled,true);
 await h.releaseStart();assert.equal(h.video.playbackRate,1.5);assert.deepEqual(h.packets.map(p=>[p.event,p.rate]),[['pause',1],['rate',1.5]]);
 await h.play();assert.equal(h.packets.at(-1).rate,1.5);assert.equal(h.video.paused,false);
},{holdStart:true}));
test('native playback begins before a slow play-save acknowledgment and reuses the session on resume',()=>fixture(async h=>{
 h.hold('play');await h.play();assert.equal(h.video.paused,false);assert.equal(h.packets[0].event,'play');await h.release();
 await h.advance(4);await h.pause();await h.play();assert.equal(h.startCount(),1);assert.equal(h.video.paused,false);assert.deepEqual(h.packets.map(p=>p.event),['play','pause','play']);
}));
test('slow progress saves do not queue stale heartbeats',()=>fixture(async h=>{
 await h.play();h.hold('tick');await h.advance(5);await h.tick();for(const n of [7,9,11]){await h.advance(n);await h.tick();}
 assert.equal(h.packets.filter(p=>p.event==='tick').length,1);assert.equal(h.video.paused,false);await h.release();await h.advance(13);await h.tick();assert.equal(h.packets.at(-1).position,13);
}));
test('a slow Play receipt cannot queue a stale heartbeat before a normal pause',()=>fixture(async h=>{
 h.hold('play');await h.play();await h.advance(2.73);await h.tick();
 assert.deepEqual(h.packets.map(p=>p.event),['play']);
 await h.release();await h.advance(4.9);await h.pause();await h.play();
 assert.deepEqual(h.packets.map(p=>[p.event,p.position]),[['play',0],['pause',4.9],['play',4.9]]);
 assert.equal(h.startCount(),1);assert.equal(h.video.paused,false);
 await h.advance(7);await h.tick();assert.equal(h.packets.at(-1).position,7);
}));
test('native resume discards frames advanced before preparation so a paused session cannot report extra time',()=>fixture(async h=>{
 await h.play();await h.advance(4);await h.pause();h.video.position=4.2;await h.play();
 assert.equal(h.packets.at(-1).event,'play');assert.equal(h.packets.at(-1).position,4);assert.equal(h.video.currentTime,4);
}));
test('pause and speed changes stay ordered behind a slow save',()=>fixture(async h=>{
 await h.play();h.hold('tick');await h.advance(5);await h.tick();await h.advance(7);h.get('[data-video-rate]').value='1.5';h.get('[data-video-rate]').emit('change');await drain();assert.equal(h.video.paused,true);await h.release();await drain();
 assert.deepEqual(h.packets.map(p=>p.event),['play','tick','pause','rate','play']);assert.equal(h.video.playbackRate,1.5);assert.equal(h.video.paused,false);
}));
for(const code of [undefined,503])test('uncertain delivery retries the identical receipt: '+code,()=>fixture(async h=>{await h.play();h.failNext(code);await h.advance(5);await h.tick();assert.deepEqual(h.packets[1],h.packets[2]);assert.equal(h.video.paused,false);}));
test('native rewind saves a pause before a seek while unearned forward seeking is rejected',()=>fixture(async h=>{
 await h.play();await h.advance(8);await h.tick();h.video.currentTime=3;await drain();assert.deepEqual(h.packets.slice(-3).map(p=>p.event),['pause','seek','play']);assert.equal(h.video.currentTime,3);
 h.video.currentTime=80;await drain();assert.equal(h.video.currentTime,3);assert.ok(!h.packets.some(p=>p.position===80));
}));
test('a seek between a heartbeat and the next native timeupdate cannot send an older pause position',()=>fixture(async h=>{
 await h.play();await h.advance(5.8);h.video.position=6;await h.tick();h.video.currentTime=2;await drain();
 const pause=h.packets.find(p=>p.event==='pause');assert.equal(pause.position,6);assert.equal(h.video.currentTime,2);
}));
test('hidden tabs pause and preserve the final position behind a pending heartbeat',()=>fixture(async h=>{
 await h.play();h.hold('tick');await h.advance(5);await h.tick();await h.advance(7);h.document.hidden=true;h.document.emit('visibilitychange');await drain();assert.equal(h.video.paused,true);await h.release();assert.equal(h.packets.at(-1).event,'pause');assert.equal(h.packets.at(-1).position,7);
}));
test('a second video does not prepare a competing session; selecting it drains the first',()=>fixture(async h=>{
 await h.play();await h.advance(4);await h.boxes[1].video.play();await drain();assert.equal(h.startCount(),2);assert.equal(h.video.paused,true);assert.equal(h.boxes[1].video.paused,false);assert.deepEqual(h.packets.map(p=>p.event),['play','pause','play']);
},{count:2}));
