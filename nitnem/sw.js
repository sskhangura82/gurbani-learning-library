/* GLP-001 ORIGINAL SOURCE QA ONLY, scoped /nitnem/ — NOT family source approval. */
const VERSION="glp-private-nitnem-qa-ac512728af487c3636";
const PREFIX="glp-nitnem-source-review:";
const CACHE=PREFIX+VERSION;
const EXPECTED={"./index.html":"d6b5258468f035897b488d3530af4a49269c211c1f3f949db2b29306ff3031e6","./reader.css":"efa7abd8df964ae0e5da4bb3b738899a737c6f648756b560980473b346b8ce2a","./reader.js":"9d07e64ef39f52707b354c322beecaa1eefaf257acaed668f4d3b9a5411fcb1e","./continuous-core.js":"9b48fa24327076bd35693dfdd5144cbbf004de488a9a6b962f3fa61d6174d78c","./data/library.json":"b5865b293acc3ea91a20487dd82efd6f503d22dc5823bc2a67effcd146840d7a","./data/jaap.json":"3ac2bbf35e91d1d626a0a4c45c8059857c01bed1368f378bef5d06741422fecb","./data/savaiye.json":"7c96c919b1c12c6bfe8f295a94bfcda8fb8cc42bf8f18b92c842acd834ca9651","./data/chaupai.json":"cd8d990a3ae5f1c1257a8636059b9ea0b11d0617c6a8aab6ff2a77246a780e30","./data/anand.json":"70b8c69e70b241eef1b46b326e7bbc127d4526f061eb41b150d1f9944df884c4","./data/rehras.json":"5c0635f6c87328ab40360662653fc47872e4244171c107976b77f039033ba28d","./data/sohila.json":"d212a854971679b1cef98833dbc4a13c1c4af37f524629c918960fef45887897"};
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
