const fs=require("fs");
let fails=0;
function need(file,needle,label){
  const t=fs.readFileSync(file,"utf8");
  if(!t.includes(needle)){console.error("FAIL",label);fails++}else console.log("PASS",label);
}
need("index-v2.html","profile=snap.data();\n      // Bathroom slot group depends on profile.genderGroup","student rebind after profile load");
need("index-v2.html",'if((previousProfile?.genderGroup||"")!==(nextProfile?.genderGroup||""))watchBathroom();',"student rebind on group change");
need("index-v2.html","renderBathroomStudent(currentBathroomData);refreshPassHub();dwSyncPassLockAndOverdue()","student visible pass hub refresh");
for(const f of ["teacher.html","teacher-v2.html"]){
  need(f,"bathroomStatuses=[],bathroomSlots=[],bathroomRequests=[]",`${f} tracks shared slots`);
  need(f,"async function dwReconcileBathroomSlots()",`${f} stale-slot reconciler`);
  need(f,'onSnapshot(collection(db,"bathroomSlots")',`${f} listens to shared slots`);
  need(f,"const ownedSlots=bathroomSlots.filter",`${f} return clears actual owner slot`);
}
if(fails){console.error(`\n❌ ${fails} bathroom pass sync test(s) failed.`);process.exit(1)}
console.log("\n✅ ALL BATHROOM PASS SYNC SELF-TESTS PASSED");
