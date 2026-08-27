'use strict';

const CRITERIA=Object.freeze(['ready','responsible','complete']);
const TOKEN_CAP=3;
const SESSION_COST=3;
const SESSION_MS=30*60*1000;
const TEACHER_EMAIL='jacobicusjax@gmail.com';

function text(value){return String(value??'').trim()}
function clampTokens(value){return Math.max(0,Math.min(TOKEN_CAP,Math.floor(Number(value)||0)))}
function criterion(value){const v=text(value).toLowerCase();return CRITERIA.includes(v)?v:''}
function periodId(value){const v=text(value).replace(/[^A-Za-z0-9_-]/g,'_').slice(0,48);return v||''}
function normalizedEmail(value){return text(value).toLowerCase()}
function isTeacherEmail(value){return normalizedEmail(value)===TEACHER_EMAIL}
function phoenixDateKey(date=new Date()){
  return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Phoenix',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}
function toMillis(value){
  if(value&&typeof value.toMillis==='function')return value.toMillis();
  if(value instanceof Date)return value.getTime();
  const n=Number(value);return Number.isFinite(n)?n:0;
}
function effectiveEnabled(access={},settings={}){
  if(typeof access.individualEnabled==='boolean')return access.individualEnabled;
  return settings.enabled===true;
}
function activeSession(session={},now=Date.now()){
  return session.status==='active'&&toMillis(session.endAt)>now;
}
function publicAccess(access={},settings={},session=null,now=Date.now()){
  const enabled=effectiveEnabled(access,settings);
  const active=!!session&&enabled&&activeSession(session,now);
  return {
    tokens:clampTokens(access.tokens),tokenCap:TOKEN_CAP,sessionCost:SESSION_COST,
    teacherEnabled:enabled,classEnabled:settings.enabled===true,
    individualEnabled:typeof access.individualEnabled==='boolean'?access.individualEnabled:null,
    active,sessionId:active?text(session.id):'',endAtMillis:active?toMillis(session.endAt):0,
    remainingMs:active?Math.max(0,toMillis(session.endAt)-now):0,serverNowMillis:now
  };
}

module.exports=Object.freeze({CRITERIA,TOKEN_CAP,SESSION_COST,SESSION_MS,TEACHER_EMAIL,text,clampTokens,criterion,periodId,normalizedEmail,isTeacherEmail,phoenixDateKey,toMillis,effectiveEnabled,activeSession,publicAccess});
