/* Builder regression checks. Temporary public-source artifacts and synthetic
   transport only; no network, private learning, publisher key or deployment. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash,generateKeyPairSync,sign} from 'node:crypto';
import {prepareDaily,PreparationRefusal,inspectCapture} from '../tools/prepare-daily-hukamnama.mjs';
const ROOT=fileURLToPath(new URL('../',import.meta.url));
const FIXTURE=path.join(ROOT,'evidence/daily-hukamnama/capture-2026-11-27');
const DATE='2026-11-27',NOW=new Date('2026-11-27T12:00:00Z');
const encode=v=>Buffer.from(JSON.stringify(v,null,2)+'\n');
const sha=v=>createHash('sha256').update(v).digest('hex');
const manifest=JSON.parse(await fs.readFile(path.join(FIXTURE,'manifest.json'),'utf8'));
async function fixture(t,{admitted=false}={}){
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'glp-preparation-test-'));
 t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const app=path.join(root,'app');await fs.mkdir(app);
 if(admitted){
  for(const dir of ['events','sources'])await fs.mkdir(path.join(app,dir));
  await fs.copyFile(path.join(ROOT,'hukamnama/events/'+DATE+'.json'),path.join(app,'events/'+DATE+'.json'));
  await fs.copyFile(path.join(FIXTURE,manifest.source.path),path.join(app,manifest.source.path));
 }
 return {root,app,output:path.join(root,'run'),options:{now:()=>NOW,admittedRoot:app,acquire:async({date,output})=>{assert.equal(date,DATE);await fs.cp(FIXTURE,output,{recursive:true});}}};
}
async function readReport(output){return JSON.parse(await fs.readFile(path.join(output,'run.json'),'utf8'));}
async function refreshManifest(root){
 const file=path.join(root,'manifest.json'),m=JSON.parse(await fs.readFile(file,'utf8'));
 for(const key of ['source','payload','receipt'])m[key].sha256=sha(await fs.readFile(path.join(root,m[key].path)));
 await fs.writeFile(file,encode(m));
}
async function laterObservation(root){
 const receiptPath=path.join(root,manifest.receipt.path),payloadPath=path.join(root,manifest.payload.path);
 const receipt=JSON.parse(await fs.readFile(receiptPath,'utf8')),payload=JSON.parse(await fs.readFile(payloadPath,'utf8'));
 receipt.checkedAtUtc=payload.checkedAtUtc='2026-11-27T11:00:00Z';
 for(const observation of receipt.observations)observation.retrievedAtUtc=receipt.checkedAtUtc;
 const raw=encode(receipt);await fs.writeFile(receiptPath,raw);
 payload.officialReceiptSha256=sha(raw);await fs.writeFile(payloadPath,encode(payload));await refreshManifest(root);
}
async function snapshot(app){
 const result={};
 for(const dir of ['events','sources'])for(const name of await fs.readdir(path.join(app,dir)))result[dir+'/'+name]=sha(await fs.readFile(path.join(app,dir,name)));
 return result;
}

test('new exact-date original becomes an unsigned review candidate, never a publication',async t=>{
 const f=await fixture(t);const result=await prepareDaily({...f.options,output:f.output,sourceCommit:'7f36c3039ca95fac6e69ca28f631b9e3734c70e9'});
 assert.equal(result.status,'CANDIDATE_PREPARED');assert.equal(result.candidateReady,true);
 assert.equal(result.published,false);assert.equal(result.publicationApproved,false);
 assert.equal(result.requestedDate,DATE);assert.equal(result.source.occurrences,7);
 assert.equal(result.source.textSha256,'c7f434800aae668f63cb398304cfcaf6159e6343156653778ebef37bf3bcb20d');
 assert.deepEqual(await readReport(f.output),result);assert.deepEqual(await fs.readdir(f.app),[]);
});
test('the requested day is Amritsar day, not UTC or the machine locale',async t=>{
 const f=await fixture(t);let requested;
 const result=await prepareDaily({...f.options,output:f.output,now:()=>new Date('2026-11-26T19:00:00Z'),acquire:async({date})=>{requested=date;throw new PreparationRefusal('OFFICIAL_UNAVAILABLE');}});
 assert.equal(requested,DATE);assert.equal(result.requestedDate,DATE);assert.equal(result.status,'SOURCE_UNAVAILABLE');
});
test('invalid/future requests refuse before creating a run or requesting a source',async t=>{
 const f=await fixture(t);let fetched=false;
 for(const date of ['2026-02-30','2026-11-28','today','2026-11-27\n'])await assert.rejects(prepareDaily({...f.options,output:f.output,requestedDate:date,acquire:async()=>{fetched=true;}}));
 assert.equal(fetched,false);await assert.rejects(fs.lstat(f.output),{code:'ENOENT'});
});
test('network unavailability and stale official date record refusal without a substitute',async t=>{
 const f=await fixture(t);let calls=0;
 for(const code of ['SOURCE_UNAVAILABLE','OFFICIAL_UNAVAILABLE','OFFICIAL_DATE_MISMATCH']){
  const output=path.join(f.root,code);
  const result=await prepareDaily({...f.options,output,acquire:async()=>{calls++;throw new PreparationRefusal(code);}});
  assert.equal(result.status,'SOURCE_UNAVAILABLE');assert.equal(result.code,code);assert.equal(result.source,null);assert.equal(result.candidateReady,false);
  assert.deepEqual(await fs.readdir(output),['run.json']);
 }
 assert.equal(calls,3);
});
test('source discrepancies never retry, normalize, or become an empty success',async t=>{
 const f=await fixture(t);let calls=0;
 for(const code of ['FULL_TEXT_MISMATCH','VISIBLE_STRUCTURED_MISMATCH','POLICY_PIN_MISMATCH','ORIGINAL_ENCODING','WITNESS_SCHEMA','VISIBLE_DATE','SOURCE_HTTP']){
  const result=await prepareDaily({...f.options,output:path.join(f.root,code),acquire:async()=>{calls++;throw new PreparationRefusal(code);}});
  assert.equal(result.status,'SOURCE_REVIEW_REQUIRED');assert.equal(result.code,code);assert.equal(result.candidateReady,false);
 }
 assert.equal(calls,7);
});
test('midnight rollover retains the captured date but cannot offer it as today',async t=>{
 const f=await fixture(t);let current=new Date('2026-11-27T18:29:59Z');
 const result=await prepareDaily({...f.options,output:f.output,now:()=>current,acquire:async options=>{await f.options.acquire(options);current=new Date('2026-11-27T18:30:01Z');}});
 assert.equal(result.requestedDate,DATE);assert.equal(result.endedAmritsarDate,'2026-11-28');assert.equal(result.status,'DATE_ROLLED_OVER');assert.equal(result.candidateReady,false);
 assert.ok(result.capture);assert.equal(result.published,false);
});
test('explicit historical capture stays historical across midnight',async t=>{
 const f=await fixture(t);let current=new Date('2026-11-27T18:29:59Z');
 const result=await prepareDaily({...f.options,output:f.output,requestedDate:DATE,now:()=>current,acquire:async options=>{await f.options.acquire(options);current=new Date('2026-11-27T18:30:01Z');}});
 assert.equal(result.status,'CANDIDATE_PREPARED');assert.equal(result.requestedAsToday,false);assert.equal(result.requestedDate,DATE);assert.equal(result.endedAmritsarDate,'2026-11-28');
});
test('a fresh same-day receipt keeps exact admitted envelope, source and revision',async t=>{
 const f=await fixture(t,{admitted:true}),before=await snapshot(f.app);
 const result=await prepareDaily({...f.options,output:f.output,acquire:async options=>{await f.options.acquire(options);await laterObservation(options.output);}});
 assert.equal(result.status,'ALREADY_ADMITTED');assert.equal(result.candidateReady,false);assert.equal(result.existing.decision,'KEEP_EXISTING_BYTES');assert.equal(result.existing.revision,1);
 assert.notEqual(result.capture.receiptSha256,manifest.receipt.sha256);assert.deepEqual(await snapshot(f.app),before);
 const again=await prepareDaily({...f.options,output:path.join(f.root,'second-run')});assert.equal(again.status,'ALREADY_ADMITTED');assert.deepEqual(await snapshot(f.app),before);
});
test('a genuine publication-time correction requires review and preserves admitted bytes',async t=>{
 const f=await fixture(t,{admitted:true}),file=path.join(f.app,'events/'+DATE+'.json');
 const envelope=JSON.parse(await fs.readFile(file,'utf8')),payload=JSON.parse(Buffer.from(envelope.payload,'base64').toString('utf8'));
 payload.officialDisplayedTime='01:01:01';
 const {privateKey,publicKey}=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),bytes=encode(payload),keyId='synthetic-preparation-test';
 await fs.writeFile(file,encode({schema:envelope.schema,keyId,payload:bytes.toString('base64'),signature:sign('sha256',bytes,{key:privateKey,dsaEncoding:'ieee-p1363'}).toString('base64')}));
 const before=await snapshot(f.app),result=await prepareDaily({...f.options,output:f.output,publicKey:publicKey.export({format:'jwk'}),keyId});
 assert.equal(result.status,'CORRECTION_REVIEW_REQUIRED');assert.equal(result.candidateReady,false);assert.equal(result.existing.decision,'REVIEW_CORRECTION');assert.deepEqual(await snapshot(f.app),before);
});
test('damaged existing signed record is not replaced by a new apparently valid capture',async t=>{
 const f=await fixture(t,{admitted:true});await fs.writeFile(path.join(f.app,'events/'+DATE+'.json'),'{"broken":true}\n');
 const before=await snapshot(f.app),result=await prepareDaily({...f.options,output:f.output});
 assert.equal(result.status,'ADMITTED_RECORD_INVALID');assert.equal(result.candidateReady,false);assert.deepEqual(await snapshot(f.app),before);
});
test('an existing event with its source missing is preserved and blocks automatic replacement',async t=>{
 const f=await fixture(t,{admitted:true}),event=await fs.readFile(path.join(f.app,'events/'+DATE+'.json'));
 await fs.unlink(path.join(f.app,manifest.source.path));const result=await prepareDaily({...f.options,output:f.output});
 assert.equal(result.status,'ADMITTED_RECORD_INVALID');assert.equal(result.candidateReady,false);assert.deepEqual(await fs.readFile(path.join(f.app,'events/'+DATE+'.json')),event);
});
test('hash failure, forbidden commentary and an unexpected captured file cannot become a candidate',async t=>{
 const f=await fixture(t);
 const cases=[
  async root=>fs.appendFile(path.join(root,manifest.source.path),' '),
  async root=>{const file=path.join(root,manifest.payload.path),value=JSON.parse(await fs.readFile(file,'utf8'));value.lessons.simple={unreviewed:'DO_NOT_EXPORT'};await fs.writeFile(file,encode(value));await refreshManifest(root);},
  async root=>fs.writeFile(path.join(root,'raw-portal.html'),'DO_NOT_EXPORT')
 ];
 for(let i=0;i<cases.length;i++){
  const output=path.join(f.root,'bad-'+i),result=await prepareDaily({...f.options,output,acquire:async options=>{await f.options.acquire(options);await cases[i](options.output);}});
  assert.equal(result.status,'LOCAL_FAILURE');assert.equal(result.candidateReady,false);assert.equal(result.capture,null);
  assert.ok(!(await fs.readFile(path.join(output,'run.json'),'utf8')).includes('DO_NOT_EXPORT'));
 }
});
test('manifest traversal and symlinks are rejected before arbitrary files can be read',async t=>{
 const f=await fixture(t),capture=path.join(f.root,'capture');await fs.cp(FIXTURE,capture,{recursive:true});
 const file=path.join(capture,'manifest.json'),m=JSON.parse(await fs.readFile(file,'utf8'));m.source.path='../outside.json';await fs.writeFile(file,encode(m));
 await assert.rejects(inspectCapture(capture,DATE,{now:NOW}),{code:'MANIFEST_INVALID'});
 await fs.writeFile(file,await fs.readFile(path.join(FIXTURE,'manifest.json')));
 const source=path.join(capture,manifest.source.path);await fs.unlink(source);await fs.symlink(path.join(FIXTURE,manifest.source.path),source);
 await assert.rejects(inspectCapture(capture,DATE,{now:NOW}),{code:'ARTIFACT_PATH'});
 await fs.symlink(path.join(f.root,'missing'),path.join(f.app,'events'));
 const result=await prepareDaily({...f.options,output:f.output});assert.equal(result.status,'ADMITTED_RECORD_INVALID');
});
test('concurrent attempt cannot overwrite running report or fetch a second reading',async t=>{
 const f=await fixture(t);let release,entered;const gate=new Promise(r=>{release=r;}),ready=new Promise(r=>{entered=r;});
 const pending=prepareDaily({...f.options,output:f.output,acquire:async options=>{entered();await gate;await f.options.acquire(options);}});
 await ready;const running=await readReport(f.output);assert.equal(running.status,'RUNNING');assert.equal(running.candidateReady,false);
 let secondFetch=false;await assert.rejects(prepareDaily({...f.options,output:f.output,acquire:async()=>{secondFetch=true;}}),{code:'EEXIST'});
 assert.equal(secondFetch,false);assert.deepEqual(await readReport(f.output),running);release();assert.equal((await pending).status,'CANDIDATE_PREPARED');
});
test('local failure emits a bounded report without arbitrary error text or partial candidate admission',async t=>{
 const f=await fixture(t),secret='SYNTHETIC_UNAPPROVED_EXCEPTION_PAYLOAD';
 const result=await prepareDaily({...f.options,output:f.output,acquire:async({output})=>{await fs.mkdir(output);throw Error(secret);}});
 assert.equal(result.status,'LOCAL_FAILURE');assert.equal(result.candidateReady,false);assert.equal(result.code,'PREPARATION_FAILED');
 const report=await fs.readFile(path.join(f.output,'run.json'),'utf8');assert.ok(report.length<16384);assert.ok(!report.includes(secret));
});
test('an output inside the admitted source root is refused before networking',async t=>{
 const f=await fixture(t);let fetched=false;
 await assert.rejects(prepareDaily({...f.options,output:path.join(f.app,'new-run'),acquire:async()=>{fetched=true;}}),{code:'OUTPUT_PATH'});
 assert.equal(fetched,false);assert.deepEqual(await fs.readdir(f.app),[]);
});
