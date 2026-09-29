'use strict';
const fs=require('node:fs');
const admin=require('../functions-fact-fluency/node_modules/firebase-admin');
const source=fs.readFileSync('daily-quest-seed.html','utf8');
const match=source.match(/const LESSONS=(\[.*?\]);/s);
if(!match)throw Error('Daily Quest seed lessons missing.');
const lesson=JSON.parse(match[1]).find(x=>x.day===41&&x.date==='2026-09-29');
if(!lesson)throw Error('Day 41 September 29 lesson missing.');
admin.initializeApp({projectId:'dragonswood-9289e'});
const db=admin.firestore();
const midnight=day=>admin.firestore.Timestamp.fromDate(new Date(`2026-09-${day}T07:00:00Z`));
(async()=>{
 const ref=db.doc('dailyQuests/2026-09-29');
 const existing=await ref.get();
 if(existing.exists&&existing.data()?.day===41&&existing.data()?.unlockAt?.toMillis()===midnight('29').toMillis()&&existing.data()?.lockAt?.toMillis()===midnight('30').toMillis()){
  console.log('Day 41 already scheduled and time window correct.');return;
 }
 await ref.set({...lesson,unlockAt:midnight('29'),lockAt:midnight('30')},{merge:true});
 const verified=await ref.get();
 if(!verified.exists||verified.data()?.day!==41)throw Error('Day 41 verification failed.');
 console.log('Day 41 active: 2026-09-29 00:00 through 2026-09-30 00:00 Phoenix time.');
})().catch(e=>{console.error(e);process.exitCode=1});
