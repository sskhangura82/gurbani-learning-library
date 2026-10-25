/* GLP N4: Rehras composite planning contract, never literal scripture or published. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const ledger=JSON.parse(fs.readFileSync(new URL('docs/research/n4-rehras-component-ledger.json',root)));
const program=JSON.parse(fs.readFileSync(new URL('docs/research/full-nitnem-program-20261025.json',root)));
const checks=[];function test(name,fn){fn();checks.push(name);}
test('Reference manifest has exactly six SGPC ordered components',()=>{
 assert.equal(ledger.segments.length,6);
 assert.deepEqual(ledger.segments.map(s=>s.sequence),[1,2,3,4,5,6]);
 assert.equal(ledger.reference.url,'https://sgpc.net/sikh-rehat-maryada-in-english/');
});
test('Three SGGS and three Dasam component groups remain source-distinct',()=>{
 assert.deepEqual(ledger.segments.map(s=>s.sourceFamily),['sggs','dasam','dasam','dasam','sggs','sggs']);
});
test('Nine original SGGS hymns at start are a source contract, not fabricated verse count',()=>{
 assert.equal(ledger.segments[0].count,9);
 assert.equal(ledger.segments[0].verifiedOriginalCount,null);
});
test('Benti Chaupai evening excerpt has named start/end and is not generic full Chaupai',()=>{
 const r=ledger.segments[1];
 assert.ok(r.sourceReference.includes('Hamri Karo'));
 assert.ok(r.sourceReference.includes('Dust Dokh'));
 assert.equal(r.dependentComposition,'chaupai');
});
test('Evening Pae Gahe Savaiya does not substitute morning ten Savaiye',()=>{
 const s=ledger.segments[2];
 assert.equal(s.count,1);
 assert.ok(s.sourceReference.includes('not a substitute'));
 assert.equal(program.records.find(x=>x.id==='savaiye').period,'morning');
});
test('Dohira is independently identified instead of invented SGGS Ang',()=>{
 const s=ledger.segments[3];
 assert.equal(s.locationScheme,'dasam_section');assert.ok(s.sourceReference.includes('Sagal Duar'));
});
test('Selected Anand sequence is 1–5 + 40, not a different authored bani',()=>{
 const s=ledger.segments[4];
 assert.deepEqual(s.selection,[1,2,3,4,5,40]);
 assert.equal(s.dependentComposition,'anand');
 assert.equal(s.locationScheme,'ang');
});
test('Mundawani and Mahla 5 Salok stay two original SGGS components',()=>{
 const s=ledger.segments[5];
 assert.equal(s.sourceFamily,'sggs');assert.equal(s.count,2);
 assert.ok(s.sourceReference.includes('Mundawani'));
});
test('No SGGS Ang is fabricated for any Dasam segment',()=>{
 for(const s of ledger.segments.filter(s=>s.sourceFamily==='dasam')){
  assert.equal(s.locationScheme,'dasam_section');assert.ok(!/Ang \d/.test(s.sourceReference));
 }
});
test('All actual scripture/intake/edition fields remain blocked and absent',()=>{
 assert.equal(ledger.noRuntimeSourceData,true);assert.equal(ledger.noPublication,true);
 assert.ok(ledger.segments.every(s=>s.sourceStatus==='not_ingested'&&s.verifiedOriginalCount===null&&s.sourceEditionId===null));
 assert.ok(program.records.find(x=>x.id==='rehras').readerRoute===null);
});
test('Ardas remains a separate companion prayer, not a seventh Rehras verse source',()=>{
 assert.equal(ledger.companionOutsideBaniSequence,'ardas');
 assert.ok(!ledger.segments.some(s=>s.id==='ardas'));
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,cases:checks,originalTextImported:false,publicReaderEnabled:false},null,2));
