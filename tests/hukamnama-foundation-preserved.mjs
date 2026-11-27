// Preserve the imported historical fixture suite without pretending its old
// fixture-only UI assertions describe the new connected reader.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const baseline='fb49ef41bd890db879d7f93a861585915ef81622';
const fromGit=name=>execFileSync('git',['show',baseline+':'+name],{cwd:root,maxBuffer:4*1024*1024});
const preserved=['hukamnama/core.mjs','hukamnama/fixture.json','tests/hukamnama-foundation.mjs'];
const fixture=await fs.mkdtemp(path.join(os.tmpdir(),'glp-hukamnama-foundation-'));
try{
 for(const name of [...preserved,'hukamnama/index.html','hukamnama/reader.mjs']){
  const original=fromGit(name);
  if(preserved.includes(name))assert.deepEqual(await fs.readFile(path.join(root,name)),original,name+' must preserve exact historical bytes');
  const target=path.join(fixture,name);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,original);
 }
 const run=spawnSync(process.execPath,[path.join(fixture,'tests/hukamnama-foundation.mjs')],{encoding:'utf8'});
 process.stdout.write(run.stdout||'');process.stderr.write(run.stderr||'');
 assert.equal(run.status,0,'The frozen historical fixture contracts must still pass');
 console.log('Historical foundation preserved. Current connected-reader behavior is checked by the new delivery, learning, browser and integrity suites.');
}finally{await fs.rm(fixture,{recursive:true,force:true});}
