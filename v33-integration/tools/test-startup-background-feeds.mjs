import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
async function fixture(){
 const feeds=[],updates=[],auth={currentUser:{uid:'student-a',email:'a@explore.academy'}};let authCallback;
 const empty=()=>({});
 const window={addEventListener(){},DWV33Core:{normalizedEmail:x=>x,isStudentEligibleEmail:()=>true,phoenixDateKey:()=> '2026-09-16',normalizeStudent:empty},DWV33Academic:{studentLearningProgress:()=>({available:false}),studentAcademic:empty,normalizeReadingAssignments:()=>({targetsByDate:{}}),normalizeReading:()=>[]},DWV33World:{weekKey:()=> 'week',studentWorld:empty},DWV33Operations:{datedFeatureAccess:empty,datedSubstituteMode:empty,attentionModel:empty,pollModel:empty,goals:empty},DWV33Passes:{definition:()=>({label:'pass'}),statusId:(t,u)=>t+u,requestId:(t,u)=>t+u,studentPasses:empty},DWTesterAccess:{normalizeTester:empty,normalizeControls:empty,unlockEnabled:()=>false,resolveTester:async()=>({exists:false})}};
 const mockSdk={app:{getApp:empty},auth:{getAuth:()=>auth,setPersistence:async()=>{},onAuthStateChanged:(_,cb)=>{authCallback=cb;return()=>{};}},firestore:{getFirestore:empty,doc:(_, ...p)=>({path:p.join('/')}),collection:(_,p)=>({path:p}),query:q=>q,where:empty,onSnapshot:(ref,success,error)=>{const f={...ref,success,error};feeds.push(f);return()=>f.closed=true;}},functions:{getFunctions:empty}};
 let source=fs.readFileSync(new URL('../js/integration/runtime.js',import.meta.url),'utf8').replace(/import\('https:\/\/www\.gstatic\.com\/firebasejs\/12\.1\.0\/firebase-(app|auth|firestore|functions)\.js'\)/g,'Promise.resolve(mockSdk.$1)');
 vm.runInNewContext(source,{window,mockSdk,location:{search:'',hostname:'jacobevans-cell.github.io'},document:{documentElement:{dataset:{dwEnvironment:'production'}}},URLSearchParams,console:{warn(){},error:e=>{throw e;}},Date,Map,Set,Object,Promise});
 const controller=await window.DWV33Integration.startStudent(x=>updates.push(x));await authCallback(auth.currentUser);
 const deliver=f=>f.success({id:'fixture',exists:()=>false,data:empty,docs:[]});
 return{feeds,updates,auth,authCallback,controller,deliver};
}
const backgroundPaths=new Set(['scores','leaderboardRewards','bossLoot','physicalPrizeDrops','classCalendarEvents','studentJobWeeks','writingResponses','gameResults','readingSessions','spellingResults','pollVotes','classData/classSchedule','classData/classJobs','classData/activePoll','classData/main','classData/secondRecess','classData/classPet','classData/fieldTrip','classData/universalPoints','classData/activeWritingSession','classData/gradebookSettings']);
test('lesson admission does not wait for unrelated slow feeds; their failures cannot evict an open editor',async()=>{
 const h=await fixture();for(const f of h.feeds)if(!backgroundPaths.has(f.path)&&!f.path.startsWith('studentJobWeeks/'))h.deliver(f);
 assert.equal(h.updates.at(-1).status,'authorized');const before=h.updates.length;
 h.feeds.find(f=>f.path==='scores').error({code:'unavailable'});
 assert.ok(h.updates.slice(before).every(x=>x.status==='authorized'));
});
test('identity and pass controls still block admission until verified',async()=>{
 const h=await fixture();for(const f of h.feeds)if(f.path!=='students/student-a')h.deliver(f);
 assert.notEqual(h.updates.at(-1).status,'authorized');h.deliver(h.feeds.find(f=>f.path==='students/student-a'));assert.equal(h.updates.at(-1).status,'authorized');
});
test('late callbacks from the old account cannot authorize or overwrite the next account',async()=>{
 const h=await fixture(),old=h.feeds.slice();h.auth.currentUser={uid:'student-b',email:'b@explore.academy'};await h.authCallback(h.auth.currentUser);const count=h.updates.length;
 for(const f of old){h.deliver(f);f.error({code:'permission-denied'});}assert.equal(h.updates.length,count);
});
