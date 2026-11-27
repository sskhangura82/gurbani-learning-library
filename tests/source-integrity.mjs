// Published scripture is the fixture. Expected hashes below are fixed release receipts,
// never regenerated from the object being verified. Run: node --test tests/source-integrity.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),I=require('../js/source-integrity.js');
const root=new URL('../',import.meta.url),read=file=>fs.readFileSync(new URL(file,root),'utf8');
const sha=text=>createHash('sha256').update(text).digest('hex');
const fixed={
 japji:{file:'js/japji-full-data.js',html:'full-japji.html',reader:'js/japji-full.js',global:'GLP_FULL_JAPJI',element:'continuous-reader',fileHash:'7f5f78ac33da1a944e14c3d2b901926686df7e520e6fe681f6a28802d85e9808',objectHash:'299b420e289b985a17869e43566aed6b909196f24041350959d033ec58dd9346',unitCount:42,lineCount:385},
 sukhmani:{file:'js/sukhmani-data.js',html:'sukhmani.html',reader:'js/sukhmani-reader.js',global:'GLP_SUKHMANI',element:'sukhmani-text',fileHash:'0cdd704749265c09ead442ec5fd6c84569b1da34dd40ec021585dacd4a1c65f6',objectHash:'adaf34aa6ebf8eea70e0e2f6f67df3dccbce6c352805fca7e0a9c82f2e8f54f6',unitCount:24,lineCount:2027}
};
function source(kind){const s=read(fixed[kind].file);assert.equal(sha(s),fixed[kind].fileHash,'published source bytes changed');return JSON.parse(s.slice(s.indexOf('=')+1).trim().replace(/;$/,''));}
const units=(kind,d)=>d[kind==='japji'?'units':'ashtpadis'];
const textKey=kind=>kind==='japji'?'text':'gurmukhi';
const reject=(kind,d,code)=>assert.rejects(I.verify(kind,d),e=>e instanceof I.SourceIntegrityError&&(!code||e.code===code));
const reverseKeys=value=>Array.isArray(value)?value.map(reverseKeys):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).reverse().map(k=>[k,reverseKeys(value[k])])):value;
for(const kind of Object.keys(fixed)){
 test(kind+': unchanged published fixture passes every line and full-object check',async()=>{
  const d=source(kind),r=await I.verify(kind,d),f=fixed[kind];
  assert.equal(r.objectSha256,f.objectHash);assert.equal(r.sourceFileSha256,f.fileHash);assert.equal(r.unitCount,f.unitCount);assert.equal(r.lineCount,f.lineCount);assert.equal(r.lineHashesChecked,f.lineCount);
  assert.ok(Object.isFrozen(r)&&Object.isFrozen(d)&&units(kind,d).every(u=>Object.isFrozen(u)&&Object.isFrozen(u.lines)&&u.lines.every(Object.isFrozen)));
 });
 test(kind+': text and matching forged stored hash still fail the frozen object digest',async()=>{
  const d=source(kind),l=units(kind,d)[4].lines[1],key=textKey(kind);l[key]='ਬਦਲਿਆ ਹੋਇਆ ਪਾਠ ॥';l.sha256=sha(l[key]);await reject(kind,d,'SOURCE_OBJECT_HASH');
 });
 test(kind+': altered text with the old stored hash fails the per-line digest',async()=>{
  const d=source(kind),l=units(kind,d)[4].lines[1];l[textKey(kind)]+=' ';await reject(kind,d,'SOURCE_LINE_HASH');
 });
 test(kind+': a stored hash cannot be changed independently',async()=>{
  const d=source(kind);units(kind,d)[4].lines[1].sha256='0'.repeat(64);await reject(kind,d,'SOURCE_LINE_HASH');
 });
 test(kind+': deleting a line fails, even if declared counts are reduced',async()=>{
  const d=source(kind),u=units(kind,d)[4];u.lines.pop();if(kind==='sukhmani'){u.lineCount--;d.lineCount--;}else d.coverage.gurmukhiLines--;await reject(kind,d);
 });
 test(kind+': duplicate replacement preserves count but fails identity',async()=>{
  const d=source(kind),u=units(kind,d)[4];u.lines[1]=structuredClone(u.lines[0]);await reject(kind,d,'SOURCE_LINE_ID');
 });
 test(kind+': reordered lines fail before rendering',async()=>{
  const d=source(kind),u=units(kind,d)[4];[u.lines[0],u.lines[1]]=[u.lines[1],u.lines[0]];await reject(kind,d,'SOURCE_LINE_ID');
 });
 test(kind+': missing complete unit fails',async()=>{
  const d=source(kind);units(kind,d).splice(4,1);await reject(kind,d,'SOURCE_UNIT_COUNT');
 });
 test(kind+': reordered complete units fail',async()=>{
  const d=source(kind),u=units(kind,d);[u[4],u[5]]=[u[5],u[4]];await reject(kind,d,'SOURCE_UNIT_ID');
 });
 test(kind+': modified unit identifier fails',async()=>{
  const d=source(kind);units(kind,d)[4].id='changed-unit';await reject(kind,d,'SOURCE_UNIT_ID');
 });
 test(kind+': exact per-line Ang is required',async()=>{
  const d=source(kind);units(kind,d)[4].lines[1].ang++;await reject(kind,d,'SOURCE_LINE_ANG');
 });
 test(kind+': exact source-line location is required',async()=>{
  const d=source(kind);units(kind,d)[4].lines[1].sourceLine++;await reject(kind,d,'SOURCE_LINE_ANG');
 });
 test(kind+': exact unit Ang list is required',async()=>{
  const d=source(kind);units(kind,d)[4].angs=[999];await reject(kind,d,'SOURCE_UNIT_ANG');
 });
 test(kind+': non-text metadata is included in the frozen object digest',async()=>{
  const d=source(kind);d.source.name='A different source attribution';await reject(kind,d,'SOURCE_OBJECT_HASH');
 });
 test(kind+': adding metadata also fails the whole-object contract',async()=>{
  const d=source(kind);d.qualifiedHumanReviewApproved=true;await reject(kind,d,'SOURCE_OBJECT_HASH');
 });
 test(kind+': object key insertion order does not change the documented canonical digest',async()=>{
  const d=reverseKeys(source(kind));assert.equal((await I.verify(kind,d)).objectSha256,fixed[kind].objectHash);
 });
 test(kind+': data is frozen synchronously before WebCrypto yields',async()=>{
  const d=source(kind),l=units(kind,d)[4].lines[1],pending=I.verify(kind,d);
  assert.ok(Object.isFrozen(l));assert.throws(()=>{l[textKey(kind)]='later mutation';},TypeError);assert.throws(()=>units(kind,d).pop(),TypeError);await pending;
 });
 test(kind+': whole-file SRI pins both source and verifier before the reader script',()=>{
  const html=read(fixed[kind].html);
  for(const file of ['js/source-integrity.js',fixed[kind].file]){
   const tag=[...html.matchAll(/<script\b[^>]*>/g)].map(x=>x[0]).find(t=>t.includes('src="'+file+'"'));assert.ok(tag,file+' script exists');
   const want='sha384-'+createHash('sha384').update(read(file)).digest('base64');assert.ok(tag.includes('integrity="'+want+'"'));assert.ok(tag.includes('crossorigin="anonymous"'));assert.ok(html.indexOf(tag)<html.indexOf('src="'+fixed[kind].reader+'"'));
  }
 });
 test(kind+': actual reader blocks a forged source before model, DOM scripture or storage access',async()=>{
  const d=source(kind),l=units(kind,d)[4].lines[1];l[textKey(kind)]='ਬਦਲਿਆ ਹੋਇਆ ਪਾਠ ॥';l.sha256=sha(l[textKey(kind)]);
  const nodes=new Map(),make=()=>({dataset:{},textContent:'',hidden:false,disabled:false,attributes:{},setAttribute(k,v){this.attributes[k]=v;},replaceChildren(...children){this.children=children;this.textContent=children.map(x=>x.textContent||'').join('');},append(...children){this.children=[...(this.children||[]),...children];},addEventListener(name,fn){(this.listeners??={})[name]=fn;}});
  const get=id=>{if(!nodes.has(id))nodes.set(id,make());return nodes.get(id);},controls=[make(),make()],footer=make();let modelCalls=0,storageCalls=0;
  // The reader registers lifecycle listeners before asynchronous verification.
  // A real EventTarget preserves once/listener semantics without running the model.
  const lifecycle=new EventTarget();
  const window={[fixed[kind].global]:d,GLPSourceIntegrity:I,GLPContinuousCore:{flatten(){modelCalls++;throw Error('Model must not run');}},GLP_SUKHMANI_LEARNING:{model(){modelCalls++;throw Error('Model must not run');}},addEventListener:lifecycle.addEventListener.bind(lifecycle),removeEventListener:lifecycle.removeEventListener.bind(lifecycle),dispatchEvent:lifecycle.dispatchEvent.bind(lifecycle)};
  Object.defineProperty(window,'localStorage',{get(){storageCalls++;throw Error('Storage must not be accessed');}});
  const document={readyState:'loading',getElementById:get,querySelectorAll(){return controls;},querySelector(){return footer;},createElement(){return make();}};
  const history={scrollRestoration:'auto'};const result=vm.runInNewContext(read(fixed[kind].reader),{window,document,history,console});await result;
  assert.equal(get(fixed[kind].element).dataset.sourceIntegrity,'failed');assert.match(get(fixed[kind].element).textContent,/has not been displayed/);assert.equal(modelCalls,0);assert.equal(storageCalls,0);assert.ok(controls.every(x=>x.disabled));assert.ok(footer.hidden);const recover=get(fixed[kind].element).children.at(-1);const backup=recover.children.find(n=>n.id==='source-failure-export'||n.attributes.id==='source-failure-export');assert.ok(backup);assert.equal(backup.disabled,false);assert.equal(typeof backup.listeners.click,'function');assert.equal(window.GLP_SOURCE_INTEGRITY_RECEIPT,undefined);
 });
}
test('Sukhmani contiguous source sequence is required independently of line IDs',async()=>{const d=source('sukhmani');d.ashtpadis[4].lines[1].sequence++;await reject('sukhmani',d,'SOURCE_LINE_SEQUENCE');});
test('Sukhmani source identifier alteration is included in the object digest',async()=>{const d=source('sukhmani');d.ashtpadis[4].lines[1].sourceId+='-changed';await reject('sukhmani',d,'SOURCE_OBJECT_HASH');});
test('Sukhmani source approval metadata cannot change unnoticed',async()=>{const d=source('sukhmani');d.source.humanCollationApproved=true;await reject('sukhmani',d,'SOURCE_OBJECT_HASH');});
test('Accessor source values are rejected without invoking their getters',async()=>{const d=source('japji');let calls=0;Object.defineProperty(d,'extra',{enumerable:true,get(){calls++;return 'anything';}});await reject('japji',d,'SOURCE_JSON');assert.equal(calls,0);});
test('Sparse arrays, cycles and non-JSON values fail closed',async()=>{
 const a=source('japji');delete a.units[3];await reject('japji',a,'SOURCE_JSON');
 const b=source('japji');b.extra=b;await reject('japji',b,'SOURCE_JSON');
 const c=source('japji');c.extra=()=>42;await reject('japji',c,'SOURCE_JSON');
});
test('Frozen expected manifest cannot be overwritten to bless altered data',()=>{assert.ok(Object.isFrozen(I)&&Object.isFrozen(I.EXPECTED)&&Object.isFrozen(I.EXPECTED.japji.units[0].lines[0]));assert.throws(()=>{I.EXPECTED.japji.objectSha256='0'.repeat(64);},TypeError);});
test('Unavailable WebCrypto fails closed',async()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'crypto');Object.defineProperty(globalThis,'crypto',{configurable:true,value:undefined});
 try{await reject('japji',source('japji'),'SOURCE_CRYPTO');}finally{if(descriptor)Object.defineProperty(globalThis,'crypto',descriptor);else delete globalThis.crypto;}
});
test('Unsupported composition has no automatic trust fallback',async()=>{await assert.rejects(I.verify('unknown',{}),e=>e.code==='SOURCE_COMPOSITION');});
