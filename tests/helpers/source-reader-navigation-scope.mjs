// Exact navigation amendment for the original-only named-edition readers.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readBeforeMeditationRoom} from './meditation-room-scope.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const BASE='320537b0cc4aceb2e6007b32057a3c4a36c83520';
const files=['index.html','library/catalog.mjs','collections/dasam/index.html'];
const read=name=>fs.readFile(path.join(root,name));
const prior=name=>execFileSync('git',['show',BASE+':'+name],{cwd:root,maxBuffer:64*1024*1024});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const comparable=(name,bytes)=>name==='index.html'?Buffer.from(bytes.toString().replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'<APPROVED_SCRIPT_LOADER>')):bytes;
export async function sourceReaderNavigationScope(){
  const record=JSON.parse(await read('evidence/shabados-original-collections/navigation-scope.json'));
  assert.equal(record.schema,'glp.sikh-source-reader.navigation-scope.v1');
  assert.equal(record.base,BASE);
  assert.deepEqual(record.files.map(item=>item.path),files);
  for(const item of record.files){
    assert.equal(item.hashMode,item.path==='index.html'?'script-loader-normalized':'raw-bytes');
    assert.equal(hash(comparable(item.path,prior(item.path))),item.beforeSha256,item.path+' exact pre-collection input');
    assert.equal(hash(comparable(item.path,await readBeforeMeditationRoom(item.path,read))),item.afterSha256,item.path+' exact full-collection navigation before the verified room entrance');
  }
  return new Set(files);
}
export async function readBeforeSourceReaderNavigation(name,fallback=read){
  if(!files.includes(name))return fallback(name);
  await sourceReaderNavigationScope();
  return prior(name);
}
