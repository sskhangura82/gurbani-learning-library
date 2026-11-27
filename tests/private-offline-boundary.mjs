import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {validateEnvelope} from '../private-library/app.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));

test('Committed private pack has only a valid encrypted envelope',async()=>{
  const pack=JSON.parse(await fs.readFile(path.join(root,'private-library/collection.enc.json'),'utf8'));
  assert.doesNotThrow(()=>validateEnvelope(pack));
  assert.equal(Object.hasOwn(pack,'works'),false);
  assert.equal(Object.hasOwn(pack,'passphrase'),false);
});

test('Offline regeneration refuses private entries inherited from any earlier inventory',async()=>{
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'glp-offline-boundary-'));
  try{
    await fs.mkdir(path.join(directory,'tools'));
    await fs.copyFile(path.join(root,'tools/build-offline.mjs'),path.join(directory,'tools/build-offline.mjs'));
    const worker=await fs.readFile(path.join(root,'sw.js'),'utf8');
    for(const entry of ['./private-library/collection.enc.json','./%70rivate-library/index.html','./private-library%2Fapp.mjs']){
      const invalid=worker.replace(/const EXPECTED=\{[^\n]+\};/,'const EXPECTED='+JSON.stringify({[entry]:'0'.repeat(64)})+';');
      await fs.writeFile(path.join(directory,'sw.js'),invalid);
      const result=spawnSync(process.execPath,[path.join(directory,'tools/build-offline.mjs')],{encoding:'utf8'});
      assert.equal(result.status,1,entry);
      assert.match(result.stderr,/Private-library assets must not enter the public offline manifest/);
      assert.equal(await fs.readFile(path.join(directory,'sw.js'),'utf8'),invalid,'Refusal must not silently rewrite the proposed inventory');
    }
  }finally{await fs.rm(directory,{recursive:true,force:true});}
});
