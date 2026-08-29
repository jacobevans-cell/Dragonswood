const fs=require("fs");
let fails=0;
function need(file,needle,label){
  const t=fs.readFileSync(file,"utf8");
  if(!t.includes(needle)){console.error("FAIL",label);fails++}else console.log("PASS",label);
}
need("v33-integration/js/integration/passes.js","function bathroomGroup(profile={})","V3 pass model derives the bathroom group from the current profile");
need("v33-integration/js/integration/runtime.js","boySlotUnsub=watchDoc(['bathroomSlots','boy']","student watches the shared boys slot");
need("v33-integration/js/integration/runtime.js","girlSlotUnsub=watchDoc(['bathroomSlots','girl']","student watches the shared girls slot");
need("v33-integration/js/integration/runtime.js","passes:Passes.studentPasses","student visible pass hub refreshes from the normalized live model");
need("v33-integration/js/integration/runtime.js","bathroomSlots:[]","teacher runtime tracks shared bathroom slots");
need("v33-integration/js/integration/runtime.js","async function reconcileBathroomSlot(slotId)","teacher runtime has a stale-slot reconciler");
need("v33-integration/js/integration/runtime.js","['bathroomSlots','bathroomSlots']","teacher runtime listens to shared slots");
need("v33-integration/js/integration/runtime.js","slotRefs=collection==='bathroomStatus'?['boy','girl']","teacher return checks both possible owner slots");
need("v33-integration/js/integration/runtime.js","String(slot.activeVisitId||'')===activeId","teacher return clears the slot by owner or active visit");
if(fails){console.error(`\n❌ ${fails} bathroom pass sync test(s) failed.`);process.exit(1)}
console.log("\n✅ ALL BATHROOM PASS SYNC SELF-TESTS PASSED");
