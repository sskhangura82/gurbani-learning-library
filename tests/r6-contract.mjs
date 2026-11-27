import {COLLECTIONS,TOOLS,EXPLORE} from '../library/catalog.mjs';
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import crypto from 'node:crypto';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),C=require('../js/continuous-core.js'),S=require('../js/shared-learning.js'),L=require('../js/learning.js'),root=new URL('../',import.meta.url),c={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('js/japji-full-data.js',root),'utf8'),c);const units=c.window.GLP_FULL_JAPJI.units,model=C.flatten(units),norm=x=>C.normalise(x,model,units);L.configureContinuous(C,model,units);const checks=[];
async function test(name,f){await f();checks.push({name,status:'PASS'});}
// The home executes one closed bundle; its source modules remain review inputs.
// Check the transport pin independently with Node crypto, without build-tool dependencies.
function assertLibraryModuleLoader(home){
 const scripts=[...home.matchAll(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi)].map(match=>match[0]);
 const modules=scripts.filter(tag=>/\btype\s*=\s*(["'])module\1/i.test(tag));
 const bytes=fs.readFileSync(new URL('library/app.bundle.mjs',root));
 const integrity='sha384-'+crypto.createHash('sha384').update(bytes).digest('base64');
 assert.equal(modules.length,1,'The home has exactly one executable module entry');
 assert.equal(modules[0],'<script type="module" src="library/app.bundle.mjs" integrity="'+integrity+'" crossorigin="anonymous"></script>',
  'The actual Library bundle has a matching integrity pin and anonymous module fetch');
 assert.ok(!scripts.some(tag=>/\bsrc\s*=\s*(["'])library\/(?:app|core|catalog)\.mjs\1/i.test(tag)),
  'The home cannot bypass the closed bundle through an original source module');
}
await test('Library home is distinct and complete Japji reader remains intact',()=>{const home=fs.readFileSync(new URL('index.html',root),'utf8'),reader=fs.readFileSync(new URL('full-japji.html',root),'utf8');assert.ok(home.includes('Nitnem')&&home.includes('id="today-tools"')&&home.includes('id="explore-list"'));assertLibraryModuleLoader(home);for(const [entries,id,title,href] of [[COLLECTIONS,'nitnem','Daily Nitnem','nitnem/index.html'],[TOOLS,'simran','Simran Room','simran.html'],[EXPLORE,'gurdwaras','Gurdwaras','gurdwaras.html']]){const entry=entries.find(x=>x.id===id);assert.equal(entry?.title,title);assert.equal(entry?.href,href);}assert.ok(reader.includes('continuous-reader')&&reader.includes('pace-shortcut'));assert.notEqual(home,reader);});
const hashes=JSON.parse(fs.readFileSync(new URL('fixtures/r5-preserved-sha256.json',import.meta.url)));
// Retain the original R5 file digest: accept only the five independently
// checked SRI attribute additions, then compare every original HTML byte.
function frozenComparableBytes(file){
 const bytes=fs.readFileSync(new URL(file,root));
 if(file!=='pauri-2-lesson.html')return bytes;
 let html=bytes.toString('utf8');
 const sources=['js/content.js','js/core.js','js/gurdwaras.js','js/places.js','js/app.js'];
 const tags=[...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi)].map(match=>match[0]);
 assert.equal(tags.length,sources.length,'The legacy lesson keeps exactly its five loaders');
 for(const [index,src] of sources.entries()){
  const integrity='sha384-'+crypto.createHash('sha384').update(fs.readFileSync(new URL(src,root))).digest('base64');
  const pinned='<script src="'+src+'" integrity="'+integrity+'" crossorigin="anonymous"></script>';
  assert.equal(tags[index],pinned,'The original legacy loader is pinned without scheduling or order changes: '+src);
  html=html.replace(pinned,'<script src="'+src+'"></script>');
 }
 return Buffer.from(html);
}
await test('Frozen scripture and drafts remain byte-identical to R5; legacy lesson adds only checked script pins',()=>{for(const [file,sha] of Object.entries(hashes))if(!['js/continuous-core.js','js/learning.js'].includes(file))assert.equal(crypto.createHash('sha256').update(frozenComparableBytes(file)).digest('hex'),sha,file);});
await test('Pace accepts 150, 155, 160 and preserves legacy 140',()=>{for(const v of [50,70,100,140,150,155,160])assert.equal(norm({pace:v}).pace,v);for(const bad of [-1,0,47,147,165,Infinity,'160'])assert.equal(norm({pace:bad}).pace,70);});
await test('Persistent-control preference defaults safely, validates boolean and survives export/import',()=>{assert.equal(norm({}).persistentControls,false);assert.equal(norm({persistentControls:'true'}).persistentControls,false);const s=new Map(),storage={getItem:k=>s.get(k)||null,setItem:(k,v)=>s.set(k,v),removeItem:k=>s.delete(k)};storage.setItem(L.CONT,JSON.stringify(norm({persistentControls:true,notes:{'pauri02.line01':'QA · ਪੰਜਾਬੀ'},bookmarks:['pauri02.line01']})));const backup=L.parse(L.exportAll(storage));const t=new Map(),dest={getItem:k=>t.get(k)||null,setItem:(k,v)=>t.set(k,v),removeItem:k=>t.delete(k)};L.importAll(dest,backup);const result=JSON.parse(dest.getItem(L.CONT));assert.equal(result.persistentControls,true);assert.equal(result.notes['pauri02.line01'],'QA · ਪੰਜਾਬੀ');assert.deepEqual(result.bookmarks,['pauri02.line01']);});
await test('A stale tab cannot overwrite the persistent-control preference or saved notes',async()=>{let saved=null;const storage={getItem:()=>saved,setItem:(k,v)=>saved=v};const locks={request:async(n,o,f)=>typeof o==='function'?o():f({})},a=S.create({storage,locks,key:L.CONT,normalise:norm,seed:norm({})}),seed=norm({});await a.save(seed,{preferences:{persistentControls:true},notes:{'pauri02.line01':'QA retained'}});await a.save(seed);assert.equal(a.read().persistentControls,true);assert.equal(a.read().notes['pauri02.line01'],'QA retained');});
await test('One complete guide traversal visits all 385 original lines once in order without an early stop',()=>{let p={index:0,token:0},seen=new Set([0]),steps=0;const max=model.lines.reduce((n,l)=>n+l.tokens.length,0);while(steps++<=max){const n=C.advance(p,model.lines);seen.add(n.index);if(n.finished){assert.equal(n.index,384);break;}p=n;}assert.equal(seen.size,385);assert.equal(steps,max);});
await test('Forced reduced-motion fixture exactly matches production declarations',()=>{const css=fs.readFileSync(new URL('css/japji-full.css',root),'utf8'),marker='@media(prefers-reduced-motion:reduce){',start=css.indexOf(marker)+marker.length;let depth=1,end=start;while(depth){if(css[end]==='{')depth++;if(css[end]==='}')depth--;end++;}assert.ok(fs.readFileSync(new URL('tests/reduced-motion-forced.css',root),'utf8').includes(css.slice(start,end-1)));});
fs.writeFileSync(new URL('evidence/r6-contract.json',root),JSON.stringify({environment:'Node portable contracts',checks,total:checks.length},null,2));console.log(JSON.stringify({total:checks.length,status:'PASS'}));
