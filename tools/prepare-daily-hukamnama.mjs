#!/usr/bin/env node
/* One bounded original-only capture, never a publisher. Repeated observations
   must not replace a dated envelope with a fresh receipt at the same revision. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {validDate,amritsarDate} from '../hukamnama/core.mjs';
import {parseStrictJSON} from '../hukamnama/json.mjs';
import {decodeEvent,decodeSource} from '../hukamnama/delivery.mjs';
import {validateStage} from './hukamnama-stage-contract.mjs';

const ROOT=fileURLToPath(new URL('../',import.meta.url));
const APP=path.join(ROOT,'hukamnama'),exec=promisify(execFile);
const HEX=/^[a-f0-9]{64}$/;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const encode=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const parse=bytes=>parseStrictJSON(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
const buffer=bytes=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
const within=(parent,child)=>child===parent||child.startsWith(parent+path.sep);
const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const sameKeys=(value,keys)=>plain(value)&&Object.keys(value).length===keys.length&&keys.every(k=>Object.hasOwn(value,k));
export class PreparationRefusal extends Error {
 constructor(code){super(code);this.code=code;}
}
const insist=(condition,code)=>{if(!condition)throw new PreparationRefusal(code);};
function clock(now){const value=new Date(typeof now==='function'?now():now);insist(Number.isFinite(+value),'CLOCK_INVALID');return value;}
const stamp=value=>value.toISOString();

// Codes are from the existing importer. Arbitrary child output/exception text
// is deliberately not copied into a report or workflow summary.
const UNAVAILABLE=new Set(['SOURCE_UNAVAILABLE','OFFICIAL_UNAVAILABLE','OFFICIAL_DATE_MISMATCH']);
const DISCREPANCY=new Set(['SOURCE_REDIRECT','SOURCE_URL','SOURCE_SIZE','SOURCE_ENCODING','SOURCE_HTTP','SOURCE_QUERY','ORIGINAL_ENCODING','ENCODING','DUPLICATE_JSON_KEY','JSON_SCHEMA','PORTAL_SCHEMA','VISIBLE_STRUCTURED_MISMATCH','OFFICIAL_SOURCE_CONFLICT','ARCHIVE_SCHEMA','ORIGINAL_SCHEMA','ANG_SCHEMA','FULL_TEXT_MISMATCH','AMBIGUOUS_SELECTION','START_BOUNDARY','END_BOUNDARY','HEADING_BOUNDARY','WITNESS_BOUND','WITNESS_HEADING','WITNESS_SCHEMA','TIME_SCHEMA','VISIBLE_DATE','POLICY_PIN_MISMATCH','INTERNAL_COMPARISON','DATE_SCHEMA','FUTURE_DATE']);
const LOCAL=new Set(['OUTPUT_EXISTS','OUTPUT_PARENT','OUTPUT_PATH','OUTPUT_BUSY','STAGING_IO']);
const MESSAGES={
 RUNNING:'Preparation has started. No candidate has been admitted or published.',
 CANDIDATE_PREPARED:'An exact-date unsigned original-only candidate is ready for independent review. It has not been published.',
 ALREADY_ADMITTED:'The observed original matches the existing dated record. Keep its exact envelope and source bytes; do not refresh its revision or receipt.',
 SOURCE_UNAVAILABLE:'The requested official selection could not be obtained and checked. No other date or reading was substituted.',
 SOURCE_REVIEW_REQUIRED:'A source discrepancy or unsupported source contract needs review. No reading was replaced.',
 CORRECTION_REVIEW_REQUIRED:'The new observation differs from the existing dated source or recorded publication time. A deliberate correction review is required.',
 ADMITTED_RECORD_INVALID:'The existing dated record or its complete source could not be verified. It was preserved unchanged.',
 DATE_ROLLED_OVER:'Amritsar entered a new day while this capture ran. Retained evidence belongs to the requested date and is not today\'s ready reading.',
 LOCAL_FAILURE:'Preparation did not finish safely. Existing readings were not changed.'
};

async function readFileInside(root,relative,limit){
 insist(typeof relative==='string'&&!path.isAbsolute(relative)&&!relative.split('/').some(p=>!p||p==='.'||p==='..'),'ARTIFACT_PATH');
 let current=root;
 for(const [index,component] of relative.split('/').entries()){
  current=path.join(current,component);
  const stat=await fs.lstat(current);
  insist(!stat.isSymbolicLink()&&(index===relative.split('/').length-1?stat.isFile():stat.isDirectory()),'ARTIFACT_PATH');
 }
 const stat=await fs.stat(current);
 insist(stat.size>0&&stat.size<=limit,'ARTIFACT_SIZE');
 const bytes=await fs.readFile(current);
 insist(bytes.length===stat.size&&bytes.length<=limit,'ARTIFACT_SIZE');
 return bytes;
}
async function strictTree(root,allowed){
 async function visit(directory,prefix=''){
  const entries=await fs.readdir(directory,{withFileTypes:true});
  for(const entry of entries){
   const name=prefix+entry.name;
   insist(!entry.isSymbolicLink(),'ARTIFACT_PATH');
   if(entry.isDirectory()){
    insist(allowed.some(file=>file.startsWith(name+'/')),'ARTIFACT_EXTRA');
    await visit(path.join(directory,entry.name),name+'/');
   }else insist(entry.isFile()&&allowed.includes(name),'ARTIFACT_EXTRA');
  }
 }
 await visit(root);
}

/** No signing key is read; stage hashes and the existing source contract must agree. */
export async function inspectCapture(input,date,{now=new Date()}={}){
 const stat=await fs.lstat(input);insist(stat.isDirectory()&&!stat.isSymbolicLink(),'ARTIFACT_PATH');
 const root=await fs.realpath(input);
 const manifestBytes=await readFileInside(root,'manifest.json',16*1024),manifest=parse(manifestBytes);
 insist(sameKeys(manifest,['schema','date','source','payload','receipt','publicationApproved'])&&manifest.schema==='glp.hukamnama.ingest-manifest.v1'&&manifest.date===date&&manifest.publicationApproved===false,'MANIFEST_INVALID');
 const patterns={source:/^sources\/[a-f0-9]{64}\.json$/,payload:/^events\/\d{4}-\d{2}-\d{2}\.payload\.json$/,receipt:/^receipts\/\d{4}-\d{2}-\d{2}\.original\.json$/};
 const limits={source:1024*1024,payload:64*1024,receipt:256*1024},bytes={},values={};
 for(const kind of ['source','payload','receipt']){
  const item=manifest[kind];
  insist(sameKeys(item,['path','sha256'])&&patterns[kind].test(item.path)&&HEX.test(item.sha256),'MANIFEST_INVALID');
  bytes[kind]=await readFileInside(root,item.path,limits[kind]);
  insist(sha(bytes[kind])===item.sha256,'ARTIFACT_DIGEST');values[kind]=parse(bytes[kind]);
 }
 const {payload,source,receipt}=values;
 insist(payload.date===date&&manifest.payload.path==='events/'+date+'.payload.json'&&manifest.receipt.path==='receipts/'+date+'.original.json','CAPTURE_DATE');
 insist(manifest.source.path==='sources/'+source.textSha256+'.json'&&payload.source.sha256===sha(bytes.source)&&payload.officialReceiptSha256===sha(bytes.receipt),'ARTIFACT_BINDING');
 try{validateStage(values);}catch{throw new PreparationRefusal('STAGE_CONTRACT');}
 insist(Date.parse(payload.checkedAtUtc)<=+clock(now)+300000,'CAPTURE_CLOCK');
 await strictTree(root,['manifest.json',...['source','payload','receipt'].map(k=>manifest[k].path)]);
 return {payload,source,receipt,sourceBytes:bytes.source,summary:{manifestSha256:sha(manifestBytes),payloadSha256:sha(bytes.payload),receiptSha256:sha(bytes.receipt)},sourceSummary:{id:source.id,textSha256:source.textSha256,sha256:sha(bytes.source),occurrences:source.occurrences.length,angStart:source.angStart,angEnd:source.angEnd}};
}

/** Reuse exact admitted bytes; never write the reader's event/source directories. */
export async function compareAdmitted(capture,{root=APP,now=new Date(),publicKey,keyId}={}){
 const rootStat=await fs.lstat(root);insist(rootStat.isDirectory()&&!rootStat.isSymbolicLink(),'ADMITTED_RECORD_INVALID');
 const resolved=await fs.realpath(root),relative='events/'+capture.payload.date+'.json';
 try{
  const directory=await fs.lstat(path.join(resolved,'events'));
  insist(directory.isDirectory()&&!directory.isSymbolicLink(),'ADMITTED_RECORD_INVALID');
 }catch(error){if(error.code==='ENOENT')return {status:'CANDIDATE_PREPARED',existing:null};throw new PreparationRefusal('ADMITTED_RECORD_INVALID');}
 try{await fs.lstat(path.join(resolved,relative));}catch(error){
  if(error.code==='ENOENT')return {status:'CANDIDATE_PREPARED',existing:null};
  throw new PreparationRefusal('ADMITTED_RECORD_INVALID');
 }
 try{
  const eventBytes=await readFileInside(resolved,relative,512*1024);
  const event=await decodeEvent(buffer(eventBytes),capture.payload.date,{now,publicKey,keyId});
  const sourceBytes=await readFileInside(resolved,event.source.path.slice(2),1024*1024);
  await decodeSource(buffer(sourceBytes),event);
  const fields=['id','date','timezone','venue','ritual','sourceUrl','archiveUrl','officialPublishedDate','officialOriginalSha256'];
  const same=fields.every(k=>event[k]===capture.payload[k])&&['id','edition','textSha256','sha256','path'].every(k=>event.source[k]===capture.payload.source[k])&&sourceBytes.equals(capture.sourceBytes)&&(capture.payload.officialDisplayedTime===null||capture.payload.officialDisplayedTime===event.officialDisplayedTime);
  const existing={eventSha256:sha(eventBytes),sourceSha256:sha(sourceBytes),revision:event.revision,decision:same?'KEEP_EXISTING_BYTES':'REVIEW_CORRECTION'};
  return {status:same?'ALREADY_ADMITTED':'CORRECTION_REVIEW_REQUIRED',existing};
 }catch(error){if(error.code==='ADMITTED_RECORD_INVALID')throw error;throw new PreparationRefusal('ADMITTED_RECORD_INVALID');}
}

async function acquireOfficial({date,output}){
 try{
  await exec('python3',[path.join(ROOT,'tools/ingest-hukamnama.py'),'--date',date,'--out',output],{cwd:ROOT,timeout:330000,maxBuffer:65536,windowsHide:true});
 }catch(error){
  let code='IMPORTER_FAILED';
  try{
   const refusal=parse(Buffer.from(error.stderr||''));
   if(sameKeys(refusal,['status','code','message','promotableArtifact'])&&refusal.status==='REFUSED'&&refusal.promotableArtifact===false&&(UNAVAILABLE.has(refusal.code)||DISCREPANCY.has(refusal.code)||LOCAL.has(refusal.code)))code=refusal.code;
  }catch{}
  throw new PreparationRefusal(code);
 }
}

function refusalStatus(error){
 if(UNAVAILABLE.has(error.code))return 'SOURCE_UNAVAILABLE';
 if(DISCREPANCY.has(error.code))return 'SOURCE_REVIEW_REQUIRED';
 if(error.code==='ADMITTED_RECORD_INVALID')return 'ADMITTED_RECORD_INVALID';
 return 'LOCAL_FAILURE';
}
async function writeReport(root,record,{initial=false}={}){
 const bytes=encode(record);insist(bytes.length<=16384,'REPORT_SIZE');
 const temporary=path.join(root,initial?'run.json':'.run-final.json');
 await fs.writeFile(temporary,bytes,{flag:'wx',mode:0o600});
 if(!initial)await fs.rename(temporary,path.join(root,'run.json'));
}

/** Dependency injection is for synthetic tests; the CLI always uses the official importer. */
export async function prepareDaily({output,requestedDate=null,now=()=>new Date(),sourceCommit=null,admittedRoot=APP,acquire=acquireOfficial,publicKey,keyId}={}){
 const started=clock(now),today=amritsarDate(started),date=requestedDate??today;
 insist(validDate(date)&&date<=today,'DATE_SCHEMA');
 insist(sourceCommit===null||typeof sourceCommit==='string'&&/^[a-f0-9]{40}$/.test(sourceCommit),'SOURCE_COMMIT');
 insist(typeof output==='string'&&output.length>0,'OUTPUT_PATH');
 const destination=path.resolve(output),parent=await fs.realpath(path.dirname(destination)),root=path.join(parent,path.basename(destination));
 const admitted=await fs.realpath(admittedRoot);
 insist(!within(admitted,root)&&!within(root,admitted),'OUTPUT_PATH');
 // Atomic ownership claim: another run at this path is refused before networking.
 await fs.mkdir(root,{mode:0o700});
 const record={schema:'glp.hukamnama.preparation-run.v1',mode:'UNSIGNED_REVIEW_ONLY',sourceCommit,requestedDate:date,requestedAsToday:requestedDate===null,timezone:'Asia/Kolkata',startedAtUtc:stamp(started),finishedAtUtc:null,endedAmritsarDate:null,status:'RUNNING',code:null,message:MESSAGES.RUNNING,candidateReady:false,publicationApproved:false,published:false,source:null,capture:null,existing:null};
 await writeReport(root,record,{initial:true});
 try{
  const capturePath=path.join(root,'capture');
  await acquire({date,output:capturePath,now:started});
  const checked=clock(now);insist(+checked>=+started,'CLOCK_INVALID');
  const capture=await inspectCapture(capturePath,date,{now:checked});
  record.source=capture.sourceSummary;record.capture=capture.summary;
  const decision=await compareAdmitted(capture,{root:admitted,now:checked,publicKey,keyId});
  record.status=decision.status;record.existing=decision.existing;
 }catch(error){
  record.status=refusalStatus(error);
  const supported=UNAVAILABLE.has(error.code)||DISCREPANCY.has(error.code)||LOCAL.has(error.code)||new Set(['ADMITTED_RECORD_INVALID','ARTIFACT_PATH','ARTIFACT_SIZE','ARTIFACT_EXTRA','MANIFEST_INVALID','ARTIFACT_DIGEST','ARTIFACT_BINDING','CAPTURE_DATE','CAPTURE_CLOCK','STAGE_CONTRACT','CLOCK_INVALID','IMPORTER_FAILED']).has(error.code);
  record.code=supported?error.code:'PREPARATION_FAILED';
 }
 const finished=clock(now);
 if(+finished<+started){record.status='LOCAL_FAILURE';record.code='CLOCK_INVALID';}
 record.finishedAtUtc=stamp(finished);record.endedAmritsarDate=amritsarDate(finished);
 if(record.requestedAsToday&&record.endedAmritsarDate!==date&&['CANDIDATE_PREPARED','ALREADY_ADMITTED'].includes(record.status)){
  record.status='DATE_ROLLED_OVER';record.code='DATE_ROLLED_OVER';
 }
 record.candidateReady=record.status==='CANDIDATE_PREPARED';record.message=MESSAGES[record.status];
 await writeReport(root,record);
 return record;
}

async function main(){
 const args=process.argv.slice(2),options={};
 for(let i=0;i<args.length;i++){
  insist(['--output','--date','--source-commit'].includes(args[i])&&args[i+1]&&!args[i+1].startsWith('--'),'CLI_ARGUMENT');
  const key=args[i].slice(2);insist(!Object.hasOwn(options,key),'CLI_ARGUMENT');options[key]=args[++i];
 }
 const record=await prepareDaily({output:options.output,requestedDate:options.date??null,sourceCommit:options['source-commit']??null});
 console.log(JSON.stringify(record));
 return ['CANDIDATE_PREPARED','ALREADY_ADMITTED'].includes(record.status)?0:2;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 main().then(code=>{process.exitCode=code;}).catch(()=>{
  console.error(JSON.stringify({status:'LOCAL_FAILURE',message:'No preparation report could be completed. Existing readings and previous run directories were not changed.',candidateReady:false,publicationApproved:false,published:false}));process.exitCode=2;
 });
}
