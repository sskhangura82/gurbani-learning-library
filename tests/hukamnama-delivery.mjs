/* Synthetic delivery tests: no provider request, private data or production key. */
import assert from "node:assert/strict";
import {webcrypto,createHash} from "node:crypto";
import {decodeEvent,decodeSource,loadReading,admitLesson,RECORD_CACHE} from "../hukamnama/delivery.mjs";
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const now=new Date("2026-11-27T08:00:00.000Z"),date="2026-11-27",baseURL="https://daily.test/site/hukamnama/";
const digest=value=>createHash("sha256").update(value).digest("hex");
const raw=value=>{const b=Buffer.from(typeof value==="string"?value:JSON.stringify(value));return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);};
const copy=value=>structuredClone(value);
const keys=await crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},true,["sign","verify"]);
const publicKey=await crypto.subtle.exportKey("jwk",keys.publicKey),keyId="synthetic-test-key";
const verify={now,publicKey,keyId};
const original=["ਗੂਜਰੀ ਮਹਲਾ ੧ ॥","ਸਾਸਿ ਸਾਸਿ ਸਿਮਰਹੁ ਗੋਬਿੰਦ ॥","ਸਾਸਿ ਸਾਸਿ ਸਿਮਰਹੁ ਗੋਬਿੰਦ ॥"];
const textSha256=digest(original.join(" ")),id="sggs.text."+textSha256;
const repeats=new Map();
const source={schema:"glp.hukamnama.source.v1",id,edition:"opengranth-34d2a7c",textSha256,angStart:504,angEnd:505,occurrences:original.map((text,index)=>{
 const sha256=digest(text),count=(repeats.get(sha256)||0)+1;repeats.set(sha256,count);
 return {id:id+".line."+sha256+"."+count,text,sha256,kind:index===0?"heading":index===1?"rahao":"verse",ang:index<2?504:505};
}),provenance:{repository:"opengranth/open-granth",commit:"34d2a7cab032c8ea24d21ff20f64653bd03766f4",pages:[504,505].map(ang=>({ang,url:"https://raw.githubusercontent.com/opengranth/open-granth/34d2a7cab032c8ea24d21ff20f64653bd03766f4/corpus/ang-"+String(ang).padStart(4,"0")+".md",sha256:digest("synthetic page "+ang)})),comparison:"COMPLETE_ORDERED_TEXT_EQUALITY",comparisonScope:"Unique full ordered sequence among entries beginning at the official starting Ang; adjacent pages establish continuation and boundaries. Global corpus uniqueness is not asserted.",precedingSha256:digest("synthetic previous"),followingSha256:digest("synthetic following")}};
const sourceRaw=raw(source);
const event={schema:"glp.hukamnama.event.v1",id:"harmandir-morning."+date,date,timezone:"Asia/Kolkata",venue:"sri-harmandir-sahib",ritual:"morning-mukhwak",sourceUrl:"https://hs.sgpc.net/",archiveUrl:"https://hs.sgpc.net/archiveView.php",officialPublishedDate:date,officialDisplayedTime:null,checkedAtUtc:"2026-11-27T07:00:00.000Z",officialOriginalSha256:textSha256,officialReceiptSha256:digest("synthetic original-only receipt"),source:{id,edition:source.edition,textSha256,sha256:digest(Buffer.from(sourceRaw)),path:"./sources/"+textSha256+".json"},verification:"COMPLETE_ORDERED_TEXT_EQUALITY",status:"DIGITAL_TEXT_VERIFIED_PREVIEW",publicationApproved:false,revision:1,lessons:{simple:null,detailed:null,learning:null}};
async function signed(value=event){const bytes=raw(value),signature=await crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},keys.privateKey,bytes);return raw({schema:"glp.hukamnama.envelope.v1",keyId,payload:Buffer.from(bytes).toString("base64"),signature:Buffer.from(signature).toString("base64")});}
const eventRaw=await signed(),eventURL=new URL("./events/"+date+".json",baseURL).href,sourceURL=new URL(event.source.path,baseURL).href;
function cacheStorage(){
 const names=new Map(),writes=[];
 return {names,writes,async open(name){if(!names.has(name))names.set(name,new Map());const records=names.get(name);return {async match(key){return records.get(key)?.clone();},async put(key,response){writes.push({name,key});records.set(key,response.clone());}};}};
}
function fetching(routes,requests=[]){return async(url,options)=>{requests.push({url,options});const body=routes.get(url);if(body instanceof Error)throw body;if(body===undefined)return new Response("missing",{status:404});return new Response(body,{headers:{"content-type":"application/json"}});};}
const options=(extra={})=>({now,publicKey,keyId,baseURL,cacheStorage:cacheStorage(),fetchImpl:fetching(new Map([[eventURL,eventRaw],[sourceURL,sourceRaw]])),...extra});
let failures=0,passed=0;
async function check(name,fn){try{await fn();passed++;console.log("PASS "+name);}catch(error){failures++;console.error("FAIL "+name+"\n"+error.stack);}}
await check("signed event, full cross-page source, repeated-line occurrence identities freeze",async()=>{
 const e=await decodeEvent(eventRaw,date,verify),s=await decodeSource(sourceRaw,e);
 assert.equal(s.occurrences.length,3);assert.equal(s.occurrences[1].id.endsWith(".1"),true);assert.equal(s.occurrences[2].id.endsWith(".2"),true);assert(Object.isFrozen(s.occurrences[0]));assert(Object.isFrozen(e.source));
});
await check("payload signature is checked before malformed payload JSON is parsed",async()=>{
 const envelope=JSON.parse(Buffer.from(eventRaw));envelope.payload=Buffer.from("{not JSON").toString("base64");
 await assert.rejects(()=>decodeEvent(raw(envelope),date,verify),/signature/);
});
await check("unsigned, wrong-key, noncanonical base64 and wrong-length signature refuse",async()=>{
 for(const mutate of [e=>e.keyId="wrong",e=>e.payload+="\n",e=>e.signature=Buffer.alloc(63).toString("base64"),e=>delete e.signature]){
  const e=JSON.parse(Buffer.from(eventRaw));mutate(e);await assert.rejects(()=>decodeEvent(raw(e),date,verify));
 }
 const other=await crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},true,["sign","verify"]);
 await assert.rejects(async()=>decodeEvent(eventRaw,date,{...verify,publicKey:await crypto.subtle.exportKey("jwk",other.publicKey)}));
});
await check("wrong date, official date, venue, public approval and arbitrary source paths refuse even signed",async()=>{
 for(const mutate of [e=>e.date="2026-11-26",e=>e.officialPublishedDate="2026-11-26",e=>e.venue="other",e=>e.publicationApproved=true,e=>e.source.path="//elsewhere.test/source.json",e=>e.source.path="./sources/"+textSha256+".json?date="+date,e=>e.officialOriginalSha256="a".repeat(64)]){
  const e=copy(event);mutate(e);await assert.rejects(async()=>decodeEvent(await signed(e),date,verify));
 }
});
await check("invalid and future dates do not make a request",async()=>{
 let calls=0;const fetchImpl=async()=>{calls++;throw Error("must not fetch");};
 assert.equal((await loadReading("2026-02-30",options({fetchImpl}))).status,"INVALID_DATE");
 assert.equal((await loadReading("2026-11-28",options({fetchImpl}))).status,"FUTURE_DATE");assert.equal(calls,0);
});
await check("raw source mutation, truncation and source-resealed missing continuation refuse",async()=>{
 await assert.rejects(()=>decodeSource(raw(copy(source)).slice(0,-1),event),/bytes/);
 const broken=copy(source);broken.occurrences.pop();const bytes=raw(broken),e=copy(event);e.source.sha256=digest(Buffer.from(bytes));
 await assert.rejects(()=>decodeSource(bytes,e),/boundaries|complete/);
});
await check("resealed per-line text, occurrence ID, ordering and witness changes refuse",async()=>{
 for(const mutate of [s=>s.occurrences[1].text+=" ",s=>s.occurrences[2].id=s.occurrences[1].id,s=>s.occurrences.reverse(),s=>s.provenance.pages.pop(),s=>s.provenance.commit="b".repeat(40)]){
  const s=copy(source);mutate(s);const bytes=raw(s),e=copy(event);e.source.sha256=digest(Buffer.from(bytes));
  await assert.rejects(()=>decodeSource(bytes,e));
 }
});
await check("fresh success requests same-origin exact paths and caches one complete public pair",async()=>{
 const requests=[],caches=cacheStorage(),r=await loadReading(date,options({cacheStorage:caches,fetchImpl:fetching(new Map([[eventURL,eventRaw],[sourceURL,sourceRaw]]),requests)}));
 assert.equal(r.status,"DIGITAL_TEXT_VERIFIED_PREVIEW");assert.equal(r.fromCache,false);assert.equal(r.cacheSaved,true);
 assert.deepEqual(requests.map(r=>r.url),[eventURL,sourceURL]);
 for(const r of requests){assert.equal(r.options.credentials,"omit");assert.equal(r.options.redirect,"error");assert.equal(r.options.cache,"no-store");}
 assert.equal(caches.writes.length,1);assert.equal(caches.writes[0].name,RECORD_CACHE);
 const pair=await caches.names.get(RECORD_CACHE).get(eventURL).json();assert.deepEqual(Object.keys(pair).sort(),["event","schema","source"]);
});
await check("offline re-verifies exact saved pair and never substitutes for another date",async()=>{
 const caches=cacheStorage();await loadReading(date,options({cacheStorage:caches}));
 const fetchImpl=async()=>{throw TypeError("offline");};
 const saved=await loadReading(date,options({cacheStorage:caches,fetchImpl}));
 assert.equal(saved.status,"DIGITAL_TEXT_VERIFIED_PREVIEW");assert.equal(saved.fromCache,true);
 const missing=await loadReading("2026-11-26",options({cacheStorage:caches,fetchImpl}));
 assert.equal(missing.status,"DATE_UNAVAILABLE");assert(!("source" in missing));
 const tomorrow=await loadReading("2026-11-28",options({now:new Date("2026-11-28T08:00:00Z"),cacheStorage:caches,fetchImpl}));
 assert.equal(tomorrow.status,"TODAY_PENDING");assert(!("source" in tomorrow));
});
await check("tampered network response does not hide behind an older saved record",async()=>{
 const caches=cacheStorage();await loadReading(date,options({cacheStorage:caches}));
 const invalid=new Uint8Array(eventRaw.slice(0));invalid[10]^=1;
 const result=await loadReading(date,options({cacheStorage:caches,fetchImpl:fetching(new Map([[eventURL,invalid]]))}));
 assert.equal(result.status,"SOURCE_REFUSED");assert(!("source" in result));
});
await check("incomplete or corrupted saved pair refuses without deleting the record",async()=>{
 const caches=cacheStorage(),cache=await caches.open(RECORD_CACHE);
 await cache.put(eventURL,new Response(JSON.stringify({schema:"glp.hukamnama.cached-pair.v1",event:Buffer.from(eventRaw).toString("base64")})));
 const result=await loadReading(date,options({cacheStorage:caches,fetchImpl:async()=>{throw Error("offline");}}));
 assert.equal(result.status,"SOURCE_REFUSED");assert.equal(caches.names.get(RECORD_CACHE).size,1);
});
await check("redirect responses refuse and no off-origin fetch is attempted",async()=>{
 let calls=0;const r=await loadReading(date,options({fetchImpl:async()=>{calls++;return {ok:true,url:"https://other.test/data",redirected:true,headers:new Headers(),arrayBuffer:async()=>eventRaw};}}));
 assert.equal(r.status,"SOURCE_REFUSED");assert.equal(calls,1);
});
await check("cache quota failure keeps complete online original visible",async()=>{
 const r=await loadReading(date,options({cacheStorage:{async open(){return {async put(){throw new DOMException("full","QuotaExceededError");}};}}}));
 assert.equal(r.status,"DIGITAL_TEXT_VERIFIED_PREVIEW");assert.equal(r.cacheSaved,false);
});
await check("aborted and midnight-rollover requests expose no late source",async()=>{
 const controller=new AbortController();controller.abort();
 assert.equal((await loadReading(date,options({signal:controller.signal}))).status,"ABORTED");
 let clock=new Date("2026-11-27T18:29:59.000Z");
 const fetchImpl=async()=>{clock=new Date("2026-11-27T18:30:00.000Z");return new Response(eventRaw);};
 const r=await loadReading(date,options({now:()=>clock,fetchImpl}));
 assert.equal(r.status,"DATE_ROLLED_OVER");assert(!("source" in r));
});
const lesson={schema:"glp.hukamnama.lesson.v1",id:"synthetic-qualified-lesson",revision:1,kind:"source-explanation",layer:"simple",language:"en",source:{id,edition:source.edition,textSha256,sha256:event.source.sha256},review:{id:"synthetic-review",status:"QUALIFIED_APPROVED",reviewer:{name:"Synthetic reviewer",qualification:"Synthetic test qualification"},approvedAtUtc:"2026-11-27T07:00:00.000Z"},rights:{id:"synthetic-rights",status:"CLEARED",basis:"Synthetic test",reference:"Synthetic test record",permissions:{display:true,print:true,offline:true}},claims:[{text:"Synthetic test statement, not teaching content.",citations:[{sourceId:id,occurrenceId:source.occurrences[1].id,sha256:source.occurrences[1].sha256}]}]};
await check("pending layers never hide original and no unscheduled lesson is admitted",async()=>{
 assert.equal(admitLesson(null,{event,source,layer:"simple",language:"en"}),null);
 assert.equal(admitLesson(lesson,{event,source,layer:"simple",language:"en"}),null);
 const r=await loadReading(date,options());assert.equal(r.source.occurrences.length,3);assert.equal(r.event.lessons.simple,null);
});
await check("signed exact lesson admits only matching layer/language/source/review/rights/resolved claims",async()=>{
 const e=copy(event);e.lessons.simple={en:copy(lesson)};
 assert(admitLesson(lesson,{event:e,source,layer:"simple",language:"en"}));
 assert.equal(admitLesson(lesson,{event:e,source,layer:"detailed",language:"en"}),null);
 assert.equal(admitLesson(lesson,{event:e,source,layer:"simple",language:"pa"}),null);
 for(const mutate of [l=>l.source.sha256="f".repeat(64),l=>l.review.reviewer.name="",l=>l.review.status="AI_APPROVED",l=>l.rights.status="PENDING",l=>l.claims[0].citations=[],l=>l.claims[0].citations[0].occurrenceId="row33",l=>l.claims[0].citations[0].sha256="d".repeat(64)]){
  const l=copy(lesson);mutate(l);const bound=copy(e);bound.lessons.simple.en=copy(l);assert.equal(admitLesson(l,{event:bound,source,layer:"simple",language:"en"}),null);
 }
 const tampered=copy(lesson);tampered.claims[0].text="Changed after publication.";
 assert.equal(admitLesson(tampered,{event:e,source,layer:"simple",language:"en"}),null);
});
await check("oversized unlabelled network stream is cancelled at the byte limit",async()=>{
 let cancelled=false,pulls=0;
 const stream=new ReadableStream({pull(controller){pulls++;controller.enqueue(new Uint8Array(65536));},cancel(){cancelled=true;}});
 const r=await loadReading(date,options({fetchImpl:async()=>new Response(stream)}));
 assert.equal(r.status,"SOURCE_REFUSED");assert.equal(cancelled,true);assert(pulls<=11);assert(!("source" in r));
});
await check("older authenticated revision and conflicting same revision preserve saved newer pair",async()=>{
 const caches=cacheStorage(),newer=copy(event);newer.revision=2;const newerRaw=await signed(newer);
 const first=await loadReading(date,options({cacheStorage:caches,fetchImpl:fetching(new Map([[eventURL,newerRaw],[sourceURL,sourceRaw]]))}));
 assert.equal(first.event.revision,2);const before=await caches.names.get(RECORD_CACHE).get(eventURL).clone().text();
 const stale=await loadReading(date,options({cacheStorage:caches}));
 assert.equal(stale.status,"SOURCE_REFUSED");assert.equal(await caches.names.get(RECORD_CACHE).get(eventURL).clone().text(),before);
 const conflicting=copy(newer);conflicting.officialDisplayedTime="different";const alteredRaw=await signed(conflicting);
 const conflict=await loadReading(date,options({cacheStorage:caches,fetchImpl:fetching(new Map([[eventURL,alteredRaw],[sourceURL,sourceRaw]]))}));
 assert.equal(conflict.status,"SOURCE_REFUSED");assert.equal(await caches.names.get(RECORD_CACHE).get(eventURL).clone().text(),before);
});
await check("comparison kinds, external metadata and absent display/print/offline rights are refused",async()=>{
 for(const mutate of [l=>l.kind="comparison",l=>l.kind="psychology",l=>l.tradition="outside",l=>l.claims[0].kind="comparison",l=>delete l.rights.permissions,l=>delete l.rights.permissions.offline,l=>l.rights.permissions.print=false,l=>l.rights.permissions.display="yes"]){
  const l=copy(lesson);mutate(l);const e=copy(event);e.lessons.simple={en:l};
  assert.equal(admitLesson(l,{event:e,source,layer:"simple",language:"en"}),null);
  await assert.rejects(()=>decodeSource(sourceRaw,e),/explanation/);
 }
});
await check("every declared lesson is checked before a complete pair can enter public cache",async()=>{
 const approved=copy(event);approved.lessons.simple={en:copy(lesson)};
 const approvedRaw=await signed(approved),caches=cacheStorage();
 const good=await loadReading(date,options({cacheStorage:caches,fetchImpl:fetching(new Map([[eventURL,approvedRaw],[sourceURL,sourceRaw]]))}));
 assert.equal(good.status,"DIGITAL_TEXT_VERIFIED_PREVIEW");assert.equal(caches.writes.length,1);
 const wrong=copy(approved);wrong.lessons.simple.en.language="pa";const wrongRaw=await signed(wrong),emptyCache=cacheStorage();
 const bad=await loadReading(date,options({cacheStorage:emptyCache,fetchImpl:fetching(new Map([[eventURL,wrongRaw],[sourceURL,sourceRaw]]))}));
 assert.equal(bad.status,"SOURCE_REFUSED");assert.equal(emptyCache.writes.length,0);
});
await check("unknown fields cannot enter a signed event or immutable source cache",async()=>{
 for(const target of [e=>e,e=>e.source,e=>e.lessons]){
  const e=copy(event);target(e).translation="SYNTHETIC_UNAPPROVED_FIELD";const signedRaw=await signed(e),caches=cacheStorage();
  const r=await loadReading(date,options({cacheStorage:caches,fetchImpl:fetching(new Map([[eventURL,signedRaw],[sourceURL,sourceRaw]]))}));
  assert.equal(r.status,"SOURCE_REFUSED");assert.equal(caches.writes.length,0);
 }
 for(const target of [s=>s,s=>s.occurrences[0],s=>s.provenance,s=>s.provenance.pages[0]]){
  const s=copy(source);target(s).translation="SYNTHETIC_UNAPPROVED_FIELD";const changed=raw(s),e=copy(event);e.source.sha256=digest(Buffer.from(changed));
  await assert.rejects(()=>decodeSource(changed,e));
 }
});
await check("duplicate JSON keys cannot hide content inside signed payload bytes",async()=>{
 const text=JSON.stringify(event).replace('"venue":','"venue":"SYNTHETIC_UNAPPROVED_FIELD","venue":');
 const eventWithDuplicate=await signed(text);
 await assert.rejects(()=>decodeEvent(eventWithDuplicate,date,verify),/could not be read/);
 const duplicatedSource=JSON.stringify(source).replace('"edition":','"edition":"SYNTHETIC_UNAPPROVED_FIELD","edition":');
 const changed=raw(duplicatedSource),e=copy(event);e.source.sha256=digest(Buffer.from(changed));
 await assert.rejects(()=>decodeSource(changed,e),/could not be read/);
});
console.log("Delivery synthetic checks: "+passed+" passed; "+failures+" failed.");
if(failures)process.exitCode=1;
