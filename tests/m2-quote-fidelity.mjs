/* GLP-001 draft editor quality checks: exact source quotations, all forms, per-pauri lesson structure.
   This does not certify the theological correctness of our explanatory drafts. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const manuscript=fs.readFileSync(path.join(root,'docs/research/M2_PAURI_01_02_DEEP_LESSON_EXEMPLARS.md'),'utf8');
const c={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'js/japji-full-data.js'),'utf8'),c);
const units=c.window.GLP_FULL_JAPJI.units.filter(u=>['pauri01','pauri02'].includes(u.id));
const rows=units.flatMap(u=>u.lines),byId=new Map(rows.map(l=>[l.id,l]));
const checks=[],test=(label,fn)=>{fn();checks.push(label);};
function unitBody(num){
 const head='# Pauri '+num+' —';
 const a=manuscript.indexOf(head);assert.ok(a>=0,head);
 const end=num===1?manuscript.indexOf('# Pauri 2 —',a):manuscript.indexOf('# Implementation and review',a);
 assert.ok(end>a,head);return manuscript.slice(a,end);
}
function sectionText(body,id){
 const tick=String.fromCharCode(96),header='### '+id.slice(-2)+' · '+tick+id+tick;
 const at=body.indexOf(header);assert.ok(at>=0,id);
 const end=body.indexOf('\n### ',at+1);
 return body.slice(at,end<0?undefined:end);
}
test('Twelve full original Gurbani quotations match all exact source occurrences',()=>{
 const found=[...manuscript.matchAll(/^> \*\*Exact Gurbani · (pauri\d{2}\.line\d{2}):\*\* (.+)$/gm)];
 assert.equal(found.length,12,'all original tuks must be explicitly anchored');
 for(const m of found){
  assert.ok(byId.has(m[1]),m[1]);assert.equal(m[2],byId.get(m[1]).text,m[1]);
  assert.equal(crypto.createHash('sha256').update(m[2]).digest('hex'),byId.get(m[1]).sha256);
 }
 assert.equal(JSON.stringify(found.map(m=>m[1])),JSON.stringify(rows.map(l=>l.id)));
});
test('Quoted multiword Gurbani in prose must be an exact contiguous substring',()=>{
 const re=/(?:“([^”\n]+)”|‘([^’\n]+)’|'([\u0A00-\u0A7F][^'\n]+)')/gu;
 for(const match of manuscript.matchAll(re)){
  const text=(match[1]||match[2]||match[3]).trim();
  const words=text.match(/[\u0A00-\u0A7F]+/gu)||[];
  if(words.length<2)continue; // single lexical gloss is not a verse quotation
  assert.ok(rows.some(line=>line.text.includes(text)),'Possible altered Gurbani quotation: '+text);
 }
});
test('Vocabulary lists only genuine Gurmukhi words from the source, never invented vowel endings',()=>{
 const tokens=new Set(rows.flatMap(l=>l.text.split(/\s+/u).map(x=>x.replace(/[॥੧੨]/gu,''))));
 const table=/^\| \*\*([^*]+)\*\*[^|]*\|/gm;
 for(const m of manuscript.matchAll(table)){
  const label=m[1];
  for(const phrase of label.split('·')){
   for(const w of (phrase.match(/[\u0A00-\u0A7F]+/gu)||[])){
    assert.ok(tokens.has(w),'Vocabulary word not found in Pauri 1 or 2: '+w);
   }
  }
 }
 assert.ok(!manuscript.includes('ਚੁਪਿ'),'Unattested form ਚੁਪਿ must not appear as Gurbani');
});
test('Five exact Hukam spellings occur exactly eleven times, matched to the lesson table',()=>{
 const words=units[1].lines.flatMap(l=>l.text.split(/\s+/u));
 const expected=new Map([['ਹੁਕਮੀ',5],['ਹੁਕਮੁ',1],['ਹੁਕਮਿ',2],['ਹੁਕਮੈ',2],['ਹੁਕਮ',1]]);
 let total=0;
 for(const [word,count] of expected){
  assert.equal(words.filter(w=>w===word).length,count,'Corpus usage '+word);
  const sec=unitBody(2);assert.ok(sec.includes('| **'+word+'**'),word+' must have dedicated grammatical note');
  total+=count;
 }
 assert.equal(total,11);
});
for(const [num,sections] of [
 [1,['## 1. Arrival','## 2. Words','## 3. Close reading','## 4. The turn','## 5. Where to connect next','## 6. Reflection','## 7. Teach-back']],
 [2,['## 1. Arrival','## 2. Vocabulary','## 3. Close reading','## 4. The turn','## 5. Connected-teaching','## 6. Reflection','## 7. Teach-back']]
]){
 test('Pauri '+num+' has its own ordered teaching sections rather than global label words',()=>{
  const body=unitBody(num);let previous=-1;
  for(const title of sections){const at=body.indexOf(title);assert.ok(at>previous,'Expected ordered section '+title);previous=at;}
  assert.ok(body.includes('**Gurbani context:**'),'context required '+num);
  assert.ok(body.includes('[S1]'),'source attribution required '+num);
 });
 test('Pauri '+num+' has six complete individual tuk explanations',()=>{
  const body=unitBody(num);
  for(const l of units[num-1].lines){
   const part=sectionText(body,l.id);
   assert.ok(part.includes('**Exact Gurbani · '+l.id+':** '+l.text));
   for(const label of ['**Simple English draft:**','**ਸੌਖੀ ਪੰਜਾਬੀ:**','**Study movement:**'])assert.ok(part.includes(label),'Missing '+label+' for '+l.id);
  }
 });
}
test('Pauri 1 includes the original concluding written/inscribed phrase in both simple meanings',()=>{
 const sec=sectionText(unitBody(1),'pauri01.line06');
 assert.ok(/written|inscribed/i.test(sec));assert.ok(sec.includes('ਲਿਖਿਆ ਨਾਲਿ'));assert.ok(sec.includes('ਲਿਖਿਆ'));
});
test('Pauri 2 explicitly handles honour as received and ਲਿਖਿ as written in both languages',()=>{
 const a=sectionText(unitBody(2),'pauri02.line02');
 assert.ok(/received/i.test(a));assert.ok(a.includes('ਮਿਲਦੀ'));
 const b=sectionText(unitBody(2),'pauri02.line03');
 assert.ok(/written|inscribed/i.test(b));assert.ok(b.includes('ਲਿਖੇ'));assert.ok(b.includes('ਪਾਈਅਹਿ'));
});
test('Each pauri acknowledges attributed interpretive diversity without self-certification',()=>{
 const p1=unitBody(1),p2=unitBody(2);
 assert.ok(p1.includes('Sahib Singh')&&p1.includes('[S4]')&&manuscript.includes('Teja Singh')&&p1.includes('cleansing')&&p1.includes('thinking'));
 assert.ok(p2.includes('Where the published readings place their emphasis')&&p2.includes('Sahib Singh')&&p2.includes('SriGranth')&&p2.includes('[S7]'));
 assert.ok(p1.includes('DRAFT')&&p2.includes('DRAFT'));
 assert.ok(!/qualified human approved|final scholarly seal/i.test(manuscript));
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,checkedOriginalQuotations:12,qualifiedScholarship:'NOT EVALUATED'},null,2));
