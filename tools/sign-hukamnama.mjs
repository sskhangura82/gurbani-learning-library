// Artifact-only sealing. The library's signature protects transport integrity;
// it is never an SGPC signature or permission to publish a reading.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash,createPrivateKey,createPublicKey,sign} from 'node:crypto';
import {decodeEvent,decodeSource} from '../hukamnama/delivery.mjs';
import {PUBLICATION_KEY,KEY_ID,PUBLICATION_MODE} from '../hukamnama/publication-key.mjs';
import {parseStrictJSON} from '../hukamnama/json.mjs';
import {validateStage} from './hukamnama-stage-contract.mjs';

const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=bytes=>parseStrictJSON(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
const encode=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const requireThat=(condition,message)=>{if(!condition)throw Error(message);};
const publicIdentity=jwk=>JSON.stringify(['kty','crv','x','y'].map(k=>jwk[k]));
const originalKeys=['date','ang','hukamnama_time','gheading1','gheading2','ghukamnama','gfooter1','gfooter2'];

export async function sealPayload({payloadBytes,sourceBytes,receiptBytes,privateKey,publicKey=PUBLICATION_KEY,keyId=KEY_ID,now=new Date()}){
 requireThat(PUBLICATION_MODE==='DEVELOPMENT_PREVIEW','A reviewed publisher configuration is required.');
 requireThat(payloadBytes.length>0&&payloadBytes.length<=64*1024,'Invalid event payload size.');
 requireThat(sourceBytes.length>0&&sourceBytes.length<=1024*1024,'Invalid original source size.');
 requireThat(receiptBytes.length>0&&receiptBytes.length<=256*1024,'Invalid original-only receipt size.');
 const payload=json(payloadBytes),receipt=json(receiptBytes);
 validateStage({payload,source:json(sourceBytes),receipt});
 requireThat(payload.publicationApproved===false&&payload.status==='DIGITAL_TEXT_VERIFIED_PREVIEW','Only unapproved development candidates may be sealed by this tool.');
 requireThat(payload.lessons&&Object.keys(payload.lessons).sort().join(',')==='detailed,learning,simple'&&Object.values(payload.lessons).every(v=>v===null),'This publisher has no qualified explanatory content.');
 requireThat(receipt.schema==='glp.hukamnama.receipt.v1'&&receipt.requestedDate===payload.date&&receipt.timezone==='Asia/Kolkata','Receipt identity differs from the dated event.');
 requireThat(sha(receiptBytes)===payload.officialReceiptSha256,'Original receipt bytes do not match the event.');
 const original=receipt.original;
 requireThat(original&&typeof original==='object'&&!Array.isArray(original)&&Object.keys(original).sort().join(',')===originalKeys.slice().sort().join(','),'Receipt must carry only the original-text allowlist.');
 requireThat(original.date===payload.date,'Official date does not match the requested event.');
 for(const name of ['gheading1','gheading2','ghukamnama','gfooter1','gfooter2'])requireThat(typeof original[name]==='string','Invalid original text field.');
 const originalText=[original.gheading1,original.gheading2,original.ghukamnama].filter(v=>v.length).join(' ');
 requireThat(originalText.length>0&&sha(Buffer.from(originalText))===payload.officialOriginalSha256,'Official original does not match the complete source identity.');
 requireThat(receipt.officialOriginalSha256===payload.officialOriginalSha256,'Receipt original digest differs.');
 requireThat(receipt.checkedAtUtc===payload.checkedAtUtc,'Receipt retrieval time differs.');
 const privateObject=typeof privateKey==='string'||Buffer.isBuffer(privateKey)?createPrivateKey(privateKey):privateKey;
 requireThat(publicIdentity(createPublicKey(privateObject).export({format:'jwk'}))===publicIdentity(publicKey),'Private key does not match the pinned public key.');
 const signature=sign('sha256',payloadBytes,{key:privateObject,dsaEncoding:'ieee-p1363'});
 requireThat(signature.length===64,'Unexpected signature encoding.');
 const envelope=encode({schema:'glp.hukamnama.envelope.v1',keyId,payload:Buffer.from(payloadBytes).toString('base64'),signature:signature.toString('base64')});
 const exactArrayBuffer=bytes=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
 const event=await decodeEvent(exactArrayBuffer(envelope),payload.date,{now,publicKey,keyId});
 const source=await decodeSource(exactArrayBuffer(sourceBytes),event);
 requireThat(/^[1-9][0-9]{0,3}$/.test(String(original.ang))&&Number(original.ang)===source.angStart,'The official receipt Ang differs from the complete source start.');
 requireThat(original.hukamnama_time===event.officialDisplayedTime,'The official receipt publication time differs from the dated event.');
 requireThat(source.occurrences.map(line=>line.text).join(' ')===originalText,'Complete official text and ordered canonical source differ.');
 return {envelope,event,source};
}

async function readBounded(file,max){
 const stat=await fs.lstat(file);
 requireThat(stat.isFile()&&!stat.isSymbolicLink()&&stat.size>0&&stat.size<=max,'Expected a bounded regular artifact file.');
 return fs.readFile(file);
}
function safeInput(root,relative,pattern){
 requireThat(typeof relative==='string'&&pattern.test(relative),'Unexpected input artifact path.');
 return path.join(root,relative);
}
export async function sealIngest({input,output,keyPath,now=new Date()}){
 const root=await fs.realpath(input),destination=path.resolve(output);
 try{await fs.lstat(destination);throw Error('Output already exists; existing dated artifacts are never overwritten.');}catch(error){if(error.code!=='ENOENT')throw error;}
 const manifest=json(await readBounded(path.join(root,'manifest.json'),16*1024));
 requireThat(manifest.schema==='glp.hukamnama.ingest-manifest.v1'&&manifest.publicationApproved===false,'Unsupported staging manifest.');
 const patterns={source:/^sources\/[0-9a-f]{64}\.json$/,payload:/^events\/\d{4}-\d{2}-\d{2}\.payload\.json$/,receipt:/^receipts\/\d{4}-\d{2}-\d{2}\.original\.json$/};
 const limits={source:1024*1024,payload:64*1024,receipt:256*1024},bytes={};
 for(const kind of ['source','payload','receipt']){
  const entry=manifest[kind];requireThat(entry&&/^[0-9a-f]{64}$/.test(entry.sha256),'Missing staging artifact identity.');
  const name=safeInput(root,entry.path,patterns[kind]);
  requireThat((await fs.realpath(name)).startsWith(root+path.sep),'Staging path escapes its directory.');
  bytes[kind]=await readBounded(name,limits[kind]);requireThat(sha(bytes[kind])===entry.sha256,'Staging artifact digest differs: '+kind);
 }
 const stat=await fs.lstat(keyPath);
 requireThat(stat.isFile()&&!stat.isSymbolicLink()&&(stat.mode&0o077)===0,'Private key must be a regular file readable only by its owner.');
 const privateKey=await readBounded(keyPath,16*1024);
 const sealed=await sealPayload({payloadBytes:bytes.payload,sourceBytes:bytes.source,receiptBytes:bytes.receipt,privateKey,now});
 requireThat(manifest.date===sealed.event.date,'Staging manifest date differs.');
 requireThat(manifest.source.path==='sources/'+sealed.source.textSha256+'.json','Source filename differs from complete text identity.');
 requireThat(manifest.payload.path==='events/'+sealed.event.date+'.payload.json'&&manifest.receipt.path==='receipts/'+sealed.event.date+'.original.json','Dated staging filenames differ.');
 await fs.mkdir(path.dirname(destination),{recursive:true});
 const staging=await fs.mkdtemp(path.join(path.dirname(destination),'.hukamnama-seal-'));
 try{
  for(const directory of ['sources','events','receipts'])await fs.mkdir(path.join(staging,directory));
  const files=[
   {path:manifest.source.path,bytes:bytes.source},
   {path:'events/'+sealed.event.date+'.json',bytes:sealed.envelope},
   {path:manifest.receipt.path,bytes:bytes.receipt}
  ];
  for(const file of files)await fs.writeFile(path.join(staging,file.path),file.bytes,{flag:'wx'});
  const record={schema:'glp.hukamnama.sealed-candidate.v1',date:sealed.event.date,keyId:KEY_ID,mode:PUBLICATION_MODE,publicationApproved:false,sgpcSignature:false,files:files.map(f=>({path:f.path,sha256:sha(f.bytes)}))};
  await fs.writeFile(path.join(staging,'manifest.json'),encode(record),{flag:'wx'});
  await fs.rename(staging,destination);
  return record;
 }catch(error){await fs.rm(staging,{recursive:true,force:true});throw error;}
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const args=process.argv.slice(2),options={};
  for(let i=0;i<args.length;i++){
   if(args[i]==='--development-candidate'){options.development=true;continue;}
   if(!['--input','--output','--key'].includes(args[i])||!args[i+1]||args[i+1].startsWith('--'))throw Error('Usage: node tools/sign-hukamnama.mjs --input STAGING --output NEW_DIRECTORY --key PRIVATE_KEY --development-candidate');
   const key=args[i].slice(2);if(Object.hasOwn(options,key))throw Error('Duplicate option.');options[key]=args[++i];
  }
  requireThat(options.development&&options.input&&options.output&&options.key,'Explicit development candidate inputs and a new output directory are required.');
  const result=await sealIngest({input:options.input,output:options.output,keyPath:options.key});
  console.log(JSON.stringify({date:result.date,output:path.resolve(options.output),mode:result.mode,publicationApproved:false}));
 }catch(error){console.error('Hukamnama candidate refused: '+error.message);process.exitCode=1;}
}
