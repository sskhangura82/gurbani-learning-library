import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import {execFile} from 'node:child_process';import {promisify} from 'node:util';import {generateKeyPairSync,createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
import {publishDailyTest,TARGET,createTestTransport} from '../tools/publish-daily-test.mjs';import {sealPayload} from '../tools/sign-hukamnama.mjs';import {PreparationRefusal} from '../tools/prepare-daily-hukamnama.mjs';
const exec=promisify(execFile),ROOT=fileURLToPath(new URL('../',import.meta.url)),FIXTURE=path.join(ROOT,'evidence/daily-hukamnama/capture-2026-11-27'),DATE='2026-11-27',NOW=new Date('2026-11-27T12:00:00Z');
const encode=v=>Buffer.from(JSON.stringify(v,null,2)+'\n'),sha=b=>createHash('sha256').update(b).digest('hex');
async function git(repo,...args){return (await exec('git',['-C',repo,...args],{maxBuffer:2*1024*1024})).stdout.trim();}
async function fixture(t,{admitted=false}={}){
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'glp-publisher-test-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));const repo=path.join(root,'repo');await fs.mkdir(repo);await git(repo,'init','-b','main');await git(repo,'config','user.name','Synthetic fixture');await git(repo,'config','user.email','fixture@example.invalid');await git(repo,'config','commit.gpgSign','false');await git(repo,'config','core.hooksPath','/dev/null');await git(repo,'remote','add','origin','https://github.com/'+TARGET+'.git');
 const pair=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),publicKey=pair.publicKey.export({format:'jwk'}),keyId='synthetic-publisher-test';let sealCalls=0;
 async function seal({input,output}){
  sealCalls++;const m=JSON.parse(await fs.readFile(path.join(input,'manifest.json'),'utf8'));const payloadBytes=await fs.readFile(path.join(input,m.payload.path)),sourceBytes=await fs.readFile(path.join(input,m.source.path)),receiptBytes=await fs.readFile(path.join(input,m.receipt.path));
  const sealed=await sealPayload({payloadBytes,sourceBytes,receiptBytes,privateKey:pair.privateKey,publicKey,keyId,now:NOW});await fs.mkdir(output);
  const files=[{path:'events/'+DATE+'.json',bytes:sealed.envelope},{path:m.source.path,bytes:sourceBytes},{path:m.receipt.path,bytes:receiptBytes}];for(const file of files){await fs.mkdir(path.dirname(path.join(output,file.path)),{recursive:true});await fs.writeFile(path.join(output,file.path),file.bytes);}
  await fs.writeFile(path.join(output,'manifest.json'),encode({schema:'glp.hukamnama.sealed-candidate.v1',date:DATE,keyId,mode:'DEVELOPMENT_PREVIEW',publicationApproved:false,sgpcSignature:false,files:files.map(f=>({path:f.path,sha256:sha(f.bytes)}))}));
 }
 await fs.mkdir(path.join(repo,'hukamnama'));await fs.copyFile(path.join(ROOT,'hukamnama/publication-key.mjs'),path.join(repo,'hukamnama/publication-key.mjs'));await fs.writeFile(path.join(repo,'unrelated.txt'),'Synthetic base content');
 if(admitted){const sealed=path.join(root,'initial');await seal({input:FIXTURE,output:sealed});for(const directory of ['events','sources'])await fs.cp(path.join(sealed,directory),path.join(repo,'hukamnama',directory),{recursive:true});}
 await git(repo,'add','.');await git(repo,'commit','-m','Synthetic isolated baseline');const base=await git(repo,'rev-parse','HEAD');let remote=base,builds=0,pushes=0;
 const transport={preflight(){},async head(){return remote;},async push(commit,expected){pushes++;assert.equal(remote,expected);assert.equal(await git(repo,'rev-parse',commit+'^'),expected);remote=commit;},async requestBuild(){builds++;return {requested:true};},async served(relative){return Buffer.from((await exec('git',['-C',repo,'show',remote+':'+relative],{encoding:'buffer'})).stdout);}};
 const options={repository:repo,baseCommit:base,baseRef:'refs/heads/main',output:path.join(root,'run'),now:()=>NOW,publicKey,keyId,acquire:async({output})=>fs.cp(FIXTURE,output,{recursive:true}),seal,transport,attempts:2,pause:async()=>{}};
 return {root,repo,base,options,transport,stats:()=>({remote,builds,pushes,sealCalls}),setRemote:value=>{remote=value;}};
}
async function state(f){return {head:await git(f.repo,'rev-parse','HEAD'),index:sha(await fs.readFile(path.join(f.repo,'.git/index'))),text:await fs.readFile(path.join(f.repo,'unrelated.txt'),'utf8')};}

test('complete synthetic capture/seal/propose/remote-update/build/served chain preserves checkout and index',async t=>{
 const f=await fixture(t),before=await state(f),result=await publishDailyTest({...f.options,enableNetwork:true});
 assert.equal(result.status,'DELIVERED_EXACT_DATE');assert.equal(result.servedExact,true);assert.equal(result.remoteUpdated,true);assert.equal(result.buildRequested,true);assert.equal(result.familySiteChanged,false);assert.equal(result.publicationApproved,false);assert.equal(result.commit.parent,f.base);assert.deepEqual(await state(f),before);
 assert.equal(f.stats().pushes,1);assert.equal(f.stats().builds,1);assert.equal(f.stats().sealCalls,1);assert.equal(result.remoteOutcome,'UPDATED');
 const stored=JSON.parse(await fs.readFile(path.join(f.options.output,'publisher.json'),'utf8'));assert.deepEqual(stored,result);
});
test('prepare-only creates a reconstructable commit but never calls network transport',async t=>{
 const f=await fixture(t),before=await state(f);for(const k of ['preflight','head','push','requestBuild','served'])f.transport[k]=()=>{throw Error('network must not run');};
 const result=await publishDailyTest(f.options);assert.equal(result.status,'READY_NOT_INSTALLED');assert.equal(result.remoteUpdated,false);assert.equal(result.servedExact,false);assert.ok(result.commit);assert.deepEqual(await state(f),before);
});
test('an already-admitted date neither signs nor pushes but requests a build for interrupted prior delivery',async t=>{
 const f=await fixture(t,{admitted:true}),before=f.stats().sealCalls,result=await publishDailyTest({...f.options,enableNetwork:true});
 assert.equal(result.status,'DELIVERED_EXACT_DATE');assert.equal(result.commit,null);assert.equal(result.remoteUpdated,false);assert.equal(result.remoteOutcome,'UNCHANGED_ALREADY_ADMITTED');assert.equal(f.stats().sealCalls,before);assert.equal(f.stats().pushes,0);assert.equal(f.stats().builds,1);
});
test('wrong effective target and changed or dirty checkout refuse before acquisition',async t=>{
 const f=await fixture(t);let captured=false;const options={...f.options,acquire:async()=>{captured=true;}};
 await git(f.repo,'remote','set-url','--push','origin','https://github.com/sskhangura82/gurbani-learning-library.git');await assert.rejects(publishDailyTest(options),{code:'WRONG_TARGET'});assert.equal(captured,false);await assert.rejects(fs.lstat(f.options.output),{code:'ENOENT'});
 await git(f.repo,'remote','set-url','--push','origin','https://github.com/'+TARGET+'.git');await fs.appendFile(path.join(f.repo,'unrelated.txt'),'changed');await assert.rejects(publishDailyTest(options),{code:'DIRTY_CHECKOUT'});assert.equal(captured,false);
});
test('concurrent remote work is preserved and no push or build follows the refusal',async t=>{
 const f=await fixture(t);f.setRemote('a'.repeat(40));const result=await publishDailyTest({...f.options,enableNetwork:true});assert.equal(result.code,'REMOTE_CHANGED');assert.equal(f.stats().remote,'a'.repeat(40));assert.equal(f.stats().pushes,0);assert.equal(f.stats().builds,0);assert.equal(result.remoteUpdated,false);
});
test('lease refusal after observation preserves concurrent work',async t=>{
 const f=await fixture(t);f.transport.push=async()=>{f.setRemote('b'.repeat(40));throw Error('synthetic concurrent lease refusal');};const result=await publishDailyTest({...f.options,enableNetwork:true});assert.equal(result.status,'REMOTE_CHANGED');assert.equal(result.remoteUpdated,false);assert.equal(f.stats().remote,'b'.repeat(40));assert.equal(f.stats().builds,0);
});
test('lost push acknowledgement is reconciled by exact remote head, never falsely rolled back',async t=>{
 const f=await fixture(t),push=f.transport.push;f.transport.push=async(...args)=>{await push(...args);throw Error('synthetic acknowledgement lost');};const result=await publishDailyTest({...f.options,enableNetwork:true});assert.equal(result.status,'DELIVERED_EXACT_DATE');assert.equal(result.remoteOutcome,'UPDATED_AFTER_RECONCILIATION');assert.equal(f.stats().pushes,1);
});
test('unknown push outcome retains durable intent and does not request a build or claim delivery',async t=>{
 const f=await fixture(t);let heads=0;f.transport.head=async()=>{if(++heads===1)return f.base;throw Error('synthetic unavailable');};f.transport.push=async()=>{throw Error('synthetic acknowledgement lost');};const result=await publishDailyTest({...f.options,enableNetwork:true});assert.equal(result.status,'PUSH_OUTCOME_UNKNOWN');assert.ok(result.commit.id);assert.equal(result.servedExact,false);assert.equal(f.stats().builds,0);assert.equal(result.remoteOutcome,'PENDING');
});
test('official unavailability is retained without signing, substituting or contacting publisher',async t=>{
 const f=await fixture(t),result=await publishDailyTest({...f.options,enableNetwork:true,acquire:async()=>{throw new PreparationRefusal('OFFICIAL_UNAVAILABLE');}});assert.equal(result.preparationStatus,'SOURCE_UNAVAILABLE');assert.equal(result.status,'REFUSED');assert.equal(f.stats().sealCalls,0);assert.equal(f.stats().pushes,0);assert.equal(f.stats().builds,0);
});
test('build failure is reported after the Git update with no false served claim',async t=>{
 const f=await fixture(t);f.transport.requestBuild=async()=>{throw Error('synthetic build failure');};const result=await publishDailyTest({...f.options,enableNetwork:true});assert.equal(result.status,'INSTALLED_BUILD_NOT_REQUESTED');assert.equal(result.remoteUpdated,true);assert.equal(result.buildRequested,false);assert.equal(result.servedExact,false);
});
test('an acknowledged build with wrong served bytes cannot count as delivered',async t=>{
 const f=await fixture(t);f.transport.served=async()=>Buffer.from('wrong date, source or signature');const result=await publishDailyTest({...f.options,enableNetwork:true});assert.equal(result.status,'BUILD_REQUESTED_READING_NOT_CONFIRMED');assert.equal(result.servedAttempts,2);assert.equal(result.servedExact,false);assert.equal(result.remoteUpdated,true);
});
test('official HTTP build request is fixed-target, credentialed, nonredirecting, with bounded original serving',async()=>{
 const calls=[],transport=createTestTransport('/unused',{token:'SYNTHETIC_ONLY',fetchImpl:async(url,options)=>{calls.push({url,options});return new Response('{"status":"queued"}',{status:201});}});
 await transport.preflight();await transport.requestBuild();assert.equal(calls[0].url,'https://api.github.com/repos/'+TARGET+'/pages/builds');assert.equal(calls[0].options.method,'POST');assert.equal(calls[0].options.redirect,'error');assert.equal(calls[0].options.headers.Authorization,'Bearer SYNTHETIC_ONLY');
 await assert.rejects(transport.served('../private.json'),{code:'SERVED_PATH'});assert.equal(calls.length,1);
});


test('transport push stays on one exact leased ref despite tag and submodule push configuration',async t=>{
 const f=await fixture(t),bin=path.join(f.root,'bin'),log=path.join(f.root,'git-calls.jsonl');
 const realGit=(await exec('/bin/sh',['-c','command -v git'])).stdout.trim();assert.ok(path.isAbsolute(realGit));
 await git(f.repo,'config','push.followTags','true');await git(f.repo,'config','push.recurseSubmodules','on-demand');
 assert.equal(await git(f.repo,'config','push.followTags'),'true');assert.equal(await git(f.repo,'config','push.recurseSubmodules'),'on-demand');
 await fs.mkdir(bin);
 const wrapper=[
  '#!'+process.execPath,
  "const fs=require('node:fs'),cp=require('node:child_process');",
  'const args=process.argv.slice(2),log='+JSON.stringify(log)+',realGit='+JSON.stringify(realGit)+';',
  "fs.appendFileSync(log,JSON.stringify(args)+'\\n');",
  "// Capture pushes only. No push, fetch, ls-remote, hook or HTTP can run here.",
  "if(args.includes('push'))process.exit(0);",
  "if(args.includes('remote')&&args.includes('get-url')){const r=cp.spawnSync(realGit,args,{stdio:'inherit'});process.exit(r.status??87);}",
  'process.exit(86);'
 ].join('\n')+'\n';
 await fs.writeFile(path.join(bin,'git'),wrapper,{mode:0o700});
 const proposed='c'.repeat(40),moduleUrl=new URL('../tools/publish-daily-test.mjs',import.meta.url).href;
 const childCode='import {createTestTransport} from '+JSON.stringify(moduleUrl)+';'+
  'await createTestTransport('+JSON.stringify(f.repo)+',{token:"SYNTHETIC_ONLY",fetchImpl:()=>{throw Error("HTTP forbidden in push test");}}).push('+JSON.stringify(proposed)+','+JSON.stringify(f.base)+');';
 await exec(process.execPath,['--input-type=module','-e',childCode],{env:{...process.env,PATH:bin+path.delimiter+process.env.PATH},cwd:ROOT});
 const calls=(await fs.readFile(log,'utf8')).trim().split('\n').map(line=>JSON.parse(line));
 assert.equal(calls.length,3);assert.deepEqual(calls.slice(0,2).map(args=>args.slice(args.indexOf('remote'))),[
  ['remote','get-url','--all','origin'],['remote','get-url','--push','--all','origin']
 ]);
 const args=calls[2],push=args.slice(args.indexOf('push'));
 assert.deepEqual(push,['push','--porcelain','--no-follow-tags','--no-recurse-submodules','--force-with-lease=refs/heads/main:'+f.base,'origin',proposed+':refs/heads/main']);
 assert.equal(args.some(arg=>arg==='--no-verify'||arg.startsWith('core.hooksPath=')),false,'the publisher must not bypass repository policy hooks');
 assert.equal(await git(f.repo,'rev-parse','HEAD'),f.base);
});

test('CLI refuses wrong repository, wrong branch and disabled activation before Git or preparation',async t=>{
 const f=await fixture(t),bin=path.join(f.root,'deny-bin'),log=path.join(f.root,'unexpected-git.jsonl');await fs.mkdir(bin);
 await fs.writeFile(path.join(bin,'git'),[
  '#!'+process.execPath,
  "const fs=require('node:fs');",
  'fs.appendFileSync('+JSON.stringify(log)+",JSON.stringify(process.argv.slice(2))+'\\n');",
  'process.exit(86);'
 ].join('\n')+'\n',{mode:0o700});
 const cases=[
  {GITHUB_REPOSITORY:'sskhangura82/gurbani-learning-library',GITHUB_REF:'refs/heads/main',GLP_DAILY_TEST_PUBLISH_ENABLED:'true'},
  {GITHUB_REPOSITORY:TARGET,GITHUB_REF:'refs/heads/feature/synthetic',GLP_DAILY_TEST_PUBLISH_ENABLED:'true'},
  {GITHUB_REPOSITORY:TARGET,GITHUB_REF:'refs/heads/main',GLP_DAILY_TEST_PUBLISH_ENABLED:'false'}
 ];
 for(const [i,gate] of cases.entries()){
  const output=path.join(f.root,'rejected-'+i);let refusal;
  try{
   await exec(process.execPath,[path.join(ROOT,'tools/publish-daily-test.mjs'),'--repository',f.repo,'--base',f.base,'--ref','refs/heads/main','--output',output,'--key',path.join(f.root,'not-a-key.pem'),'--publish-to-isolated-test'],{
    cwd:ROOT,env:{...process.env,...gate,PATH:bin+path.delimiter+process.env.PATH,GITHUB_TOKEN:'SYNTHETIC_SECRET_MUST_NOT_APPEAR'}
   });
  }catch(error){refusal=error;}
  assert.ok(refusal);assert.equal(refusal.code,2);assert.equal(refusal.stdout,'');
  assert.deepEqual(JSON.parse(refusal.stderr),{status:'REFUSED',code:'PUBLISHER_NOT_STARTED',familySiteChanged:false,servedExact:false});
  assert.equal(refusal.stderr.includes('SYNTHETIC_SECRET_MUST_NOT_APPEAR'),false);
  await assert.rejects(fs.lstat(output),{code:'ENOENT'});await assert.rejects(fs.lstat(log),{code:'ENOENT'});
 }
});
