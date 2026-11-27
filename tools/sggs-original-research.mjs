// Research-only extraction and retrieval. No reader admission, interpretation or author inference.
import {createHash} from 'node:crypto';
import {readFile,lstat,readdir,realpath} from 'node:fs/promises';
import {resolve,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
import {spawnSync} from 'node:child_process';
import {search as knowledgeSearch} from '../knowledge/search.mjs';
export const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const SOURCE_COMMIT='34d2a7cab032c8ea24d21ff20f64653bd03766f4';
export const INVENTORY_SHA256='95692d4cf1daa8115c5a0581b04bee7379659ed058079dc8dc618deb3aebc1f2';
// This is set only after actual pinned witnesses have been reconstructed and recorded.
export const PROJECTION_CONTRACT_SHA256='1cecb2b130df6e214af165a3c01387344792c4ec600d196be02830ce28fcf74f';
export const sha256=value=>createHash('sha256').update(value).digest('hex');
export const gitBlob=value=>createHash('sha1').update(`blob ${value.byteLength}\0`).update(value).digest('hex');
export const jsonDigest=value=>sha256(JSON.stringify(value));
const decode=new TextDecoder('utf-8',{fatal:true});
const verifiedPackets=new WeakMap();
const FLAGS=Object.freeze({runtimeEligible:false,publicationReady:false,independentlyCollatedOccurrences:0,completeCompositionsAdmitted:0,qualifiedHumanReviewCount:0});
export class CorpusResearchError extends Error {constructor(code,message){super(message);this.name='CorpusResearchError';this.code=code;}}
const need=(ok,code,message)=>{if(!ok)throw new CorpusResearchError(code,message);};
const equal=(a,b,code,message)=>need(isDeepStrictEqual(a,b),code,message);
const keys=(value,expected,code)=>equal(Object.keys(value).sort(),expected.sort(),code,'Unexpected or missing fields.');
export function requireOutsideGitWorktree(parent){
 const probe=spawnSync('git',['-C',parent,'rev-parse','--show-toplevel'],{encoding:'utf8',env:{...process.env,LC_ALL:'C'}});
 need(!probe.error&&!probe.signal,'ENVIRONMENT_GUARD','Git environment detection failed; no output is permitted.');
 need(probe.status!==0,'OUTPUT_IN_GIT','Research artifacts must remain outside Git worktrees.');
 need(probe.status===128&&probe.stdout===''&&/^fatal: not a git repository \(or any of the parent directories\): \.git\s*$/u.test(probe.stderr),'ENVIRONMENT_GUARD','Could not establish that the destination is outside Git; no output is permitted.');
}
export async function loadInventory(){
 const bytes=await readFile(resolve(ROOT,'content-intake/sggs/file-inventory.json'));
 need(sha256(bytes)===INVENTORY_SHA256,'INVENTORY_CHANGED','The fixed corpus inventory changed.');
 const inventory=JSON.parse(decode.decode(bytes));
 need(inventory.commit===SOURCE_COMMIT&&inventory.fileCount===1430&&inventory.files.length===1430,'INVENTORY_CHANGED','The complete pinned inventory is required.');
 return inventory;
}
function discrepancyIds(row){
 if(row.sourcePath==='corpus/ang-1377.md'&&row.textSha256==='f9312b97a0b94ce0412cc998d0289563b75d966001558a156d94f616d5ab01b0')return ['og-location-1377-row002'];
 if(row.sourcePath==='corpus/ang-1377.md'&&row.textSha256==='91d90022bf844f693cb06d761e91db53a45fb1c2009e532803a77e1cccfe970e')return ['farid-heading-terminal-danda'];
 return [];
}
export function parsePinnedPage(bytes,descriptor){
 need(bytes instanceof Uint8Array,'SOURCE_BYTES','Original source bytes are required.');
 need(/^corpus\/ang-\d{4}\.md$/.test(descriptor.path)&&descriptor.ang===Number(/ang-(\d{4})/.exec(descriptor.path)[1]),'SOURCE_PATH','Unexpected source-file locator.');
 need(bytes.byteLength===descriptor.bytes&&gitBlob(bytes)===descriptor.gitBlob,'SOURCE_BYTES','Source size or pinned Git blob differs: '+descriptor.path);
 let text;try{text=decode.decode(bytes);}catch{throw new CorpusResearchError('SOURCE_ENCODING','Source is not valid UTF-8.');}
 const front=/^---\n([\s\S]*?)\n---\n/.exec(text);
 need(front,'SOURCE_STRUCTURE','Source front matter is missing.');
 const angs=[...front[1].matchAll(/^ang: (\d+)$/gm)],counts=[...front[1].matchAll(/^lines: (\d+)$/gm)];
 need(angs.length===1&&counts.length===1&&Number(angs[0][1])===descriptor.ang,'SOURCE_STRUCTURE','Source header is inconsistent.');
 const matches=[...text.matchAll(/^<!-- LINE:([1-9]\d*) -->\n\*\*([^\r\n]+)\*\*$/gm)];
 need(matches.length===Number(counts[0][1])&&matches.length>0&&matches.length===[...text.matchAll(/<!-- LINE:/g)].length,'SOURCE_STRUCTURE','A source marker or declared occurrence is unparsed.');
 const fileSha256=sha256(bytes),within=new Map();
 const occurrences=matches.map((m,i)=>{
  const original=m[2];
  need(/[\u0a00-\u0a7f]/u.test(original)&&!/[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Arabic}<>*]/u.test(original),'ORIGINAL_FIELD','Unexpected text in the original-text field.');
  const start=Buffer.byteLength(text.slice(0,m.index+m[0].indexOf('\n**')+3),'utf8'),end=start+Buffer.byteLength(original,'utf8');
  need(decode.decode(bytes.slice(start,end))===original,'BYTE_CUSTODY','Original byte slice does not reproduce the occurrence.');
  const printedLine=Number(m[1]),withinLine=(within.get(printedLine)||0)+1;within.set(printedLine,withinLine);
  const textSha256=sha256(original);
  const row={id:'witness-og-'+jsonDigest([SOURCE_COMMIT,descriptor.path,fileSha256,start,end,textSha256]),sourcePath:descriptor.path,sourceByteStart:start,sourceByteEnd:end,sourceOrdinal:i+1,sourcePrintedLine:printedLine,sourceWithinLine:withinLine,text:original,textSha256};
  return {...row,discrepancyIds:discrepancyIds(row)};
 });
 return {page:{sourcePath:descriptor.path,reportedSourceAng:descriptor.ang,gitBlob:descriptor.gitBlob,rawBytes:bytes.byteLength,rawSha256:fileSha256,occurrenceCount:occurrences.length,projectionSha256:jsonDigest(occurrences)},occurrences};
}
export async function projectWitnessDirectory(witnessDir){
 const inventory=await loadInventory(),root=await realpath(witnessDir);
 const expected=inventory.files.map(x=>basename(x.path)).concat('capture.json').sort();
 equal((await readdir(root)).sort(),expected,'SOURCE_FILE_SET','The exact complete captured file set is required.');
 const capturePath=resolve(root,'capture.json'),captureStat=await lstat(capturePath);
 need(captureStat.isFile()&&!captureStat.isSymbolicLink()&&captureStat.size<2048,'CAPTURE_FILE','A regular bounded capture receipt is required.');
 const capture=JSON.parse(await readFile(capturePath,'utf8'));
 equal(capture,{schema:'glp.corpus-capture.v1',sourceCommit:SOURCE_COMMIT,inventorySha256:INVENTORY_SHA256,files:1430,rawBytes:inventory.totalBytes,complete:true},'CAPTURE_INCOMPLETE','A completed fixed capture is required.');
 const pages=[],occurrences=[];
 for(const descriptor of inventory.files){
  const path=resolve(root,basename(descriptor.path)),stat=await lstat(path);
  need(stat.isFile()&&!stat.isSymbolicLink()&&stat.size===descriptor.bytes,'SOURCE_FILE_TYPE','Only ordinary captured files are permitted.');
  const projected=parsePinnedPage(await readFile(path),descriptor);pages.push(projected.page);occurrences.push(...projected.occurrences);
 }
 const packet={schema:'glp.original-corpus-research.v1',status:'PINNED_DIGITAL_WITNESS_ONLY',sourceRepository:'opengranth/open-granth',sourceCommit:SOURCE_COMMIT,inventorySha256:INVENTORY_SHA256,...FLAGS,pages,occurrences};
 const contract={schema:'glp.original-projection-contract.v1',sourceCommit:SOURCE_COMMIT,inventorySha256:INVENTORY_SHA256,...FLAGS,fileCount:pages.length,occurrenceCount:occurrences.length,occurrencesSha256:jsonDigest(occurrences),pages};
 return {packet,contract};
}
export async function loadProjectionContract(){
 const bytes=await readFile(resolve(ROOT,'content-intake/sggs/original-projection-contract.json'));
 need(sha256(bytes)===PROJECTION_CONTRACT_SHA256,'CONTRACT_CHANGED','The separately recorded projection contract changed.');
 return JSON.parse(decode.decode(bytes));
}
export function validatePacket(packet,contract){
 keys(packet,['schema','status','sourceRepository','sourceCommit','inventorySha256',...Object.keys(FLAGS),'pages','occurrences'],'PACKET_SCHEMA');
 equal([packet.schema,packet.status,packet.sourceRepository,packet.sourceCommit,packet.inventorySha256],['glp.original-corpus-research.v1','PINNED_DIGITAL_WITNESS_ONLY','opengranth/open-granth',SOURCE_COMMIT,INVENTORY_SHA256],'PACKET_SOURCE','Research source or status changed.');
 for(const [key,value]of Object.entries(FLAGS))equal(packet[key],value,'AUTHORITY_PROMOTION','Research admission/review flag changed.');
 equal(packet.pages,contract.pages,'PAGE_PROJECTION','Pinned page projections changed.');
 need(Array.isArray(packet.occurrences)&&packet.occurrences.length===contract.occurrenceCount,'OCCURRENCE_COUNT','The full occurrence set is required.');
 need(jsonDigest(packet.occurrences)===contract.occurrencesSha256,'OCCURRENCE_PROJECTION','Original text, order, identity or source locator changed.');
 let offset=0;const seen=new Set();
 for(const page of packet.pages){
  const rows=packet.occurrences.slice(offset,offset+page.occurrenceCount);offset+=page.occurrenceCount;
  need(jsonDigest(rows)===page.projectionSha256,'PAGE_PROJECTION','A per-page original projection changed.');
  for(const row of rows){
   need(!seen.has(row.id),'DUPLICATE_ID','Witness occurrence identity is duplicated.');seen.add(row.id);
   need(row.sourcePath===page.sourcePath&&sha256(row.text)===row.textSha256,'OCCURRENCE_PROJECTION','Occurrence source or text fingerprint changed.');
   need(row.id==='witness-og-'+jsonDigest([SOURCE_COMMIT,row.sourcePath,page.rawSha256,row.sourceByteStart,row.sourceByteEnd,row.textSha256]),'OCCURRENCE_ID','Occurrence does not resolve to exact source bytes.');
  }
 }
 need(offset===packet.occurrences.length,'OCCURRENCE_COUNT','Page coverage differs from the complete occurrence set.');
 return {status:'RESEARCH_ONLY',sourceFilesReproduced:packet.pages.length,originalOccurrencesExtracted:packet.occurrences.length,...FLAGS};
}
export async function loadValidatedPacket(path){
 const stat=await lstat(path);need(stat.isFile()&&!stat.isSymbolicLink()&&stat.size<=70000000,'PACKET_FILE','Packet must be an ordinary bounded file.');
 const bytes=await readFile(path),packet=JSON.parse(decode.decode(bytes)),contract=await loadProjectionContract();
 need(Buffer.from(JSON.stringify(packet)+'\n').equals(bytes),'PACKET_ENCODING','Only canonical generated packet bytes are accepted; duplicate keys and alternate encodings are refused.');
 validatePacket(packet,contract);verifiedPackets.set(packet,contract);return packet;
}
// Internal shape adapts existing retrieval code; an internal node is not a claim of a complete passage.
export function makeResearchSearchAdapter(rows){
 const nodes=rows.map(row=>({id:row.id,type:'passage',occurrenceIds:[row.id]}));
 return {graph:{nodes,edges:[]},passages:nodes,occ:new Map(rows.map(row=>[row.id,row])),nodes:new Map(nodes.map(n=>[n.id,n]))};
}
export function searchResearchRows(rows,query,{mode='phrase',limit=20}={}){
 need(typeof query==='string'&&query.trim().length>0&&[...query].length<=240,'QUERY','Enter a bounded original Gurmukhi query.');
 need(['phrase','first-letter','first-letter-anywhere'].includes(mode),'SEARCH_MODE','Only explicit original-text search modes are permitted.');
 need(Number.isInteger(limit)&&limit>=1&&limit<=100,'RESULT_LIMIT','Result limit must be between 1 and 100.');
 // English topics and romanized names cannot become scripture matches.
 const supported=/[\u0a00-\u0a7f]/u.test(query)&&!/[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Arabic}]/u.test(query);
 const matches=supported?knowledgeSearch(makeResearchSearchAdapter(rows),query,{mode}):[];
 const selected=new Set(matches.map(hit=>hit.id));
 const ordered=rows.filter(row=>selected.has(row.id));
 return {query,mode,matchBasis:mode==='phrase'?'COMPLETE_ORIGINAL_WORDS':'ORIGINAL_WORD_INITIALS',querySupported:supported,totalHits:ordered.length,returnedHits:Math.min(ordered.length,limit),truncated:ordered.length>limit,occurrences:ordered.slice(0,limit)};
}
export function searchPacket(packet,query,options){
 const contract=verifiedPackets.get(packet);need(contract,'UNVERIFIED_PACKET','Search requires a packet loaded against the pinned projection contract.');
 validatePacket(packet,contract);
 const result=searchResearchRows(packet.occurrences,query,options),pages=new Map(packet.pages.map(p=>[p.sourcePath,p]));
 return {schema:'glp.original-corpus-search-result.v1',status:'RESEARCH_ONLY_NOT_A_COMPLETE_COMPOSITION',sourceCommit:SOURCE_COMMIT,...FLAGS,...result,occurrences:result.occurrences.map(row=>({...row,reportedSourceAng:pages.get(row.sourcePath).reportedSourceAng,sourceLocatorStatus:'SOURCE_FILE_LABEL_NOT_INDEPENDENT_ANG_VERIFICATION',canonicalAuthorId:null,canonicalRaagId:null,completeComposition:false}))};
}
