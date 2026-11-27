/* Focused builder regression checks, not an independent-review verdict.
   Initial read-only probe PID7117 accepted six malformed variants through the
   old signer: contradictory observation date, an unknown observation-original
   field, witness count 999, contradictory witness boundary digest, missing
   policy pins, and an unknown payload field. Only synthetic marker strings and
   an ephemeral in-memory key were used; no artifact was written or published. */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {validateStage} from "../tools/hukamnama-stage-contract.mjs";
const directory=new URL("../evidence/daily-hukamnama/capture-2026-11-27/",import.meta.url);
const manifest=JSON.parse(await fs.readFile(new URL("manifest.json",directory),"utf8"));
const [payload,source,receipt]=await Promise.all(["payload","source","receipt"].map(async kind=>JSON.parse(await fs.readFile(new URL(manifest[kind].path,directory),"utf8"))));
const fixture={payload,source,receipt},copy=()=>structuredClone(fixture);
let passed=0,failed=0;
function check(name,run){try{run();passed++;console.log("PASS "+name);}catch(error){failed++;console.error("FAIL "+name+"\n"+error.stack);}}
function rejects(mutate,pattern){const changed=copy();mutate(changed);assert.throws(()=>validateStage(changed),pattern);}
check("unchanged original-only 27 November capture passes the parsed-stage contract",()=>{
 assert.equal(validateStage(fixture),true);
});
check("unknown content fields refuse at every event/source/receipt nesting boundary",()=>{
 const paths=[
  x=>x.payload,x=>x.payload.source,x=>x.payload.lessons,
  x=>x.source,x=>x.source.occurrences[0],x=>x.source.provenance,x=>x.source.provenance.pages[0],
  x=>x.receipt,x=>x.receipt.original,x=>x.receipt.observations[0],x=>x.receipt.observations[0].original,
  x=>x.receipt.observations[1],x=>x.receipt.observations[1].original,x=>x.receipt.observations[0].transport,
  x=>x.receipt.witness,x=>x.receipt.witness.provenance,x=>x.receipt.policyPins[0]
 ];
 for(const target of paths)rejects(x=>target(x).translation="SYNTHETIC_UNAPPROVED_FIELD",/unapproved|Explanation|explanatory|provenance|transport/i);
});
check("contradictory observation date refuses even when the top-level date stays valid",()=>{
 rejects(x=>x.receipt.observations[0].original.date="2026-11-26",/date/);
 rejects(x=>x.receipt.observations[1].requestedDate="2026-11-26",/date/);
});
check("every captured original field must agree across observations",()=>{
 for(const index of [0,1])for(const field of ["gheading1","gheading2","ghukamnama","gfooter1"])rejects(x=>{const original=x.receipt.observations[index].original;original[field]=original[field]?original[field]+" ਕਲਪਿਤ":"ਕਲਪਿਤ";},/differs/);
 rejects(x=>x.receipt.observations[0].original.hukamnama_time="06:00:00",/time/);
});
check("receipt official Ang, Ang footer, publication time and source span agree",()=>{
 rejects(x=>x.receipt.original.ang="718",/Ang/);
 rejects(x=>x.receipt.original.gfooter2="(ਅੰਗ: ੭੧੮)",/Ang/);
 rejects(x=>x.receipt.original.hukamnama_time="06:00:00",/time/);
 rejects(x=>x.payload.officialDisplayedTime="99:00:00",/metadata/);
});
check("observation sources, methods, clocks and complete required observation set are checked",()=>{
 rejects(x=>x.receipt.observations[0].url="https://other.example/",/source/);
 rejects(x=>x.receipt.observations[1].method="GET",/method/);
 rejects(x=>x.receipt.observations[1].retrievedAtUtc="2026-02-30T00:00:00Z",/time/);
 rejects(x=>x.receipt.checkedAtUtc=x.payload.checkedAtUtc="2026-11-27T00:00:00Z",/latest/);
 rejects(x=>x.receipt.observations.pop(),/sources/);
 rejects(x=>x.receipt.observations[1]=structuredClone(x.receipt.observations[0]),/repeated/);
 rejects(x=>x.receipt.observations[0].transport["Content-Type"]="application/json",/content type/);
});
check("archive-only schema preserves absent provider time without inventing one",()=>{
 const x=copy();x.payload.officialDisplayedTime=null;x.receipt.original.hukamnama_time=null;
 x.receipt.observations=x.receipt.observations.filter(o=>o.kind==="archive");
 assert.equal(validateStage(x),true);
 rejects(x=>{x.payload.officialDisplayedTime=null;x.receipt.original.hukamnama_time=null;},/time/);
});
check("receipt and source witness provenance/counts/boundary text cannot disagree",()=>{
 rejects(x=>x.receipt.witness.originalEntries=999,/counts/);
 rejects(x=>x.receipt.witness.headingEntries=2,/heading/);
 rejects(x=>x.receipt.witness.provenance.followingSha256="0".repeat(64),/provenance/);
 rejects(x=>x.receipt.witness.precedingOriginal="SYNTHETIC_BOUNDARY",/boundary/);
 rejects(x=>x.receipt.witness.followingOriginal="SYNTHETIC_BOUNDARY",/boundary/);
 rejects(x=>x.receipt.witness.normalization="silent repair",/normalization/);
});
check("source identity, complete sequence, occurrence digest and page provenance remain pinned",()=>{
 rejects(x=>x.source.occurrences.pop(),/digest|boundaries/);
 rejects(x=>x.source.occurrences[1].text+=" ",/original/);
 rejects(x=>x.source.occurrences[1].sha256="0".repeat(64),/identity/);
 rejects(x=>x.source.provenance.pages[1].ang=718,/page/);
 rejects(x=>x.source.provenance.pages.pop(),/context|continuation/);
 rejects(x=>x.source.provenance.comparisonScope="Globally unique",/scope/);
 rejects(x=>x.source.occurrences[2].kind="verse",/kind/);
});
check("all required original-text rights/provenance notice pins and limitations are retained",()=>{
 rejects(x=>x.receipt.policyPins=[],/policy/);
 rejects(x=>x.receipt.policyPins[0].sha256="0".repeat(64),/policy/);
 rejects(x=>x.receipt.policyPins.reverse(),/policy/);
 rejects(x=>x.receipt.limitations=[],/limitations/);
 rejects(x=>x.receipt.limitations.push("SYNTHETIC_UNAPPROVED_FIELD"),/limitations/);
});
check("stage publisher refuses explanations and any release-approval promotion",()=>{
 rejects(x=>x.payload.lessons.simple={en:{text:"SYNTHETIC_UNAPPROVED_FIELD"}},/explanatory/);
 rejects(x=>x.payload.publicationApproved=true,/unapproved/);
});
console.log("Stage contract checks: "+passed+" passed; "+failed+" failed. No provider requests or output publication.");
if(failed)process.exitCode=1;
