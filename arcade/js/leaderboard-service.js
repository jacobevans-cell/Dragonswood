import {getFirebaseContext,getCurrentAccess} from './access-client.js?v=57.1.15';
const CFG=window.DRAGONSWOOD_ARCADE_CONFIG||{};
const TIMEZONE=CFG.leaderboard?.timezone||'America/Phoenix';
const LOCAL_DAILY_DAYS=Math.max(7,Number(CFG.leaderboard?.localDailyRetentionDays)||60);
const LOCAL_WEEKLY_DAYS=Math.max(60,Number(CFG.leaderboard?.localWeeklyRetentionDays)||735);
let cloud={enabled:false,db:null,auth:null,user:null,fs:null};

function partsInZone(date=new Date()){
  const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'});
  return Object.fromEntries(fmt.formatToParts(date).filter(part=>part.type!=='literal').map(part=>[part.type,part.value]));
}
function dateKey(date=new Date()){const p=partsInZone(date);return `${p.year}-${p.month}-${p.day}`}
function mondayKeyFromDayKey(key){
  const date=new Date(`${key}T12:00:00Z`);
  const back=(date.getUTCDay()+6)%7;
  date.setUTCDate(date.getUTCDate()-back);
  return date.toISOString().slice(0,10);
}
export function periodKey(type,date=new Date()){
  const day=dateKey(date);
  return type==='daily'?day:type==='weekly'?mondayKeyFromDayKey(day):'all';
}
function cutoffKey(days){const date=new Date();date.setUTCDate(date.getUTCDate()-days);return date.toISOString().slice(0,10)}
function safeIdPart(value){return String(value).replace(/[^A-Za-z0-9_-]/g,'_').slice(0,90)}
function scoreDocId(uid,boardId,type,key){return `${safeIdPart(uid)}__${safeIdPart(type)}__${safeIdPart(key)}__${safeIdPart(boardId)}`}
function localKey(){return 'dragonswoodArcade.localLeaderboard.v2'}
function pruneLocal(data){
  const dailyCut=cutoffKey(LOCAL_DAILY_DAYS);
  const weeklyCut=cutoffKey(LOCAL_WEEKLY_DAYS);
  for(const [id,row] of Object.entries(data||{})){
    if(!row||typeof row!=='object'){delete data[id];continue}
    if(row.periodType==='daily'&&String(row.periodKey||'')<dailyCut)delete data[id];
    else if(row.periodType==='weekly'&&String(row.periodKey||'')<weeklyCut)delete data[id];
  }
  return data;
}
function readLocal(){
  try{
    const raw=JSON.parse(localStorage.getItem(localKey())||'{}');
    const before=Object.keys(raw).length;
    const pruned=pruneLocal(raw);
    if(Object.keys(pruned).length!==before)localStorage.setItem(localKey(),JSON.stringify(pruned));
    return pruned;
  }catch{
    return {};
  }
}
function writeLocal(value){localStorage.setItem(localKey(),JSON.stringify(pruneLocal(value)))}

export async function initLeaderboard(onStatus=()=>{}){
  try{
    onStatus('CONNECTING…');
    const C=await getFirebaseContext();
    cloud={enabled:true,db:C.db,auth:C.auth,user:C.user,fs:C.fsMod};
    onStatus('CLOUD LEADERBOARD');
  }catch(err){
    console.warn('Arcade cloud leaderboard unavailable:',err);
    onStatus('LOCAL RECORDS');
  }
  return cloud;
}
export function identityKey(profile){return cloud.enabled&&cloud.user?cloud.user.uid:profile.localId}

export async function submitBestScore(event,profile){
  const boardId=String(event.boardId||event.gameId||'').trim();
  const rawScore=Number(event.score);
  if(!boardId||!Number.isFinite(rawScore))return {updated:false};
  const score=Math.max(0,Math.floor(rawScore));
  const uid=identityKey(profile);
  const periods=['daily','weekly','allTime'];
  let any=false;
  if(cloud.enabled){
    const sessionId=String(getCurrentAccess()?.sessionId||'');
    if(!sessionId)return {updated:false,score,boardId,reason:'no-live-session'};
    const {doc,setDoc,serverTimestamp}=cloud.fs;
    const writes=periods.map(async type=>{
      const key=periodKey(type);
      const ref=doc(cloud.db,'arcadeScores',scoreDocId(uid,boardId,type,key));
      try{
        await setDoc(ref,{uid,studentKey:String(profile.studentId||'').slice(0,100),displayName:String(profile.displayName||'Adventurer').slice(0,32)||'Adventurer',gameId:String(event.gameId||boardId),boardId,periodType:type,periodKey:key,score,metric:String(event.metric??score).slice(0,100),details:event.details&&typeof event.details==='object'?event.details:{},schemaVersion:2,sessionId,updatedAt:serverTimestamp()},{merge:true});
        return true;
      }catch(err){
        if(err?.code==='permission-denied'||String(err?.message||'').toLowerCase().includes('permission'))return false;
        throw err;
      }
    });
    const results=await Promise.all(writes);
    any=results.some(Boolean);
  }else{
    const data=readLocal();
    for(const type of periods){
      const key=periodKey(type);
      const id=scoreDocId(uid,boardId,type,key);
      const prior=data[id]?Number(data[id].score):-1;
      if(score<=prior)continue;
      data[id]={uid,studentKey:String(profile.studentId||'').slice(0,100),displayName:String(profile.displayName||'Adventurer').slice(0,32)||'Adventurer',gameId:String(event.gameId||boardId),boardId,periodType:type,periodKey:key,score,metric:String(event.metric??score).slice(0,100),details:event.details||{},updatedAt:Date.now()};
      any=true;
    }
    writeLocal(data);
  }
  return {updated:any,score,boardId};
}

export async function getTop(boardId,type='daily',limitN=5){
  const key=periodKey(type);
  if(cloud.enabled){
    const {collection,query,where,orderBy,limit,getDocs}=cloud.fs;
    const q=query(collection(cloud.db,'arcadeScores'),where('boardId','==',boardId),where('periodType','==',type),where('periodKey','==',key),orderBy('score','desc'),limit(limitN));
    const snap=await getDocs(q);
    return snap.docs.map(doc=>doc.data());
  }
  return Object.values(readLocal()).filter(row=>row.boardId===boardId&&row.periodType===type&&row.periodKey===key).sort((a,b)=>b.score-a.score).slice(0,limitN);
}
