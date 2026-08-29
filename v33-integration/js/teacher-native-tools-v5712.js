(function(){
'use strict';
const DAILY_ARCADE_PERIOD='daily';
const seatingNav=['seating','🪑','Seating Command'];

const originalTeacherNavItems=teacherNavItems;
teacherNavItems=function(){
  const items=originalTeacherNavItems().map(row=>[...row]);
  if(!items.some(row=>row[0]==='seating')){
    const i=items.findIndex(row=>row[0]==='tools');
    items.splice(i>=0?i+1:items.length,0,seatingNav);
  }
  return items;
};

function seatingHref(){
  const url=new URL('../seating-command/index.html',document.baseURI);
  url.searchParams.set('v','57.1.12');
  url.searchParams.set('dwEmbed','1');
  if(!IS_PRODUCTION)url.searchParams.set('dw-env','emulator');
  return url.href;
}
function seatingPage(){
  return `${pageBanner('🪑','Classroom tools','Seating Command','Build, optimize, save, and present the classroom layout without leaving Teacher Command.')}
  <section class="panel" style="padding:0;overflow:hidden;min-height:78vh">
    <iframe data-dw-seating-frame title="Seating Command" src="${escapeHtml(seatingHref())}" style="display:block;width:100%;height:78vh;border:0;background:#07101f"></iframe>
  </section>`;
}
function prepareSeatingFrame(frame){
  let doc;try{doc=frame.contentDocument}catch{return}
  if(!doc)return;
  doc.documentElement.classList.add('dw-native-embedded');
  const id='dw-native-seating-style';if(doc.getElementById(id))return;
  const style=doc.createElement('style');style.id=id;style.textContent=`
    html,body{min-height:100%!important;background:#07101f!important}
    .app-shell{display:block!important;min-height:100%!important}
    .sidebar,.topbar{display:none!important}
    .main-shell{margin:0!important;width:100%!important;min-width:0!important}
    .page-wrap{max-width:none!important;width:100%!important;padding:14px!important}
  `;doc.head?.append(style);
}

const originalPageMarkup=pageMarkup;
pageMarkup=function(){return state.page==='seating'?seatingPage():originalPageMarkup()};

const originalLaunchClassroomTool=launchClassroomTool;
launchClassroomTool=function(tool){
  if(tool==='Seating Command'){
    state.page='seating';
    if(location.hash!=='#seating')history.pushState(null,'','#seating');
    render();
    return;
  }
  return originalLaunchClassroomTool(tool);
};

// Arcade Tokens are a daily classroom currency. There is no schedule/clock dependency.
refreshArcadeTeacher=async function(){
  const chosen=students.filter(s=>state.selected.has(s.id));
  if(!chosen.length){showToast('Select at least one scholar first.');return}
  await runArcade(async()=>{
    const pairs=await Promise.all(chosen.map(async s=>[s.id,await arcadeTeacher.getState(s.id,DAILY_ARCADE_PERIOD)]));
    for(const [id,value] of pairs)state.arcadeRows[id]=value;
  },'Arcade status refreshed.');
};
awardArcade=async function(criterion){
  const ids=[...state.selected];
  if(!ids.length){showToast('Select at least one scholar first.');return}
  await runArcade(async()=>{
    const results=await Promise.all(ids.map(uid=>arcadeTeacher.award(uid,criterion,DAILY_ARCADE_PERIOD)));
    const awarded=results.filter(row=>row?.awarded===true).length;
    const pairs=await Promise.all(ids.map(async uid=>[uid,await arcadeTeacher.getState(uid,DAILY_ARCADE_PERIOD)]));
    for(const [id,value] of pairs)state.arcadeRows[id]=value;
    if(!awarded&&results.some(row=>row?.reason==='already-awarded'))showToast('That criterion was already awarded today.');
  },`${criterion[0].toUpperCase()+criterion.slice(1)} Token criterion processed.`);
};
setArcadeClass=function(enabled){
  const destination=window.DWV33Integration?.environment==='manual-preview'?'this browser’s isolated preview state':writeDestination();
  openDialog(`${enabled?'Open':'Lock'} Arcade Time?`,`<p>${enabled?'Open Arcade for the class now. This is a manual teacher switch and is not tied to the schedule.':'Lock Arcade immediately and end active Arcade sessions.'}</p><p class="muted">Opening class access also clears old individual locks. This command writes only to ${destination}.</p>`,`<button class="btn btn-secondary" data-close-dialog>Cancel</button><button class="btn ${enabled?'btn-primary':'btn-danger'}" id="confirm-arcade-class">${enabled?'Open Arcade now':'Lock Arcade now'}</button>`);
  dialogRoot.querySelector('#confirm-arcade-class')?.addEventListener('click',async()=>{
    closeDialog();
    await runArcade(async()=>{
      await arcadeTeacher.setAvailability(enabled);
      // Compatibility bridge: mirror the class switch to current roster records.
      // The V57.1.12 backend also enforces the class switch as the master gate.
      await Promise.all(students.map(student=>arcadeTeacher.setAvailability(enabled,student.id)));
      const ids=[...state.selected];
      if(ids.length){const pairs=await Promise.all(ids.map(async uid=>[uid,await arcadeTeacher.getState(uid,DAILY_ARCADE_PERIOD)]));for(const [id,value] of pairs)state.arcadeRows[id]=value}
    },`Class Arcade Time ${enabled?'opened':'locked'}.`);
  });
};
setArcadeIndividual=async function(uid,enabled){
  await runArcade(async()=>{
    await arcadeTeacher.setAvailability(enabled,uid);
    state.arcadeRows[uid]=await arcadeTeacher.getState(uid,DAILY_ARCADE_PERIOD);
  },`Scholar Arcade access ${enabled?'opened':'locked'}.`);
};
arcadePage=function(){
  const selected=students.filter(student=>state.selected.has(student.id));
  const rows=selected.map(student=>{
    const value=state.arcadeRows[student.id]||{},criteria=value.criteria||{},tokens=Math.max(0,Math.min(3,Number(value.tokens)||0));
    const classOpen=value.classEnabled===true,individualLocked=value.individualEnabled===false,open=value.teacherEnabled===true;
    return `<div class="pass-card"><div class="pass-row"><div class="pass-student"><span class="roster-avatar">${escapeHtml(student.name[0]||'?')}</span><div><b>${escapeHtml(student.name)}</b><p>${tokens} / 3 Tokens • ${value.active?'Session active':open?'Arcade open':'Arcade locked'}</p></div></div><div class="row"><span class="selected-badge">${criteria.ready?'✓':'○'} Ready</span><span class="selected-badge">${criteria.responsible?'✓':'○'} Responsible</span><span class="selected-badge">${criteria.complete?'✓':'○'} Complete</span><button class="btn btn-secondary btn-sm" data-arcade-individual="${escapeHtml(student.id)}" data-enabled="${individualLocked?'true':'false'}" ${classOpen?'':'disabled'}>${individualLocked?'Unlock':'Lock'}</button></div></div></div>`;
  }).join('');
  const known=selected.map(student=>state.arcadeRows[student.id]).find(value=>typeof value?.classEnabled==='boolean');
  const classLabel=known?known.classEnabled?'OPEN NOW':'LOCKED':'Manual switch';
  return `${pageBanner('🕹️','Free-time currency','Arcade Time Command','Award Ready, Responsible, and Complete once per school day. Arcade availability is a manual teacher switch, never a schedule.')}
  <section class="panel teacher-form">
    <div class="form-grid"><div class="field span-3"><label>Class availability • ${classLabel}</label><div class="row"><button class="btn btn-primary" data-arcade-class="true" ${state.arcadeBusy?'disabled':''}>Open Arcade Time</button><button class="btn btn-danger" data-arcade-class="false" ${state.arcadeBusy?'disabled':''}>Lock Arcade Now</button></div></div></div>
    <div class="eyebrow mt-12">Award one daily Token criterion to every selected scholar</div>
    <div class="row mt-12">${[['ready','Ready'],['responsible','Responsible'],['complete','Complete']].map(([id,label])=>`<button class="btn btn-secondary" data-arcade-award="${id}" ${!selected.length||state.arcadeBusy?'disabled':''}>＋ ${label}</button>`).join('')}</div>
    <p class="muted prototype-note">Each criterion can be awarded once per Phoenix school day • wallets stay capped at three • no class-period or clock dependency.</p>
  </section>
  <section class="panel mt-12"><div class="row between"><div><div class="eyebrow">Choose scholars</div><h3>${selected.length} selected</h3></div><div class="row"><button class="btn btn-quiet btn-sm" type="button" data-arcade-select-all>Select all</button><button class="btn btn-quiet btn-sm" type="button" data-arcade-clear>Clear</button><button class="btn btn-secondary btn-sm" type="button" data-arcade-refresh>↻ Refresh selected</button></div></div><div class="arcade-roster-checklist">${students.map(student=>`<label class="arcade-roster-choice"><input type="checkbox" data-arcade-student="${escapeHtml(student.id)}" ${state.selected.has(student.id)?'checked':''}><span>${escapeHtml(student.name)}</span></label>`).join('')}</div><p class="muted mt-12"><b>Before award:</b> ${escapeHtml(selected.length?selected.map(student=>student.name).join(', '):'No scholars selected.')}</p></section>
  <section class="panel pass-list mt-12"><div class="row between"><div><div class="eyebrow">Token status</div><h3>${selected.length} selected</h3></div></div><div class="stack mt-12">${rows||'<div class="empty-center"><div><strong>Select scholars above.</strong><small>Their Token status will appear here.</small></div></div>'}</div></section>`;
};

const originalBind=bind;
bind=function(){
  originalBind();
  const frame=app.querySelector('[data-dw-seating-frame]');
  if(frame){
    const prepare=()=>prepareSeatingFrame(frame);
    frame.addEventListener('load',prepare,{once:false});
    if(frame.contentDocument?.readyState==='complete')prepare();
  }
};
})();
