#!/usr/bin/env node
/* Development artifact only. No key access, signing, reference update or deployment. */
import fs from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {parseStrictJSON} from '../hukamnama/json.mjs';
import {amritsarDate,validDate} from '../hukamnama/core.mjs';
import {decodeEvent,decodeSource} from '../hukamnama/delivery.mjs';
import {PUBLICATION_KEY,KEY_ID,PUBLICATION_MODE} from '../hukamnama/publication-key.mjs';
import {validateStage} from './hukamnama-stage-contract.mjs';
import {compareAdmitted} from './prepare-daily-hukamnama.mjs';

const ROOT=fileURLToPath(new URL('../',import.meta.url));
const HEX=/^[a-f0-9]{64}$/,COMMIT=/^[a-f0-9]{40}$/;
const sha=b=>createHash('sha256').update(b).digest('hex');
const encode=v=>Buffer.from(JSON.stringify(v,null,2)+'\n');
const json=b=>parseStrictJSON(new TextDecoder('utf-8',{fatal:true}).decode(b));
const array=b=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const exact=(v,keys)=>plain(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const within=(parent,child)=>child===parent||child.startsWith(parent+path.sep);
export class InstallRefusal extends Error {constructor(code){super(code);this.code=code;}}
const insist=(v,code)=>{if(!v)throw new InstallRefusal(code);};
function clock(now){const d=new Date(typeof now==='function'?now():now);insist(Number.isFinite(+d),'CLOCK_INVALID');return d;}

async function readBounded(root,relative,limit){
 insist(typeof relative==='string'&&!path.isAbsolute(relative)&&relative.split('/').every(p=>p&&p!=='.'&&p!=='..'),'INPUT_PATH');
 let current=root;const parts=relative.split('/');
 for(let i=0;i<parts.length;i++){
  current=path.join(current,parts[i]);const stat=await fs.lstat(current);
  insist(!stat.isSymbolicLink()&&(i===parts.length-1?stat.isFile():stat.isDirectory()),'INPUT_PATH');
 }
 const file=await fs.open(current,constants.O_RDONLY|constants.O_NOFOLLOW);
 try{
  const stat=await file.stat();insist(stat.isFile()&&stat.size>0&&stat.size<=limit,'INPUT_SIZE');
  const bytes=Buffer.alloc(Math.min(limit,stat.size)+1);let read=0;
  while(read<bytes.length){const part=await file.read(bytes,read,bytes.length-read,null);if(part.bytesRead===0)break;read+=part.bytesRead;}
  insist(read===stat.size&&read<=limit,'INPUT_SIZE');return bytes.subarray(0,read);
 }finally{await file.close();}
}
async function exactTree(root,allowed,prefix=''){
 for(const item of await fs.readdir(path.join(root,prefix),{withFileTypes:true})){
  const relative=prefix+item.name;
  insist(!item.isSymbolicLink(),'INPUT_PATH');
  if(item.isDirectory()){
   insist(allowed.some(p=>p.startsWith(relative+'/')),'INPUT_EXTRA');await exactTree(root,allowed,relative+'/');
  }else insist(item.isFile()&&allowed.includes(relative),'INPUT_EXTRA');
 }
}

export async function inspectSealedCandidate(input,date,{now=new Date(),publicKey=PUBLICATION_KEY,keyId=KEY_ID}={}){
 const stat=await fs.lstat(input);insist(stat.isDirectory()&&!stat.isSymbolicLink(),'INPUT_PATH');
 const root=await fs.realpath(input),manifestBytes=await readBounded(root,'manifest.json',16*1024),manifest=json(manifestBytes);
 insist(exact(manifest,['schema','date','keyId','mode','publicationApproved','sgpcSignature','files'])&&manifest.schema==='glp.hukamnama.sealed-candidate.v1'&&manifest.date===date&&manifest.keyId===keyId&&manifest.mode==='DEVELOPMENT_PREVIEW'&&manifest.publicationApproved===false&&manifest.sgpcSignature===false,'MANIFEST_INVALID');
 insist(Array.isArray(manifest.files)&&manifest.files.length===3,'MANIFEST_INVALID');
 const eventPath='events/'+date+'.json',receiptPath='receipts/'+date+'.original.json',files=new Map();
 for(const entry of manifest.files){
  insist(exact(entry,['path','sha256'])&&typeof entry.path==='string'&&typeof entry.sha256==='string'&&HEX.test(entry.sha256)&&!files.has(entry.path),'MANIFEST_INVALID');
  const source=/^sources\/[a-f0-9]{64}\.json$/.test(entry.path);
  insist(source||entry.path===eventPath||entry.path===receiptPath,'MANIFEST_INVALID');
  const limit=source?1024*1024:entry.path===eventPath?512*1024:256*1024;
  const bytes=await readBounded(root,entry.path,limit);insist(sha(bytes)===entry.sha256,'INPUT_DIGEST');files.set(entry.path,bytes);
 }
 insist(files.has(eventPath)&&files.has(receiptPath),'MANIFEST_INVALID');
 await exactTree(root,['manifest.json',...files.keys()]);
 const eventBytes=files.get(eventPath),event=await decodeEvent(array(eventBytes),date,{now,publicKey,keyId});
 const sourcePath=event.source.path.slice(2),sourceBytes=files.get(sourcePath);
 insist(sourceBytes,'SOURCE_BINDING');const source=await decodeSource(array(sourceBytes),event);
 const receiptBytes=files.get(receiptPath),receipt=json(receiptBytes);
 insist(sha(receiptBytes)===event.officialReceiptSha256,'RECEIPT_BINDING');
 try{validateStage({payload:event,source,receipt});}catch{throw new InstallRefusal('STAGE_CONTRACT');}
 return {event,eventBytes,eventPath,source,sourceBytes,sourcePath,receiptBytes,receiptPath,manifestSha256:sha(manifestBytes)};
}

function environment(index){
 const env={...process.env};
 for(const name of Object.keys(env))if(name.startsWith('GIT_'))delete env[name];
 if(index)env.GIT_INDEX_FILE=index;
 env.GIT_TERMINAL_PROMPT='0';env.GIT_NO_REPLACE_OBJECTS='1';env.GIT_NO_LAZY_FETCH='1';env.GIT_ALLOW_PROTOCOL='';return env;
}
function git(repo,args,{input,index,limit=4*1024*1024}={}){
 return new Promise((resolve,reject)=>{
  const child=spawn('git',['--no-replace-objects','--no-optional-locks','--literal-pathspecs','-C',repo,'-c','core.fsmonitor=false','-c','protocol.allow=never',...args],{env:environment(index),stdio:['pipe','pipe','pipe']});
  const chunks=[];let size=0,settled=false;
  const finish=(error,result)=>{if(settled)return;settled=true;clearTimeout(timer);error?reject(error):resolve(result);};
  const timer=setTimeout(()=>{child.kill('SIGKILL');finish(new InstallRefusal('GIT_OPERATION'));},30000);
  child.on('error',()=>finish(new InstallRefusal('GIT_OPERATION')));
  child.stdout.on('data',chunk=>{size+=chunk.length;if(size>limit){child.kill('SIGKILL');finish(new InstallRefusal('GIT_OUTPUT'));}else chunks.push(chunk);});
  // Do not copy git stderr, which may contain private environment/path content, into evidence.
  child.stderr.resume();child.stdin.on('error',()=>{});
  child.on('close',code=>finish(code===0?null:new InstallRefusal('GIT_OPERATION'),Buffer.concat(chunks)));
  child.stdin.end(input);
 });
}
async function objectAt(repo,commit,relative,{optional=false,limit=1024*1024}={}){
 const listing=await git(repo,['ls-tree','-z',commit,'--',relative]);
 if(listing.length===0){insist(optional,'BASE_FILE_MISSING');return null;}
 const entries=listing.toString('utf8').split('\0').filter(Boolean);
 insist(entries.length===1,'BASE_FILE_TYPE');
 const match=entries[0].match(/^([0-7]{6}) (blob|tree|commit) ([a-f0-9]{40})\t(.+)$/);
 insist(match&&match[1]==='100644'&&match[2]==='blob'&&match[4]===relative,'BASE_FILE_TYPE');
 const sizeText=(await git(repo,['cat-file','-s',match[3]],{limit:128})).toString().trim();
 insist(/^[0-9]+$/.test(sizeText)&&Number(sizeText)>0&&Number(sizeText)<=limit,'BASE_FILE_SIZE');
 const bytes=await git(repo,['cat-file','blob',match[3]],{limit});
 insist(bytes.length===Number(sizeText),'BASE_FILE_SIZE');return {bytes,blob:match[3]};
}
async function directoryAt(repo,commit,relative,{required=false}={}){
 const listing=(await git(repo,['ls-tree','-z',commit,'--',relative])).toString('utf8');
 if(!listing){insist(!required,'BASE_FILE_MISSING');return;}
 insist(new RegExp('^040000 tree [a-f0-9]{40}\\t'+relative+'\\0$').test(listing),'BASE_FILE_TYPE');
}
async function reference(repo,ref){
 insist(typeof ref==='string'&&ref.length<=256&&/^refs\/(heads|remotes)\/[A-Za-z0-9._/-]+$/.test(ref),'BASE_REFERENCE');
 await git(repo,['check-ref-format',ref]);
 const value=(await git(repo,['rev-parse','--verify',ref+'^{commit}'],{limit:128})).toString().trim();
 insist(COMMIT.test(value),'BASE_REFERENCE');return value;
}
const MESSAGES={
 RUNNING:'An exact-base installation proposal is being checked. No update has been installed.',
 PROPOSED:'A development-only exact-base patch is ready for independent review. It has not been installed or published.',
 ALREADY_ADMITTED:'The existing dated record is retained byte for byte. This observation creates no update.',
 REFUSED:'The installation proposal was refused. Existing references, index, working tree and published readings were not changed.'
};
async function report(root,value,{initial=false}={}){
 const bytes=encode(value);insist(bytes.length<32768,'REPORT_SIZE');
 const file=path.join(root,initial?'proposal.json':'.proposal-final.json');
 await fs.writeFile(file,bytes,{flag:'wx',mode:0o600});
 if(!initial)await fs.rename(file,path.join(root,'proposal.json'));
}
const SUPPORTED=new Set(['INPUT_PATH','INPUT_SIZE','INPUT_EXTRA','INPUT_DIGEST','MANIFEST_INVALID','SOURCE_BINDING','RECEIPT_BINDING','STAGE_CONTRACT','GIT_OPERATION','GIT_OUTPUT','BASE_FILE_MISSING','BASE_FILE_TYPE','BASE_FILE_SIZE','BASE_REFERENCE','BASE_CHANGED','BASE_KEY','CLOCK_INVALID','DATE_ROLLED_OVER','ADMITTED_RECORD_INVALID','CORRECTION_REVIEW_REQUIRED','SOURCE_CONFLICT','REVISION_REVIEW_REQUIRED','PATCH_SCOPE','REPORT_SIZE']);

/** No inputs from a browser profile or working-tree data are read. The only Git
 * writes are new content-addressed objects; no refs, live index or worktree move.
 * Injected time and verification keys exist only for synthetic builder tests.
 */
export async function proposeDailyInstall({input,repository,baseCommit,baseRef,output,requestedDate=null,now=()=>new Date(),publicKey=PUBLICATION_KEY,keyId=KEY_ID}={}){
 const started=clock(now),date=requestedDate??amritsarDate(started);
 insist(PUBLICATION_MODE==='DEVELOPMENT_PREVIEW'&&typeof baseCommit==='string'&&COMMIT.test(baseCommit),'BASE_REFERENCE');
 insist(validDate(date)&&date<=amritsarDate(started),'DATE_SCHEMA');
 insist(typeof input==='string'&&typeof output==='string'&&typeof repository==='string','INPUT_PATH');
 const repo=await fs.realpath(repository),inputRoot=await fs.realpath(input),destination=path.resolve(output);
 const parent=await fs.realpath(path.dirname(destination)),root=path.join(parent,path.basename(destination));
 const top=await fs.realpath((await git(repo,['rev-parse','--show-toplevel'],{limit:16384})).toString().trim());
 insist(top===repo,'REPOSITORY_ROOT');
 const gitDir=await fs.realpath((await git(repo,['rev-parse','--absolute-git-dir'],{limit:16384})).toString().trim());
 const commonDir=await fs.realpath((await git(repo,['rev-parse','--path-format=absolute','--git-common-dir'],{limit:16384})).toString().trim());
 insist([repo,gitDir,commonDir,inputRoot].every(boundary=>!within(boundary,root)&&!within(root,boundary)),'OUTPUT_PATH');
 await reference(repo,baseRef); // Validate bounded reference metadata before writing a report.
 // Exclusive run ownership. A crash leaves RUNNING with proposalReady=false.
 await fs.mkdir(root,{mode:0o700});
 const record={schema:'glp.hukamnama.install-proposal.v1',mode:'DEVELOPMENT_PREVIEW',requestedDate:date,requestedAsToday:requestedDate===null,timezone:'Asia/Kolkata',startedAtUtc:started.toISOString(),finishedAtUtc:null,status:'RUNNING',code:null,message:MESSAGES.RUNNING,proposalReady:false,publicationApproved:false,published:false,base:{commit:baseCommit,reference:baseRef,tree:null},proposedTree:null,existing:null,source:null,changes:[],patch:null,evidence:null};
 await report(root,record,{initial:true});let temporary;
 try{
  insist(await reference(repo,baseRef)===baseCommit,'BASE_CHANGED');
  record.base.tree=(await git(repo,['rev-parse','--verify',baseCommit+'^{tree}'],{limit:128})).toString().trim();
  insist(COMMIT.test(record.base.tree),'BASE_REFERENCE');
  await directoryAt(repo,baseCommit,'hukamnama',{required:true});
  for(const directory of ['hukamnama/events','hukamnama/sources'])await directoryAt(repo,baseCommit,directory);
  const key=await objectAt(repo,baseCommit,'hukamnama/publication-key.mjs',{limit:16384});
  insist(key.bytes.equals(await fs.readFile(path.join(ROOT,'hukamnama/publication-key.mjs'))),'BASE_KEY');
  const captured=await inspectSealedCandidate(input,date,{now:started,publicKey,keyId});
  record.source={id:captured.source.id,textSha256:captured.source.textSha256,sha256:sha(captured.sourceBytes),occurrences:captured.source.occurrences.length};
  temporary=await fs.mkdtemp(path.join(os.tmpdir(),'glp-daily-proposal-'));
  const app=path.join(temporary,'admitted');await fs.mkdir(app);
  const existingEvent=await objectAt(repo,baseCommit,'hukamnama/'+captured.eventPath,{optional:true,limit:512*1024});
  if(existingEvent){
   let existing;try{existing=await decodeEvent(array(existingEvent.bytes),date,{now:started,publicKey,keyId});}catch{throw new InstallRefusal('ADMITTED_RECORD_INVALID');}
   const existingSource=await objectAt(repo,baseCommit,'hukamnama/'+existing.source.path.slice(2),{limit:1024*1024});
   await fs.mkdir(path.join(app,'events'));await fs.mkdir(path.join(app,'sources'));
   await fs.writeFile(path.join(app,captured.eventPath),existingEvent.bytes);
   await fs.writeFile(path.join(app,existing.source.path.slice(2)),existingSource.bytes);
  }
  const decision=await compareAdmitted({payload:captured.event,sourceBytes:captured.sourceBytes},{root:app,now:started,publicKey,keyId});
  record.existing=decision.existing;
  insist(decision.status!=='CORRECTION_REVIEW_REQUIRED','CORRECTION_REVIEW_REQUIRED');
  if(decision.status==='ALREADY_ADMITTED'){
   record.status='ALREADY_ADMITTED';record.proposedTree=record.base.tree;
  }else{
   insist(decision.status==='CANDIDATE_PREPARED','ADMITTED_RECORD_INVALID');
   insist(captured.event.revision===1,'REVISION_REVIEW_REQUIRED');
   const runtimeSource='hukamnama/'+captured.sourcePath,runtimeEvent='hukamnama/'+captured.eventPath;
   const existingSource=await objectAt(repo,baseCommit,runtimeSource,{optional:true});
   insist(!existingSource||existingSource.bytes.equals(captured.sourceBytes),'SOURCE_CONFLICT');
   const additions=[...(existingSource?[]:[{path:runtimeSource,bytes:captured.sourceBytes}]),{path:runtimeEvent,bytes:captured.eventBytes}];
   const index=path.join(temporary,'index');await git(repo,['read-tree',baseCommit],{index});
   for(const file of additions){
    const blob=(await git(repo,['hash-object','-w','--stdin'],{input:file.bytes,limit:128})).toString().trim();
    insist(COMMIT.test(blob),'GIT_OPERATION');
    await git(repo,['update-index','--add','--cacheinfo','100644',blob,file.path],{index});
    record.changes.push({path:file.path,before:null,after:{gitBlob:blob,sha256:sha(file.bytes),bytes:file.bytes.length}});
   }
   record.proposedTree=(await git(repo,['write-tree'],{index,limit:128})).toString().trim();
   insist(COMMIT.test(record.proposedTree),'GIT_OPERATION');
   const changed=(await git(repo,['diff-tree','--no-commit-id','--name-only','-r','-z',record.base.tree,record.proposedTree])).toString('utf8').split('\0').filter(Boolean).sort();
   insist(JSON.stringify(changed)===JSON.stringify(additions.map(f=>f.path).sort()),'PATCH_SCOPE');
   for(const file of additions){const result=await objectAt(repo,record.proposedTree,file.path);insist(result.bytes.equals(file.bytes),'PATCH_SCOPE');}
   const patch=await git(repo,['diff-tree','--no-commit-id','--binary','--full-index','--no-ext-diff','--no-textconv','--no-color','--src-prefix=a/','--dst-prefix=b/','-p',record.base.tree,record.proposedTree]);
   const replayIndex=path.join(temporary,'replay-index');
   await git(repo,['read-tree',baseCommit],{index:replayIndex});
   await git(repo,['apply','--cached','--whitespace=nowarn','--'],{index:replayIndex,input:patch});
   const replayed=(await git(repo,['write-tree'],{index:replayIndex,limit:128})).toString().trim();
   insist(replayed===record.proposedTree,'PATCH_SCOPE');
   await fs.writeFile(path.join(root,'change.patch'),patch,{flag:'wx',mode:0o600});
   record.patch={path:'change.patch',sha256:sha(patch),bytes:patch.length,replayVerifiedTree:record.proposedTree};record.status='PROPOSED';
  }
  await fs.writeFile(path.join(root,'original-receipt.json'),captured.receiptBytes,{flag:'wx',mode:0o600});
  record.evidence={sealedManifestSha256:captured.manifestSha256,receipt:{path:'original-receipt.json',sha256:sha(captured.receiptBytes)}};
  const finished=clock(now);insist(+finished>=+started,'CLOCK_INVALID');
  if(requestedDate===null)insist(amritsarDate(finished)===date,'DATE_ROLLED_OVER');
  insist(await reference(repo,baseRef)===baseCommit,'BASE_CHANGED');
  record.finishedAtUtc=finished.toISOString();record.proposalReady=record.status==='PROPOSED';record.message=MESSAGES[record.status];
  await report(root,record);return record;
 }catch(error){
  record.status='REFUSED';record.code=SUPPORTED.has(error.code)?error.code:'INSTALL_REFUSED';record.message=MESSAGES.REFUSED;record.proposalReady=false;
  record.finishedAtUtc=clock(now).toISOString();
  // Any partial evidence remains explicitly non-ready. Never remove user input or a base file.
  await report(root,record);return record;
 }finally{if(temporary)await fs.rm(temporary,{recursive:true,force:true});}
}

async function main(){
 const args=process.argv.slice(2),options={};
 for(let i=0;i<args.length;i++){
  if(args[i]==='--development-candidate'){insist(!options.development,'CLI_ARGUMENT');options.development=true;continue;}
  insist(['--input','--repository','--base','--ref','--output','--date'].includes(args[i])&&args[i+1]&&!args[i+1].startsWith('--'),'CLI_ARGUMENT');
  const key=args[i].slice(2);insist(!Object.hasOwn(options,key),'CLI_ARGUMENT');options[key]=args[++i];
 }
 insist(options.development,'CLI_ARGUMENT');
 const result=await proposeDailyInstall({input:options.input,repository:options.repository,baseCommit:options.base,baseRef:options.ref,output:options.output,requestedDate:options.date??null});
 console.log(JSON.stringify(result));return ['PROPOSED','ALREADY_ADMITTED'].includes(result.status)?0:2;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().then(code=>{process.exitCode=code;}).catch(()=>{console.error(JSON.stringify({status:'REFUSED',message:'No installation proposal was completed. Existing records were not changed.',proposalReady:false,publicationApproved:false,published:false}));process.exitCode=2;});
