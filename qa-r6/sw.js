/* Generated, verified static shell. No learning record is sent or cached. */
const VERSION="qa-r6-r5-rollback-20261023";
const PREFIX='glp-static:'+self.registration.scope+':';const CACHE=PREFIX+VERSION;
const EXPECTED={"./":"49853f0f3e9fd20889821704b587d3e12551e803ace8923f625f57070f521116","./full-japji.html":"49853f0f3e9fd20889821704b587d3e12551e803ace8923f625f57070f521116","./index.html":"49853f0f3e9fd20889821704b587d3e12551e803ace8923f625f57070f521116","./pauri-2-lesson.html":"3fbf9fb59448896e6088b01dc1fdea7e12bb9eb6d69178d9a1c659835db57875","./css/app.css":"b17abbb20661a9880792250b952008c84a03b2cd31cb3451b84685d67808d434","./css/japji-full.css":"2ea7475487afadf52dff04264589256c7a1bd3522a7c3b0227b2a25432587e01","./js/app.js":"fe18e2b5846dd329a0ab2d49fb3f30f7557bcc1ba9c676e70d649d1409aeae55","./js/content.js":"83d6541b9dde3c06d36a45fb4d4546e3d71a9fedda43108b49e94f2c829b5d62","./js/core.js":"8390e15105b87848c83cf5beb12c7913bc6fdf50675b85d0abd9b0735541ad22","./js/gurdwaras.js":"7540b5d637d65307a2d7112e5657ab6ffe06a07addaeddf5441e70f76f075ad2","./js/places.js":"fb3a5e82851455e84c6666178740002df99a2c4f8e18f74ceec8f054511520ef","./js/continuous-core.js":"0dc2a51ec6cc78e358e1a4c20ef080400c2790e1c43d22a729bd3214a1d001fc","./js/japji-full-data.js":"7f5f78ac33da1a944e14c3d2b901926686df7e520e6fe681f6a28802d85e9808","./js/japji-full.js":"72194777403535fbaeac92f303054987aa9ba1b6f41d32f84d4bb9e6b1a41d76","./js/japji-lessons.js":"4f77c593d2df8dd6e72ead4cb2b2012991a3ca0ad56495f6f5a30ae96a7d7078","./js/line-meanings.js":"5f2ccfea58faa9fc5a31edac3ec9d3483e0ec2360e471fd3616f17eed005485a","./js/learning.js":"a7e03685dcfc0bc67323361cbe40ce48b82844a776b31a5a4f5f005e395b83e2","./js/shared-learning.js":"8a35f16992769174163c9a3b0b6dacc767dac4cdf33e2f3e9e4c4d9f57eebe2b","./js/pwa.js":"7d940577bd74afc66b860ca7f7f13593c190c746a8e6a82f3d4edf00e10b4365","./icons/icon-180.png":"98ec275ff591dee5d3f9c62993e32d07121c0a5ba24c09a5220e37fe21f671a7","./icons/icon-192.png":"25f35d2932f58f6cb3cdf224b0d8cffee122a71452f3b00eb91b9b451054b739","./icons/icon-512.png":"6177c056e2e0fc5e6a1b3aafff4f1f8b7882efcfe6a9f3ed49a5ffdd37bfda0c","./manifest.webmanifest":"95329f3b35fa3e8ebb9e48f0ed49f236f5a0b56298737bd73b31b74d9647a7d3"};
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
