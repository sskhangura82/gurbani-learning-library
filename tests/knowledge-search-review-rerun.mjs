import fs from "node:fs";
import {createHash} from "node:crypto";
import {loadKnowledge} from "../knowledge/registry.mjs";
import {buildIndex,search,resolveIdentity} from "../knowledge/core.mjs";
const matrix=process.argv[2];if(!matrix)throw Error("Pass the frozen review matrix file; this command never changes that evidence.");
const app=fs.readFileSync(new URL("../knowledge/app.mjs",import.meta.url),"utf8"),idx=buildIndex(await loadKnowledge(fs.readFileSync(new URL("../knowledge/scripture.json",import.meta.url)),fs.readFileSync(new URL("../knowledge/pilot.json",import.meta.url)),app.match(/PACK_SHA256="([a-f0-9]{64})"/)[1]));
const raw=fs.readFileSync(matrix),prior=JSON.parse(raw),groups={},failed=[];
for(const c of prior.cases){
 const found=search(idx,c.query,c.opts || {}),got=found.map(x=>x.id);let expected=c.expect,ok=false;
 if(Array.isArray(expected)){expected=expected.map(x=>resolveIdentity(idx,x)||x);ok=expected.length?expected.every(id=>got.includes(id)):got.length===0;}
 else if(typeof expected==="string" && expected.startsWith("subset of ")){
  const allowed=expected.slice(10).split(",").map(x=>resolveIdentity(idx,x.trim())||x.trim());ok=got.every(id=>allowed.includes(id));
 }else if(expected?.stable && expected?.reasons){
  ok=c.query.split(" | ").every(q=>{const first=JSON.stringify(search(idx,q));return Array.from({length:5},()=>search(idx,q)).every(result=>JSON.stringify(result)===first && result.every(x=>typeof x.reason==="string"&&x.reason));});
 }else throw Error("Unknown frozen expectation "+c.group);
 groups[c.group]??={cases:0,pass:0};groups[c.group].cases++;if(ok)groups[c.group].pass++;else failed.push({group:c.group,query:c.query,expected,got});
}
const result={reviewEvidenceSha256:createHash("sha256").update(raw).digest("hex"),cases:prior.cases.length,passed:prior.cases.length-failed.length,groups,failed,limits:"Builder rerun of frozen Claude search examples; not independent re-review. Old expected identities resolve through the existing crosswalk. Remaining synonym/interpretation proposals require editorial decisions."};
fs.mkdirSync(new URL("../evidence/knowledge-search/",import.meta.url),{recursive:true});fs.writeFileSync(new URL("../evidence/knowledge-search/claude-matrix-rerun.json",import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
