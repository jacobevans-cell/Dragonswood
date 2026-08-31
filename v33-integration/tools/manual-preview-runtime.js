(function(root){
  'use strict';
  const store=root.DWArcadeManualStore;
  if(!store)throw new Error('Manual Arcade preview store did not load.');
  const substitutePreview=new URLSearchParams(location.search).get('substitute')==='1';
  const substituteMode=Object.freeze({active:substitutePreview,dateKey:new Intl.DateTimeFormat('en-CA',{timeZone:'America/Phoenix'}).format(new Date()),reason:'Ask your substitute teacher if you need help or need to leave the room.'});
  const previewPasses=substitutePreview?Object.freeze({blackout:true,blackoutReason:'Substitute Mode is on today. Ask your substitute teacher if you need a pass.',rows:Object.freeze(Object.fromEntries([['bathroom','Bathroom','🚻'],['snack','Snack','🍎'],['outOfSeat','Out of Seat','🚶'],['office','Emergency Office','🏥']].map(([type,label,icon])=>[type,Object.freeze({type,label,icon,action:'blocked',message:'Substitute Mode is on today. Ask your substitute teacher if you need a pass.',active:false,blocking:type==='bathroom'||type==='office'})]))) }):null;

  const names=[
    ['Jacob Preview','Grade 5 • Tester',store.STUDENT_UID],
    ['Abigail','Grade 5 • Girls'],['Alaina','Grade 4 • Girls'],['Alejandro','Grade 5 • Boys'],
    ['Aliya','Grade 5 • Girls'],['Caleb','Grade 5 • Boys'],['Christian','Grade 4 • Boys'],
    ['Damian','Grade 4 • Boys'],['DragonTest','Grade 5 • Girls'],['Frank','Grade 4 • Boys'],
    ['Grayson','Grade 5 • Boys'],['Joshua','Grade 5 • Boys'],['Kinsley','Grade 4 • Girls'],
    ['Nala','Grade 4 • Girls'],['Raul','Grade 5 • Boys']
  ];
  const students=names.map(([name,meta,id],i)=>({id:id||`manual-${i}-${name.toLowerCase()}`,name,meta,grade:(meta.match(/Grade (\d)/)||[])[1]||'—',genderGroup:/Girls/.test(meta)?'girls':/Boys/.test(meta)?'boys':'tester'}));

  root.DWV33Integration=Object.freeze({
    version:'manual-preview-v1',environment:'manual-preview',
    async startStudent(onUpdate){
      queueMicrotask(()=>onUpdate({status:'authorized',environment:'manual-preview',user:{uid:store.STUDENT_UID,email:'preview-student@example.invalid',displayName:'Jacob'},student:{uid:store.STUDENT_UID,email:'preview-student@example.invalid',firstName:'Jacob',initial:'J',displayName:'Jacob the Dragon Keeper',grade:'5',genderGroup:'tester',hp:48,gold:385,xp:1520,level:12,xpFloor:0,xpNext:2000,xpPct:76,streak:7,classId:'warrior',classLabel:'Warrior',activePet:'nyx',petName:'Nyx',inventory:[],equipped:{},title:'dragonkeeper',narrationVoice:'',profileMissing:false,morningWorkComplete:true,dailyAccessOverride:false,dailyAccessUnlocked:true},passes:previewPasses,substituteMode,kingdomAccess:{unlocked:!substitutePreview}}));
      return {async signIn(){},async signOut(){},dispose(){}};
    },
    async startTeacher(onUpdate){
      queueMicrotask(()=>onUpdate({status:'authorized',environment:'manual-preview',user:{uid:'manual-teacher',email:'preview-teacher@example.invalid',displayName:'Mr. Evans'},teacherName:'Mr. Evans',students,operations:{dateKey:substituteMode.dateKey,substituteMode,pending:[],active:[],recognition:[],curriculumOverrides:[],attention:{active:false,events:[]},kingdomAccess:{active:false,all:false,studentIds:[]},goals:{shared:64,universal:24,rows:[]}}}));
      return {async signIn(){},async signOut(){},dispose(){}};
    }
  });

  root.DWV33ArcadePortal=Object.freeze({
    getAccess:async()=>store.getAccess(store.STUDENT_UID),
    startSession:async()=>store.startSession(store.STUDENT_UID),
    preflight:async()=>true,
    href:()=>new URL('../arcade/manual-preview.html',location.href).href,
    navigate(){location.assign(this.href())}
  });
  root.DWV33ArcadeTeacher=Object.freeze({
    enabled:true,
    getState:async(uid,periodId)=>store.getTeacherState(uid,periodId),
    award:async(uid,criterion,periodId)=>store.award(uid,criterion,periodId),
    setAvailability:async(enabled,uid='')=>store.setAvailability(enabled,uid),
    refund:async(uid,sessionId,reason)=>store.refund(uid,sessionId,reason)
  });
  root.DWV33KingdomPortal=Object.freeze({href:()=>{
    const url=new URL('../kingdom-test.html',location.href);
    url.searchParams.set('dwEmbed','1');
    url.searchParams.set('dw-env','emulator');
    return url.href;
  }});
  root.addEventListener?.('storage',event=>{if(event.key===store.STORAGE_KEY)root.refreshArcadePortal?.()});
  root.addEventListener?.('message',event=>{if(event.origin===location.origin&&event.data?.channel==='dw-v33-manual-preview'&&event.data?.type==='arcade-state-changed')root.refreshArcadePortal?.()});
})(typeof globalThis!=='undefined'?globalThis:this);
