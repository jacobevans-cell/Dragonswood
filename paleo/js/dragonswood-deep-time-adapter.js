/* Dragonswood Deep Time v4.3 Firebase adapter.
   Uses the same public Firebase project config already used by Dragonswood.
   Server callables remain authoritative for assignment, grading, tile access and reveal. */
(function(){
'use strict';
const q=new URLSearchParams(location.search);
function ensureFirebase(){if(!window.firebase)throw new Error('Dragonswood Firebase did not load.');if(!firebase.apps.length)firebase.initializeApp({apiKey:'AIzaSyC918WJoGQgxRKsqcz-3bXI7iZWv_1bwYE',authDomain:'dragonswood-9289e.firebaseapp.com',projectId:'dragonswood-9289e',storageBucket:'dragonswood-9289e.firebasestorage.app',messagingSenderId:'1064477064695',appId:'1:1064477064695:web:283e1016ee2303d39042f2',measurementId:'G-LPRLDGVBD2'});return firebase.app();}
const app=ensureFirebase(),auth=firebase.auth(app),functions=firebase.functions(app);
const call=name=>functions.httpsCallable(name);
const calls={launch:call('getDeepTimeLaunchV43'),objective:call('checkDeepTimeObjectiveV43'),ai:call('submitPaleoStep'),final:call('checkDeepTimeFinalV43'),tile:call('getDeepTimeTileV43'),clear:call('clearDeepTimeTileV43'),museum:call('getDeepTimeMuseumRevealV43'),teacher:call('getDeepTimeTeacherDashboardV43')};
function currentUser(){return new Promise((resolve,reject)=>{const u=auth.currentUser;if(u)return resolve(u);const timer=setTimeout(()=>{off();reject(new Error('Sign into Dragonswood first.'))},8000);const off=auth.onAuthStateChanged(x=>{if(x){clearTimeout(timer);off();resolve(x)}})});}
async function data(fn,payload){await currentUser();const r=await fn(payload||{});return r?.data??r;}
window.DRAGONSWOOD_DEEP_TIME_ADAPTER={
 async getLaunchContext(){
   // Teacher-only URL preview remains available for QA but does not grant progress/reveal authority.
   if(q.get('preview')==='1'){await data(calls.teacher,{});return {caseId:(q.get('case')||'SP010').toUpperCase().replace(/^SP-?/,'SP'),day:Number(q.get('day')||1),preview:true};}
   return data(calls.launch,{});
 },
 async objectiveCheck(payload){const r=await data(calls.objective,payload);return {correct:r.correct===true,decision:r.correct?'approved':'coach',feedback:r.feedback||''};},
 async aiCheck(payload){
   const ctx=payload.context||{};
   const r=await data(calls.ai,{caseId:ctx.caseId||payload.caseId,day:Number(ctx.day||payload.day),investigationId:ctx.investigationId||payload.investigationId,responseText:String(payload.text||''),studentConfidence:ctx.confidence||payload.confidence||'MEDIUM',deepTimeEngineVersion:'4.3'});
   return {decision:r.decision||r.status||((r.approved||r.score>=0.72)?'approved':'coach'),feedback:r.feedback||r.coach||''};
 },
 async finalCaseCheck(payload){return data(calls.final,payload);},
 async tileResolver(tileOrPayload,config){const tile=typeof tileOrPayload==='object'?tileOrPayload.tile:tileOrPayload;const caseId=(typeof tileOrPayload==='object'&&tileOrPayload.caseId)||config?.caseId||window.DEEP_TIME_CASE_DAY?.caseId;const r=await data(calls.tile,{caseId,tile});return r.dataUri||`data:${r.contentType||'image/jpeg'};base64,${r.base64||''}`;},
 async museumReveal(caseId){return data(calls.museum,{caseId});},
 onEvent(evt){if(evt?.type==='sectorCleared')data(calls.clear,{caseId:evt.caseId,tile:evt.tile,investigationId:evt.investigationId}).catch(e=>console.error('Deep Time save failed',e));}
};
})();
