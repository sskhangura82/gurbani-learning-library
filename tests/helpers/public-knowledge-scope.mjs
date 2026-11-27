// Exact additive amendment, not an exemption from the previous scope contracts.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
export const PUBLIC_KNOWLEDGE_ACCESS_BASE='a123b39e61c5fba94acc38ea77ab7c81e664f61d';
const paths=Object.freeze(['knowledge/pilot.json','knowledge/app.mjs','knowledge/registry.mjs','knowledge/index.html']);
const read=name=>fs.readFile(path.join(root,name));
const before=name=>execFileSync('git',['show',PUBLIC_KNOWLEDGE_ACCESS_BASE+':'+name],{cwd:root,maxBuffer:8*1024*1024});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

export async function publicKnowledgeScope(){
 const record=JSON.parse(await read('evidence/public-knowledge-access/change-scope.json'));
 assert.equal(record.schema,'glp.public-knowledge-access.change-scope.v1');
 assert.equal(record.base,PUBLIC_KNOWLEDGE_ACCESS_BASE);
 assert.deepEqual(record.files.map(f=>f.path),paths);
 for(const file of record.files){
  assert.equal(hash(before(file.path)),file.beforeSha256,file.path+' public access baseline');
  assert.equal(hash(await read(file.path)),file.afterSha256,file.path+' exact public access amendment');
 }
 return new Set(paths);
}

// A caller may apply its original historical assertions to these pre-amendment
// bytes only after the exact current amendment has itself been checked.
export async function readBeforePublicKnowledge(name){
 if(!paths.includes(name))return read(name);
 await publicKnowledgeScope();
 return before(name);
}
