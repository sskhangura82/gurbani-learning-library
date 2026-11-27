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
const NAVIGATION_BASE='44401e35690322fb3dbc29c443bff86d73279fcb';
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

function navigationComparable(name,bytes){
 return name==='index.html'?Buffer.from(bytes.toString().replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'<APPROVED_SCRIPT_LOADER>')):bytes;
}
async function navigationScope(){
 const record=JSON.parse(await read('evidence/daily-hukamnama/inputs/navigation-scope.json'));
 assert.equal(record.schema,'glp.hukamnama.navigation-scope.v1');
 assert.equal(record.base,NAVIGATION_BASE);
 assert.deepEqual(record.files.map(f=>f.path),['index.html','library/catalog.mjs']);
 for(const item of record.files){
  assert.equal(hash(navigationComparable(item.path,git('show',NAVIGATION_BASE+':'+item.path))),item.beforeSha256,item.path+' navigation baseline');
  assert.equal(hash(navigationComparable(item.path,await read(item.path))),item.afterSha256,item.path+' exact frozen Daily entrance change');
 }
 return new Set(record.files.map(f=>f.path));
}

// New source-only collection needs a bounded shared reader extension. This records
// exact before/after files, while all older source/teaching and module closures stay frozen.
async function faridReaderScope(){
 const record=JSON.parse(await read('evidence/salok-farid/inputs/reader-scope.json'));
 assert.equal(record.schema,'glp.farid.reader-scope.v1');
 assert.equal(record.base,'4eee4f26bf7bad7ce52d4c958c06a94da1262ecb');
 assert.deepEqual(record.files.map(f=>f.path),['nitnem/reader.js','tools/refresh-reader-sri.mjs','nitnem/index.html','salok-mahalla9/index.html','salok-kabir/index.html']);
 for(const item of record.files){
  assert.equal(hash(git('show',record.base+':'+item.path)),item.beforeSha256,item.path+' Farid baseline');
  assert.equal(hash(await read(item.path)),item.afterSha256,item.path+' exact Farid extension');
  if(item.path.endsWith('.html'))assert.equal(loaderComparable((await read(item.path)).toString()),loaderComparable(git('show',record.base+':'+item.path).toString()),item.path+' existing markup unchanged');
 }
 return new Set(record.files.map(f=>f.path));
}

test('Existing application bytes stay frozen outside exact Daily and Farid scopes, loader pins and worker manifest',async()=>{
 const navigation=await navigationScope(),farid=await faridReaderScope();
 const application=names.filter(name=>!nonApplication.test(name));
 assert.ok(application.length>90,'protection must cover the application, not a small selected sample');
 for(const name of application){
  if(name==='sw.js'||navigation.has(name)||farid.has(name))continue;
  const previous=git('show',INPUT_BASE+':'+name),current=await read(name);
  if(loaderPages.has(name)){
   assert.equal(loaderComparable(current.toString()),loaderComparable(previous.toString()),name+' changed beyond loader pins or bundle URL');
  }else assert.deepEqual(current,previous,name+' must stay byte-identical');
 }
});

test('Reader loader contract and reviewed original module closures remain exact',async()=>{
 const readerFiles=['full-japji.html','sukhmani.html','nitnem/index.html','salok-mahalla9/index.html','salok-kabir/index.html','tools/refresh-reader-sri.mjs'];
 const farid=await faridReaderScope();
 for(const name of readerFiles)if(!farid.has(name))assert.deepEqual(await read(name),git('show',READER_BASE+':'+name),name);
 const originalModules=['library/app.mjs','library/catalog.mjs','library/core.mjs','articles/app.mjs','articles/core.mjs','articles/source-contracts.mjs','knowledge/app.mjs','knowledge/registry.mjs','knowledge/source-lock.mjs','knowledge/core.mjs','knowledge/kinds.mjs','knowledge/search.mjs'];
 for(const name of originalModules){
  if(name==='library/catalog.mjs'){await navigationScope();continue;}
  assert.deepEqual(await read(name),git('show',INPUT_BASE+':'+name),name);
 }
 const priorFoundation='fb49ef41bd890db879d7f93a861585915ef81622';
 for(const name of ['hukamnama/core.mjs','hukamnama/fixture.json','tests/hukamnama-foundation.mjs'])
  assert.deepEqual(await read(name),git('show',priorFoundation+':'+name),name+' historical foundation remains unchanged');
});
