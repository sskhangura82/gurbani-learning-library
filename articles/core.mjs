// Content-free article resolution. No interpretation, persistence or network here.
import {SOURCE_CONTRACTS,REFERENCE_CONTRACTS,TOPIC_CONTRACTS,ARTICLE_CONTRACTS} from './source-contracts.mjs';
const encoder=new TextEncoder(),decoder=new TextDecoder('utf-8',{fatal:true});
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
export class ArticleSourceError extends Error{
 constructor(code,message){super(message);this.name='ArticleSourceError';this.code=code;}
}
const need=(condition,code,message)=>{if(!condition)throw new ArticleSourceError(code,message);};
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
function copyBytes(value,limit){
 need(value instanceof Uint8Array||value instanceof ArrayBuffer,'ARTICLE_BYTES','Expected original file bytes.');
 const bytes=value instanceof Uint8Array?new Uint8Array(value):new Uint8Array(value.slice(0));
 need(bytes.byteLength>0&&bytes.byteLength<=limit,'ARTICLE_BYTES','File size is outside this reading sheet contract.');return bytes;
}
async function sha256(bytes){
 need(globalThis.crypto?.subtle,'ARTICLE_CRYPTO','Secure source checking is unavailable.');
 try{return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',typeof bytes==='string'?encoder.encode(bytes):bytes)),b=>b.toString(16).padStart(2,'0')).join('');}
 catch(error){if(error instanceof ArticleSourceError)throw error;throw new ArticleSourceError('ARTICLE_CRYPTO','Secure source checking could not finish.');}
}
function parse(bytes){
 try{return JSON.parse(decoder.decode(bytes));}catch(_){throw new ArticleSourceError('ARTICLE_JSON','This reading sheet file could not be read.');}
}
function keys(value,expected,label){
 need(value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).sort().join('|')===expected.slice().sort().join('|'),'ARTICLE_SCHEMA','Unexpected or missing '+label+' fields.');
}
function equalList(value,expected,label){
 need(Array.isArray(value)&&value.length===expected.length&&value.every((v,i)=>v===expected[i]),'ARTICLE_BINDING',label+' does not match the fixed reference contract.');
}
function verifyCatalog(bytes){
 const c=parse(copyBytes(bytes,32768));
 keys(c,['schema','releaseStatus','contentLayer','topics','articles'],'catalog');
 need(c.schema==='glp.articles.catalog.v1'&&c.releaseStatus==='REVIEW_CANDIDATE'&&c.contentLayer==='SOURCE_READING_SHEET','ARTICLE_LAYER','Unsupported catalog layer or release status.');
 need(Array.isArray(c.topics)&&c.topics.length===TOPIC_CONTRACTS.length&&Array.isArray(c.articles)&&c.articles.length===ARTICLE_CONTRACTS.length,'ARTICLE_COVERAGE','The reading sheet catalog is incomplete or contains unknown items.');
 for(let i=0;i<TOPIC_CONTRACTS.length;i++){
  const t=c.topics[i],expected=TOPIC_CONTRACTS[i];keys(t,['id','label','searchTerms','articleIds'],'topic');
  need(t.id===expected.id&&t.label===expected.label,'ARTICLE_TITLE','Unknown topic identity or editorial title.');
  equalList(t.searchTerms,expected.searchTerms,'Topic search aliases');equalList(t.articleIds,expected.articleIds,'Topic membership');
 }
 for(let i=0;i<ARTICLE_CONTRACTS.length;i++){
  const a=c.articles[i],expected=ARTICLE_CONTRACTS[i];
  keys(a,['id','topicId','title','kind','rights','reviewStatus','selection','referenceIds','explanation','claims'],'reading sheet');
  need(a.id===expected.id&&a.topicId===expected.topicId&&a.title===expected.title,'ARTICLE_TITLE','Unknown reading sheet identity or editorial title.');
  need(a.kind==='SOURCE_READING_SHEET'&&a.rights==='ORIGINAL_SCRIPTURE_ONLY'&&a.reviewStatus==='AWAITING_QUALIFIED_REVIEW','ARTICLE_LAYER','Unapproved article content, rights or review status.');
  keys(a.selection,['kind','token','semanticReviewed'],'selection');
  need(a.selection.kind==='LITERAL_TOKEN'&&a.selection.token===expected.selectionToken&&a.selection.semanticReviewed===false,'ARTICLE_SELECTION','The term-selection basis has changed.');
  equalList(a.referenceIds,expected.referenceIds,'Article reference');
  need(a.explanation===null&&Array.isArray(a.claims)&&a.claims.length===0,'ARTICLE_EXPOSITION','Explanation and claim content is not enabled in this review candidate.');
 }
 return c;
}
async function verifyPackage(sourceId,input){
 const contract=SOURCE_CONTRACTS[sourceId];
 need(contract,'ARTICLE_SOURCE','Unknown source package.');
 const bytes=copyBytes(input,2000000);
 need(await sha256(bytes)===contract.sha256,'ARTICLE_SOURCE_DIGEST','The complete original source package does not match the pinned edition.');
 const pack=parse(bytes);
 need(pack.schema==='GLP-NITNEM-SOURCE-V2'&&pack.compositionId===sourceId&&pack.originalCompositionId===sourceId&&pack.sourceFamily==='sggs'&&pack.editionId===contract.editionId&&pack.releaseId===contract.releaseId&&pack.sourceRepositoryCommit===contract.commit,'ARTICLE_SOURCE_IDENTITY','The original package identity does not match this edition.');
 need(pack.humanCollationApproved===false&&pack.translationApproved===false&&pack.sourceStatus===contract.sourceStatus&&pack.publicationStatus==='EDUCATIONAL_DRAFT'&&pack.releaseChannel==='DEVELOPMENT_REVIEW','ARTICLE_SOURCE_REVIEW','The original package review gate has changed.');
 need(pack.unitCount===contract.unitCount&&pack.originalLineCount===contract.lineCount&&pack.sourceOccurrenceCount===contract.occurrenceCount&&Array.isArray(pack.units)&&pack.units.length===contract.unitCount&&Array.isArray(pack.preface),'ARTICLE_SOURCE_COVERAGE','The complete source package is required.');
 const rows=[...pack.preface],unitMap=new Map();
 for(let i=0;i<pack.units.length;i++){
  const u=pack.units[i],id='sggs.'+sourceId+'.salok'+String(i+1).padStart(3,'0');
  need(u.id===id&&u.ordinal===i+1&&!unitMap.has(id)&&Array.isArray(u.lines)&&u.lines.length===2&&Array.isArray(u.metricalHeadings)&&!own(u,'sourceDisplayOrder'),'ARTICLE_SOURCE_IDENTITY','A Salok identity, order or complete unit has changed.');
  need(u.lines.every((line,j)=>line.id===id+'.line'+String(j+1).padStart(2,'0')&&line.kind==='verse'),'ARTICLE_SOURCE_IDENTITY','A verse occurrence identity has changed.');
  const unitRows=[...u.metricalHeadings,...u.lines];
  need(await sha256(unitRows.map(line=>line.id+'\t'+line.sha256).join('\n'))===u.sourceDigest,'ARTICLE_SOURCE_BINDING','A complete Salok binding has changed.');
  rows.push(...unitRows);unitMap.set(id,u);
 }
 need(rows.length===contract.occurrenceCount&&new Set(rows.map(l=>l.id)).size===rows.length,'ARTICLE_SOURCE_COVERAGE','A source occurrence is missing or duplicated.');
 for(const row of rows){
  need(typeof row.id==='string'&&typeof row.text==='string'&&row.text.length>0&&typeof row.sha256==='string'&&/^[a-f0-9]{64}$/.test(row.sha256)&&row.held===false&&!/[\uE000-\uF8FF]/u.test(row.text),'ARTICLE_SOURCE_OCCURRENCE','An original source occurrence is not ready for display.');
  need(row.family==='sggs'&&row.source?.repository===contract.repository&&row.source?.commit===contract.commit,'ARTICLE_SOURCE_IDENTITY','The occurrence provenance changed.');
 }
 const fingerprints=await Promise.all(rows.map(row=>sha256(row.text)));
 need(rows.every((row,i)=>row.sha256===fingerprints[i]),'ARTICLE_SOURCE_DIGEST','An original occurrence fingerprint changed.');
 need(pack.sourceTextSequenceSha256===contract.sequenceSha256&&await sha256(rows.map(row=>row.text).join('\n'))===contract.sequenceSha256,'ARTICLE_SOURCE_SEQUENCE','The complete original source sequence changed.');
 return {pack,unitMap};
}
function resolveReference(id,packages){
 const ref=REFERENCE_CONTRACTS[id];need(ref,'ARTICLE_REFERENCE','The source reference has no registered crosswalk.');
 const contract=SOURCE_CONTRACTS[ref.sourceId],source=packages.get(ref.sourceId),unit=source?.unitMap.get(ref.unitId);
 need(source?.pack.editionId===ref.editionId&&unit?.id===ref.unitId&&unit.ordinal===ref.ordinal&&unit.sourceDigest===ref.sourceDigest&&unit.lines.length===ref.lines.length,'ARTICLE_REFERENCE','The explicit source edition or complete Salok binding could not be resolved.');
 need(unit.lines.every((line,i)=>line.id===ref.lines[i].id&&line.sha256===ref.lines[i].sha256),'ARTICLE_REFERENCE','An exact ordered source occurrence binding could not be resolved.');
 // Deliberately do not forward source Ang fields or infer a musical Raag.
 // A digital locator is not a separately collated printed-page reference.
 return {
  id,compositionId:ref.sourceId,unitId:ref.unitId,label:contract.collectionLabel+' - Salok '+ref.ordinal,
  collectionLabel:contract.collectionLabel,attributionLabel:contract.attributionLabel,sectionLabel:contract.sectionLabel,
  readerPath:'../'+ref.sourceId+'/index.html?bani='+ref.sourceId+'&unit='+ref.ordinal,
  lines:unit.lines.map(line=>({id:line.id,text:line.text,sha256:line.sha256})),
  sourceRegister:{
   label:contract.collectionLabel+' - selected digital source package',editionId:ref.editionId,
   repository:contract.repository,commit:contract.commit,registeredOn:'2026-11-26',
   upstreamLineage:'Open Granth derives from Shabad OS. Agreement within this lineage is not an independent textual witness.',
   verificationScope:'Exact package bytes, complete original sequence and this complete Salok were checked against fixed bindings. This does not verify an explanation.',
   qualifiedReview:false,printedPageCollation:false
  }
 };
}
export async function loadArticleCatalog(catalogBytes,loadSourceBytes){
 const catalog=verifyCatalog(catalogBytes);
 need(typeof loadSourceBytes==='function','ARTICLE_LOADER','A source loader is required.');
 // Only contract-owned IDs reach the loader. Catalog data cannot supply a path,
 // URL, source ID, fallback or executable instruction.
 const sourceIds=[...new Set(ARTICLE_CONTRACTS.flatMap(article=>article.referenceIds.map(id=>REFERENCE_CONTRACTS[id].sourceId)))];
 const loaded=await Promise.all(sourceIds.map(async sourceId=>{
  let bytes;try{bytes=await loadSourceBytes(sourceId);}catch(_){throw new ArticleSourceError('ARTICLE_SOURCE_UNAVAILABLE','The complete local source package is unavailable.');}
  return [sourceId,await verifyPackage(sourceId,bytes)];
 }));
 const packages=new Map(loaded);
 const articles=catalog.articles.map(article=>{
  const references=article.referenceIds.map(id=>resolveReference(id,packages));
  need(references.every(ref=>ref.lines.some(line=>line.text.split(/[\s\u0964\u0965]+/u).includes(article.selection.token))),'ARTICLE_SELECTION','The literal selection token does not occur in the linked Salok.');
  return {id:article.id,topicId:article.topicId,title:article.title,selection:{...article.selection},references,explanation:null,claims:[],reviewStatus:article.reviewStatus};
 });
 // Publish only after every article and every source package succeeds.
 return freeze({schema:catalog.schema,topics:catalog.topics.map(t=>({...t,searchTerms:[...t.searchTerms],articleIds:[...t.articleIds]})),articles});
}
