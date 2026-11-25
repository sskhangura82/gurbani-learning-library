/* Fixture-only development module. No provider fetch, live publication, or media playback. */
export const FIXTURE_SHA256="f9c7b46f2ec39e88569557a81d8a456db7e1099a10448123f9f64bda7a73ffd1";
export const TIMEZONE="Asia/Kolkata";
export const EXAMPLE_DATE="2026-11-25";
const MATCH="DIGITAL_MATCH_DRAFT",HOLD="HOLD_ENCODING_VARIANT";
const ID="sggs.gujri.m1.ang504.shabad04",EDITION="opengranth-34d2a7c";
export function validDate(s){
 if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const d=new Date(s+"T00:00:00Z");
 return Number.isFinite(+d)&&d.toISOString().slice(0,10)===s;
}
export function amritsarDate(instant=new Date()){
 const d=new Date(instant);if(!Number.isFinite(+d))throw Error("Invalid clock");
 const parts=Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone:TIMEZONE,year:"numeric",month:"2-digit",day:"2-digit",calendar:"gregory",numberingSystem:"latn"}).formatToParts(d).map(p=>[p.type,p.value]));
 const result=parts.year.padStart(4,"0")+"-"+parts.month+"-"+parts.day;
 if(!validDate(result))throw Error("Invalid formatted date");return result;
}
const fail=()=>{throw Error("Fixture failed validation");};
function deepFreeze(o){if(o&&typeof o==="object"&&!Object.isFrozen(o)){for(const v of Object.values(o))deepFreeze(v);Object.freeze(o);}return o;}
export function validateFixture(p){
 if(p?.schema!=="glp.hukamnama.fixture.v1"||p?.status!=="DEVELOPMENT_FIXTURE_NOT_RELEASE_APPROVED"||p.policy?.publicationApproved!==false||p.policy?.lessonApproved!==false||p.policy?.recordingPermission!==false||p.policy?.dailyAdapterActive!==false||p.policy?.timezone!==TIMEZONE||p.policy?.ritual!=="morning-mukhwak")fail();
 const c=p.canonical;
 if(c?.id!==ID||c.edition!==EDITION||c.angStart!==504||c.angEnd!==505||c.comparison?.qualifiedHumanApproved!==false||c.comparison?.matches!==19||c.comparison?.total!==19||!Array.isArray(c.occurrences)||c.occurrences.length!==19)fail();
 for(let i=0;i<19;i++){
  const x=c.occurrences[i],kind=i===0?"heading":i===3||i===4?"rahao":"verse",stanza=i===0?null:i<3?1:i<5?"rahao":Math.floor((i-5)/2)+2;
  if(x.id!==ID+".l"+String(i).padStart(2,"0")||x.ang!==(i<4?504:505)||x.kind!==kind||x.stanza!==stanza||typeof x.text!=="string"||!/[\u0a00-\u0a7f]/u.test(x.text)||/[<>@\ufffd\uE000-\uF8FF]/u.test(x.text)||!x.text.endsWith("॥"))fail();
 }
 if(c.occurrences[0].text!=="ਗੂਜਰੀ ਮਹਲਾ ੧ ॥"||!c.occurrences[4].text.endsWith("॥੧॥ ਰਹਾਉ ॥")||!c.occurrences[18].text.endsWith("॥੮॥੪॥"))fail();
 if(!Array.isArray(p.events)||p.events.length!==3)fail();
 const expected=new Map([["2017-11-25",HOLD],["2025-10-14",MATCH],["2026-11-25",MATCH]]);
 for(const e of p.events){
  if(!validDate(e.date)||!expected.has(e.date)||e.status!==expected.get(e.date)||e.id!=="harmandir-morning."+e.date||e.shabadId!==ID||e.edition!==EDITION||!e.sourceUrl?.startsWith("https://sgpc.net/"))fail();
  if(e.status===HOLD&&(e.conflict?.expected!=="ਜਿਨੑ"||e.conflict?.observed!=="ਜਿਨ@"))fail();
  expected.delete(e.date);
 }
 return deepFreeze(p);
}
export async function decodeFixture(raw){
 if(!(raw instanceof ArrayBuffer)||raw.byteLength>65536||!globalThis.crypto?.subtle)throw Error("Fixture integrity unavailable");
 const h=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",raw)),b=>b.toString(16).padStart(2,"0")).join("");
 if(h!==FIXTURE_SHA256)throw Error("Fixture digest mismatch");
 return validateFixture(JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(raw)));
}
export function resolveDate(pack,date,instant=new Date()){
 const amritsar=amritsarDate(instant);
 if(!validDate(date))return {status:"INVALID_DATE",requested:date,amritsar};
 if(date>amritsar)return {status:"FUTURE_DATE",requested:date,amritsar};
 const e=pack.events.find(e=>e.date===date);
 if(!e)return {status:date===amritsar?"TODAY_PENDING_NO_ADAPTER":"DATE_UNAVAILABLE",requested:date,amritsar};
 if(e.status!==MATCH)return {status:"SOURCE_CONFLICT_HOLD",requested:date,amritsar,event:e};
 // Development examples are NEVER approved daily readings, even when the date equals today.
 return {status:"DATED_DEVELOPMENT_EXAMPLE",requested:date,amritsar,event:e,shabad:pack.canonical};
}
export function publishedReading(pack,date,instant){
 // Production publisher absent. Refuse every draft without substitution.
 const r=resolveDate(pack,date,instant);
 return {status:r.status==="DATED_DEVELOPMENT_EXAMPLE"?"REVIEW_PENDING":r.status,requested:r.requested,amritsar:r.amritsar};
}
