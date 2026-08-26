(function(root){
  'use strict';

  const STORAGE_KEY='dw-v33-manual-preview:arcade-v1';
  const STUDENT_UID='manual-student';
  const MAX_TOKENS=3;
  const SESSION_MS=30*60*1000;
  const CRITERIA=new Set(['ready','responsible','complete']);

  function emptyStudent(){
    return {tokens:0,individualEnabled:true,active:false,sessionId:'',lastSessionId:'',endAtMillis:0,criteriaByPeriod:{}};
  }
  function initialState(){
    const student=emptyStudent();student.tokens=MAX_TOKENS;
    return {schemaVersion:1,classEnabled:true,students:{[STUDENT_UID]:student},sessions:{},audit:[]};
  }
  function clone(value){return JSON.parse(JSON.stringify(value))}
  function read(){
    try{
      const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(value?.schemaVersion===1&&value.students&&value.sessions)return value;
    }catch{}
    const value=initialState();write(value);return value;
  }
  function write(value){localStorage.setItem(STORAGE_KEY,JSON.stringify(value));return value}
  function ensureStudent(state,uid){
    const key=String(uid||STUDENT_UID);state.students[key]||=emptyStudent();return state.students[key];
  }
  function now(){return Date.now()}
  function expire(student){
    if(student.active&&Number(student.endAtMillis||0)<=now()){
      student.active=false;student.sessionId='';student.endAtMillis=0;return true;
    }
    return false;
  }
  function audit(state,action,details={}){
    state.audit.push({action,atMillis:now(),...details});
    if(state.audit.length>100)state.audit.splice(0,state.audit.length-100);
  }
  function accessFor(state,uid=STUDENT_UID){
    const student=ensureStudent(state,uid),changed=expire(student);
    if(changed)write(state);
    const teacherEnabled=state.classEnabled===true&&student.individualEnabled!==false;
    return {tokens:Math.max(0,Math.min(MAX_TOKENS,Number(student.tokens)||0)),teacherEnabled,individualEnabled:student.individualEnabled!==false,active:teacherEnabled&&student.active===true,sessionId:student.sessionId||'',lastSessionId:student.lastSessionId||student.sessionId||'',endAtMillis:Number(student.endAtMillis)||0,serverNowMillis:now(),preview:true};
  }
  function getAccess(uid=STUDENT_UID){return accessFor(read(),uid)}
  function getTeacherState(uid,periodId='period-1'){
    const state=read(),student=ensureStudent(state,uid),access=accessFor(state,uid);
    return {...access,criteria:{...(student.criteriaByPeriod[String(periodId)]||{})}};
  }
  function award(uid,criterion,periodId='period-1'){
    const id=String(criterion||'').toLowerCase();if(!CRITERIA.has(id))throw new Error('Unknown Arcade Token criterion.');
    const state=read(),student=ensureStudent(state,uid),period=String(periodId||'period-1');
    student.criteriaByPeriod[period]||={};
    if(student.criteriaByPeriod[period][id])return getTeacherState(uid,period);
    student.criteriaByPeriod[period][id]=true;
    student.tokens=Math.min(MAX_TOKENS,(Number(student.tokens)||0)+1);
    audit(state,'award-token',{uid:String(uid),criterion:id,periodId:period,tokens:student.tokens});write(state);
    return getTeacherState(uid,period);
  }
  function setAvailability(enabled,uid=''){
    const state=read(),open=enabled===true;
    if(uid){
      const student=ensureStudent(state,uid);student.individualEnabled=open;
      if(!open){student.active=false;student.sessionId='';student.endAtMillis=0}
      audit(state,open?'open-student':'lock-student',{uid:String(uid)});
    }else{
      state.classEnabled=open;
      if(!open)for(const student of Object.values(state.students)){student.active=false;student.sessionId='';student.endAtMillis=0}
      audit(state,open?'open-class':'lock-class');
    }
    write(state);return {ok:true,enabled:open,uid:String(uid||'')};
  }
  function startSession(uid=STUDENT_UID){
    const state=read(),student=ensureStudent(state,uid),access=accessFor(state,uid);
    if(access.active)return access;
    if(!access.teacherEnabled)throw new Error('Arcade is locked by the teacher.');
    if(access.tokens!==MAX_TOKENS)throw new Error('Three Arcade Tokens are required.');
    const sessionId=`preview-${now()}-${Math.random().toString(36).slice(2,8)}`;
    student.tokens=0;student.active=true;student.sessionId=sessionId;student.lastSessionId=sessionId;student.endAtMillis=now()+SESSION_MS;
    state.sessions[sessionId]={uid:String(uid),spentTokens:MAX_TOKENS,refunded:false,startedAtMillis:now(),endAtMillis:student.endAtMillis};
    audit(state,'start-session',{uid:String(uid),sessionId,spentTokens:MAX_TOKENS});write(state);
    return accessFor(state,uid);
  }
  function refund(uid,sessionId,reason){
    const state=read(),session=state.sessions[String(sessionId||'')];
    if(!session||session.uid!==String(uid))throw new Error('Preview session ID was not found for this scholar.');
    if(session.refunded)throw new Error('This preview session was already refunded.');
    if(!String(reason||'').trim())throw new Error('A technical reason is required.');
    const student=ensureStudent(state,uid),before=Math.max(0,Math.min(MAX_TOKENS,Number(student.tokens)||0));
    student.tokens=Math.min(MAX_TOKENS,before+Number(session.spentTokens||0));session.refunded=true;
    audit(state,'refund-session',{uid:String(uid),sessionId:String(sessionId),returned:student.tokens-before,reason:String(reason).trim().slice(0,120)});write(state);
    return {ok:true,tokens:student.tokens,returned:student.tokens-before};
  }
  function endSession(uid=STUDENT_UID,reason='preview-exit'){
    const state=read(),student=ensureStudent(state,uid),sessionId=student.sessionId||'';
    student.active=false;student.sessionId='';student.endAtMillis=0;
    audit(state,'end-session',{uid:String(uid),sessionId,reason:String(reason)});write(state);return {ok:true};
  }
  function remainingMs(access=getAccess()){return access?.active?Math.max(0,Number(access.endAtMillis||0)-now()):0}
  function reset(){const state=initialState();write(state);return clone(state)}
  function snapshot(){return clone(read())}

  root.DWArcadeManualStore=Object.freeze({STORAGE_KEY,STUDENT_UID,MAX_TOKENS,SESSION_MS,getAccess,getTeacherState,award,setAvailability,startSession,refund,endSession,remainingMs,reset,snapshot});
})(typeof globalThis!=='undefined'?globalThis:this);
