import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const root=new URL('../',import.meta.url),context={window:{}};
for(const file of ['js/content.js','js/japji-full-data.js','js/japji-lessons.js','js/line-meanings.js'])vm.runInNewContext(fs.readFileSync(new URL(file,root),'utf8'),context);
const w=context.window,units=w.GLP_FULL_JAPJI.units,meanings=new Map(),p2=units.find(u=>u.id==='pauri02');
p2.lines.forEach((line,i)=>{const previous=w.GURBANI_CONTENT.scripture.lines[i];if(previous.text===line.text)meanings.set(line.id,w.GURBANI_CONTENT.explanations[previous.id]);});
for(const e of w.GLP_LINE_MEANINGS)if(!meanings.has(e.id))meanings.set(e.id,e);
const coverage=units.map(u=>({id:u.id,title:u.title,angs:u.angs,originalOccurrences:u.lines.length,exactHashes:u.lines.filter(l=>crypto.createHash('sha256').update(l.text).digest('hex')===l.sha256).length,englishDrafts:u.lines.filter(l=>meanings.get(l.id)?.english?.trim()).length,punjabiDrafts:u.lines.filter(l=>meanings.get(l.id)?.punjabi?.trim()).length,studyDrafts:w.GLP_JAPJI_LESSONS.lessons[u.id]?1:0,review:'Unreviewed AI-assisted editorial drafts; no qualified approval claimed',independentComparison:u.id==='pauri13'?'Line 1 remains OPEN':'No new source decision in this UI release'}));
for(const u of coverage){assert.equal(u.exactHashes,u.originalOccurrences);assert.equal(u.englishDrafts,u.originalOccurrences);assert.equal(u.punjabiDrafts,u.originalOccurrences);assert.equal(u.studyDrafts,1);}
const totals=Object.fromEntries(['originalOccurrences','exactHashes','englishDrafts','punjabiDrafts','studyDrafts'].map(k=>[k,coverage.reduce((s,u)=>s+u[k],0)]));assert.equal(totals.originalOccurrences,385);assert.equal(coverage.length,42);
fs.writeFileSync(new URL('evidence/m0-coverage.json',root),JSON.stringify({runtime:'0.9-japji-v1-m0-candidate-1',units:42,pauris:38,totals,coverage},null,2)+'\n');console.log(JSON.stringify(totals));
