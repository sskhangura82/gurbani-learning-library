"""Private FULL NITNEM QA sw generator — relative scope /nitnem/ only.
Zero external links/requests. Integrity checked offline source assets; no
deployment or mutation of root Japji service worker or accepted family PWA.
"""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]/'nitnem'
FILES=[
 'index.html','reader.css','reader.js','continuous-core.js',
 'learning/learning-ui.js','learning/course.v1.json',
 'data/library.json','data/jaap.json','data/savaiye.json','data/chaupai.json',
 'data/anand.json','data/rehras.json','data/sohila.json'
]
def sha(b):return hashlib.sha256(b).hexdigest()
hashes={}
for name in FILES:
 f=ROOT/name
 if not f.is_file() or f.is_symlink():raise RuntimeError('Non-file or linked source candidate: '+name)
 hashes['./'+name]=sha(f.read_bytes())
version='glp-private-nitnem-qa-'+sha(json.dumps(hashes,ensure_ascii=False,separators=(',',':')).encode())[:18]
worker='''/* GLP-001 ORIGINAL SOURCE QA ONLY, scoped /nitnem/ — NOT family source approval. */
const VERSION=__VERSION__;
const PREFIX="glp-nitnem-source-review:";
const CACHE=PREFIX+VERSION;
const EXPECTED=__HASHES__;
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
'''
worker=worker.replace('__VERSION__',json.dumps(version)).replace('__HASHES__',json.dumps(hashes,ensure_ascii=False,separators=(',',':')))
target=ROOT/'sw.js'
if target.exists() and target.read_text()!=worker:raise RuntimeError('Do not silently rewrite a versioned QA worker')
target.write_text(worker)
print(json.dumps({'status':'SOURCE_QA_ONLY','version':version,'cacheAssets':len(FILES),'workerSha256':sha(worker.encode('utf8'))}))
