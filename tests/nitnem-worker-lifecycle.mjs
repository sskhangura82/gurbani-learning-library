/* Exercise the actual Nitnem worker in a worker-like VM without window.event.
 * Uses real local asset bytes and disposable in-memory caches. This verifies
 * lifecycle/error behavior; it is not a browser or physical-device offline test.
 */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const assetRoot=path.join(root,'nitnem');
const worker=fs.readFileSync(path.join(assetRoot,'sw.js'),'utf8');
const scope='https://nitnem.test/nitnem/';
const results=[];

function harness(failure){
 const events=new Map(),stores=new Map(),deleted=[],fetches=[];
 let claims=0,skips=0,writes=0,networkDisabled=false;
 const urlOf=value=>new URL(value instanceof Request?value.url:String(value),scope);
 const normalized=(value,ignoreSearch=false)=>{
  const url=urlOf(value);
  if(ignoreSearch)url.search='';
  return url.href;
 };
 const caches={
  async open(name){
   if(!stores.has(name))stores.set(name,new Map());
   const entries=stores.get(name);
   return {
    async put(request,response){entries.set(normalized(request),response.clone());writes++;},
    async match(request,options={}){
     const target=normalized(request,options.ignoreSearch);
     for(const [url,response] of entries){
      if(normalized(url,options.ignoreSearch)===target)return response.clone();
     }
     return undefined;
    }
   };
  },
  async keys(){return [...stores.keys()];},
  async delete(name){deleted.push(name);return stores.delete(name);}
 };
 const self={
  location:{href:new URL('sw.js',scope).href},
  registration:{scope},
  clients:{async claim(){claims++;}},
  skipWaiting(){skips++;},
  addEventListener(name,handler){
   assert.ok(!events.has(name),'Unexpected duplicate worker listener: '+name);
   events.set(name,handler);
  }
 };
 const fetch=async(input,options={})=>{
  const url=urlOf(input),relative=url.pathname.slice(new URL(scope).pathname.length);
  fetches.push({url:url.href,...options});
  if(networkDisabled)throw Error('Synthetic network is offline');
  assert.equal(url.origin,new URL(scope).origin,'Unexpected external worker request');
  assert.ok(url.pathname.startsWith(new URL(scope).pathname),'Fetch escaped reader scope');
  if(relative==='not-cached.json')return new Response('network fallback fixture');
  if(failure?.relative===relative){
   if(failure.kind==='missing')return new Response('Missing fixture',{status:404});
   if(failure.kind==='corrupt')return new Response('Corrupt fixture bytes');
  }
  const file=path.resolve(assetRoot,relative);
  assert.ok(file.startsWith(assetRoot+path.sep),'Unsafe local fixture path');
  return new Response(fs.readFileSync(file));
 };
 const context=vm.createContext({self,caches,URL,Request,Response,crypto:crypto.webcrypto,Uint8Array,fetch});
 assert.equal('event' in context,false,'The VM must not provide an ambient window.event');
 vm.runInContext(worker,context,{filename:'nitnem/sw.js'});
 const metadata=vm.runInContext('({cache:CACHE,prefix:PREFIX,expected:EXPECTED})',context);
 const previous=[metadata.prefix+'previous-fixture',metadata.prefix+'older-fixture'];
 const foreign=['glp-static:canonical-japji-fixture','glp-nitnem-unrelated-review:fixture','unrelated-app-fixture'];
 for(const name of [...previous,...foreign])stores.set(name,new Map());
 async function dispatchLifetime(type){
  let pending,calls=0;
  assert.ok(events.has(type),'Missing worker listener: '+type);
  events.get(type)({waitUntil(promise){pending=promise;calls++;}});
  assert.equal(calls,1,type+' must extend the event lifetime exactly once');
  assert.ok(pending&&typeof pending.then==='function',type+' must supply a promise');
  await pending;
 }
 async function request(url,method='GET'){
  let pending,intercepted=false;
  events.get('fetch')({request:new Request(url,{method}),respondWith(promise){
   assert.equal(intercepted,false,'Fetch response supplied twice');
   intercepted=true;pending=promise;
  }});
  return {intercepted,response:intercepted?await pending:undefined};
 }
 return {events,stores,deleted,fetches,metadata,previous,foreign,dispatchLifetime,request,
  counts:()=>({claims,skips,writes}),offline:()=>{networkDisabled=true;}};
}

async function check(name,fn){
 try{await fn();results.push({name,status:'PASS'});}
 catch(error){results.push({name,status:'FAIL',error:error.stack||String(error)});}
}

await check('Install verifies and caches every real manifest asset without automatic activation',async()=>{
 const h=harness();
 await h.dispatchLifetime('install');
 const entries=Object.keys(h.metadata.expected);
 assert.ok(entries.length>0,'Worker manifest must contain assets');
 assert.equal(h.stores.get(h.metadata.cache).size,entries.length);
 assert.equal(h.fetches.length,entries.length);
 for(const request of h.fetches){
  assert.equal(request.credentials,'same-origin');
  assert.equal(request.cache,'no-store');
  assert.equal(request.redirect,'error');
 }
 assert.equal(h.counts().skips,0);
 assert.equal(h.counts().claims,0);
 assert.deepEqual(h.deleted,[]);
});

await check('Activation uses its event argument, removes only older own caches, and claims clients',async()=>{
 const h=harness();
 await h.dispatchLifetime('install');
 await h.dispatchLifetime('activate');
 assert.deepEqual([...h.deleted].sort(),[...h.previous].sort());
 assert.deepEqual([...h.stores.keys()].sort(),[h.metadata.cache,...h.foreign].sort());
 assert.equal(h.counts().claims,1);
 assert.equal(h.counts().skips,0);
});

await check('Offline fetch returns exact cached original bytes even with a query string',async()=>{
 const h=harness();
 await h.dispatchLifetime('install');
 const before=h.fetches.length;
 h.offline();
 const {intercepted,response}=await h.request(scope+'data/anand.json?lifecycle-fixture=1');
 assert.equal(intercepted,true);
 assert.equal(response.status,200);
 assert.deepEqual(Buffer.from(await response.arrayBuffer()),fs.readFileSync(path.join(assetRoot,'data/anand.json')));
 assert.equal(h.fetches.length,before,'Cached requests must not fall back to network');
});

await check('Only same-scope GET requests are intercepted; an uncached request uses the network',async()=>{
 const h=harness();
 await h.dispatchLifetime('install');
 const before=h.fetches.length;
 for(const [url,method] of [
  ['https://elsewhere.test/nitnem/data/anand.json','GET'],
  ['https://nitnem.test/full-japji.html','GET'],
  ['https://nitnem.test/nitnem-other/index.html','GET'],
  [scope+'data/anand.json','POST']
 ])assert.equal((await h.request(url,method)).intercepted,false,url+' '+method);
 assert.equal(h.fetches.length,before,'Out-of-scope requests must be left to the browser');
 const {intercepted,response}=await h.request(scope+'not-cached.json');
 assert.equal(intercepted,true);
 assert.equal(await response.text(),'network fallback fixture');
 assert.equal(h.fetches.length,before+1);
});

for(const kind of ['corrupt','missing'])await check(kind+' asset rejects installation and deletes only the incomplete new cache',async()=>{
 const clean=harness();
 const relative=Object.keys(clean.metadata.expected).at(-1).slice(2);
 const h=harness({kind,relative});
 await assert.rejects(h.dispatchLifetime('install'),kind==='corrupt'?/SHA mismatch/:/Unavailable source asset/);
 assert.ok(h.counts().writes>0,'Failure must occur after a partial cache was written');
 assert.equal(h.stores.has(h.metadata.cache),false);
 assert.deepEqual(h.deleted,[h.metadata.cache]);
 assert.deepEqual([...h.stores.keys()].sort(),[...h.previous,...h.foreign].sort());
 assert.equal(h.counts().claims,0);
 assert.equal(h.counts().skips,0);
});

await check('Only the explicit private Nitnem update message requests skipWaiting',async()=>{
 const h=harness();
 h.events.get('message')({});
 h.events.get('message')({data:{type:'IGNORE'}});
 h.events.get('message')({data:{type:'ACTIVATE_GLP_UPDATE'}});
 assert.equal(h.counts().skips,0);
 h.events.get('message')({data:{type:'ACTIVATE_PRIVATE_NITNEM_UPDATE'}});
 assert.equal(h.counts().skips,1);
});

const failed=results.filter(x=>x.status==='FAIL').length;
console.log(JSON.stringify({status:failed?'FAIL':'PASS',checks:results.length,failed,
 environment:'Node VM with real local assets and in-memory caches; no physical-device offline claim',results},null,2));
if(failed)process.exitCode=1;
