/* Signed original-only development delivery. This library signature is not an SGPC signature. */
import {validDate,amritsarDate,TIMEZONE} from "./core.mjs";
import {PUBLICATION_KEY,KEY_ID,PUBLICATION_MODE} from "./publication-key.mjs";
import {parseStrictJSON} from "./json.mjs";

export const RECORD_CACHE="glp001.hukamnama.records.v1";
const EDITION="opengranth-34d2a7c", VERIFIED="DIGITAL_TEXT_VERIFIED_PREVIEW";
const ENVELOPE_LIMIT=524288,SOURCE_LIMIT=1048576,PAIR_LIMIT=2300000;
const HEX=/^[a-f0-9]{64}$/, UTF8=new TextDecoder("utf-8",{fatal:true});
const encoder=new TextEncoder();
function reject(code,message){const error=new Error(message);error.code=code;throw error;}
function insist(value,message){if(!value)reject("SOURCE_REFUSED",message);}
function plain(value){return value!==null&&typeof value==="object"&&!Array.isArray(value);}
function exactKeys(value,keys){return plain(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));}
function freeze(value){if(value&&typeof value==="object"&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
function instant(now){const date=new Date(typeof now==="function"?now():now??Date.now());if(!Number.isFinite(+date))reject("SOURCE_REFUSED","The date could not be checked.");return date;}
function checkDate(date,now){if(!validDate(date))reject("INVALID_DATE","Choose a complete calendar date.");const today=amritsarDate(instant(now));if(date>today)reject("FUTURE_DATE","This date has not arrived in Amritsar.");return today;}
function bytes(raw,limit){insist(raw instanceof ArrayBuffer&&raw.byteLength>0&&raw.byteLength<=limit,"The source size could not be verified.");return new Uint8Array(raw);}
function base64(data){let s="";for(let i=0;i<data.length;i+=16384)s+=String.fromCharCode(...data.subarray(i,i+16384));return btoa(s);}
function unbase64(value,limit){
 insist(typeof value==="string"&&value.length>0&&value.length<=Math.ceil(limit/3)*4&&/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value),"The signed source encoding is invalid.");
 const result=Uint8Array.from(atob(value),c=>c.charCodeAt(0));
 insist(result.length<=limit&&base64(result)===value,"The signed source encoding is not canonical.");return result;
}
async function sha256(raw){insist(globalThis.crypto?.subtle,"Source integrity is unavailable in this browser.");return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",raw)),b=>b.toString(16).padStart(2,"0")).join("");}
function parse(raw){try{return parseStrictJSON(UTF8.decode(raw));}catch{reject("SOURCE_REFUSED","The verified source could not be read.");}}
function utc(value){return typeof value==="string"&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value)&&Number.isFinite(Date.parse(value));}
function officialDate(event,date,now){
 insist(exactKeys(event,["schema","id","date","timezone","venue","ritual","sourceUrl","archiveUrl","officialPublishedDate","officialDisplayedTime","checkedAtUtc","officialOriginalSha256","officialReceiptSha256","source","verification","status","publicationApproved","revision","lessons"])&&event.schema==="glp.hukamnama.event.v1","The daily record format is unsupported.");
 insist(event.date===date&&event.id==="harmandir-morning."+date&&event.officialPublishedDate===date,"The official date does not match the requested date.");
 insist(event.timezone===TIMEZONE&&event.venue==="sri-harmandir-sahib"&&event.ritual==="morning-mukhwak","The venue or daily selection is not the requested reading.");
 insist(event.sourceUrl==="https://hs.sgpc.net/"&&event.archiveUrl==="https://hs.sgpc.net/archiveView.php","The official source reference is invalid.");
 insist(event.officialDisplayedTime===null||typeof event.officialDisplayedTime==="string"&&event.officialDisplayedTime.length<=100,"The publication time is invalid.");
 insist(utc(event.checkedAtUtc)&&Date.parse(event.checkedAtUtc)<=+instant(now)+300000,"The source check date is invalid.");
 insist(event.status===VERIFIED&&event.publicationApproved===false&&event.verification==="COMPLETE_ORDERED_TEXT_EQUALITY","This reader only admits digitally checked development records.");
 insist(Number.isSafeInteger(event.revision)&&event.revision>=1,"The event revision is invalid.");
 const s=event.source;
 insist(exactKeys(s,["id","edition","textSha256","sha256","path"])&&HEX.test(s.textSha256)&&HEX.test(s.sha256)&&s.id==="sggs.text."+s.textSha256&&s.edition===EDITION&&s.path==="./sources/"+s.textSha256+".json","The original source binding is invalid.");
 insist(event.officialOriginalSha256===s.textSha256&&HEX.test(event.officialReceiptSha256),"The official original does not match the source.");
 insist(exactKeys(event.lessons,["simple","detailed","learning"]),"The explanation states are missing or unsupported.");
 return event;
}

export async function decodeEvent(raw,requestedDate,{now,publicKey=PUBLICATION_KEY,keyId=KEY_ID}={}){
 checkDate(requestedDate,now);insist(PUBLICATION_MODE==="DEVELOPMENT_PREVIEW","This publisher is not enabled.");
 const envelope=parse(bytes(raw,ENVELOPE_LIMIT));
 insist(plain(envelope)&&Object.keys(envelope).sort().join(",")==="keyId,payload,schema,signature"&&envelope.schema==="glp.hukamnama.envelope.v1"&&envelope.keyId===keyId,"The signed envelope is not recognized.");
 const payload=unbase64(envelope.payload,ENVELOPE_LIMIT),signature=unbase64(envelope.signature,64);
 insist(signature.byteLength===64,"The source signature is invalid.");
 insist(globalThis.crypto?.subtle,"Source integrity is unavailable in this browser.");
 let verified=false;
 try{const key=await crypto.subtle.importKey("jwk",publicKey,{name:"ECDSA",namedCurve:"P-256"},false,["verify"]);verified=await crypto.subtle.verify({name:"ECDSA",hash:"SHA-256"},key,signature,payload);}catch{}
 insist(verified,"The daily source signature could not be verified.");
 // Only the envelope is parsed before authentication. Payload JSON is parsed here.
 checkDate(requestedDate,now);
 return freeze(officialDate(parse(payload),requestedDate,now));
}

export async function decodeSource(raw,event){
 const data=bytes(raw,SOURCE_LIMIT);
 insist(event?.source&&await sha256(data)===event.source.sha256,"The original source bytes do not match the signed record.");
 const source=parse(data),binding=event.source;
 insist(exactKeys(source,["schema","id","edition","textSha256","angStart","angEnd","occurrences","provenance"])&&source.schema==="glp.hukamnama.source.v1"&&source.id===binding.id&&source.edition===binding.edition&&source.textSha256===binding.textSha256,"The original source identity is invalid.");
 insist(Number.isInteger(source.angStart)&&Number.isInteger(source.angEnd)&&source.angStart>=1&&source.angEnd<=1430&&source.angStart<=source.angEnd,"The witnessed page span is invalid.");
 insist(Array.isArray(source.occurrences)&&source.occurrences.length>=2&&source.occurrences.length<=3000,"The complete original selection is missing.");
 const counts=new Map(),texts=[];let previousAng=source.angStart;
 for(const line of source.occurrences){
  insist(exactKeys(line,["id","text","sha256","kind","ang"])&&typeof line.text==="string"&&line.text.length>0&&line.text.length<=12000&&/[\u0a00-\u0a7f]/u.test(line.text)&&!/[<>\u0000-\u001f\u007f@\ufffd\uE000-\uF8FF]/u.test(line.text),"An original line is invalid.");
  insist(["heading","rahao","verse"].includes(line.kind)&&Number.isInteger(line.ang)&&line.ang>=previousAng&&line.ang>=source.angStart&&line.ang<=source.angEnd,"The original sequence is invalid.");
  const digest=await sha256(encoder.encode(line.text)),count=(counts.get(digest)||0)+1;counts.set(digest,count);
  insist(line.sha256===digest&&line.id===source.id+".line."+digest+"."+count,"An original occurrence has changed.");
  previousAng=line.ang;texts.push(line.text);
 }
 insist(source.occurrences[0].ang===source.angStart&&source.occurrences.at(-1).ang===source.angEnd&&source.occurrences[0].kind==="heading","The source boundaries are incomplete.");
 insist(await sha256(encoder.encode(texts.join(" ")))===source.textSha256&&source.textSha256===event.officialOriginalSha256,"The complete original selection does not match.");
 const p=source.provenance;
 insist(exactKeys(p,["repository","commit","pages","comparison","comparisonScope","precedingSha256","followingSha256"])&&p.comparisonScope==="Unique full ordered sequence among entries beginning at the official starting Ang; adjacent pages establish continuation and boundaries. Global corpus uniqueness is not asserted."&&p.repository==="opengranth/open-granth"&&p.commit==="34d2a7cab032c8ea24d21ff20f64653bd03766f4"&&p.comparison==="COMPLETE_ORDERED_TEXT_EQUALITY"&&HEX.test(p.precedingSha256)&&HEX.test(p.followingSha256)&&Array.isArray(p.pages)&&p.pages.length>0,"The source witness is incomplete.");
 const pageAngs=new Set();
 for(const page of p.pages){
  insist(exactKeys(page,["ang","url","sha256"])&&Number.isInteger(page.ang)&&page.ang>=1&&page.ang<=1430&&!pageAngs.has(page.ang)&&HEX.test(page.sha256)&&typeof page.url==="string"&&page.url==="https://raw.githubusercontent.com/"+p.repository+"/"+p.commit+"/corpus/ang-"+String(page.ang).padStart(4,"0")+".md","A source witness page is invalid.");
  pageAngs.add(page.ang);
 }
 insist(source.occurrences.every(line=>pageAngs.has(line.ang)),"A continuation page is not witnessed.");
 for(const layer of ["simple","detailed","learning"]){
  const languages=event.lessons[layer];if(languages===null)continue;
  insist(plain(languages)&&Object.keys(languages).length>0&&Object.keys(languages).length<=10,"An explanation language map is invalid.");
  for(const [language,candidate] of Object.entries(languages))insist(/^[a-z]{2,3}(?:-[A-Za-z]{2,8})?$/.test(language)&&admitLesson(candidate,{event,source,layer,language})!==null,"A declared explanation lacks the required source, review, rights or citations.");
 }
 return freeze(source);
}

function expectedURL(base,path){
 const url=new URL(path,base);
 insist(url.origin===base.origin&&["http:","https:"].includes(url.protocol)&&!url.username&&!url.password&&!url.hash&&!url.search,"The daily source must stay on this site.");
 return url;
}
async function responseBytes(response,url,limit){
 if(!response||!response.ok){const e=new Error("The dated source is not available from this site.");e.code="FETCH_UNAVAILABLE";throw e;}
 insist(!response.redirected&&(!response.url||response.url===url.href),"The dated source redirected away from its exact path.");
 const size=Number(response.headers?.get?.("content-length"));
 insist(!Number.isFinite(size)||size<=limit,"The dated source is too large.");
 if(response.body?.getReader){
  const reader=response.body.getReader(),chunks=[];let total=0;
  try{for(;;){const part=await reader.read();if(part.done)break;insist(part.value instanceof Uint8Array,"The source stream is invalid.");total+=part.value.byteLength;if(total>limit){try{await reader.cancel();}catch{}reject("SOURCE_REFUSED","The dated source exceeds its safe read limit.");}chunks.push(part.value);}}
  finally{reader.releaseLock();}
  insist(total>0,"The dated source is empty.");const joined=new Uint8Array(total);let offset=0;for(const chunk of chunks){joined.set(chunk,offset);offset+=chunk.byteLength;}return joined.buffer;
 }
 // Test doubles may provide only arrayBuffer; real Fetch responses use the bounded stream above.
 const raw=await response.arrayBuffer();bytes(raw,limit);return raw;
}
function pairBody(eventRaw,sourceRaw){return JSON.stringify({schema:"glp.hukamnama.cached-pair.v1",event:base64(new Uint8Array(eventRaw)),source:base64(new Uint8Array(sourceRaw))});}
async function readPair(cache,key,date,options){
 const response=await cache.match(key,{ignoreSearch:false});
 if(!response)return null;
 const pair=parse(bytes(await response.arrayBuffer(),PAIR_LIMIT));
 insist(exactKeys(pair,["schema","event","source"])&&pair.schema==="glp.hukamnama.cached-pair.v1","The saved original is incomplete.");
 const event=await decodeEvent(unbase64(pair.event,ENVELOPE_LIMIT).buffer,date,options);
 const source=await decodeSource(unbase64(pair.source,SOURCE_LIMIT).buffer,event);
 return {event,source};
}
export async function loadReading(date,{now,fetchImpl=globalThis.fetch,cacheStorage=globalThis.caches,baseURL=new URL("./",import.meta.url),signal,publicKey=PUBLICATION_KEY,keyId=KEY_ID}={}){
 let today;
 try{today=checkDate(date,now);}catch(error){return {status:error.code||"SOURCE_REFUSED",requested:date,message:error.message};}
 let cache=null,eventURL,base;const verification={now,publicKey,keyId};
 const stopped=()=>{if(signal?.aborted)reject("ABORTED","The reading request was cancelled.");if(date===today&&amritsarDate(instant(now))!==today)reject("DATE_ROLLED_OVER","A new day has begun in Amritsar. Open today's reading.");};
 try{
  base=new URL("./",baseURL);eventURL=expectedURL(base,"./events/"+date+".json");
  if(globalThis.location?.origin&&/^https?:$/.test(globalThis.location.protocol))insist(base.origin===globalThis.location.origin,"Daily records must come from this site.");
  try{cache=await cacheStorage?.open(RECORD_CACHE);}catch{}
  stopped();
  let eventRaw,sourceRaw,event,source;
  try{
   eventRaw=await responseBytes(await fetchImpl(eventURL.href,{credentials:"omit",redirect:"error",cache:"no-store",signal}),eventURL,ENVELOPE_LIMIT);
   stopped();event=await decodeEvent(eventRaw,date,verification);
   const sourceURL=expectedURL(base,event.source.path);
   sourceRaw=await responseBytes(await fetchImpl(sourceURL.href,{credentials:"omit",redirect:"error",cache:"no-store",signal}),sourceURL,SOURCE_LIMIT);
   stopped();source=await decodeSource(sourceRaw,event);stopped();
  }catch(error){
   stopped();
   if(error.code==="SOURCE_REFUSED"||error.code==="INVALID_DATE"||error.code==="FUTURE_DATE")throw error;
   if(cache){
    const saved=await readPair(cache,eventURL.href,date,verification);stopped();
    if(saved)return {status:VERIFIED,requested:date,amritsar:amritsarDate(instant(now)),...saved,fromCache:true,cacheSaved:true};
   }
   return {status:date===amritsarDate(instant(now))?"TODAY_PENDING":"DATE_UNAVAILABLE",requested:date,amritsar:amritsarDate(instant(now)),fromCache:false,message:"This dated original is not available here yet. The official source remains available."};
  }
  let cacheSaved=false;
  if(cache){
   let saved=null;try{saved=await readPair(cache,eventURL.href,date,verification);}catch{}
   if(saved){insist(event.revision>=saved.event.revision,"An earlier revision cannot replace the saved dated record.");if(event.revision===saved.event.revision)insist(JSON.stringify(event)===JSON.stringify(saved.event),"The same daily revision has conflicting content.");}
   stopped();try{await cache.put(eventURL.href,new Response(pairBody(eventRaw,sourceRaw),{headers:{"Content-Type":"application/json"}}));cacheSaved=true;}catch{}
  }
  stopped();
  return {status:VERIFIED,requested:date,amritsar:amritsarDate(instant(now)),event,source,fromCache:false,cacheSaved};
 }catch(error){return {status:signal?.aborted?"ABORTED":error.code||"SOURCE_REFUSED",requested:date,fromCache:false,message:error.code?"The dated reading was not shown: "+error.message:"The complete dated source could not be verified."};}
}

/* A resolving citation is necessary, never sufficient scholarly approval. The
   signed event must explicitly admit the exact qualified, rights-cleared revision. */
export function admitLesson(candidate,{event,source,layer,language}={}){
 try{
  if(candidate===null||candidate===undefined)return null;
  if(!["simple","detailed","learning"].includes(layer)||!exactKeys(candidate,["schema","id","revision","kind","layer","language","source","review","rights","claims"])||candidate.schema!=="glp.hukamnama.lesson.v1"||candidate.kind!=="source-explanation"||candidate.layer!==layer||candidate.language!==language)return null;
  const reference=event?.lessons?.[layer]?.[language];
  if(!plain(reference)||JSON.stringify(reference)!==JSON.stringify(candidate)||!Number.isSafeInteger(candidate.revision)||candidate.revision<1)return null;
  const b=candidate.source;
  if(!exactKeys(b,["id","edition","textSha256","sha256"])||!event?.source||!source||["id","edition","textSha256","sha256"].some(k=>b[k]!==event.source[k])||source.id!==b.id||source.textSha256!==b.textSha256)return null;
  const review=candidate.review,rights=candidate.rights;
  if(!exactKeys(review,["id","status","reviewer","approvedAtUtc"])||!exactKeys(review.reviewer,["name","qualification"])||!exactKeys(rights,["id","status","basis","reference","permissions"])||!exactKeys(rights.permissions,["display","print","offline"])||!Object.values(rights.permissions).every(value=>value===true))return null;
  if(review?.status!=="QUALIFIED_APPROVED"||typeof review.reviewer?.name!=="string"||!review.reviewer.name.trim()||typeof review.reviewer?.qualification!=="string"||!review.reviewer.qualification.trim()||!utc(review.approvedAtUtc)||rights?.status!=="CLEARED"||typeof rights.basis!=="string"||!rights.basis.trim()||typeof rights.reference!=="string"||!rights.reference.trim())return null;
  if(typeof review.id!=="string"||!review.id||typeof rights.id!=="string"||!rights.id)return null;
  if(!Array.isArray(candidate.claims)||candidate.claims.length===0||candidate.claims.length>200)return null;
  const occurrences=new Map(source.occurrences.map(x=>[x.id,x]));
  for(const claim of candidate.claims){
   if(!exactKeys(claim,["text","citations"])||typeof claim.text!=="string"||!claim.text.trim()||claim.text.length>20000||!Array.isArray(claim.citations)||claim.citations.length===0)return null;
   for(const citation of claim.citations){if(!exactKeys(citation,["sourceId","occurrenceId","sha256"]))return null;const line=occurrences.get(citation.occurrenceId);if(citation.sourceId!==source.id||!line||citation.sha256!==line.sha256)return null;}
  }
  // Return only the admitted presentation fields, never arbitrary candidate HTML.
  return freeze({id:candidate.id,revision:candidate.revision,kind:candidate.kind,layer,language,source:{...b},review:structuredClone(review),rights:structuredClone(rights),claims:structuredClone(candidate.claims)});
 }catch{return null;}
}
