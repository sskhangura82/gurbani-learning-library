/* Frozen static release cache. Learning is never part of a network response. */
const VERSION='glp-static-0.9-japji-v1-r2';
const PREFIX='glp-static:'+self.registration.scope+':';
const CACHE=PREFIX+VERSION;
const ASSETS=['./','./full-japji.html','./index.html','./pauri-2-lesson.html','./js/continuous-core.js','./js/line-meanings.js','./css/app.css','./css/japji-full.css','./js/app.js','./js/content.js','./js/core.js','./js/gurdwaras.js','./js/places.js','./js/japji-full-data.js','./js/japji-full.js','./js/japji-lessons.js','./js/learning.js','./js/pwa.js','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
// No skipWaiting on install: an open reader keeps its current release until the reader chooses an update.
self.addEventListener('message',e=>{if(e.data?.type==='ACTIVATE_GLP_UPDATE')self.skipWaiting();});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin)return;
 const base=new URL('./',self.location.href);if(!u.pathname.startsWith(base.pathname))return;
 // Cache-first, whole-release shell avoids a mixture of editorial/source versions.
 e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(e.request,{ignoreSearch:true});return hit||fetch(e.request);}));
});
