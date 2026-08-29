(function(root){
  'use strict';
  const store=root.DWArcadeManualStore;
  if(!store)throw new Error('Manual Arcade preview store did not load.');

  const names=[
    ['Jacob Preview','Grade 5 • Tester',store.STUDENT_UID],
    ['Abigail','Grade 5 • Girls'],['Alaina','Grade 4 • Girls'],['Alejandro','Grade 5 • Boys'],
    ['Aliya','Grade 5 • Girls'],['Caleb','Grade 5 • Boys'],['Christian','Grade 4 • Boys'],
    ['Damian','Grade 4 • Boys'],['DragonTest','Grade 5 • Girls'],['Frank','Grade 4 • Boys'],
    ['Grayson','Grade 5 • Boys'],['Joshua','Grade 5 • Boys'],['Kinsley','Grade 4 • Girls'],
    ['Nala','Grade 4 • Girls'],['Raul','Grade 5 • Boys']
  ];
  const students=names.map(([name,meta,id],i)=>({id:id||`manual-${i}-${name.toLowerCase()}`,name,meta,grade:(meta.match(/Grade (\d)/)||[])[1]||'—',genderGroup:/Girls/.test(meta)?'girls':/Boys/.test(meta)?'boys':'tester'}));
  const previewAssignments=(student,index)=>[
    {id:`${student.id}-daily-morning`,category:'Daily Quest',title:'Daily Quest • Day 19 • morning',score:42+(index%6)*7,status:'complete'},
    {id:`${student.id}-daily-exit`,category:'Daily Quest',title:'Daily Quest • Day 19 • exit',score:58+(index%5)*6,status:'complete'},
    {id:`${student.id}-curriculum`,category:'Curriculum Quest',title:'Curriculum Quest • Science • Day 18',score:70+(index%4)*8,status:'recorded'},
    {id:`${student.id}-witches`,category:'Witches Time',title:'The Witches • 2026-08-28',score:index%3===0?50:100,status:index%3===0?'incomplete':'complete',evidence:index%3===0?'10/20 verified min • pages 4–8':'20/20 verified min • pages 4–12'}
  ];
  const gradebookRows=students.map((student,index)=>{const daily=58+(index*7)%40,curriculum=64+(index*9)%37,readingAssigned=index%4!==0,reading=readingAssigned?(index%3===0?50:100):null,missing=readingAssigned&&reading<100?1:0,total=Math.round((daily*40+curriculum*40+(readingAssigned?reading*20:0))/(readingAssigned?100:80));return {...student,initial:student.name[0],total,totalStatus:missing?'Provisional':'Complete evidence',daily,curriculum,reading,readingMinutes:readingAssigned?(reading===100?20:10):0,readingAssigned,readingStatus:readingAssigned?(reading===100?'Complete':'Incomplete'):'Not assigned',missing,assignments:previewAssignments(student,index)}});
  const previewAcademic={gradebook:{rows:gradebookRows,classAverage:Math.round(gradebookRows.reduce((sum,row)=>sum+row.total,0)/gradebookRows.length),missing:gradebookRows.reduce((sum,row)=>sum+row.missing,0),studentsWithMissing:gradebookRows.filter(row=>row.missing).length,assignedWork:4,weights:{daily:40,curriculum:40,reading:20},readingTargetMinutes:20,readingAssignedDateKeys:['2026-08-28'],readingTargetsByDate:{'2026-08-28':20},gradeIntegrityVersion:2,reportCardPercentageReady:true},scribe:null};

  root.DWV33Integration=Object.freeze({
    version:'manual-preview-v1',environment:'manual-preview',
    async startStudent(onUpdate){
      queueMicrotask(()=>onUpdate({status:'authorized',environment:'manual-preview',user:{uid:store.STUDENT_UID,email:'preview-student@example.invalid',displayName:'Jacob'},student:{uid:store.STUDENT_UID,email:'preview-student@example.invalid',firstName:'Jacob',initial:'J',displayName:'Jacob the Dragon Keeper',grade:'5',genderGroup:'tester',hp:48,gold:385,xp:1520,level:12,xpFloor:0,xpNext:2000,xpPct:76,streak:7,classId:'warrior',classLabel:'Warrior',activePet:'nyx',petName:'Nyx',inventory:[],equipped:{},title:'dragonkeeper',narrationVoice:'',profileMissing:false,morningWorkComplete:true,dailyAccessOverride:false,dailyAccessUnlocked:true}}));
      return {async signIn(){},async signOut(){},dispose(){}};
    },
    async startTeacher(onUpdate){
      queueMicrotask(()=>onUpdate({status:'authorized',environment:'manual-preview',user:{uid:'manual-teacher',email:'preview-teacher@example.invalid',displayName:'Mr. Evans'},teacherName:'Mr. Evans',students,academic:previewAcademic}));
      return {async signIn(){},async signOut(){},dispose(){}};
    }
  });

  root.DWV33ArcadePortal=Object.freeze({
    getAccess:async()=>store.getAccess(store.STUDENT_UID),
    href:()=>new URL('../arcade/manual-preview.html',location.href).href
  });
  root.DWV33ArcadeTeacher=Object.freeze({
    enabled:true,
    getState:async(uid,periodId)=>store.getTeacherState(uid,periodId),
    award:async(uid,criterion,periodId)=>store.award(uid,criterion,periodId),
    setAvailability:async(enabled,uid='')=>store.setAvailability(enabled,uid),
    refund:async(uid,sessionId,reason)=>store.refund(uid,sessionId,reason)
  });
  root.DWV33KingdomPortal=Object.freeze({href:()=>new URL('../kingdom-manual-preview.html',location.href).href});
  root.addEventListener?.('storage',event=>{if(event.key===store.STORAGE_KEY)root.refreshArcadePortal?.()});
  root.addEventListener?.('message',event=>{if(event.origin===location.origin&&event.data?.channel==='dw-v33-manual-preview'&&event.data?.type==='arcade-state-changed')root.refreshArcadePortal?.()});
})(typeof globalThis!=='undefined'?globalThis:this);
