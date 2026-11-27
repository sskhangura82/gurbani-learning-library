/* Synthetic local Git repositories, no real signing key or private learner data. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFile,execFileSync} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash,generateKeyPairSync} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {sealPayload} from '../tools/sign-hukamnama.mjs';
import {inspectSealedCandidate,proposeDailyInstall} from '../tools/propose-daily-install.mjs';
import {loadReading} from '../hukamnama/delivery.mjs';
const exec=promisify(execFile),ROOT=fileURLToPath(new URL('../',import.meta.url));
const FIXTURE=path.join(ROOT,'evidence/daily-hukamnama/capture-2026-11-27'),DATE='2026-11-27',NOW=new Date('2026-11-27T12:00:00Z');
const encode=v=>Buffer.from(JSON.stringify(v,null,2)+'\n'),sha=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(await fs.readFile(path.join(FIXTURE,'manifest.json'),'utf8'));
const payloadBytes=await fs.readFile(path.join(FIXTURE,manifest.payload.path));
const sourceBytes=await fs.readFile(path.join(FIXTURE,manifest.source.path));
const receiptBytes=await fs.readFile(path.join(FIXTURE,manifest.receipt.path));
async function git(repo,...args){return (await exec('git',['-C',repo,...args],{maxBuffer:4*1024*1024})).stdout;}
async function prepareSealed(directory,{payload=payloadBytes,receipt=receiptBytes,keys}){
 const sealed=await sealPayload({payloadBytes:payload,sourceBytes,receiptBytes:receipt,privateKey:keys.privateKey,publicKey:keys.publicKey,keyId:keys.keyId,now:NOW});
 await fs.mkdir(directory);
 const files=[{path:manifest.source.path,bytes:sourceBytes},{path:'events/'+DATE+'.json',bytes:sealed.envelope},{path:manifest.receipt.path,bytes:receipt}];
 for(const file of files){await fs.mkdir(path.dirname(path.join(directory,file.path)),{recursive:true});await fs.writeFile(path.join(directory,file.path),file.bytes);}
 const record={schema:'glp.hukamnama.sealed-candidate.v1',date:DATE,keyId:keys.keyId,mode:'DEVELOPMENT_PREVIEW',publicationApproved:false,sgpcSignature:false,files:files.map(f=>({path:f.path,sha256:sha(f.bytes)}))};
 await fs.writeFile(path.join(directory,'manifest.json'),encode(record));return sealed;
}
async function fixture(t,{admitted=false,sourceOnly=false}={}){
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'glp-install-test-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const repository=path.join(root,'repo');await fs.mkdir(repository);
 await git(repository,'init','-b','main');await git(repository,'config','user.name','Synthetic builder fixture');await git(repository,'config','user.email','synthetic@example.invalid');
 await git(repository,'config','commit.gpgSign','false');await git(repository,'config','core.hooksPath','/dev/null');
 const pair=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),keys={privateKey:pair.privateKey,publicKey:pair.publicKey.export({format:'jwk'}),keyId:'synthetic-install-test'};
 const input=path.join(root,'sealed'),sealed=await prepareSealed(input,{keys});
 await fs.mkdir(path.join(repository,'hukamnama'));await fs.copyFile(path.join(ROOT,'hukamnama/publication-key.mjs'),path.join(repository,'hukamnama/publication-key.mjs'));
 await fs.writeFile(path.join(repository,'unrelated.txt'),'Retained base content\n');
 if(admitted||sourceOnly){await fs.mkdir(path.join(repository,'hukamnama/sources'));await fs.writeFile(path.join(repository,'hukamnama',manifest.source.path),sourceBytes);}
 if(admitted){await fs.mkdir(path.join(repository,'hukamnama/events'));await fs.writeFile(path.join(repository,'hukamnama/events/'+DATE+'.json'),sealed.envelope);}
 await git(repository,'add','.');await git(repository,'commit','-m','Synthetic base');
 const baseCommit=(await git(repository,'rev-parse','HEAD')).trim();
 // Synthetic staged, unstaged and untracked private-looking files must remain untouched.
 await fs.writeFile(path.join(repository,'pending.txt'),'Synthetic staged work\n');await git(repository,'add','pending.txt');
 await fs.writeFile(path.join(repository,'unrelated.txt'),'Synthetic unsaved work\n');await fs.writeFile(path.join(repository,'synthetic-private-note.json'),'Do not inspect learner storage\n');
 const options={input,repository,baseCommit,baseRef:'refs/heads/main',output:path.join(root,'proposal'),now:()=>NOW,publicKey:keys.publicKey,keyId:keys.keyId};
 return {root,repository,input,sealed,keys,options};
}
async function state(f){return {refs:await git(f.repository,'show-ref'),index:sha(await fs.readFile(path.join(f.repository,'.git/index'))),working:await fs.readFile(path.join(f.repository,'unrelated.txt'),'utf8'),pending:await fs.readFile(path.join(f.repository,'pending.txt'),'utf8'),syntheticNote:await fs.readFile(path.join(f.repository,'synthetic-private-note.json'),'utf8')};}
async function commitMutation(f,relative,content){
 await fs.mkdir(path.dirname(path.join(f.repository,relative)),{recursive:true});await fs.writeFile(path.join(f.repository,relative),content);
 await git(f.repository,'add',relative);await git(f.repository,'commit','-m','Synthetic mutation');f.options.baseCommit=(await git(f.repository,'rev-parse','HEAD')).trim();
}
async function refreshManifest(input){
 const file=path.join(input,'manifest.json'),m=JSON.parse(await fs.readFile(file,'utf8'));
 for(const entry of m.files)entry.sha256=sha(await fs.readFile(path.join(input,entry.path)));await fs.writeFile(file,encode(m));
}

test('existing signer -> exact-base proposal -> existing reader preserves the complete dated original',async t=>{
 const f=await fixture(t),before=await state(f),result=await proposeDailyInstall(f.options);
 assert.equal(result.status,'PROPOSED');assert.equal(result.proposalReady,true);assert.equal(result.publicationApproved,false);assert.equal(result.published,false);
 assert.deepEqual(result.changes.map(f=>f.path).sort(),['hukamnama/events/'+DATE+'.json','hukamnama/'+manifest.source.path].sort());
 assert.deepEqual(await state(f),before);assert.equal(await git(f.repository,'show',result.proposedTree+':unrelated.txt'),'Retained base content\n');
 const patch=await fs.readFile(path.join(f.options.output,'change.patch'));assert.equal(sha(patch),result.patch.sha256);assert.ok(!patch.includes(Buffer.from('synthetic-private-note')));
 const read=await loadReading(DATE,{now:NOW,publicKey:f.keys.publicKey,keyId:f.keys.keyId,cacheStorage:null,baseURL:new URL('https://synthetic.example.invalid/hukamnama/'),fetchImpl:async url=>{
  const relative=new URL(url).pathname.slice(1),bytes=await git(f.repository,'show',result.proposedTree+':'+relative);return new Response(bytes,{status:200});
 }});
 assert.equal(read.status,'DIGITAL_TEXT_VERIFIED_PREVIEW');assert.equal(read.source.occurrences.length,7);assert.equal(read.source.textSha256,'c7f434800aae668f63cb398304cfcaf6159e6343156653778ebef37bf3bcb20d');
 assert.deepEqual(read.event.lessons,{simple:null,detailed:null,learning:null});
 assert.deepEqual(JSON.parse(await fs.readFile(path.join(f.options.output,'proposal.json'),'utf8')),result);
});
test('an identical existing source is reused and only the new event enters the patch',async t=>{
 const f=await fixture(t,{sourceOnly:true}),before=await state(f),result=await proposeDailyInstall(f.options);
 assert.equal(result.status,'PROPOSED');assert.deepEqual(result.changes.map(x=>x.path),['hukamnama/events/'+DATE+'.json']);assert.deepEqual(await state(f),before);
});
test('same-day repeated observation keeps existing envelope, revision and tree exactly',async t=>{
 const f=await fixture(t,{admitted:true}),before=await state(f);
 const p=JSON.parse(payloadBytes),r=JSON.parse(receiptBytes);p.checkedAtUtc=r.checkedAtUtc='2026-11-27T11:00:00Z';for(const observation of r.observations)observation.retrievedAtUtc=p.checkedAtUtc;
 const rb=encode(r);p.officialReceiptSha256=sha(rb);
 const later=path.join(f.root,'later');await prepareSealed(later,{payload:encode(p),receipt:rb,keys:f.keys});
 const result=await proposeDailyInstall({...f.options,input:later});
 assert.equal(result.status,'ALREADY_ADMITTED');assert.equal(result.proposalReady,false);assert.equal(result.proposedTree,result.base.tree);assert.equal(result.patch,null);assert.deepEqual(result.changes,[]);assert.equal(result.existing.revision,1);assert.deepEqual(await state(f),before);
 assert.equal(result.existing.eventSha256,sha(f.sealed.envelope));
});
test('changed publication time is held for correction review rather than overwriting a date',async t=>{
 const f=await fixture(t,{admitted:true}),p=JSON.parse(payloadBytes),r=JSON.parse(receiptBytes);
 p.officialDisplayedTime=r.original.hukamnama_time='01:01:01';for(const o of r.observations)if(o.kind==='portal')o.original.hukamnama_time='01:01:01';const rb=encode(r);p.officialReceiptSha256=sha(rb);
 const changed=path.join(f.root,'changed');await prepareSealed(changed,{payload:encode(p),receipt:rb,keys:f.keys});const before=await state(f);
 const result=await proposeDailyInstall({...f.options,input:changed});assert.equal(result.status,'REFUSED');assert.equal(result.code,'CORRECTION_REVIEW_REQUIRED');assert.deepEqual(await state(f),before);
});
test('a new date cannot silently begin at a correction revision',async t=>{
 const f=await fixture(t),p=JSON.parse(payloadBytes);p.revision=2;const changed=path.join(f.root,'revision');await prepareSealed(changed,{payload:encode(p),keys:f.keys});
 const result=await proposeDailyInstall({...f.options,input:changed});assert.equal(result.code,'REVISION_REVIEW_REQUIRED');assert.equal(result.proposalReady,false);
});
test('a conflicting blob already occupying the source digest path is never replaced',async t=>{
 const f=await fixture(t,{sourceOnly:true});await commitMutation(f,'hukamnama/'+manifest.source.path,Buffer.concat([sourceBytes,Buffer.from(' ')]));const before=await state(f);
 const result=await proposeDailyInstall(f.options);assert.equal(result.code,'SOURCE_CONFLICT');assert.deepEqual(await state(f),before);
});
test('damaged admitted record and missing admitted source cannot be repaired by silent replacement',async t=>{
 const f=await fixture(t,{admitted:true});await commitMutation(f,'hukamnama/events/'+DATE+'.json','{"broken":true}\n');const before=await state(f);
 const result=await proposeDailyInstall(f.options);assert.equal(result.code,'ADMITTED_RECORD_INVALID');assert.deepEqual(await state(f),before);
 const g=await fixture(t,{admitted:true});await git(g.repository,'rm','hukamnama/'+manifest.source.path);await git(g.repository,'commit','-m','Synthetic missing source');g.options.baseCommit=(await git(g.repository,'rev-parse','HEAD')).trim();
 const missing=await proposeDailyInstall(g.options);assert.equal(missing.status,'REFUSED');assert.equal(missing.proposalReady,false);
});
test('stale exact-base reference refuses while a moving reference also refuses final admission',async t=>{
 const f=await fixture(t),old=f.options.baseCommit;await commitMutation(f,'new-base.txt','New base\n');const before=await state(f);
 const stale=await proposeDailyInstall({...f.options,baseCommit:old});assert.equal(stale.code,'BASE_CHANGED');assert.deepEqual(await state(f),before);
 const current=f.options.baseCommit,tree=(await git(f.repository,'rev-parse',current+'^{tree}')).trim();
 const changed=(await git(f.repository,'commit-tree',tree,'-p',current,'-m','Synthetic concurrent ref move')).trim();let calls=0;
 const moving=await proposeDailyInstall({...f.options,output:path.join(f.root,'moving'),now:()=>{
  if(++calls===2)execFileSync('git',['-C',f.repository,'update-ref','refs/heads/main',changed,current]);return NOW;
 }});
 assert.equal(moving.code,'BASE_CHANGED');assert.equal(moving.proposalReady,false);
 const after=await state(f);assert.equal((await git(f.repository,'rev-parse','refs/heads/main')).trim(),changed);assert.equal(after.index,before.index);assert.equal(after.working,before.working);assert.equal(after.syntheticNote,before.syntheticNote);
});
test('today-mode midnight rollover leaves the artifact explicitly refused',async t=>{
 const f=await fixture(t),before=await state(f);let calls=0;
 const result=await proposeDailyInstall({...f.options,now:()=>++calls===1?NOW:new Date('2026-11-27T18:30:01Z')});
 assert.equal(result.code,'DATE_ROLLED_OVER');assert.equal(result.proposalReady,false);assert.deepEqual(await state(f),before);
});
test('explicit historical mode stays dated, while future or invalid requests refuse before a run',async t=>{
 const f=await fixture(t),historical=await proposeDailyInstall({...f.options,requestedDate:DATE,now:()=>new Date('2026-11-28T12:00:00Z')});assert.equal(historical.status,'PROPOSED');assert.equal(historical.requestedAsToday,false);assert.equal(historical.requestedDate,DATE);
 for(const date of ['2026-11-29','2026-02-30','today'])await assert.rejects(proposeDailyInstall({...f.options,output:path.join(f.root,'never'),requestedDate:date}),{code:'DATE_SCHEMA'});
 await assert.rejects(fs.lstat(path.join(f.root,'never')),{code:'ENOENT'});
});
test('source bytes, receipt, signature, duplicate JSON and extra files fail before a ready proposal',async t=>{
 const f=await fixture(t),mutations=[
  async p=>fs.appendFile(path.join(p,manifest.source.path),' '),
  async p=>{const e=path.join(p,'events/'+DATE+'.json'),v=JSON.parse(await fs.readFile(e,'utf8'));v.signature=(v.signature[0]==='A'?'B':'A')+v.signature.slice(1);await fs.writeFile(e,encode(v));await refreshManifest(p);},
  async p=>{const r=path.join(p,manifest.receipt.path),v=JSON.parse(await fs.readFile(r,'utf8'));v.extra='DO_NOT_EXPORT';await fs.writeFile(r,encode(v));await refreshManifest(p);},
  async p=>{const m=path.join(p,'manifest.json'),text=await fs.readFile(m,'utf8');await fs.writeFile(m,text.replace('"date":','"date":"2026-11-27","date":'));},
  async p=>fs.writeFile(path.join(p,'portal.html'),'DO_NOT_EXPORT')
 ];
 for(let i=0;i<mutations.length;i++){
  const input=path.join(f.root,'bad-'+i);await fs.cp(f.input,input,{recursive:true});await mutations[i](input);const output=path.join(f.root,'result-'+i),before=await state(f);
  const result=await proposeDailyInstall({...f.options,input,output});assert.equal(result.status,'REFUSED');assert.equal(result.proposalReady,false);assert.deepEqual(await state(f),before);assert.ok(!(await fs.readFile(path.join(output,'proposal.json'),'utf8')).includes('DO_NOT_EXPORT'));
 }
});
test('input traversal, extra directories, symlinks and base symlink blobs refuse',async t=>{
 const f=await fixture(t),mfile=path.join(f.input,'manifest.json'),m=JSON.parse(await fs.readFile(mfile,'utf8')),original=await fs.readFile(mfile);
 m.files[0].path='../outside.json';await fs.writeFile(mfile,encode(m));await assert.rejects(inspectSealedCandidate(f.input,DATE,{now:NOW,publicKey:f.keys.publicKey,keyId:f.keys.keyId}));await fs.writeFile(mfile,original);
 const source=path.join(f.input,manifest.source.path);await fs.unlink(source);await fs.symlink(path.join(FIXTURE,manifest.source.path),source);
 const result=await proposeDailyInstall(f.options);assert.equal(result.code,'INPUT_PATH');assert.equal(result.proposalReady,false);
 const g=await fixture(t);await fs.mkdir(path.join(g.repository,'hukamnama/events'));await fs.symlink('../publication-key.mjs',path.join(g.repository,'hukamnama/events/'+DATE+'.json'));await git(g.repository,'add','hukamnama/events');await git(g.repository,'commit','-m','Synthetic symlink');g.options.baseCommit=(await git(g.repository,'rev-parse','HEAD')).trim();
 const invalid=await proposeDailyInstall(g.options);assert.equal(invalid.code,'BASE_FILE_TYPE');
});
test('publication-key mismatch refuses and cannot produce an unreadable target patch',async t=>{
 const f=await fixture(t);await commitMutation(f,'hukamnama/publication-key.mjs','export const UNKNOWN = true;\n');const result=await proposeDailyInstall(f.options);assert.equal(result.code,'BASE_KEY');assert.equal(result.proposalReady,false);
});
test('exclusive output prevents repeats/concurrent writes and output cannot be inside the repository',async t=>{
 const f=await fixture(t),attempts=await Promise.allSettled([proposeDailyInstall(f.options),proposeDailyInstall(f.options)]);
 assert.equal(attempts.filter(x=>x.status==='fulfilled'&&x.value.status==='PROPOSED').length,1);assert.equal(attempts.filter(x=>x.status==='rejected'&&x.reason.code==='EEXIST').length,1);
 const before=await fs.readFile(path.join(f.options.output,'proposal.json'));await assert.rejects(proposeDailyInstall(f.options),{code:'EEXIST'});assert.deepEqual(await fs.readFile(path.join(f.options.output,'proposal.json')),before);
 await assert.rejects(proposeDailyInstall({...f.options,output:path.join(f.repository,'invalid')}),{code:'OUTPUT_PATH'});await assert.rejects(fs.lstat(path.join(f.repository,'invalid')),{code:'ENOENT'});
});

test('replace refs and local diff display settings cannot alter the pinned base or saved patch',async t=>{
 const f=await fixture(t),original=f.options.baseCommit;
 await commitMutation(f,'unrelated.txt','Replacement-only tree content\n');const replacement=f.options.baseCommit;
 await git(f.repository,'update-ref','refs/heads/main',original,replacement);f.options.baseCommit=original;
 await git(f.repository,'replace',original,replacement);
 await git(f.repository,'config','diff.noprefix','true');await git(f.repository,'config','color.ui','always');
 assert.equal(await git(f.repository,'show',original+':unrelated.txt'),'Replacement-only tree content\n');
 const before=await state(f),result=await proposeDailyInstall(f.options);
 assert.equal(result.status,'PROPOSED');assert.equal(await git(f.repository,'show',result.proposedTree+':unrelated.txt'),'Retained base content\n');
 assert.equal(result.patch.replayVerifiedTree,result.proposedTree);assert.deepEqual(await state(f),before);
 const patch=await fs.readFile(path.join(f.options.output,'change.patch'),'utf8');assert.ok(patch.includes('diff --git a/hukamnama/'));assert.ok(!patch.includes('\u001b['));
});

test('repository subdirectories and common Git storage cannot bypass output isolation',async t=>{
 const f=await fixture(t),output=path.join(f.repository,'must-not-exist');
 await assert.rejects(proposeDailyInstall({...f.options,repository:path.join(f.repository,'hukamnama'),output}),{code:'REPOSITORY_ROOT'});
 await assert.rejects(fs.lstat(output),{code:'ENOENT'});
 const linked=path.join(f.root,'linked');await git(f.repository,'worktree','add','--detach',linked,f.options.baseCommit);
 const insideCommon=path.join(f.repository,'.git','must-not-exist');
 await assert.rejects(proposeDailyInstall({...f.options,repository:linked,output:insideCommon}),{code:'OUTPUT_PATH'});
 await assert.rejects(fs.lstat(insideCommon),{code:'ENOENT'});
});
