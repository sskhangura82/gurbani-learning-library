import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {loadArticleCatalog,ArticleSourceError} from '../articles/core.mjs';
import {SOURCE_CONTRACTS,REFERENCE_CONTRACTS} from '../articles/source-contracts.mjs';
const dir=new URL('../articles/',import.meta.url),catalogBytes=await readFile(new URL('catalog.json',dir));
const original=JSON.parse(catalogBytes),sources=new Map(await Promise.all(Object.entries(SOURCE_CONTRACTS).map(async([id,s])=>[id,await readFile(new URL(s.path,dir))])));
const encode=value=>Buffer.from(JSON.stringify(value)),clone=value=>structuredClone(value),hash=text=>createHash('sha256').update(text).digest('hex');
const load=()=>loadArticleCatalog(catalogBytes,id=>sources.get(id));
function assertDeepFrozen(value){if(value&&typeof value==='object'){assert.equal(Object.isFrozen(value),true);Object.values(value).forEach(assertDeepFrozen);}}
async function rejectsCatalog(change,code){
 const draft=clone(original);change(draft);const called=[];
 await assert.rejects(loadArticleCatalog(encode(draft),id=>{called.push(id);return sources.get(id);}),error=>error instanceof ArticleSourceError&&(!code||error.code===code));
 assert.deepEqual(called,[],'Invalid editorial metadata must fail before any source load.');
}
async function rejectsSource(sourceId,change){
 const bytes=sources.get(sourceId),draft=JSON.parse(bytes);change(draft);
 await assert.rejects(loadArticleCatalog(catalogBytes,id=>id===sourceId?encode(draft):sources.get(id)),error=>error instanceof ArticleSourceError&&error.code==='ARTICLE_SOURCE_DIGEST');
 assert.equal(hash(sources.get(sourceId)),hash(bytes),'The fixture source must remain unchanged.');
}
function resealUntrustedPack(pack){
 const rows=[...pack.preface,...pack.units.flatMap(u=>[...u.metricalHeadings,...u.lines])];
 rows.forEach(row=>row.sha256=hash(row.text));
 pack.units.forEach(u=>u.sourceDigest=hash([...u.metricalHeadings,...u.lines].map(row=>row.id+'\t'+row.sha256).join('\n')));
 pack.sourceTextSequenceSha256=hash(rows.map(row=>row.text).join('\n'));
}

test('Resolves two complete Saloks from the existing canonical files, with exact Unicode and whitespace',async()=>{
 const view=await load();assert.equal(view.articles.length,2);assert.equal(view.topics.length,2);
 for(const article of view.articles){
  assert.equal(article.explanation,null);assert.deepEqual(article.claims,[]);assert.equal(article.selection.semanticReviewed,false);
  for(const reference of article.references){
   const binding=REFERENCE_CONTRACTS[reference.id],pack=JSON.parse(sources.get(reference.compositionId)),unit=pack.units.find(u=>u.id===reference.unitId);
   assert.equal(unit.lines.length,2);assert.equal(reference.lines.length,2);assert.deepEqual(reference.lines.map(l=>l.id),binding.lines.map(l=>l.id));
   assert.deepEqual(reference.lines,unit.lines.map(({id,text,sha256})=>({id,text,sha256})));
   assert.equal(reference.sourceRegister.qualifiedReview,false);assert.equal(reference.sourceRegister.printedPageCollation,false);
   assert.match(reference.sourceRegister.upstreamLineage,/not an independent textual witness/);
   assert.match(reference.sourceRegister.verificationScope,/does not verify an explanation/);
  }
 }
 assertDeepFrozen(view);
 assert.throws(()=>view.articles[0].references[0].lines[0].text='changed',TypeError);
});

test('One fixed loader call per complete source package; no editorial URL or path reaches the loader',async()=>{
 const calls=[];await loadArticleCatalog(catalogBytes,id=>{calls.push(id);assert.ok(Object.hasOwn(SOURCE_CONTRACTS,id));return sources.get(id);});
 assert.deepEqual(calls.sort(),['salok-kabir','salok-mahalla9']);
});

test('No Ang inference, borrowed Raag, claimed Kabir authorship or rights approval enters the display view',async()=>{
 const view=await load();
 const check=value=>{if(value&&typeof value==='object')for(const[key,item]of Object.entries(value)){assert.ok(!/^ang/i.test(key));assert.ok(!['authorId','canonicalAuthorId','rightsApproved'].includes(key));check(item);}};
 check(view);const kabir=view.articles.find(a=>a.id==='dubidha-source-sheet').references[0];
 assert.match(kabir.attributionLabel,/individual attribution review pending/);assert.match(kabir.sectionLabel,/no musical Raag assigned/);
});

for(const[name,change,code]of[
 ['unknown article identity',c=>c.articles[0].id='forged-sheet','ARTICLE_TITLE'],
 ['duplicate article identity',c=>c.articles[1].id=c.articles[0].id,'ARTICLE_TITLE'],
 ['scripture heading as editorial title',c=>c.articles[0].title='ਸਲੋਕੁ ਮਃ ੧ ॥','ARTICLE_TITLE'],
 ['invisible-mark heading title',c=>c.articles[0].title='ਸਲੋ\u200dਕੁ ਮਃ ੧ ॥','ARTICLE_TITLE'],
 ['unsafe HTML title',c=>c.articles[0].title='<img src=x onerror=alert(1)>','ARTICLE_TITLE'],
 ['scripture heading as topic label',c=>c.topics[0].label='ਸਲੋਕੁ ਮਃ ੧ ॥','ARTICLE_TITLE'],
 ['unknown topic alias',c=>c.topics[0].searchTerms.push('category'),'ARTICLE_BINDING'],
 ['swapped topic membership',c=>c.topics[0].articleIds=['dubidha-source-sheet'],'ARTICLE_BINDING'],
 ['nonempty explanation with valid source',c=>c.articles[0].explanation={text:'An asserted meaning',referenceIds:c.articles[0].referenceIds},'ARTICLE_EXPOSITION'],
 ['empty string passed as explanation',c=>c.articles[0].explanation='','ARTICLE_EXPOSITION'],
 ['sourced claim content',c=>c.articles[0].claims=[{text:'An asserted meaning',referenceIds:c.articles[0].referenceIds}],'ARTICLE_EXPOSITION'],
 ['hidden body content',c=>c.articles[0].body='A hidden explanation','ARTICLE_SCHEMA'],
 ['unknown external content layer',c=>c.contentLayer='COMPARATIVE_STUDY','ARTICLE_LAYER'],
 ['unknown article layer',c=>c.articles[0].kind='GURBANI_TEACHING','ARTICLE_LAYER'],
 ['claimed qualified approval',c=>c.articles[0].reviewStatus='QUALIFIED_REVIEWED','ARTICLE_LAYER'],
 ['claimed licensed outside text',c=>c.articles[0].rights='LICENSED_ARTICLE','ARTICLE_LAYER'],
 ['claimed semantic selection',c=>c.articles[0].selection.semanticReviewed=true,'ARTICLE_SELECTION'],
 ['substring term selection',c=>c.articles[0].selection.token='ਹਉ','ARTICLE_SELECTION'],
 ['first-line selection fallback',c=>c.articles[0].selection.firstLine='first line','ARTICLE_SCHEMA'],
 ['unknown reference ID',c=>c.articles[0].referenceIds=['unknown'],'ARTICLE_BINDING'],
 ['stale legacy reference ID',c=>c.articles[0].referenceIds=['glp.article-ref.salok-mahalla9.row-19'],'ARTICLE_BINDING'],
 ['swapped valid reference',c=>c.articles[0].referenceIds=c.articles[1].referenceIds,'ARTICLE_BINDING'],
 ['duplicated source reference',c=>c.articles[0].referenceIds.push(c.articles[0].referenceIds[0]),'ARTICLE_BINDING'],
 ['source URL injection',c=>c.articles[0].sourceUrl='https://example.invalid/verse','ARTICLE_SCHEMA'],
 ['source path injection',c=>c.articles[0].sourcePath='../../private','ARTICLE_SCHEMA'],
 ['row fallback injection',c=>c.articles[0].row=19,'ARTICLE_SCHEMA'],
 ['Ang fallback injection',c=>c.articles[0].ang=1427,'ARTICLE_SCHEMA'],
 ['unsafe HTML attribute',c=>c.articles[0].onload='alert(1)','ARTICLE_SCHEMA'],
 ['unknown catalog script field',c=>c.script='alert(1)','ARTICLE_SCHEMA'],
 ['missing topic',c=>c.topics.pop(),'ARTICLE_COVERAGE'],
 ['missing article',c=>c.articles.pop(),'ARTICLE_COVERAGE']
])test('Refuses '+name+' before rendering or source loading',()=>rejectsCatalog(change,code));

test('Rejects changed selected text even when all attacker-owned inner seals are recomputed',()=>rejectsSource('salok-mahalla9',pack=>{pack.units[18].lines[0].text+=' ';resealUntrustedPack(pack);}));
test('Rejects changed unselected text in the complete package',()=>rejectsSource('salok-kabir',pack=>{pack.units[100].lines[0].text+=' ';resealUntrustedPack(pack);}));
test('Rejects missing unselected Salok even after declared counts are lowered',()=>rejectsSource('salok-kabir',pack=>{pack.units.pop();pack.unitCount--;pack.originalLineCount-=2;pack.sourceOccurrenceCount-=2;resealUntrustedPack(pack);}));
test('Rejects duplicate occurrence IDs, even outside the displayed Salok',()=>rejectsSource('salok-mahalla9',pack=>{pack.units[0].lines[0].id=pack.units[1].lines[0].id;resealUntrustedPack(pack);}));
test('Rejects reassigned authorship, even when original text is unchanged',()=>rejectsSource('salok-kabir',pack=>{pack.units[24].authorId='invented-author';pack.units[24].attribution.canonicalAuthorId='invented-author';}));
test('Rejects new source-edition identity without an explicit reviewed crosswalk',()=>rejectsSource('salok-mahalla9',pack=>{pack.editionId='next-edition';}));
test('Rejects removed danda; comparison normalization never rewrites source',()=>rejectsSource('salok-kabir',pack=>{pack.units[24].lines[0].text=pack.units[24].lines[0].text.replace('॥','');resealUntrustedPack(pack);}));
test('Rejects structural heading changes even when selected verse text is intact',()=>rejectsSource('salok-kabir',pack=>{pack.preface[0].text+=' ॥';resealUntrustedPack(pack);}));
test('Rejects a source wrapper claiming qualified approval',()=>rejectsSource('salok-mahalla9',pack=>{pack.humanCollationApproved=true;}));
test('Rejects substituted complete package bytes under another package ID',async()=>{
 await assert.rejects(loadArticleCatalog(catalogBytes,()=>sources.get('salok-kabir')),error=>error instanceof ArticleSourceError&&error.code==='ARTICLE_SOURCE_DIGEST');
});
test('Refuses the whole catalog if one package is missing, with a bounded user-safe error',async()=>{
 await assert.rejects(loadArticleCatalog(catalogBytes,id=>{if(id==='salok-kabir')throw Error('private details must not escape');return sources.get(id);}),error=>error instanceof ArticleSourceError&&error.code==='ARTICLE_SOURCE_UNAVAILABLE'&&!error.message.includes('private details'));
});
test('Malformed JSON, oversized files and invalid byte types fail closed',async()=>{
 await assert.rejects(loadArticleCatalog(Buffer.from('{bad'),()=>{}),ArticleSourceError);
 await assert.rejects(loadArticleCatalog(Buffer.alloc(32769),()=>{}),ArticleSourceError);
 await assert.rejects(loadArticleCatalog(original,()=>{}),ArticleSourceError);
 await assert.rejects(loadArticleCatalog(catalogBytes,()=>Buffer.alloc(2000001)),ArticleSourceError);
});
test('Fixed source and reference contracts are deeply frozen and contain no source verse copies',()=>{
 assertDeepFrozen(SOURCE_CONTRACTS);assertDeepFrozen(REFERENCE_CONTRACTS);
 assert.equal(/[\u0A00-\u0A7F]/u.test(JSON.stringify(SOURCE_CONTRACTS)),false);
 assert.equal(/[\u0A00-\u0A7F]/u.test(JSON.stringify(REFERENCE_CONTRACTS)),false);
 assert.equal(JSON.stringify(original).includes('ਕਬੀਰ ਪ੍ਰੀਤਿ'),false);
});
