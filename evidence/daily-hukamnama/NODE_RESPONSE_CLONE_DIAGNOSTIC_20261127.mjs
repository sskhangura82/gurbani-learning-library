/* Read-only runtime diagnostic. No application or existing test is changed.
   Run: node --expose-gc evidence/daily-hukamnama/NODE_RESPONSE_CLONE_DIAGNOSTIC_20261127.mjs
   All response bodies are explicitly synthetic. No provider or private data. */
import fs from "node:fs/promises";
import {createHash,webcrypto} from "node:crypto";
import {setImmediate as tick} from "node:timers/promises";

if(typeof globalThis.gc!=="function")throw Error("Run this diagnostic with --expose-gc.");
const digest=bytes=>createHash("sha256").update(bytes).digest("hex");
const payload=new TextEncoder().encode("SYNTHETIC_GLP_TEST_BODY ".repeat(1024));
const expected=digest(payload);
const report={
 purpose:"Isolate native Response.clone lifetime behavior in the installed Node runtime; not a service-worker product verdict.",
 runtime:{node:process.version,undici:process.versions.undici,platform:process.platform,architecture:process.arch},
 expectedBodySha256:expected,bodyBytes:payload.byteLength,
 trials:[],runtimeImplementationEvidence:[]
};
const internal=process.binding("natives")["internal/deps/undici/undici"];
for(const [needle,length] of [["streamRegistry = new FinalizationRegistry",350],["function cloneBody",450],["function cloneResponse",410]]){
 const at=internal.indexOf(needle);
 report.runtimeImplementationEvidence.push({needle,offset:at,excerpt:at<0?null:internal.slice(at,at+length)});
}
async function trial(count,retainClones,round){
 const originals=Array.from({length:count},()=>new Response(payload));
 const retained=new Set(),cloneHashes=[];
 await Promise.all(originals.map(async response=>{
  if(retainClones){
   const clone=response.clone();retained.add(clone);
   cloneHashes.push(Buffer.from(await webcrypto.subtle.digest("SHA-256",await clone.arrayBuffer())).toString("hex"));
  }else{
   cloneHashes.push(Buffer.from(await webcrypto.subtle.digest("SHA-256",await response.clone().arrayBuffer())).toString("hex"));
  }
 }));
 const before=originals.filter(response=>response.bodyUsed).length;
 // Let clone-wrapper and clone-inner-state finalization occur while originals
 // remain strongly reachable. Retained mode holds the *same native clones*.
 for(let turn=0;turn<6;turn++){await tick();globalThis.gc();await tick();}
 const after=originals.filter(response=>response.bodyUsed).length;
 const reads=await Promise.all(originals.map(async(response,index)=>{
  try{return {index,ok:true,sha256:digest(new Uint8Array(await response.arrayBuffer()))};}
  catch(error){return {index,ok:false,name:error.name,message:error.message,bodyUsed:response.bodyUsed};}
 }));
 const result={round,count,retainClones,retainedCloneCount:retained.size,
  beforeGcOriginalBodyUsed:before,afterGcOriginalBodyUsed:after,
  cloneHashMismatches:cloneHashes.filter(hash=>hash!==expected).length,
  originalHashMismatches:reads.filter(read=>read.ok&&read.sha256!==expected).length,
  originalReadSuccesses:reads.filter(read=>read.ok).length,
  originalReadFailures:reads.filter(read=>!read.ok).length,
  firstFailure:reads.find(read=>!read.ok)||null};
 // Use retained objects after all original reads so their strong lifetime is
 // explicit and cannot be confused with a dead local variable.
 result.retainedClonesConsumed=Array.from(retained).every(response=>response.bodyUsed);
 retained.clear();return result;
}
for(let round=1;round<=2;round++){
 for(const count of [1,85,97])for(const retain of [false,true]){
  const result=await trial(count,retain,round);report.trials.push(result);console.log(JSON.stringify(result));
 }
}
report.conclusion=report.trials.every(result=>result.cloneHashMismatches===0&&result.originalHashMismatches===0&&(
 result.retainClones?result.originalReadFailures===0:result.originalReadFailures===result.count
))?"Reproduced: after explicit GC, discarding consumed native clones makes their still-live original Responses unreadable; strongly retaining those same clones preserves every original byte.":"Mixed or inconclusive; inspect the recorded cases without claiming a deterministic distinction.";
report.scope="Synthetic native Response diagnostic only. It does not replace real Chromium service-worker checks, CI checks on another Node build, or physical-device acceptance.";
await fs.writeFile(new URL("./NODE_RESPONSE_CLONE_DIAGNOSTIC_20261127.json",import.meta.url),JSON.stringify(report,null,2)+"\n");
console.log(report.conclusion);
