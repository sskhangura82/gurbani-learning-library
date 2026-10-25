/* N4 Rehras SGPC six-section source candidate integrity, NOT source approval. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=f=>JSON.parse(fs.readFileSync(new URL(f,root),'utf8'));
const model=read('docs/research/n4-rehras-composite/rehras-sgpc-digital-composite-candidate.json');
const ledger=read('docs/research/n4-rehras-composite/rehras-sgpc-source-differences.json');
const anand=read('docs/research/n2-anand/anand-40-original-candidate.json');
const chaupai=read('docs/research/n4-chaupai-excerpt/chaupai-sgpc-excerpt-candidate.json');
const sha=t=>crypto.createHash('sha256').update(t).digest('hex');
const checks=[];function test(name,fn){fn();checks.push(name);}
const sections=model.sections,units=sections.flatMap(s=>s.units),lines=units.flatMap(u=>u.lines);
const keys=['sggs-nine','chaupai-25','savaiya-pae-gahe','dohira-sagal-duar','anand-selected','mundawani-slok'];
test('Composition is an explicit mixed SGGS + Dasam source candidate, not an SGGS Bani',()=>{
 assert.equal(model.sourceFamily,'composite');
 assert.equal(model.sourceApproved,false);
 assert.equal(model.humanTextCollationApproved,false);
 assert.equal(model.readerEnabled,false);
});
test('Official SGPC Rehat Maryada URL is recorded without assigning religious approval',()=>{
 assert.equal(model.referenceFramework,'https://sgpc.net/wp-content/uploads/2025/06/Sikh-Rehat-Maryada-English-n.pdf');
});
test('Exactly six SGPC structural components in the declared recitation order',()=>{
 assert.deepEqual(sections.map(s=>s.componentId),keys);
 assert.deepEqual(sections.map(s=>s.sourceFamily),['sggs','dasam','dasam','dasam','sggs','sggs']);
 assert.deepEqual(sections.map(s=>s.units.length),[9,25,1,1,6,2]);
});
test('44 numbered source units and 159 original web/cross-source records are fully represented',()=>{
 assert.equal(units.length,44);assert.equal(lines.length,159);
 assert.deepEqual(sections.map(s=>s.units.flatMap(u=>u.lines).length),[23,100,1,1,32,2]);
});
test('The entire composition stable serialized source digest and per-line SHA are frozen',()=>{
 assert.equal(sha(JSON.stringify(model)),'e1a2a6d7d61ecfa273d3724438a317d552bcffd62e4bd602c9c10530d699659a');
 assert.equal(sha(JSON.stringify(lines.map(l=>[l.id,l.text,l.sha256,l.sourceFamily,l.location]))),'9e1b61c4a18d54f2aa325bf3c88c8d7ee9d1aec73efea1e8112b40c48c85a3d4');
 const ids=new Set();
 for(const l of lines){
  assert.equal(sha(l.text),l.sha256);
  assert.ok(!ids.has(l.id));ids.add(l.id);
  assert.equal(l.unresolvedSourceReview,false);
 }
});
test('First SGGS source starts So Dar and ninth hymn ends with Saran Pare Ki Rakho Sarma',()=>{
 const first=sections[0].units[0].lines[0].text;
 const last=sections[0].units[8].lines.at(-1).text;
 assert.ok(first.startsWith('ਸੋ ਦਰੁ ਰਾਗੁ ਆਸਾ ਮਹਲਾ ੧'));
 assert.ok(last.endsWith('ਸਰਣਿ ਪਰੇ ਕੀ ਰਾਖਹੁ ਸਰਮਾ ॥੨॥੪॥'));
});
test('Nine SGGS hymns preserve their 23 original digital source paragraphs exactly once',()=>{
 const hymnLines=sections[0].units.flatMap(u=>u.lines);
 assert.equal(hymnLines.length,23);
 assert.deepEqual(hymnLines.map(l=>l.location.digitalHtmlParagraph),Array.from({length:23},(_,i)=>i+3));
 assert.ok(hymnLines.every(l=>l.sourceFamily==='sggs'&&l.location.angEdition==='PENDING_INDEPENDENT_SOURCE_COLLATION'));
});
test('Bounded evening Chaupai excerpt agrees byte-for-byte with preceding frozen 25-pauri source candidate',()=>{
 const rows=sections[1].units.flatMap(u=>u.lines),previous=chaupai.units.flatMap(u=>u.lines);
 assert.equal(rows.length,100);
 rows.forEach((r,i)=>{
  assert.equal(r.text,previous[i].text);
  assert.equal(r.sha256,previous[i].sha256);
  assert.equal(r.underlyingSourceOccurrenceId,previous[i].id);
 });
 assert.ok(rows[0].text.startsWith('ਹਮਰੀ ਕਰੋ'));
 assert.ok(rows.at(-1).text.startsWith('ਦੁਸਟ ਦੋਖ ਤੇ ਲੇਹੁ ਬਚਾਈ'));
});
test('Rehras evening Savaiya begins Pae Gahe and is distinct from ten morning Savaiye',()=>{
 assert.equal(sections[2].units.length,1);
 assert.ok(sections[2].units[0].lines[0].text.includes('ਪਾਂਇ ਗਹੇ ਜਬ ਤੇ ਤੁਮਰੇ'));
 assert.ok(sections[2].variantScopeNote.includes('NOT the ten morning'));
});
test('Dohira begins Sagal Duar and carries an explicit Dasam source locator',()=>{
 const l=sections[3].units[0].lines[0];
 assert.ok(l.text.includes('ਸਗਲ ਦੁਆਰ ਕਉ ਛਾਡਿ ਕੈ'));
 assert.equal(l.sourceFamily,'dasam');
 assert.equal(l.location.system,'dasam_section');
});
test('Six selected Anand pauris are 1–5 and 40 only, not full or quarantined 24',()=>{
 const u=sections[4].units;
 assert.deepEqual(u.map(x=>x.underlyingSourceUnit),['anand01','anand02','anand03','anand04','anand05','anand40']);
 assert.ok(!u.some(x=>x.underlyingSourceUnit==='anand24'));
});
test('Selected Anand verses share original source bytes and IDs with already pinned forty-pauri candidate',()=>{
 for(const u of sections[4].units){
  const original=anand.units.find(x=>x.unitId===u.underlyingSourceUnit);
  assert.equal(u.lines.length,original.lines.length);
  u.lines.forEach((l,i)=>{
   assert.equal(l.text,original.lines[i].text);
   assert.equal(l.sha256,original.lines[i].sha256);
   assert.equal(l.underlyingSourceOccurrenceId,original.lines[i].id);
   assert.ok(l.text.indexOf(String.fromCharCode(0xF03D))===-1);
  });
 }
});
test('Digital Rehras page contains the original selected Anand stanzas as verified substrings',()=>{
 assert.equal(ledger.rehrasSelectedAnandPauriTextComparisons.length,6);
 assert.ok(ledger.rehrasSelectedAnandPauriTextComparisons.every(x=>x.modelExactSubstringInsideRehrasPage));
 assert.deepEqual(ledger.rehrasSelectedAnandPauriTextComparisons.filter(x=>x.requiresFurtherEditorialReview).map(x=>x.sourcePauri),[1]);
});
test('Ending section contains only Mundawani and Mahla 5 Slok, no appended verse groups',()=>{
 assert.equal(sections[5].units.length,2);
 assert.ok(sections[5].units[0].lines[0].text.startsWith('ਮੁੰਦਾਵਣੀ ਮਹਲਾ ੫'));
 assert.ok(sections[5].units[1].lines[0].text.startsWith('ਸਲੋਕ ਮਹਲਾ ੫'));
});
test('Extra digital webpage material before and after strictly selected SGPC sequence is not discarded silently',()=>{
 assert.deepEqual(ledger.excludedExtraVariantWebParagraphs.map(x=>x.digitalHtmlParagraph),[0,1,2,49,50,51]);
 assert.ok(ledger.excludedExtraVariantWebParagraphs.every(x=>/^[a-f0-9]{64}$/.test(x.originalSha256)));
});
test('SGGS and Dasam textual groups never mis-attribute SGGS Ang to Dasam lines',()=>{
 for(const l of lines){
  if(l.sourceFamily==='dasam')assert.equal(l.location.system,'dasam_section');
  if(l.sourceFamily==='dasam')assert.ok(!('ang' in l.location));
  if(l.sourceFamily==='sggs')assert.ok(['sggs_rehras_section','ang'].includes(l.location.system));
 }
});
test('Each source section is individually blocked for edition, rights, publication',()=>{
 assert.ok(sections.every(s=>s.humanTextApproved===false&&s.rightsApproved===false&&s.variationReviewPending===true));
 assert.equal(ledger.sourceEditionCollation,'PENDING');
 assert.equal(ledger.qualifiedSikhPunjabiReview,'PENDING');
 assert.equal(ledger.published,false);
});
test('Web retrieval receipts are explicit HTTPS hashes, not qualified edition certificates',()=>{
 for(const x of [ledger.digitalPrimary,ledger.digitalComparator]){
  assert.equal(new URL(x.url).protocol,'https:');
  assert.equal(x.httpStatus,200);
  assert.match(x.webPageSha256,/^[a-f0-9]{64}$/);
  assert.ok(x.extractedOriginalParagraphs>=50);
 }
});
test('The release reader is disabled even with all six SGPC component structures present',()=>{
 assert.equal(model.readerEnabled,false);
 assert.equal(model.releaseAuthorized,false);
 assert.equal(ledger.totalCompositeBaniSourceApproved,false);
 assert.equal(ledger.familyReaderEnabled,false);
});
console.log(JSON.stringify({status:'PASS',tests:checks.length,checks,units:44,originalLineRecords:159,componentUnitCounts:[9,25,1,1,6,2],qualifiedSourceReview:'PENDING',published:false},null,2));
