// Builder source-preservation checks. This does not grant independent or qualified approval.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
export const INPUT_BASE='bf744d1ac5b845d63c3324ed1f231c3fec31e40e';
const READER_BASE='e0a6cff22771d42ce3a2fe91ad96863daae214ed';
const KNOWLEDGE_BASE='a3476ac4b9be90dde350fb35dd13ce0b672c120d';
const KNOWLEDGE_TIP='b68e080043bb0b4e5cb3d17977e65c8cd62c15b3';
const git=(...args)=>execFileSync('git',args,{cwd:root,maxBuffer:64*1024*1024});
const read=name=>fs.readFile(path.join(root,name));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const names=git('ls-tree','-r','--name-only',INPUT_BASE).toString().trim().split('\n');
const loaderPages=new Set(['index.html','gurdwara.html','pauri-2-lesson.html','simran.html','breathing.html','articles/index.html','articles/article.html','knowledge/index.html']);
const nonApplication=/^(?:\.github|docs|evidence|tests|tools)\//;

// Compare every byte outside script elements. Within them only the source path and
// integrity/CORS attributes may change; type, defer, body and all other attributes remain.
function loaderComparable(html){
 return html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi,(_tag,attributes,body)=>{
  const parsed=[];
  let remainder=attributes;
  const attr=/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+)))?/g;
  for(const m of attributes.matchAll(attr)){
   const name=m[1].toLowerCase();
   remainder=remainder.replace(m[0],'');
   if(name==='integrity'||name==='crossorigin')continue;
   let value=m[2]??m[3]??m[4]??null;
   if(name==='src')value=value.replace(/app\.bundle\.mjs$/,'app.mjs');
   parsed.push([name,value]);
  }
  assert.equal(remainder.trim(),'','unparsed script attributes');
  return '<script '+JSON.stringify(parsed.sort((a,b)=>a[0].localeCompare(b[0])))+'>'+body+'</script>';
 });
}

test('Complete Knowledge unit has exact provenance; no partial chain or overwritten reader input',async()=>{
 const record=JSON.parse(await read('evidence/library-script-integrity/inputs/knowledge-import.json'));
 assert.equal(record.readerBase,READER_BASE);
 assert.equal(record.knowledgeBase,KNOWLEDGE_BASE);
 assert.equal(record.knowledgeTip,KNOWLEDGE_TIP);
 const delta=git('diff','--name-status',KNOWLEDGE_BASE,KNOWLEDGE_TIP).toString().trim().split('\n').map(line=>line.split('\t'));
 assert.equal(delta.length,86);
 assert.ok(delta.every(([status])=>status==='A'),'Knowledge baseline must be wholly additive');
 assert.deepEqual(record.files.map(f=>f.path),delta.map(([,name])=>name));
 assert.equal(new Set(record.files.map(f=>f.path)).size,86);
 for(const f of record.files){
  const original=git('show',KNOWLEDGE_TIP+':'+f.path);
  assert.equal(original.length,f.bytes,f.path+' byte count');
  assert.equal(hash(original),f.sha256,f.path+' provenance digest');
  assert.deepEqual(git('show',INPUT_BASE+':'+f.path),original,f.path+' frozen combined input');
 }
});

test('All existing application bytes stay frozen except the listed loader tags and worker manifest',async()=>{
 const application=names.filter(name=>!nonApplication.test(name));
 assert.ok(application.length>90,'protection must cover the application, not a small selected sample');
 for(const name of application){
  if(name==='sw.js')continue;
  const previous=git('show',INPUT_BASE+':'+name),current=await read(name);
  if(loaderPages.has(name)){
   assert.equal(loaderComparable(current.toString()),loaderComparable(previous.toString()),name+' changed beyond loader pins or bundle URL');
  }else assert.deepEqual(current,previous,name+' must stay byte-identical');
 }
});

test('Reader loader contract and reviewed original module closures remain exact',async()=>{
 const readerFiles=['full-japji.html','sukhmani.html','nitnem/index.html','salok-mahalla9/index.html','salok-kabir/index.html','tools/refresh-reader-sri.mjs'];
 for(const name of readerFiles)assert.deepEqual(await read(name),git('show',READER_BASE+':'+name),name);
 const originalModules=['library/app.mjs','library/catalog.mjs','library/core.mjs','articles/app.mjs','articles/core.mjs','articles/source-contracts.mjs','knowledge/app.mjs','knowledge/registry.mjs','knowledge/source-lock.mjs','knowledge/core.mjs','knowledge/kinds.mjs','knowledge/search.mjs'];
 for(const name of originalModules)assert.deepEqual(await read(name),git('show',INPUT_BASE+':'+name),name);
});
