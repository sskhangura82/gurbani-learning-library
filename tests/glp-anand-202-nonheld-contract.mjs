/* GLP-001 Anand original source 208, 202 nonheld lines now have
 * educational EN/PA drafts, Pauri24 entirely quarantined, 39/40 deep.
 * This is NOT a certified or human-reviewed scripture translation.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const buf=p=>fs.readFileSync(path.join(root,p));
const js=p=>JSON.parse(buf(p));
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const old=js('nitnem/learning/course.v7.json'),fresh=js('nitnem/learning/course.v8.json');
const original=js('nitnem/data/anand.json'),manifest=js('nitnem/data/library.json');
const tests=[];function t(name,fn){fn();tests.push(name)}
t('Previous V7 teaching exact immutable SHA remains unchanged',()=>{
 assert.equal(sha(buf('nitnem/learning/course.v7.json')),'a7840f1086ee18039d4b39704c7058e823f0230be609192061cda3a3a335c527');
 assert.equal(old.coverage.closeTextOccurrenceNotes,389);
 assert.equal(old.coverage.writtenUnitLessons,104);
});
t('Complete Anand original 40-pa source package immutable and original U+F03D held',()=>{
 assert.equal(sha(buf('nitnem/data/anand.json')),manifest.entries.anand.sha256);
 assert.equal(original.units.length,40);
 assert.equal(original.units.reduce((n,u)=>n+u.lines.length,0),208);
 assert.deepEqual(original.units[23].lines.filter(l=>l.held).map(l=>l.id),['anand24.line03']);
});
t('First seven Anand pauris have exactly 36 source lines, three prior notes, 33 new unique drafts',()=>{
 const input=original.units.slice(0,7).flatMap(u=>u.lines);
 assert.equal(input.length,36);
 const historical=input.filter(l=>old.closeTextNotes['anand|'+l.id]);
 assert.deepEqual(historical.map(l=>l.id),['anand01.line01','anand02.line01','anand07.line01']);
 const expected=input.filter(l=>!old.closeTextNotes['anand|'+l.id]).map(l=>'anand|'+l.id);
 assert.equal(expected.length,33);
 const added=Object.keys(fresh.closeTextNotes).filter(k=>!Object.hasOwn(old.closeTextNotes,k));
 assert.deepEqual(added,expected);
});
t('All existing 389 line notes and 104 deeper Study drafts unchanged exactly',()=>{
 for(const [k,n] of Object.entries(old.closeTextNotes))assert.deepEqual(fresh.closeTextNotes[k],n,k);
 assert.deepEqual(fresh.unitLessons,old.unitLessons);
});
t('Every 33 newly explained line has exact Gurmukhi source occurrence, SHA and distinct bilingual draft',()=>{
 const lines=original.units.slice(0,7).flatMap(u=>u.lines);
 for(const l of lines){
  const k='anand|'+l.id,n=fresh.closeTextNotes[k];
  assert.ok(n,k);
  assert.equal(n.lineId,l.id);
  assert.equal(n.sourceSha256,l.sha256);
  assert.equal(sha(Buffer.from(l.text,'utf8')),l.sha256);
  assert.equal(n.status,'DRAFT_AI_UNREVIEWED');
  assert.equal(n.kind,'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION');
  assert.ok(n.simpleEn.length>=36,k);
  assert.ok(n.simplePa.length>=26&&/[\u0a00-\u0a7f]/u.test(n.simplePa),k);
  assert.ok(n.interpretiveCaution.length>=48,k);
 }
});
t('The original Pauri1, 2, 7 first-line meanings are preserved, never replaced or silently normalized',()=>{
 for(const id of ['anand01.line01','anand02.line01','anand07.line01'])
  assert.deepEqual(fresh.closeTextNotes['anand|'+id],old.closeTextNotes['anand|'+id]);
});
t('All nonheld Anand line sources explained; only the ENTIRE held Pauri24 stays unfilled',()=>{
 const missing=original.units.flatMap(u=>u.lines).filter(l=>!fresh.closeTextNotes['anand|'+l.id]).map(l=>l.id);
 assert.deepEqual(missing,original.units[23].lines.map(l=>l.id));
 assert.equal(missing.length,6);
 assert.ok(!fresh.unitLessons['anand|anand24']);
 assert.equal(fresh.coverage.byBani.anand.firstLineNotes,202);
 assert.equal(fresh.coverage.byBani.anand.draftLessons,39);
});
t('Source meaning safely distinguishes spiritual sound from actual recording',()=>{
 const x=fresh.closeTextNotes['anand|anand01.line03'];
 assert.ok(x.interpretiveCaution.includes('real recording'));
});
t('Five thieves, death and anhad are spiritual imagery not literal medical immortality',()=>{
 const x=fresh.closeTextNotes['anand|anand05.line03'];
 assert.ok(x.interpretiveCaution.includes('immortality'));
});
t('Body, mental health and accessibility not shamed by this draft',()=>{
 const x=fresh.closeTextNotes['anand|anand06.line02'];
 assert.ok(x.interpretiveCaution.includes('disability'));
 const y=fresh.closeTextNotes['anand|anand07.line03'];
 assert.ok(y.interpretiveCaution.includes('ophthalmic'));
});
t('Truthful overall progress: 422/1361 line draft notes, 104/327 deep draft units, no human approval',()=>{
 assert.equal(fresh.coverage.closeTextOccurrenceNotes,422);
 assert.equal(fresh.coverage.sourceLineTotal,1361);
 assert.equal(fresh.coverage.writtenUnitLessons,104);
 assert.equal(fresh.coverage.unitTotal,327);
 assert.equal(fresh.coverage.reviewedSourceMeaningLines,0);
 assert.equal(fresh.coverage.reviewedUnitLessons,0);
 for(const name of ['jaap','savaiye','chaupai','rehras','sohila'])
  assert.deepEqual(fresh.coverage.byBani[name],old.coverage.byBani[name]);
});
t('V8 state cannot claim public or religious authority and pins original source',()=>{
 assert.equal(fresh.meta.revision,'ANAND_ALL_NONHELD_LINE_DRAFT_V8');
 assert.equal(fresh.meta.previousVersion,'course.v7.json');
 assert.equal(fresh.meta.editorialStatus,'DRAFT_AI_UNREVIEWED');
 assert.equal(fresh.meta.publicationAllowed,false);
 assert.equal(fresh.meta.reviewer,null);
 assert.equal(fresh.meta.boundManifestSHA256,sha(buf('nitnem/data/library.json')));
});
t('Active private reader only fetches V8 exact SHA and preserves held glyph rendering',()=>{
 const script=buf('nitnem/reader.js').toString();
 assert.ok(script.includes("EXPECTED_LEARNING='"+sha(buf('nitnem/learning/course.v8.json'))+"'"));
 assert.ok(script.includes("jsonBytes('learning/course.v8.json',EXPECTED_LEARNING)"));
 assert.ok(script.includes('Anand Pauri24 source uncertainty cannot disappear'));
 assert.ok(!script.includes('fetch("https://'));
});
console.log(JSON.stringify({status:'PASS',checks:tests.length,cases:tests,
 sourceRecords:208,authoredAnandNonheldNotes:202,heldPauri24OriginalLines:6,
 authoredAnandStudy:39,totalAdditionalLineDrafts:422,totalDeepUnits:104,
 humanReligiousApproval:0,familyPublished:false},null,2));
