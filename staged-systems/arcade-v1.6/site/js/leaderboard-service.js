const CFG = window.DRAGONSWOOD_ARCADE_CONFIG || {};
const TIMEZONE = CFG.leaderboard?.timezone || 'America/Phoenix';
const LOCAL_DAILY_DAYS=Math.max(7,Number(CFG.leaderboard?.localDailyRetentionDays)||60);
const LOCAL_WEEKLY_DAYS=Math.max(60,Number(CFG.leaderboard?.localWeeklyRetentionDays)||735);
let cloud = { enabled:false, db:null, auth:null, user:null, fs:null };

function partsInZone(date = new Date()) {const fmt = new Intl.DateTimeFormat('en-CA',{timeZone:TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'});return Object.fromEntries(fmt.formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));}
function dateKey(date = new Date()) { const p=partsInZone(date); return `${p.year}-${p.month}-${p.day}`; }
function mondayKeyFromDayKey(key) {const d = new Date(`${key}T12:00:00Z`); const day=d.getUTCDay(); const back=(day+6)%7; d.setUTCDate(d.getUTCDate()-back); return d.toISOString().slice(0,10);}
export function periodKey(type, date = new Date()) { const d=dateKey(date); return type==='daily'?d:type==='weekly'?mondayKeyFromDayKey(d):'all'; }
function cutoffKey(days){const d=new Date();d.setUTCDate(d.getUTCDate()-days);return d.toISOString().slice(0,10)}
function safeIdPart(v){return String(v).replace(/[^A-Za-z0-9_-]/g,'_').slice(0,90)}
function scoreDocId(uid, boardId, type, key){return `${safeIdPart(uid)}__${safeIdPart(type)}__${safeIdPart(key)}__${safeIdPart(boardId)}`}
function localKey(){return 'dragonswoodArcade.localLeaderboard.v2'}
function pruneLocal(data){const dailyCut=cutoffKey(LOCAL_DAILY_DAYS),weeklyCut=cutoffKey(LOCAL_WEEKLY_DAYS);for(const [id,row] of Object.entries(data||{})){if(!row||typeof row!=='object'){delete data[id];continue}if(row.periodType==='daily'&&String(row.periodKey||'')<dailyCut)delete data[id];else if(row.periodType==='weekly'&&String(row.periodKey||'')<weeklyCut)delete data[id]}return data}
function readLocal(){try{const raw=JSON.parse(localStorage.getItem(localKey())||'{}'),before=Object.keys(raw).length;const pruned=pruneLocal(raw);if(Object.keys(pruned).length!==before)localStorage.setItem(localKey(),JSON.stringify(pruned));return pruned}catch{return {}}}}
function writeLocal(v){localStorage.setItem(localKey(),JSON.stringify(pruneLocal(v)))}

export async function initLeaderboard(onStatus=()=>{}) {const cfg=CFG.firebase||{};if(!cfg.enabled){onStatus('LOCAL MODE');return cloud}if(!cfg.apiKey||!cfg.projectId||!cfg.appId){onStatus('CLOUD CONFIG NEEDED');return cloud}try{onStatus('CONNECTING…');const [{initializeApp},authMod,fsMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);const app=initializeApp({apiKey:cfg.apiKey,authDomain:cfg.authDomain||`${cfg.projectId}.firebaseapp.com`,projectId:cfg.projectId,appId:cfg.appId});const auth=authMod.getAuth(app);if(!auth.currentUser && (cfg.authMode||'anonymous')==='anonymous') await authMod.signInAnonymously(auth);if(!auth.currentUser) throw new Error('No authenticated arcade user');cloud={enabled:true,db:fsMod.getFirestore(app),auth,user:auth.currentUser,fs:fsMod};onStatus('CLOUD LEADERBOARD')}catch(err){console.warn('Arcade cloud leaderboard unavailable:',err);onStatus('LOCAL MODE')}return cloud;}
export function identityKey(profile){return cloud.enabled&&cloud.user?cloud.user.uid:profile.localId}

export async function submitBestScore(event, profile) {
  const boardId=String(event.boardId||event.gameId||'').trim();
  const rawScore=Number(event.score);
  if(!boardId||!Number.isFinite(rawScore)) return {updated:false};
  const score=Math.max(0,Math.floor(rawScore));
  const uid=identityKey(profile),periods=['daily','weekly','allTime'];
  let any=false;
  if(cloud.enabled){
    const {doc,setDoc,serverTimestamp}=cloud.fs;
    const writes=periods.map(async type=>{const key=periodKey(type);const ref=doc(cloud.db,'arcadeScores',scoreDocId(uid,boardId,type,key));try{await setDoc(ref,{uid,studentKey:String(profile.studentId||'').slice(0,100),displayName:String(profile.displayName||'Adventurer').slice(0,32)||'Adventurer',gameId:String(event.gameId||boardId),boardId,periodType:type,periodKey:key,score,metric:String(event.metric??score).slice(0,100),details:event.details&&typeof event.details==='object'?event.details:{},schemaVersion:2,updatedAt:serverTimestamp()},{merge:true});return true}catch(err){if(err?.code==='permission-denied'||String(err?.message||'').toLowerCase().includes('permission'))return false;throw err}});
    const results=await Promise.all(writes);any=results.some(Boolean);
  } else {
    const data=readLocal();
    for(const type of periods){const key=periodKey(type),id=scoreDocId(uid,boardId,type,key);const prior=data[id]?Number(data[id].score):-1;if(score<=prior)continue;data[id]={uid,studentKey:String(profile.studentId||'').slice(0,100),displayName:String(profile.displayName||'Adventurer').slice(0,32)||'Adventurer',gameId:String(event.gameId||boardId),boardId,periodType:type,periodKey:key,score,metric:String(event.metric??score).slice(0,100),details:event.details||{},updatedAt:Date.now()};any=true}writeLocal(data);
  }
  return {updated:any,score,boardId};
}
export async function getTop(boardId,type='daily',limitN=5){const key=periodKey(type);if(cloud.enabled){const {collection,query,where,orderBy,limit,getDocs}=cloud.fs;const q=query(collection(cloud.db,'arcadeScores'),where('boardId','==',boardId),where('periodType','==',type),where('periodKey','==',key),orderBy('score','desc'),limit(limitN));const snap=await getDocs(q);return snap.docs.map(d=>d.data())}return Object.values(readLocal()).filter(x=>x.boardId===boardId&&x.periodType===type&&x.periodKey===key).sort((a,b)=>b.score-a.score).slice(0,limitN)}
