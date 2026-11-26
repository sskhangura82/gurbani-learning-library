#!/usr/bin/env node
// Reproducible source-only extraction. Never import the witness's modern translations.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--witness-dir')throw Error('Usage: node tools/build-salok-mahalla9-source.mjs --witness-dir /temporary/directory');
const directory=path.resolve(args[1]);
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const commit='34d2a7cab032c8ea24d21ff20f64653bd03766f4';
const release='salok-mahalla9-complete-draft-20261126';
const edition='salok-mahalla9-opengranth-34d2a7c-20261126';
const sequenceSHA='16649b80d412b71d628eab27e372208bb74a5c9289702a0f581967ce91604e28';
const witnesses=[
 [1426,9295,'ab59d45cdc229f3660618c312b9c284d698fad4204b017c03ce2e1613a1ebbf9','4727b988f326e4872093d0539ef077d7af2075bd'],
 [1427,10533,'a69d55ea200c816e4004d55f0c64f630ce6d7076bbae2e8815322f7ee1a7f364','8b111a1d1bbe269671d52832678e5ad2d11dea71'],
 [1428,10287,'4a83880fde56e290bb5a61ede6d13b78984c0ac88d5d714b32a1d83ae04b3158','9f394291b1f3fee875a70dcab51cbad169df980a'],
 [1429,9145,'c8622d67a77a9a9024a9fa614efb66b9c95d4c8fb62e21d8f90434dbea31cbce','d4ac162bb9e5a6098ba372a79d3b6e24ad14be97']
].map(([ang,bytes,sha256,gitBlob])=>({ang,bytes,sha256,gitBlob,path:`corpus/ang-${ang}.md`,url:`https://github.com/opengranth/open-granth/blob/${commit}/corpus/ang-${ang}.md`}));
const all=[];
for(const w of witnesses){
 const bytes=await fs.readFile(path.join(directory,`ang-${w.ang}.md`));
 assert.equal(bytes.length,w.bytes);assert.equal(sha(bytes),w.sha256,'Pinned witness bytes');
 assert.equal(crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes])).digest('hex'),w.gitBlob,'Git blob');
 const records=[...bytes.toString('utf8').matchAll(/<!-- LINE:(\d+) -->\s*\*\*(.*?)\*\*/gs)];
 for(const [index,match] of records.entries())all.push({ang:w.ang,sourceRow:index+1,sourceAngLine:Number(match[1]),text:match[2]});
}
const titleIndex=all.findIndex(r=>r.text==='ਸਲੋਕ ਮਹਲਾ ੯ ॥');
assert.ok(titleIndex>0);assert.equal(all[titleIndex-1].text,'ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥');
const end=all.findIndex(r=>r.text.endsWith('॥੫੭॥੧॥'))+1;
const selected=all.slice(titleIndex-1,end);
assert.equal(selected.length,117);assert.equal(sha(selected.map(r=>r.text).join('\n')),sequenceSHA);
assert.equal(all[end].text,'ਮੁੰਦਾਵਣੀ ਮਹਲਾ ੫ ॥');
const record=(row,id,kind)=>({id,kind,text:row.text,sha256:sha(row.text),family:'sggs',location:{system:'ang',ang:row.ang},held:false,
 source:{repository:'opengranth/open-granth',commit,path:`corpus/ang-${row.ang}.md`,row:row.sourceRow,printedLine:row.sourceAngLine}});
const preface=[record(selected[0],'sggs.salok-mahalla9.invocation01','invocation'),record(selected[1],'sggs.salok-mahalla9.heading01','heading')];
const digits=n=>String(n).replace(/[0-9]/g,d=>'੦੧੨੩੪੫੬੭੮੯'[Number(d)]);
let position=2;
const units=[];
for(let ordinal=1;ordinal<=57;ordinal++){
 const id=`sggs.salok-mahalla9.salok${String(ordinal).padStart(3,'0')}`;
 const headings=[];
 if(ordinal===53){assert.equal(selected[position].text,'ਦੋਹਰਾ ॥');headings.push(record(selected[position++],'sggs.salok-mahalla9.dohra.heading01','heading'));}
 const lines=[record(selected[position++],id+'.line01','verse'),record(selected[position++],id+'.line02','verse')];
 assert.ok(lines[1].text.endsWith(ordinal===57?'॥੫੭॥੧॥':`॥${digits(ordinal)}॥`));
 const u={id,ordinal,title:`Salok ${ordinal}`,titleGurmukhi:`ਸਲੋਕ ${digits(ordinal)}`,sourceFamily:'sggs',
  authorId:'guru-tegh-bahadur',authorBasis:'Collection heading ਸਲੋਕ ਮਹਲਾ ੯; no per-Salok historical attribution adjudication',
  angStart:lines[0].location.ang,angEnd:lines[1].location.ang,sourceHeadingIncluded:false,metricalHeadings:headings,lines};
 u.sourceDigest=sha([...headings,...lines].map(r=>r.id+'\t'+r.sha256).join('\n'));
 units.push(u);
}
assert.equal(position,117);assert.deepEqual([units[28].angStart,units[28].angEnd],[1427,1428]);
const pack={schema:'GLP-NITNEM-SOURCE-V2',compositionId:'salok-mahalla9',originalCompositionId:'salok-mahalla9',
 title:'Salok Mahalla 9',titleGurmukhi:'ਸਲੋਕ ਮਹਲਾ ੯',daypart:'Additional Bani',sourceFamily:'sggs',
 reference:'Sri Guru Granth Sahib Ji · Ang 1426–1429 · Guru Tegh Bahadur Ji',
 caveat:'Complete numbered sequence 1–57. Text checked against two digital sources; qualified collation is pending. The following Mundavani Mahalla 5 is a separate composition.',
 sourceTextSequenceSha256:sequenceSHA,sourceRepositoryCommit:commit,editionId:edition,
 sourceStatus:'DIGITAL_SOURCE_COMPARED_QUALIFIED_REVIEW_PENDING',humanCollationApproved:false,translationApproved:false,
 sections:[],preface,unitCount:57,originalLineCount:114,sourceOccurrenceCount:117,units,
 sourceAudit:{schema:'glp001.salok-mahalla9-source-audit.v1',selectedDigitalWitness:'Pinned Open Granth Gurmukhi records',
  repository:'opengranth/open-granth',commit,witnesses,exactTextSequenceSha256:sequenceSHA,
  sequenceDefinition:'UTF-8 occurrence texts in source order joined with LF; no final LF',
  secondarySource:'SriGranth, Angs 1426–1429; independently retrieved web-extracted Unicode strings',
  secondaryComparisonEvidence:'research/salok-mahalla9/source-audit-independent.json',
  secondaryExactMatches:117,secondaryMismatches:0,qualifiedHumanReviewCount:0,modernTranslationsImported:false,
  printedEditionReviewed:false,sourceHeadingIsMusicalRaag:false,
  boundaries:{preceding:all[titleIndex-2],following:all[end]},
  limitations:['Digital agreement does not authenticate a printed saroop or establish independent textual lineage.','Historical discussions concerning Salok 54 are not resolved by this extraction.','The archived 2022 candidate has editorial pause marks; it is retained separately and is not silently rewritten.']},
 releaseId:release,publicationStatus:'EDUCATIONAL_DRAFT',releaseChannel:'DEVELOPMENT_REVIEW',previousEditionIds:[]};
const json=x=>JSON.stringify(x,null,2)+'\n';
const output=path.join(root,'salok-mahalla9/data');await fs.mkdir(output,{recursive:true});
const packBytes=json(pack);await fs.writeFile(path.join(output,'salok-mahalla9.json'),packBytes);
const manifest={schema:'GLP-NITNEM-LIBRARY-V2',sourceCommit:commit,sourceFamilySite:'gurbani-learning-library',
 releaseStatus:'DEVELOPMENT_REVIEW',canonicalJapji:'../full-japji.html',audioSynced:false,
 entries:{'salok-mahalla9':{path:'data/salok-mahalla9.json',sha256:sha(packBytes),units:57,lines:114,sourceOccurrences:117,
  title:pack.title,titleGurmukhi:pack.titleGurmukhi,editionId:edition,daypart:'Additional Bani'}},
 releaseId:release,qualifiedHumanReviewed:false};
await fs.writeFile(path.join(output,'library.json'),json(manifest));
console.log(JSON.stringify({status:'PASS',units:57,verses:114,allOccurrences:117,sourceTextSequenceSHA256:sequenceSHA,packSHA256:sha(packBytes),manifestSHA256:sha(json(manifest))}));
