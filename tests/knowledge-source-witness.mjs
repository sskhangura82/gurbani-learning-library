// Re-derive the selected lines from the pinned upstream digital witness.
// No modern translations/transliteration are copied into the project.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {createHash} from "node:crypto";
import {verifyScripture} from "../knowledge/registry.mjs";
const source=await verifyScripture(await fs.readFile(new URL("../knowledge/scripture.json",import.meta.url)));
const commit="34d2a7cab032c8ea24d21ff20f64653bd03766f4";
assert.equal(source.edition.commit,commit);assert.equal(source.edition.sourceRepo,"opengranth/open-granth");
const anchors=[
 {id:"sggs.asa-di-vaar.pauri007.salok02",ang:466,first:40,last:47,pauri:7,closing:"॥੨॥"},
 {id:"sggs.asa-di-vaar.pauri014.salok01",ang:470,first:29,last:37,pauri:14,closing:"॥੧॥"},
 {id:"sggs.kabir.salok007",ang:1364,first:33,last:34,pauri:null,closing:"॥੭॥"}
];
const rows=new Map(),receipts=[];
for(const ang of [466,467,470,1364]){
 const name="ang-"+String(ang).padStart(4,"0")+".md",w=source.sourceWitnesses[String(ang)];
 assert.equal(w.path,"corpus/"+name);
 let bytes;
 if(process.env.GLP_WITNESS_DIR)bytes=await fs.readFile(path.join(process.env.GLP_WITNESS_DIR,name));
 else{
  const r=await fetch("https://raw.githubusercontent.com/opengranth/open-granth/"+commit+"/"+w.path,{signal:AbortSignal.timeout(15000),redirect:"error"});
  assert.ok(r.ok,"Pinned source unavailable: "+name);bytes=Buffer.from(await r.arrayBuffer());
 }
 const digest=createHash("sha256").update(bytes).digest("hex");
 const blob=createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
 assert.equal(digest,w.sha256);assert.equal(blob,w.gitBlob);
 const text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
 const parsed=[...text.matchAll(/<!-- LINE:(\d+) -->\s*\*\*(.*?)\*\*/gu)].map((m,i)=>({ordinal:i+1,printedLine:Number(m[1]),text:m[2]}));
 assert.ok(parsed.length>0);rows.set(ang,parsed);receipts.push({ang,sha256:digest,gitBlob:blob,sourceRows:parsed.length});
}
const line=(ang,ordinal)=>rows.get(ang)[ordinal-1].text;
assert.equal(line(466,39).endsWith("॥੧॥"),true);
assert.equal(line(466,40),"ਮਹਲਾ ੨ ॥");
assert.equal(line(466,48),"ਪਉੜੀ ॥");
assert.equal(line(467,4).endsWith("॥੭॥"),true);
assert.equal(line(470,28).endsWith("॥੧੩॥"),true);
assert.equal(line(470,29),"ਸਲੋਕੁ ਮਃ ੧ ॥");
assert.equal(line(470,38),"ਮਃ ੧ ॥");
assert.equal(line(470,48).endsWith("॥੨॥"),true);
assert.equal(line(470,49),"ਪਉੜੀ ॥");
assert.equal(line(1364,32).endsWith("॥੬॥"),true);
assert.equal(line(1364,36).endsWith("॥੮॥"),true);
let matched=0;
for(const a of anchors){
 const p=source.passages.find(p=>p.id===a.id);assert.ok(p);assert.equal(p.pauriNumber,a.pauri);
 const selected=rows.get(a.ang).slice(a.first-1,a.last);
 assert.equal(selected.length,p.expectedOccurrenceCount);assert.equal(selected.length,p.occurrenceIds.length);
 assert.ok(selected.at(-1).text.endsWith(a.closing));
 for(let i=0;i<selected.length;i++){
  const row=source.occurrences.find(o=>o.id===p.occurrenceIds[i]);
  assert.ok(row);assert.equal(row.ang,a.ang);
  assert.equal(row.ordinal,selected[i].ordinal);assert.equal(row.printedLine,selected[i].printedLine);
  assert.equal(row.text,selected[i].text);
  assert.equal(row.textSha256,createHash("sha256").update(selected[i].text).digest("hex"));
  assert.equal(row.sourceBlob,source.sourceWitnesses[String(a.ang)].gitBlob);matched++;
 }
}
assert.equal(matched,19);
const report={status:"PASS",commit,sourceFiles:receipts,passages:anchors,matchedOccurrences:matched,limitations:"Pinned digital witness only, not print collation or independent scholarly review. Only hashes and original selected scripture are retained."};
await fs.mkdir(new URL("../evidence/knowledge-registry/",import.meta.url),{recursive:true});await fs.writeFile(new URL("../evidence/knowledge-registry/witness.json",import.meta.url),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({status:"PASS",pinnedFiles:receipts.length,matchedOccurrences:matched,passages:anchors.length}));
