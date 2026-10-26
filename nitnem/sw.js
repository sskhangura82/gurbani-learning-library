/* GLP-001 ORIGINAL SOURCE QA ONLY, scoped /nitnem/ — NOT family source approval. */
const VERSION="glp-private-nitnem-qa-8621581a92b5ef04e7";
const PREFIX="glp-nitnem-source-review:";
const CACHE=PREFIX+VERSION;
const EXPECTED={"./index.html":"aac7910c91e1ee458317911864dde048f70b58cd10159039e6d2dcc7149a631d","./reader.css":"af3c798b482665e88d4c48bd8ea2dea791b40c8a9be566fb265297f2ab8243a6","./reader.js":"bee024ec9e967e0d977d5924d4a65dedfdc9a7ad90f6fe910f97b1993de9fa9d","./continuous-core.js":"9b48fa24327076bd35693dfdd5144cbbf004de488a9a6b962f3fa61d6174d78c","./learning/learning-ui.js":"95e6e13be6e22c7a7e60886297d9dfbd3f0f0e6870ea6a53d64c71d421cb73f6","./learning/course.v1.json":"5dc9f9dd1b3a8e882763ce48ee654200f84d34179df157eeb303da59f1258c57","./trust/index.html":"8e8e70b6fbe1b86b03af2f802826db80c8912e6d9a38aaaf7a18202ff7c5b383","./trust/corrections.html":"06eb218b562e8254118742fe49ef49e19524d426a4b85eb90a83b5342343f5b0","./trust/trust.css":"8f2201cd3152f050edd66b2d0b12e864e8ca97f5d99d8d26f9ff7ab51280e37e","./data/library.json":"b5865b293acc3ea91a20487dd82efd6f503d22dc5823bc2a67effcd146840d7a","./data/jaap.json":"3ac2bbf35e91d1d626a0a4c45c8059857c01bed1368f378bef5d06741422fecb","./data/savaiye.json":"7c96c919b1c12c6bfe8f295a94bfcda8fb8cc42bf8f18b92c842acd834ca9651","./data/chaupai.json":"cd8d990a3ae5f1c1257a8636059b9ea0b11d0617c6a8aab6ff2a77246a780e30","./data/anand.json":"70b8c69e70b241eef1b46b326e7bbc127d4526f061eb41b150d1f9944df884c4","./data/rehras.json":"5c0635f6c87328ab40360662653fc47872e4244171c107976b77f039033ba28d","./data/sohila.json":"d212a854971679b1cef98833dbc4a13c1c4af37f524629c918960fef45887897","./japji.html":"7f0113adf907305404e0dbe195f466a6850d323d0b46027399bdedf267b9cd50","./japji-assets/icon-180.png":"98ec275ff591dee5d3f9c62993e32d07121c0a5ba24c09a5220e37fe21f671a7","./japji-assets/css/japji-full.css":"629bc3084a60aad4d560ce4536e264983fbb5504c21831cac540c1bcbea6bee4","./japji-assets/css/reader-serenity.css":"1f1155b89e1fea9cc3c22d4bc2ebb7da2632eea9f67d706f1208505eac5fc793","./japji-assets/js/japji-full-data.js":"7f5f78ac33da1a944e14c3d2b901926686df7e520e6fe681f6a28802d85e9808","./japji-assets/js/content.js":"83d6541b9dde3c06d36a45fb4d4546e3d71a9fedda43108b49e94f2c829b5d62","./japji-assets/js/gurdwaras.js":"7540b5d637d65307a2d7112e5657ab6ffe06a07addaeddf5441e70f76f075ad2","./japji-assets/js/continuous-core.js":"0f62a639a29ef39302ac9778c9de6d57b249e6cf453a62c8ccc1b0c8afb7a79a","./japji-assets/js/learning.js":"04c9f490fa9dc603ccdce93b8d26f0f0b724c69bd4801bdbf05f98bd21e9a905","./japji-assets/js/shared-learning.js":"8a35f16992769174163c9a3b0b6dacc767dac4cdf33e2f3e9e4c4d9f57eebe2b","./japji-assets/js/japji-lessons.js":"4f77c593d2df8dd6e72ead4cb2b2012991a3ca0ad56495f6f5a30ae96a7d7078","./japji-assets/js/line-meanings.js":"5f2ccfea58faa9fc5a31edac3ec9d3483e0ec2360e471fd3616f17eed005485a","./japji-assets/js/japji-full.js":"ad0ebb10766098a50db02f4e772c20954c446c0415517299e6374799dd81a9d9"};
const SOURCE_PROVENANCE="373ccc34f4a1c0ccb6ce36654bf6e9574087200f";
const ENTRIES=Object.entries(EXPECTED);
async function hash(bytes){
 const raw=new Uint8Array(await crypto.subtle.digest("SHA-256",bytes));
 return Array.from(raw,b=>b.toString(16).padStart(2,"0")).join("");
}
self.addEventListener("install",event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{
  const base=new URL("./",self.location.href);
  for(const [rel,expected] of ENTRIES){
   const url=new URL(rel,base);
   if(!url.pathname.startsWith(base.pathname))throw Error("Asset escapes private scope");
   const response=await fetch(url,{credentials:"same-origin",cache:"no-store",redirect:"error"});
   if(!response.ok||response.type==="opaque")throw Error("Unavailable source asset "+rel);
   const bytes=await response.clone().arrayBuffer();
   if(await hash(bytes)!==expected)throw Error("Original SHA mismatch during offline installation: "+rel);
   await cache.put(new Request(url),response);
  }
 }catch(e){await caches.delete(CACHE);throw e;}
})()));
self.addEventListener("message",e=>{if(e.data?.type==="ACTIVATE_PRIVATE_NITNEM_UPDATE")self.skipWaiting();});
self.addEventListener("activate",e=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener("fetch",e=>{
 const url=new URL(e.request.url),scope=new URL("./",self.location.href);
 if(e.request.method!=="GET"||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 e.respondWith((async()=>{
  const c=await caches.open(CACHE);
  const stored=await c.match(e.request,{ignoreSearch:true});
  if(stored)return stored;
  return fetch(e.request);
 })());
});
