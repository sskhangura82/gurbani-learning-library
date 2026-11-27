#!/usr/bin/env node
/* Isolated development publisher. The CLI never accepts an arbitrary repository,
 * branch, endpoint or verification key. Scheduled activation is separately gated. */
import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawn} from 'node:child_process';import {createHash} from 'node:crypto';
import {prepareDaily} from './prepare-daily-hukamnama.mjs';import {sealIngest} from './sign-hukamnama.mjs';import {proposeDailyInstall} from './propose-daily-install.mjs';
import {amritsarDate,validDate} from '../hukamnama/core.mjs';import {decodeEvent,decodeSource} from '../hukamnama/delivery.mjs';
export const TARGET='glp001-iphone-qa/glp001-iphone-test',REF='refs/heads/main';
const ORIGIN='https://github.com/'+TARGET,API='https://api.github.com/repos/'+TARGET,SITE='https://glp001-iphone-qa.github.io/glp001-iphone-test/';
const SHA=/^[a-f0-9]{40}$/,sha=b=>createHash('sha256').update(b).digest('hex'),encode=v=>Buffer.from(JSON.stringify(v,null,2)+'\n');
const array=b=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),within=(a,b)=>b===a||b.startsWith(a+path.sep);
export class PublisherRefusal extends Error {constructor(code){super(code);this.code=code;}}
const requireThat=(v,c)=>{if(!v)throw new PublisherRefusal(c);};
function instant(now){const d=new Date(typeof now==='function'?now():now);requireThat(Number.isFinite(+d),'CLOCK_INVALID');return d;}
function env(network=false){const v={...process.env};for(const k of Object.keys(v))if(k.startsWith('GIT_'))delete v[k];return {...v,GIT_TERMINAL_PROMPT:'0',GIT_NO_REPLACE_OBJECTS:'1',GIT_NO_LAZY_FETCH:'1',GIT_ALLOW_PROTOCOL:network?'https':''};}
export function runPublisherGit(repo,args,{input,network=false,extraEnv={},limit=2*1024*1024}={}){
 return new Promise((resolve,reject)=>{
  const child=spawn('git',['--no-replace-objects','--no-optional-locks','--literal-pathspecs','-C',repo,'-c','core.fsmonitor=false',...args],{env:{...env(network),...extraEnv},stdio:['pipe','pipe','pipe']});
  const chunks=[];let size=0,done=false;
  const finish=(error,value)=>{if(done)return;done=true;clearTimeout(timer);error?reject(error):resolve(value);};
  const timer=setTimeout(()=>{child.kill('SIGKILL');finish(new PublisherRefusal('GIT_UNAVAILABLE'));},45000);
  child.on('error',()=>finish(new PublisherRefusal('GIT_UNAVAILABLE')));child.stdout.on('data',b=>{size+=b.length;if(size>limit){child.kill('SIGKILL');finish(new PublisherRefusal('GIT_OUTPUT'));}else chunks.push(b);});
  child.stderr.resume();child.stdin.on('error',()=>{});child.on('close',c=>finish(c===0?null:new PublisherRefusal('GIT_REFUSED'),Buffer.concat(chunks)));child.stdin.end(input);
 });
}
const text=async(repo,args,options)=>(await runPublisherGit(repo,args,options)).toString('utf8').trim();
async function checkedTarget(repo){
 for(const push of [false,true]){
  const urls=(await text(repo,['remote','get-url',...(push?['--push']:[]),'--all','origin'])).split('\n');
  requireThat(urls.length===1&&[ORIGIN,ORIGIN+'.git'].includes(urls[0]),'WRONG_TARGET');
 }
}
async function boundedResponse(response,limit){
 requireThat(response.ok&&!response.redirected,'HTTP_REFUSED');
 const chunks=[];let total=0;const reader=response.body.getReader();
 try{for(;;){const v=await reader.read();if(v.done)break;total+=v.value.length;requireThat(total<=limit,'HTTP_SIZE');chunks.push(Buffer.from(v.value));}}catch(error){await reader.cancel().catch(()=>{});throw error;}finally{reader.releaseLock();}
 requireThat(total>0,'HTTP_EMPTY');return Buffer.concat(chunks);
}
export function createTestTransport(repo,{token=process.env.GITHUB_TOKEN,fetchImpl=fetch}={}){
 return {
  preflight(){requireThat(typeof token==='string'&&token.length>0,'AUTH_UNAVAILABLE');},
  async head(){await checkedTarget(repo);const rows=(await text(repo,['ls-remote','--refs','origin',REF],{network:true})).split('\n');requireThat(rows.length===1,'REMOTE_HEAD');const match=rows[0].match(/^([a-f0-9]{40})\trefs\/heads\/main$/);requireThat(match,'REMOTE_HEAD');return match[1];},
  async push(commit,expected){await checkedTarget(repo);requireThat(SHA.test(commit)&&SHA.test(expected),'COMMIT_INVALID');await runPublisherGit(repo,['push','--porcelain','--no-follow-tags','--no-recurse-submodules','--force-with-lease='+REF+':'+expected,'origin',commit+':'+REF],{network:true});},
  async requestBuild(){
   const response=await fetchImpl(API+'/pages/builds',{method:'POST',redirect:'error',headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(20000)});
   requireThat(response.status===201||response.status===202,'BUILD_REFUSED');await boundedResponse(response,65536);return {requested:true};
  },
  async served(relative){requireThat(/^hukamnama\/(events\/\d{4}-\d{2}-\d{2}|sources\/[a-f0-9]{64})\.json$/.test(relative),'SERVED_PATH');const response=await fetchImpl(SITE+relative,{credentials:'omit',redirect:'error',cache:'no-store',signal:AbortSignal.timeout(20000)});return boundedResponse(response,relative.includes('/events/')?512*1024:1024*1024);}
 };
}
async function persist(root,record,{initial=false}={}){
 const bytes=encode(record);requireThat(bytes.length<=32768,'REPORT_SIZE');const file=path.join(root,initial?'publisher.json':'.publisher-next.json');await fs.writeFile(file,bytes,{flag:'wx',mode:0o600});if(!initial)await fs.rename(file,path.join(root,'publisher.json'));
}
const CODES=new Set(['CLOCK_INVALID','WRONG_TARGET','BASE_CHANGED','DIRTY_CHECKOUT','OUTPUT_PATH','AUTH_UNAVAILABLE','SOURCE_NOT_READY','CORRECTION_REVIEW_REQUIRED','PROPOSAL_REFUSED','REMOTE_CHANGED','GIT_UNAVAILABLE','GIT_REFUSED','GIT_OUTPUT','REMOTE_HEAD','COMMIT_INVALID','BUILD_REFUSED','HTTP_REFUSED','HTTP_SIZE','HTTP_EMPTY','SERVED_PATH','DATE_ROLLED_OVER','REPORT_SIZE']);

/** Transport, acquisition, sealer, clock and key injection are synthetic test seams.
 * The CLI exposes none of these overrides. It uses the official adapter and pinned key. */
export async function publishDailyTest({repository,baseCommit,baseRef='refs/remotes/origin/main',output,keyPath,requestedDate=null,enableNetwork=false,now=()=>new Date(),transport,acquire,seal=sealIngest,publicKey,keyId,attempts=12,pause=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 const started=instant(now),date=requestedDate??amritsarDate(started);requireThat(validDate(date)&&date<=amritsarDate(started),'DATE_INVALID');
 requireThat(typeof repository==='string'&&typeof output==='string'&&typeof baseCommit==='string'&&SHA.test(baseCommit)&&['refs/heads/main','refs/remotes/origin/main'].includes(baseRef),'BASE_INVALID');
 requireThat(Number.isInteger(attempts)&&attempts>=1&&attempts<=12,'ATTEMPTS_INVALID');
 const repo=await fs.realpath(repository),top=await fs.realpath(await text(repo,['rev-parse','--show-toplevel']));requireThat(repo===top,'REPOSITORY_ROOT');
 const root=path.join(await fs.realpath(path.dirname(path.resolve(output))),path.basename(output));
 const common=await fs.realpath(await text(repo,['rev-parse','--path-format=absolute','--git-common-dir']));requireThat(!within(repo,root)&&!within(root,repo)&&!within(common,root)&&!within(root,common),'OUTPUT_PATH');
 await checkedTarget(repo);requireThat(await text(repo,['rev-parse','HEAD'])===baseCommit&&await text(repo,['rev-parse',baseRef])===baseCommit,'BASE_CHANGED');
 requireThat((await text(repo,['status','--porcelain','--untracked-files=no']))==='','DIRTY_CHECKOUT');
 const io=transport??createTestTransport(repo);if(enableNetwork)await io.preflight();
 await fs.mkdir(root,{mode:0o700});
 const record={schema:'glp.hukamnama.test-publisher.v1',target:TARGET,branch:REF,mode:'DEVELOPMENT_PREVIEW',date,requestedAsToday:requestedDate===null,startedAtUtc:started.toISOString(),finishedAtUtc:null,baseCommit,status:'RUNNING',code:null,publicationApproved:false,familySiteChanged:false,networkEnabled:enableNetwork,preparationStatus:null,proposalStatus:null,commit:null,remoteUpdated:false,remoteOutcome:'NOT_ATTEMPTED',buildRequested:false,servedExact:false,servedAttempts:0,source:null};
 await persist(root,record,{initial:true});
 const finish=async(status,code=null)=>{record.status=status;record.code=code;record.finishedAtUtc=instant(now).toISOString();await persist(root,record);return record;};
 try{
  const prepared=await prepareDaily({output:path.join(root,'preparation'),requestedDate,now,sourceCommit:baseCommit,admittedRoot:path.join(repo,'hukamnama'),...(acquire?{acquire}:{}),publicKey,keyId});record.preparationStatus=prepared.status;
  requireThat(['CANDIDATE_PREPARED','ALREADY_ADMITTED'].includes(prepared.status),prepared.status==='CORRECTION_REVIEW_REQUIRED'?'CORRECTION_REVIEW_REQUIRED':'SOURCE_NOT_READY');
  record.source=prepared.source;let selected=baseCommit;
  if(prepared.status==='CANDIDATE_PREPARED'){
   const sealed=path.join(root,'sealed');await seal({input:path.join(root,'preparation/capture'),output:sealed,keyPath,now:instant(now)});
   const proposal=await proposeDailyInstall({input:sealed,repository:repo,baseCommit,baseRef,output:path.join(root,'proposal'),requestedDate,now,publicKey,keyId});record.proposalStatus=proposal.status;
   requireThat(proposal.status==='PROPOSED'&&proposal.proposalReady===true,'PROPOSAL_REFUSED');
   const stamp=instant(now).toISOString(),extraEnv={GIT_AUTHOR_NAME:'GLP isolated daily publisher',GIT_AUTHOR_EMAIL:'glp-isolated-publisher@users.noreply.github.com',GIT_COMMITTER_NAME:'GLP isolated daily publisher',GIT_COMMITTER_EMAIL:'glp-isolated-publisher@users.noreply.github.com',GIT_AUTHOR_DATE:stamp,GIT_COMMITTER_DATE:stamp};
   selected=await text(repo,['-c','commit.gpgSign=false','commit-tree',proposal.proposedTree,'-p',baseCommit,'-m','Add checked official dated original '+date],{extraEnv});requireThat(SHA.test(selected),'COMMIT_INVALID');
   const header=(await text(repo,['cat-file','-p',selected])).split('\n\n')[0];requireThat(header.split('\n').filter(l=>l.startsWith('parent ')).join('\n')==='parent '+baseCommit&&header.split('\n')[0]==='tree '+proposal.proposedTree,'COMMIT_INVALID');
   record.commit={id:selected,parent:baseCommit,tree:proposal.proposedTree};
  }
  // Re-read from immutable Git objects, not from the mutable capture/worktree.
  const eventPath='hukamnama/events/'+date+'.json',eventBytes=await runPublisherGit(repo,['show',selected+':'+eventPath]);
  const event=await decodeEvent(array(eventBytes),date,{now:instant(now),publicKey,keyId}),sourcePath='hukamnama/'+event.source.path.slice(2),sourceBytes=await runPublisherGit(repo,['show',selected+':'+sourcePath]);await decodeSource(array(sourceBytes),event);
  requireThat(await text(repo,['rev-parse','HEAD'])===baseCommit&&await text(repo,['rev-parse',baseRef])===baseCommit,'BASE_CHANGED');
  if(requestedDate===null)requireThat(amritsarDate(instant(now))===date,'DATE_ROLLED_OVER');
  if(!enableNetwork)return finish(prepared.status==='ALREADY_ADMITTED'?'ALREADY_ADMITTED_NOT_PUBLISHED':'READY_NOT_INSTALLED');
  requireThat(await io.head()===baseCommit,'REMOTE_CHANGED');
  if(selected!==baseCommit){
   record.status='PUSH_INTENT_RECORDED';record.remoteOutcome='PENDING';await persist(root,record);
   try{await io.push(selected,baseCommit);record.remoteUpdated=true;record.remoteOutcome='UPDATED';}
   catch{
    let observed;try{observed=await io.head();}catch{return finish('PUSH_OUTCOME_UNKNOWN','GIT_UNAVAILABLE');}
    if(observed===selected){record.remoteUpdated=true;record.remoteOutcome='UPDATED_AFTER_RECONCILIATION';}
    else{return finish(observed===baseCommit?'PUSH_REFUSED':'REMOTE_CHANGED','GIT_REFUSED');}
   }
   await persist(root,record);
  }else record.remoteOutcome='UNCHANGED_ALREADY_ADMITTED';
  // Always request a build, even after an admitted repeat: a preceding token push
  // may have succeeded before its process was interrupted prior to Pages request.
  try{await io.requestBuild();record.buildRequested=true;await persist(root,record);}catch{return finish('INSTALLED_BUILD_NOT_REQUESTED','BUILD_REFUSED');}
  for(let attempt=1;attempt<=attempts;attempt++){
   record.servedAttempts=attempt;
   try{
    const [servedEvent,servedSource]=await Promise.all([io.served(eventPath),io.served(sourcePath)]);
    if(Buffer.from(servedEvent).equals(eventBytes)&&Buffer.from(servedSource).equals(sourceBytes)){
     const verified=await decodeEvent(array(Buffer.from(servedEvent)),date,{now:instant(now),publicKey,keyId});await decodeSource(array(Buffer.from(servedSource)),verified);record.servedExact=true;
     return finish(requestedDate===null&&amritsarDate(instant(now))!==date?'DELIVERED_DATED_AFTER_ROLLOVER':'DELIVERED_EXACT_DATE');
    }
   }catch{}
   if(attempt<attempts)await pause(5000);
  }
  return finish('BUILD_REQUESTED_READING_NOT_CONFIRMED');
 }catch(error){return finish('REFUSED',CODES.has(error.code)?error.code:'PUBLISHER_REFUSED');}
}

async function main(){
 const args=process.argv.slice(2),options={};
 for(let i=0;i<args.length;i++){
  if(args[i]==='--publish-to-isolated-test'){requireThat(!options.publish,'CLI_ARGUMENT');options.publish=true;continue;}
  requireThat(['--repository','--base','--ref','--output','--key','--date'].includes(args[i])&&args[i+1]&&!args[i+1].startsWith('--'),'CLI_ARGUMENT');const k=args[i].slice(2);requireThat(!Object.hasOwn(options,k),'CLI_ARGUMENT');options[k]=args[++i];
 }
 if(options.publish)requireThat(process.env.GITHUB_REPOSITORY===TARGET&&process.env.GLP_DAILY_TEST_PUBLISH_ENABLED==='true'&&process.env.GITHUB_REF===REF,'ACTIVATION_REQUIRED');
 const result=await publishDailyTest({repository:options.repository,baseCommit:options.base,baseRef:options.ref,output:options.output,keyPath:options.key,requestedDate:options.date??null,enableNetwork:options.publish===true});console.log(JSON.stringify(result));
 return ['DELIVERED_EXACT_DATE','DELIVERED_DATED_AFTER_ROLLOVER','READY_NOT_INSTALLED','ALREADY_ADMITTED_NOT_PUBLISHED'].includes(result.status)?0:2;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().then(c=>{process.exitCode=c;}).catch(()=>{console.error(JSON.stringify({status:'REFUSED',code:'PUBLISHER_NOT_STARTED',familySiteChanged:false,servedExact:false}));process.exitCode=2;});
