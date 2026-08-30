'use strict';

const admin=require('firebase-admin');
const {getFirestore,FieldValue}=require('firebase-admin/firestore');

const PROJECT_ID='dragonswood-9289e';
const CAPABILITIES=Object.freeze({
  selfUnlockMorning:true,
  selfUnlockCurriculum:true,
  selfUnlockArcade:true,
  selfUnlockKingdom:true,
  selfUnlockBoss:true,
  selfAwardPoints:true
});
const RECORDS=Object.freeze([
  Object.freeze({uid:'S2hmoniITye8AGvnLBSt6NeiJYq2',email:'jacob.evans@explore.academy',active:true,label:'Jacob Evans Explore Tester',capabilities:CAPABILITIES}),
  Object.freeze({uid:'LFy1nHGz5zbK0Xs0XSU2749zXxi1',email:'jacobicusjax@gmail.com',active:true,label:'Jacob Evans Teacher Tester',capabilities:CAPABILITIES})
]);

async function main(){
  const apply=process.argv.includes('--apply'),projectArg=process.argv.find(value=>value.startsWith('--project=')),projectId=projectArg?.slice('--project='.length)||'';
  if(!apply){console.log(JSON.stringify({mode:'dry-run',requiredProject:PROJECT_ID,records:RECORDS},null,2));return}
  if(projectId!==PROJECT_ID)throw new Error(`Refusing to write: pass --project=${PROJECT_ID} with --apply.`);
  if(!admin.apps.length)admin.initializeApp({projectId:PROJECT_ID,credential:admin.credential.applicationDefault()});
  const db=getFirestore();
  await db.runTransaction(async tx=>{
    const refs=RECORDS.map(record=>db.doc(`testerAccounts/${record.uid}`)),snaps=await Promise.all(refs.map(ref=>tx.get(ref)));
    RECORDS.forEach((record,index)=>tx.set(refs[index],{
      email:record.email,active:true,label:record.label,capabilities:{...record.capabilities},
      updatedAt:FieldValue.serverTimestamp(),...(snaps[index].exists?{}:{createdAt:FieldValue.serverTimestamp()})
    },{merge:true}));
  });
  console.log(JSON.stringify({mode:'applied',projectId:PROJECT_ID,paths:RECORDS.map(record=>`testerAccounts/${record.uid}`)},null,2));
}

module.exports=Object.freeze({PROJECT_ID,CAPABILITIES,RECORDS,main});
if(require.main===module)main().catch(error=>{console.error(error?.stack||error);process.exitCode=1});
