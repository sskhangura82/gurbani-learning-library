import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {READER_SCRIPT_POLICY,pinReaderHTML,refreshReaderSRI} from '../tools/refresh-reader-sri.mjs';

const root=fileURLToPath(new URL('../',import.meta.url)),base='389e79baff4016a2ff61d1851908de0bd66beb8f';
const read=relative=>fs.readFile(path.join(root,relative));
const common=['appearance.js','continuous-core.js','learning/learning-ui.js','local-learning.js','reader.js','offline.js'];
// Independently named reader entrypoints: do not derive expected coverage from the generator.
const expected={
 'nitnem/index.html':common,
 'sukhmani.html':['js/source-integrity.js','js/sukhmani-data.js','js/sukhmani-teaching.js','js/sukhmani-learning.js','js/shared-learning.js','js/sukhmani-reader.js','js/pwa.js'],
 'full-japji.html':['js/source-integrity.js','js/japji-full-data.js','js/content.js','js/gurdwaras.js','js/continuous-core.js','js/learning.js','js/shared-learning.js','js/japji-lessons.js','js/line-meanings.js','js/japji-full.js','js/pwa.js'],
 'salok-mahalla9/index.html':common.map(p=>'../nitnem/'+p),
 'salok-kabir/index.html':common.map(p=>'../nitnem/'+p)
};
const scripts=html=>[...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi)].map(m=>m[0]);
const attr=(tag,name)=>tag.match(new RegExp('\\b'+name+'="([^"]*)"'))?.[1];
const stripPins=html=>html.replace(/ integrity="[^"]*"/g,'').replace(/ crossorigin="anonymous"/g,'');
test('All 36 ordered classic reader script occurrences have exact file pins and anonymous CORS',async()=>{
 let total=0;
 for(const [page,ordered] of Object.entries(expected)){
  const html=(await read(page)).toString(),tags=scripts(html);
  assert.deepEqual(tags.map(t=>attr(t,'src')),ordered,page+' entrypoints');
  for(const tag of tags){
   const src=attr(tag,'src'),integrity=attr(tag,'integrity'),crossorigin=attr(tag,'crossorigin');
   assert.equal(crossorigin,'anonymous');assert.ok(integrity,src+' must carry a pin');
   const algorithm=page.startsWith('salok-')?'sha256':'sha384';
   const bytes=await read(path.posix.normalize(path.posix.join(path.posix.dirname(page),src)));
   assert.equal(integrity,algorithm+'-'+createHash(algorithm).update(bytes).digest('base64'),page+' '+src);
   assert.equal(attr(tag,'type'),undefined,'This contract covers classic scripts only');total++;
  }
 }
 assert.equal(total,36);
});
test('Pinning changes no reader markup, source wording or script order beyond integrity attributes',async()=>{
 for(const page of Object.keys(expected)){
  const original=execFileSync('git',['show',base+':'+page],{cwd:root,encoding:'utf8'});
  assert.equal(stripPins((await read(page)).toString()),stripPins(original),page);
 }
});
test('Check mode reproduces all pins without writing page bytes',async()=>{
 const before=await Promise.all(Object.keys(expected).map(read));
 const report=await refreshReaderSRI({directory:root,write:false});
 assert.equal(report.status,'PASS');assert.equal(report.pages,5);assert.equal(report.scriptOccurrences,36);assert.deepEqual(report.changedPages,[]);
 const after=await Promise.all(Object.keys(expected).map(read));assert.deepEqual(after,before);
});
test('The generator refuses missing, extra, inline, module and reordered script inventories',async()=>{
 const policy=READER_SCRIPT_POLICY.find(p=>p.page==='nitnem/index.html'),html=(await read(policy.page)).toString(),tags=scripts(html);
 const variants=[
  html.replace(tags[0],''),
  html.replace('</body>','<script src="unexpected.js"></script></body>'),
  html.replace(tags[0],'<script>window.synthetic=true;</script>'),
  html.replace(tags[0],tags[0].replace('<script ','<script type="module" ')),
  html.replace(tags[0],'__FIRST_SCRIPT__').replace(tags[1],tags[0]).replace('__FIRST_SCRIPT__',tags[1]),
  html.replace('src="appearance.js"','src="unreviewed.js"')
 ];
 for(const changed of variants)await assert.rejects(()=>pinReaderHTML(changed,policy,read),/unexpected|reordered/i);
});
test('The generator cannot refresh a changed frozen source or verifier into acceptance',async()=>{
 const policy=READER_SCRIPT_POLICY.find(p=>p.page==='sukhmani.html'),html=(await read(policy.page)).toString();
 for(const target of ['js/source-integrity.js','js/sukhmani-data.js']){
  await assert.rejects(()=>pinReaderHTML(html,policy,async name=>{
   const bytes=await read(name);return name===target?Buffer.concat([bytes,Buffer.from('\n/* synthetic changed bytes */\n')]):bytes;
  }),/Frozen source\/verifier bytes changed/);
 }
});
