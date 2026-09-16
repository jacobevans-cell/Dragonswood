import test from 'node:test';import assert from 'node:assert/strict';
import {loadLessonMedia,lockedVideo} from '../../learning-portal/public/lesson-video.js';
import {lessonVideoSources} from '../../learning-portal/public/video-delivery.js';
class Media extends EventTarget {
 constructor(behavior){super();this.behavior=behavior;this.attempts=[];this.readyState=0;this.error=null;this.src='';this.paused=true;}
 getAttribute(){return this.src;}
 setAttribute(_,src){this.src=src;}
 pause(){this.paused=true;}
 load(){this.attempts.push(this.src);this.error=null;this.readyState=0;const result=this.behavior(this.src);if(result==='stall')return;queueMicrotask(()=>{if(result==='ok'){this.readyState=1;this.dispatchEvent(new Event('loadedmetadata'));}else{this.error={code:2};this.dispatchEvent(new Event('error'));}});}
}
test('uses original source after preferred copy fails',async()=>{const video=new Media(url=>url==='original'?'ok':'error');await loadLessonMedia(video,['copy','original']);assert.deepEqual(video.attempts,['copy','original']);assert.equal(video.src,'original');assert.equal(video.paused,true);});
test('bounded stalled download advances to working copy',async()=>{const video=new Media(url=>url==='copy'?'stall':'ok');await loadLessonMedia(video,['copy','original'],{timeoutMs:15});assert.deepEqual(video.attempts,['copy','original']);});
test('failure of every candidate rejects for a visible retry, never starts playback',async()=>{const video=new Media(()=> 'error');await assert.rejects(loadLessonMedia(video,['copy','original']),/could not load/);assert.equal(video.paused,true);});
test('navigation cancels waiting download without trying another source',async()=>{const controller=new AbortController();const video=new Media(()=> 'stall');const pending=loadLessonMedia(video,['copy','original'],{signal:controller.signal});controller.abort();await assert.rejects(pending,{name:'AbortError'});assert.deepEqual(video.attempts,['copy']);});
test('resuming an already loaded backup preserves source and buffered media',async()=>{const video=new Media(()=> 'error');video.src='original';video.readyState=1;await loadLessonMedia(video,['copy','original']);assert.deepEqual(video.attempts,[]);assert.equal(video.src,'original');});
test('the next lesson tries the working host first while retaining its exact source candidates',async()=>{
 const first=new Media(url=>url.includes('working.example')?'ok':'error');await loadLessonMedia(first,['https://failed.example/a.mp4','https://working.example/a.mp4']);
 const second=new Media(()=> 'ok');await loadLessonMedia(second,['https://failed.example/b.mp4','https://working.example/b.mp4']);assert.deepEqual(second.attempts,['https://working.example/b.mp4']);
});
test('candidate sources preserve order, remove duplicates and do not mutate assignment',()=>{const video={url:'original',fallbackUrl:'copy',id:'math-1',durationSeconds:232};const before=JSON.stringify(video);assert.deepEqual(lessonVideoSources(video),['copy','original']);assert.equal(JSON.stringify(video),before);assert.deepEqual(lessonVideoSources({url:'same',fallbackUrl:'same'}),['same']);});
test('native controls preload metadata while preserving identity and watching requirement',()=>{const html=lockedVideo({id:'math-1',title:'Place Value',url:'original',fallbackUrl:'copy',durationSeconds:232},{});assert.match(html,/data-video-id="math-1"/);assert.match(html,/data-video-sources="\[&quot;copy&quot;,&quot;original&quot;\]"/);assert.match(html,/<video[^>]+ controls /);assert.match(html,/preload="metadata"/);assert.match(html,/skipping ahead does not count/);assert.doesNotMatch(html,/data-video-play|data-video-back|data-video-forward/);assert.ok(html.indexOf('data-video-error')<html.indexOf('data-video-position'));});
