// Verify this exact navigation amendment before comparing older frozen scopes.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readBeforeSourceReaderNavigation} from './source-reader-navigation-scope.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const BASE='a123b39e61c5fba94acc38ea77ab7c81e664f61d';
const files=['index.html','library/app.mjs','library/catalog.mjs'];
const read=name=>fs.readFile(path.join(root,name));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function comparable(name,bytes){
  return name==='index.html'?Buffer.from(bytes.toString().replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'<APPROVED_SCRIPT_LOADER>')):bytes;
}
const prior=(base,name)=>execFileSync('git',['show',base+':'+name],{cwd:root,maxBuffer:64*1024*1024});

export async function continuationNavigationScope(){
  const record=JSON.parse(await read('evidence/continuation/navigation-scope.json'));
  assert.equal(record.schema,'glp.continuation.navigation-scope.v1');
  assert.equal(record.base,BASE,'fixed reviewed composite before navigation');
  assert.deepEqual(record.files.map(item=>item.path),files);
  for(const item of record.files){
    assert.equal(item.hashMode,item.path==='index.html'?'script-loader-normalized':'raw-bytes');
    assert.equal(hash(comparable(item.path,prior(record.base,item.path))),item.beforeSha256,item.path+' exact earlier navigation input');
    assert.equal(hash(comparable(item.path,await readBeforeSourceReaderNavigation(item.path,read))),item.afterSha256,item.path+' exact continuation navigation amendment');
  }
  return new Set(files);
}

export async function readBeforeContinuationNavigation(name,fallback=read){
  if(!files.includes(name))return fallback(name);
  await continuationNavigationScope();
  const record=JSON.parse(await read('evidence/continuation/navigation-scope.json'));
  return prior(record.base,name);
}
