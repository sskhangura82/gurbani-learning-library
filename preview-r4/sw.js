/* Generated, verified static shell. No learning record is sent or cached. */
const VERSION="0.9-r4-rollback-r3-20261023";
const PREFIX='glp-static:'+self.registration.scope+':';const CACHE=PREFIX+VERSION;
const EXPECTED={"./":"504f1e18057534410fbaa7650637c59240bcb75e027dd1d5a562e6d86970f337","./full-japji.html":"504f1e18057534410fbaa7650637c59240bcb75e027dd1d5a562e6d86970f337","./index.html":"504f1e18057534410fbaa7650637c59240bcb75e027dd1d5a562e6d86970f337","./pauri-2-lesson.html":"3fbf9fb59448896e6088b01dc1fdea7e12bb9eb6d69178d9a1c659835db57875","./css/app.css":"b17abbb20661a9880792250b952008c84a03b2cd31cb3451b84685d67808d434","./css/japji-full.css":"899ef1466987913a2fc8674ba9ddb399c40f829e05e883979d58d0e1c9bd911d","./js/app.js":"fe18e2b5846dd329a0ab2d49fb3f30f7557bcc1ba9c676e70d649d1409aeae55","./js/content.js":"83d6541b9dde3c06d36a45fb4d4546e3d71a9fedda43108b49e94f2c829b5d62","./js/core.js":"7f010691a2279387694c5235eb2744ae7b2a08d3569cedd754b5e9a6c09e0306","./js/gurdwaras.js":"7540b5d637d65307a2d7112e5657ab6ffe06a07addaeddf5441e70f76f075ad2","./js/places.js":"fb3a5e82851455e84c6666178740002df99a2c4f8e18f74ceec8f054511520ef","./js/continuous-core.js":"0dc2a51ec6cc78e358e1a4c20ef080400c2790e1c43d22a729bd3214a1d001fc","./js/japji-full-data.js":"7f5f78ac33da1a944e14c3d2b901926686df7e520e6fe681f6a28802d85e9808","./js/japji-full.js":"32087347aec7ee347febe22c87ce0e04007070f0596a4c191c78a8858a14da89","./js/japji-lessons.js":"4f77c593d2df8dd6e72ead4cb2b2012991a3ca0ad56495f6f5a30ae96a7d7078","./js/line-meanings.js":"5f2ccfea58faa9fc5a31edac3ec9d3483e0ec2360e471fd3616f17eed005485a","./js/learning.js":"35d260fab9cb8bed05a035602b23259357b67ed860b20a27d75b94a6ae65ceb9","./js/pwa.js":"d83e9bc1df2f9f8b54a5f0281bcf2972d4bd2f7eb0185e8786eec929b1066e74","./icons/icon-180.png":"98ec275ff591dee5d3f9c62993e32d07121c0a5ba24c09a5220e37fe21f671a7","./icons/icon-192.png":"25f35d2932f58f6cb3cdf224b0d8cffee122a71452f3b00eb91b9b451054b739","./icons/icon-512.png":"6177c056e2e0fc5e6a1b3aafff4f1f8b7882efcfe6a9f3ed49a5ffdd37bfda0c","./manifest.webmanifest":"95329f3b35fa3e8ebb9e48f0ed49f236f5a0b56298737bd73b31b74d9647a7d3"};
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
