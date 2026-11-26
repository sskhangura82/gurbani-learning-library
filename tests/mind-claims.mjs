import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),read=x=>fs.readFileSync(new URL(x,root),'utf8');
const claims=JSON.parse(read('docs/research/MIND_ROOM_CLAIMS_v1.json'));
const stories=read('docs/research/MIND_ROOM_STORYBOARDS_v1.md');
const scope={window:{}};vm.runInNewContext(read('js/japji-full-data.js'),scope);
const corpus=new Map(scope.window.GLP_FULL_JAPJI.units.flatMap(u=>u.lines.map(l=>[l.id,l])));
const topics=claims.topics;
const dangerous=/(you have a mental disorder|cure your anxiety|you are a narcissist|hold your breath|breathe in for \d|step 1: inhale|track your symptoms|take medication)/i;

test('Exactly four bounded topics; no duplicate IDs or new runtime publication',()=>{
 assert.equal(topics.length,4);assert.equal(new Set(topics.map(t=>t.themeId)).size,4);
 assert.equal(claims.policy.runtimePublication,false);assert.equal(claims.publication.publicReleaseWord,false);
});
test('Every Gurmukhi fragment is a verbatim substring of a frozen occurrence',()=>{
 for(const t of topics)for(const a of t.anchors){
  const original=corpus.get(a.occurrenceId);assert.ok(original,a.occurrenceId);
  assert.equal(original.ang,a.ang);
  assert.equal(original.sha256,a.sourceSha256);
  assert.ok(original.text.includes(a.quote),a.quote);
  assert.equal(createHash('sha256').update(original.text).digest('hex'),original.sha256);
 }
});
test('Incorrect original ਚੁਪਿ fails source quote comparison',()=>{
 const candidate=topics.find(t=>t.themeId==='mind.quiet').anchors[0];
 assert.equal(candidate.quote,'ਚੁਪੈ ਚੁਪ');
 assert.ok(!corpus.get(candidate.occurrenceId).text.includes('ਚੁਪਿ'));
});
test('Every content draft has both English and Punjabi prose and a central question',()=>{
 for(const t of topics){
  for(const loc of ['en','pa']){
   assert.ok(typeof t.title[loc]==='string'&&t.title[loc].trim().length>4,t.themeId+':title:'+loc);
   for(const part of [t.closeMeaning,t.sikhReading,t.ordinaryScenario,t.optionalReflection,t.teachBack])
    assert.ok(typeof part[loc]==='string'&&part[loc].trim().length>20,t.themeId+':body:'+loc);
  }
  assert.ok(t.centralQuestion.en&&t.centralQuestion.pa);
 }
});
test('Every psychology topic has an evidence tier and a non-equivalence boundary',()=>{
 for(const t of topics){
  assert.match(t.psychologyLens.tier,/^[ABCD]$/);
  assert.ok(t.psychologyLens.sourceIds.length>0);
  assert.ok(t.whereComparisonBreaks.length>55);
  assert.ok(t.explicitBoundary.length>35);
  assert.ok(t.psychologyLens.authority.includes('pending'));
 }
});
test('No psychology source is presented as an exact verified published excerpt',()=>{
 for(const e of Object.values(claims.psychologyEvidenceRegister)){
  assert.ok(/^https:\/\//.test(e.url));assert.equal(e.exactAbstractQuoteReviewed??false,false);
 }
});
test('External scripture candidates carry neither invented quotations nor a review token',()=>{
 const ext=topics.flatMap(t=>t.externalScriptureCandidates);
 assert.equal(ext.length,2);
 for(const item of ext){assert.equal(item.displayOriginalQuote,null);assert.equal(item.corpusStatus,'NOT_INGESTED');assert.equal(item.humanCollation,'PENDING');assert.equal(item.publicUse,false);}
});
test('No topic falsely fills the independent scholar, founder or publication seats',()=>{
 for(const t of topics){
  assert.equal(t.status.sourceAnchorsCheckedAgainstFrozenCorpus,true);
  assert.equal(t.status.sikhPunjabiReviewed,false);
  assert.equal(t.status.psychologyEvidenceReviewed,false);
  assert.equal(t.status.founderProductAccepted,false);
  assert.equal(t.status.publicRuntimePublished,false);
 }
});
test('Drafts contain no practice prescriptions, synthetic voices or self-scoring',()=>{
 assert.equal(claims.policy.noClinicalInstructions,true);
 assert.equal(claims.policy.noPersonalProfiling,true);
 assert.equal(claims.policy.noSpiritualScores,true);
 for(const t of topics){
  assert.equal(t.practiceInstruction,false);
  assert.equal(t.optionalReflection.scored,false);
  assert.equal(t.ordinaryScenario.label.includes('not advice'),true);
  assert.equal(dangerous.test(JSON.stringify(t)),false);
 }
});
test('Mind is framed from Gurmukhi concepts, not Freud as first-source',()=>{
 assert.deepEqual(topics.map(t=>t.themeId),['mind.courage','mind.haumai','mind.craving','mind.quiet']);
 assert.equal(claims.topics.some(t=>/freud-first/i.test(t.title.en)),false);
});
test('Storyboard A and B each have 10 editorial beats, both languages in all rows',()=>{
 const a=stories.split('## Storyboard A')[1].split('## Storyboard B')[0];
 const b=stories.split('## Storyboard B')[1].split('## Editorial release blockers')[0];
 for(const s of [a,b]){
  const matches=[...s.matchAll(/^\| (?:\d+) · /gm)];
  assert.equal(matches.length,10);
  assert.ok(s.includes('English (original educational draft)')&&s.includes('ਪੰਜਾਬੀ (ਮਸੌਦਾ)'));
  assert.ok(s.includes('NOT to display'));
 }
});
test('Storyboards attribute invented case scenarios and not endorse unverified lines',()=>{
 assert.ok((stories.match(/Fictional scene/g)||[]).length===2);
 assert.ok(stories.includes('NOT to display'));
 assert.ok(stories.includes('Sikh/Punjabi and psychology-evidence signoffs PENDING'));
});
test('No app source file changed in this editorial packet',()=>{
 assert.ok(!fs.existsSync(new URL('js/mind-room-content.js',root)));
 for(const file of ['js/japji-full-data.js','js/japji-full.js','js/line-meanings.js','full-japji.html'])assert.ok(fs.existsSync(new URL(file,root)));
});
