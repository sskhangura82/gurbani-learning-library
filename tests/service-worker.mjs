import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const root=new URL('../',import.meta.url),source=fs.readFileSync(new URL('sw.js',root),'utf8'),scope='https://example.test/gurbani/';
// Frozen prior release inventory from e0a6cff22771d42ce3a2fe91ad96863daae214ed.
// Keep the independently enumerated URLs in the test: deriving only a count
// from EXPECTED would allow a missing or substituted required asset to pass.
const priorAssets=[
 "./",
 "./full-japji.html",
 "./index.html",
 "./gurdwaras.html",
 "./gurdwara.html",
 "./simran.html",
 "./pauri-2-lesson.html",
 "./css/app.css",
 "./css/japji-full.css",
 "./css/home.css",
 "./css/arrivals.css",
 "./css/simran.css",
 "./js/home.js",
 "./js/arrivals.js",
 "./js/simran.js",
 "./js/app.js",
 "./js/content.js",
 "./js/core.js",
 "./js/gurdwaras.js",
 "./js/places.js",
 "./js/continuous-core.js",
 "./js/japji-full-data.js",
 "./js/japji-full.js",
 "./js/japji-lessons.js",
 "./js/line-meanings.js",
 "./js/learning.js",
 "./js/shared-learning.js",
 "./js/pwa.js",
 "./icons/icon-180.png",
 "./icons/icon-192.png",
 "./icons/icon-512.png",
 "./manifest.webmanifest",
 "./sukhmani.html",
 "./css/sukhmani.css",
 "./js/sukhmani-data.js",
 "./js/sukhmani-teaching.js",
 "./js/sukhmani-learning.js",
 "./js/sukhmani-reader.js",
 "./nitnem/",
 "./nitnem/index.html",
 "./nitnem/reader.js",
 "./nitnem/reader.css",
 "./nitnem/continuous-core.js",
 "./nitnem/appearance.js",
 "./nitnem/appearance.css",
 "./nitnem/local-learning.js",
 "./nitnem/offline.js",
 "./nitnem/learning/learning-ui.js",
 "./nitnem/learning/course.complete.json",
 "./nitnem/data/library.json",
 "./nitnem/data/jaap.json",
 "./nitnem/data/savaiye.json",
 "./nitnem/data/chaupai.json",
 "./nitnem/data/anand.json",
 "./nitnem/data/rehras.json",
 "./nitnem/data/sohila.json",
 "./js/source-integrity.js",
 "./salok-mahalla9/",
 "./salok-mahalla9/index.html",
 "./salok-mahalla9/data/library.json",
 "./salok-mahalla9/data/salok-mahalla9.json",
 "./salok-mahalla9/learning/course.complete.json",
 "./vendor/opengranth/LICENSE",
 "./vendor/opengranth/NOTICE",
 "./salok-kabir/",
 "./salok-kabir/index.html",
 "./salok-kabir/data/library.json",
 "./salok-kabir/data/salok-kabir.json",
 "./salok-kabir/learning/course.complete.json",
 "./breathing.html",
 "./css/breathing.css",
 "./js/breathing-core.js",
 "./js/breathing.js",
 "./articles/",
 "./articles/index.html",
 "./articles/article.html",
 "./articles/articles.css",
 "./articles/app.mjs",
 "./articles/core.mjs",
 "./articles/source-contracts.mjs",
 "./articles/catalog.json",
 "./library/catalog.mjs",
 "./library/core.mjs",
 "./library/app.mjs",
 "./library/library.css"
];
const additions=['./library/app.bundle.mjs','./articles/app.bundle.mjs','./knowledge/','./knowledge/index.html','./knowledge/style.css','./knowledge/app.bundle.mjs','./knowledge/scripture.json','./knowledge/pilot.json'];
const dailyShell=['./hukamnama/','./hukamnama/index.html','./hukamnama/style.css','./hukamnama/reader.bundle.mjs'];
const reviewedAdditions=['./salok-farid/','./salok-farid/index.html','./salok-farid/data/library.json','./salok-farid/data/salok-farid.json','./library/complete-passages.json','./library/passage-contracts.mjs','./library/passages.mjs','./library/passage-ui.mjs','./library/search.mjs','./library/kinds.mjs'];
const openCollections=['./collections/dasam/','./collections/dasam/index.html','./collections/collections.css','./psychology/','./psychology/index.html'];
const originalReaderShells=['./collections/sggs/','./collections/sggs/index.html','./collections/dasam/read.html','./collections/source-reader/reader.css','./collections/source-reader/reader.bundle.mjs'];
const publicPsychology=['./psychology/intellectual-humility.html','./psychology/attention.html','./psychology/emotion-regulation.html','./psychology/study.css'];
const requiredAssets=[...priorAssets,...additions,...dailyShell,...reviewedAdditions,...openCollections,...originalReaderShells,...publicPsychology];
const expected=JSON.parse(source.match(/const EXPECTED=(\{[^\n]+\});/)[1]),version=source.match(/const VERSION="([^"]+)";/)[1];
assert.equal(new Set(requiredAssets).size,requiredAssets.length,'Release inventory contains no duplicate URLs');
assert.deepEqual(Object.keys(expected).sort(),[...requiredAssets].sort(),'The complete prior release, bundled Knowledge and Daily shell must remain present');
assert.ok(!Object.keys(expected).some(name=>/^\.\/hukamnama\/(events|sources|receipts)\//.test(name)),'Dynamic Daily records must never be frozen into the shell');
assert.ok(!Object.keys(expected).some(name=>/^\.\/private-library(?:\/|$)/.test(name)),'Private reader and encrypted collection must not enter the public cache');
assert.ok(!Object.keys(expected).some(name=>/^\.\/collections\/source-data(?:\/|$)/.test(name)),'Full original corpora remain on demand rather than silently entering the shell');
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
for(const asset of requiredAssets){
 const file=new URL(asset.endsWith('/')?asset+'index.html':asset,root);
 assert.equal(digest(fs.readFileSync(file)),expected[asset],'Release manifest matches actual file bytes: '+asset);
}
function harness(corrupt=false){const events={},calls=[],saved=new Map(),retainedNativeClones=[];const previous='glp-static:'+scope+':old',other='glp-static:https://example.test/other/:old';
 const self={registration:{scope},location:{href:scope+'sw.js',origin:'https://example.test'},clients:{claim:async()=>calls.push('claim')},skipWaiting:()=>calls.push('skip'),addEventListener:(name,fn)=>events[name]=fn};
 // Cache Storage retains response bytes, not an already-read transport stream.
 const caches={open:async key=>({put:async(req,res)=>{const body=Buffer.from(await res.arrayBuffer());saved.set(req.url,{body,status:res.status,headers:[...res.headers]});},match:async req=>{for(const [u,res] of saved)if(new URL(u).pathname===new URL(req.url).pathname)return new Response(res.body,{status:res.status,headers:res.headers});}}),keys:async()=>[previous,other,'unrelated-app','glp001.hukamnama.records.v1'],delete:async key=>calls.push({deleted:key})};
 // Node 22.15 / Undici 6.21.2 can finalize a consumed temporary clone and cancel
 // the still-live original stream. Keep native clones alive for this harness only.
 // Native clone/read/hash behavior is unchanged; the real browser worker is tested separately.
 // Deterministic 1/85/97-response evidence: daily-hukamnama/NODE_RESPONSE_CLONE_DIAGNOSTIC_20261127.json.
 const fetch=async req=>{assert.equal(req.cache,'reload');assert.ok(new URL(req.url).searchParams.get('glp_release'));let path=new URL(req.url).pathname.slice(new URL(scope).pathname.length)||'index.html';if(path.endsWith('/'))path+='index.html';const response=new Response(corrupt&&path==='full-japji.html'?'corrupt':fs.readFileSync(new URL(''+path,root)));const clone=response.clone.bind(response);response.clone=()=>{const nativeCopy=clone();retainedNativeClones.push(nativeCopy);return nativeCopy;};return response;};
 vm.runInNewContext(source,{self,caches,URL,Request,crypto:crypto.webcrypto,Uint8Array,fetch});return{events,calls,saved,previous};
}
let h=harness(),pending;h.events.install({waitUntil:p=>pending=p});await pending;assert.ok(!h.calls.includes('skip'));
const cached=[...h.saved].map(([url,response])=>({url,sha256:digest(response.body)}));
const wanted=requiredAssets.map(asset=>{const url=new URL(asset,scope);url.searchParams.set('glp_release',version);return {url:url.href,sha256:expected[asset]};});
assert.deepEqual(cached.sort((a,b)=>a.url.localeCompare(b.url)),wanted.sort((a,b)=>a.url.localeCompare(b.url)),'Every cached URL, release query and response body matches the required release');
for(const asset of ['library/catalog.mjs','library/core.mjs','library/app.mjs','library/library.css','articles/','articles/index.html','articles/article.html','articles/articles.css','articles/app.mjs','articles/core.mjs','articles/source-contracts.mjs','articles/catalog.json','breathing.html','css/breathing.css','js/breathing-core.js','js/breathing.js','salok-kabir/','salok-kabir/index.html','salok-kabir/data/library.json','salok-kabir/data/salok-kabir.json','salok-kabir/learning/course.complete.json','salok-mahalla9/','salok-mahalla9/index.html','salok-mahalla9/data/library.json','salok-mahalla9/data/salok-mahalla9.json','salok-mahalla9/learning/course.complete.json','vendor/opengranth/LICENSE','vendor/opengranth/NOTICE'])assert.ok([...h.saved.keys()].some(url=>new URL(url).pathname===new URL(asset,scope).pathname),'Missing cached asset: '+asset);
h.events.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(h.calls.filter(x=>x.deleted),[{deleted:h.previous}]);
h.events.message({data:{type:'IGNORE'}});assert.ok(!h.calls.includes('skip'));h.events.message({data:{type:'ACTIVATE_GLP_UPDATE'}});assert.ok(h.calls.includes('skip'));
let response;h.events.fetch({request:new Request(scope+'full-japji.html'),respondWith:p=>response=p});assert.equal(await(await response).text(),fs.readFileSync(new URL('full-japji.html',root),'utf8'));
let intercepted=false;h.events.fetch({request:new Request('https://outside.test/'),respondWith:()=>intercepted=true});assert.equal(intercepted,false);
for(const relative of ['private-library','private-library/','private-library/index.html','private-library/collection.enc.json','%70rivate-library/collection.enc.json','private-library%2Fcollection.enc.json']){
 let privateIntercepted=false;
 h.events.fetch({request:new Request(scope+relative+'?synthetic=1'),respondWith:()=>privateIntercepted=true});
 assert.equal(privateIntercepted,false,'Private request must bypass even a stale public cache: '+relative);
}
let bad=harness(true);bad.events.install({waitUntil:p=>pending=p});await assert.rejects(pending,/hash mismatch/);assert.deepEqual(bad.calls.filter(x=>x.deleted),[{deleted:'glp-static:'+scope+':'+version}],'A failed install requests deletion only of its candidate cache, never the previous release');assert.ok(!bad.calls.includes('skip'));assert.ok(!bad.calls.includes('claim'));
const result={environment:'Node service-worker simulation; not a physical offline test',checks:['Exact prior 85-asset inventory plus bundled library, Knowledge, Daily, Farid, Explore, and five open collection entries; every on-disk and cached body hash and release URL checked','Every installation fetch bypasses stale HTTP cache','No automatic skipWaiting on install','Activation removes only this app scope caches','Only explicit update message activates','Reader serves exact cached bytes','Cross-origin requests untouched','Private requests bypass public cache, including encoded paths','Corrupted installation rejects, deletes only the candidate cache and never activates; actual prior-worker preservation is separately browser-tested'].map(name=>({name,status:'PASS'}))};fs.writeFileSync(new URL('evidence/service-worker-verification.json',root),JSON.stringify(result,null,2));console.log(JSON.stringify({total:result.checks.length,status:'PASS'}));
