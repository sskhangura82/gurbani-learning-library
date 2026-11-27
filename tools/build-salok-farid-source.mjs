#!/usr/bin/env node
// Explicit development selection. Frozen intake remains unchanged; no commentary is generated.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {loadFaridInputs,validateFaridIntake} from './validate-farid-intake.mjs';
const ROOT=fileURLToPath(new URL('../',import.meta.url)),sha=x=>createHash('sha256').update(x).digest('hex'),encode=x=>JSON.stringify(x,null,2)+'\n';
const digits=n=>String(n).replace(/[0-9]/g,d=>'੦੧੨੩੪੫੬੭੮੯'[Number(d)]);
const ending=text=>{const m=text.match(/॥([੦-੯]+)॥$/u);return m?Number([...m[1]].map(c=>c.charCodeAt(0)-0x0a66).join('')):null;};
const COMMIT='34d2a7cab032c8ea24d21ff20f64653bd03766f4';
export const EDITION='salok-farid-selected-witness-34d2a7c-20261127',RELEASE='salok-farid-source-only-20261127';
export function selectFarid(manifest,secondary){
 const forward=manifest.observedForwardSpan.occurrences,displaced=manifest.quarantinedDiscrepancies[0].sourceOccurrence;
 assert.equal(forward.length,296);assert.equal(displaced.textSha256,'f9312b97a0b94ce0412cc998d0289563b75d966001558a156d94f616d5ab01b0');
 const anchor=manifest.quarantinedDiscrepancies[0].upstreamGroupEvidence.rows[0];
 assert.equal(anchor.line_id,'9RH3');assert.equal(anchor.line_group_id,'G4W');
 const insertion=forward.findIndex(r=>r.text==='ਫਰੀਦਾ ਦਰ ਦਰਵੇਸੀ ਗਾਖੜੀ ਚਲਾਂ ਦੁਨੀਆਂ ਭਤਿ ॥');assert.equal(insertion,10);
 const selected=[...forward.slice(0,insertion+1),displaced,...forward.slice(insertion+1)];
 const all=secondary.pages.flatMap(p=>p.originalRows.map((text,i)=>({reportedAng:p.reportedAng,ordinal:i+1,text})));
 const start=all.findIndex(r=>r.text==='ਸਲੋਕ ਸੇਖ ਫਰੀਦ ਕੇ'),finish=all.findIndex((r,i)=>i>=start&&r.text.endsWith('॥੧੩੦॥'));
 assert.ok(start>0);assert.ok(finish>start);const comparison=all.slice(start,finish+1);assert.equal(comparison.length,297);
 assert.ok(all[start-1].text.endsWith('॥੨੪੩॥'));assert.equal(all[finish+1].reportedAng,1385);
 assert.deepEqual(selected.map(r=>ending(r.text)).filter(n=>n!==null),Array.from({length:130},(_,i)=>i+1));
 const differences=selected.flatMap((r,i)=>r.text===comparison[i].text?[]:[{selectedIndex:i,selectedText:r.text,selectedSha256:r.textSha256,secondaryText:comparison[i].text,secondarySha256:sha(comparison[i].text),secondaryLocation:{reportedAng:comparison[i].reportedAng,ordinal:comparison[i].ordinal},action:'RETAIN_PINNED_SOURCE_BYTES',equivalenceAdjudicated:false}]);
 assert.deepEqual(differences.map(r=>r.selectedIndex),[0,19,30,79,177,192]);
 assert.equal(differences[0].secondaryText,'ਸਲੋਕ ਸੇਖ ਫਰੀਦ ਕੇ');assert.ok(differences.slice(1).every(r=>r.secondaryText.includes('\uf03d')));
 assert.equal(comparison[11].text,displaced.text);assert.equal(comparison[11].reportedAng,1378);assert.equal(comparison[11].ordinal,1);
 const units=[];let lines=[],headings=[];
 for(const row of selected.slice(2)){
  if(/^(?:ਮਃ|ਮਹਲਾ) /u.test(row.text)){assert.equal(lines.length,0);headings.push(row);continue;}
  lines.push(row);const n=ending(row.text);
  if(n!==null){assert.equal(n,units.length+1);units.push({ordinal:n,headings,lines});headings=[];lines=[];}
 }
 assert.equal(units.length,130);assert.equal(lines.length,0);assert.equal(headings.length,0);
 assert.equal(units.reduce((n,u)=>n+u.headings.length,0),11);
 return {selected,units,comparison,differences,boundaries:{preceding:all[start-1],following:all[finish+1]}};
}
export function makePack(manifest,secondary,{manifestSha256,secondarySha256,intakeContractSha256}){
 const selected=selectFarid(manifest,secondary),sourceRecord=(raw,id,kind)=>({id,kind,text:raw.text,sha256:raw.textSha256,family:'sggs',location:{system:'ang',ang:raw.sourceAng,basis:'SELECTED_DIGITAL_WITNESS',canonicalAng:null},held:false,source:{repository:'opengranth/open-granth',commit:COMMIT,path:raw.sourcePath,gitBlob:raw.sourceGitBlob,row:raw.sourceOrdinal,reportedPrintedLine:raw.sourcePrintedLine,withinLine:raw.sourceWithinLine,originalTextSha256:raw.textSha256}});
 const preface=selected.selected.slice(0,2).map((r,i)=>sourceRecord(r,'sggs.salok-farid.'+(i===0?'heading01':'invocation01'),i===0?'heading':'invocation'));
 const units=selected.units.map(u=>{
  const id='sggs.salok-farid.salok'+String(u.ordinal).padStart(3,'0'),lines=u.lines.map((r,i)=>sourceRecord(r,id+'.line'+String(i+1).padStart(2,'0'),'verse')),metricalHeadings=u.headings.map((r,i)=>sourceRecord(r,id+'.heading'+String(i+1).padStart(2,'0'),'heading'));
  if(u.ordinal===2)lines.at(-1).source.selectionObservation={discrepancyId:'og-location-1377-row002',action:'PLACE_AFTER_UPSTREAM_GROUP_G4W_FIRST_LINE',originalLocatorUnchanged:true,secondaryReportedAng:1378,canonicalAng:null,evidence:'research/salok-farid/selection-ledger.json'};
  return {id,ordinal:u.ordinal,title:'Salok '+u.ordinal,titleGurmukhi:'ਸਲੋਕ '+digits(u.ordinal),sourceFamily:'sggs',authorId:null,attribution:{canonicalAuthorId:null,qualifiedAttributionReviewed:false,collectionTitleAssignsAuthorship:false,signatureAloneAssignsAuthorship:false,explicitMahallaHeadingIds:metricalHeadings.map(r=>r.id)},angStart:lines[0].location.ang,angEnd:lines.at(-1).location.ang,sourceHeadingIncluded:false,metricalHeadings,lines,sourceDigest:sha([...metricalHeadings,...lines].map(r=>r.id+'\t'+r.sha256).join('\n'))};
 });
 const original=[...preface,...units.flatMap(u=>[...u.metricalHeadings,...u.lines])],sequence=sha(original.map(r=>r.text).join('\n'));
 const ledger={schema:'glp.farid.selection-ledger.v1',status:'DEVELOPMENT_SELECTION_INDEPENDENT_REVIEW_PENDING',publicationApproved:false,qualifiedHumanReviewCount:0,canonicalLocationAdjudicated:false,canonicalAuthorshipAdjudicated:false,frozenIntake:{path:'content-intake/farid/manifest.json',sha256:manifestSha256,contractSha256:intakeContractSha256,modified:false},verseTextChanges:0,headingTextChanges:0,rawForwardOccurrences:296,selectedOccurrences:297,unitCount:130,selectedSequenceSha256:sequence,sourceEdition:EDITION,sourceLineage:'OpenGranth derives from Shabad OS SSA2; these are one textual lineage.',displacedSelection:{discrepancyId:'og-location-1377-row002',originalSourceOccurrence:manifest.quarantinedDiscrepancies[0].sourceOccurrence,selectedOccurrenceId:units[1].lines[1].id,selectedIndex:11,previousOccurrenceId:units[1].lines[0].id,upstreamEvidence:manifest.quarantinedDiscrepancies[0].upstreamGroupEvidence,secondaryObservation:selected.comparison[11],canonicalAng:null,canonicalAuthorId:null,decision:'SOURCE_GROUP_AND_SECONDARY_SEQUENCE_SUPPORTED_DEVELOPMENT_SELECTION_ONLY'},headingSelection:{action:'RETAIN_EXACT_PINNED_SOURCE_HEADING',selectedText:preface[0].text,selectedSha256:preface[0].sha256,opposingText:selected.differences[0].secondaryText,noProviderVote:true},secondary:{path:'research/salok-farid/secondary-display.json',sha256:secondarySha256,completeOccurrences:297,byteIdenticalOccurrences:291,unresolvedDifferences:6,independentTextualLineageEstablished:false,boundaries:selected.boundaries},differences:selected.differences,limitations:['The frozen intake and its original quarantine fields remain unchanged.','Selection uses source group evidence and complete secondary sequence comparison; no independent transmission lineage or qualified collation is established.','Five nasal-mark display differences retain valid pinned source Unicode; no private-use glyph equivalence is adjudicated.','The selected heading retains its terminal danda; the opposing form remains documented.','Reported digital Ang locations are not independently authenticated printed Ang assignments.','No explanation, translation, audio or release approval is added.']};
 const pack={schema:'GLP-NITNEM-SOURCE-V2',compositionId:'salok-farid',originalCompositionId:'salok-farid',title:'Salok Sheikh Farid Ji',titleGurmukhi:'ਸਲੋਕ ਸੇਖ ਫਰੀਦ ਕੇ ॥',daypart:'Additional Bani',sourceFamily:'sggs',reference:'Sri Guru Granth Sahib Ji · selected digital source locators 1377–1384',caveat:'130 numbered Saloks. Original Mahalla headings remain. Digital locations and six witness differences are documented; original source bytes are preserved. Explanations are not yet supplied.',sourceTextSequenceSha256:sequence,sourceRepositoryCommit:COMMIT,editionId:EDITION,sourceStatus:'EXPLICIT_DEVELOPMENT_SELECTION_WITH_DOCUMENTED_DIFFERENCES',humanCollationApproved:false,translationApproved:false,sections:[],preface,unitCount:130,originalLineCount:units.reduce((n,u)=>n+u.lines.length,0),sourceOccurrenceCount:297,units,sourceAudit:{schema:'glp.farid.runtime-source-audit.v1',sourceRepository:'opengranth/open-granth',sourceCommit:COMMIT,selectionLedgerPath:'research/salok-farid/selection-ledger.json',selectionLedgerSha256:sha(encode(ledger)),intakeManifestSha256:manifestSha256,secondarySha256,secondaryByteIdenticalOccurrences:291,secondaryDifferences:selected.differences,sourceSequenceSha256:sequence,qualifiedHumanReviewCount:0,independentTextualLineageEstablished:false,canonicalAngAdjudicated:false,canonicalAuthorAdjudicated:false,modernTranslationsImported:false,completePrintedCollation:false},releaseId:RELEASE,publicationStatus:'EDUCATIONAL_DRAFT',releaseChannel:'DEVELOPMENT_REVIEW',previousEditionIds:[]};
 const bytes=encode(pack),library={schema:'GLP-NITNEM-LIBRARY-V2',sourceCommit:COMMIT,sourceFamilySite:'gurbani-learning-library',releaseStatus:'DEVELOPMENT_REVIEW',canonicalJapji:'../full-japji.html',audioSynced:false,entries:{'salok-farid':{path:'data/salok-farid.json',sha256:sha(bytes),units:130,lines:pack.originalLineCount,sourceOccurrences:297,title:pack.title,titleGurmukhi:pack.titleGurmukhi,editionId:EDITION,daypart:'Additional Bani'}},releaseId:RELEASE,qualifiedHumanReviewed:false};
 return {ledger,pack,library,summary:{units:130,verseOccurrences:pack.originalLineCount,structuralOccurrences:13,allOccurrences:297,sourceTextSequenceSha256:sequence,custodySha256:sha(JSON.stringify([pack.preface,pack.units,pack.sourceAudit])),packSha256:sha(bytes),manifestSha256:sha(encode(library)),ledgerSha256:sha(encode(ledger))}};
}
async function main(){
 const args=process.argv.slice(2);assert.equal(args.length,2);assert.equal(args[0],'--witness-dir');
 const {manifest,corpus,options}=await loadFaridInputs({witnessDir:args[1]});validateFaridIntake(manifest,corpus,options);
 const manifestBytes=await fs.readFile(path.join(ROOT,'content-intake/farid/manifest.json')),secondaryBytes=await fs.readFile(path.join(ROOT,'research/salok-farid/secondary-display.json'));
 const result=makePack(manifest,JSON.parse(secondaryBytes),{manifestSha256:sha(manifestBytes),secondarySha256:sha(secondaryBytes),intakeContractSha256:sha(options.contractBytes)});
 const data=path.join(ROOT,'salok-farid/data');await fs.mkdir(data,{recursive:true});
 await fs.writeFile(path.join(data,'salok-farid.json'),encode(result.pack));await fs.writeFile(path.join(data,'library.json'),encode(result.library));
 await fs.writeFile(path.join(ROOT,'research/salok-farid/selection-ledger.json'),encode(result.ledger));
 await fs.writeFile(path.join(ROOT,'research/salok-farid/selection-summary.json'),encode(result.summary));console.log(JSON.stringify(result.summary));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e.message);process.exitCode=1;});
