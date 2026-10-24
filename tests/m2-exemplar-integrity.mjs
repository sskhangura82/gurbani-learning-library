/* M2 manuscript/source binding gate; only structural tests, not theological review */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const corpus=fs.readFileSync(path.join(root,'js/japji-full-data.js'));
const ctx={window:{}};
vm.runInNewContext(corpus.toString('utf8'),ctx);
const units=ctx.window.GLP_FULL_JAPJI.units;
const manuscript=fs.readFileSync(path.join(root,'docs/research/M2_PAURI_01_02_DEEP_LESSON_EXEMPLARS.md'),'utf8');
const bindings=JSON.parse(fs.readFileSync(path.join(root,'docs/research/M2_EXEMPLAR_SOURCE_BINDINGS.json'),'utf8'));
const checks=[],check=(name,fn)=>{fn();checks.push(name);};
check('Exactly two lesson exemplars and twelve source occurrences',()=>{
 assert.deepEqual(bindings.units.map(u=>u.unitId),['pauri01','pauri02']);
 assert.equal(bindings.occurrences,12);
 assert.equal(bindings.units.flatMap(u=>u.lines).length,12);
});
check('Source data SHA-256 matches frozen Gurmukhi',()=>{
 assert.equal(bindings.sourceDataSHA256,crypto.createHash('sha256').update(corpus).digest('hex'));
});
check('Every original occurrence ID, Ang and SHA-256 matches the frozen corpus',()=>{
 for(const u of bindings.units){
  const actual=units.find(v=>v.id===u.unitId);
  assert.ok(actual,u.unitId);assert.equal(actual.angs[0],u.ang);assert.equal(actual.lines.length,6);
  for(let i=0;i<6;i++){
   const expected=u.lines[i],source=actual.lines[i];
   assert.equal(expected.id,source.id);assert.equal(expected.sha256,source.sha256);assert.equal(expected.ang,source.ang);
   assert.equal(source.sha256,crypto.createHash('sha256').update(source.text).digest('hex'));
  }
 }
});
check('Manuscript mentions each occurrence exactly once as a heading',()=>{
 const ids=[...manuscript.matchAll(/^### \d{2} · \`(pauri\d{2}\.line\d{2})\`$/gm)].map(m=>m[1]);
 assert.deepEqual(ids,bindings.units.flatMap(u=>u.lines.map(l=>l.id)));
});
check('The manuscript has the principal lesson scaffold (independent per-pauri checks run separately)',()=>{
 assert.ok(manuscript.includes('Arrival')&&manuscript.includes('Vocabulary')||manuscript.includes('Words that carry'));
 for(const label of ['Close reading','The turn','Reflection','Teach-back','Connected-teaching','interpretive']){
  assert.ok(manuscript.includes(label),label);
 }
});
check('Attribution sources declared and missing human seals explicit',()=>{
 for(const source of ['[S1]','[S2]','[S3]','[S4]','[S5]','[S6]'])assert.ok(manuscript.includes(source),source);
 assert.equal(bindings.status,'DRAFT_NOT_HUMAN_REVIEWED');
 assert.equal(bindings.editorialReview.qualifiedScriptureReviewed,false);
 assert.equal(bindings.editorialReview.qualifiedPunjabiReviewed,false);
 assert.equal(bindings.editorialReview.santhiyaReviewed,false);
});
check('Teaching draft keeps competing Sochai interpretations distinguishable',()=>{
 assert.ok(/purification/i.test(manuscript));assert.ok(/thinking/i.test(manuscript));
 assert.ok(manuscript.includes('Sahib Singh'));assert.ok(manuscript.includes('Teja Singh'));
});
check('Pauri 2 includes exactly sourced Ang 466 contextual candidates, not a fabricated seal',()=>{
 assert.ok(manuscript.includes('Ang 466'));assert.ok(manuscript.includes('CANDIDATE'));assert.ok(manuscript.includes('not qualified-reviewed'));
});
check('A manuscript cannot authorize collection of a human voice or publish new media',()=>{
 assert.ok(!/consent granted|recording approved|human-approved or deployed/i.test(manuscript));
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,sourceBoundOccurrences:12,qualifiedReview:'NONE',checkNames:checks},null,2));
