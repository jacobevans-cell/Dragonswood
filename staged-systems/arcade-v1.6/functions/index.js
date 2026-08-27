const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
initializeApp();
const db=getFirestore();
const TZ=process.env.ARCADE_TIMEZONE||'America/Phoenix';
const TOP_N=Math.max(1,Math.min(25,Number(process.env.ARCADE_TOP_N)||5));
const CHAMPIONS_CHOICE_SCOPE='per-board-first-place'; // locked to the documented v1.4 Dragonswood rule
const BOARDS=[
  {id:'dragon-dash',title:'Dragon Dash'},
  {id:'void-runner-explore',title:'Void Runner • Explore'},
  {id:'void-runner-infinite',title:'Void Runner • Infinite'}
];
function dayKey(date=new Date()){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`}
function addDays(key,n){const d=new Date(`${key}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function mondayKey(key){const d=new Date(`${key}T12:00:00Z`);const back=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-back);return d.toISOString().slice(0,10)}
async function top(boardId,periodType,periodKey,limitN=TOP_N){const s=await db.collection('arcadeScores').where('boardId','==',boardId).where('periodType','==',periodType).where('periodKey','==',periodKey).orderBy('score','desc').limit(limitN).get();return s.docs.map((d,i)=>({...d.data(),rank:i+1}))}

exports.finalizeArcadeDay=onSchedule({schedule:'58 23 * * 1-5',timeZone:TZ},async()=>{
  const key=dayKey(); const people=new Map();
  for(const board of BOARDS){const rows=await top(board.id,'daily',key,TOP_N);for(const row of rows){const current=people.get(row.uid)||{uid:row.uid,displayName:row.displayName||'Adventurer',bestRank:99,championsChoice:false,placements:[]};current.bestRank=Math.min(current.bestRank,row.rank);current.championsChoice=current.championsChoice||(CHAMPIONS_CHOICE_SCOPE==='per-board-first-place'&&row.rank===1);current.placements.push({boardId:board.id,boardTitle:board.title,rank:row.rank,score:row.score,metric:row.metric||String(row.score)});people.set(row.uid,current)}}
  for(const p of people.values()){
    const ref=db.collection('arcadeRewardEligibility').doc(`${key}__${p.uid}`);
    await db.runTransaction(async tx=>{const prior=await tx.get(ref);if(prior.exists)return;tx.set(ref,{dayKey:key,uid:p.uid,displayName:p.displayName,bestRank:p.bestRank,topFive:true,championsChoice:p.championsChoice,championsChoiceFlag:p.championsChoice?'CHAMPIONS_CHOICE':null,placements:p.placements,status:'pending',dailyClaimLimit:1,source:'arcadeLeaderboard',directRewardGranted:false,createdAt:FieldValue.serverTimestamp(),schemaVersion:1})});
  }
});

exports.archiveArcadeWeek=onSchedule({schedule:'10 0 * * 6',timeZone:TZ},async()=>{
  const friday=addDays(dayKey(),-1);const week=mondayKey(friday);
  for(const board of BOARDS){const rows=await top(board.id,'weekly',week,25);await db.collection('arcadeLeaderboardArchives').doc(`${week}__${board.id}`).set({weekKey:week,boardId:board.id,boardTitle:board.title,rankings:rows.map(r=>({uid:r.uid,displayName:r.displayName||'Adventurer',score:r.score,metric:r.metric||String(r.score),rank:r.rank})),topFive:rows.slice(0,5).map(r=>r.uid),archivedAt:FieldValue.serverTimestamp(),schemaVersion:1},{merge:true})}
});


// Retain permanent all-time records while pruning stale daily/weekly score documents.
// Admin SDK bypasses client rules intentionally; reward eligibility and archives are untouched.
async function deleteScorePage(periodType,cutoff){
  const snap=await db.collection('arcadeScores').where('periodType','==',periodType).where('periodKey','<',cutoff).limit(400).get();
  if(snap.empty)return 0;const batch=db.batch();snap.docs.forEach(d=>batch.delete(d.ref));await batch.commit();return snap.size;
}
exports.pruneArcadeScores=onSchedule({schedule:'25 2 * * 0',timeZone:TZ},async()=>{
  const today=dayKey();const dailyCut=addDays(today,-60),weeklyCut=addDays(today,-735);
  for(const [type,cutoff] of [['daily',dailyCut],['weekly',weeklyCut]]){let n=0;do{n=await deleteScorePage(type,cutoff)}while(n===400)}
});
