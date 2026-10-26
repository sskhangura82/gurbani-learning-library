/* GLP-001 ORIGINAL SOURCE QA ONLY, scoped /nitnem/ — NOT family source approval. */
const VERSION="glp-private-nitnem-qa-be32764e8e187f36de";
const PREFIX="glp-nitnem-source-review:";
const CACHE=PREFIX+VERSION;
const EXPECTED={"./index.html":"b985c68a72786ed36a220111ebb8e8c21df4fcbc5267d592b71cd77d3cb05f1a","./reader.css":"de84f0cdc36f4f1555ff75e4b22c1c191b6149dea3cd5643e3c57b8901334bda","./reader.js":"6102390ba3be352b003562000c01f345fd4f79e2112b3d64f4e9dbe640344524","./continuous-core.js":"9b48fa24327076bd35693dfdd5144cbbf004de488a9a6b962f3fa61d6174d78c","./learning/learning-ui.js":"24517998e9f360e82608710f266bb1780b7d698c5663e45dff5b07c66b7e36f0","./learning/course.v1.json":"5dc9f9dd1b3a8e882763ce48ee654200f84d34179df157eeb303da59f1258c57","./trust/index.html":"5ebca8ec6113f2b9da9cd797d553025be24fa4fb56fd65145b13fecea8e10b6e","./trust/corrections.html":"06eb218b562e8254118742fe49ef49e19524d426a4b85eb90a83b5342343f5b0","./trust/trust.css":"8f2201cd3152f050edd66b2d0b12e864e8ca97f5d99d8d26f9ff7ab51280e37e","./data/library.json":"b5865b293acc3ea91a20487dd82efd6f503d22dc5823bc2a67effcd146840d7a","./data/jaap.json":"3ac2bbf35e91d1d626a0a4c45c8059857c01bed1368f378bef5d06741422fecb","./data/savaiye.json":"7c96c919b1c12c6bfe8f295a94bfcda8fb8cc42bf8f18b92c842acd834ca9651","./data/chaupai.json":"cd8d990a3ae5f1c1257a8636059b9ea0b11d0617c6a8aab6ff2a77246a780e30","./data/anand.json":"70b8c69e70b241eef1b46b326e7bbc127d4526f061eb41b150d1f9944df884c4","./data/rehras.json":"5c0635f6c87328ab40360662653fc47872e4244171c107976b77f039033ba28d","./data/sohila.json":"d212a854971679b1cef98833dbc4a13c1c4af37f524629c918960fef45887897"};
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
