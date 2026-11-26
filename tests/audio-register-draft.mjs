// Checks that the DRAFT recording register cannot quietly claim more than is known. No dependencies.
// Run: node tests/audio-register-draft.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
const dir=new URL("../docs/audio/",import.meta.url),read=n=>fs.readFileSync(new URL(n,dir),"utf8");
const R=JSON.parse(read("RECORDING_REGISTER_DRAFT.json")),all=fs.readdirSync(dir).map(read).join("\n");
let n=0;const test=(name,f)=>{f();n++;console.log("PASS "+name);};
test("It is a draft and no recording is cleared",()=>{
 assert.match(R.status,/DRAFT/);assert.match(R.status,/NO_RECORDING_CLEARED/);
 for(const r of R.recordings){assert.equal(r.permission.status,"NOT_REQUESTED",r.id);assert.deepEqual(r.permission.scopesGranted,[],r.id);
  assert.equal(r.checksum,null,r.id);assert.equal(r.edition,null,r.id);assert.equal(r.coverageVerified,false,r.id);assert.equal(r.timings,"NONE",r.id);}
});
test("The counts are honest: nothing cleared, sent, downloaded, checked or timed",()=>{
 assert.equal(R.counts.candidates,R.recordings.length);for(const k of ["rightsCleared","requestsSent","recordingsDownloaded","recordingsCheckedAgainstTheText","timingMaps"])assert.equal(R.counts[k],0,k);
});
test("Every entry says how it is known and what is not known",()=>{
 const ids=new Set();for(const r of R.recordings){assert.ok(!ids.has(r.id));ids.add(r.id);assert.ok(r.howIKnow in R.howIKnow,r.id);assert.ok(r.category in R.categories,r.id);
  assert.ok(Array.isArray(r.unknown)&&r.unknown.length>=1,r.id);assert.ok(r.rightsHolderToApproach.length>5,r.id);assert.ok(r.reciter.length>3,r.id);}
});
test("Kirtan, Katha and the daily Mukhwak are categories of their own",()=>{
 for(const c of ["SANTHIYA_PRECISE","CONTINUOUS_PAATH","ALTERNATIVE_RECITATION","DAILY_MUKHWAK","KATHA","KIRTAN"])assert.ok(c in R.categories,c);
});
test("No media file is named anywhere in the folder; catalogue pages only, over https",()=>{
 assert.ok(!/\.(mp3|m4a|wav|ogg|flac|aac|mp4|webm)\b/i.test(all));
 for(const r of R.recordings)for(const u of r.cataloguePages){assert.match(u,/^https:\/\//,r.id);assert.equal(new URL(u).username,"");}
});
test("Each permission scope is asked for separately",()=>{assert.ok(R.permissionScopesToAskFor.length>=10);});
test("The letters are marked as drafts that have not been sent",()=>{
 const l=read("PERMISSION_REQUESTS_DRAFT_NOT_SENT.md");assert.match(l,/DRAFTS, NOT SENT/);assert.match(l,/None of these has been sent/);assert.ok(!/\bSENT ON\b|\bSent on\b/.test(l));
});
test("The proof starts with made-up material and names what it will not show",()=>{
 const d=read("JAPJI_ONE_RECORDING_PROOF_DESIGN.md");assert.match(d,/No Gurbani, no real voice/);assert.match(d,/after written permission/);assert.match(d,/What this proof will not show/);
});
console.log(n+" register contracts passed. They check that the register is honest about what it does not know. They establish no right to use any recording.");
