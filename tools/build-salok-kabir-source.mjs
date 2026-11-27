#!/usr/bin/env node
// Source-only extraction and explicit alternate-witness selection. Modern translations are never imported.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--witness-dir')throw Error('Usage: node tools/build-salok-kabir-source.mjs --witness-dir /temporary/directory');
const directory=path.resolve(args[1]),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const commit='34d2a7cab032c8ea24d21ff20f64653bd03766f4',release='salok-kabir-complete-draft-20261126';
const edition='salok-kabir-selected-witnesses-34d2a7c-20261126';
const pins={
 'source-selected.json':'e4649489194a7842a7bfb4bd06d69308a15b8ab79c0dfc455740011717d5af05',
 'source-witnesses.json':'7cd4c93b27b07d3a541947f1eb9245a52d7241a19a4e7b35dd98783fe74d0b00',
 'source-audit.json':'d6c278185132c70f624f90b72109477df38623e0dea37f41224f18bad956bfec',
 'runtime-selection.json':'177cbacb1baf65bab272c24e52b1cd44856967ba3a11ef2478326bf643e53443',
 'intake-discrepancy-review-erratum-231.json':'17cc3b5e6a6bdeb52c06f553e99f365416b166f609574d1d5711b88e8aeb3b15',
 'intake-discrepancy-review.json':'0ae4c378e3e8868565b44d389980fe3c572270cb8e164a1a7a9a2f8775dab20c'
};
const input={};
for(const [name,expected]of Object.entries(pins)){
 const bytes=await fs.readFile(path.join(root,'research/salok-kabir',name));
 assert.equal(sha(bytes),expected,'Frozen research input changed: '+name);input[name]=JSON.parse(bytes);
}
const selected=input['source-selected.json'],overlay=input['runtime-selection.json'],witnesses=input['source-witnesses.json'],comparison=input['source-audit.json'];
assert.equal(selected.commit,commit);assert.equal(overlay.verseTextChanges,0);assert.equal(overlay.publicationApproved,false);
const all=[];
for(const witness of witnesses){
 const bytes=await fs.readFile(path.join(directory,`ang-${witness.ang}.md`));
 assert.equal(bytes.length,witness.bytes);assert.equal(sha(bytes),witness.sha256,'Pinned witness bytes');
 assert.equal(crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes])).digest('hex'),witness.gitBlob,'Git blob');
 const records=[...bytes.toString('utf8').matchAll(/<!-- LINE:(\d+) -->\s*\*\*(.*?)\*\*/gs)],within=new Map();
 assert.equal(records.length,witness.rows);
 for(const [index,match]of records.entries()){
  const line=Number(match[1]),occurrence=(within.get(line)||0)+1;within.set(line,occurrence);
  all.push({sourceAng:witness.ang,sourcePath:witness.path,sourceGitBlob:witness.gitBlob,sourceOrdinal:index+1,
   sourcePrintedLine:line,sourceWithinLine:occurrence,text:match[2],textSha256:sha(match[2])});
 }
}
const flattened=[...selected.preface,...selected.units.flatMap(u=>[...u.headings,...u.lines])];
const locate=record=>all.findIndex(r=>r.sourceAng===record.sourceAng&&r.sourceOrdinal===record.sourceOrdinal);
const first=locate(selected.boundaries.first),last=locate(selected.boundaries.last),bounded=all.slice(first,last+1);
assert.equal(bounded.length,495);assert.deepEqual(all[first-1],selected.boundaries.preceding);assert.deepEqual(all[last+1],selected.boundaries.following);
const excluded=overlay.excludedFromKabir[0];
const foreign=bounded.filter(r=>r.sourceAng===excluded.originalAng&&r.sourceOrdinal===excluded.originalRow);
assert.equal(foreign.length,1);assert.equal(foreign[0].textSha256,excluded.textSha256);
const retained=bounded.filter(r=>r!==foreign[0]);assert.equal(retained.length,494);
for(const [i,record]of flattened.entries()){
 const {id,role,...raw}=record;assert.deepEqual(raw,retained[i],'Exact selection, order and locators: '+id);
}
assert.equal(sha(flattened.map(r=>r.text).join('\n')),selected.sourceTextSequenceSha256);
const alternates=new Map(overlay.headingSelections.map(x=>[x.id,x]));assert.equal(alternates.size,1);
const printed=new Map(overlay.printedExtentObservations.map(x=>[x.id,x]));
function record(raw){
 const alternate=alternates.get(raw.id);if(alternate){assert.equal(raw.text,alternate.before);assert.equal(raw.textSha256,alternate.beforeSha256);assert.equal(sha(alternate.after),alternate.afterSha256);}
 const output={id:raw.id,kind:raw.role==='verse'?'verse':raw.role==='invocation'?'invocation':'heading',
  text:alternate?alternate.after:raw.text,sha256:alternate?alternate.afterSha256:raw.textSha256,family:'sggs',
  location:{system:'ang',ang:raw.sourceAng,basis:'SELECTED_DIGITAL_WITNESS'},held:false,
  source:{repository:'opengranth/open-granth',commit,path:raw.sourcePath,gitBlob:raw.sourceGitBlob,row:raw.sourceOrdinal,
   reportedPrintedLine:raw.sourcePrintedLine,withinLine:raw.sourceWithinLine,originalTextSha256:raw.textSha256}};
 if(alternate)output.source.alternateWitnessSelection={action:alternate.action,originalText:alternate.before,selectedTextSha256:alternate.afterSha256,evidence:'research/salok-kabir/runtime-selection.json',qualifiedApproval:false};
 if(printed.has(raw.id))output.location.printedExtentObservation={angs:printed.get(raw.id).printedAngRangeObserved,
  status:printed.get(raw.id).status,evidence:printed.get(raw.id).evidence||'research/salok-kabir/intake-discrepancy-review.json'};
 return output;
}
const digits=n=>String(n).replace(/[0-9]/g,d=>'੦੧੨੩੪੫੬੭੮੯'[Number(d)]);
const preface=selected.preface.map(record),headMap=new Map([[209,'ਮਹਲਾ ੫ ॥'],[210,'ਮਹਲਾ ੫ ॥'],[211,'ਮਹਲਾ ੫ ॥'],[214,'ਮਹਲਾ ੫ ॥'],[220,'ਮਃ ੩ ॥'],[221,'ਮਃ ੫ ॥']]);
const units=selected.units.map((raw,index)=>{
 assert.equal(raw.ordinal,index+1);assert.equal(raw.lines.length,2);assert.equal(raw.headings.length,headMap.has(raw.ordinal)?1:0);
 if(raw.headings.length)assert.equal(raw.headings[0].text,headMap.get(raw.ordinal));
 assert.ok(raw.lines[1].text.endsWith(`॥${digits(raw.ordinal)}॥`));
 assert.equal(raw.attribution.canonicalAuthorId,null);assert.equal(raw.attribution.qualifiedAttributionReviewed,false);assert.equal(raw.attribution.signatureAloneAssignsAuthorship,false);
 const lines=raw.lines.map(record),metricalHeadings=raw.headings.map(record);
 const unit={id:raw.id,ordinal:raw.ordinal,title:`Salok ${raw.ordinal}`,titleGurmukhi:`ਸਲੋਕ ${digits(raw.ordinal)}`,sourceFamily:'sggs',
  authorId:null,attribution:raw.attribution,angStart:lines[0].location.ang,angEnd:lines[1].location.ang,
  sourceHeadingIncluded:false,metricalHeadings,lines};
 unit.sourceDigest=sha([...metricalHeadings,...lines].map(r=>r.id+'\t'+r.sha256).join('\n'));
 assert.equal(unit.sourceDigest,raw.sourcePassageDigest,'No verse or embedded-heading alteration');return unit;
});
const originals=[...preface,...units.flatMap(u=>[...u.metricalHeadings,...u.lines])];
const sequenceSHA=sha(originals.map(r=>r.text).join('\n'));
const audited=new Map(comparison.occurrences.map(x=>[x.id,x]));
const exact=originals.filter(r=>r.text===audited.get(r.id).secondaryText).length;assert.equal(exact,493);
const pack={schema:'GLP-NITNEM-SOURCE-V2',compositionId:'salok-kabir',originalCompositionId:'salok-kabir',
 title:'Salok Bhagat Kabir Ji',titleGurmukhi:'ਸਲੋਕ ਭਗਤ ਕਬੀਰ ਜੀਉ ਕੇ',daypart:'Additional Bani',sourceFamily:'sggs',
 reference:'Sri Guru Granth Sahib Ji · selected digital source Ang 1364–1377',
 caveat:'All 243 numbered Saloks in this collection, including six original Mahalla headings. Other Kabir Bani across the Raags is a separate collection. Digital Ang locators and bounded printed-page differences are documented; complete qualified collation is pending.',
 sourceTextSequenceSha256:sequenceSHA,sourceRepositoryCommit:commit,editionId:edition,
 sourceStatus:'SELECTED_DIGITAL_WITNESSES_WITH_DOCUMENTED_DIFFERENCES_QUALIFIED_REVIEW_PENDING',
 humanCollationApproved:false,translationApproved:false,sections:[],preface,unitCount:243,originalLineCount:486,sourceOccurrenceCount:494,units,
 sourceAudit:{schema:'glp001.salok-kabir.runtime-source-audit.v1',repository:'opengranth/open-granth',commit,witnesses,
  inputDigests:pins,exactTextSequenceSha256:sequenceSHA,sequenceDefinition:'UTF-8 occurrence texts in source order joined with LF; no final LF',
  selectedDigitalWitness:'Pinned OpenGranth Gurmukhi, with one explicit alternate-witness collection-heading selection',
  secondarySource:'SriGranth, Ang1364–1377; independently retrieved original Gurmukhi web strings',
  secondaryComparisonEvidence:'research/salok-kabir/source-audit.json',rawSelectionExactMatches:492,
  runtimeSecondaryExactMatches:493,runtimeSecondaryMismatches:1,verseExactMatches:485,verseMismatches:1,
  explicitHeadingSelections:overlay.headingSelections,retainedDifferences:overlay.retainedDifferences,
  excludedFromKabir:overlay.excludedFromKabir,rawBoundedOccurrences:495,selectedOccurrences:494,
  qualifiedHumanReviewCount:0,modernTranslationsImported:false,printedEditionAuthenticated:false,completePrintedCollation:false,
  printedExtentObservations:overlay.printedExtentObservations,locatorPolicy:overlay.locatorPolicy,
  boundaries:selected.boundaries,attributionPolicy:selected.attributionPolicy,
  limitations:['Digital agreement does not establish independent textual lineage or qualified approval.',
   'The valid Unicode nasal mark at Salok177 is retained; equivalence to the secondary website private-use glyph is not adjudicated.',
   'Printed-page spot checks do not authenticate the uploader-attributed edition or collate every physical Ang boundary.',
   'Named voices in Saloks212,213,241,242 are preserved separately; signatures alone do not assign authorship.',
   'The frozen PR50 intake remains unchanged; its broader canonical-location and attribution fields remain unadjudicated.']},
 releaseId:release,publicationStatus:'EDUCATIONAL_DRAFT',releaseChannel:'DEVELOPMENT_REVIEW',previousEditionIds:[]};
const json=x=>JSON.stringify(x,null,2)+'\n',output=path.join(root,'salok-kabir/data');await fs.mkdir(output,{recursive:true});
const packBytes=json(pack);await fs.writeFile(path.join(output,'salok-kabir.json'),packBytes);
const manifest={schema:'GLP-NITNEM-LIBRARY-V2',sourceCommit:commit,sourceFamilySite:'gurbani-learning-library',releaseStatus:'DEVELOPMENT_REVIEW',
 canonicalJapji:'../full-japji.html',audioSynced:false,entries:{'salok-kabir':{path:'data/salok-kabir.json',sha256:sha(packBytes),units:243,lines:486,sourceOccurrences:494,
  title:pack.title,titleGurmukhi:pack.titleGurmukhi,editionId:edition,daypart:'Additional Bani'}},releaseId:release,qualifiedHumanReviewed:false};
await fs.writeFile(path.join(output,'library.json'),json(manifest));
console.log(JSON.stringify({status:'PASS',units:243,verses:486,allOccurrences:494,sourceTextSequenceSHA256:sequenceSHA,
 custodySHA256:sha(JSON.stringify([pack.preface,pack.units,pack.sourceAudit])),packSHA256:sha(packBytes),manifestSHA256:sha(json(manifest))}));
