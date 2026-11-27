#!/usr/bin/env node
// Research validation only. This tool cannot admit or publish scripture.
// Follows PR50's bounded intake contract; no runtime reader or teaching dependency.
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {basename,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const CONTRACT_SHA256='ff8ebde2192ccd162b74145ec30bb0905fd5233929845a3740b9b083a05034de';
const COMMIT='34d2a7cab032c8ea24d21ff20f64653bd03766f4';
const ANGS=[488,794,1377,1378,1379,1380,1381,1382,1383,1384];
const decode=new TextDecoder('utf-8',{fatal:true});
export const sha256=value=>createHash('sha256').update(value).digest('hex');
const digest=value=>sha256(JSON.stringify(value));
export class FaridIntakeError extends Error {
 constructor(code,message){super(message);this.name='FaridIntakeError';this.code=code;}
}
const need=(ok,code,message)=>{if(!ok)throw new FaridIntakeError(code,message);};
const equal=(a,b,code,label)=>need(isDeepStrictEqual(a,b),code,label+' differs from the frozen source research.');
const number=text=>{const m=/॥([੦-੯]+)॥$/u.exec(text);return m?Number([...m[1]].map(c=>c.codePointAt(0)-0x0a66).join('')):null;};
function pinnedMap(files,pins,label){
 need(files instanceof Map,'PRESERVATION_INPUT',label+' original bytes are required.');
 equal([...files.keys()].sort(),Object.keys(pins).sort(),'PRESERVATION_INPUT',label+' path set');
 for(const [path,pin]of Object.entries(pins))equal(sha256(files.get(path)),pin,'PRESERVATION_CHANGED',label+' '+path);
}
function parsePage(bytes,descriptor){
 const text=decode.decode(bytes),ang=Number(/ang-(\d{4})\.md$/.exec(descriptor.path)[1]);
 need(text.startsWith('---\n')&&new RegExp('^ang: '+ang+'$','m').test(text),'WITNESS_PARSE','Source page header differs.');
 const rows=[...text.matchAll(/<!-- LINE:(\d+) -->\s*\*\*([^\r\n]*?)\*\*/gu)],within=new Map();
 equal(rows.length,Number(/^lines: (\d+)$/m.exec(text)?.[1]),'WITNESS_PARSE','Page record count');
 equal(rows.length,[...text.matchAll(/<!-- LINE:/g)].length,'WITNESS_PARSE','Unparsed source marker count');
 return rows.map((m,i)=>{const line=Number(m[1]),count=(within.get(line)||0)+1;within.set(line,count);
  return {sourceAng:ang,sourcePath:descriptor.path,sourceGitBlob:descriptor.gitBlob,sourceOrdinal:i+1,sourcePrintedLine:line,sourceWithinLine:count,text:m[2],textSha256:sha256(m[2])};});
}
function verifyWitnesses(manifest,contract,files){
 need(files instanceof Map,'WITNESS_INPUT','Witnesses must be a map of fixed paths to original bytes.');
 equal([...files.keys()].sort(),contract.witnesses.map(w=>w.path).sort(),'WITNESS_INPUT','Witness file set');
 const pages=new Map();
 for(const descriptor of contract.witnesses){
  const bytes=files.get(descriptor.path);
  need(bytes instanceof Uint8Array,'WITNESS_INPUT','Original witness bytes are required.');
  equal(bytes.byteLength,descriptor.bytes,'WITNESS_BYTES','Witness size');
  equal(sha256(bytes),descriptor.sha256,'WITNESS_BYTES','Witness SHA-256');
  equal(createHash('sha1').update(`blob ${bytes.byteLength}\0`).update(bytes).digest('hex'),descriptor.gitBlob,'WITNESS_BYTES','Witness Git blob');
  if(descriptor.path==='metadata/authors.json'){
   const selected=JSON.parse(decode.decode(bytes)).authors.filter(a=>a.name==='Bhagat Sheikh Fareed Ji');
   equal(selected.length,1,'WITNESS_METADATA','Author record count');
   equal([selected[0].angs,selected[0].ang_count,selected[0].verse_count],[ANGS,10,326],'WITNESS_METADATA','Author inventory');
  }else pages.set(Number(/ang-(\d+)/.exec(descriptor.path)[1]),parsePage(bytes,descriptor));
 }
 const observed=pages.get(1377).slice(26).concat(...Array.from({length:7},(_,i)=>pages.get(1378+i)));
 equal(observed,manifest.observedForwardSpan.occurrences,'WITNESS_SEQUENCE','Entire observed forward span');
 equal(pages.get(1377)[25],manifest.observedForwardSpan.precedingSourceOccurrence,'WITNESS_BOUNDARY','Preceding boundary');
 equal(pages.get(1385)[0],manifest.observedForwardSpan.followingSourceOccurrence,'WITNESS_BOUNDARY','Following boundary');
 equal(pages.get(1377)[1],manifest.quarantinedDiscrepancies[0].sourceOccurrence,'WITNESS_QUARANTINE','Displaced occurrence and original locator');
 const ranges=Array.from({length:8},(_,i)=>{const ang=1377+i,first=i===0?27:1;return {sourceAng:ang,firstOrdinal:first,lastOrdinal:pages.get(ang).length,occurrences:pages.get(ang).length-first+1};});
 equal(ranges,manifest.observedForwardSpan.sourceRanges,'WITNESS_RANGE','Full source ranges');
 return files.size;
}
export function validateFaridIntake(manifest,corpus,{contractBytes,runtimeFiles,retainedFiles,witnessFiles=null}={}){
 need(contractBytes instanceof Uint8Array,'CONTRACT_INPUT','Pinned contract bytes are required.');
 equal(sha256(contractBytes),CONTRACT_SHA256,'CONTRACT_CHANGED','Independent research contract');
 const contract=JSON.parse(decode.decode(contractBytes));
 pinnedMap(runtimeFiles,contract.runtimePins,'Existing runtime');
 pinnedMap(retainedFiles,Object.fromEntries(contract.retainedEvidence.map(r=>[r.path,r.sha256])),'Retained research');
 equal([manifest.runtimeEligible,manifest.publicReady,manifest.publicationReady],[false,false,false],'AUTHORITY_PROMOTION','Root admission gates');
 equal([manifest.status,manifest.source?.editionStatus],['PLANNING_INVENTORY','PINNED_DIGITAL_WITNESS_NOT_AUTHENTICATED_SAROOP'],'AUTHORITY_PROMOTION','Research authority');
 equal([manifest.source?.repository,manifest.source?.commit],['opengranth/open-granth',COMMIT],'SOURCE_CHANGED','Pinned source');
 equal([manifest.source.metadataWitness,...manifest.source.textWitnesses],contract.witnesses,'SOURCE_CHANGED','Source descriptors');
 equal(manifest.inventory?.candidateAngs,ANGS,'INVENTORY_CHANGED','Candidate Ang set');
 equal([manifest.inventory?.upstreamTextEntryCount,manifest.inventory?.completeCompositionCount,manifest.inventory?.reviewedCompositionCount],[326,null,0],'AUTHORITY_PROMOTION','Count units and review status');
 equal([manifest.inventory?.wholePageAuthorAssignmentPermitted,manifest.inventory?.signatureWordAuthorAssignmentPermitted,manifest.observedForwardSpan?.pageAuthorIsCanonicalAttribution],[false,false,false],'ATTRIBUTION_CHANGED','Attribution limits');
 equal(Object.values(manifest.reviews),[null,null,null,null],'AUTHORITY_PROMOTION','Pending human reviews');
 equal([manifest.translationAssets,manifest.audioAssets],[[],[]],'ASSET_IMPORT','External content assets');
 const span=manifest.observedForwardSpan;
 equal([span.status,span.completeComposition,span.canonicalAngs],['INCOMPLETE_ORDERED_WITNESS',false,null],'AUTHORITY_PROMOTION','Incomplete source state');
 need(Array.isArray(span.occurrences)&&span.occurrences.length===296&&span.occurrenceCount===296,'SOURCE_COUNT','The entire 296-occurrence observed span is required.');
 for(const row of span.occurrences)equal(sha256(row.text),row.textSha256,'SOURCE_TEXT','Original occurrence fingerprint');
 equal(digest(span.occurrences),contract.spanCustodySha256,'SOURCE_ORDER','Original order, bytes and locators');
 equal([digest(span.occurrences),sha256(span.occurrences.map(r=>r.text).join('\n'))],[span.custodySha256,span.textSequenceSha256],'SOURCE_TEXT','Declared span fingerprints');
 equal(span.textSequenceSha256,contract.spanSequenceSha256,'SOURCE_TEXT','Pinned original sequence');
 const endings=span.occurrences.map(r=>number(r.text)).filter(n=>n!==null);
 equal(endings,[1,...Array.from({length:128},(_,i)=>i+3)],'MISSING_LINE_HIDDEN','Observed numbering must retain missing terminal 2');
 equal([span.observedNumberedEndings,span.missingTerminalNumbers,span.duplicateTerminalNumbers],[endings,[2],[]],'MISSING_LINE_HIDDEN','Recorded number gap');
 const explicit=span.occurrences.flatMap((r,i)=>/^(?:ਮਃ|ਮਹਲਾ) /u.test(r.text)?[{occurrence:r,nextObservedTerminalNumber:span.occurrences.slice(i+1).map(x=>number(x.text)).find(n=>n!==null),authorId:null,attributionStatus:'EXPLICIT_HEADING_OBSERVED_SCOPE_PENDING_REVIEW'}]:[]);
 equal(explicit,span.explicitMahallaHeadings,'ATTRIBUTION_CHANGED','All explicit Mahalla heading occurrences');
 need(explicit.length===11,'SOURCE_COUNT','All eleven explicit Mahalla headings must remain.');
 const [displaced,heading]=manifest.quarantinedDiscrepancies;
 equal([displaced?.status,displaced?.runtimeEligible,displaced?.automaticAuthorInclusion,displaced?.canonicalAng,displaced?.canonicalAuthorId,displaced?.resolution],['OPEN_QUARANTINED',false,false,null,null,null],'QUARANTINE_PROMOTION','Displaced line quarantine');
 equal([displaced.sourceOccurrence.sourceAng,displaced.sourceOccurrence.sourceOrdinal,displaced.sourceOccurrence.textSha256],[1377,2,'f9312b97a0b94ce0412cc998d0289563b75d966001558a156d94f616d5ab01b0'],'QUARANTINE_RELOCATED','Original displaced-line locator');
 equal(sha256(displaced.sourceOccurrence.text),displaced.sourceOccurrence.textSha256,'SOURCE_TEXT','Displaced original text');
 equal([heading?.status,heading?.runtimeEligible,heading?.selectedRuntimeText,heading?.resolution],['OPEN_QUARANTINED',false,null,null],'QUARANTINE_PROMOTION','Heading disagreement');
 equal(heading.sourceOccurrence,span.occurrences[0],'SOURCE_TEXT','Unchanged observed collection heading');
 const {occurrences,...metadata}=span;
 equal(digest({...manifest,observedForwardSpan:metadata}),contract.manifestMetadataSha256,'RESEARCH_METADATA_CHANGED','Frozen research metadata, evidence and closed schema');
 equal([corpus.status,corpus.runtimeEligible,corpus.publicReady,corpus.publicationReady,corpus.originalLinesCollated,corpus.completeCompositionsAdmitted,corpus.qualifiedHumanReviewCount],['PINNED_FILE_INVENTORY_ONLY',false,false,false,0,0,0],'CORPUS_AUTHORITY_PROMOTION','File-inventory limits');
 equal(corpus.files.map(f=>[f.ang,f.path]),Array.from({length:1430},(_,i)=>[i+1,`corpus/ang-${String(i+1).padStart(4,'0')}.md`]),'CORPUS_FILE_SET','Complete file-name inventory');
 equal([corpus.fileCount,corpus.totalBytes,corpus.gitTreeTruncated],[1430,14816830,false],'CORPUS_FILE_SET','Git-tree inventory totals');
 equal(corpus.files.reduce((sum,f)=>sum+f.bytes,0),corpus.totalBytes,'CORPUS_FILE_SET','Inventory byte sum');
 equal(digest(corpus.files),corpus.descriptorSha256,'CORPUS_DESCRIPTOR_CHANGED','Ordered Git descriptors');
 equal(digest(corpus),contract.corpusInventorySha256,'CORPUS_DESCRIPTOR_CHANGED','Pinned file-inventory record');
 for(const w of manifest.source.textWitnesses){const f=corpus.files.find(x=>x.path===w.path);equal([f.gitBlob,f.bytes],[w.gitBlob,w.bytes],'CORPUS_DESCRIPTOR_CHANGED','Bounded witness and global inventory cross-check');}
 const witnessFilesVerified=witnessFiles===null?0:verifyWitnesses(manifest,contract,witnessFiles);
 return Object.freeze({schema:'glp.farid-intake-validation.v1',result:'PASS',scope:witnessFilesVerified?'PINNED_SOURCE_RESEARCH_WITH_WITNESS_RECONSTRUCTION':'STATIC_RESEARCH_CONTRACT_ONLY',runtimeEligible:false,publicReady:false,publicationReady:false,observedForwardOccurrences:296,missingTerminalNumbers:[2],displacedOccurrencesRetained:1,explicitMahallaHeadings:11,candidateAuthorAngs:10,upstreamAuthorTextEntries:326,completeCompositionsAdmitted:0,fileInventoryAngs:1430,fullCorpusOriginalLinesCollated:0,witnessFilesVerified,qualifiedHumanReview:'NOT_PERFORMED'});
}
export async function loadFaridInputs({root=ROOT,witnessDir}={}){
 const contractBytes=await readFile(resolve(root,'content-intake/farid/contract.json'));
 equal(sha256(contractBytes),CONTRACT_SHA256,'CONTRACT_CHANGED','Research contract');
 const contract=JSON.parse(decode.decode(contractBytes));
 const [manifest,corpus,runtimeFiles,retainedFiles,witnessFiles]=await Promise.all([
  readFile(resolve(root,'content-intake/farid/manifest.json'),'utf8').then(JSON.parse),
  readFile(resolve(root,'content-intake/sggs/file-inventory.json'),'utf8').then(JSON.parse),
  Promise.all(Object.keys(contract.runtimePins).map(async p=>[p,await readFile(resolve(root,p))])).then(rows=>new Map(rows)),
  Promise.all(contract.retainedEvidence.map(async r=>[r.path,await readFile(resolve(root,r.path))])).then(rows=>new Map(rows)),
  witnessDir?Promise.all(contract.witnesses.map(async r=>[r.path,await readFile(resolve(witnessDir,basename(r.path)))])).then(rows=>new Map(rows)):null
 ]);
 return {manifest,corpus,options:{contractBytes,runtimeFiles,retainedFiles,witnessFiles}};
}
async function main(args){
 const opts={};for(let i=0;i<args.length;i+=2){need(['--witness-dir','--report'].includes(args[i])&&args[i+1]&&!Object.hasOwn(opts,args[i]),'CLI_ARGUMENT','Use --witness-dir directory and/or --report file.');opts[args[i]]=args[i+1];}
 const {manifest,corpus,options}=await loadFaridInputs({witnessDir:opts['--witness-dir']});
 const report=validateFaridIntake(manifest,corpus,options);if(opts['--report'])await writeFile(opts['--report'],JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify(report,null,2));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main(process.argv.slice(2)).catch(e=>{console.error(`${e.code||e.name}: ${e.message}`);process.exitCode=1;});
