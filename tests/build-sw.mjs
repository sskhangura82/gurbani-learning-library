import fs from 'node:fs';import crypto from 'node:crypto';
const root=new URL('../',import.meta.url),version=process.argv[2];if(!version)throw Error('Pass a new, unique release version; never reuse an installed cache version.');
const names=['','full-japji.html','index.html','gurdwaras.html','gurdwara.html','simran.html','nitnem.html','psychology.html','pauri-2-lesson.html','css/app.css','css/japji-full.css','css/home.css','css/arrivals.css','css/simran.css','css/nitnem.css','css/psychology.css','js/home.js','js/arrivals.js','js/simran.js','js/nitnem-registry.js','js/nitnem-page.js','js/mind-room-content.js','js/psychology-page.js','js/app.js','js/content.js','js/core.js','js/gurdwaras.js','js/places.js','js/continuous-core.js','js/japji-full-data.js','js/japji-full.js','js/japji-lessons.js','js/line-meanings.js','js/learning.js','js/shared-learning.js','js/pwa.js','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png','manifest.webmanifest'];
const expected=Object.fromEntries(names.map(n=>['./'+n,crypto.createHash('sha256').update(fs.readFileSync(new URL(n||'index.html',root))).digest('hex')]));
fs.writeFileSync(new URL('sw.js',root),`/* Generated, verified static shell. No learning record is sent or cached. */
const VERSION=${JSON.stringify(version)};
const PREFIX='glp-static:'+self.registration.scope+':';const CACHE=PREFIX+VERSION;
const EXPECTED=${JSON.stringify(expected)};
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const c=await caches.open(CACHE);
 try{await Promise.all(Object.entries(EXPECTED).map(async([asset,hash])=>{
  const u=new URL(asset,self.location.href);u.searchParams.set('glp_release',VERSION);
  const request=new Request(u,{cache:'reload'}),response=await fetch(request);
  if(!response.ok)throw Error('Reader file unavailable: '+asset);
  const digest=await crypto.subtle.digest('SHA-256',await response.clone().arrayBuffer());
  const actual=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
  if(actual!==hash)throw Error('Reader release hash mismatch: '+asset);
  await c.put(request,response);
 }));}catch(error){await caches.delete(CACHE);throw error;}
})()));
// Updates wait for the reader's explicit action. An open reader keeps its current shell.
self.addEventListener('message',e=>{if(e.data?.type==='ACTIVATE_GLP_UPDATE')self.skipWaiting();});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url),base=new URL('./',self.location.href);if(e.request.method!=='GET'||u.origin!==self.location.origin||!u.pathname.startsWith(base.pathname))return;e.respondWith(caches.open(CACHE).then(async c=>await c.match(e.request,{ignoreSearch:true})||fetch(e.request)));});
`);
console.log(JSON.stringify({version,verifiedAssets:names.length}));
